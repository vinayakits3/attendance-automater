const XLSX = require('xlsx');
const fs = require('fs');
const ExcelParserService = require('../services/excelParser');
const AttendanceAnalyzerService = require('../services/attendanceAnalyzer');
const { ATTENDANCE_CONFIG } = require('../utils/constants');

class AttendanceController {
  /**
   * Process INN attendance from fixed file
   */
  /**
   * Process INN Department attendance from fixed file - WEEKDAYS ONLY
   * DEDICATED SYSTEM: INN Department + Monday-Friday Only
   */
  static async processINNAttendance(req, res) {
    try {
      console.log(`🏢 ${ATTENDANCE_CONFIG.SYSTEM_NAME}`);
      console.log(`📂 Reading Excel file: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
      console.log(`📅 Processing policy: WEEKDAYS ONLY (Monday-Friday)`);
      console.log(`🏢 Department filter: INN ONLY`);
      
      // Check if file exists
      if (!fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)) {
        return res.status(404).json({ 
          success: false,
          error: `Excel file not found at path: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`,
          systemInfo: {
            systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
            description: ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION
          }
        });
      }
      
      // Read the Excel file
      const workbook = XLSX.readFile(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
      console.log('✅ Excel file loaded successfully');
      
      // Parse INN department data (weekdays only)
      const innEmployees = ExcelParserService.parseFixedFormatFile(workbook);
      
      if (innEmployees.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No INN department employees found in the Excel file.',
          systemInfo: {
            systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
            departmentFocus: 'INN Only',
            processingPolicy: 'Weekdays Only (Monday-Friday)'
          }
        });
      }
      
      // Analyze attendance issues - WEEKDAYS ONLY
      const issues = AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly ?
        AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly(innEmployees) :
        AttendanceAnalyzerService.analyzeAttendance(innEmployees);
      
      // Generate comprehensive summary
      const summary = AttendanceAnalyzerService.generateSummary(
        innEmployees, 
        issues, 
        ATTENDANCE_CONFIG.DEPARTMENT_NAME
      );
      
      console.log(`✅ Successfully processed ${innEmployees.length} INN employees (weekdays only)`);
      
      res.json({
        success: true,
        data: {
          employees: innEmployees,
          issues: issues,
          summary: summary
        },
        systemInfo: {
          systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
          description: ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION,
          departmentFocus: 'INN Department Only (up to row 905)',
          processingPolicy: 'Weekdays Only (Monday-Friday)',
          weekendPolicy: 'Automatically Excluded',
          calculationMethod: ATTENDANCE_CONFIG.CALCULATION_METHOD,
          attendanceLogic: 'Punch-Based (not status-based)',
          punchBasedRules: {
            presence: ATTENDANCE_CONFIG.PRESENCE_RULE,
            absence: ATTENDANCE_CONFIG.ABSENCE_RULE,
            lateArrival: ATTENDANCE_CONFIG.LATE_RULE,
            fullDay: ATTENDANCE_CONFIG.FULL_DAY_RULE,
            checkInTime: ATTENDANCE_CONFIG.CHECK_IN_TIME,
            checkOutTime: ATTENDANCE_CONFIG.CHECK_OUT_TIME
          },
          columnRange: `${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.START} to ${ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS.END}`,
          employeesProcessed: innEmployees.length,
          processingNote: ATTENDANCE_CONFIG.PROCESSING_NOTE,
          punchLogicNote: ATTENDANCE_CONFIG.PUNCH_LOGIC_NOTE
        },
        message: `Successfully processed ${innEmployees.length} INN department employees using punch-based logic (weekdays only)`
      });
      
    } catch (error) {
      console.error('❌ Error processing INN attendance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error processing INN department attendance: ' + error.message,
        systemInfo: {
          systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
          description: ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION
        }
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
      const issues = AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly ?
        AttendanceAnalyzerService.analyzeAttendanceWeekdaysOnly(innEmployees) :
        AttendanceAnalyzerService.analyzeAttendance(innEmployees);
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
  /**
   * Get INN Department Weekdays-Only system configuration
   */
  static getConfig(req, res) {
    res.json({
      success: true,
      systemInfo: {
        systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
        description: ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION,
        version: '2.0 - INN Department Weekdays-Only Edition'
      },
      config: {
        department: ATTENDANCE_CONFIG.DEPARTMENT_NAME,
        departmentFocus: 'INN Department Only',
        processingPolicy: 'Weekdays Only (Monday-Friday)',
        weekendPolicy: 'Automatically Excluded (Saturday, Sunday)',
        checkInTime: ATTENDANCE_CONFIG.CHECK_IN_TIME,
        checkOutTime: ATTENDANCE_CONFIG.CHECK_OUT_TIME,
        excelFilePath: ATTENDANCE_CONFIG.EXCEL_FILE_PATH,
        workingDays: ATTENDANCE_CONFIG.WEEKDAY_ABBRS,
        excludedDays: ATTENDANCE_CONFIG.WEEKEND_ABBRS,
        processName: ATTENDANCE_CONFIG.SYSTEM_NAME
      },
      businessRules: {
        calculationMethod: ATTENDANCE_CONFIG.CALCULATION_METHOD,
        punchBasedLogic: ATTENDANCE_CONFIG.PUNCH_BASED_ATTENDANCE,
        punchInDeadline: ATTENDANCE_CONFIG.CHECK_IN_TIME,
        punchOutMinimum: ATTENDANCE_CONFIG.CHECK_OUT_TIME,
        presenceRule: ATTENDANCE_CONFIG.PRESENCE_RULE,
        absenceRule: ATTENDANCE_CONFIG.ABSENCE_RULE,
        lateRule: ATTENDANCE_CONFIG.LATE_RULE,
        fullDayRule: ATTENDANCE_CONFIG.FULL_DAY_RULE,
        columnRange: ATTENDANCE_CONFIG.ATTENDANCE_COLUMNS,
        weekdaysOnly: true,
        weekendsExcluded: true,
        departmentFilter: 'INN_ONLY',
        departmentBoundary: `Process only up to row ${ATTENDANCE_CONFIG.INN_DEPARTMENT_END_ROW + 2}`,
        boundaryReason: ATTENDANCE_CONFIG.INN_BOUNDARY_NOTE,
        attendanceCalculation: 'Monday to Friday only with punch-based logic'
      },
      notes: {
        processing: ATTENDANCE_CONFIG.PROCESSING_NOTE,
        weekend: ATTENDANCE_CONFIG.WEEKEND_NOTE,
        department: ATTENDANCE_CONFIG.DEPARTMENT_NOTE,
        boundary: ATTENDANCE_CONFIG.INN_BOUNDARY_NOTE,
        punchLogic: ATTENDANCE_CONFIG.PUNCH_LOGIC_NOTE
      }
    });
  }

  /**
   * Health check endpoint
   */
  /**
   * Health check endpoint for INN Department Weekdays-Only system
   */
  static getHealth(req, res) {
    const fileExists = fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH);
    
    res.json({ 
      success: true,
      status: 'OK',
      systemInfo: {
        systemName: ATTENDANCE_CONFIG.SYSTEM_NAME,
        description: ATTENDANCE_CONFIG.SYSTEM_DESCRIPTION,
        version: '2.0 - INN Department Weekdays-Only Edition'
      },
      configuration: {
        department: ATTENDANCE_CONFIG.DEPARTMENT_NAME,
        departmentFocus: 'INN Only',
        processingPolicy: 'Weekdays Only (Monday-Friday)',
        weekendHandling: 'Automatically Excluded',
        fileMonitoring: ATTENDANCE_CONFIG.EXCEL_FILE_PATH,
        fileExists: fileExists
      },
      operationalStatus: {
        timestamp: new Date().toISOString(),
        fileAccessible: fileExists,
        systemReady: fileExists,
        message: fileExists ? 
          'System ready for INN department weekdays-only processing' : 
          'Upload Excel file to begin INN department processing'
      },
      processingCapabilities: {
        supportedDepartments: ['INN'],
        supportedDays: ATTENDANCE_CONFIG.WEEKDAY_ABBRS,
        excludedDays: ATTENDANCE_CONFIG.WEEKEND_ABBRS,
        attendanceCalculation: 'Monday-Friday only',
        weekendPolicy: 'Automatic exclusion'
      }
    });
  }
}

module.exports = AttendanceController;
