const DateUtils = require('../utils/dateUtils');
const CalculationUtils = require('../utils/calculationUtils');

/**
 * Response Builder Service
 * Handles formatting of API responses and data presentation
 */
class ResponseBuilder {
  /**
   * Build successful attendance analysis response
   * @param {Object} analysisData - Analysis results data
   * @returns {Object} Formatted response
   */
  static buildSuccessResponse(analysisData) {
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        summary: this._buildSummary(analysisData),
        issues: this._buildIssues(analysisData.issues || []),
        detailedAnalysis: this._buildDetailedAnalysis(analysisData)
      },
      metadata: this._buildMetadata(analysisData)
    };

    return response;
  }

  /**
   * Build error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   * @returns {Object} Formatted error response
   */
  static buildErrorResponse(message, statusCode = 500, details = {}) {
    return {
      success: false,
      error: {
        message,
        code: statusCode,
        timestamp: new Date().toISOString(),
        details
      }
    };
  }

  /**
   * Build validation error response
   * @param {Array} errors - Array of validation errors
   * @param {Array} warnings - Array of validation warnings
   * @returns {Object} Formatted validation error response
   */
  static buildValidationErrorResponse(errors, warnings = []) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        code: 400,
        timestamp: new Date().toISOString(),
        validation: {
          errors,
          warnings,
          errorCount: errors.length,
          warningCount: warnings.length
        }
      }
    };
  }

  /**
   * Build configuration response
   * @param {Object} config - Configuration data
   * @returns {Object} Formatted configuration response
   */
  static buildConfigResponse(config) {
    return {
      success: true,
      data: {
        systemName: config.SYSTEM_NAME,
        systemDescription: config.SYSTEM_DESCRIPTION,
        department: config.DEPARTMENT_NAME,
        workingHours: {
          checkIn: config.CHECK_IN_TIME,
          checkOut: config.CHECK_OUT_TIME
        },
        policies: {
          departmentFocus: config.DEPARTMENT_FOCUS,
          workingDays: config.WORKING_DAYS,
          weekendPolicy: config.WEEKEND_POLICY
        },
        timing: {
          regularStart: config.REGULAR_TIMING_START,
          regularEnd: config.REGULAR_TIMING_END,
          regularRequiredHours: config.REGULAR_REQUIRED_HOURS,
          unusualRequiredHours: config.UNUSUAL_REQUIRED_HOURS
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Build health check response
   * @param {Object} healthData - Health check data
   * @returns {Object} Formatted health response
   */
  static buildHealthResponse(healthData = {}) {
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      ...healthData
    };
  }

  /**
   * Build summary section
   * @private
   */
  static _buildSummary(analysisData) {
    const employees = analysisData.employees || [];
    const issues = analysisData.issues || [];

    const totalEmployees = employees.length;
    const employeesWithIssues = issues.length;
    const employeesWithoutIssues = totalEmployees - employeesWithIssues;
    const totalIssues = issues.reduce((sum, emp) => sum + (emp.issues?.length || 0), 0);

    // Calculate issue breakdown by severity
    const issueBreakdown = {
      highSeverity: 0,
      mediumSeverity: 0
    };

    issues.forEach(emp => {
      emp.issues?.forEach(issue => {
        if (issue.severity === 'high') {
          issueBreakdown.highSeverity++;
        } else if (issue.severity === 'medium') {
          issueBreakdown.mediumSeverity++;
        }
      });
    });

    // Build employee summaries
    const employeeSummaries = employees.map(emp => {
      const employeeIssues = issues.find(issue => issue.employee.id === emp.id);
      const hasIssues = employeeIssues && employeeIssues.issues.length > 0;

      return {
        id: emp.id,
        name: emp.name,
        present: emp.presentDays || 0,
        absent: emp.absentDays || 0,
        lateCount: emp.lateDays || 0,
        lateMinutesTotal: emp.totalLateMinutes || 0,
        hasIssues
      };
    });

    return {
      totalEmployees,
      employeesWithIssues,
      employeesWithoutIssues,
      totalIssues,
      issueBreakdown,
      employees: employeeSummaries
    };
  }

  /**
   * Build issues section
   * @private
   */
  static _buildIssues(issues) {
    return issues.map(employeeIssue => ({
      employee: {
        id: employeeIssue.employee.id,
        name: employeeIssue.employee.name,
        department: employeeIssue.employee.department
      },
      issues: employeeIssue.issues || [],
      lateArrivalDetails: employeeIssue.lateArrivalDetails,
      absentDetails: employeeIssue.absentDetails,
      halfDayDetails: employeeIssue.halfDayDetails
    }));
  }

  /**
   * Build detailed analysis section
   * @private
   */
  static _buildDetailedAnalysis(analysisData) {
    const analysis = {
      lateArrivalSummary: null,
      absenceSummary: null,
      halfDaySummary: null,
      dailyAttendanceBreakdown: null,
      attendancePatterns: null
    };

    // Build late arrival summary
    if (analysisData.lateArrivalSummary) {
      analysis.lateArrivalSummary = this._formatLateArrivalSummary(analysisData.lateArrivalSummary);
    }

    // Build absence summary
    if (analysisData.absenceSummary) {
      analysis.absenceSummary = this._formatAbsenceSummary(analysisData.absenceSummary);
    }

    // Build half day summary
    if (analysisData.halfDaySummary) {
      analysis.halfDaySummary = this._formatHalfDaySummary(analysisData.halfDaySummary);
    }

    // Build daily breakdown
    if (analysisData.dailyBreakdown) {
      analysis.dailyAttendanceBreakdown = this._formatDailyBreakdown(analysisData.dailyBreakdown);
    }

    // Build attendance patterns
    if (analysisData.punctualityRanking) {
      analysis.attendancePatterns = {
        punctualityRanking: this._formatPunctualityRanking(analysisData.punctualityRanking)
      };
    }

    return analysis;
  }

  /**
   * Format late arrival summary
   * @private
   */
  static _formatLateArrivalSummary(summary) {
    return {
      totalEmployeesWithLateArrivals: summary.totalEmployeesWithLateArrivals || 0,
      totalLateDays: summary.totalLateDays || 0,
      totalLateMinutes: summary.totalLateMinutes || 0,
      averageLateMinutesPerEmployee: summary.averageLateMinutesPerEmployee || 0,
      topLateEmployees: (summary.topLateEmployees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        lateDays: emp.lateDays,
        averageLateMinutes: emp.averageLateMinutes,
        pattern: emp.pattern,
        lateArrivalDetails: emp.lateArrivalDetails
      })),
      latePatternDistribution: summary.latePatternDistribution || {}
    };
  }

  /**
   * Format absence summary
   * @private
   */
  static _formatAbsenceSummary(summary) {
    return {
      totalEmployeesWithAbsences: summary.totalEmployeesWithAbsences || 0,
      totalAbsentDays: summary.totalAbsentDays || 0,
      averageAbsentDaysPerEmployee: summary.averageAbsentDaysPerEmployee || 0,
      topAbsentEmployees: (summary.topAbsentEmployees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        absentDays: emp.absentDays,
        absenceRate: emp.absenceRate,
        pattern: emp.pattern,
        absentDetails: emp.absentDetails
      })),
      absencePatternDistribution: summary.absencePatternDistribution || {}
    };
  }

  /**
   * Format half day summary
   * @private
   */
  static _formatHalfDaySummary(summary) {
    return {
      totalEmployeesWithHalfDays: summary.totalEmployeesWithHalfDays || 0,
      totalHalfDays: summary.totalHalfDays || 0,
      averageWorkHours: summary.averageWorkHours || 0,
      averageHalfDaysPerEmployee: summary.averageHalfDaysPerEmployee || 0,
      topHalfDayEmployees: (summary.topHalfDayEmployees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        halfDays: emp.halfDays,
        averageWorkHours: emp.averageWorkHours,
        pattern: emp.pattern,
        halfDayDetails: emp.halfDayDetails
      })),
      halfDayReasonDistribution: summary.halfDayReasonDistribution || {}
    };
  }

  /**
   * Format daily breakdown
   * @private
   */
  static _formatDailyBreakdown(dailyData) {
    return (dailyData || []).map(day => ({
      day: DateUtils.formatDate(day.date),
      presentEmployees: day.presentEmployees || 0,
      absentEmployees: day.absentEmployees || 0,
      lateEmployees: day.lateEmployees || 0,
      totalLateMinutes: day.totalLateMinutes || 0,
      issues: day.issues || []
    }));
  }

  /**
   * Format punctuality ranking
   * @private
   */
  static _formatPunctualityRanking(ranking) {
    return (ranking || []).slice(0, 15).map((emp, index) => ({
      rank: index + 1,
      id: emp.id,
      name: emp.name,
      punctualityScore: emp.punctualityScore,
      punctualDays: emp.punctualDays,
      lateDays: emp.lateDays,
      workingDays: emp.workingDays,
      ranking: emp.ranking
    }));
  }

  /**
   * Build metadata section
   * @private
   */
  static _buildMetadata(analysisData) {
    return {
      processingDate: new Date().toISOString(),
      systemVersion: '2.0.0',
      analysisType: 'INN_DEPARTMENT_WEEKDAYS_ONLY',
      dataSource: analysisData.filename || 'Fixed File',
      processedEmployees: analysisData.employees?.length || 0,
      performance: {
        processingTimeMs: analysisData.processingTime || 0,
        memoryUsage: process.memoryUsage()
      }
    };
  }

  /**
   * Build file upload success response
   * @param {Object} result - Upload processing result
   * @returns {Object} Formatted upload response
   */
  static buildUploadSuccessResponse(result) {
    return {
      success: true,
      message: 'File processed successfully',
      timestamp: new Date().toISOString(),
      file: {
        originalName: result.originalName,
        size: result.size,
        type: result.type,
        processedEmployees: result.employeeCount
      },
      data: this.buildSuccessResponse(result.analysisData).data
    };
  }

  /**
   * Build simple success response
   * @param {string} message - Success message
   * @param {Object} data - Additional data
   * @returns {Object} Formatted response
   */
  static buildSimpleSuccessResponse(message, data = {}) {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };
  }
}

module.exports = ResponseBuilder;