const express = require('express');
const router = express.Router();
const { uploadFields } = require('../middleware/uploadMiddleware');
const { uploadFiles, getPreview } = require('../controllers/uploadController');

/**
 * @route POST /api/upload
 * @desc Upload ledger and bank files for processing
 * @access Public
 */
router.post('/', uploadFields, uploadFiles);

/**
 * @route GET /api/upload/preview
 * @desc Get paginated preview of uploaded data
 * @access Public
 */
router.get('/preview', getPreview);

module.exports = router;
