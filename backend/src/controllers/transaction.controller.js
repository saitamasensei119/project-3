const pool = require("../config/db");

/**
 * Tạo giao dịch
 */
const { updateSpentAmount } = require("../utils/budget.utils");
const { updateGoalProgress } = require("../utils/goal.utils");

exports.createTransaction = async (req, res) => {
  const client = await pool.connect();

  try {
    const { type, amount, category_id, note, date } = req.body;
    const userId = req.user.user_id;

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO transactions
       (user_id, type, amount, category_id, note, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, amount, category_id || null, note, date]
    );

    // 🔥 Update budget nếu là expense
    if (type === "expense" && category_id) {
      await updateSpentAmount(client, userId, category_id, date);
    }

    await client.query("COMMIT");

    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Lỗi tạo transaction" });
  } finally {
    client.release();
  }
  // 🔥 Update goal nếu là saving
  if (type === "saving") {
    await updateGoalProgress(client, userId, amount);
  }
};

/**
 * Lấy danh sách giao dịch (theo tháng nếu có)
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { month, year } = req.query;

    let query = `
      SELECT t.*, c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = $1
    `;
    const params = [userId];

    if (month && year) {
      query += `
        AND EXTRACT(MONTH FROM t.date) = $2
        AND EXTRACT(YEAR FROM t.date) = $3
      `;
      params.push(month, year);
    }

    // 🎯 Sort đẹp hơn
    query += " ORDER BY t.date DESC, t.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("[GET TRANSACTIONS ERROR]", err);
    res.status(500).json({ message: "Lỗi lấy transactions" });
  }
};

/**
 * Cập nhật giao dịch
 */
exports.updateTransaction = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { amount, category_id, note, date } = req.body;
    const userId = req.user.user_id;

    await client.query("BEGIN");

    // Lấy transaction cũ
    const oldRes = await client.query(
      `SELECT * FROM transactions
       WHERE transaction_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      return res.status(404).json({ message: "Transaction không tồn tại" });
    }

    const oldTx = oldRes.rows[0];

    const result = await client.query(
      `UPDATE transactions
       SET amount = $1,
           category_id = $2,
           note = $3,
           date = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $5
         AND user_id = $6
       RETURNING *`,
      [amount, category_id || null, note, date, id, userId]
    );

    // 🔥 Update budget cũ
    if (oldTx.type === "expense" && oldTx.category_id) {
      await updateSpentAmount(client, userId, oldTx.category_id, oldTx.date);
    }

    // 🔥 Update budget mới
    if (result.rows[0].type === "expense" && category_id) {
      await updateSpentAmount(client, userId, category_id, date);
    }

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Lỗi cập nhật transaction" });
  } finally {
    client.release();
  }
};


/**
 * Xoá giao dịch
 */
exports.deleteTransaction = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await client.query("BEGIN");

    const oldRes = await client.query(
      `SELECT * FROM transactions
       WHERE transaction_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      return res.status(404).json({ message: "Transaction không tồn tại" });
    }

    const oldTx = oldRes.rows[0];

    await client.query(
      `DELETE FROM transactions
       WHERE transaction_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (oldTx.type === "expense" && oldTx.category_id) {
      await updateSpentAmount(client, userId, oldTx.category_id, oldTx.date);
    }

    await client.query("COMMIT");
    res.json({ message: "Đã xoá transaction" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Lỗi xoá transaction" });
  } finally {
    client.release();
  }
};
