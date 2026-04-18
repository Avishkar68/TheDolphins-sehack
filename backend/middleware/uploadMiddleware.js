const multer = require('multer');
const path = require('path');

// Use memory storage to process files directly without saving to disk
const storage = multer.memoryStorage();

// File filter to allow only CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only CSV and Excel files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Specific middleware for dual file upload
const uploadFields = upload.fields([
  { name: 'ledger', maxCount: 1 },
  { name: 'bank', maxCount: 1 }
]);

module.exports = {
  upload,
  uploadFields
};
