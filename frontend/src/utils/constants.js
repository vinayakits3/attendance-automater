// Application constants
export const APP_CONFIG = {
  name: 'AttendanceAI',
  version: '1.0.0',
  description: 'Intelligent attendance processing system'
};

export const FILE_CONFIG = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['.xlsx', '.xls'],
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
};

export const UI_CONFIG = {
  animations: {
    duration: 300,
    easing: 'ease-in-out'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

export const SEVERITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium'
};

export const ISSUE_TYPES = {
  ABSENT: 'ABSENT',
  MISSING_PUNCH_IN: 'MISSING_PUNCH_IN',
  MISSING_PUNCH_OUT: 'MISSING_PUNCH_OUT',
  LATE_ARRIVAL: 'LATE_ARRIVAL',
  EARLY_DEPARTURE: 'EARLY_DEPARTURE',
  INCOMPLETE_SHIFT: 'INCOMPLETE_SHIFT'
};

export const MESSAGES = {
  uploadSuccess: 'File uploaded and processed successfully!',
  uploadError: 'Error uploading file. Please try again.',
  processingError: 'Error processing attendance data.',
  fileTypeError: 'Please upload an Excel file (.xlsx or .xls)',
  fileSizeError: 'File size exceeds 50MB limit',
  networkError: 'Network error. Please check your connection.'
};
