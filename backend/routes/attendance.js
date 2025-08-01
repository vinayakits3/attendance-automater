const express = require('express');
const AttendanceController = require('../controllers/attendanceController');

const router = express.Router();

/**
 * @route   GET /api/attendance/process-inn
 * @desc    Process INN attendance from fixed file
 * @access  Public
 */
router.get('/process-inn', AttendanceController.processINNAttendance);

/**
 * @route   GET /api/attendance/process-fixed-file
 * @desc    Process attendance from fixed file (June 2025)
 * @access  Public
 */
router.get('/process-fixed-file', require('../controllers/fixedFileController').processFixedFile);

/**
 * @route   GET /api/attendance/inn-summary
 * @desc    Get INN Department summary only
 * @access  Public
 */
router.get('/inn-summary', AttendanceController.getINNSummary);

/**
 * @route   GET /api/attendance/config
 * @desc    Get system configuration
 * @access  Public
 */
router.get('/config', AttendanceController.getConfig);

/**
 * @route   GET /api/attendance/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', AttendanceController.getHealth);

module.exports = router;
