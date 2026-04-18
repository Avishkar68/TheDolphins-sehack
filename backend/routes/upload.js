const express = require('express');
const router = express.Router();
const { uploadFields } = require('../middleware/uploadMiddleware');
const { uploadFiles } = require('../controllers/uploadController');

/**
 * @route POST /api/upload
 * @desc Upload ledger and bank files for processing
 * @access Public
 */
router.post('/', uploadFields, uploadFiles);

module.exports = router;
