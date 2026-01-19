const { Pool } = require("pg");

/**
 * Khởi tạo PostgreSQL connection pool
 * - Sử dụng biến môi trường trong file .env
 * - Pool giúp tái sử dụng connection, tăng hiệu năng
 */
const pool = new Pool({
  // Địa chỉ server PostgreSQL (ví dụ: localhost)
  host: process.env.DB_HOST,

  // Cổng PostgreSQL (mặc định: 5432)
  port: Number(process.env.DB_PORT),

  // Tên database
  database: process.env.DB_NAME,

  // User kết nối database
  user: process.env.DB_USER,

  // Mật khẩu database
  password: process.env.DB_PASSWORD,

  /**
   * SSL (dùng cho production / cloud DB)
   * - Local: false
   * - Cloud (Render, Railway, Supabase): true
   */
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

/**
 * Event: khi kết nối PostgreSQL thành công
 */
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

/**
 * Event: khi xảy ra lỗi trong pool
 */
pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err.message);
});

/**
 * Kiểm tra kết nối database ngay khi server khởi động
 * - SELECT 1 là query nhẹ, chỉ dùng để test kết nối
 */
(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
})();

module.exports = pool;
