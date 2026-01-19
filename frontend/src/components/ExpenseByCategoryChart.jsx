import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { transactionService } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseByCategoryChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const transactions = await transactionService.getTransactions({
        month,
        year,
      });

      console.log("All transactions:", transactions);

      const expenses = transactions.filter((t) => t.type === "expense");
      console.log("Filtered expenses:", expenses);

      // Group by category
      const categoryBreakdown = {};
      expenses.forEach((t) => {
        const category = t.categoryName || "Khác";
        categoryBreakdown[category] =
          (categoryBreakdown[category] || 0) + Number(t.amount);
      });

      console.log("Category breakdown:", categoryBreakdown);

      const labels = Object.keys(categoryBreakdown);
      const data = Object.values(categoryBreakdown);

      const colors = [
        "#667eea",
        "#764ba2",
        "#f093fb",
        "#4facfe",
        "#00f2fe",
        "#43e97b",
        "#fa709a",
        "#fee140",
        "#30cfd0",
      ];

      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: "#fff",
            borderWidth: 2,
            hoverBorderColor: "#333",
            hoverBorderWidth: 3,
          },
        ],
      });
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 13,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return {
                text: `${label}: ${value.toLocaleString(
                  "vi-VN"
                )} ₫ (${percent}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${value.toLocaleString("vi-VN")} ₫ (${percent}%)`;
          },
        },
      },
    },
  };

  if (loading)
    return (
      <div className="chart-container">
        <p>Đang tải...</p>
      </div>
    );

  if (!chartData || chartData.labels.length === 0)
    return (
      <div className="chart-container">
        <p className="empty-message">Chưa có dữ liệu chi tiêu</p>
      </div>
    );

  return (
    <div className="chart-container">
      <h3>Chi tiêu tháng này</h3>
      <div className="chart-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
