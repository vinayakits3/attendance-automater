const { SERVER_CONFIG } = require('../utils/constants');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  console.error('Error occurred:', error);

  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large. Maximum size allowed is 50MB.',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Handle Excel parsing errors
  if (error.message.includes('Invalid file format') || error.message.includes('Cannot read property')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Excel file format. Please ensure the file is a valid Excel file.',
      code: 'INVALID_EXCEL_FORMAT'
    });
  }

  // Handle file not found errors
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'File not found.',
      code: 'FILE_NOT_FOUND'
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Handle generic errors
  const statusCode = error.statusCode || 500;
  const message = SERVER_CONFIG.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    ...(SERVER_CONFIG.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger
};
