const XLSX = require('xlsx');
const { ATTENDANCE_CONFIG } = require('../utils/constants');

class ExcelParserService {
  /**
   * Parse INN Department data from specific Excel format
   * @param {Object} workbook - XLSX workbook object
   * @returns {Array} Array of employee data
   */
  static parseINNDepartmentData(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log('Parsing INN Department data...');
    console.log(`Sheet range: ${worksheet['!ref']}`);
    
    const dateColumns = ExcelParserService._extractDateColumns(worksheet, range);
    const innDepartmentStartRow = ExcelParserService._findINNDepartmentRow(worksheet, range);
    
    if (innDepartmentStartRow === -1) {
      throw new Error('INN Department not found in the Excel file');
    }
    
    const employees = ExcelParserService._extractINNEmployees(worksheet, range, dateColumns, innDepartmentStartRow);
    
    console.log(`Total INN employees found: ${employees.length}`);
    return employees;
  }

  /**
   * Parse Four Punch data from any Excel file (flexible parsing)
   * @param {Object} workbook - XLSX workbook object
   * @returns {Array} Array of employee data
   */
  static parseFourPunchData(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log('Parsing Four Punch data...');
    console.log(`Sheet range: ${worksheet['!ref']}`);
    
    // Debug: Print first few rows to understand structure
    ExcelParserService._debugPrintStructure(worksheet, range);
    
    const dateColumns = ExcelParserService._extractDateColumnsFlexible(worksheet, range);
    console.log('Date columns found:', Object.keys(dateColumns).length);
    
    const employees = ExcelParserService._extractAllEmployeesFlexible(worksheet, range, dateColumns);
    
    console.log(`Total employees found: ${employees.length}`);
    return employees;
  }

  /**
   * Parse Fixed Format File - INN Department Only
   * Handles WorkDurationReportFourPunch format and extracts ONLY INN department employees
   * @param {Object} workbook - XLSX workbook object
   * @returns {Array} Array of INN department employee data only
   */
  static parseFixedFormatFile(workbook) {
    const { UTILS, ATTENDANCE_CONFIG } = require('../utils/constants');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log('Parsing Fixed Format File - Looking for INN Department Only...');
    console.log(`Sheet: ${sheetName}, Range: ${worksheet['!ref']}`);
    
    // Auto-detect month and year from the date range in row 2
    const dateRangeCell = worksheet[XLSX.utils.encode_cell({ r: 1, c: 1 })]; // Row 2, Column B
    let month = ATTENDANCE_CONFIG.REPORT_MONTH;
    let year = ATTENDANCE_CONFIG.REPORT_YEAR;
    
    if (dateRangeCell && dateRangeCell.v) {
      const dateMatch = dateRangeCell.v.toString().match(/([a-zA-Z]+)\s+\d+\s+(\d{4})/);
      if (dateMatch) {
        const monthName = dateMatch[1].toLowerCase();
        year = parseInt(dateMatch[2]);
        
        const monthMap = {
          'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
          'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };
        month = monthMap[monthName] || month;
        console.log(`Auto-detected: ${monthName} ${year} (${month}/${year})`);
      }
    }
    
    // Parse day headers from row 6
    const dayHeaders = ExcelParserService._parseDayHeaders(worksheet, range, month, year);
    console.log(`Found ${Object.keys(dayHeaders).length} day columns`);
    
    // Find INN Department section specifically
    const innDepartmentRow = ExcelParserService._findINNDepartmentRow(worksheet, range);
    if (innDepartmentRow === -1) {
      console.log('❌ INN Department not found in Excel file');
      return [];
    }
    
    console.log(`✅ Found INN Department at row ${innDepartmentRow + 1}`);
    
    // Extract only INN Department employees
    const employees = ExcelParserService._extractINNEmployeesOnly(worksheet, innDepartmentRow, dayHeaders, month, year, UTILS);
    
    console.log(`Successfully parsed ${employees.length} employees from INN Department only`);
    return employees;
  }


  /**
   * Find INN Department row in the Excel sheet
   * @private
   */
  static _findINNDepartmentRow(worksheet, range) {
    console.log('🔍 Searching for INN Department...');
    
    // Search through all rows to find INN department
    for (let row = 0; row <= range.e.r; row++) {
      // Check column E (index 4) for department names
      const deptCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
      
      if (deptCell && deptCell.v) {
        const cellValue = deptCell.v.toString().trim().toUpperCase();
        
        // Look for INN department
        if (cellValue === 'INN' || cellValue.includes('INN')) {
          console.log(`🎯 Found INN Department at row ${row + 1}, column E`);
          return row;
        }
      }
      
      // Also check other columns in case department is in a different column
      for (let col = 0; col <= 10; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v) {
          const cellValue = cell.v.toString().trim().toUpperCase();
          if (cellValue === 'INN' || cellValue.includes('DEPARTMENT:') && cellValue.includes('INN')) {
            console.log(`🎯 Found INN Department at row ${row + 1}, column ${String.fromCharCode(65 + col)}`);
            return row;
          }
        }
      }
    }
    
    console.log('❌ INN Department not found in Excel file');
    return -1;
  }

  /**
   * Extract only employees from INN Department
   * @private
   */
  static _extractINNEmployeesOnly(worksheet, innDepartmentRow, dayHeaders, month, year, UTILS) {
    const employees = [];
    let currentRow = innDepartmentRow + 2; // Start 2 rows after department header
    
    // INN DEPARTMENT BOUNDARY - Stop at row 905 (another department starts above row 905)
    const INN_DEPARTMENT_END_ROW = 904; // Row 905 is where another dept starts (0-indexed: 904)
    
    console.log(`🔍 Looking for INN employees starting from row ${currentRow + 1}...`);
    console.log(`🏢 INN Department Boundary: Processing ONLY up to row ${INN_DEPARTMENT_END_ROW + 1} (Excel row 905)`);
    console.log(`🛑 Will STOP before row ${INN_DEPARTMENT_END_ROW + 2} to avoid other departments`);
    
    // Process employee blocks until we hit row 905 or end of data
    const maxRow = Math.min(
      INN_DEPARTMENT_END_ROW, 
      worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.r : 1000
    );
    
    while (currentRow <= maxRow) {
      // SAFETY CHECK: Ensure we don't exceed INN department boundary
      if (currentRow > INN_DEPARTMENT_END_ROW) {
        console.log(`🛑 STOPPED at row ${currentRow + 1}: Reached INN department boundary (row 905)`);
        console.log(`🏢 This ensures we process ONLY INN department employees`);
        break;
      }
      
      const employeeCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: 0 })];
      
      // Enhanced department verification
      const deptCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: 4 })];
      if (deptCell && deptCell.v) {
        const deptValue = deptCell.v.toString().trim().toUpperCase();
        
        // Double-check: If we find a non-INN department before row 905, stop immediately
        if (deptValue !== 'INN' && deptValue.length > 0 && deptValue !== innDepartmentRow.toString()) {
          if (deptValue.includes('DEPARTMENT') || 
              (deptValue.length <= 10 && deptValue !== 'INN' && !deptValue.includes(':'))) {
            console.log(`🛑 UNEXPECTED: Found different department '${deptValue}' at row ${currentRow + 1}`);
            console.log(`🔍 This should not happen before row 905 - stopping for safety`);
            break;
          }
        }
      }
      
      // Check if this is an employee row
      if (employeeCell && employeeCell.v && employeeCell.v.toString().includes('Employee:')) {
        console.log(`   🔍 Processing employee at row ${currentRow + 1} (within INN boundary)`);
        
        const employee = ExcelParserService._parseEmployeeBlock(worksheet, currentRow, dayHeaders, month, year, UTILS);
        if (employee) {
          // Ensure this employee belongs to INN department
          employee.department = 'INN';
          employee.rowNumber = currentRow + 1; // Add row tracking for verification
          employees.push(employee);
          console.log(`   ✅ Parsed INN employee: ${employee.name} (ID: ${employee.id}) at row ${currentRow + 1}`);
        }
      }
      
      currentRow += 12; // Move to next employee block (12 rows later)
      
      // Additional safety check before next iteration
      if (currentRow > INN_DEPARTMENT_END_ROW) {
        console.log(`🔄 Next employee block would be at row ${currentRow + 1}, which exceeds INN boundary`);
        break;
      }
    }
    
    console.log(`🏢 INN DEPARTMENT PROCESSING SUMMARY:`);
    console.log(`   📍 Started at row: ${innDepartmentRow + 3}`);
    console.log(`   📍 Stopped before row: ${INN_DEPARTMENT_END_ROW + 2} (905)`);
    console.log(`   👥 Total INN employees found: ${employees.length}`);
    console.log(`   ✅ Ensured NO other departments processed`);
    
    return employees;
  }


  /**
   * Parse day headers from row 6 to understand the column layout
   * @private
   */
  /**
   * Parse day headers from row 6 to understand the column layout
   * UPDATED: Only calculate attendance for Monday-Friday based on Excel day abbreviations
   * @private
   */
  static _parseDayHeaders(worksheet, range, month, year) {
    const dayHeaders = {};
    const dayRowIndex = 5; // Row 6 (0-indexed = 5)
    
    console.log('📅 Parsing day headers from Excel row 6 for Monday-Friday only...');
    
    // Start from column C (index 2) where days begin
    for (let col = 2; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: dayRowIndex, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const cellValue = cell.v.toString().trim();
        
        // Parse day format like "1 T", "2 W", "5 St", "6 S"
        const dayMatch = cellValue.match(/^(\d+)\s+([A-Za-z]+)$/);
        if (dayMatch) {
          const dayNumber = parseInt(dayMatch[1]);
          const dayAbbr = dayMatch[2];
          
          if (dayNumber >= 1 && dayNumber <= 31) {
            // Determine if this is a weekday or weekend based on Excel abbreviations
            const isWeekend = ExcelParserService._isWeekendByExcelAbbr(dayAbbr);
            const isWeekday = ExcelParserService._isWeekdayByExcelAbbr(dayAbbr);
            const fullDayName = ExcelParserService._getFullDayName(dayAbbr);
            
            // Log weekend/weekday detection
            if (isWeekend) {
              console.log(`   📅 Day ${dayNumber} (${dayAbbr}): ${fullDayName} → WEEKEND (excluded from attendance calculation)`);
            } else if (isWeekday) {
              console.log(`   📅 Day ${dayNumber} (${dayAbbr}): ${fullDayName} → WEEKDAY (included in attendance calculation)`);
            } else {
              console.log(`   📅 Day ${dayNumber} (${dayAbbr}): Unknown day type → Treating as weekday`);
            }
            
            dayHeaders[col] = {
              day: dayNumber,
              dayAbbr: dayAbbr,
              dayName: fullDayName,
              isWeekend: isWeekend,
              isWeekday: isWeekday,
              includeInAttendance: isWeekday // Only include weekdays in attendance calculation
            };
          }
        }
      }
    }
    
    const weekdays = Object.values(dayHeaders).filter(d => d.isWeekday).length;
    const weekends = Object.values(dayHeaders).filter(d => d.isWeekend).length;
    console.log(`📊 Day parsing summary: ${weekdays} weekdays (Mon-Fri), ${weekends} weekends (Sat-Sun)`);
    
    return dayHeaders;
  }

  /**
   * Check if day abbreviation represents a weekend (Saturday or Sunday)
   * Based on Excel day abbreviations from row 6
   * @private
   */
  static _isWeekendByExcelAbbr(dayAbbr) {
    const weekendAbbrs = ['St', 'S']; // St = Saturday, S = Sunday
    return weekendAbbrs.includes(dayAbbr);
  }

  /**
   * Check if day abbreviation represents a weekday (Monday-Friday)
   * Based on Excel day abbreviations from row 6
   * @private
   */
  static _isWeekdayByExcelAbbr(dayAbbr) {
    const weekdayAbbrs = ['M', 'T', 'W', 'Th', 'F']; // Monday to Friday
    return weekdayAbbrs.includes(dayAbbr);
  }

  /**
   * Get full day name from Excel abbreviation
   * @private
   */
  static _getFullDayName(dayAbbr) {
    const dayNames = {
      'M': 'Monday',
      'T': 'Tuesday', 
      'W': 'Wednesday',
      'Th': 'Thursday',
      'F': 'Friday',
      'St': 'Saturday',
      'S': 'Sunday'
    };
    return dayNames[dayAbbr] || dayAbbr;
  }

  /**
   * Parse a complete employee block (12 rows)
   * @private
   */
  /**
   * Parse a complete employee block (12 rows)
   * UPDATED: Only process Monday-Friday attendance based on Excel day headers
   * @private
   */
  static _parseEmployeeBlock(worksheet, startRow, dayHeaders, month, year, UTILS) {
    try {
      // Get employee info from column E (index 4)
      const employeeInfoCell = worksheet[XLSX.utils.encode_cell({ r: startRow, c: 4 })];
      if (!employeeInfoCell || !employeeInfoCell.v) {
        return null;
      }
      
      const employeeInfo = employeeInfoCell.v.toString();
      const [employeeId, employeeName] = employeeInfo.split(' : ').map(s => s.trim());
      
      console.log(`👤 Processing employee: ${employeeName} (${employeeId}) - Monday to Friday only`);
      
      // Parse daily data for each day column
      const dailyData = [];
      let weekdayCount = 0;
      let weekendCount = 0;
      
      Object.entries(dayHeaders).forEach(([colIndex, dayInfo]) => {
        const col = parseInt(colIndex);
        const { day, dayAbbr, dayName, isWeekend, isWeekday, includeInAttendance } = dayInfo;
        
        // Get data from each row of the employee block
        const statusCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 1, c: col })];
        const inTime1Cell = worksheet[XLSX.utils.encode_cell({ r: startRow + 2, c: col })];
        const outTime1Cell = worksheet[XLSX.utils.encode_cell({ r: startRow + 3, c: col })];
        const inTime2Cell = worksheet[XLSX.utils.encode_cell({ r: startRow + 4, c: col })];
        const outTime2Cell = worksheet[XLSX.utils.encode_cell({ r: startRow + 5, c: col })];
        const durationCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 6, c: col })];
        const lateByCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 7, c: col })];
        const earlyByCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 8, c: col })];
        const otCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 9, c: col })];
        const shiftCell = worksheet[XLSX.utils.encode_cell({ r: startRow + 10, c: col })];
        
        // Process the raw data - IGNORE Excel status column
        const inTime1Raw = inTime1Cell ? inTime1Cell.v?.toString().trim() : '';
        const outTime1Raw = outTime1Cell ? outTime1Cell.v?.toString().trim() : '';
        const inTime2Raw = inTime2Cell ? inTime2Cell.v?.toString().trim() : '';
        let outTime2Raw = outTime2Cell ? outTime2Cell.v?.toString().trim() : '';
        
        // Handle double punch-ins/outs using your business logic
        const inTime1 = UTILS.parseMultipleTimes(inTime1Raw, 'in');
        const outTime1 = UTILS.parseMultipleTimes(outTime1Raw, 'out');
        const inTime2 = UTILS.parseMultipleTimes(inTime2Raw, 'in');
        const outTime2 = UTILS.parseMultipleTimes(outTime2Raw, 'out');
        
        // Calculate status based on weekday/weekend logic
        let status;
        
        if (isWeekend) {
          // Weekend days: Always WO (Weekend Off) - not included in attendance calculation
          status = 'WO';
          weekendCount++;
          console.log(`   📅 Day ${day} (${dayAbbr} - ${dayName}): Weekend → WO (excluded from attendance)`);
        } else if (isWeekday) {
          // Weekday: Calculate attendance status based on business logic
          status = ExcelParserService._calculateAttendanceStatus(
            inTime1, outTime1, inTime2, outTime2, false, day, dayName, UTILS
          );
          weekdayCount++;
          console.log(`   📅 Day ${day} (${dayAbbr} - ${dayName}): Weekday → ${status} (included in attendance)`);
        } else {
          // Unknown day type: treat as weekday for backward compatibility
          status = ExcelParserService._calculateAttendanceStatus(
            inTime1, outTime1, inTime2, outTime2, false, day, dayName, UTILS
          );
          weekdayCount++;
          console.log(`   📅 Day ${day} (${dayAbbr} - ${dayName}): Unknown → ${status} (treated as weekday)`);
        }
        
        const dayRecord = {
          day: day,
          dayType: dayName,
          dayAbbr: dayAbbr,
          status: status,
          inTime1: inTime1,
          outTime1: outTime1,
          inTime2: inTime2,
          outTime2: outTime2,
          duration: durationCell ? durationCell.v?.toString().trim() || '00:00' : '00:00',
          lateBy: lateByCell ? lateByCell.v?.toString().trim() || null : null,
          earlyBy: earlyByCell ? earlyByCell.v?.toString().trim() || null : null,
          overtime: otCell ? otCell.v?.toString().trim() || null : null,
          shift: shiftCell ? shiftCell.v?.toString().trim() || '' : '',
          isWeekend: isWeekend,
          isWeekday: isWeekday,
          includeInAttendance: includeInAttendance // Only weekdays are included
        };
        
        dailyData.push(dayRecord);
      });
      
      // Calculate summary based on WEEKDAYS ONLY (Monday-Friday)
      const summary = ExcelParserService._calculateSummaryFromDailyData(dailyData);
      
      console.log(`   📊 ${employeeName}: ${weekdayCount} weekdays processed, ${weekendCount} weekends excluded`);
      console.log(`   📊 Summary: ${summary.present}P/${summary.absent}A (${summary.workingDays} working days)`);
      
      const employee = {
        id: employeeId || `EMP${startRow}`,
        name: employeeName || employeeId || `Employee ${startRow}`,
        department: 'INN',
        summary: summary,
        dailyData: dailyData,
        month: month,
        year: year,
        reportFormat: 'WorkDurationReportFourPunch',
        statusCalculation: 'Backend Logic (Monday-Friday Only)',
        attendancePolicy: 'Weekdays Only (Monday-Friday)',
        weekdaysProcessed: weekdayCount,
        weekendsExcluded: weekendCount
      };
      
      return employee;
      
    } catch (error) {
      console.error(`Error parsing employee block at row ${startRow + 1}:`, error);
      return null;
    }
  }


  /**
   * Calculate attendance status based on business logic (ignore Excel status column)
   * @private
   */
  static _calculateAttendanceStatus(inTime1, outTime1, inTime2, outTime2, isWeekend, day, dayName, UTILS) {
    console.log(`   🔧 DURATION-BASED LOGIC: Day ${day} (${dayName})`);
    
    // 1. Weekend Detection - Automatic WO (Weekend Off)
    if (isWeekend) {
      console.log(`   Day ${day} (${dayName}): Weekend → WO`);
      return 'WO';
    }
    
    // 2. NEW DURATION-BASED LOGIC FOR INN DEPARTMENT
    // Collect all punch times from the day
    const allPunchTimes = [inTime1, outTime1, inTime2, outTime2]
      .filter(time => time && time.trim() !== '') // Remove empty/null times
      .map(time => time.trim());
    
    console.log(`   📊 Punch times found: [${allPunchTimes.join(', ')}]`);
    
    // Parse and validate all punch times
    const validPunchTimes = [];
    allPunchTimes.forEach(timeStr => {
      const parsedTimes = UTILS.parseAllTimesFromCell(timeStr);
      validPunchTimes.push(...parsedTimes);
    });
    
    // Remove duplicates and sort
    const uniquePunchTimes = [...new Set(validPunchTimes)]
      .filter(time => UTILS.isValidTimeFormat(time))
      .sort();
    
    console.log(`   ✅ Valid unique punch times: [${uniquePunchTimes.join(', ')}]`);
    
    // 3. USE NEW DURATION-BASED ATTENDANCE DETERMINATION
    const attendanceResult = UTILS.calculatePunchBasedStatus(uniquePunchTimes, isWeekend);
    
    // Log the detailed result
    if (attendanceResult.isPresent) {
      const { timingCategory, workDuration, requiredHours, isFullDay, dayType } = attendanceResult;
      console.log(`   ✅ Day ${day} (${dayName}): ${dayType} - ${timingCategory} timing`);
      console.log(`      Duration: ${workDuration.toFixed(2)}h (Required: ${requiredHours}h)`);
      console.log(`      First punch: ${attendanceResult.firstPunch}, Last punch: ${attendanceResult.lastPunch}`);
    } else {
      console.log(`   ❌ Day ${day} (${dayName}): ${attendanceResult.status} - ${attendanceResult.note}`);
    }
    
    // Return the status - could be 'P', 'A', or 'WO'
    // Note: The detailed information (Full Day vs Half Day) is available in attendanceResult
    // but for now we return the basic status. The analyzer will use the detailed info.
    return attendanceResult.status;
  }

  /**
   * Calculate summary statistics from daily data
   * @private
   */
  /**
   * Calculate summary statistics from daily data - WEEKDAYS ONLY (Monday-Friday)
   * UPDATED: Only count Monday-Friday for attendance calculations
   * @private
   */
  static _calculateSummaryFromDailyData(dailyData) {
    let present = 0;
    let absent = 0;
    let weekendDays = 0;
    let totalWorkMinutes = 0;
    let totalLateMinutes = 0;
    let totalEarlyMinutes = 0;
    let weekdaysProcessed = 0;
    
    console.log('   📊 Calculating summary - Monday to Friday only...');
    
    dailyData.forEach(day => {
      if (day.isWeekend || day.status === 'WO') {
        // Weekend days - exclude from attendance calculation
        weekendDays++;
        console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Weekend → Excluded from calculation`);
      } else if (day.isWeekday || day.includeInAttendance !== false) {
        // Weekday - include in attendance calculation
        weekdaysProcessed++;
        
        if (day.status === 'P') {
          present++;
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Present → Counted`);
        } else if (day.status === 'A') {
          absent++;
          console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Absent → Counted`);
        } else {
          // Handle other statuses (H for holidays, etc.)
          if (day.status === 'H') {
            console.log(`      📅 Day ${day.day} (${day.dayAbbr}): Holiday → Excluded from calculation`);
            // Don't count holidays in present/absent
          } else {
            // Unknown status on weekday - treat as present for now
            present++;
            console.log(`      📅 Day ${day.day} (${day.dayAbbr}): ${day.status} → Treated as Present`);
          }
        }
        
        // Parse duration if available
        if (day.duration && day.duration !== '00:00') {
          const durationMatch = day.duration.match(/^(\d+):(\d+)$/);
          if (durationMatch) {
            totalWorkMinutes += parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
          }
        }
      }
    });
    
    // Working days = only weekdays (exclude weekends completely)
    const workingDays = weekdaysProcessed;
    const totalDays = dailyData.length;
    
    const summary = {
      present: present,
      absent: absent,
      weekendDays: weekendDays,
      workingDays: workingDays, // Only Monday-Friday count as working days
      totalDays: totalDays,
      weekdaysProcessed: weekdaysProcessed,
      attendanceRate: workingDays > 0 ? Math.round((present / workingDays) * 100) : 0,
      lateByHours: ExcelParserService._minutesToHours(totalLateMinutes),
      earlyByHours: ExcelParserService._minutesToHours(totalEarlyMinutes),
      averageWorkingHours: workingDays > 0 ? ExcelParserService._minutesToHours(Math.round(totalWorkMinutes / workingDays)) : '00:00',
      note: `Attendance calculated for weekdays only (Monday-Friday). ${weekendDays} weekend days excluded.`
    };
    
    console.log(`      📊 Final: ${present}P + ${absent}A = ${workingDays} working days (${weekendDays} weekends excluded)`);
    
    return summary;
  }


  /**
   * Find the structure of time rows (InTime1, OutTime1, InTime2, OutTime2)
   * @private
   */
  static _findTimeRowsStructure(worksheet, range) {
    const structure = {
      inTime1Row: -1,
      outTime1Row: -1,
      inTime2Row: -1,
      outTime2Row: -1,
      startDataCol: -1
    };
    
    // Scan first few columns to find time row labels
    for (let row = 0; row <= Math.min(50, range.e.r); row++) {
      for (let col = 0; col <= Math.min(5, range.e.c); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const value = cell.v.toString().toLowerCase().trim();
          
          if (value.includes('intime1') || value === 'intime1') {
            structure.inTime1Row = row;
            if (structure.startDataCol === -1) structure.startDataCol = col + 1;
          } else if (value.includes('outtime1') || value === 'outtime1') {
            structure.outTime1Row = row;
          } else if (value.includes('intime2') || value === 'intime2') {
            structure.inTime2Row = row;
          } else if (value.includes('outtime2') || value === 'outtime2') {
            structure.outTime2Row = row;
          }
        }
      }
    }
    
    return structure;
  }

  /**
   * Find employee groups based on the structure
   * @private
   */
  static _findEmployeeGroups(worksheet, range, timeRowsStructure) {
    const groups = [];
    
    // If we found time rows, create a single group for all employees
    if (timeRowsStructure.inTime1Row !== -1) {
      groups.push({
        timeRows: timeRowsStructure,
        startCol: timeRowsStructure.startDataCol > 0 ? timeRowsStructure.startDataCol : 1
      });
    } else {
      // Fallback: look for individual employee blocks
      console.log('Time rows not found, looking for individual employee blocks...');
      // This could be implemented if needed for other formats
    }
    
    return groups;
  }

  /**
   * Parse employee from group data
   * @private
   */
  static _parseEmployeeFromGroup(worksheet, group, month, year, UTILS) {
    const { timeRows, startCol } = group;
    const daysInMonth = UTILS.getDaysInMonth(month, year);
    
    // Create a generic employee (since the format shows times in rows, not per employee)
    const employees = [];
    
    // Parse daily data for each day of the month
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const col = startCol + day - 1;
      
      if (col > worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.c : 100) break;
      
      const isWeekend = UTILS.isWeekend(day, month, year);
      const dayName = UTILS.getDayName(day, month, year);
      
      // Get time data from respective rows
      const inTime1 = ExcelParserService._getTimeFromCell(worksheet, timeRows.inTime1Row, col, UTILS, 'in');
      const outTime1 = ExcelParserService._getTimeFromCell(worksheet, timeRows.outTime1Row, col, UTILS, 'out');
      const inTime2 = ExcelParserService._getTimeFromCell(worksheet, timeRows.inTime2Row, col, UTILS, 'in');
      const outTime2 = ExcelParserService._getTimeFromCell(worksheet, timeRows.outTime2Row, col, UTILS, 'out');
      
      // Determine status based on weekend and punch data
      let status = 'P'; // Default present
      if (isWeekend) {
        status = 'WO'; // Weekend off
      } else if (!inTime1 && !outTime1 && !inTime2 && !outTime2) {
        status = 'A'; // Absent
      }
      
      // Validate attendance using user's criteria
      let isValidAttendance = false;
      if (!isWeekend && status === 'P') {
        const hasValidPunchIn = inTime1 && UTILS.isValidPunchIn(inTime1);
        const hasValidPunchOut = (outTime1 && UTILS.isValidPunchOut(outTime1)) || 
                                (outTime2 && UTILS.isValidPunchOut(outTime2)) ||
                                (inTime2 && UTILS.isValidPunchOut(inTime2));
        
        isValidAttendance = hasValidPunchIn && hasValidPunchOut;
      }
      
      const dayRecord = {
        day: day,
        dayType: dayName,
        status: status,
        inTime1: inTime1,
        outTime1: outTime1,
        inTime2: inTime2,
        outTime2: outTime2,
        duration: '00:00',
        lateBy: null,
        earlyBy: null,
        overtime: null,
        shift: '',
        isValidAttendance: isValidAttendance,
        isWeekend: isWeekend
      };
      
      dailyData.push(dayRecord);
    }
    
    // Calculate summary
    const summary = ExcelParserService._calculateEmployeeSummaryFromDaily(dailyData);
    
    // Create employee object (since this format doesn't have individual employee names, create a generic one)
    const employee = {
      id: 'EMPLOYEE_001',
      name: 'Employee 1',
      department: 'General',
      summary: summary,
      dailyData: dailyData,
      month: month,
      year: year
    };
    
    return employee;
  }

  /**
   * Calculate employee summary from daily data
   * @private
   */
  static _calculateEmployeeSummaryFromDaily(dailyData) {
    let present = 0;
    let absent = 0;
    let weekendDays = 0;
    let totalLateMinutes = 0;
    let totalEarlyMinutes = 0;
    
    dailyData.forEach(day => {
      if (day.status === 'P') {
        present++;
      } else if (day.status === 'A') {
        absent++;
      } else if (day.status === 'WO') {
        weekendDays++;
      }
    });
    
    const workingDays = dailyData.length - weekendDays;
    
    return {
      present: present,
      absent: absent,
      weekendDays: weekendDays,
      workingDays: workingDays,
      lateByHours: ExcelParserService._minutesToHours(totalLateMinutes),
      earlyByHours: ExcelParserService._minutesToHours(totalEarlyMinutes)
    };
  }

  /**
   * Find employee in a specific row
   * @private
   */
  static _findEmployeeInRow(worksheet, row, maxCol) {
    // Look for employee ID patterns or employee names in the first few columns
    for (let col = 0; col <= Math.min(5, maxCol); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const value = cell.v.toString();
        
        // Check for employee ID patterns (numeric IDs)
        if (/^\\d{3,}$/.test(value)) {
          return true;
        }
        
        // Check for employee name patterns
        if (/^[A-Z][a-z]+\\s+[A-Z][a-z]+/.test(value)) {
          return true;
        }
        
        // Check for "Employee:" indicator
        if (value.includes('Employee:') || value.includes('EMP')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Parse employee from fixed format
   * @private
   */
  static _parseFixedFormatEmployee(worksheet, row, range, UTILS) {
    let employeeId = '';
    let employeeName = '';
    
    // Find employee ID and name in the row
    for (let col = 0; col <= Math.min(10, range.e.c); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const value = cell.v.toString().trim();
        
        // Look for ID patterns
        if (!employeeId && /^\\d{3,}$/.test(value)) {
          employeeId = value;
        }
        
        // Look for name patterns  
        if (!employeeName && /^[A-Z][a-z]+\\s+[A-Z][a-z]+/.test(value)) {
          employeeName = value;
        }
        
        // Handle "ID : Name" format
        if (value.includes(':')) {
          const parts = value.split(':').map(p => p.trim());
          if (parts.length === 2) {
            employeeId = parts[0];
            employeeName = parts[1];
            break;
          }
        }
      }
    }
    
    // Fallback values
    if (!employeeId) employeeId = `EMP${row}`;
    if (!employeeName) employeeName = employeeId;
    
    // Parse daily attendance data (look for time columns)
    const dailyData = ExcelParserService._parseFixedFormatDailyData(worksheet, row, range, UTILS);
    
    const employee = {
      id: employeeId,
      name: employeeName,
      department: 'General',
      summary: ExcelParserService._calculateEmployeeSummary(dailyData),
      dailyData: dailyData
    };
    
    return employee;
  }

  /**
   * Parse daily attendance data from fixed format
   * @private
   */
  static _parseFixedFormatDailyData(worksheet, employeeRow, range, UTILS) {
    const dailyData = [];
    const month = ATTENDANCE_CONFIG.REPORT_MONTH;
    const year = ATTENDANCE_CONFIG.REPORT_YEAR;
    
    // Look for InTime1, OutTime1, InTime2, OutTime2 rows
    const timeRows = {
      inTime1: -1,
      outTime1: -1,
      inTime2: -1,
      outTime2: -1
    };
    
    // Find the time data rows (usually within 10 rows of employee row)
    for (let r = employeeRow; r <= Math.min(employeeRow + 15, range.e.r); r++) {
      const firstColCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 0 })];
      
      if (firstColCell && firstColCell.v) {
        const value = firstColCell.v.toString().toLowerCase();
        
        if (value.includes('intime1') || value.includes('in time 1')) {
          timeRows.inTime1 = r;
        } else if (value.includes('outtime1') || value.includes('out time 1')) {
          timeRows.outTime1 = r;
        } else if (value.includes('intime2') || value.includes('in time 2')) {
          timeRows.inTime2 = r;
        } else if (value.includes('outtime2') || value.includes('out time 2')) {
          timeRows.outTime2 = r;
        }
      }
    }
    
    // Parse each day's data (assuming columns represent days)
    for (let day = 1; day <= 30; day++) { // June has 30 days
      const col = day + 1; // Assuming day columns start from column 2
      
      if (col > range.e.c) break;
      
      const isWeekend = UTILS.isWeekend(day, month, year);
      const dayName = UTILS.getDayName(day, month, year);
      
      const dayRecord = {
        day: day,
        dayType: dayName,
        status: isWeekend ? 'WO' : 'P', // Default to Present for weekdays, Weekend Off for weekends
        inTime1: ExcelParserService._getTimeFromCell(worksheet, timeRows.inTime1, col, UTILS, 'in'),
        outTime1: ExcelParserService._getTimeFromCell(worksheet, timeRows.outTime1, col, UTILS, 'out'),
        inTime2: ExcelParserService._getTimeFromCell(worksheet, timeRows.inTime2, col, UTILS, 'in'),
        outTime2: ExcelParserService._getTimeFromCell(worksheet, timeRows.outTime2, col, UTILS, 'out'),
        duration: '00:00',
        lateBy: null,
        earlyBy: null,
        overtime: null,
        shift: ''
      };
      
      // Determine actual status based on punch data
      if (!isWeekend) {
        if (!dayRecord.inTime1 && !dayRecord.outTime1) {
          dayRecord.status = 'A'; // Absent
        } else {
          dayRecord.status = 'P'; // Present
        }
      }
      
      dailyData.push(dayRecord);
    }
    
    return dailyData;
  }

  /**
   * Get time from cell with multiple time handling
   * @private
   */
  static _getTimeFromCell(worksheet, row, col, UTILS, type) {
    if (row === -1) return null;
    
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = worksheet[cellAddress];
    
    if (!cell || !cell.v) return null;
    
    const timeString = cell.v.toString().trim();
    
    // Handle multiple times using UTILS function
    return UTILS.parseMultipleTimes(timeString, type);
  }

  /**
   * Calculate employee summary from daily data
   * @private
   */
  static _calculateEmployeeSummary(dailyData) {
    let present = 0;
    let absent = 0;
    let totalLateMinutes = 0;
    let totalEarlyMinutes = 0;
    
    dailyData.forEach(day => {
      if (day.status === 'P') {
        present++;
      } else if (day.status === 'A') {
        absent++;
      }
      
      // Calculate late/early minutes (will be done in analyzer)
    });
    
    return {
      present: present,
      absent: absent,
      lateByHours: ExcelParserService._minutesToHours(totalLateMinutes),
      earlyByHours: ExcelParserService._minutesToHours(totalEarlyMinutes)
    };
  }

  /**
   * Convert minutes to HH:MM format
   * @private
   */
  static _minutesToHours(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Debug: Print Excel structure to understand format
   * @private
   */
  static _debugPrintStructure(worksheet, range) {
    console.log('=== EXCEL STRUCTURE DEBUG ===');
    for (let row = 0; row < Math.min(10, range.e.r + 1); row++) {
      const rowData = [];
      for (let col = 0; col < Math.min(10, range.e.c + 1); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        rowData.push(cell ? cell.v : '');
      }
      console.log(`Row ${row + 1}:`, rowData);
    }
    console.log('=== END DEBUG ===');
  }

  /**
   * Extract date columns flexibly - look for date patterns in multiple rows
   * @private
   */
  static _extractDateColumnsFlexible(worksheet, range) {
    const dateColumns = {};
    
    // Try different rows where dates might be located (rows 1-10)
    for (let dateRow = 0; dateRow < Math.min(10, range.e.r + 1); dateRow++) {
      const foundDates = ExcelParserService._tryExtractDatesFromRow(worksheet, range, dateRow);
      if (Object.keys(foundDates).length > 0) {
        console.log(`Found dates in row ${dateRow + 1}`);
        Object.assign(dateColumns, foundDates);
        break;
      }
    }
    
    // If no date pattern found, create generic column mapping
    if (Object.keys(dateColumns).length === 0) {
      console.log('No date pattern found, using generic column mapping');
      for (let col = 2; col <= Math.min(range.e.c, 40); col++) {
        dateColumns[col] = { day: col - 1, dayType: 'Day' };
      }
    }
    
    return dateColumns;
  }

  /**
   * Try to extract dates from a specific row
   * @private
   */
  static _tryExtractDatesFromRow(worksheet, range, row) {
    const dateColumns = {};
    
    for (let col = 2; col <= Math.min(range.e.c, 50); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const cellValue = cell.v.toString();
        
        // Try different date patterns
        const patterns = [
          /(\d+)\s+([A-Za-z]+)/,  // "1 Sat", "2 Sun"
          /(\d+)\/(\d+)/,          // "1/6", "2/6" 
          /(\d+)-([A-Za-z]+)/,     // "1-Jun", "2-Jun"
          /^(\d+)$/                // Just numbers "1", "2"
        ];
        
        for (const pattern of patterns) {
          const match = cellValue.match(pattern);
          if (match) {
            const day = parseInt(match[1]);
            const dayType = match[2] || 'Day';
            if (day >= 1 && day <= 31) {
              dateColumns[col] = { day, dayType };
              break;
            }
          }
        }
      }
    }
    
    return dateColumns;
  }

  /**
   * Extract all employees flexibly - look for employee patterns
   * @private
   */
  static _extractAllEmployeesFlexible(worksheet, range, dateColumns) {
    const employees = [];
    
    // Look for different employee indicators
    const employeeIndicators = ['Employee:', 'EMP', 'Name', 'ID'];
    
    for (let row = 0; row <= range.e.r; row++) {
      // Check different columns for employee indicators
      for (let col = 0; col <= Math.min(5, range.e.c); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          
          // Check if this looks like an employee indicator
          if (employeeIndicators.some(indicator => 
              cellValue.includes(indicator) || ExcelParserService._looksLikeEmployeeData(cellValue))) {
            
            const employee = ExcelParserService._parseEmployeeDataFlexible(worksheet, row, dateColumns, col);
            if (employee && !employees.some(emp => emp.id === employee.id)) {
              employees.push(employee);
              console.log(`Found employee: ${employee.name} (ID: ${employee.id})`);
            }
          }
        }
      }
    }
    
    return employees;
  }

  /**
   * Check if a cell value looks like employee data
   * @private
   */
  static _looksLikeEmployeeData(value) {
    // Look for patterns like "12345 : John Doe" or "EMP001" or employee names
    const patterns = [
      /^\d+\s*:\s*[A-Za-z\s]+$/,  // "12345 : John Doe"
      /^[A-Z]+\d+$/,               // "EMP001"
      /^\d{4,}$/,                  // Employee ID numbers
      /^[A-Z][a-z]+\s+[A-Z][a-z]+$/ // "John Doe" pattern
    ];
    
    return patterns.some(pattern => pattern.test(value.trim()));
  }

  /**
   * Parse employee data flexibly
   * @private
   */
  static _parseEmployeeDataFlexible(worksheet, row, dateColumns, startCol) {
    // Look for employee info in nearby cells
    let employeeId = '';
    let employeeName = '';
    
    // Try to find employee ID and name in current and nearby cells
    for (let col = startCol; col <= Math.min(startCol + 5, dateColumns ? Math.max(...Object.keys(dateColumns).map(Number)) : 10); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const value = cell.v.toString();
        
        // Try to parse "ID : Name" format
        if (value.includes(':')) {
          const [id, name] = value.split(':').map(s => s.trim());
          if (id && name) {
            employeeId = id;
            employeeName = name;
            break;
          }
        }
        
        // If looks like an ID, use it
        if (!employeeId && /^\d{3,}$/.test(value)) {
          employeeId = value;
        }
        
        // If looks like a name, use it
        if (!employeeName && /^[A-Za-z\s]{3,}$/.test(value)) {
          employeeName = value;
        }
      }
    }
    
    // Fallback values
    if (!employeeId) employeeId = `EMP${row}`;
    if (!employeeName) employeeName = employeeId;
    
    // Parse summary data (look in nearby rows and columns)
    const summary = ExcelParserService._parseSummaryDataFlexible(worksheet, row, startCol);
    
    const employee = {
      id: employeeId,
      name: employeeName,
      department: 'General',
      summary: summary,
      dailyData: []
    };
    
    // Parse daily attendance data
    if (dateColumns && Object.keys(dateColumns).length > 0) {
      Object.entries(dateColumns).forEach(([colIndex, dateInfo]) => {
        const col = parseInt(colIndex);
        const { day, dayType } = dateInfo;
        
        const dailyRecord = ExcelParserService._parseDailyRecordFlexible(worksheet, row, col, day, dayType);
        employee.dailyData.push(dailyRecord);
      });
    }
    
    return employee;
  }

  /**
   * Parse summary data flexibly
   * @private
   */
  static _parseSummaryDataFlexible(worksheet, row, startCol) {
    let summary = {
      present: 0,
      absent: 0,
      lateByHours: '00:00',
      earlyByHours: '00:00'
    };
    
    // Look in a wider range for summary data
    for (let r = row; r <= Math.min(row + 15, row + 15); r++) {
      for (let c = startCol; c <= Math.min(startCol + 10, startCol + 10); c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const value = cell.v.toString();
          
          // Look for summary patterns
          const presentMatch = value.match(/Present:\s*(\d+)/i);
          const absentMatch = value.match(/Absent:\s*(\d+)/i);
          const lateMatch = value.match(/Late.*?:\s*([\d:]+)/i);
          const earlyMatch = value.match(/Early.*?:\s*([\d:]+)/i);
          
          if (presentMatch) summary.present = parseInt(presentMatch[1]);
          if (absentMatch) summary.absent = parseInt(absentMatch[1]);
          if (lateMatch) summary.lateByHours = lateMatch[1];
          if (earlyMatch) summary.earlyByHours = earlyMatch[1];
        }
      }
    }
    
    return summary;
  }

  /**
   * Parse daily record flexibly
   * @private
   */
  static _parseDailyRecordFlexible(worksheet, row, col, day, dayType) {
    const dailyRecord = {
      day: day,
      dayType: dayType,
      status: '',
      inTime1: null,
      outTime1: null,
      inTime2: null,
      outTime2: null,
      duration: '00:00',
      lateBy: null,
      earlyBy: null,
      overtime: null,
      shift: ''
    };
    
    // Look in multiple rows below the employee row for attendance data
    for (let r = row; r <= Math.min(row + 15, worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.r : row + 15); r++) {
      const cellAddress = XLSX.utils.encode_cell({ r: r, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const value = cell.v.toString().trim();
        
        // Try to identify what type of data this is
        if (value.match(/^[AHP]$|^WO$/)) {
          dailyRecord.status = value;
        } else if (value.match(/^\d{1,2}:\d{2}/) || value.match(/^\d{1,2}\.\d{2}/)) {
          // Time data - assign to first available time slot
          if (!dailyRecord.inTime1) {
            dailyRecord.inTime1 = value;
          } else if (!dailyRecord.outTime1) {
            dailyRecord.outTime1 = value;
          } else if (!dailyRecord.inTime2) {
            dailyRecord.inTime2 = value;
          } else if (!dailyRecord.outTime2) {
            dailyRecord.outTime2 = value;
          }
        } else if (value.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
          // Duration data
          dailyRecord.duration = value;
        }
      }
    }
    
    return dailyRecord;
  }

  // Keep the original methods for backward compatibility
  static _extractDateColumns(worksheet, range) {
    const dateColumns = {};
    const daysRow = 5; // Row 6 (0-indexed = 5)
    
    for (let col = 2; col <= Math.min(range.e.c, 50); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: daysRow, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v && typeof cell.v === 'string') {
        const dayMatch = cell.v.match(/(\d+)\s+([A-Za-z]+)/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          const dayType = dayMatch[2];
          dateColumns[col] = { day, dayType };
        }
      }
    }
    
    console.log('Date columns found:', Object.keys(dateColumns).length);
    return dateColumns;
  }

  static _findINNDepartmentRow(worksheet, range) {
    for (let row = 0; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 4 }); // Column E
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v && cell.v.toString().toUpperCase() === 'INN') {
        console.log(`Found INN department at row ${row + 1}`);
        return row;
      }
    }
    return -1;
  }

  static _extractINNEmployees(worksheet, range, dateColumns, startRow) {
    const employees = [];
    let currentRow = startRow + 2; // Start after department header and empty row
    
    while (currentRow < range.e.r) {
      const employeeCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: 0 })];
      
      if (!employeeCell || employeeCell.v !== 'Employee:') {
        break; // End of INN department
      }
      
      const employee = ExcelParserService._parseEmployeeData(worksheet, currentRow, dateColumns, ATTENDANCE_CONFIG.DEPARTMENT_NAME);
      if (employee) {
        employees.push(employee);
        console.log(`Parsed employee: ${employee.name} (ID: ${employee.id})`);
      }
      
      currentRow += 12; // Move to next employee block
    }
    
    return employees;
  }

  static _extractAllEmployees(worksheet, range, dateColumns) {
    const employees = [];
    
    for (let row = 0; row <= range.e.r; row += 12) {
      const employeeCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      
      if (employeeCell && employeeCell.v === 'Employee:') {
        const employee = ExcelParserService._parseEmployeeData(worksheet, row, dateColumns, 'General');
        if (employee) {
          employees.push(employee);
          console.log(`Parsed employee: ${employee.name} (ID: ${employee.id})`);
        }
      }
    }
    
    return employees;
  }

  static _parseEmployeeData(worksheet, row, dateColumns, department) {
    const employeeInfoCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
    if (!employeeInfoCell || !employeeInfoCell.v) {
      return null;
    }
    
    const employeeInfo = employeeInfoCell.v.toString();
    const [employeeId, employeeName] = employeeInfo.split(' : ');
    
    // Get summary from column I
    const summaryCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 8 })];
    const summaryText = summaryCell ? summaryCell.v.toString() : '';
    
    // Parse summary statistics
    const presentMatch = summaryText.match(/Present:\s*(\d+)/);
    const absentMatch = summaryText.match(/Absent:\s*(\d+)/);
    const lateByHrsMatch = summaryText.match(/Late By Hrs:\s*([\d:]+)/);
    const earlyByHrsMatch = summaryText.match(/Early By Hrs:\s*([\d:]+)/);
    
    const employee = {
      id: employeeId ? employeeId.trim() : `EMP${row}`,
      name: employeeName ? employeeName.trim() : employeeId ? employeeId.trim() : `Employee ${row}`,
      department: department,
      summary: {
        present: presentMatch ? parseInt(presentMatch[1]) : 0,
        absent: absentMatch ? parseInt(absentMatch[1]) : 0,
        lateByHours: lateByHrsMatch ? lateByHrsMatch[1] : '00:00',
        earlyByHours: earlyByHrsMatch ? earlyByHrsMatch[1] : '00:00'
      },
      dailyData: []
    };
    
    // Parse daily attendance data
    Object.entries(dateColumns).forEach(([colIndex, dateInfo]) => {
      const col = parseInt(colIndex);
      const { day, dayType } = dateInfo;
      
      const dailyRecord = ExcelParserService._parseDailyRecord(worksheet, row, col, day, dayType);
      employee.dailyData.push(dailyRecord);
    });
    
    return employee;
  }

  static _parseDailyRecord(worksheet, row, col, day, dayType) {
    return {
      day: day,
      dayType: dayType,
      status: worksheet[XLSX.utils.encode_cell({ r: row + 1, c: col })]?.v || '',
      inTime1: worksheet[XLSX.utils.encode_cell({ r: row + 2, c: col })]?.v || null,
      outTime1: worksheet[XLSX.utils.encode_cell({ r: row + 3, c: col })]?.v || null,
      inTime2: worksheet[XLSX.utils.encode_cell({ r: row + 4, c: col })]?.v || null,
      outTime2: worksheet[XLSX.utils.encode_cell({ r: row + 5, c: col })]?.v || null,
      duration: worksheet[XLSX.utils.encode_cell({ r: row + 6, c: col })]?.v || '00:00',
      lateBy: worksheet[XLSX.utils.encode_cell({ r: row + 7, c: col })]?.v || null,
      earlyBy: worksheet[XLSX.utils.encode_cell({ r: row + 8, c: col })]?.v || null,
      overtime: worksheet[XLSX.utils.encode_cell({ r: row + 9, c: col })]?.v || null,
      shift: worksheet[XLSX.utils.encode_cell({ r: row + 10, c: col })]?.v || ''
    };
  }

  static isFourPunchFormat(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const titleCell = worksheet['B1'];
    
    return titleCell && titleCell.v && 
           titleCell.v.toString().includes('Four Punch');
  }

  /**
   * Parse Four Punch data but filter for INN Department only
   * @param {Object} workbook - XLSX workbook object
   * @returns {Array} Array of INN department employee data only
   */
  static parseFourPunchDataINNOnly(workbook) {
    console.log('🎯 Parsing Four Punch data with INN department filter...');
    
    // First try the standard INN parsing
    try {
      const innEmployees = ExcelParserService.parseINNDepartmentData(workbook);
      if (innEmployees && innEmployees.length > 0) {
        console.log(`✅ Found ${innEmployees.length} INN employees using standard INN parsing`);
        return innEmployees;
      }
    } catch (error) {
      console.log('Standard INN parsing failed, trying alternative approach...');
    }
    
    // If standard INN parsing fails, try generic parsing with filtering
    try {
      const allEmployees = ExcelParserService.parseFourPunchData(workbook);
      console.log(`Found ${allEmployees.length} total employees, filtering for INN...`);
      
      // Filter for INN department employees
      const innEmployees = allEmployees.filter(emp => {
        // Check multiple ways an employee might be marked as INN
        const isINN = emp.department && emp.department.toUpperCase().includes('INN');
        const nameHasINN = emp.name && emp.name.toUpperCase().includes('INN');
        const idHasINN = emp.id && emp.id.toString().toUpperCase().includes('INN');
        
        if (isINN || nameHasINN || idHasINN) {
          console.log(`✅ INN employee found: ${emp.name} (${emp.id}) - Department: ${emp.department}`);
          return true;
        }
        return false;
      });
      
      // Ensure all filtered employees are marked as INN department
      return innEmployees.map(emp => ({
        ...emp,
        department: 'INN'
      }));
      
    } catch (error) {
      console.log('Generic parsing with INN filter failed, trying manual extraction...');
      return ExcelParserService.extractINNFromGenericFormat(workbook);
    }
  }

  /**
   * Extract INN department employees from generic Excel format
   * Fallback method when other parsing methods don't find INN employees
   * @param {Object} workbook - XLSX workbook object
   * @returns {Array} Array of INN department employee data only
   */
  static extractINNFromGenericFormat(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log('🔍 Attempting manual INN extraction from generic format...');
    
    // First, try to find the INN department section
    const innDepartmentRow = ExcelParserService._findINNDepartmentRow(worksheet, range);
    
    if (innDepartmentRow === -1) {
      console.log('❌ No INN department section found in the file');
      return [];
    }
    
    console.log(`✅ Found INN department at row ${innDepartmentRow + 1}`);
    
    // Use the existing INN extraction logic
    const { UTILS } = require('../utils/constants');
    
    // Parse day headers if available
    let dayHeaders = {};
    try {
      dayHeaders = ExcelParserService._parseDayHeaders(worksheet, range, 
        ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR);
    } catch (error) {
      console.log('Could not parse day headers, using fallback method');
      // Create generic day headers
      for (let col = 2; col <= Math.min(35, range.e.c); col++) {
        dayHeaders[col] = {
          day: col - 1,
          dayAbbr: 'D',
          dayName: 'Day',
          isWeekend: false
        };
      }
    }
    
    // Extract INN employees using existing logic
    const employees = ExcelParserService._extractINNEmployeesOnly(
      worksheet, innDepartmentRow, dayHeaders, 
      ATTENDANCE_CONFIG.REPORT_MONTH, ATTENDANCE_CONFIG.REPORT_YEAR, UTILS
    );
    
    console.log(`🎯 Manual INN extraction result: ${employees.length} employees found`);
    return employees;
  }
}

module.exports = ExcelParserService;
