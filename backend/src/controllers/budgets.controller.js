
const pool = require("../config/db");

/**
 * Tạo budget
 */
exports.createBudget = async (req, res) => {
  try {
    const { month, year, category_id, limit_amount } = req.body;
    const userId = req.user.user_id;

    if (!month || !year || !limit_amount) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    if (limit_amount <= 0) {
      return res.status(400).json({ message: "limit_amount phải > 0" });
    }

    // Check category thuộc user
    if (category_id) {
      const check = await pool.query(
        `SELECT 1 FROM categories
         WHERE category_id = $1 AND user_id = $2`,
        [category_id, userId]
      );

      if (check.rows.length === 0) {
        return res.status(400).json({ message: "Category không hợp lệ" });
      }
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, month, year, category_id, limit_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, month, year, category_id || null, limit_amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ message: "Budget đã tồn tại cho category này" });
    }

    res.status(500).json({ message: "Lỗi tạo budget" });
  }
};
/**
 * Lấy budgets theo tháng
 */
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Thiếu month hoặc year" });
    }

    const result = await pool.query(
      `
      SELECT
        b.*,
        c.name AS category_name,
        (b.spent_amount > b.limit_amount)::boolean AS is_over_budget
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE b.user_id = $1
        AND b.month = $2
        AND b.year = $3
      ORDER BY is_over_budget DESC, b.spent_amount DESC
      `,
      [userId, month, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("[GET BUDGETS ERROR]", err);
    res.status(500).json({ message: "Lỗi lấy budgets" });
  }
};
/**
 * Cập nhật budget
 */
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit_amount } = req.body;
    const userId = req.user.user_id;

    if (!limit_amount || limit_amount <= 0) {
      return res.status(400).json({ message: "limit_amount không hợp lệ" });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET limit_amount = $1
       WHERE budget_id = $2 AND user_id = $3
       RETURNING *`,
      [limit_amount, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Budget không tồn tại" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật budget" });
  }
};
/**
 * Xoá budget
 */
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE budget_id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Budget không tồn tại" });
    }

    res.json({ message: "Đã xoá budget" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá budget" });
  }
};
