const { ATTENDANCE_CONFIG } = require('../../utils/constants');
const DateUtils = require('../../utils/dateUtils');

/**
 * Absence Analysis Service
 * Handles all absence detection and analysis
 */
class AbsenceAnalyzer {
  /**
   * Analyze absences for an employee
   * @param {Object} employee - Employee data
   * @returns {Object} Absence analysis result
   */
  static analyzeAbsences(employee) {
    const absenceDetails = {
      totalAbsentDays: 0,
      absenceRate: 0,
      absentPattern: 'None',
      absentDays: [],
      consecutiveAbsences: [],
      maxConsecutiveDays: 0,
      severityLevel: 'LOW'
    };

    if (!employee.attendanceData) {
      return absenceDetails;
    }

    const workingDays = employee.attendanceData.filter(day => 
      !DateUtils.isWeekend(day.date) && !DateUtils.isHoliday(day.date)
    );

    let consecutiveCount = 0;
    let currentConsecutive = [];

    workingDays.forEach((day, index) => {
      if (this._isDayAbsent(day)) {
        absenceDetails.totalAbsentDays++;
        absenceDetails.absentDays.push({
          date: day.date,
          dayOfWeek: DateUtils.getDayOfWeek(day.date),
          reason: day.reason || 'Not specified'
        });

        // Track consecutive absences
        consecutiveCount++;
        currentConsecutive.push(day.date);
      } else {
        // End of consecutive absence streak
        if (consecutiveCount > 1) {
          absenceDetails.consecutiveAbsences.push({
            startDate: currentConsecutive[0],
            endDate: currentConsecutive[currentConsecutive.length - 1],
            days: consecutiveCount
          });
          absenceDetails.maxConsecutiveDays = Math.max(
            absenceDetails.maxConsecutiveDays, 
            consecutiveCount
          );
        }
        consecutiveCount = 0;
        currentConsecutive = [];
      }
    });

    // Handle case where month ends with consecutive absences
    if (consecutiveCount > 1) {
      absenceDetails.consecutiveAbsences.push({
        startDate: currentConsecutive[0],
        endDate: currentConsecutive[currentConsecutive.length - 1],
        days: consecutiveCount
      });
      absenceDetails.maxConsecutiveDays = Math.max(
        absenceDetails.maxConsecutiveDays, 
        consecutiveCount
      );
    }

    // Calculate derived values
    const totalWorkingDays = workingDays.length;
    if (totalWorkingDays > 0) {
      absenceDetails.absenceRate = Math.round(
        (absenceDetails.totalAbsentDays / totalWorkingDays) * 100
      );
      absenceDetails.absentPattern = this._determineAbsencePattern(absenceDetails, totalWorkingDays);
      absenceDetails.severityLevel = this._determineSeverityLevel(absenceDetails, totalWorkingDays);
    }

    return absenceDetails;
  }

  /**
   * Generate summary statistics for multiple employees
   * @param {Array} employees - Array of employee data
   * @returns {Object} Summary statistics
   */
  static generateSummary(employees) {
    const summary = {
      totalEmployeesWithAbsences: 0,
      totalAbsentDays: 0,
      averageAbsentDaysPerEmployee: 0,
      highestAbsenceRate: 0,
      topAbsentEmployees: [],
      absencePatternDistribution: {},
      severityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      consecutiveAbsenceStats: {
        employeesWithConsecutiveAbsences: 0,
        longestConsecutiveAbsence: 0,
        averageConsecutiveLength: 0
      }
    };

    const employeesWithAbsenceData = [];
    let totalConsecutiveInstances = 0;
    let totalConsecutiveDays = 0;

    employees.forEach(employee => {
      const absenceAnalysis = this.analyzeAbsences(employee);
      
      if (absenceAnalysis.totalAbsentDays > 0) {
        summary.totalEmployeesWithAbsences++;
        summary.totalAbsentDays += absenceAnalysis.totalAbsentDays;
        summary.highestAbsenceRate = Math.max(
          summary.highestAbsenceRate, 
          absenceAnalysis.absenceRate
        );

        // Update pattern distribution
        const pattern = absenceAnalysis.absentPattern;
        summary.absencePatternDistribution[pattern] = 
          (summary.absencePatternDistribution[pattern] || 0) + 1;

        // Update severity distribution
        summary.severityDistribution[absenceAnalysis.severityLevel]++;

        // Track consecutive absences
        if (absenceAnalysis.consecutiveAbsences.length > 0) {
          summary.consecutiveAbsenceStats.employeesWithConsecutiveAbsences++;
          summary.consecutiveAbsenceStats.longestConsecutiveAbsence = Math.max(
            summary.consecutiveAbsenceStats.longestConsecutiveAbsence,
            absenceAnalysis.maxConsecutiveDays
          );
          
          absenceAnalysis.consecutiveAbsences.forEach(consecutive => {
            totalConsecutiveInstances++;
            totalConsecutiveDays += consecutive.days;
          });
        }

        employeesWithAbsenceData.push({
          id: employee.id,
          name: employee.name,
          absentDays: absenceAnalysis.totalAbsentDays,
          absenceRate: absenceAnalysis.absenceRate,
          pattern: absenceAnalysis.absentPattern,
          severity: absenceAnalysis.severityLevel,
          maxConsecutive: absenceAnalysis.maxConsecutiveDays,
          absentDetails: absenceAnalysis
        });
      }
    });

    // Calculate averages
    if (summary.totalEmployeesWithAbsences > 0) {
      summary.averageAbsentDaysPerEmployee = Math.round(
        summary.totalAbsentDays / summary.totalEmployeesWithAbsences
      );
    }

    if (totalConsecutiveInstances > 0) {
      summary.consecutiveAbsenceStats.averageConsecutiveLength = Math.round(
        totalConsecutiveDays / totalConsecutiveInstances
      );
    }

    // Sort and get top absent employees
    summary.topAbsentEmployees = employeesWithAbsenceData
      .sort((a, b) => b.absentDays - a.absentDays || b.absenceRate - a.absenceRate)
      .slice(0, 10);

    return summary;
  }

  /**
   * Check if a day is absent
   * @private
   */
  static _isDayAbsent(day) {
    // Consider absent if no punches and not a weekend/holiday
    return day.status === 'A' || 
           (!day.firstPunch && !day.lastPunch && !DateUtils.isWeekend(day.date));
  }

  /**
   * Determine absence pattern
   * @private
   */
  static _determineAbsencePattern(absenceDetails, totalWorkingDays) {
    const { totalAbsentDays, maxConsecutiveDays, absenceRate } = absenceDetails;
    
    if (absenceRate >= 30) return 'Chronic';
    if (maxConsecutiveDays >= 5) return 'Extended Leave';
    if (absenceRate >= 15) return 'Frequent';
    if (maxConsecutiveDays >= 3) return 'Consecutive';
    if (totalAbsentDays >= 3) return 'Occasional';
    return 'Rare';
  }

  /**
   * Determine severity level
   * @private
   */
  static _determineSeverityLevel(absenceDetails, totalWorkingDays) {
    const { absenceRate, maxConsecutiveDays } = absenceDetails;
    
    if (absenceRate >= 25 || maxConsecutiveDays >= 5) return 'HIGH';
    if (absenceRate >= 10 || maxConsecutiveDays >= 3) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = AbsenceAnalyzer;