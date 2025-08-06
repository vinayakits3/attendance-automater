const { ATTENDANCE_CONFIG } = require('../../utils/constants');
const DateUtils = require('../../utils/dateUtils');

/**
 * Punctuality Analysis Service
 * Handles punctuality ranking and analysis
 */
class PunctualityAnalyzer {
  /**
   * Analyze punctuality for an employee
   * @param {Object} employee - Employee data
   * @returns {Object} Punctuality analysis result
   */
  static analyzePunctuality(employee) {
    const punctualityDetails = {
      punctualityScore: 0,
      punctualDays: 0,
      lateDays: 0,
      workingDays: 0,
      absencePenalty: 0,
      consistencyScore: 0,
      ranking: 'Not Ranked'
    };

    if (!employee.attendanceData) {
      return punctualityDetails;
    }

    const checkInTime = DateUtils.parseTime(ATTENDANCE_CONFIG.CHECK_IN_TIME);
    const workingDays = employee.attendanceData.filter(day => 
      !DateUtils.isWeekend(day.date) && !DateUtils.isHoliday(day.date)
    );

    punctualityDetails.workingDays = workingDays.length;
    let onTimeCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let punctualityScores = [];

    workingDays.forEach(day => {
      if (day.status === 'A' || (!day.firstPunch && !day.lastPunch)) {
        absentCount++;
        punctualityScores.push(0); // Absent = 0 score
      } else if (day.firstPunch) {
        const arrivalTime = DateUtils.parseTime(day.firstPunch);
        
        if (arrivalTime <= checkInTime) {
          onTimeCount++;
          punctualityScores.push(100); // On time = 100 score
        } else {
          lateCount++;
          const lateMinutes = arrivalTime - checkInTime;
          // Deduct points based on how late (max 100 points to lose)
          const dayScore = Math.max(0, 100 - (lateMinutes * 2));
          punctualityScores.push(dayScore);
        }
      } else {
        // Present but no punch data
        punctualityScores.push(50); // Partial score
      }
    });

    punctualityDetails.punctualDays = onTimeCount;
    punctualityDetails.lateDays = lateCount;

    // Calculate overall punctuality score
    if (punctualityScores.length > 0) {
      punctualityDetails.punctualityScore = Math.round(
        punctualityScores.reduce((sum, score) => sum + score, 0) / punctualityScores.length
      );
    }

    // Calculate consistency score (lower standard deviation = higher consistency)
    punctualityDetails.consistencyScore = this._calculateConsistencyScore(punctualityScores);

    // Apply absence penalty
    punctualityDetails.absencePenalty = Math.min(absentCount * 5, 25); // Max 25 point penalty
    punctualityDetails.punctualityScore = Math.max(0, 
      punctualityDetails.punctualityScore - punctualityDetails.absencePenalty
    );

    return punctualityDetails;
  }

  /**
   * Generate punctuality ranking for multiple employees
   * @param {Array} employees - Array of employee data
   * @returns {Array} Ranked employees by punctuality
   */
  static generateRanking(employees) {
    const employeesWithPunctuality = employees.map(employee => {
      const punctualityAnalysis = this.analyzePunctuality(employee);
      
      return {
        id: employee.id,
        name: employee.name,
        department: employee.department,
        punctualityScore: punctualityAnalysis.punctualityScore,
        punctualDays: punctualityAnalysis.punctualDays,
        lateDays: punctualityAnalysis.lateDays,
        workingDays: punctualityAnalysis.workingDays,
        consistencyScore: punctualityAnalysis.consistencyScore,
        absencePenalty: punctualityAnalysis.absencePenalty,
        attendanceDetails: punctualityAnalysis
      };
    });

    // Sort by punctuality score (descending), then by consistency score (descending)
    const rankedEmployees = employeesWithPunctuality
      .sort((a, b) => {
        if (b.punctualityScore !== a.punctualityScore) {
          return b.punctualityScore - a.punctualityScore;
        }
        return b.consistencyScore - a.consistencyScore;
      })
      .map((employee, index) => ({
        ...employee,
        rank: index + 1,
        ranking: this._determineRankingCategory(index + 1, employeesWithPunctuality.length)
      }));

    return rankedEmployees;
  }

  /**
   * Generate punctuality summary statistics
   * @param {Array} employees - Array of employee data
   * @returns {Object} Summary statistics
   */
  static generateSummary(employees) {
    const ranking = this.generateRanking(employees);
    
    const summary = {
      totalEmployees: ranking.length,
      averagePunctualityScore: 0,
      topPerformers: [],
      needsImprovement: [],
      perfectAttendance: [],
      punctualityDistribution: {
        excellent: 0,    // 90-100
        good: 0,         // 75-89
        average: 0,      // 60-74
        needsWork: 0     // 0-59
      },
      consistencyStats: {
        highConsistency: 0,
        mediumConsistency: 0,
        lowConsistency: 0
      }
    };

    let totalScore = 0;

    ranking.forEach(employee => {
      totalScore += employee.punctualityScore;

      // Punctuality distribution
      if (employee.punctualityScore >= 90) {
        summary.punctualityDistribution.excellent++;
      } else if (employee.punctualityScore >= 75) {
        summary.punctualityDistribution.good++;
      } else if (employee.punctualityScore >= 60) {
        summary.punctualityDistribution.average++;
      } else {
        summary.punctualityDistribution.needsWork++;
      }

      // Consistency stats
      if (employee.consistencyScore >= 80) {
        summary.consistencyStats.highConsistency++;
      } else if (employee.consistencyScore >= 60) {
        summary.consistencyStats.mediumConsistency++;
      } else {
        summary.consistencyStats.lowConsistency++;
      }

      // Perfect attendance (no late days or absences)
      if (employee.lateDays === 0 && employee.absencePenalty === 0) {
        summary.perfectAttendance.push(employee);
      }
    });

    // Calculate average
    if (ranking.length > 0) {
      summary.averagePunctualityScore = Math.round(totalScore / ranking.length);
    }

    // Get top and bottom performers
    summary.topPerformers = ranking.slice(0, 5);
    summary.needsImprovement = ranking
      .filter(emp => emp.punctualityScore < 70)
      .slice(-5)
      .reverse(); // Worst performers first

    return {
      ...summary,
      detailedRanking: ranking
    };
  }

  /**
   * Calculate consistency score based on score variance
   * @private
   */
  static _calculateConsistencyScore(scores) {
    if (scores.length <= 1) return 100;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower deviation = higher consistency)
    // Max possible deviation is around 50, so we normalize and invert
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
    
    return Math.round(consistencyScore);
  }

  /**
   * Determine ranking category based on position
   * @private
   */
  static _determineRankingCategory(rank, totalEmployees) {
    const percentile = (rank / totalEmployees) * 100;
    
    if (percentile <= 10) return 'Top Performer';
    if (percentile <= 25) return 'Excellent';
    if (percentile <= 50) return 'Good';
    if (percentile <= 75) return 'Average';
    return 'Needs Improvement';
  }
}

module.exports = PunctualityAnalyzer;