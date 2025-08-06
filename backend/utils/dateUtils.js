const { ATTENDANCE_CONFIG } = require('./constants');

/**
 * Date Utilities Service
 * Handles all date-related operations and calculations
 */
class DateUtils {
  /**
   * Parse time string to minutes since midnight
   * @param {string} timeString - Time in HH:MM format
   * @returns {number} Minutes since midnight
   */
  static parseTime(timeString) {
    if (!timeString || typeof timeString !== 'string') {
      return 0;
    }

    const cleanTime = timeString.toString().trim();
    
    // Handle different time formats
    let hours = 0;
    let minutes = 0;

    if (cleanTime.includes(':')) {
      const parts = cleanTime.split(':');
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
    } else if (cleanTime.length === 4) {
      // Handle HHMM format
      hours = parseInt(cleanTime.substring(0, 2)) || 0;
      minutes = parseInt(cleanTime.substring(2, 4)) || 0;
    }

    return (hours * 60) + minutes;
  }

  /**
   * Convert minutes since midnight back to HH:MM format
   * @param {number} minutes - Minutes since midnight
   * @returns {string} Time in HH:MM format
   */
  static formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate work hours between two time strings
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {number} Work hours (decimal)
   */
  static calculateWorkHours(startTime, endTime) {
    if (!startTime || !endTime) {
      return 0;
    }

    const startMinutes = this.parseTime(startTime);
    const endMinutes = this.parseTime(endTime);
    
    let totalMinutes = endMinutes - startMinutes;
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours
    }

    return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check if a date is a weekend
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if weekend
   */
  static isWeekend(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Check if a date is a holiday
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if holiday
   */
  static isHoliday(date) {
    // This can be expanded to include actual holiday logic
    // For now, return false as holidays are typically marked in the Excel data
    return false;
  }

  /**
   * Get day of week name
   * @param {string|Date} date - Date to check
   * @returns {string} Day name (Monday, Tuesday, etc.)
   */
  static getDayOfWeek(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getDay()];
  }

  /**
   * Get short day of week name
   * @param {string|Date} date - Date to check
   * @returns {string} Short day name (Mon, Tue, etc.)
   */
  static getShortDayOfWeek(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dateObj.getDay()];
  }

  /**
   * Check if date is a working day (weekday, not holiday)
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if working day
   */
  static isWorkingDay(date) {
    return !this.isWeekend(date) && !this.isHoliday(date);
  }

  /**
   * Get all working days in a month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Array} Array of working day dates
   */
  static getWorkingDaysInMonth(year, month) {
    const workingDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      if (this.isWorkingDay(date)) {
        workingDays.push(date);
      }
    }

    return workingDays;
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Parse Excel date serial number to Date object
   * @param {number} serial - Excel serial number
   * @returns {Date} JavaScript Date object
   */
  static parseExcelDate(serial) {
    // Excel dates start from January 1, 1900 (serial 1)
    // JavaScript dates start from January 1, 1970
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);
    return jsDate;
  }

  /**
   * Check if a time falls within regular timing window
   * @param {string} timeString - Time to check
   * @returns {boolean} True if within regular timing
   */
  static isRegularTiming(timeString) {
    const time = this.parseTime(timeString);
    const regularStart = this.parseTime(ATTENDANCE_CONFIG.REGULAR_TIMING_START);
    const regularEnd = this.parseTime(ATTENDANCE_CONFIG.REGULAR_TIMING_END);
    
    return time >= regularStart && time <= regularEnd;
  }

  /**
   * Calculate late minutes for a given arrival time
   * @param {string} arrivalTime - Arrival time
   * @param {string} expectedTime - Expected arrival time
   * @returns {number} Late minutes (0 if on time)
   */
  static calculateLateMinutes(arrivalTime, expectedTime = ATTENDANCE_CONFIG.CHECK_IN_TIME) {
    const arrival = this.parseTime(arrivalTime);
    const expected = this.parseTime(expectedTime);
    
    return Math.max(0, arrival - expected);
  }

  /**
   * Get month name from number
   * @param {number} monthNumber - Month number (1-12)
   * @returns {string} Month name
   */
  static getMonthName(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  }

  /**
   * Validate if a time string is valid
   * @param {string} timeString - Time string to validate
   * @returns {boolean} True if valid time format
   */
  static isValidTime(timeString) {
    if (!timeString) return false;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString.toString().trim());
  }

  /**
   * Get time range description
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {string} Time range description
   */
  static getTimeRangeDescription(startTime, endTime) {
    if (!startTime || !endTime) {
      return 'Invalid time range';
    }

    const duration = this.calculateWorkHours(startTime, endTime);
    return `${startTime} - ${endTime} (${duration}h)`;
  }
}

module.exports = DateUtils;