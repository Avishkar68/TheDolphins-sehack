const express = require('express');
const router = express.Router();
const { uploadFields } = require('../middleware/uploadMiddleware');
const { uploadFiles, getPreview, generateMemo } = require('../controllers/uploadController');

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

/**
 * @route POST /api/upload/generate-memo
 * @desc Proxy memo generation to AI service
 * @access Public
 */
router.post('/generate-memo', generateMemo);

module.exports = router;
