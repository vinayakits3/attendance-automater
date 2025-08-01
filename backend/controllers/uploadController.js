const XLSX = require('xlsx');
const fs = require('fs');
const ExcelParserService = require('../services/excelParser');
const AttendanceAnalyzerService = require('../services/attendanceAnalyzer');

class UploadController {
  /**
   * Upload and process Excel file
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
      const workbook = XLSX.readFile(req.file.path);
      
      // Check if it's a Four Punch report
      const isFourPunchFormat = ExcelParserService.isFourPunchFormat(workbook);
      
      let employees, issues;
      
      if (isFourPunchFormat) {
        // Parse Four Punch format
        employees = ExcelParserService.parseFourPunchData(workbook);
      } else {
        // Try to parse as generic format (flexible parsing)
        employees = ExcelParserService.parseFourPunchData(workbook);
      }
      
      // Analyze attendance issues
      issues = AttendanceAnalyzerService.analyzeAttendance(employees);
      
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
            lateArrivalSummary: this._generateLateArrivalSummary(issues),
            dailyAttendanceBreakdown: this._generateDailyBreakdown(issues),
            attendancePatterns: this._generateAttendancePatterns(issues)
          }
        },
        metadata: {
          filename: req.file.filename,
          format: isFourPunchFormat ? 'Four Punch' : 'Generic',
          employeeCount: employees.length,
          issueCount: issues.length,
          employeesWithLateArrivals: issues.filter(emp => emp.lateArrivalDetails.totalLateDays > 0).length,
          totalLateDays: issues.reduce((sum, emp) => sum + emp.lateArrivalDetails.totalLateDays, 0),
          uploadTime: new Date().toISOString()
        },
        message: `Successfully processed ${employees.length} employees with detailed attendance analysis`
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
      latePatternDistribution: this._calculateLatePatternDistribution(lateEmployees)
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
