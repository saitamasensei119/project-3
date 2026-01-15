const pool = require("../config/db");

exports.getCategories = async (req, res) => {
  const userId = req.query.user_id;

  const result = await pool.query(
    `SELECT * FROM categories
     WHERE is_default = TRUE OR user_id = $1`,
    [userId]
  );

  res.json(result.rows);
};
