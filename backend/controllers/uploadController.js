const XLSX = require('xlsx');
const fs = require('fs');
const ExcelParserService = require('../services/excelParser');
const AttendanceAnalyzerService = require('../services/attendanceAnalyzer');

class UploadController {
  /**
   * Upload and process Excel file with enhanced format support
   */
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No file uploaded' 
        });
      }
      
      console.log(`Processing uploaded file: ${req.file.filename}`);
      
      // Store filename for month/year detection
      const workbook = XLSX.readFile(req.file.path);
      workbook.filename = req.file.originalname;
      
      // Try different parsing methods based on file structure
      let employees, issues;
      let formatDetected = 'Unknown';
      
      // Method 1: Check if it's a Four Punch format
      const isFourPunchFormat = ExcelParserService.isFourPunchFormat(workbook);
      
      if (isFourPunchFormat) {
        console.log('Detected Four Punch format');
        formatDetected = 'Four Punch';
        employees = ExcelParserService.parseFourPunchData(workbook);
      } else {
        // Method 2: Try Fixed Format (InTime1, OutTime1, InTime2 format)
        console.log('Trying Fixed Format parsing...');
        try {
          employees = ExcelParserService.parseFixedFormatFile(workbook);
          formatDetected = 'Fixed Format (InTime1/OutTime1/InTime2)';
          console.log('Successfully parsed as Fixed Format');
        } catch (fixedFormatError) {
          console.log('Fixed format parsing failed, trying flexible parsing...');
          // Method 3: Fall back to flexible parsing
          employees = ExcelParserService.parseFourPunchData(workbook);
          formatDetected = 'Flexible/Generic';
        }
      }
      
      if (!employees || employees.length === 0) {
        throw new Error('No employee data found in the uploaded file. Please check the file format.');
      }
      
      // Analyze attendance issues with weekend detection
      issues = AttendanceAnalyzerService.analyzeAttendanceWithWeekends 
        ? AttendanceAnalyzerService.analyzeAttendanceWithWeekends(employees)
        : AttendanceAnalyzerService.analyzeAttendance(employees);
      
      // Generate comprehensive summary
      const summary = AttendanceAnalyzerService.generateSummary(employees, issues);
      
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
      
      // Enhanced response with detailed attendance tracking
      res.json({
        success: true,
        data: {
          employees: employees,
          issues: issues,
          summary: summary,
          detailedAnalysis: {
            lateArrivalSummary: UploadController._generateLateArrivalSummary(issues),
            dailyAttendanceBreakdown: UploadController._generateDailyBreakdown(issues),
            attendancePatterns: UploadController._generateAttendancePatterns(issues),
            weekendAnalysis: UploadController._generateWeekendAnalysis(employees),
            validationSummary: UploadController._generateValidationSummary(employees)
          }
        },
        metadata: {
          filename: req.file.originalname,
          format: formatDetected,
          employeeCount: employees.length,
          issueCount: issues.length,
          employeesWithLateArrivals: issues.filter(emp => emp.lateArrivalDetails && emp.lateArrivalDetails.totalLateDays > 0).length,
          totalLateDays: issues.reduce((sum, emp) => sum + (emp.lateArrivalDetails ? emp.lateArrivalDetails.totalLateDays : 0), 0),
          uploadTime: new Date().toISOString(),
          businessRules: {
            lateThreshold: '10:01',
            earlyDepartureThreshold: '18:30',
            weekendsAutoExcluded: true
          }
        },
        message: `Successfully processed ${employees.length} employees with ${formatDetected} format`
      });
      
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file on error:', err);
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Error processing file: ' + error.message 
      });
    }
  }


  /**
   * Generate weekend analysis for uploaded files
   * @private
   */
  static _generateWeekendAnalysis(employees) {
    if (!employees || employees.length === 0) return null;
    
    const firstEmployee = employees[0];
    if (!firstEmployee.dailyData || firstEmployee.dailyData.length === 0) return null;
    
    const weekendDays = firstEmployee.dailyData.filter(day => day.isWeekend || day.status === 'WO');
    const workingDays = firstEmployee.dailyData.filter(day => !day.isWeekend && day.status !== 'WO');
    
    return {
      totalDays: firstEmployee.dailyData.length,
      weekendDays: weekendDays.length,
      workingDays: workingDays.length,
      weekends: weekendDays.map(day => ({
        day: day.day,
        dayName: day.dayType,
        status: day.status
      })),
      note: 'Weekends (Saturdays and Sundays) are automatically marked as WO (Weekend Off)'
    };
  }

  /**
   * Generate validation summary based on user's criteria
   * @private
   */
  static _generateValidationSummary(employees) {
    let totalValidDays = 0;
    let totalInvalidDays = 0;
    let earlyArrivals = 0;
    let lateArrivals = 0;
    let earlyDepartures = 0;
    let validAttendance = 0;
    
    employees.forEach(employee => {
      if (employee.dailyData) {
        employee.dailyData.forEach(day => {
          if (!day.isWeekend && day.status === 'P') {
            const { UTILS } = require('../utils/constants');
            
            // Check punch-in time (should be before 10:01)
            if (day.inTime1) {
              if (UTILS.isValidPunchIn(day.inTime1)) {
                earlyArrivals++;
              } else {
                lateArrivals++;
              }
            }
            
            // Check punch-out time (should be after 18:30)
            let hasValidPunchOut = false;
            if (day.outTime1 && UTILS.isValidPunchOut(day.outTime1)) hasValidPunchOut = true;
            if (day.outTime2 && UTILS.isValidPunchOut(day.outTime2)) hasValidPunchOut = true;
            if (day.inTime2 && UTILS.isValidPunchOut(day.inTime2)) hasValidPunchOut = true;
            
            if (!hasValidPunchOut) {
              earlyDepartures++;
            }
            
            // Overall validation
            if (day.isValidAttendance) {
              validAttendance++;
              totalValidDays++;
            } else {
              totalInvalidDays++;
            }
          }
        });
      }
    });
    
    return {
      totalValidDays,
      totalInvalidDays,
      earlyArrivals,
      lateArrivals,
      earlyDepartures,
      validAttendance,
      validationRules: {
        punchInBefore: '10:01',
        punchOutAfter: '18:30',
        handleMultiplePunches: 'First punch-in, last punch-out',
        weekendHandling: 'Automatically marked as WO'
      }
    };
  }

  /**
   * Generate late arrival summary
   * @private
   */
  static _generateLateArrivalSummary(issues) {
    const lateEmployees = issues.filter(emp => emp.lateArrivalDetails.totalLateDays > 0);
    
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
      latePatternDistribution: UploadController._calculateLatePatternDistribution(lateEmployees)
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
          dailyStats[day.day] = {
            day: day.day,
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
        } else if (day.status !== 'WO' && day.status !== 'H') {
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
      punctualityRanking: []
    };
    
    issues.forEach(empIssue => {
      // Consecutive late patterns
      if (empIssue.attendancePattern.maxConsecutiveLate >= 3) {
        patterns.consecutiveLatePatterns.push({
          name: empIssue.employee.name,
          id: empIssue.employee.id,
          maxConsecutiveLate: empIssue.attendancePattern.maxConsecutiveLate,
          totalLateDays: empIssue.lateArrivalDetails.totalLateDays
        });
      }
      
      // Frequent late employees (more than 30% of working days)
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
      
      // Punctuality ranking
      patterns.punctualityRanking.push({
        name: empIssue.employee.name,
        id: empIssue.employee.id,
        punctualDays: empIssue.attendancePattern.punctualDays,
        lateDays: empIssue.lateArrivalDetails.totalLateDays,
        workingDays: empIssue.summary.workingDays,
        punctualityScore: Math.round((empIssue.attendancePattern.punctualDays / empIssue.summary.workingDays) * 100)
      });
    });
    
    // Sort punctuality ranking
    patterns.punctualityRanking.sort((a, b) => b.punctualityScore - a.punctualityScore);
    
    return patterns;
  }

  /**
   * Get upload configuration
   */
  static getUploadConfig(req, res) {
    res.json({
      success: true,
      config: {
        maxFileSize: '50MB',
        allowedExtensions: ['.xlsx', '.xls'],
        uploadEndpoint: '/api/upload',
        supportedFormats: ['Four Punch Format', 'Generic Excel Format'],
        analysisFeatures: [
          'Late arrival tracking',
          'Daily attendance breakdown',
          'Attendance pattern analysis',
          'Punctuality ranking',
          'Issue severity classification'
        ]
      }
    });
  }
}

module.exports = UploadController;
