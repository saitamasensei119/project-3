const API_URL = "http://localhost:5000/api";

/**
 * Service xử lý OCR cho frontend
 */
class OCRService {
  /**
   * Upload và xử lý ảnh hóa đơn
   * @param {File} imageFile - File ảnh hóa đơn
   * @returns {Promise<Object>} - Kết quả OCR
   */
  async processInvoice(imageFile) {
    try {
      const formData = new FormData();
      formData.append('invoice', imageFile);

      const response = await fetch(`${API_URL}/ocr/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || result.message
        };
      }
    } catch (error) {
      console.error('OCR Service Error:', error);
      return {
        success: false,
        error: 'Lỗi kết nối đến server OCR'
      };
    }
  }

  /**
   * Test OCR (không cần authentication)
   * @param {File} imageFile - File ảnh test
   * @returns {Promise<Object>} - Kết quả test OCR
   */
  async testOCR(imageFile) {
    try {
      const formData = new FormData();
      formData.append('invoice', imageFile);

      const response = await fetch(`${API_URL}/ocr/test`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || result.message
        };
      }
    } catch (error) {
      console.error('Test OCR Error:', error);
      return {
        success: false,
        error: 'Lỗi kết nối đến server OCR'
      };
    }
  }

  /**
   * Validate file trước khi upload
   * @param {File} file - File cần validate
   * @returns {Object} - Kết quả validation
   */
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];

    if (!file) {
      return {
        valid: false,
        error: 'Vui lòng chọn file ảnh'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Định dạng file không được hỗ trợ. Vui lòng chọn file ảnh (JPEG, PNG, BMP, TIFF)'
      };
    }

    return {
      valid: true
    };
  }

  /**
   * Chuyển đổi kết quả OCR thành form data
   * @param {Object} ocrData - Dữ liệu từ OCR
   * @returns {Object} - Form data đã được điền
   */
  mapOCRToFormData(ocrData) {
    const formData = {
      amount: ocrData.amount || '',
      description: ocrData.description || '',
      date: ocrData.date || new Date().toISOString().split('T')[0],
      categoryId: '',
      type: 'expense' // Mặc định là chi tiêu
    };

    return formData;
  }
}

export default new OCRService();
