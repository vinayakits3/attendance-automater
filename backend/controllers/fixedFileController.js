const XLSX = require('xlsx');
const fs = require('fs');
const ExcelParserService = require('../services/excelParser');
const AttendanceAnalyzerService = require('../services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG, UTILS } = require('../utils/constants');

class FixedFileController {
  /**
   * Process the fixed Excel file - INN Department Only
   */
  static async processFixedFile(req, res) {
    try {
      const filePath = ATTENDANCE_CONFIG.EXCEL_FILE_PATH;
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false,
          error: `Excel file not found at: ${filePath}. Please ensure the file exists at this location.` 
        });
      }
      
      console.log(`📂 Processing INN Department attendance from: ${filePath}`);
    console.log(`⚖️  Using backend status calculation (InTime/OutTime logic, ignoring Excel status column)`);
      const workbook = XLSX.readFile(filePath);
      
      // Parse the fixed file format - INN Department Only
      const employees = ExcelParserService.parseFixedFormatFile(workbook);
      
      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No INN Department employees found in the Excel file. Please check if the file contains INN department data.'
        });
      }
      
      // Analyze attendance issues - WEEKDAYS ONLY (Monday-Friday)
      const issues = AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly ? 
        AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly(employees) :
        AttendanceAnalyzerService.analyzeAttendance(employees);
      
      // Generate comprehensive summary
      const summary = AttendanceAnalyzerService.generateSummary(employees, issues);
      
      // Enhanced response with detailed attendance tracking
      res.json({
        success: true,
        data: {
          employees: employees,
          issues: issues,
          summary: summary,
          detailedAnalysis: {
            lateArrivalSummary: FixedFileController._generateLateArrivalSummary(issues),
            dailyAttendanceBreakdown: FixedFileController._generateDailyBreakdown(issues),
            attendancePatterns: FixedFileController._generateAttendancePatterns(issues),
            weekendAnalysis: FixedFileController._generateWeekendAnalysis(employees)
          }
        },
        metadata: {
          filePath: filePath,
          department: 'INN',
          format: 'WorkDurationReportFourPunch (INN Department Only)',
          employeeCount: employees.length,
          issueCount: issues.length,
          employeesWithLateArrivals: issues.filter(emp => emp.lateArrivalDetails && emp.lateArrivalDetails.totalLateDays > 0).length,
          totalLateDays: issues.reduce((sum, emp) => sum + (emp.lateArrivalDetails ? emp.lateArrivalDetails.totalLateDays : 0), 0),
          reportMonth: `${ATTENDANCE_CONFIG.REPORT_MONTH}/${ATTENDANCE_CONFIG.REPORT_YEAR}`,
          processTime: new Date().toISOString()
        },
        message: `Successfully processed ${employees.length} INN Department employees`
      });
      
    } catch (error) {
      console.error('❌ Error processing INN Department file:', error);
      
      res.status(500).json({ 
        success: false,
        error: 'Error processing INN Department file: ' + error.message 
      });
    }
  }

  /**
   * Generate weekend analysis
   * @private
   */
  static _generateWeekendAnalysis(employees) {
    const weekendDays = [];
    const month = ATTENDANCE_CONFIG.REPORT_MONTH;
    const year = ATTENDANCE_CONFIG.REPORT_YEAR;
    
    // Get all weekends for the month
    for (let day = 1; day <= 31; day++) { 
      if (UTILS.isWeekend(day, month, year)) {
        weekendDays.push({
          day: day,
          dayName: UTILS.getDayName(day, month, year),
          isWeekend: true
        });
      }
    }
    
    return {
      month: `${month}/${year}`, 
      totalWeekendDays: weekendDays.length,
      weekendDates: weekendDays,
      workingDays: 31 - weekendDays.length,
      note: 'Weekends are automatically excluded from attendance analysis'
    };
  }

  /**
   * Generate late arrival summary
   * @private
   */
  static _generateLateArrivalSummary(issues) {
    const lateEmployees = issues.filter(emp => emp.lateArrivalDetails && emp.lateArrivalDetails.totalLateDays > 0);
    
    const summary = {
      totalEmployeesWithLateArrivals: lateEmployees.length,
      totalLateDays: lateEmployees.reduce((sum, emp) => sum + emp.lateArrivalDetails.totalLateDays, 0),
      totalLateMinutes: lateEmployees.reduce((sum, emp) => sum + emp.lateArrivalDetails.totalLateMinutes, 0),
      topLateEmployees: lateEmployees
        .sort((a, b) => b.lateArrivalDetails.totalLateDays - a.lateArrivalDetails.totalLateDays)
        .slice(0, 5)
        .map(emp => ({
          name: emp.employee.name,
          id: emp.employee.id,
          lateDays: emp.lateArrivalDetails.totalLateDays,
          totalLateMinutes: emp.lateArrivalDetails.totalLateMinutes,
          averageLateMinutes: emp.lateArrivalDetails.averageLateMinutes,
          pattern: emp.lateArrivalDetails.pattern
        })),
      latePatternDistribution: FixedFileController._calculateLatePatternDistribution(lateEmployees),
      businessRules: {
        lateThreshold: ATTENDANCE_CONFIG.CHECK_IN_TIME,
        earlyDepartureThreshold: ATTENDANCE_CONFIG.CHECK_OUT_TIME,
        note: `Employees arriving after ${ATTENDANCE_CONFIG.CHECK_IN_TIME} are marked late`
      }
    };
    
    return summary;
  }

  /**
   * Calculate late pattern distribution
   * @private
   */
  static _calculateLatePatternDistribution(lateEmployees) {
    const patterns = {};
    
    lateEmployees.forEach(emp => {
      const pattern = emp.lateArrivalDetails.pattern;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
    
    return patterns;
  }

  /**
   * Generate daily attendance breakdown
   * @private
   */
  static _generateDailyBreakdown(issues) {
    const dailyStats = {};
    
    issues.forEach(empIssue => {
      empIssue.dailyBreakdown.forEach(day => {
        if (!dailyStats[day.day]) {
          const isWeekend = UTILS.isWeekend(day.day, ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR);
          const dayName = UTILS.getDayName(day.day, ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR);
          
          dailyStats[day.day] = {
            day: day.day,
            dayName: dayName,
            isWeekend: isWeekend,
            totalEmployees: 0,
            presentEmployees: 0,
            absentEmployees: 0,
            lateEmployees: 0,
            totalLateMinutes: 0,
            issues: []
          };
        }
        
        dailyStats[day.day].totalEmployees++;
        
        if (day.status === 'A') {
          dailyStats[day.day].absentEmployees++;
        } else if (!dailyStats[day.day].isWeekend) {
          dailyStats[day.day].presentEmployees++;
          
          if (day.isLate) {
            dailyStats[day.day].lateEmployees++;
            dailyStats[day.day].totalLateMinutes += day.lateMinutes;
          }
        }
        
        day.issues.forEach(issue => {
          dailyStats[day.day].issues.push({
            employeeName: empIssue.employee.name,
            issue: issue.message,
            severity: issue.severity
          });
        });
      });
    });
    
    return Object.values(dailyStats).sort((a, b) => a.day - b.day);
  }

  /**
   * Generate attendance patterns analysis
   * @private
   */
  static _generateAttendancePatterns(issues) {
    const patterns = {
      consecutiveLatePatterns: [],
      frequentLateEmployees: [],
      punctualityRanking: [],
      weekendWorkPatterns: []
    };
    
    issues.forEach(empIssue => {
      // Consecutive late patterns
      if (empIssue.attendancePattern && empIssue.attendancePattern.maxConsecutiveLate >= 3) {
        patterns.consecutiveLatePatterns.push({
          name: empIssue.employee.name,
          id: empIssue.employee.id,
          maxConsecutiveLate: empIssue.attendancePattern.maxConsecutiveLate,
          totalLateDays: empIssue.lateArrivalDetails.totalLateDays
        });
      }
      
      // Frequent late employees (more than 30% of working days)
      if (empIssue.lateArrivalDetails && empIssue.summary) {
        const latePercentage = (empIssue.lateArrivalDetails.totalLateDays / empIssue.summary.workingDays) * 100;
        if (latePercentage > 30) {
          patterns.frequentLateEmployees.push({
            name: empIssue.employee.name,
            id: empIssue.employee.id,
            latePercentage: Math.round(latePercentage),
            lateDays: empIssue.lateArrivalDetails.totalLateDays,
            workingDays: empIssue.summary.workingDays
          });
        }
      }
      
      // Punctuality ranking
      if (empIssue.attendancePattern && empIssue.lateArrivalDetails && empIssue.summary) {
        patterns.punctualityRanking.push({
          name: empIssue.employee.name,
          id: empIssue.employee.id,
          punctualDays: empIssue.attendancePattern.punctualDays,
          lateDays: empIssue.lateArrivalDetails.totalLateDays,
          workingDays: empIssue.summary.workingDays,
          punctualityScore: Math.round((empIssue.attendancePattern.punctualDays / empIssue.summary.workingDays) * 100)
        });
      }
    });
    
    // Sort punctuality ranking
    patterns.punctualityRanking.sort((a, b) => b.punctualityScore - a.punctualityScore);
    
    return patterns;
  }
}

module.exports = FixedFileController;
