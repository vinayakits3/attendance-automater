const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FILE_CONFIG } = require('../utils/constants');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(FILE_CONFIG.UPLOAD_DIR)) {
      fs.mkdirSync(FILE_CONFIG.UPLOAD_DIR, { recursive: true });
    }
    cb(null, FILE_CONFIG.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const fileName = `${timestamp}-${originalName}`;
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (FILE_CONFIG.ALLOWED_EXTENSIONS.includes(fileExt)) {
    cb(null, true);
  } else {
    const error = new Error(`Only Excel files (${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}) are allowed`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Create multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_CONFIG.MAX_FILE_SIZE
  }
});

module.exports = upload;
