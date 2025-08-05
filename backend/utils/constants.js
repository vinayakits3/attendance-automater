// INN DEPARTMENT WEEKDAYS-ONLY ATTENDANCE SYSTEM CONFIGURATION
// INN DEPARTMENT WEEKDAYS-ONLY ATTENDANCE SYSTEM CONFIGURATION - PUNCH BASED LOGIC
const ATTENDANCE_CONFIG = {
  // NEW PUNCH-BASED BUSINESS RULES FOR INN DEPARTMENT
  CHECK_IN_TIME: '10:01', // Late if MIN time in day column > 10:01
  CHECK_OUT_TIME: '18:15', // Early departure if MAX time in day column < 18:15
  DEPARTMENT_NAME: 'INN', // DEDICATED TO INN DEPARTMENT ONLY
  EXCEL_FILE_PATH: 'C:/Users/vin1i/Downloads/July2025.xlsx', // Specific INN department file
  
  // INN DEPARTMENT EXCEL STRUCTURE
  INN_DEPARTMENT_END_ROW: 904, // Row 905 (0-indexed: 904) is where another department starts
  INN_BOUNDARY_NOTE: 'Above row 905 starts another department - process only INN employees before row 905',
  
  // PUNCH-BASED CALCULATION RULES
  PUNCH_BASED_ATTENDANCE: true, // NEW: Use punch times, not status codes
  ATTENDANCE_COLUMNS: { // NEW: Column range for daily punch data
    START: 'C', // Column C (index 2)
    END: 'AJ',  // Column AJ (index 35)
    START_INDEX: 2,
    END_INDEX: 35
  },
  
  // NEW ATTENDANCE CRITERIA (PUNCH-BASED) - UPDATED WITH DURATION-BASED RULES
  PRESENCE_RULE: 'AT_LEAST_ONE_PUNCH', // At least 1 punch time = Present
  ABSENCE_RULE: 'NO_PUNCH_TIMES', // No punch times = Absent
  
  // NEW TIMING CATEGORY RULES
  REGULAR_TIMING_START: '09:30', // Regular timing window start
  REGULAR_TIMING_END: '10:01',   // Regular timing window end
  REGULAR_REQUIRED_HOURS: 8.75,  // 8 hours 45 minutes for regular timing
  UNUSUAL_REQUIRED_HOURS: 9,     // 9 hours for unusual timing
  
  // TIMING DETERMINATION RULE
  TIMING_RULE: 'FIRST_PUNCH_DETERMINES_CATEGORY', // First punch determines Regular vs Unusual timing
  DURATION_RULE: 'FIRST_TO_LAST_PUNCH', // Duration = last punch - first punch
  
  // STATUS DETERMINATION
  FULL_DAY_RULE: 'MEETS_REQUIRED_HOURS', // Full day if duration >= required hours
  HALF_DAY_RULE: 'BELOW_REQUIRED_HOURS', // Half day if duration < required hours
  
  MAX_MORNING_PUNCHES: 2,
  SEVERITY_THRESHOLD_MINUTES: 30,
  REPORT_MONTH: 7, // July (will be auto-detected from file)
  REPORT_YEAR: 2025, // Will be auto-detected from file
  
  // CORE SYSTEM IDENTITY - INN DEPARTMENT + WEEKDAYS ONLY + DURATION-BASED PUNCH LOGIC
  SYSTEM_NAME: 'INN Department Duration-Based Punch Attendance Automater',
  SYSTEM_DESCRIPTION: 'Advanced attendance system for INN department with duration-based Full/Half day determination. Regular timing (9:30-10:01 AM) requires 8h45m, Unusual timing requires 9h. Uses first-to-last punch duration calculation. Processes only weekdays.',
  DEPARTMENT_FOCUS: 'INN_ONLY', // System is exclusively dedicated to INN department
  WORKING_DAYS: 'WEEKDAYS_ONLY', // Only Monday-Friday count as working days
  WEEKEND_POLICY: 'AUTO_EXCLUDE', // Automatically exclude weekends from all calculations
  CALCULATION_METHOD: 'PUNCH_BASED', // NEW: Use punch times for attendance determination
  
  // PROCESSING CONFIGURATION
  AUTO_DETECT_MONTH_YEAR: true,
  PROCESS_ONLY_INN: true, // Hard-coded to process only INN department
  CALCULATE_WEEKDAYS_ONLY: true, // Hard-coded to calculate weekdays only
  EXCLUDE_WEEKENDS: true, // Always exclude weekends
  USE_PUNCH_LOGIC: true, // NEW: Use punch-based logic instead of status codes
  
  // EXCEL DAY ABBREVIATIONS (from row 6)
  WEEKDAY_ABBRS: ['M', 'T', 'W', 'Th', 'F'], // Monday to Friday - INCLUDED
  WEEKEND_ABBRS: ['St', 'S'], // Saturday and Sunday - EXCLUDED
  
  // NEW SYSTEM MESSAGES FOR PUNCH-BASED LOGIC
  PROCESSING_NOTE: 'This system exclusively processes INN department employees using punch-based attendance calculation. Only weekdays (Monday-Friday) are counted. Attendance is determined by actual punch times in columns C to AJ, not status codes.',
  WEEKEND_NOTE: 'Weekend days (Saturday, Sunday) are automatically excluded from all attendance analysis.',
  DEPARTMENT_NOTE: 'This system is dedicated to INN department only. Processing stops at row 905 where another department begins.',
  PUNCH_LOGIC_NOTE: 'Duration-based attendance: Regular timing (9:30-10:01 AM) needs 8h45m for Full Day, Unusual timing needs 9h. Duration = last punch - first punch. Below required hours = Half Day.'
};

const FILE_CONFIG = {
  UPLOAD_DIR: 'uploads/',
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls'],
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};

const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

const ISSUE_TYPES = {
  ABSENT: 'ABSENT',
  MISSING_PUNCH_IN: 'MISSING_PUNCH_IN',
  MISSING_PUNCH_OUT: 'MISSING_PUNCH_OUT',
  LATE_ARRIVAL: 'LATE_ARRIVAL',
  EARLY_DEPARTURE: 'EARLY_DEPARTURE',
  INCOMPLETE_SHIFT: 'INCOMPLETE_SHIFT',
  MISSING_LUNCH_OUT: 'MISSING_LUNCH_OUT',
  MISSING_LUNCH_IN: 'MISSING_LUNCH_IN'
};

const SEVERITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium'
};

// Utility functions
const UTILS = {
  /**
   * Check if a date is weekend (Saturday or Sunday)
   * @param {number} day - Day of the month (1-31)
   * @param {number} month - Month (1-12)
   * @param {number} year - Full year (e.g., 2025)
   * @returns {boolean} - True if weekend
   */
  isWeekend: (day, month, year) => {
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  },

  /**
   * Get day name for a date
   * @param {number} day - Day of the month
   * @param {number} month - Month (1-12)
   * @param {number} year - Full year
   * @returns {string} - Day name (e.g., 'Sat', 'Sun')
   */
  getDayName: (day, month, year) => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  },

  /**
   * Extract month and year from filename
   * @param {string} filename - Excel filename (e.g., "Jun2025.xlsx")
   * @returns {object} - {month: number, year: number}
   */
  extractMonthYearFromFilename: (filename) => {
    const monthNames = {
      'jan': 1, 'january': 1,
      'feb': 2, 'february': 2,
      'mar': 3, 'march': 3,
      'apr': 4, 'april': 4,
      'may': 5,
      'jun': 6, 'june': 6,
      'jul': 7, 'july': 7,
      'aug': 8, 'august': 8,
      'sep': 9, 'september': 9,
      'oct': 10, 'october': 10,
      'nov': 11, 'november': 11,
      'dec': 12, 'december': 12
    };

    const matches = filename.toLowerCase().match(/([a-z]+)(\d{4})/);
    if (matches) {
      const monthStr = matches[1];
      const year = parseInt(matches[2]);
      const month = monthNames[monthStr];
      if (month && year) {
        return { month, year };
      }
    }

    // Fallback to current date
    const now = new Date();
    return { 
      month: now.getMonth() + 1, 
      year: now.getFullYear() 
    };
  },

  /**
   * Parse multiple time values and return the appropriate ones for attendance validation
   * Handles double punch-ins/outs by selecting first punch-in and last punch-out
   * @param {string} timeString - String containing one or more times
   * @param {string} type - 'in' or 'out' to determine which time to select
   * @returns {string|null} - Selected time or null
   */
  parseMultipleTimes: (timeString, type = 'in') => {
    if (!timeString || typeof timeString !== 'string') return null;
    
    // Split by spaces and find all time patterns (HH:MM or HH.MM)
    const times = timeString.toString().trim()
      .split(/\s+/)
      .map(t => t.replace('.', ':')) // Convert HH.MM to HH:MM
      .filter(t => t.match(/^\d{1,2}:\d{2}$/))
      .sort(); // Sort times chronologically
    
    if (times.length === 0) return null;
    
    // For punch-in (InTime1, InTime2), take the first (earliest) time
    // For punch-out (OutTime1, OutTime2), take the last (latest) time
    return type === 'in' ? times[0] : times[times.length - 1];
  },

  /**
   * Check if time is valid punch-in (before 10:01)
   * @param {string} timeString - Time in HH:MM format
   * @returns {boolean} - True if valid punch-in time
   */
  isValidPunchIn: (timeString) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    const cutoffMinutes = 10 * 60 + 1; // 10:01
    return timeMinutes <= cutoffMinutes;
  },

  /**
   * Check if time is valid punch-out (after 18:30)
   * @param {string} timeString - Time in HH:MM format
   * @returns {boolean} - True if valid punch-out time
   */
  isValidPunchOut: (timeString) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    const cutoffMinutes = 18 * 60 + 30; // 18:30
    return timeMinutes >= cutoffMinutes;
  },

  /**
   * Get the number of days in a month
   * @param {number} month - Month (1-12)
   * @param {number} year - Full year
   * @returns {number} - Number of days in the month
   */
  getDaysInMonth: (month, year) => {
    return new Date(year, month, 0).getDate();
  },

  /**
   * Parse attendance status and handle weekend/holiday detection
   * @param {string} status - Original status from Excel
   * @param {number} day - Day of the month
   * @param {number} month - Month (1-12)
   * @param {number} year - Full year
   * @returns {string} - Processed status (P, A, WO, H)
   */
  processAttendanceStatus: (status, day, month, year) => {
    // If it's a weekend, automatically mark as WO (Weekend Off)
    if (UTILS.isWeekend(day, month, year)) {
      return 'WO';
    }

    // If status is empty or null, default to Present for weekdays
    if (!status || status.toString().trim() === '') {
      return 'P';
    }

    // Return the original status for other cases
    return status.toString().trim().toUpperCase();
  },

  /**
   * NEW PUNCH-BASED UTILITY FUNCTIONS FOR INN DEPARTMENT
   */

  /**
   * Extract all punch times from a day's column data
   * @param {Object} worksheet - Excel worksheet object
   * @param {number} startRow - Employee block start row
   * @param {number} col - Column index for the day
   * @returns {Array} - Array of valid punch times found in the column
   */
  extractDayPunchTimes: (worksheet, startRow, col) => {
    const XLSX = require('xlsx');
    const punchTimes = [];
    
    // Check all rows in the employee block for punch times (rows 2-11 of the block)
    for (let rowOffset = 2; rowOffset <= 11; rowOffset++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: startRow + rowOffset, c: col })];
      if (cell && cell.v) {
        const cellValue = cell.v.toString().trim();
        // Parse potential time values from the cell
        const times = UTILS.parseAllTimesFromCell(cellValue);
        punchTimes.push(...times);
      }
    }
    
    // Remove duplicates and invalid times
    const validTimes = [...new Set(punchTimes)]
      .filter(time => UTILS.isValidTimeFormat(time))
      .sort(); // Sort chronologically
    
    return validTimes;
  },

  /**
   * Parse all time values from a cell (handles multiple times in one cell)
   * @param {string} cellValue - Raw cell content
   * @returns {Array} - Array of time strings
   */
  parseAllTimesFromCell: (cellValue) => {
    if (!cellValue) return [];
    
    // Regular expression to find time patterns (HH:MM or H:MM)
    const timePattern = /\b(\d{1,2}):(\d{2})\b/g;
    const times = [];
    let match;
    
    while ((match = timePattern.exec(cellValue)) !== null) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      
      // Validate time values
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        // Format as HH:MM
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        times.push(formattedTime);
      }
    }
    
    return times;
  },

  /**
   * Check if a string is a valid time format
   * @param {string} timeString - Time string to validate
   * @returns {boolean} - True if valid time format
   */
  isValidTimeFormat: (timeString) => {
    if (!timeString || typeof timeString !== 'string') return false;
    
    const timePattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timePattern.test(timeString.trim());
  },

  /**
   * Calculate punch-based attendance status with duration-based Full/Half day determination
   * @param {Array} punchTimes - Array of punch times for the day
   * @param {boolean} isWeekend - Whether the day is a weekend
   * @returns {Object} - Attendance status object
   */
  calculatePunchBasedStatus: (punchTimes, isWeekend) => {
    // Weekend handling
    if (isWeekend) {
      return {
        status: 'WO',
        isPresent: false,
        timingCategory: null,
        workDuration: 0,
        requiredHours: 0,
        isFullDay: false,
        note: 'Weekend - excluded from attendance calculation'
      };
    }

    // No punch times = Absent
    if (!punchTimes || punchTimes.length === 0) {
      return {
        status: 'A',
        isPresent: false,
        timingCategory: null,
        workDuration: 0,
        requiredHours: 0,
        isFullDay: false,
        note: 'No punch times found - Absent'
      };
    }

    // Has punch times = Present, now determine Full Day vs Half Day
    const sortedTimes = [...punchTimes].sort();
    const firstPunch = sortedTimes[0]; // Check-in time
    const lastPunch = sortedTimes[sortedTimes.length - 1]; // Check-out time

    // Determine timing category based on first punch time
    const timingCategory = UTILS.determineTimingCategory(firstPunch);
    
    // Calculate work duration (first punch to last punch)
    const workDuration = UTILS.calculateWorkDuration(firstPunch, lastPunch);
    
    // Get required hours based on timing category
    const requiredHours = timingCategory === 'REGULAR' 
      ? ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS 
      : ATTENDANCE_CONFIG.UNUSUAL_REQUIRED_HOURS;
    
    // Determine if it's a full day or half day
    const isFullDay = workDuration >= requiredHours;
    const dayType = isFullDay ? 'Full Day' : 'Half Day';

    return {
      status: 'P',
      isPresent: true,
      timingCategory: timingCategory,
      workDuration: workDuration,
      requiredHours: requiredHours,
      isFullDay: isFullDay,
      dayType: dayType,
      firstPunch: firstPunch,
      lastPunch: lastPunch,
      totalPunches: punchTimes.length,
      note: `${dayType} - ${timingCategory} timing (${workDuration.toFixed(2)}h of ${requiredHours}h required)`,
      punchTimes: punchTimes
    };
  },

  /**
   * Check if time1 is after time2
   * @param {string} time1 - First time (HH:MM)
   * @param {string} time2 - Second time (HH:MM)
   * @returns {boolean} - True if time1 > time2
   */
  isTimeAfter: (time1, time2) => {
    if (!time1 || !time2) return false;
    
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    
    return minutes1 > minutes2;
  },

  /**
   * Check if time1 is before time2
   * @param {string} time1 - First time (HH:MM)
   * @param {string} time2 - Second time (HH:MM)
   * @returns {boolean} - True if time1 < time2
   */
  isTimeBefore: (time1, time2) => {
    if (!time1 || !time2) return false;
    
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    
    return minutes1 < minutes2;
  },

  /**
   * Calculate late minutes for punch-based system
   * @param {string} actualTime - Actual punch time
   * @param {string} expectedTime - Expected time threshold
   * @returns {number} - Minutes late (0 if not late)
   */
  calculateLateMinutesPunchBased: (actualTime, expectedTime) => {
    if (!actualTime || !expectedTime) return 0;
    
    const [ah, am] = actualTime.split(':').map(Number);
    const [eh, em] = expectedTime.split(':').map(Number);
    
    const actualMinutes = ah * 60 + am;
    const expectedMinutes = eh * 60 + em;
    
    return Math.max(0, actualMinutes - expectedMinutes);
  },

  /**
   * Determine timing category based on first punch time
   * @param {string} firstPunchTime - First punch time of the day (HH:MM)
   * @returns {string} - 'REGULAR' or 'UNUSUAL'
   */
  determineTimingCategory: (firstPunchTime) => {
    if (!firstPunchTime) return 'UNUSUAL';
    
    const regularStart = ATTENDANCE_CONFIG.REGULAR_TIMING_START; // '09:30'
    const regularEnd = ATTENDANCE_CONFIG.REGULAR_TIMING_END;     // '10:01'
    
    // Check if first punch is within regular timing window (9:30 AM - 10:01 AM)
    const isAfterRegularStart = UTILS.isTimeAfter(firstPunchTime, regularStart) || firstPunchTime === regularStart;
    const isBeforeRegularEnd = UTILS.isTimeBefore(firstPunchTime, regularEnd) || firstPunchTime === regularEnd;
    
    return (isAfterRegularStart && isBeforeRegularEnd) ? 'REGULAR' : 'UNUSUAL';
  },

  /**
   * Calculate work duration in hours from first punch to last punch
   * @param {string} firstPunch - First punch time (HH:MM)
   * @param {string} lastPunch - Last punch time (HH:MM)
   * @returns {number} - Work duration in hours (decimal)
   */
  calculateWorkDuration: (firstPunch, lastPunch) => {
    if (!firstPunch || !lastPunch) return 0;
    
    const [fh, fm] = firstPunch.split(':').map(Number);
    const [lh, lm] = lastPunch.split(':').map(Number);
    
    const firstMinutes = fh * 60 + fm;
    const lastMinutes = lh * 60 + lm;
    
    // Calculate difference in minutes
    let durationMinutes = lastMinutes - firstMinutes;
    
    // Handle case where last punch is next day (unlikely but possible)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Add 24 hours
    }
    
    // Convert to hours (decimal)
    return durationMinutes / 60;
  },

  /**
   * Convert decimal hours to hours and minutes format
   * @param {number} decimalHours - Duration in decimal hours
   * @returns {string} - Formatted duration (e.g., "8h 45m")
   */
  formatDuration: (decimalHours) => {
    if (!decimalHours || decimalHours <= 0) return '0h 0m';
    
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  },

  /**
   * Get timing category details for display
   * @param {string} category - 'REGULAR' or 'UNUSUAL'
   * @returns {Object} - Category details
   */
  getTimingCategoryDetails: (category) => {
    if (category === 'REGULAR') {
      return {
        name: 'Regular Timing',
        window: '9:30 AM - 10:01 AM',
        requiredHours: ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS,
        requiredDuration: UTILS.formatDuration(ATTENDANCE_CONFIG.REGULAR_REQUIRED_HOURS)
      };
    } else {
      return {
        name: 'Unusual Timing',
        window: 'Before 9:30 AM or After 10:01 AM',
        requiredHours: ATTENDANCE_CONFIG.UNUSUAL_REQUIRED_HOURS,
        requiredDuration: UTILS.formatDuration(ATTENDANCE_CONFIG.UNUSUAL_REQUIRED_HOURS)
      };
    }
  }
};

module.exports = {
  ATTENDANCE_CONFIG,
  FILE_CONFIG,
  SERVER_CONFIG,
  ISSUE_TYPES,
  SEVERITY_LEVELS,
  UTILS
};
