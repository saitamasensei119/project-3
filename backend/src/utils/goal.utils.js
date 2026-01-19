exports.updateGoalProgress = async (client, userId, amount) => {
  // lấy goal đang active (1 goal)
  const goalRes = await client.query(
    `SELECT goal_id, current_amount, target_amount
     FROM goals
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at
     LIMIT 1`,
    [userId]
  );

  if (goalRes.rows.length === 0) return;

  const goal = goalRes.rows[0];
  const newAmount = goal.current_amount + amount;

  let newStatus = "active";
  if (newAmount >= goal.target_amount) {
    newStatus = "completed";
  }

  await client.query(
    `UPDATE goals
     SET current_amount = $1, status = $2
     WHERE goal_id = $3`,
    [newAmount, newStatus, goal.goal_id]
  );
};
