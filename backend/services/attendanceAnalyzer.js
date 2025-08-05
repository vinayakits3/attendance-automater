const moment = require('moment');
const { ATTENDANCE_CONFIG, ISSUE_TYPES, SEVERITY_LEVELS } = require('../utils/constants');

class AttendanceAnalyzerService {
  /**
   * Analyze attendance data and identify issues
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of employees with issues
   */
  static analyzeAttendance(employees) {
    console.log('Analyzing attendance...');
    const issues = [];
    
    employees.forEach(employee => {
      const employeeIssues = this._analyzeEmployeeAttendance(employee);
      
      if (employeeIssues.issues.length > 0) {
        issues.push({
          employee: {
            id: employee.id,
            name: employee.name,
            department: employee.department
          },
          issues: employeeIssues.issues,
          summary: employeeIssues.summary,
          dailyBreakdown: employeeIssues.dailyBreakdown,
          lateArrivalDetails: employeeIssues.lateArrivalDetails,
          attendancePattern: employeeIssues.attendancePattern
        });
      }
    });
    
    console.log(`Analysis complete. ${issues.length} employees with issues found.`);
    return issues;
  }

  /**
   * Analyze attendance data with enhanced weekend detection
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of employees with issues
   */
  static analyzeAttendanceWithWeekends(employees) {
    console.log('Analyzing attendance with weekend detection...');
    const { UTILS, ATTENDANCE_CONFIG } = require('../utils/constants');
    const issues = [];
    
    employees.forEach(employee => {
      const employeeIssues = this._analyzeEmployeeAttendanceWithWeekends(employee, UTILS);
      
      if (employeeIssues.issues.length > 0 || employeeIssues.lateArrivalDetails.totalLateDays > 0) {
        issues.push({
          employee: {
            id: employee.id,
            name: employee.name,
            department: employee.department
          },
          issues: employeeIssues.issues,
          summary: employeeIssues.summary,
          dailyBreakdown: employeeIssues.dailyBreakdown,
          lateArrivalDetails: employeeIssues.lateArrivalDetails,
          attendancePattern: employeeIssues.attendancePattern
        });
      }
    });
    
    console.log(`Analysis complete. ${issues.length} employees with issues found.`);
    return issues;
  }

  /**
   * Analyze individual employee attendance with weekend logic
   * @private
   */
  static _analyzeEmployeeAttendanceWithWeekends(employee, UTILS) {
    const issues = [];
    const dailyBreakdown = [];
    const lateArrivalDetails = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      lateDays: [],
      pattern: 'Occasional',
      averageLateMinutes: 0
    };
    
    let punctualDays = 0;
    let maxConsecutiveLate = 0;
    let currentConsecutiveLate = 0;
    let workingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    
    if (employee.dailyData && employee.dailyData.length > 0) {
      employee.dailyData.forEach(day => {
        const dayIssues = [];
        let isLate = false;
        let lateMinutes = 0;
        
        // Skip weekends for analysis
        if (day.isWeekend || day.status === 'WO') {
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType,
            status: 'WO',
            issues: [],
            isLate: false,
            lateMinutes: 0
          });
          return;
        }
        
        workingDays++;
        
        if (day.status === 'A') {
          absentDays++;
          dayIssues.push({
            type: ISSUE_TYPES.ABSENT,
            message: 'Employee was absent',
            severity: SEVERITY_LEVELS.HIGH
          });
        } else if (day.status === 'P') {
          presentDays++;
          
          // Check punch-in time (before 10:01)
          if (day.inTime1) {
            if (!UTILS.isValidPunchIn(day.inTime1)) {
              isLate = true;
              lateMinutes = this._calculateLateMinutes(day.inTime1, ATTENDANCE_CONFIG.CHECK_IN_TIME);
              lateArrivalDetails.totalLateDays++;
              lateArrivalDetails.totalLateMinutes += lateMinutes;
              lateArrivalDetails.lateDays.push({
                day: day.day,
                time: day.inTime1,
                lateMinutes: lateMinutes
              });
              
              dayIssues.push({
                type: ISSUE_TYPES.LATE_ARRIVAL,
                message: `Late arrival at ${day.inTime1} (should be before ${ATTENDANCE_CONFIG.CHECK_IN_TIME})`,
                severity: lateMinutes > 30 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM
              });
              
              currentConsecutiveLate++;
              maxConsecutiveLate = Math.max(maxConsecutiveLate, currentConsecutiveLate);
            } else {
              punctualDays++;
              currentConsecutiveLate = 0;
            }
          } else {
            dayIssues.push({
              type: ISSUE_TYPES.MISSING_PUNCH_IN,
              message: 'Missing punch-in time',
              severity: SEVERITY_LEVELS.HIGH
            });
          }
          
          // Check punch-out time (after 18:30)
          let hasValidPunchOut = false;
          let punchOutTime = null;
          
          if (day.outTime2 && UTILS.isValidPunchOut(day.outTime2)) {
            hasValidPunchOut = true;
            punchOutTime = day.outTime2;
          } else if (day.inTime2 && UTILS.isValidPunchOut(day.inTime2)) {
            hasValidPunchOut = true;
            punchOutTime = day.inTime2;
          } else if (day.outTime1 && UTILS.isValidPunchOut(day.outTime1)) {
            hasValidPunchOut = true;
            punchOutTime = day.outTime1;
          }
          
          if (!hasValidPunchOut) {
            if (punchOutTime) {
              dayIssues.push({
                type: ISSUE_TYPES.EARLY_DEPARTURE,
                message: `Early departure at ${punchOutTime} (should be after ${ATTENDANCE_CONFIG.CHECK_OUT_TIME})`,
                severity: SEVERITY_LEVELS.HIGH
              });
            } else {
              dayIssues.push({
                type: ISSUE_TYPES.MISSING_PUNCH_OUT,
                message: 'Missing valid punch-out time',
                severity: SEVERITY_LEVELS.HIGH
              });
            }
          }
        }
        
        issues.push(...dayIssues);
        
        dailyBreakdown.push({
          day: day.day,
          dayType: day.dayType,
          status: day.status,
          issues: dayIssues,
          isLate: isLate,
          lateMinutes: lateMinutes
        });
      });
    }
    
    // Calculate late arrival patterns
    if (lateArrivalDetails.totalLateDays > 0) {
      lateArrivalDetails.averageLateMinutes = Math.round(
        lateArrivalDetails.totalLateMinutes / lateArrivalDetails.totalLateDays
      );
      
      if (lateArrivalDetails.totalLateDays >= 10) {
        lateArrivalDetails.pattern = 'Chronic';
      } else if (lateArrivalDetails.totalLateDays >= 5) {
        lateArrivalDetails.pattern = 'Frequent';
      } else {
        lateArrivalDetails.pattern = 'Occasional';
      }
    }
    
    return {
      issues: issues,
      summary: {
        workingDays: workingDays,
        presentDays: presentDays,
        absentDays: absentDays,
        lateArrivals: lateArrivalDetails.totalLateDays
      },
      dailyBreakdown: dailyBreakdown,
      lateArrivalDetails: lateArrivalDetails,
      attendancePattern: {
        punctualDays: punctualDays,
        maxConsecutiveLate: maxConsecutiveLate
      }
    };
  }

  /**
   * Calculate late minutes
   * @private
   */
  static _calculateLateMinutes(actualTime, expectedTime) {
    const [actualHours, actualMinutes] = actualTime.split(':').map(Number);
    const [expectedHours, expectedMinutes] = expectedTime.split(':').map(Number);
    
    const actualTotalMinutes = actualHours * 60 + actualMinutes;
    const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
    
    return Math.max(0, actualTotalMinutes - expectedTotalMinutes);
  }

  /**
   * Analyze attendance data with enhanced weekend detection
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of employees with issues
   */
  static analyzeAttendanceWithWeekends(employees) {
    console.log('Analyzing attendance with weekend detection...');
    const { UTILS, ATTENDANCE_CONFIG } = require('../utils/constants');
    const issues = [];
    
    employees.forEach(employee => {
      const employeeIssues = this._analyzeEmployeeAttendanceWithWeekends(employee, UTILS);
      
      if (employeeIssues.issues.length > 0) {
        issues.push({
          employee: {
            id: employee.id,
            name: employee.name,
            department: employee.department
          },
          issues: employeeIssues.issues,
          summary: employeeIssues.summary,
          dailyBreakdown: employeeIssues.dailyBreakdown,
          lateArrivalDetails: employeeIssues.lateArrivalDetails,
          attendancePattern: employeeIssues.attendancePattern
        });
      }
    });
    
    console.log(`Weekend-aware analysis complete. ${issues.length} employees with issues found.`);
    return issues;
  }

  /**
   * Analyze individual employee attendance with weekend awareness
   * @private
   */
  static _analyzeEmployeeAttendanceWithWeekends(employee, UTILS) {
    const employeeIssues = [];
    const monthlyIssues = {
      totalAbsent: 0,
      totalMissingPunchIn: 0,
      totalMissingPunchOut: 0,
      totalLateArrivals: 0,
      totalEarlyDepartures: 0,
      totalIncompleteShifts: 0,
      workingDays: 0,
      weekendDays: 0,
      daysWithIssues: []
    };
    
    const lateArrivalDetails = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      lateDays: [],
      averageLateMinutes: 0,
      maxLateMinutes: 0,
      pattern: 'No Pattern'
    };
    
    const dailyBreakdown = [];
    const attendancePattern = {
      consecutiveLate: 0,
      maxConsecutiveLate: 0,
      lateFrequencyByWeek: {},
      punctualDays: 0
    };
    
    let consecutiveLateCount = 0;
    
    employee.dailyData.forEach((dayData, index) => {
      // Enhanced weekend detection
      const isWeekend = UTILS.isWeekend(dayData.day, ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR);
      
      // Update day status if it's a weekend
      if (isWeekend) {
        dayData.status = 'WO';
        dayData.dayType = UTILS.getDayName(dayData.day, ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR);
        monthlyIssues.weekendDays++;
      }
      
      const dayIssues = this._analyzeDayAttendanceEnhanced(dayData, UTILS);
      
      // Track daily breakdown with weekend info
      const dayBreakdown = {
        day: dayData.day,
        dayType: dayData.dayType,
        status: dayData.status,
        isWeekend: isWeekend,
        issues: dayIssues,
        inTime1: dayData.inTime1,
        outTime2: dayData.outTime2 || dayData.outTime1,
        isLate: false,
        lateMinutes: 0,
        isValidPunchIn: dayData.inTime1 ? UTILS.isValidPunchIn(dayData.inTime1) : null,
        isValidPunchOut: (dayData.outTime2 || dayData.outTime1) ? UTILS.isValidPunchOut(dayData.outTime2 || dayData.outTime1) : null
      };
      
      // Update monthly counters
      this._updateMonthlySummaryEnhanced(monthlyIssues, dayData, dayIssues, isWeekend);
      
      // Track late arrivals in detail with enhanced validation
      const lateIssue = dayIssues.find(issue => issue.type === ISSUE_TYPES.LATE_ARRIVAL);
      if (lateIssue) {
        const lateMinutes = this._extractLateMinutes(lateIssue.message);
        lateArrivalDetails.totalLateDays++;
        lateArrivalDetails.totalLateMinutes += lateMinutes;
        lateArrivalDetails.lateDays.push({
          day: dayData.day,
          dayType: dayData.dayType,
          lateMinutes: lateMinutes,
          arrivalTime: dayData.inTime1,
          isWeekend: isWeekend
        });
        
        if (lateMinutes > lateArrivalDetails.maxLateMinutes) {
          lateArrivalDetails.maxLateMinutes = lateMinutes;
        }
        
        dayBreakdown.isLate = true;
        dayBreakdown.lateMinutes = lateMinutes;
        
        consecutiveLateCount++;
        attendancePattern.consecutiveLate = consecutiveLateCount;
        if (consecutiveLateCount > attendancePattern.maxConsecutiveLate) {
          attendancePattern.maxConsecutiveLate = consecutiveLateCount;
        }
      } else {
        consecutiveLateCount = 0;
        if (!isWeekend && dayData.status !== 'A') {
          attendancePattern.punctualDays++;
        }
      }
      
      dailyBreakdown.push(dayBreakdown);
      
      if (dayIssues.length > 0) {
        monthlyIssues.daysWithIssues.push({
          day: dayData.day,
          dayType: dayData.dayType,
          isWeekend: isWeekend,
          issues: dayIssues
        });
        employeeIssues.push(...dayIssues);
      }
    });
    
    // Calculate late arrival statistics
    if (lateArrivalDetails.totalLateDays > 0) {
      lateArrivalDetails.averageLateMinutes = Math.round(
        lateArrivalDetails.totalLateMinutes / lateArrivalDetails.totalLateDays
      );
      lateArrivalDetails.pattern = this._determineLatePatternEnhanced(lateArrivalDetails.lateDays);
    }
    
    return {
      issues: employeeIssues,
      summary: monthlyIssues,
      dailyBreakdown: dailyBreakdown,
      lateArrivalDetails: lateArrivalDetails,
      attendancePattern: attendancePattern
    };
  }

  /**
   * Enhanced day attendance analysis with business rules
   * @private
   */
  static _analyzeDayAttendanceEnhanced(dayData, UTILS) {
    const dayIssues = [];
    
    // Skip weekends and holidays - enhanced check
    if (dayData.status === 'WO' || dayData.status === 'H') {
      return dayIssues;
    }
    
    // Check for absence
    if (dayData.status === 'A') {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.ABSENT,
        `Absent on day ${dayData.day} (${dayData.dayType})`,
        SEVERITY_LEVELS.HIGH
      ));
      return dayIssues;
    }
    
    // Enhanced punch validation with business rules
    this._checkPunchInIssuesEnhanced(dayData, dayIssues, UTILS);
    this._checkPunchOutIssuesEnhanced(dayData, dayIssues, UTILS);
    this._checkLunchPunchIssues(dayData, dayIssues);
    this._checkIncompleteShift(dayData, dayIssues);
    
    return dayIssues;
  }

  /**
   * Enhanced punch-in validation with business rules
   * @private
   */
  static _checkPunchInIssuesEnhanced(dayData, dayIssues, UTILS) {
    if (!dayData.inTime1) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_PUNCH_IN,
        `Missing punch in on day ${dayData.day} (${dayData.dayType})`,
        SEVERITY_LEVELS.HIGH
      ));
      return;
    }
    
    // Enhanced late arrival check using business rules (10:01)
    const moment = require('moment');
    const inTime = moment(dayData.inTime1, ['HH:mm', 'H:mm', 'HH:mm:ss']);
    const expectedTime = moment(ATTENDANCE_CONFIG.CHECK_IN_TIME, 'HH:mm');
    
    if (inTime.isValid() && inTime.isAfter(expectedTime)) {
      const lateMinutes = inTime.diff(expectedTime, 'minutes');
      const severity = lateMinutes > ATTENDANCE_CONFIG.SEVERITY_THRESHOLD_MINUTES ? 
                      SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
      
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.LATE_ARRIVAL,
        `Late arrival by ${lateMinutes} minutes on day ${dayData.day} (${dayData.dayType}) - arrived at ${dayData.inTime1}, expected by ${ATTENDANCE_CONFIG.CHECK_IN_TIME}`,
        severity
      ));
    }
    
    // Validate using business rule helper
    if (!UTILS.isValidPunchIn(dayData.inTime1)) {
      const additionalInfo = `Punch-in time ${dayData.inTime1} is after ${ATTENDANCE_CONFIG.CHECK_IN_TIME} threshold`;
      console.log(`Business rule validation: ${additionalInfo}`);
    }
  }

  /**
   * Enhanced punch-out validation with business rules  
   * @private
   */
  static _checkPunchOutIssuesEnhanced(dayData, dayIssues, UTILS) {
    const lastOutTime = dayData.outTime2 || dayData.outTime1;
    
    if (!lastOutTime) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_PUNCH_OUT,
        `Missing punch out on day ${dayData.day} (${dayData.dayType})`,
        SEVERITY_LEVELS.HIGH
      ));
      return;
    }
    
    // Enhanced early departure check using business rules (18:30)
    const moment = require('moment');
    const outTime = moment(lastOutTime, ['HH:mm', 'H:mm', 'HH:mm:ss']);
    const expectedTime = moment(ATTENDANCE_CONFIG.CHECK_OUT_TIME, 'HH:mm');
    
    if (outTime.isValid() && outTime.isBefore(expectedTime)) {
      const earlyMinutes = expectedTime.diff(outTime, 'minutes');
      const severity = earlyMinutes > ATTENDANCE_CONFIG.SEVERITY_THRESHOLD_MINUTES ? 
                      SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
      
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.EARLY_DEPARTURE,
        `Early departure by ${earlyMinutes} minutes on day ${dayData.day} (${dayData.dayType}) - left at ${lastOutTime}, expected after ${ATTENDANCE_CONFIG.CHECK_OUT_TIME}`,
        severity
      ));
    }
    
    // Validate using business rule helper
    if (!UTILS.isValidPunchOut(lastOutTime)) {
      const additionalInfo = `Punch-out time ${lastOutTime} is before ${ATTENDANCE_CONFIG.CHECK_OUT_TIME} threshold`;
      console.log(`Business rule validation: ${additionalInfo}`);
    }
  }

  /**
   * Enhanced monthly summary with weekend tracking
   * @private
   */
  static _updateMonthlySummaryEnhanced(monthlyIssues, dayData, dayIssues, isWeekend) {
    // Count working days (excluding weekends and holidays)
    if (!isWeekend && dayData.status !== 'H') {
      monthlyIssues.workingDays++;
    }
    
    dayIssues.forEach(issue => {
      switch (issue.type) {
        case ISSUE_TYPES.ABSENT:
          if (!isWeekend) monthlyIssues.totalAbsent++;
          break;
        case ISSUE_TYPES.MISSING_PUNCH_IN:
          monthlyIssues.totalMissingPunchIn++;
          break;
        case ISSUE_TYPES.MISSING_PUNCH_OUT:
          monthlyIssues.totalMissingPunchOut++;
          break;
        case ISSUE_TYPES.LATE_ARRIVAL:
          monthlyIssues.totalLateArrivals++;
          break;
        case ISSUE_TYPES.EARLY_DEPARTURE:
          monthlyIssues.totalEarlyDepartures++;
          break;
        case ISSUE_TYPES.INCOMPLETE_SHIFT:
          monthlyIssues.totalIncompleteShifts++;
          break;
      }
    });
  }

  /**
   * Enhanced late pattern determination with weekend awareness
   * @private
   */
  static _determineLatePatternEnhanced(lateDays) {
    if (lateDays.length <= 2) return 'Occasional';
    if (lateDays.length >= 10) return 'Frequent';
    
    // Check for consecutive days (excluding weekends)
    const workdayLateDays = lateDays.filter(day => !day.isWeekend);
    const consecutiveDays = workdayLateDays.some((day, index) => {
      if (index < workdayLateDays.length - 2) {
        return (day.day + 1 === workdayLateDays[index + 1].day) && 
               (day.day + 2 === workdayLateDays[index + 2].day);
      }
      return false;
    });
    
    if (consecutiveDays) return 'Consecutive';
    
    // Check for specific day patterns
    const dayFrequency = {};
    workdayLateDays.forEach(day => {
      const dayOfWeek = day.dayType;
      dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
    });
    
    const maxFreqDay = Object.entries(dayFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (maxFreqDay && maxFreqDay[1] >= workdayLateDays.length * 0.6) {
      return `Mostly ${maxFreqDay[0]}s`;
    }
    
    return 'Random';
  }

  /**
   * Generate comprehensive summary for employees and issues
   * @param {Array} employees - Array of employee data
   * @param {Array} issues - Array of issues
   * @returns {Object} Summary object
   */
  static generateSummary(employees, issues, department = 'General') {
    const totalEmployees = employees.length;
    const employeesWithIssues = issues.length;
    const employeesWithoutIssues = totalEmployees - employeesWithIssues;
    
    // Calculate detailed statistics
    const detailedStats = this._calculateDetailedStatistics(employees, issues);
    
    const summary = {
      department: department,
      totalEmployees: totalEmployees,
      employeesWithIssues: employeesWithIssues,
      employeesWithoutIssues: employeesWithoutIssues,
      totalIssues: issues.reduce((sum, emp) => sum + emp.issues.length, 0),
      issueBreakdown: this._calculateIssueBreakdown(issues),
      detailedStats: detailedStats,
      topIssues: this._getTopIssues(issues),
      employees: employees.map(emp => {
        const empIssues = issues.find(issue => issue.employee.id === emp.id);
        return {
          id: emp.id,
          name: emp.name,
          present: emp.summary.present,
          absent: emp.summary.absent,
          hasIssues: !!empIssues,
          lateCount: empIssues ? empIssues.lateArrivalDetails.totalLateDays : 0,
          lateMinutesTotal: empIssues ? empIssues.lateArrivalDetails.totalLateMinutes : 0
        };
      })
    };
    
    return summary;
  }

  /**
   * Calculate detailed statistics
   * @private
   */
  static _calculateDetailedStatistics(employees, issues) {
    const stats = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      averageLateMinutesPerDay: 0,
      employeesWithLateArrivals: 0,
      mostLateEmployee: null,
      commonLatePatterns: {},
      totalAbsentDays: 0,
      employeesWithAbsences: 0,
      mostAbsentEmployee: null,
      commonAbsencePatterns: {}
    };
    
    let totalLateInstances = 0;
    let maxLateMinutes = 0;
    
    issues.forEach(empIssue => {
      if (empIssue.lateArrivalDetails.totalLateDays > 0) {
        stats.employeesWithLateArrivals++;
        stats.totalLateDays += empIssue.lateArrivalDetails.totalLateDays;
        stats.totalLateMinutes += empIssue.lateArrivalDetails.totalLateMinutes;
        totalLateInstances += empIssue.lateArrivalDetails.totalLateDays;
        
        if (empIssue.lateArrivalDetails.totalLateMinutes > maxLateMinutes) {
          maxLateMinutes = empIssue.lateArrivalDetails.totalLateMinutes;
          stats.mostLateEmployee = {
            name: empIssue.employee.name,
            id: empIssue.employee.id,
            lateDays: empIssue.lateArrivalDetails.totalLateDays,
            totalLateMinutes: empIssue.lateArrivalDetails.totalLateMinutes
          };
        }
        
        // Track late patterns by day of week
        empIssue.lateArrivalDetails.lateDays.forEach(lateDay => {
          const pattern = `Day${lateDay.day}`;
          stats.commonLatePatterns[pattern] = (stats.commonLatePatterns[pattern] || 0) + 1;
        });
      }
      
      // Track absence statistics
      if (empIssue.absentDetails && empIssue.absentDetails.totalAbsentDays > 0) {
        stats.employeesWithAbsences++;
        stats.totalAbsentDays += empIssue.absentDetails.totalAbsentDays;
        
        if (empIssue.absentDetails.totalAbsentDays > (stats.mostAbsentEmployee?.absentDays || 0)) {
          stats.mostAbsentEmployee = {
            name: empIssue.employee.name,
            id: empIssue.employee.id,
            absentDays: empIssue.absentDetails.totalAbsentDays,
            pattern: empIssue.absentDetails.absentPattern
          };
        }
        
        // Track absence patterns by day of week
        empIssue.absentDetails.absentDays.forEach(absentDay => {
          const pattern = `Day${absentDay.day}`;
          stats.commonAbsencePatterns[pattern] = (stats.commonAbsencePatterns[pattern] || 0) + 1;
        });
      }
    });
    
    if (totalLateInstances > 0) {
      stats.averageLateMinutesPerDay = Math.round(stats.totalLateMinutes / totalLateInstances);
    }
    
    return stats;
  }

  /**
   * Get top issues by frequency
   * @private
   */
  static _getTopIssues(issues) {
    const issueFrequency = {};
    
    issues.forEach(empIssue => {
      empIssue.issues.forEach(issue => {
        issueFrequency[issue.type] = (issueFrequency[issue.type] || 0) + 1;
      });
    });
    
    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Analyze individual employee attendance with detailed tracking
   * @private
   */
  static _analyzeEmployeeAttendance(employee) {
    const employeeIssues = [];
    const monthlyIssues = {
      totalAbsent: 0,
      totalMissingPunchIn: 0,
      totalMissingPunchOut: 0,
      totalLateArrivals: 0,
      totalEarlyDepartures: 0,
      totalIncompleteShifts: 0,
      workingDays: 0,
      daysWithIssues: []
    };
    
    const lateArrivalDetails = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      lateDays: [],
      averageLateMinutes: 0,
      maxLateMinutes: 0,
      pattern: 'No Pattern'
    };
    
    const dailyBreakdown = [];
    const attendancePattern = {
      consecutiveLate: 0,
      maxConsecutiveLate: 0,
      lateFrequencyByWeek: {},
      punctualDays: 0
    };
    
    let consecutiveLateCount = 0;
    
    employee.dailyData.forEach((dayData, index) => {
      const dayIssues = this._analyzeDayAttendance(dayData);
      
      // Track daily breakdown
      const dayBreakdown = {
        day: dayData.day,
        dayType: dayData.dayType,
        status: dayData.status,
        issues: dayIssues,
        inTime1: dayData.inTime1,
        outTime2: dayData.outTime2 || dayData.outTime1,
        isLate: false,
        lateMinutes: 0
      };
      
      // Update monthly counters
      this._updateMonthlySummary(monthlyIssues, dayData, dayIssues);
      
      // Track late arrivals in detail
      const lateIssue = dayIssues.find(issue => issue.type === ISSUE_TYPES.LATE_ARRIVAL);
      if (lateIssue) {
        const lateMinutes = this._extractLateMinutes(lateIssue.message);
        lateArrivalDetails.totalLateDays++;
        lateArrivalDetails.totalLateMinutes += lateMinutes;
        lateArrivalDetails.lateDays.push({
          day: dayData.day,
          lateMinutes: lateMinutes,
          arrivalTime: dayData.inTime1,
          dayType: dayData.dayType
        });
        
        if (lateMinutes > lateArrivalDetails.maxLateMinutes) {
          lateArrivalDetails.maxLateMinutes = lateMinutes;
        }
        
        dayBreakdown.isLate = true;
        dayBreakdown.lateMinutes = lateMinutes;
        
        consecutiveLateCount++;
        attendancePattern.consecutiveLate = consecutiveLateCount;
        if (consecutiveLateCount > attendancePattern.maxConsecutiveLate) {
          attendancePattern.maxConsecutiveLate = consecutiveLateCount;
        }
      } else {
        consecutiveLateCount = 0;
        if (dayData.status !== 'A' && dayData.status !== 'WO' && dayData.status !== 'H') {
          attendancePattern.punctualDays++;
        }
      }
      
      dailyBreakdown.push(dayBreakdown);
      
      if (dayIssues.length > 0) {
        monthlyIssues.daysWithIssues.push({
          day: dayData.day,
          issues: dayIssues
        });
        employeeIssues.push(...dayIssues);
      }
    });
    
    // Calculate late arrival statistics
    if (lateArrivalDetails.totalLateDays > 0) {
      lateArrivalDetails.averageLateMinutes = Math.round(
        lateArrivalDetails.totalLateMinutes / lateArrivalDetails.totalLateDays
      );
      lateArrivalDetails.pattern = this._determineLatePattern(lateArrivalDetails.lateDays);
    }
    
    return {
      issues: employeeIssues,
      summary: monthlyIssues,
      dailyBreakdown: dailyBreakdown,
      lateArrivalDetails: lateArrivalDetails,
      attendancePattern: attendancePattern
    };
  }

  /**
   * Extract late minutes from issue message
   * @private
   */
  static _extractLateMinutes(message) {
    const match = message.match(/Late arrival by (\d+) minutes/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Determine late arrival pattern
   * @private
   */
  static _determineLatePattern(lateDays) {
    if (lateDays.length <= 2) return 'Occasional';
    if (lateDays.length >= 10) return 'Frequent';
    
    // Check for consecutive days
    const consecutiveDays = lateDays.some((day, index) => {
      if (index < lateDays.length - 2) {
        return (day.day + 1 === lateDays[index + 1].day) && 
               (day.day + 2 === lateDays[index + 2].day);
      }
      return false;
    });
    
    if (consecutiveDays) return 'Consecutive';
    
    // Check for specific day patterns
    const dayFrequency = {};
    lateDays.forEach(day => {
      const dayOfWeek = day.dayType;
      dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
    });
    
    const maxFreqDay = Object.entries(dayFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (maxFreqDay && maxFreqDay[1] >= lateDays.length * 0.6) {
      return `Mostly ${maxFreqDay[0]}s`;
    }
    
    return 'Random';
  }

  /**
   * Analyze single day attendance
   * @private
   */
  static _analyzeDayAttendance(dayData) {
    const dayIssues = [];
    
    // Skip weekends and holidays
    if (dayData.status === 'WO' || dayData.status === 'H') {
      return dayIssues;
    }
    
    // Check for absence
    if (dayData.status === 'A') {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.ABSENT,
        `Absent on day ${dayData.day}`,
        SEVERITY_LEVELS.HIGH
      ));
      return dayIssues;
    }
    
    // Analyze punch data for present days
    this._checkPunchInIssues(dayData, dayIssues);
    this._checkPunchOutIssues(dayData, dayIssues);
    this._checkLunchPunchIssues(dayData, dayIssues);
    this._checkIncompleteShift(dayData, dayIssues);
    
    return dayIssues;
  }

  /**
   * Check punch-in related issues
   * @private
   */
  static _checkPunchInIssues(dayData, dayIssues) {
    if (!dayData.inTime1) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_PUNCH_IN,
        `Missing punch in on day ${dayData.day}`,
        SEVERITY_LEVELS.HIGH
      ));
      return;
    }
    
    // Check for late arrival
    const inTime = moment(dayData.inTime1, ['HH:mm', 'H:mm', 'HH:mm:ss']);
    const expectedTime = moment(ATTENDANCE_CONFIG.CHECK_IN_TIME, 'HH:mm');
    
    if (inTime.isValid() && inTime.isAfter(expectedTime)) {
      const lateMinutes = inTime.diff(expectedTime, 'minutes');
      const severity = lateMinutes > ATTENDANCE_CONFIG.SEVERITY_THRESHOLD_MINUTES ? 
                      SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
      
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.LATE_ARRIVAL,
        `Late arrival by ${lateMinutes} minutes on day ${dayData.day} (arrived at ${dayData.inTime1})`,
        severity
      ));
    }
  }

  /**
   * Check punch-out related issues
   * @private
   */
  static _checkPunchOutIssues(dayData, dayIssues) {
    const lastOutTime = dayData.outTime2 || dayData.outTime1;
    
    if (!lastOutTime) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_PUNCH_OUT,
        `Missing punch out on day ${dayData.day}`,
        SEVERITY_LEVELS.HIGH
      ));
      return;
    }
    
    // Check for early departure
    const outTime = moment(lastOutTime, ['HH:mm', 'H:mm', 'HH:mm:ss']);
    const expectedTime = moment(ATTENDANCE_CONFIG.CHECK_OUT_TIME, 'HH:mm');
    
    if (outTime.isValid() && outTime.isBefore(expectedTime)) {
      const earlyMinutes = expectedTime.diff(outTime, 'minutes');
      const severity = earlyMinutes > ATTENDANCE_CONFIG.SEVERITY_THRESHOLD_MINUTES ? 
                      SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
      
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.EARLY_DEPARTURE,
        `Early departure by ${earlyMinutes} minutes on day ${dayData.day} (left at ${lastOutTime})`,
        severity
      ));
    }
  }

  /**
   * Check lunch punch issues
   * @private
   */
  static _checkLunchPunchIssues(dayData, dayIssues) {
    if (!dayData.outTime1 && dayData.inTime1) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_LUNCH_OUT,
        `Missing lunch break punch out on day ${dayData.day}`,
        SEVERITY_LEVELS.MEDIUM
      ));
    }
    
    if (!dayData.inTime2 && dayData.outTime2) {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.MISSING_LUNCH_IN,
        `Missing lunch break punch in on day ${dayData.day}`,
        SEVERITY_LEVELS.MEDIUM
      ));
    }
  }

  /**
   * Check for incomplete shift
   * @private
   */
  static _checkIncompleteShift(dayData, dayIssues) {
    const punchesCount = [dayData.inTime1, dayData.outTime1, dayData.inTime2, dayData.outTime2]
      .filter(punch => punch && punch !== '').length;
    
    if (punchesCount > 0 && punchesCount < 4 && dayData.status !== 'A') {
      dayIssues.push(this._createIssue(
        ISSUE_TYPES.INCOMPLETE_SHIFT,
        `Incomplete shift on day ${dayData.day} (${punchesCount}/4 punches recorded)`,
        SEVERITY_LEVELS.MEDIUM
      ));
    }
  }

  /**
   * Create issue object
   * @private
   */
  static _createIssue(type, message, severity) {
    return {
      type: type,
      message: message,
      severity: severity
    };
  }

  /**
   * Update monthly summary counters
   * @private
   */
  static _updateMonthlySummary(monthlyIssues, dayData, dayIssues) {
    // Skip weekends and holidays for working days count
    if (dayData.status !== 'WO' && dayData.status !== 'H') {
      monthlyIssues.workingDays++;
    }
    
    dayIssues.forEach(issue => {
      switch (issue.type) {
        case ISSUE_TYPES.ABSENT:
          monthlyIssues.totalAbsent++;
          break;
        case ISSUE_TYPES.MISSING_PUNCH_IN:
          monthlyIssues.totalMissingPunchIn++;
          break;
        case ISSUE_TYPES.MISSING_PUNCH_OUT:
          monthlyIssues.totalMissingPunchOut++;
          break;
        case ISSUE_TYPES.LATE_ARRIVAL:
          monthlyIssues.totalLateArrivals++;
          break;
        case ISSUE_TYPES.EARLY_DEPARTURE:
          monthlyIssues.totalEarlyDepartures++;
          break;
        case ISSUE_TYPES.INCOMPLETE_SHIFT:
          monthlyIssues.totalIncompleteShifts++;
          break;
      }
    });
  }

  /**
   * Calculate issue breakdown by severity
   * @private
   */
  static _calculateIssueBreakdown(issues) {
    const breakdown = {
      highSeverity: 0,
      mediumSeverity: 0
    };
    
    issues.forEach(empIssues => {
      empIssues.issues.forEach(issue => {
        if (issue.severity === SEVERITY_LEVELS.HIGH) {
          breakdown.highSeverity++;
        } else {
          breakdown.mediumSeverity++;
        }
      });
    });
    
    return breakdown;
  }

  /**
   * Analyze attendance data for WEEKDAYS ONLY (Monday-Friday)
   * UPDATED: Uses Excel day abbreviations to determine weekdays vs weekends
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of employees with issues
   */
  static analyzeAttendanceWeekdaysOnly(employees) {
    console.log('🔍 Analyzing attendance for WEEKDAYS ONLY (Monday-Friday)...');
    const issues = [];
    
    employees.forEach(employee => {
      const employeeIssues = this._analyzeEmployeeAttendanceWeekdaysOnly(employee);
      
      // Include all employees in results, even those without issues, for comprehensive reporting
      issues.push({
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department
        },
        issues: employeeIssues.issues,
        summary: employeeIssues.summary,
        dailyBreakdown: employeeIssues.dailyBreakdown,
        lateArrivalDetails: employeeIssues.lateArrivalDetails,
        absentDetails: employeeIssues.absentDetails,
        attendancePattern: employeeIssues.attendancePattern,
        weekdayAnalysis: employeeIssues.weekdayAnalysis
      });
    });
    
    const employeesWithIssues = issues.filter(emp => emp.issues.length > 0).length;
    console.log(`✅ Weekday analysis complete. ${employeesWithIssues}/${employees.length} employees have issues (weekdays only).`);
    return issues;
  }

  /**
   * NEW: Analyze attendance using duration-based logic with Regular/Unusual timing rules
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of employees with detailed duration-based analysis
   */
  static analyzeAttendanceDurationBased(employees) {
    console.log('🔍 Analyzing attendance with NEW duration-based logic (Regular vs Unusual timing)...');
    const { UTILS } = require('../utils/constants');
    const issues = [];
    
    employees.forEach(employee => {
      const employeeIssues = this._analyzeEmployeeDurationBased(employee, UTILS);
      
      // Include all employees in results for comprehensive reporting
      issues.push({
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department
        },
        issues: employeeIssues.issues,
        summary: employeeIssues.summary,
        dailyBreakdown: employeeIssues.dailyBreakdown,
        durationAnalysis: employeeIssues.durationAnalysis,
        timingPatterns: employeeIssues.timingPatterns,
        attendancePattern: employeeIssues.attendancePattern
      });
    });
    
    const employeesWithIssues = issues.filter(emp => emp.issues.length > 0).length;
    console.log(`✅ Duration-based analysis complete. ${employeesWithIssues}/${employees.length} employees have issues.`);
    return issues;
  }

  /**
   * NEW: Analyze individual employee with duration-based logic
   * @private
   */
  static _analyzeEmployeeDurationBased(employee, UTILS) {
    const issues = [];
    const dailyBreakdown = [];
    
    const durationAnalysis = {
      totalWorkDays: 0,
      fullDays: 0,
      halfDays: 0,
      absentDays: 0,
      regularTimingDays: 0,
      unusualTimingDays: 0,
      averageWorkDuration: 0,
      totalWorkDuration: 0,
      halfDayDetails: []
    };
    
    const timingPatterns = {
      regularTimingPattern: 'Unknown',
      unusualTimingPattern: 'Unknown',
      preferredArrivalTime: null,
      consistencyScore: 0
    };
    
    let workingDays = 0;
    let weekendDays = 0;
    
    console.log(`   👤 DURATION-BASED ANALYSIS: ${employee.name} (${employee.id})`);
    
    if (employee.dailyData && employee.dailyData.length > 0) {
      employee.dailyData.forEach(day => {
        const dayIssues = [];
        
        // Handle weekends: exclude from analysis
        if (day.isWeekend || day.status === 'WO' || day.dayAbbr === 'St' || day.dayAbbr === 'S') {
          weekendDays++;
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Weekend → Excluded`);
          
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            status: 'WO',
            timingCategory: null,
            workDuration: 0,
            dayType: 'Weekend',
            issues: [],
            note: 'Weekend - excluded from analysis'
          });
          return;
        }
        
        // Handle holidays
        if (day.status === 'H') {
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Holiday → Excluded`);
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            status: 'H',
            timingCategory: null,
            workDuration: 0,
            dayType: 'Holiday',
            issues: [],
            note: 'Holiday - excluded from analysis'
          });
          return;
        }
        
        // Process workdays with NEW duration-based logic
        workingDays++;
        durationAnalysis.totalWorkDays++;
        
        // Collect punch times
        const dayPunchTimes = [day.inTime1, day.outTime1, day.inTime2, day.outTime2]
          .filter(time => time && time.trim() !== '')
          .map(time => time.trim());
        
        // Parse and validate punch times
        const validPunchTimes = [];
        dayPunchTimes.forEach(timeStr => {
          const parsedTimes = UTILS.parseAllTimesFromCell(timeStr);
          validPunchTimes.push(...parsedTimes);
        });
        
        const uniquePunchTimes = [...new Set(validPunchTimes)]
          .filter(time => UTILS.isValidTimeFormat(time))
          .sort();
        
        // Use NEW duration-based attendance calculation
        const attendanceResult = UTILS.calculatePunchBasedStatus(uniquePunchTimes, false);
        
        console.log(`      📅 Day ${day.day} (${day.dayAbbr}): ${attendanceResult.status}`);
        
        if (attendanceResult.isPresent) {
          const { timingCategory, workDuration, requiredHours, isFullDay, dayType } = attendanceResult;
          
          console.log(`         ⏰ ${timingCategory} timing: ${workDuration.toFixed(2)}h (required: ${requiredHours}h) → ${dayType}`);
          
          // Track timing patterns
          if (timingCategory === 'REGULAR') {
            durationAnalysis.regularTimingDays++;
          } else {
            durationAnalysis.unusualTimingDays++;
          }
          
          // Track work duration
          durationAnalysis.totalWorkDuration += workDuration;
          
          if (isFullDay) {
            durationAnalysis.fullDays++;
          } else {
            durationAnalysis.halfDays++;
            durationAnalysis.halfDayDetails.push({
              day: day.day,
              dayType: day.dayType || day.dayAbbr,
              timingCategory: timingCategory,
              workDuration: workDuration,
              requiredHours: requiredHours,
              shortfall: requiredHours - workDuration,
              firstPunch: attendanceResult.firstPunch,
              lastPunch: attendanceResult.lastPunch
            });
            
            // Add half-day issue
            dayIssues.push({
              type: 'HALF_DAY',
              message: `Half Day - ${timingCategory} timing: worked ${workDuration.toFixed(2)}h, required ${requiredHours}h`,
              severity: SEVERITY_LEVELS.MEDIUM
            });
          }
          
          // Check for late arrival (optional - could be removed since duration is main focus)
          if (UTILS.isTimeAfter(attendanceResult.firstPunch, '10:01')) {
            const lateMinutes = UTILS.calculateLateMinutesPunchBased(attendanceResult.firstPunch, '10:01');
            dayIssues.push({
              type: ISSUE_TYPES.LATE_ARRIVAL,
              message: `Late arrival at ${attendanceResult.firstPunch} (${lateMinutes} min late)`,
              severity: lateMinutes > 30 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM
            });
          }
          
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            status: attendanceResult.status,
            timingCategory: timingCategory,
            workDuration: workDuration,
            requiredHours: requiredHours,
            dayType: dayType,
            firstPunch: attendanceResult.firstPunch,
            lastPunch: attendanceResult.lastPunch,
            totalPunches: attendanceResult.totalPunches,
            issues: dayIssues,
            note: attendanceResult.note
          });
          
        } else {
          // Absent day
          durationAnalysis.absentDays++;
          
          dayIssues.push({
            type: ISSUE_TYPES.ABSENT,
            message: attendanceResult.note,
            severity: SEVERITY_LEVELS.HIGH
          });
          
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            status: attendanceResult.status,
            timingCategory: null,
            workDuration: 0,
            dayType: 'Absent',
            issues: dayIssues,
            note: attendanceResult.note
          });
          
          console.log(`         ❌ ${attendanceResult.note}`);
        }
        
        // Add day issues to main issues list
        issues.push(...dayIssues);
      });
    }
    
    // Calculate average work duration
    if (durationAnalysis.fullDays + durationAnalysis.halfDays > 0) {
      durationAnalysis.averageWorkDuration = 
        durationAnalysis.totalWorkDuration / (durationAnalysis.fullDays + durationAnalysis.halfDays);
    }
    
    // Determine timing patterns
    if (durationAnalysis.regularTimingDays > durationAnalysis.unusualTimingDays) {
      timingPatterns.regularTimingPattern = 'Preferred';
      timingPatterns.unusualTimingPattern = 'Occasional';
    } else if (durationAnalysis.unusualTimingDays > durationAnalysis.regularTimingDays) {
      timingPatterns.regularTimingPattern = 'Occasional';
      timingPatterns.unusualTimingPattern = 'Preferred';
    } else {
      timingPatterns.regularTimingPattern = 'Mixed';
      timingPatterns.unusualTimingPattern = 'Mixed';
    }
    
    // Calculate consistency score
    const presentDays = durationAnalysis.fullDays + durationAnalysis.halfDays;
    if (presentDays > 0) {
      const fullDayRate = durationAnalysis.fullDays / presentDays;
      timingPatterns.consistencyScore = Math.round(fullDayRate * 100);
    }
    
    const summary = {
      workingDays: workingDays,
      presentDays: presentDays,
      absentDays: durationAnalysis.absentDays,
      fullDays: durationAnalysis.fullDays,
      halfDays: durationAnalysis.halfDays,
      weekendDays: weekendDays,
      attendanceRate: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0,
      fullDayRate: presentDays > 0 ? Math.round((durationAnalysis.fullDays / presentDays) * 100) : 0,
      averageWorkHours: durationAnalysis.averageWorkDuration
    };
    
    const attendancePattern = {
      timingPreference: durationAnalysis.regularTimingDays > durationAnalysis.unusualTimingDays ? 'Regular' : 'Unusual',
      workDurationConsistency: timingPatterns.consistencyScore >= 80 ? 'High' : 
                              timingPatterns.consistencyScore >= 60 ? 'Medium' : 'Low'
    };
    
    console.log(`      📊 ${employee.name}: ${durationAnalysis.fullDays}F/${durationAnalysis.halfDays}H/${durationAnalysis.absentDays}A (${workingDays} days)`);
    console.log(`         Average: ${durationAnalysis.averageWorkDuration.toFixed(2)}h/day, Consistency: ${timingPatterns.consistencyScore}%`);
    
    return {
      issues,
      summary,
      dailyBreakdown,
      durationAnalysis,
      timingPatterns,
      attendancePattern
    };
  }

  /**
   * Calculate work duration in minutes between two times
   * @private
   */
  static _calculateWorkMinutes(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    
    // Handle case where end time is next day (unlikely but possible)
    if (endMinutes < startMinutes) {
      return (24 * 60) + endMinutes - startMinutes;
    }
    
    return endMinutes - startMinutes;
  }

  /**
   * Calculate work duration in minutes (alias for compatibility)
   * @private
   */
  static _calculateWorkDuration(startTime, endTime) {
    return this._calculateWorkMinutes(startTime, endTime);
  }

  /**
   * Analyze individual employee attendance for WEEKDAYS ONLY
   * @private
   */
  static _analyzeEmployeeAttendanceWeekdaysOnly(employee) {
    const issues = [];
    const dailyBreakdown = [];
    const lateArrivalDetails = {
      totalLateDays: 0,
      totalLateMinutes: 0,
      lateDays: [],
      pattern: 'Occasional',
      averageLateMinutes: 0
    };
    
    const absentDetails = {
      totalAbsentDays: 0,
      absentDays: [],
      absentPattern: 'Occasional',
      consecutiveAbsences: 0
    };
    
    const halfDayDetails = {
      totalHalfDays: 0,
      halfDays: [],
      halfDayPattern: 'Occasional',
      averageWorkHours: 0,
      totalWorkMinutes: 0,
      reasons: {
        shortDuration: 0,
        earlyArrivalShortWork: 0
      }
    };
    
    let punctualDays = 0;
    let maxConsecutiveLate = 0;
    let currentConsecutiveLate = 0;
    let workingDays = 0; // Only weekdays count as working days
    let presentDays = 0;
    let absentDays = 0;
    let weekendDays = 0;
    
    console.log(`   👤 PUNCH-BASED ANALYSIS: ${employee.name} (${employee.id}) - Weekdays only...`);
    
    if (employee.dailyData && employee.dailyData.length > 0) {
      employee.dailyData.forEach(day => {
        const dayIssues = [];
        let isLate = false;
        let lateMinutes = 0;
        
        // Handle weekends: exclude from analysis completely
        if (day.isWeekend || day.status === 'WO' || day.dayAbbr === 'St' || day.dayAbbr === 'S') {
          weekendDays++;
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Weekend → Excluded from analysis`);
          
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            dayAbbr: day.dayAbbr,
            status: 'WO',
            issues: [],
            isLate: false,
            lateMinutes: 0,
            note: 'Weekend - excluded from attendance calculation'
          });
          return; // Skip weekend processing
        }
        
        // Handle holidays
        if (day.status === 'H') {
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Holiday → Excluded from analysis`);
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            dayAbbr: day.dayAbbr,
            status: 'H',
            issues: [],
            isLate: false,
            lateMinutes: 0,
            note: 'Holiday - excluded from attendance calculation'
          });
          return; // Skip holiday processing
        }
        
        // Process weekdays only (Monday-Friday) with NEW PUNCH-BASED LOGIC
        workingDays++;
        console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Weekday → Processing with punch-based logic`);
        
        // Check for explicit absence status first
        if (day.status === 'A') {
          absentDays++;
          absentDetails.totalAbsentDays++;
          absentDetails.absentDays.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            reason: 'Marked as absent (A)'
          });
          
          dayIssues.push({
            type: ISSUE_TYPES.ABSENT,
            message: `Employee was absent - marked as 'A'`,
            severity: SEVERITY_LEVELS.HIGH
          });
          console.log(`         ❌ Absent (status: A)`);
          
          // Add to daily breakdown and continue to next day
          issues.push(...dayIssues);
          dailyBreakdown.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            dayAbbr: day.dayAbbr,
            status: day.status,
            issues: dayIssues,
            isLate: false,
            lateMinutes: 0,
            punchTimes: [],
            note: 'Weekday - marked as absent'
          });
          return; // Skip punch analysis for explicit absences
        }
        
        // Collect all punch times for this day
        const dayPunchTimes = [day.inTime1, day.outTime1, day.inTime2, day.outTime2]
          .filter(time => time && time.trim() !== '')
          .map(time => time.trim());
        
        console.log(`         🕐 Punch times: [${dayPunchTimes.join(', ')}]`);
        
        // NEW PUNCH-BASED ATTENDANCE DETERMINATION
        if (dayPunchTimes.length === 0) {
          // NO PUNCH TIMES = ABSENT
          absentDays++;
          
          // Track absent day details
          absentDetails.totalAbsentDays++;
          absentDetails.absentDays.push({
            day: day.day,
            dayType: day.dayType || day.dayAbbr,
            reason: 'No punch times recorded'
          });
          
          dayIssues.push({
            type: ISSUE_TYPES.ABSENT,
            message: `Employee was absent - no punch times recorded`,
            severity: SEVERITY_LEVELS.HIGH
          });
          console.log(`         ❌ Absent (no punch times)`);
        } else {
          // HAS PUNCH TIMES = PRESENT
          presentDays++;
          console.log(`         ✅ Present (${dayPunchTimes.length} punch times)`);
          
          // Parse and clean punch times
          const { UTILS } = require('../utils/constants');
          const validPunchTimes = [];
          dayPunchTimes.forEach(timeStr => {
            const parsedTimes = UTILS.parseAllTimesFromCell(timeStr);
            validPunchTimes.push(...parsedTimes);
          });
          
          const uniquePunchTimes = [...new Set(validPunchTimes)]
            .filter(time => UTILS.isValidTimeFormat(time))
            .sort();
          
          if (uniquePunchTimes.length > 0) {
            const firstPunch = uniquePunchTimes[0]; // MIN time
            const lastPunch = uniquePunchTimes[uniquePunchTimes.length - 1]; // MAX time
            
            console.log(`         📊 Valid punches: ${firstPunch} to ${lastPunch}`);
            
            // Check late arrival (MIN time > 10:01)
            if (UTILS.isTimeAfter(firstPunch, ATTENDANCE_CONFIG.CHECK_IN_TIME)) {
              isLate = true;
              lateMinutes = UTILS.calculateLateMinutesPunchBased(firstPunch, ATTENDANCE_CONFIG.CHECK_IN_TIME);
              lateArrivalDetails.totalLateDays++;
              lateArrivalDetails.totalLateMinutes += lateMinutes;
              lateArrivalDetails.lateDays.push({
                day: day.day,
                dayType: day.dayType,
                time: firstPunch,
                lateMinutes: lateMinutes
              });
              
              dayIssues.push({
                type: ISSUE_TYPES.LATE_ARRIVAL,
                message: `Late arrival at ${firstPunch} (should be before ${ATTENDANCE_CONFIG.CHECK_IN_TIME})`,
                severity: lateMinutes > 30 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM
              });
              
              currentConsecutiveLate++;
              maxConsecutiveLate = Math.max(maxConsecutiveLate, currentConsecutiveLate);
              console.log(`         ⏰ Late by ${lateMinutes} minutes`);
            } else {
              punctualDays++;
              currentConsecutiveLate = 0;
              console.log(`         ⏰ On time`);
            }
            
            // Check early departure (MAX time < 18:15)
            if (UTILS.isTimeBefore(lastPunch, ATTENDANCE_CONFIG.CHECK_OUT_TIME)) {
              const earlyMinutes = UTILS.calculateLateMinutesPunchBased(ATTENDANCE_CONFIG.CHECK_OUT_TIME, lastPunch);
              dayIssues.push({
                type: ISSUE_TYPES.EARLY_DEPARTURE,
                message: `Early departure at ${lastPunch} (should stay until ${ATTENDANCE_CONFIG.CHECK_OUT_TIME})`,
                severity: earlyMinutes > 30 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM
              });
              console.log(`         ❌ Early departure (left at ${lastPunch})`);
            } else {
              console.log(`         ✅ Full day (stayed until ${lastPunch})`);
            }
            
            // NEW: Calculate work hours and check for half day
            const workMinutes = this._calculateWorkMinutes(firstPunch, lastPunch);
            halfDayDetails.totalWorkMinutes += workMinutes;
            
            // Determine required hours based on arrival time
            let requiredMinutes;
            let isUnusualTiming = false;
            
            // Check if arrival is before 9:30 AM or after 10:01 AM
            if (UTILS.isTimeBefore(firstPunch, '09:30') || UTILS.isTimeAfter(firstPunch, '10:01')) {
              requiredMinutes = 9 * 60; // 9 hours for unusual timing
              isUnusualTiming = true;
              console.log(`         🕘 Unusual timing arrival (${firstPunch}) - requires 9 hours`);
            } else {
              requiredMinutes = 4.5 * 60; // 4.5 hours for regular timing
              console.log(`         ⏰ Regular timing arrival (${firstPunch}) - requires 4.5 hours`);
            }
            
            // Check if it's a half day
            if (workMinutes < requiredMinutes) {
              halfDayDetails.totalHalfDays++;
              
              let reason;
              if (isUnusualTiming) {
                reason = `Unusual timing arrival - worked ${Math.round(workMinutes/60*10)/10}h, required 9h`;
              } else {
                reason = `Insufficient hours - worked ${Math.round(workMinutes/60*10)/10}h, required 4.5h`;
              }
              
              halfDayDetails.halfDays.push({
                day: day.day,
                dayType: day.dayType || day.dayAbbr,
                arrivalTime: firstPunch,
                departureTime: lastPunch,
                workMinutes: workMinutes,
                requiredMinutes: requiredMinutes,
                reason: reason,
                isUnusualTiming: isUnusualTiming
              });
              
              dayIssues.push({
                type: 'HALF_DAY',
                message: `Half day - ${reason}`,
                severity: SEVERITY_LEVELS.MEDIUM
              });
              
              console.log(`         🕐 Half day detected: ${reason}`);
            } else {
              console.log(`         ✅ Full day: worked ${Math.round(workMinutes/60*10)/10}h`);
            }
            
            // Duration-based logic is already handled above by UTILS.calculatePunchBasedStatus()
            // No additional half-day calculation needed here
          } else {
            // Has punch data but no valid times
            dayIssues.push({
              type: ISSUE_TYPES.MISSING_PUNCH_IN,
              message: 'Invalid punch time formats',
              severity: SEVERITY_LEVELS.HIGH
            });
            console.log(`         ❌ Invalid punch time formats`);
          }
        }
        
        // Add all issues to the main issues array
        issues.push(...dayIssues);
        
        dailyBreakdown.push({
          day: day.day,
          dayType: day.dayType || day.dayAbbr,
          dayAbbr: day.dayAbbr,
          status: day.status,
          issues: dayIssues,
          isLate: isLate,
          lateMinutes: lateMinutes,
          punchTimes: dayPunchTimes,
          note: 'Weekday - included in punch-based attendance calculation'
        });
      });
    }
    
    // Calculate late arrival patterns
    if (lateArrivalDetails.totalLateDays > 0) {
      lateArrivalDetails.averageLateMinutes = Math.round(lateArrivalDetails.totalLateMinutes / lateArrivalDetails.totalLateDays);
      
      if (lateArrivalDetails.totalLateDays >= workingDays * 0.5) {
        lateArrivalDetails.pattern = 'Chronic';
      } else if (lateArrivalDetails.totalLateDays >= workingDays * 0.3) {
        lateArrivalDetails.pattern = 'Frequent';
      } else {
        lateArrivalDetails.pattern = 'Occasional';
      }
    }
    
    // Calculate absence patterns
    if (absentDetails.totalAbsentDays > 0) {
      if (absentDetails.totalAbsentDays >= workingDays * 0.4) {
        absentDetails.absentPattern = 'Chronic';
      } else if (absentDetails.totalAbsentDays >= workingDays * 0.2) {
        absentDetails.absentPattern = 'Frequent';
      } else {
        absentDetails.absentPattern = 'Occasional';
      }
      
      // Calculate consecutive absences
      let maxConsecutive = 0;
      let currentConsecutive = 0;
      
      for (let i = 0; i < absentDetails.absentDays.length; i++) {
        if (i > 0 && absentDetails.absentDays[i].day === absentDetails.absentDays[i-1].day + 1) {
          currentConsecutive++;
        } else {
          currentConsecutive = 1;
        }
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      }
      
      absentDetails.consecutiveAbsences = maxConsecutive;
    }
    
    // Calculate half-day patterns
    if (halfDayDetails.totalHalfDays > 0) {
      const totalWorkHours = halfDayDetails.halfDays.reduce((sum, hd) => sum + hd.workHours, 0);
      halfDayDetails.averageWorkHours = Math.round((totalWorkHours / halfDayDetails.totalHalfDays) * 100) / 100;
      
      if (halfDayDetails.totalHalfDays >= workingDays * 0.3) {
        halfDayDetails.halfDayPattern = 'Frequent';
      } else if (halfDayDetails.totalHalfDays >= workingDays * 0.15) {
        halfDayDetails.halfDayPattern = 'Occasional';
      } else {
        halfDayDetails.halfDayPattern = 'Rare';
      }
    }
    
    const summary = {
      workingDays: workingDays, // Only weekdays
      presentDays: presentDays,
      absentDays: absentDays,
      weekendDays: weekendDays,
      attendanceRate: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0,
      punctualityRate: presentDays > 0 ? Math.round((punctualDays / presentDays) * 100) : 0
    };
    
    const attendancePattern = {
      punctualDays: punctualDays,
      maxConsecutiveLate: maxConsecutiveLate,
      attendanceConsistency: this._calculateAttendanceConsistency(dailyBreakdown.filter(d => d.status !== 'WO' && d.status !== 'H'))
    };
    
    const weekdayAnalysis = {
      totalWeekdays: workingDays,
      weekendsExcluded: weekendDays,
      calculationBasis: 'Monday to Friday only with punch-based logic',
      punchBasedLogic: 'Present = at least 1 punch, Absent = no punches, Late = MIN time > 10:01, Full day = MAX time > 18:15',
      note: `Punch-based analysis: ${presentDays}P/${absentDays}A of ${workingDays} weekdays. ${weekendDays} weekend days excluded.`
    };
    
    console.log(`      📊 ${employee.name}: ${presentDays}P/${absentDays}A of ${workingDays} weekdays (${weekendDays} weekends excluded) - PUNCH-BASED`);
    
    return {
      issues,
      summary,
      dailyBreakdown,
      lateArrivalDetails,
      absentDetails,
      halfDayDetails,
      attendancePattern,
      weekdayAnalysis
    };
  }

  /**
   * Check if employee has valid punch-out time
   * @private
   */
  /**
   * Calculate attendance consistency metric
   * @private
   * @param {Array} dailyBreakdown - Array of daily attendance data (weekdays only)
   * @returns {Object} - Consistency metrics
   */
  static _calculateAttendanceConsistency(dailyBreakdown) {
    if (!dailyBreakdown || dailyBreakdown.length === 0) {
      return {
        score: 0,
        level: 'No Data',
        description: 'No attendance data available for analysis'
      };
    }

    const workingDays = dailyBreakdown.filter(day => 
      day.status !== 'WO' && day.status !== 'H'
    );

    if (workingDays.length === 0) {
      return {
        score: 0,
        level: 'No Working Days',
        description: 'No working days found for consistency analysis'
      };
    }

    let presentDays = 0;
    let punctualDays = 0;
    let totalDays = workingDays.length;

    workingDays.forEach(day => {
      if (day.status === 'P') {
        presentDays++;
        if (!day.isLate) {
          punctualDays++;
        }
      }
    });

    // Calculate attendance rate and punctuality rate
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) : 0;
    const punctualityRate = presentDays > 0 ? (punctualDays / presentDays) : 0;

    // Combined consistency score (weighted: 60% attendance, 40% punctuality)
    const consistencyScore = Math.round((attendanceRate * 0.6 + punctualityRate * 0.4) * 100);

    // Determine consistency level
    let level, description;
    if (consistencyScore >= 95) {
      level = 'Excellent';
      description = 'Highly consistent attendance and punctuality';
    } else if (consistencyScore >= 85) {
      level = 'Good';
      description = 'Generally consistent with minor issues';
    } else if (consistencyScore >= 70) {
      level = 'Fair';
      description = 'Moderate consistency with some concerns';
    } else if (consistencyScore >= 50) {
      level = 'Poor';
      description = 'Inconsistent attendance pattern';
    } else {
      level = 'Critical';
      description = 'Significant attendance and punctuality issues';
    }

    return {
      score: consistencyScore,
      level: level,
      description: description,
      metrics: {
        totalWorkingDays: totalDays,
        presentDays: presentDays,
        punctualDays: punctualDays,
        attendanceRate: Math.round(attendanceRate * 100),
        punctualityRate: Math.round(punctualityRate * 100)
      }
    };
  }

  /**
   * Generate comprehensive absence summary for detailed analysis
   * @param {Array} issues - Array of employee issues
   * @returns {Object} Absence summary object
   */
  static generateAbsenceSummary(issues) {
    const absenceSummary = {
      totalEmployeesWithAbsences: 0,
      totalAbsentDays: 0,
      averageAbsentDaysPerEmployee: 0,
      topAbsentEmployees: [],
      absencePatternDistribution: {}
    };

    const employeesWithAbsences = [];

    issues.forEach(empIssue => {
      if (empIssue.absentDetails && empIssue.absentDetails.totalAbsentDays > 0) {
        absenceSummary.totalEmployeesWithAbsences++;
        absenceSummary.totalAbsentDays += empIssue.absentDetails.totalAbsentDays;

        employeesWithAbsences.push({
          name: empIssue.employee.name,
          id: empIssue.employee.id,
          absentDays: empIssue.absentDetails.totalAbsentDays,
          absenceRate: Math.round((empIssue.absentDetails.totalAbsentDays / 22) * 100), // Assuming 22 working days
          pattern: empIssue.absentDetails.absentPattern,
          absentDetails: empIssue.absentDetails
        });

        // Track pattern distribution
        const pattern = empIssue.absentDetails.absentPattern;
        absenceSummary.absencePatternDistribution[pattern] = 
          (absenceSummary.absencePatternDistribution[pattern] || 0) + 1;
      }
    });

    // Calculate average
    if (absenceSummary.totalEmployeesWithAbsences > 0) {
      absenceSummary.averageAbsentDaysPerEmployee = 
        Math.round(absenceSummary.totalAbsentDays / absenceSummary.totalEmployeesWithAbsences);
    }

    // Sort employees by absent days and get top 10
    absenceSummary.topAbsentEmployees = employeesWithAbsences
      .sort((a, b) => b.absentDays - a.absentDays)
      .slice(0, 10);

    return absenceSummary;
  }

  static _hasValidPunchOut(day) {
    const { UTILS } = require('../utils/constants');
    
    // Check any of the out times for validity
    if (day.outTime2 && UTILS.isValidPunchOut(day.outTime2)) return true;
    if (day.inTime2 && UTILS.isValidPunchOut(day.inTime2)) return true;
    if (day.outTime1 && UTILS.isValidPunchOut(day.outTime1)) return true;
    
    return false;
  }
}

module.exports = AttendanceAnalyzerService;
