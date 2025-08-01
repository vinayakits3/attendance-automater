const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import middleware
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

// Import routes
const attendanceRoutes = require('./routes/attendance');
const uploadRoutes = require('./routes/upload');

// Import configuration
const { SERVER_CONFIG, ATTENDANCE_CONFIG } = require('./utils/constants');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Request logging in development
if (SERVER_CONFIG.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/upload', uploadRoutes);

// Legacy route compatibility
app.get('/api/process-inn-attendance', require('./controllers/attendanceController').processINNAttendance);
app.get('/api/inn-summary', require('./controllers/attendanceController').getINNSummary);
app.get('/api/config', require('./controllers/attendanceController').getConfig);
app.get('/api/health', require('./controllers/attendanceController').getHealth);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`🚀 Attendance Intelligence Platform running on port ${SERVER_CONFIG.PORT}`);
  console.log(`📁 Monitoring file: ${ATTENDANCE_CONFIG.EXCEL_FILE_PATH}`);
  console.log(`🏢 Department: ${ATTENDANCE_CONFIG.DEPARTMENT_NAME}`);
  console.log(`⏰ Work hours: ${ATTENDANCE_CONFIG.CHECK_IN_TIME} - ${ATTENDANCE_CONFIG.CHECK_OUT_TIME}`);
  console.log(`🌐 Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`🌐 Access at: http://localhost:${SERVER_CONFIG.PORT}`);
  
  // Check if Excel file exists
  const fs = require('fs');
  if (fs.existsSync(ATTENDANCE_CONFIG.EXCEL_FILE_PATH)) {
    console.log('✅ Excel file found and ready for processing');
  } else {
    console.log('⚠️  Excel file not found. Upload functionality available.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;
