const DateUtils = require('./dateUtils');

/**
 * Validation Utilities Service
 * Handles data validation and input sanitization
 */
class ValidationUtils {
  /**
   * Validate employee data structure
   * @param {Object} employee - Employee data object
   * @returns {Object} Validation result
   */
  static validateEmployeeData(employee) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!employee) {
      return { isValid: false, errors: ['Employee data is null or undefined'], warnings: [] };
    }

    if (!employee.id) {
      errors.push('Employee ID is required');
    }

    if (!employee.name || typeof employee.name !== 'string') {
      errors.push('Employee name is required and must be a string');
    }

    if (!employee.department || typeof employee.department !== 'string') {
      warnings.push('Employee department is missing or invalid');
    }

    // Validate attendance data if present
    if (employee.attendanceData) {
      if (!Array.isArray(employee.attendanceData)) {
        errors.push('Attendance data must be an array');
      } else {
        employee.attendanceData.forEach((day, index) => {
          const dayValidation = this.validateDayData(day, index);
          errors.push(...dayValidation.errors);
          warnings.push(...dayValidation.warnings);
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate daily attendance data
   * @param {Object} day - Day attendance data
   * @param {number} index - Day index for error reporting
   * @returns {Object} Validation result
   */
  static validateDayData(day, index = 0) {
    const errors = [];
    const warnings = [];

    if (!day) {
      return { 
        isValid: false, 
        errors: [`Day data at index ${index} is null or undefined`], 
        warnings: [] 
      };
    }

    // Validate date
    if (!day.date) {
      errors.push(`Day ${index}: Date is required`);
    } else if (!this.isValidDate(day.date)) {
      errors.push(`Day ${index}: Invalid date format`);
    }

    // Validate time fields if present
    if (day.firstPunch && !DateUtils.isValidTime(day.firstPunch)) {
      warnings.push(`Day ${index}: Invalid first punch time format`);
    }

    if (day.lastPunch && !DateUtils.isValidTime(day.lastPunch)) {
      warnings.push(`Day ${index}: Invalid last punch time format`);
    }

    // Validate status
    if (day.status && !this.isValidStatus(day.status)) {
      warnings.push(`Day ${index}: Invalid status value '${day.status}'`);
    }

    // Logical validations
    if (day.firstPunch && day.lastPunch) {
      const firstPunchMinutes = DateUtils.parseTime(day.firstPunch);
      const lastPunchMinutes = DateUtils.parseTime(day.lastPunch);
      
      if (firstPunchMinutes >= lastPunchMinutes) {
        warnings.push(`Day ${index}: First punch time should be before last punch time`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate file upload data
   * @param {Object} fileData - Uploaded file data
   * @returns {Object} Validation result
   */
  static validateFileUpload(fileData) {
    const errors = [];
    const warnings = [];

    if (!fileData) {
      return { isValid: false, errors: ['File data is required'], warnings: [] };
    }

    // Check file properties
    if (!fileData.originalname) {
      errors.push('Original filename is required');
    } else if (!this.isValidExcelFileName(fileData.originalname)) {
      errors.push('File must be an Excel file (.xlsx or .xls)');
    }

    if (!fileData.size || fileData.size === 0) {
      errors.push('File is empty');
    } else if (fileData.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push('File size exceeds 50MB limit');
    }

    if (!fileData.path) {
      errors.push('File path is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Excel workbook structure
   * @param {Object} workbook - Excel workbook object
   * @returns {Object} Validation result
   */
  static validateWorkbookStructure(workbook) {
    const errors = [];
    const warnings = [];

    if (!workbook) {
      return { isValid: false, errors: ['Workbook is required'], warnings: [] };
    }

    if (!workbook.Sheets || typeof workbook.Sheets !== 'object') {
      errors.push('Workbook must contain sheets');
    } else {
      const sheetNames = Object.keys(workbook.Sheets);
      
      if (sheetNames.length === 0) {
        errors.push('Workbook must contain at least one sheet');
      } else {
        // Validate each sheet
        sheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) {
            warnings.push(`Sheet '${sheetName}' is empty or invalid`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate attendance configuration
   * @param {Object} config - Configuration object
   * @returns {Object} Validation result
   */
  static validateConfig(config) {
    const errors = [];
    const warnings = [];

    if (!config) {
      return { isValid: false, errors: ['Configuration is required'], warnings: [] };
    }

    // Validate time fields
    if (!config.CHECK_IN_TIME || !DateUtils.isValidTime(config.CHECK_IN_TIME)) {
      errors.push('Valid check-in time is required');
    }

    if (!config.CHECK_OUT_TIME || !DateUtils.isValidTime(config.CHECK_OUT_TIME)) {
      errors.push('Valid check-out time is required');
    }

    // Validate numeric fields
    if (typeof config.MAX_MORNING_PUNCHES !== 'number' || config.MAX_MORNING_PUNCHES < 1) {
      warnings.push('Max morning punches should be a positive number');
    }

    if (typeof config.SEVERITY_THRESHOLD_MINUTES !== 'number' || config.SEVERITY_THRESHOLD_MINUTES < 0) {
      warnings.push('Severity threshold minutes should be a non-negative number');
    }

    // Validate file path
    if (!config.EXCEL_FILE_PATH || typeof config.EXCEL_FILE_PATH !== 'string') {
      warnings.push('Excel file path should be specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize employee name
   * @param {string} name - Employee name
   * @returns {string} Sanitized name
   */
  static sanitizeEmployeeName(name) {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.-]/g, '') // Remove special characters except dots and hyphens
      .substring(0, 100); // Limit length
  }

  /**
   * Sanitize employee ID
   * @param {string|number} id - Employee ID
   * @returns {string} Sanitized ID
   */
  static sanitizeEmployeeId(id) {
    if (!id) {
      return '';
    }

    return id.toString()
      .trim()
      .replace(/[^\w-]/g, '') // Allow only alphanumeric and hyphens
      .substring(0, 20); // Limit length
  }

  /**
   * Check if date is valid
   * @param {any} date - Date to validate
   * @returns {boolean} True if valid date
   */
  static isValidDate(date) {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Check if status is valid
   * @param {string} status - Status to validate
   * @returns {boolean} True if valid status
   */
  static isValidStatus(status) {
    const validStatuses = ['P', 'A', 'H', 'L', 'WO', 'HD', 'FD'];
    return validStatuses.includes(status);
  }

  /**
   * Check if Excel filename is valid
   * @param {string} filename - Filename to validate
   * @returns {boolean} True if valid Excel filename
   */
  static isValidExcelFileName(filename) {
    if (!filename || typeof filename !== 'string') {
      return false;
    }

    const excelExtensions = ['.xlsx', '.xls'];
    return excelExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  /**
   * Validate array of employees
   * @param {Array} employees - Array of employee data
   * @returns {Object} Validation result with detailed feedback
   */
  static validateEmployeesArray(employees) {
    const result = {
      isValid: true,
      totalEmployees: 0,
      validEmployees: 0,
      invalidEmployees: 0,
      errors: [],
      warnings: [],
      employeeValidations: []
    };

    if (!Array.isArray(employees)) {
      result.isValid = false;
      result.errors.push('Employees data must be an array');
      return result;
    }

    result.totalEmployees = employees.length;

    if (employees.length === 0) {
      result.warnings.push('No employees found in the data');
      return result;
    }

    employees.forEach((employee, index) => {
      const validation = this.validateEmployeeData(employee);
      result.employeeValidations.push({
        index,
        employee: employee?.name || `Employee ${index}`,
        ...validation
      });

      if (validation.isValid) {
        result.validEmployees++;
      } else {
        result.invalidEmployees++;
        result.isValid = false;
        result.errors.push(`Employee ${index}: ${validation.errors.join(', ')}`);
      }

      result.warnings.push(...validation.warnings.map(warning => 
        `Employee ${index}: ${warning}`
      ));
    });

    return result;
  }

  /**
   * Validate and sanitize batch of employees
   * @param {Array} employees - Array of employee data
   * @returns {Array} Array of validated and sanitized employees
   */
  static sanitizeEmployeesData(employees) {
    if (!Array.isArray(employees)) {
      return [];
    }

    return employees
      .filter(employee => employee && employee.id) // Remove null/undefined entries
      .map(employee => ({
        ...employee,
        id: this.sanitizeEmployeeId(employee.id),
        name: this.sanitizeEmployeeName(employee.name),
        department: employee.department ? employee.department.toString().trim() : 'Unknown'
      }))
      .filter(employee => employee.id && employee.name); // Remove entries that couldn't be sanitized
  }
}

module.exports = ValidationUtils;