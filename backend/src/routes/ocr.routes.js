const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { uploadInvoice } = require('../middlewares/upload.middleware');
const { processInvoice, testOCR } = require('../controllers/ocr.controller');

// Route xử lý OCR hóa đơn (cần authentication)
router.post('/process', auth, uploadInvoice, processInvoice);

// Route test OCR (không cần authentication)
router.post('/test', uploadInvoice, testOCR);

module.exports = router;
