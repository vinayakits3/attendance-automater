const { ATTENDANCE_CONFIG } = require('../../utils/constants');
const DateUtils = require('../../utils/dateUtils');

/**
 * Half Day Analysis Service
 * Handles all half day detection and analysis based on duration
 */
class HalfDayAnalyzer {
  /**
   * Analyze half days for an employee
   * @param {Object} employee - Employee data
   * @returns {Object} Half day analysis result
   */
  static analyzeHalfDays(employee) {
    const halfDayDetails = {
      totalHalfDays: 0,
      halfDayRate: 0,
      averageWorkHours: 0,
      halfDayPattern: 'None',
      halfDays: [],
      reasons: {},
      severityLevel: 'LOW'
    };

    if (!employee.attendanceData) {
      return halfDayDetails;
    }

    const workingDays = employee.attendanceData.filter(day => 
      !DateUtils.isWeekend(day.date) && !DateUtils.isHoliday(day.date) && day.status !== 'A'
    );

    let totalWorkHours = 0;
    let validWorkDays = 0;

    workingDays.forEach(day => {
      const dayAnalysis = this._analyzeDayType(day);
      
      if (dayAnalysis.isWorkDay) {
        validWorkDays++;
        totalWorkHours += dayAnalysis.workHours;

        if (dayAnalysis.isHalfDay) {
          halfDayDetails.totalHalfDays++;
          halfDayDetails.halfDays.push({
            date: day.date,
            workHours: dayAnalysis.workHours,
            reason: dayAnalysis.reason,
            timingCategory: dayAnalysis.timingCategory,
            requiredHours: dayAnalysis.requiredHours,
            shortage: dayAnalysis.requiredHours - dayAnalysis.workHours,
            dayOfWeek: DateUtils.getDayOfWeek(day.date)
          });

          // Count reasons
          const reason = dayAnalysis.reason;
          halfDayDetails.reasons[reason] = (halfDayDetails.reasons[reason] || 0) + 1;
        }
      }
    });

    // Calculate derived values
    if (validWorkDays > 0) {
      halfDayDetails.averageWorkHours = Math.round((totalWorkHours / validWorkDays) * 100) / 100;
      halfDayDetails.halfDayRate = Math.round((halfDayDetails.totalHalfDays / validWorkDays) * 100);
      halfDayDetails.halfDayPattern = this._determineHalfDayPattern(halfDayDetails, validWorkDays);
      halfDayDetails.severityLevel = this._determineSeverityLevel(halfDayDetails, validWorkDays);
    }

    return halfDayDetails;
  }

  /**
   * Generate summary statistics for multiple employees
   * @param {Array} employees - Array of employee data
   * @returns {Object} Summary statistics
   */
  static generateSummary(employees) {
    const summary = {
      totalEmployeesWithHalfDays: 0,
      totalHalfDays: 0,
      averageHalfDaysPerEmployee: 0,
      averageWorkHours: 0,
      topHalfDayEmployees: [],
      halfDayReasonDistribution: {},
      severityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      timingCategoryStats: {
        regularTiming: { count: 0, halfDays: 0 },
        unusualTiming: { count: 0, halfDays: 0 }
      }
    };

    const employeesWithHalfDayData = [];
    let totalEmployeesAnalyzed = 0;
    let totalAverageWorkHours = 0;

    employees.forEach(employee => {
      const halfDayAnalysis = this.analyzeHalfDays(employee);
      totalEmployeesAnalyzed++;
      totalAverageWorkHours += halfDayAnalysis.averageWorkHours;
      
      if (halfDayAnalysis.totalHalfDays > 0) {
        summary.totalEmployeesWithHalfDays++;
        summary.totalHalfDays += halfDayAnalysis.totalHalfDays;

        // Update reason distribution
        Object.entries(halfDayAnalysis.reasons).forEach(([reason, count]) => {
          summary.halfDayReasonDistribution[reason] = 
            (summary.halfDayReasonDistribution[reason] || 0) + count;
        });

        // Update severity distribution
        summary.severityDistribution[halfDayAnalysis.severityLevel]++;

        // Update timing category stats
        halfDayAnalysis.halfDays.forEach(halfDay => {
          const category = halfDay.timingCategory === 'Regular' ? 'regularTiming' : 'unusualTiming';
          summary.timingCategoryStats[category].halfDays++;
        });

        employeesWithHalfDayData.push({
          id: employee.id,
          name: employee.name,
          halfDays: halfDayAnalysis.totalHalfDays,
          averageWorkHours: halfDayAnalysis.averageWorkHours,
          halfDayRate: halfDayAnalysis.halfDayRate,
          pattern: halfDayAnalysis.halfDayPattern,
          severity: halfDayAnalysis.severityLevel,
          halfDayDetails: halfDayAnalysis
        });
      }
    });

    // Calculate averages
    if (summary.totalEmployeesWithHalfDays > 0) {
      summary.averageHalfDaysPerEmployee = Math.round(
        summary.totalHalfDays / summary.totalEmployeesWithHalfDays
      );
    }

    if (totalEmployeesAnalyzed > 0) {
      summary.averageWorkHours = Math.round((totalAverageWorkHours / totalEmployeesAnalyzed) * 100) / 100;
    }

    // Sort and get top half day employees
    summary.topHalfDayEmployees = employeesWithHalfDayData
      .sort((a, b) => b.halfDays - a.halfDays || b.halfDayRate - a.halfDayRate)
      .slice(0, 10);

    return summary;
  }

  /**
   * Analyze a single day to determine if it's a half day
   * @private
   */
  static _analyzeDayType(day) {
    const result = {
      isWorkDay: false,
      isHalfDay: false,
      workHours: 0,
      timingCategory: 'Regular',
      requiredHours: ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS,
      reason: 'Unknown'
    };

    // Skip if no punch data
    if (!day.firstPunch || !day.lastPunch) {
      return result;
    }

    result.isWorkDay = true;
    result.workHours = DateUtils.calculateWorkHours(day.firstPunch, day.lastPunch);

    // Determine timing category based on first punch
    const firstPunchTime = DateUtils.parseTime(day.firstPunch);
    const regularStart = DateUtils.parseTime(ATTENDANCE_CONFIG.REGULAR_TIMING_START);
    const regularEnd = DateUtils.parseTime(ATTENDANCE_CONFIG.REGULAR_TIMING_END);

    if (firstPunchTime >= regularStart && firstPunchTime <= regularEnd) {
      result.timingCategory = 'Regular';
      result.requiredHours = ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS;
    } else {
      result.timingCategory = 'Unusual';
      result.requiredHours = ATTENDANCE_CONFIG.UNUSUAL_REQUIRED_HOURS;
    }

    // Determine if it's a half day
    if (result.workHours < result.requiredHours) {
      result.isHalfDay = true;
      result.reason = this._determineHalfDayReason(result.workHours, result.requiredHours);
    }

    return result;
  }

  /**
   * Determine the reason for half day
   * @private
   */
  static _determineHalfDayReason(workHours, requiredHours) {
    const shortage = requiredHours - workHours;
    
    if (shortage >= 4) return 'Major Shortage (4+ hours)';
    if (shortage >= 2) return 'Significant Shortage (2-4 hours)';
    if (shortage >= 1) return 'Moderate Shortage (1-2 hours)';
    return 'Minor Shortage (<1 hour)';
  }

  /**
   * Determine half day pattern
   * @private
   */
  static _determineHalfDayPattern(halfDayDetails, totalWorkingDays) {
    const { totalHalfDays, halfDayRate } = halfDayDetails;
    
    if (halfDayRate >= 50) return 'Chronic';
    if (halfDayRate >= 30) return 'Frequent';
    if (totalHalfDays >= 5) return 'Regular';
    if (totalHalfDays >= 3) return 'Occasional';
    return 'Rare';
  }

  /**
   * Determine severity level
   * @private
   */
  static _determineSeverityLevel(halfDayDetails, totalWorkingDays) {
    const { halfDayRate, totalHalfDays } = halfDayDetails;
    
    if (halfDayRate >= 40 || totalHalfDays >= 8) return 'HIGH';
    if (halfDayRate >= 20 || totalHalfDays >= 4) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = HalfDayAnalyzer;