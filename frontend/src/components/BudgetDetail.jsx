import { useState, useEffect } from "react";
import { transactionService } from "../services/api";
import "../styles/List.css";

export default function BudgetDetail({ budget, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [budget.id]);

  const loadTransactions = async () => {
    try {
      // Get all transactions and filter by category
      const allTransactions = await transactionService.getTransactions();
      const filtered = allTransactions.filter(
        (t) => t.type === "expense" && t.categoryName === budget.categoryName
      );
      setTransactions(filtered || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const budgetPercentage = (budget.spentAmount / budget.amount) * 100 || 0;
  const remaining = budget.amount - budget.spentAmount;

  return (
    <div className="budget-detail">
      <div className="detail-header">
        <button onClick={onBack} className="btn-back">
          ← Quay lại
        </button>
        <h2>Chi tiết: {budget.categoryName || "Toàn bộ"}</h2>
      </div>

      <div className="budget-info-card">
        <div className="info-row">
          <span className="label">Danh Mục:</span>
          <span className="value">{budget.categoryName || "---"}</span>
        </div>
        <div className="info-row">
          <span className="label">Tháng:</span>
          <span className="value">
            {budget.month}/{budget.year}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Hạn mức:</span>
          <span className="value">
            {budget.amount.toLocaleString("vi-VN")} ₫
          </span>
        </div>
        <div className="info-row">
          <span className="label">Đã chi:</span>
          <span className="value text-red">
            {budget.spentAmount.toLocaleString("vi-VN")} ₫
          </span>
        </div>
        <div className="info-row">
          <span className="label">Còn lại:</span>
          <span
            className={`value ${remaining < 0 ? "text-red" : "text-green"}`}
          >
            {remaining.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>Tiến độ</span>
            <span>{Math.round(budgetPercentage)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                budgetPercentage > 100 ? "over-budget" : ""
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Các giao dịch ({transactions.length})</h3>

        {loading ? (
          <p>Đang tải...</p>
        ) : transactions.length > 0 ? (
          <table className="list-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô Tả</th>
                <th>Số Tiền</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                  <td>{t.description}</td>
                  <td className="text-red">
                    {t.amount.toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">
            Không có giao dịch nào trong danh mục này
          </p>
        )}
      </div>
    </div>
  );
}
