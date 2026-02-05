/**
 * AI Insights Controller
 * Phân tích chi tiêu, gợi ý tiết kiệm, cảnh báo và xu hướng
 */
const pool = require("../config/db");

/**
 * Lấy insights cho tháng/năm cụ thể
 * @route GET /api/ai-insights?month=1&year=2025
 */
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    // Kiểm tra insights đã tính toán chưa
    const existingInsight = await pool.query(
      `SELECT * FROM ai_insights 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );

    if (existingInsight.rows.length > 0) {
      return res.json(existingInsight.rows[0]);
    }

    // Tính toán insights nếu chưa có
    const insights = await calculateInsights(userId, month, year);

    // Lưu vào database
    const saveResult = await pool.query(
      `INSERT INTO ai_insights 
       (user_id, month, year, top_spending_categories, overspending_alerts, saving_recommendations, trend_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, month, year) 
       DO UPDATE SET 
         top_spending_categories = EXCLUDED.top_spending_categories,
         overspending_alerts = EXCLUDED.overspending_alerts,
         saving_recommendations = EXCLUDED.saving_recommendations,
         trend_analysis = EXCLUDED.trend_analysis
       RETURNING *`,
      [
        userId,
        month,
        year,
        JSON.stringify(insights.topSpendingCategories),
        JSON.stringify(insights.overspendingAlerts),
        JSON.stringify(insights.savingRecommendations),
        JSON.stringify(insights.trendAnalysis),
      ]
    );

    res.json(saveResult.rows[0]);
  } catch (err) {
    console.error("[GET INSIGHTS ERROR]", err);
    res.status(500).json({ message: "Lỗi lấy insights: " + err.message });
  }
};

/**
 * Tính toán insights từ dữ liệu transactions và budgets
 */
async function calculateInsights(userId, month, year) {
  try {
    // Lấy transactions của tháng
    const transactionsRes = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = $1
       AND EXTRACT(MONTH FROM t.date) = $2
       AND EXTRACT(YEAR FROM t.date) = $3`,
      [userId, month, year]
    );

    const transactions = transactionsRes.rows;

    // Lấy budgets của tháng
    const budgetsRes = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.category_id
       WHERE b.user_id = $1
       AND b.month = $2
       AND b.year = $3`,
      [userId, month, year]
    );

    const budgets = budgetsRes.rows;

    // 1️⃣ Top Spending Categories
    const categorySpending = {};
    let totalExpense = 0;

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const category = t.category_name || "Khác";
        categorySpending[category] =
          (categorySpending[category] || 0) + parseFloat(t.amount);
        totalExpense += parseFloat(t.amount);
      });

    const topSpendingCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        category: name,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / totalExpense) * 100),
      }));

    // 2️⃣ Overspending Alerts
    const overspendingAlerts = [];
    budgets.forEach((budget) => {
      const spent = parseFloat(budget.spent_amount || 0);
      const limit = parseFloat(budget.limit_amount);
      const percentage = (spent / limit) * 100;

      if (percentage > 100) {
        overspendingAlerts.push({
          category: budget.category_name || "Khác",
          limit: Math.round(limit * 100) / 100,
          spent: Math.round(spent * 100) / 100,
          overAmount: Math.round((spent - limit) * 100) / 100,
          percentage: Math.round(percentage),
          severity: percentage > 150 ? "critical" : "warning",
        });
      }
    });

    // 3️⃣ Saving Recommendations
    const savingRecommendations = [];
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Tính tỷ lệ chi tiêu
    const spendingRatio = totalExpense / totalIncome;

    if (spendingRatio > 0.8) {
      savingRecommendations.push({
        title: "Giảm chi tiêu",
        description: `Bạn đang chi tiêu ${Math.round(
          spendingRatio * 100
        )}% thu nhập. Hãy cố gắng giữ dưới 80%.`,
        impact: "high",
        potentialSaving:
          Math.round((totalExpense - totalIncome * 0.8) * 100) / 100,
      });
    }

    // Gợi ý từ top spending categories
    if (
      topSpendingCategories.length > 0 &&
      topSpendingCategories[0].percentage > 30
    ) {
      savingRecommendations.push({
        title: `Giảm chi tiêu ${topSpendingCategories[0].category}`,
        description: `${topSpendingCategories[0].category} chiếm ${topSpendingCategories[0].percentage}% chi tiêu của bạn. Cân nhân nên giảm 10-20%.`,
        impact: "medium",
        potentialSaving:
          Math.round(topSpendingCategories[0].amount * 0.15 * 100) / 100,
      });
    }

    if (savingRecommendations.length === 0) {
      savingRecommendations.push({
        title: "Chi tiêu hợp lý",
        description:
          "Bạn đang chi tiêu hợp lý! Tiếp tục duy trì thói quen này.",
        impact: "low",
        potentialSaving: 0,
      });
    }

    // 4️⃣ Trend Analysis - So sánh với tháng trước
    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;

    const lastMonthTransRes = await pool.query(
      `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3`,
      [userId, lastMonth, lastYear]
    );

    const lastMonthData = lastMonthTransRes.rows[0];
    const lastMonthExpense = parseFloat(lastMonthData.expense || 0);
    const lastMonthIncome = parseFloat(lastMonthData.income || 0);

    const currentMonthExpense = totalExpense;
    const currentMonthIncome = totalIncome;

    const trendAnalysis = {
      currentMonth: {
        month,
        year,
        income: Math.round(currentMonthIncome * 100) / 100,
        expense: Math.round(currentMonthExpense * 100) / 100,
      },
      lastMonth: {
        month: lastMonth,
        year: lastYear,
        income: Math.round(lastMonthIncome * 100) / 100,
        expense: Math.round(lastMonthExpense * 100) / 100,
      },
      comparison: {
        incomeChange:
          lastMonthIncome === 0
            ? 0
            : Math.round(
                ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
              ),
        expenseChange:
          lastMonthExpense === 0
            ? 0
            : Math.round(
                ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) *
                  100
              ),
        insight:
          currentMonthExpense > lastMonthExpense
            ? "Chi tiêu tăng"
            : "Chi tiêu giảm",
      },
    };

    return {
      topSpendingCategories,
      overspendingAlerts,
      savingRecommendations,
      trendAnalysis,
    };
  } catch (err) {
    console.error("[CALCULATE INSIGHTS ERROR]", err);
    throw err;
  }
}

/**
 * Xoá insights (tính toán lại)
 */
exports.refreshInsights = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { month, year } = req.body;

    // Xoá insights cũ
    await pool.query(
      `DELETE FROM ai_insights 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );

    // Tính toán insights mới
    const insights = await calculateInsights(userId, month, year);

    // Lưu insights mới
    const saveResult = await pool.query(
      `INSERT INTO ai_insights 
       (user_id, month, year, top_spending_categories, overspending_alerts, saving_recommendations, trend_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        month,
        year,
        JSON.stringify(insights.topSpendingCategories),
        JSON.stringify(insights.overspendingAlerts),
        JSON.stringify(insights.savingRecommendations),
        JSON.stringify(insights.trendAnalysis),
      ]
    );

    res.json(saveResult.rows[0]);
  } catch (err) {
    console.error("[REFRESH INSIGHTS ERROR]", err);
    res.status(500).json({ message: "Lỗi làm mới insights: " + err.message });
  }
};
