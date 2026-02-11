const ocrService = require('../services/ocr.service');

/**
 * Controller xử lý OCR cho hóa đơn
 */
exports.processInvoice = async (req, res) => {
  try {
    // Kiểm tra xem có file được upload không
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên ảnh hóa đơn'
      });
    }

    // Xử lý ảnh với OCR
    const result = await ocrService.processInvoice(req.file.buffer);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Đã trích xuất thông tin hóa đơn thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể trích xuất thông tin từ ảnh',
        error: result.error
      });
    }
  } catch (error) {
    console.error('OCR Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý OCR',
      error: error.message
    });
  }
};

/**
 * Controller test OCR (không cần auth)
 */
exports.testOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên ảnh để test'
      });
    }

    const result = await ocrService.processInvoice(req.file.buffer);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Test OCR thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Test OCR thất bại',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test OCR Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi test OCR',
      error: error.message
    });
  }
};
