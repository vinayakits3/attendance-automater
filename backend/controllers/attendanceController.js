const XLSX = require('xlsx');
const fs = require('fs');
const ExcelParserService = require('../services/excelParser');
const AttendanceAnalyzerService = require('../services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG } = require('../utils/constants');

class AttendanceController {
  /**
   * Process INN attendance from fixed file
   */
  static async processINNAttendance(req, res) {
    try {
      console.log(`Reading Excel file: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
      
      // Check if file exists
      if (!fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)) {
        return res.status(404).json({ 
          success: false,
          error: `Excel file not found at path: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}` 
        });
      }
      
      // Read the Excel file
      const workbook = XLSX.readFile(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
      console.log('Excel file loaded successfully');
      
      // Parse INN department data
      const innEmployees = ExcelParserService.parseINNDepartmentData(workbook);
      
      // Analyze attendance issues
      const issues = AttendanceAnalyzerService.analyzeAttendance(innEmployees);
      
      // Generate summary
      const summary = AttendanceAnalyzerService.generateSummary(
        innEmployees, 
        issues, 
        ATTENDANCE_CONFIG.DEPARTMENT_NAME
      );
      
      res.json({
        success: true,
        data: {
          employees: innEmployees,
          issues: issues,
          summary: summary
        },
        message: `Successfully processed ${innEmployees.length} employees from INN department`
      });
      
    } catch (error) {
      console.error('Error processing INN attendance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error processing attendance data: ' + error.message 
      });
    }
  }

  /**
   * Get INN Department summary only
   */
  static async getINNSummary(req, res) {
    try {
      if (!fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)) {
        return res.status(404).json({ 
          success: false,
          error: `Excel file not found at path: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}` 
        });
      }
      
      const workbook = XLSX.readFile(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
      const innEmployees = ExcelParserService.parseINNDepartmentData(workbook);
      const issues = AttendanceAnalyzerService.analyzeAttendance(innEmployees);
      const summary = AttendanceAnalyzerService.generateSummary(
        innEmployees, 
        issues, 
        ATTENDANCE_CONFIG.DEPARTMENT_NAME
      );
      
      res.json({
        success: true,
        summary: summary
      });
      
    } catch (error) {
      console.error('Error generating INN summary:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error generating summary: ' + error.message 
      });
    }
  }

  /**
   * Get system configuration
   */
  static getConfig(req, res) {
    res.json({
      success: true,
      config: {
        department: ATTENDANCE_CONFIG.DEPARTMENT_NAME,
        checkInTime: ATTENDANCE_CONFIG.CHECK_IN_TIME,
        checkOutTime: ATTENDANCE_CONFIG.CHECK_OUT_TIME,
        excelFilePath: ATTENDANCE_CONFIG.EXCEL_FILE_PATH,
        processName: 'INN Department Attendance Automater'
      }
    });
  }

  /**
   * Health check endpoint
   */
  static getHealth(req, res) {
    res.json({ 
      success: true,
      status: 'OK', 
      department: ATTENDANCE_CONFIG.DEPARTMENT_NAME,
      timestamp: new Date().toISOString(),
      fileExists: fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)
    });
  }
}

module.exports = AttendanceController;
