/**
 * Category Controller
 * Quản lý category (thu / chi) của người dùng
 */
const pool = require("../config/db");

/**
 * Tạo category mới
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const userId = req.user.user_id;

    if (!name || !type)
      return res.status(400).json({ message: "Thiếu name hoặc type" });

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, type, icon]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo category" });
  }
};

/**
 * Lấy danh sách category của user
 */
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT * FROM categories
       WHERE user_id = $1 OR is_default = TRUE
       ORDER BY type`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy categories" });
  }
};

/**
 * Cập nhật category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const userId = req.user.user_id;

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, icon = $2
       WHERE category_id = $3
  AND user_id = $4
  AND is_default = FALSE

       RETURNING *`,
      [name, icon, id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật category" });
  }
};

/**
 * Xoá category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE category_id = $1
  AND user_id = $2
  AND is_default = FALSE

       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.json({ message: "Đã xoá category" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá category" });
  }
};
