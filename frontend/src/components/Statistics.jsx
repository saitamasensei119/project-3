import { useState, useEffect } from "react";
import { transactionService } from "../services/api";
import "../styles/Dashboard.css";

export default function Statistics() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyData: [],
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = async () => {
    try {
      const transactions = await transactionService.getTransactions();

      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      // Group by category
      const categoryBreakdown = {};
      transactions.forEach((t) => {
        if (t.type === "expense") {
          const category = t.categoryName || "Khác";
          categoryBreakdown[category] =
            (categoryBreakdown[category] || 0) + t.amount;
        }
      });

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        categoryBreakdown: Object.entries(categoryBreakdown).map(
          ([name, amount]) => ({
            name,
            amount,
          })
        ),
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="statistics">
      <div className="stats-grid">
        <div className="stat-card income">
          <h4>Thu Nhập Tổng</h4>
          <p className="amount">
            +{stats.totalIncome.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <div className="stat-card expense">
          <h4>Chi Tiêu Tổng</h4>
          <p className="amount">
            -{stats.totalExpense.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <div className="stat-card balance">
          <h4>Số Dư</h4>
          <p className="amount">{stats.balance.toLocaleString("vi-VN")} ₫</p>
        </div>
      </div>

      {stats.categoryBreakdown.length > 0 && (
        <div className="category-breakdown">
          <h3>Chi Tiêu Theo Danh Mục</h3>
          <div className="category-list">
            {stats.categoryBreakdown.map((category) => {
              const percentage = (category.amount / stats.totalExpense) * 100;
              return (
                <div key={category.name} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-amount">
                      {category.amount.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="category-percentage">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
