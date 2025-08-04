// Constants and configuration values
const ATTENDANCE_CONFIG = {
  CHECK_IN_TIME: '10:01',
  CHECK_OUT_TIME: '18:30', 
  DEPARTMENT_NAME: 'INN', // Focus only on INN department
  EXCEL_FILE_PATH: 'C:\Users\Rizvi\Downloads\July2025.xlsx', // Updated to correct path
  MAX_MORNING_PUNCHES: 2,
  SEVERITY_THRESHOLD_MINUTES: 30,
  REPORT_MONTH: 7, // July (will be auto-detected from file)
  REPORT_YEAR: 2025, // Will be auto-detected from file
  // Support dynamic month/year detection from file name and content
  AUTO_DETECT_MONTH_YEAR: true,
  // INN Department specific settings
  PROCESS_ONLY_INN: true // Only process INN department employees
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
