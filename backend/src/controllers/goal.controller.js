/**
 * Goal Controller
 * Quản lý mục tiêu tiết kiệm (goals)
 */

const pool = require("../config/db");

/**
 * Tạo goal mới
 * POST /api/goals
 */
exports.createGoal = async (req, res) => {
  try {
    const { title, target_amount, deadline } = req.body;
    const userId = req.user.user_id;

    if (!title || !target_amount) {
      return res
        .status(400)
        .json({ message: "Thiếu title hoặc target_amount" });
    }

    if (target_amount <= 0) {
      return res.status(400).json({ message: "target_amount phải > 0" });
    }

    const result = await pool.query(
      `INSERT INTO goals (user_id, title, target_amount, deadline)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, target_amount, deadline || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[CREATE GOAL ERROR]", err);
    res.status(500).json({ message: "Lỗi tạo goal" });
  }
};

/**
 * Lấy danh sách goals của user
 * GET /api/goals
 */
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT *,
        ROUND((current_amount / target_amount) * 100, 2) AS progress_percent
       FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("[GET GOALS ERROR]", err);
    res.status(500).json({ message: "Lỗi lấy goals" });
  }
};

/**
 * Cập nhật thông tin goal
 * PUT /api/goals/:id
 */
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, target_amount, deadline } = req.body;
    const userId = req.user.user_id;

    const result = await pool.query(
      `UPDATE goals
       SET title = COALESCE($1, title),
           target_amount = COALESCE($2, target_amount),
           deadline = COALESCE($3, deadline)
       WHERE goal_id = $4
         AND user_id = $5
       RETURNING *`,
      [title, target_amount, deadline, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Goal không tồn tại" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[UPDATE GOAL ERROR]", err);
    res.status(500).json({ message: "Lỗi cập nhật goal" });
  }
};

/**
 * Cập nhật tiến độ tiết kiệm
 * PATCH /api/goals/:id/progress
 */
exports.updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.user_id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount phải > 0" });
    }

    const result = await pool.query(
      `UPDATE goals
       SET current_amount = current_amount + $1
       WHERE goal_id = $2
         AND user_id = $3
       RETURNING *`,
      [amount, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Goal không tồn tại" });
    }

    res.json({
      message: "Cập nhật tiến độ thành công",
      goal: result.rows[0],
    });
  } catch (err) {
    // CHECK (current_amount <= target_amount) sẽ rơi vào đây
    if (err.code === "23514") {
      return res.status(400).json({
        message: "Vượt quá target_amount",
      });
    }

    console.error("[UPDATE GOAL PROGRESS ERROR]", err);
    res.status(500).json({ message: "Lỗi cập nhật tiến độ goal" });
  }
};

/**
 * Xoá goal
 * DELETE /api/goals/:id
 */
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `DELETE FROM goals
       WHERE goal_id = $1
         AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Goal không tồn tại" });
    }

    res.json({ message: "Đã xoá goal" });
  } catch (err) {
    console.error("[DELETE GOAL ERROR]", err);
    res.status(500).json({ message: "Lỗi xoá goal" });
  }
};
