const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3) RETURNING user_id`,
    [name, email, hashed]
  );

  res.json({ user_id: result.rows[0].user_id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rowCount === 0)
    return res.status(401).json({ message: "Invalid email" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { user_id: user.rows[0].user_id },
    process.env.JWT_SECRET
  );

  res.json({ token });
};
