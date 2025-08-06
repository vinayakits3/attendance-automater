const { ATTENDANCE_CONFIG } = require('../../utils/constants');
const DateUtils = require('../../utils/dateUtils');

/**
 * Late Arrival Analysis Service
 * Handles all late arrival detection and analysis
 */
class LateArrivalAnalyzer {
  /**
   * Analyze late arrivals for an employee
   * @param {Object} employee - Employee data
   * @returns {Object} Late arrival analysis result
   */
  static analyzeLateArrivals(employee) {
    const lateDetails = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      averageLateMinutes: 0,
      latePattern: 'None',
      lateDays: [],
      severityLevel: 'LOW'
    };

    if (!employee.attendanceData) {
      return lateDetails;
    }

    const checkInTime = DateUtils.parseTime(ATTENDANCE_CONFIG.CHECK_IN_TIME);
    
    employee.attendanceData.forEach((day, index) => {
      if (this._isDayLate(day, checkInTime)) {
        const lateMinutes = this._calculateLateMinutes(day, checkInTime);
        
        lateDetails.totalLateDays++;
        lateDetails.totalLateMinutes += lateMinutes;
        lateDetails.lateDays.push({
          date: day.date,
          arrivalTime: day.firstPunch,
          lateMinutes: lateMinutes,
          dayOfWeek: DateUtils.getDayOfWeek(day.date)
        });
      }
    });

    // Calculate derived values
    if (lateDetails.totalLateDays > 0) {
      lateDetails.averageLateMinutes = Math.round(
        lateDetails.totalLateMinutes / lateDetails.totalLateDays
      );
      lateDetails.latePattern = this._determineLatePattern(lateDetails);
      lateDetails.severityLevel = this._determineSeverityLevel(lateDetails);
    }

    return lateDetails;
  }

  /**
   * Generate summary statistics for multiple employees
   * @param {Array} employees - Array of employee data
   * @returns {Object} Summary statistics
   */
  static generateSummary(employees) {
    const summary = {
      totalEmployeesWithLateArrivals: 0,
      totalLateDays: 0,
      totalLateMinutes: 0,
      averageLateMinutesPerEmployee: 0,
      topLateEmployees: [],
      latePatternDistribution: {},
      severityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 }
    };

    const employeesWithLateData = [];

    employees.forEach(employee => {
      const lateAnalysis = this.analyzeLateArrivals(employee);
      
      if (lateAnalysis.totalLateDays > 0) {
        summary.totalEmployeesWithLateArrivals++;
        summary.totalLateDays += lateAnalysis.totalLateDays;
        summary.totalLateMinutes += lateAnalysis.totalLateMinutes;

        // Update pattern distribution
        const pattern = lateAnalysis.latePattern;
        summary.latePatternDistribution[pattern] = 
          (summary.latePatternDistribution[pattern] || 0) + 1;

        // Update severity distribution
        summary.severityDistribution[lateAnalysis.severityLevel]++;

        employeesWithLateData.push({
          id: employee.id,
          name: employee.name,
          lateDays: lateAnalysis.totalLateDays,
          averageLateMinutes: lateAnalysis.averageLateMinutes,
          pattern: lateAnalysis.latePattern,
          severity: lateAnalysis.severityLevel,
          lateArrivalDetails: lateAnalysis
        });
      }
    });

    // Calculate averages
    if (summary.totalEmployeesWithLateArrivals > 0) {
      summary.averageLateMinutesPerEmployee = Math.round(
        summary.totalLateMinutes / summary.totalEmployeesWithLateArrivals
      );
    }

    // Sort and get top late employees
    summary.topLateEmployees = employeesWithLateData
      .sort((a, b) => b.lateDays - a.lateDays || b.averageLateMinutes - a.averageLateMinutes)
      .slice(0, 10);

    return summary;
  }

  /**
   * Check if a day has late arrival
   * @private
   */
  static _isDayLate(day, checkInTime) {
    if (!day.firstPunch || day.status === 'A' || DateUtils.isWeekend(day.date)) {
      return false;
    }

    const arrivalTime = DateUtils.parseTime(day.firstPunch);
    return arrivalTime > checkInTime;
  }

  /**
   * Calculate late minutes for a day
   * @private
   */
  static _calculateLateMinutes(day, checkInTime) {
    const arrivalTime = DateUtils.parseTime(day.firstPunch);
    return Math.max(0, arrivalTime - checkInTime);
  }

  /**
   * Determine late arrival pattern
   * @private
   */
  static _determineLatePattern(lateDetails) {
    const { totalLateDays, averageLateMinutes } = lateDetails;
    
    if (totalLateDays >= 15) return 'Chronic';
    if (totalLateDays >= 8) return 'Frequent';
    if (averageLateMinutes >= 30) return 'Severe';
    if (totalLateDays >= 3) return 'Occasional';
    return 'Rare';
  }

  /**
   * Determine severity level
   * @private
   */
  static _determineSeverityLevel(lateDetails) {
    const { totalLateDays, averageLateMinutes } = lateDetails;
    
    if (totalLateDays >= 10 || averageLateMinutes >= 45) return 'HIGH';
    if (totalLateDays >= 5 || averageLateMinutes >= 20) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = LateArrivalAnalyzer;