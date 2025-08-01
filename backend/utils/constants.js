// Constants and configuration values
const ATTENDANCE_CONFIG = {
  CHECK_IN_TIME: '10:01',
  CHECK_OUT_TIME: '18:30', 
  DEPARTMENT_NAME: 'INN',
  EXCEL_FILE_PATH: 'C:\Users\Rizvi\Downloads\Jun2025.xlsx',
  MAX_MORNING_PUNCHES: 2,
  SEVERITY_THRESHOLD_MINUTES: 30,
  REPORT_MONTH: 6, // June
  REPORT_YEAR: 2025
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
   */
  isWeekend: (day, month, year) => {
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  },

  /**
   * Get day name for a date
   */
  getDayName: (day, month, year) => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  },

  /**
   * Parse multiple time values and return the appropriate ones
   */
  parseMultipleTimes: (timeString, type = 'in') => {
    if (!timeString || typeof timeString !== 'string') return null;
    
    const times = timeString.toString().trim().split(/\s+/).filter(t => t.match(/^\d{1,2}:\d{2}$/));
    
    if (times.length === 0) return null;
    
    // For punch-in, take the first (earliest) time
    // For punch-out, take the last (latest) time
    return type === 'in' ? times[0] : times[times.length - 1];
  },

  /**
   * Check if time is valid punch-in (before 10:01)
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
   */
  isValidPunchOut: (timeString) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    const cutoffMinutes = 18 * 60 + 30; // 18:30
    return timeMinutes >= cutoffMinutes;
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
