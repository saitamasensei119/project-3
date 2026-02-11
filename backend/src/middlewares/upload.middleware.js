const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.memoryStorage();

// Filter cho file types
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận các định dạng ảnh phổ biến
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, BMP, TIFF)'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
    files: 1 // Chỉ cho phép 1 file
  },
  fileFilter: fileFilter
});

// Middleware cho việc upload ảnh hóa đơn
const uploadInvoice = upload.single('invoice');

module.exports = {
  uploadInvoice
};
