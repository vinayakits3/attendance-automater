const express = require('express');
const upload = require('../config/multer');
const UploadController = require('../controllers/uploadController');

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload and process Excel file
 * @access  Public
 */
router.post('/', upload.single('excelFile'), UploadController.uploadFile);

/**
 * @route   GET /api/upload/config
 * @desc    Get upload configuration
 * @access  Public
 */
router.get('/config', UploadController.getUploadConfig);

/**
 * @route   POST /api/upload/fixed
 * @desc    Process fixed format file from predefined path
 * @access  Public
 */
router.post('/fixed', require('../controllers/fixedFileController').processFixedFile);

module.exports = router;
