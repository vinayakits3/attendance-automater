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
      commonLatePatterns: {}
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
}

module.exports = AttendanceAnalyzerService;
