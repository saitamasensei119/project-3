/**
 * Auth Controller
 * Xử lý logic đăng ký và đăng nhập người dùng
 * Sử dụng PostgreSQL + bcrypt + JWT
 */

const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Đăng ký tài khoản người dùng mới
 *
 * - Tạo user mới trong bảng `users`
 * - Mã hóa mật khẩu bằng bcrypt
 * - Tự động khởi tạo các danh mục (categories) mặc định cho user
 * - Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
 *
 * @route   POST /api/auth/register
 * @access  Public
 *
 * @param   {string} req.body.name     - Tên người dùng
 * @param   {string} req.body.email    - Email đăng ký (duy nhất)
 * @param   {string} req.body.password - Mật khẩu dạng plain text
 *
 * @returns {Object} 201 - Đăng ký thành công
 * @returns {Object} 400 - Thiếu dữ liệu hoặc email đã tồn tại
 * @returns {Object} 500 - Lỗi server
 *
 * @response {Object} user
 * @response {number} user.user_id - ID người dùng
 * @response {string} user.email   - Email người dùng
 */
exports.register = async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRes = await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id, email`,
      [name, email, hashedPassword]
    );

    const userId = userRes.rows[0].user_id;

    const defaultCategories = [
      { name: "Ăn uống", type: "expense" },
      { name: "Đi lại", type: "expense"},
      { name: "Lương", type: "income"},
    ];

    for (const cat of defaultCategories) {
      await client.query(
        `INSERT INTO categories (user_id, name, type, is_default)
         VALUES ($1, $2, $3, true)`,
        [userId, cat.name, cat.type]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Đăng ký thành công",
      user: userRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
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
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
