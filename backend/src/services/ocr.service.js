const Tesseract = require('tesseract.js');

/**
 * Dịch vụ OCR để trích xuất thông tin từ ảnh hóa đơn
 */
class OCRService {
  /**
   * Trích xuất văn bản từ ảnh
   * @param {Buffer} imageBuffer - Buffer của ảnh
   * @returns {Promise<Object>} - Kết quả OCR
   */
  async extractText(imageBuffer) {
    try {
      const result = await Tesseract.recognize(
        imageBuffer,
        'vie+eng', // Hỗ trợ cả tiếng Việt và tiếng Anh
        {
          logger: m => console.log(m),
        }
      );

      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words
      };
    } catch (error) {
      console.error('OCR Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Phân tích văn bản để trích xuất thông tin hóa đơn
   * @param {string} text - Văn bản đã trích xuất
   * @returns {Object} - Thông tin hóa đơn đã phân tích
   */
  parseInvoiceInfo(text) {
    const info = {
      amount: null,
      description: '',
      date: null,
      vendor: '',
      confidence: 0
    };

    // Debug: Log văn bản gốc
    console.log('OCR - Văn bản gốc:', text);

    // Chuẩn hóa văn bản
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    console.log('OCR - Văn bản chuẩn hóa:', normalizedText);

    // Trích xuất số tiền - Cải thiện với nhiều pattern hơn
    const amountPatterns = [
      // Pattern 1: Các từ khóa phổ biến cho tổng tiền
      /tổng cộng[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /total[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /thanh toán[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /số tiền[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tổng tiền[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /thành tiền[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      
      // Pattern 2: Các từ khóa tiếng Anh
      /amount[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /sum[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /pay[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      
      // Pattern 3: Các từ khóa không có dấu (như trong ví dụ)
      /tong cong[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tong tien[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /thanh toan[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tong gia tri[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tong tien thanh toan[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tong tien thanh toan\s*([0-9.,]+)/gi, // Pattern đặc biệt cho ví dụ
      /tong gia tri don[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      /tong tien giam[:\s]*([0-9.,]+)\s*(?:vnd|đ|₫)?/gi,
      
      // Pattern 3.5: Pattern đơn giản cho "TONG TIEN THANH TOAN"
      /tong tien thanh toan\s*([0-9.,]+)/gi,
      /TONG TIEN THANH TOAN\s*([0-9.,]+)/gi, // Giữ nguyên hoa
      /tong.*thanh toan.*?([0-9.,]+)/gi, // Flexible pattern
      
      // Pattern 4: Các ký hiệu tiền tệ
      /([0-9.,]+)\s*đ/gi,
      /([0-9.,]+)\s*vnd/gi,
      /([0-9.,]+)\s*₫/gi,
      
      // Pattern 5: Số tiền lớn nhất trong văn bản (thường là tổng)
      /([0-9]{3,6}[.,]?[0-9]{3})\s*(?:vnd|đ|₫)?/gi,
      
      // Pattern 6: Số tiền có dấu phẩy hoặc chấm
      /([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?)\s*(?:vnd|đ|₫)?/gi
    ];

    // Tìm tất cả các số tiền khớp pattern
    const allAmounts = [];
    
    // Test từng pattern riêng để debug
    console.log('OCR - Bắt test patterns...');
    
    for (const pattern of amountPatterns) {
      // Sử dụng exec để tìm tất cả matches với capture groups
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      console.log(`OCR - Test pattern: ${pattern.source}`);
      
      while ((match = regex.exec(normalizedText)) !== null) {
        console.log(`OCR - Match found:`, match);
        if (match[1]) { // match[1] là capture group cho số tiền
          const amount = parseFloat(match[1].replace(/[.,]/g, ''));
          if (!isNaN(amount) && amount > 100) { // Lọc số tiền nhỏ hơn 100 (có thể là giá lẻ)
            allAmounts.push({
              amount: amount,
              original: match[0],
              pattern: pattern.source
            });
            console.log(`OCR - Tìm thấy số tiền: ${amount} từ pattern: ${match[0]}`);
          }
        }
      }
    }
    
    // Chọn số tiền hợp lý nhất
    if (allAmounts.length > 0) {
      // Debug: Log tất cả số tiền tìm thấy
      console.log('OCR - Tất cả số tiền tìm thấy:', allAmounts);
      
      // Ưu tiên các pattern có từ khóa rõ ràng (thanh toan, tong tien, etc)
      const priorityPatterns = [
        'thanh toan', 'tong tien thanh toan', 'tong tien', 'tổng cộng', 
        'total', 'tong gia tri don', 'tong gia tri'
      ];
      
      // Tìm số tiền từ các pattern ưu tiên
      let priorityAmounts = allAmounts.filter(item => {
        return priorityPatterns.some(keyword => 
          item.pattern.toLowerCase().includes(keyword)
        );
      });
      
      console.log('OCR - Số tiền từ pattern ưu tiên:', priorityAmounts);
      
      if (priorityAmounts.length > 0) {
        // Chọn số tiền lớn nhất từ các pattern ưu tiên
        const maxPriorityAmount = priorityAmounts.reduce((max, current) => 
          current.amount > max.amount ? current : max
        );
        
        info.amount = maxPriorityAmount.amount;
        info.confidence += 0.4; // Tăng confidence vì có từ khóa rõ
        console.log('OCR - Đã chọn số tiền từ pattern ưu tiên:', info.amount);
      } else {
        // Nếu không có pattern ưu tiên, lọc theo khoảng hợp lý
        const reasonableAmounts = allAmounts.filter(item => {
          return item.amount >= 1000 && item.amount <= 200000; // 1k - 200k cho hóa đơn bán lẻ
        });
        
        console.log('OCR - Số tiền hợp lý:', reasonableAmounts);
        
        if (reasonableAmounts.length > 0) {
          const maxReasonableAmount = reasonableAmounts.reduce((max, current) => 
            current.amount > max.amount ? current : max
          );
          
          info.amount = maxReasonableAmount.amount;
          info.confidence += 0.2;
          console.log('OCR - Đã chọn số tiền hợp lý:', info.amount);
        }
      }
    } else {
      console.log('OCR - Không tìm thấy số tiền nào');
    }

    // Trích xuất ngày
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g,
      /ngày[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          info.date = date.toISOString().split('T')[0];
          info.confidence += 0.2;
          break;
        }
      }
    }

    // Trích xuất tên nhà cung cấp
    const vendorPatterns = [
      /cửa hàng[:\s]*([^\n]+)/gi,
      /nhà hàng[:\s]*([^\n]+)/gi,
      /quán[:\s]*([^\n]+)/gi,
      /khách sạn[:\s]*([^\n]+)/gi,
      /supermarket[:\s]*([^\n]+)/gi,
      /big c[:\s]*([^\n]+)/gi,
      /co.opmart[:\s]*([^\n]+)/gi,
      /vinmart[:\s]*([^\n]+)/gi
    ];

    for (const pattern of vendorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.vendor = match[1].trim();
        info.confidence += 0.2;
        break;
      }
    }

    // Trích xuất mô tả từ các từ khóa phổ biến
    const keywords = ['hóa đơn', 'bill', 'receipt', 'đơn hàng', 'order'];
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        info.description = `Hóa đơn ${info.vendor || 'mua sắm'}`;
        info.confidence += 0.1;
        break;
      }
    }

    // Nếu không có mô tả, sử dụng vendor
    if (!info.description && info.vendor) {
      info.description = `Hóa đơn ${info.vendor}`;
    }

    // Nếu vẫn không có, sử dụng văn bản đầu tiên
    if (!info.description) {
      const firstLine = text.split('\n')[0]?.trim();
      if (firstLine && firstLine.length > 3) {
        info.description = firstLine.substring(0, 50);
      }
    }

    return info;
  }

  /**
   * Xử lý ảnh hóa đơn và trích xuất thông tin
   * @param {Buffer} imageBuffer - Buffer của ảnh
   * @returns {Promise<Object>} - Thông tin hóa đơn đã phân tích
   */
  async processInvoice(imageBuffer) {
    try {
      // Trích xuất văn bản từ ảnh
      const ocrResult = await this.extractText(imageBuffer);
      
      if (!ocrResult.success) {
        return {
          success: false,
          error: ocrResult.error
        };
      }

      // Phân tích thông tin từ văn bản
      const invoiceInfo = this.parseInvoiceInfo(ocrResult.text);

      return {
        success: true,
        data: {
          ...invoiceInfo,
          rawText: ocrResult.text,
          ocrConfidence: ocrResult.confidence
        }
      };
    } catch (error) {
      console.error('Process Invoice Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OCRService();
