/**
 * Auth Controller
 * Xử lý logic đăng ký và đăng nhập người dùng
 * Sử dụng PostgreSQL + bcrypt + JWT
 */

const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Đăng ký người dùng mới
 * @route POST /api/auth/register
 * @param {string} name - Tên người dùng
 * @param {string} email - Email đăng ký
 * @param {string} password - Mật khẩu (plain text)
 * @returns {Object} Thông tin user (không bao gồm password)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate dữ liệu đầu vào
    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc password" });

    // Hash password trước khi lưu DB để đảm bảo bảo mật
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      user: result.rows[0],
    });
  } catch (err) {
    // PostgreSQL unique_violation (email đã tồn tại)
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Đăng nhập người dùng
 * @route POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Object} JWT access token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0)
      return res.status(401).json({ message: "Email không tồn tại" });

    const user = result.rows[0];

    // So sánh password người dùng nhập với password đã hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    // Tạo JWT để xác thực cho các request sau
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Đăng nhập thành công",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
