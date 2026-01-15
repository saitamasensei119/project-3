/**
 * Auth Middleware
 * Kiểm tra JWT trong Authorization header
 * Dùng để bảo vệ các route yêu cầu đăng nhập
 */

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Không có Authorization header
  if (!authHeader) return res.status(401).json({ message: "Chưa đăng nhập" });

  // Header format: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify và giải mã JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lưu thông tin user vào request để dùng cho các middleware / controller sau
    req.user = decoded;

    next();
  } catch (err) {
    // Token hết hạn hoặc không hợp lệ
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
