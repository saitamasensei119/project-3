import { useState, useEffect } from "react";
import { aiService } from "../services/api";
import "../styles/AIInsights.css";

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadInsights();
  }, [month, year]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await aiService.getInsights({ month, year });
      setInsights(data);
    } catch (err) {
      console.error("Error loading insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await aiService.refreshInsights(month, year);
      await loadInsights();
    } catch (err) {
      alert("Lỗi khi làm mới insights");
    }
  };

  if (loading)
    return (
      <div className="insights-container">
        <p>Đang tải...</p>
      </div>
    );

  if (!insights)
    return (
      <div className="insights-container">
        <p className="empty-message">Không có dữ liệu</p>
      </div>
    );

  return (
    <div className="insights-container">
      <div className="insights-header">
        <div className="month-selector">
          <label>
            Tháng:
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            Năm:
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={handleRefresh} className="btn-refresh">
          🔄 Làm mới
        </button>
      </div>

      {/* TOP SPENDING CATEGORIES */}
      <section className="insight-section">
        <h2>💰 Top Danh Mục Chi Tiêu</h2>
        {insights.topSpendingCategories.length > 0 ? (
          <div className="top-categories">
            {insights.topSpendingCategories.map((cat, i) => (
              <div key={i} className="category-item">
                <div className="category-info">
                  <span className="rank">#{i + 1}</span>
                  <span className="name">{cat.category}</span>
                  <span className="percentage">{cat.percentage}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
                <span className="amount">
                  {cat.amount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có dữ liệu</p>
        )}
      </section>

      {/* OVERSPENDING ALERTS */}
      {insights.overspendingAlerts.length > 0 && (
        <section className="insight-section alerts">
          <h2>⚠️ Cảnh Báo Chi Tiêu Quá Mức</h2>
          <div className="alerts-list">
            {insights.overspendingAlerts.map((alert, i) => (
              <div key={i} className={`alert-card alert-${alert.severity}`}>
                <div className="alert-header">
                  <span className="category">{alert.category}</span>
                  <span className={`severity ${alert.severity}`}>
                    {alert.severity === "critical"
                      ? "🔴 Nguy Cấp"
                      : "🟠 Cảnh Báo"}
                  </span>
                </div>
                <div className="alert-details">
                  <p>
                    <strong>Ngân sách:</strong>{" "}
                    {alert.limit.toLocaleString("vi-VN")} ₫
                  </p>
                  <p>
                    <strong>Đã chi:</strong>{" "}
                    {alert.spent.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="overage">
                    <strong>Vượt quá:</strong>{" "}
                    {alert.overAmount.toLocaleString("vi-VN")} ₫ (
                    {alert.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SAVING RECOMMENDATIONS */}
      <section className="insight-section recommendations">
        <h2>💡 Gợi Ý Tiết Kiệm</h2>
        {insights.savingRecommendations.length > 0 ? (
          <div className="recommendations-list">
            {insights.savingRecommendations.map((rec, i) => (
              <div
                key={i}
                className={`recommendation-card impact-${rec.impact}`}
              >
                <div className="rec-header">
                  <h3>{rec.title}</h3>
                  <span className={`impact-badge impact-${rec.impact}`}>
                    {rec.impact === "high"
                      ? "Ưu Tiên"
                      : rec.impact === "medium"
                      ? "Trung Bình"
                      : "Thấp"}
                  </span>
                </div>
                <p className="description">{rec.description}</p>
                {rec.potentialSaving > 0 && (
                  <div className="potential-saving">
                    <span>Tiết kiệm khả thi:</span>
                    <strong className="amount">
                      {rec.potentialSaving.toLocaleString("vi-VN")} ₫
                    </strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có gợi ý</p>
        )}
      </section>

      {/* TREND ANALYSIS */}
      {insights.trendAnalysis && (
        <section className="insight-section trend">
          <h2>📊 Xu Hướng So Với Tháng Trước</h2>
          <div className="trend-grid">
            <div className="trend-card">
              <h4>Thu Nhập</h4>
              <div className="trend-values">
                <div className="current">
                  <span className="label">Tháng {month}:</span>
                  <span className="value income">
                    {insights.trendAnalysis.currentMonth.income.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </span>
                </div>
                <div className="change">
                  <span className="label">So với tháng trước:</span>
                  <span
                    className={`value ${
                      insights.trendAnalysis.comparison.incomeChange >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {insights.trendAnalysis.comparison.incomeChange > 0
                      ? "+"
                      : ""}
                    {insights.trendAnalysis.comparison.incomeChange}%
                  </span>
                </div>
              </div>
            </div>

            <div className="trend-card">
              <h4>Chi Tiêu</h4>
              <div className="trend-values">
                <div className="current">
                  <span className="label">Tháng {month}:</span>
                  <span className="value expense">
                    {insights.trendAnalysis.currentMonth.expense.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </span>
                </div>
                <div className="change">
                  <span className="label">So với tháng trước:</span>
                  <span
                    className={`value ${
                      insights.trendAnalysis.comparison.expenseChange <= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {insights.trendAnalysis.comparison.expenseChange > 0
                      ? "+"
                      : ""}
                    {insights.trendAnalysis.comparison.expenseChange}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="trend-insight">
            <p className="insight-text">
              📈 {insights.trendAnalysis.comparison.insight}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
