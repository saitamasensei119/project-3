import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { transactionService } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function IncomeVsExpenseChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const transactions = await transactionService.getTransactions();

      // Group by month
      const monthlyData = {};
      transactions.forEach((t) => {
        const date = new Date(t.date);
        const month = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (t.type === "income") {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += t.amount;
        }
      });

      // Sort by month
      const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [aM, aY] = a.split("/").map(Number);
        const [bM, bY] = b.split("/").map(Number);
        if (aY !== bY) return aY - bY;
        return aM - bM;
      });

      // Get last 6 months or all if less
      const months = sortedMonths.slice(-6);
      const incomeData = months.map((m) => monthlyData[m].income);
      const expenseData = months.map((m) => monthlyData[m].expense);

      setChartData({
        labels: months,
        datasets: [
          {
            label: "Thu nhập",
            data: incomeData,
            backgroundColor: "#10b981",
            borderColor: "#059669",
            borderWidth: 1,
            borderRadius: 5,
            hoverBackgroundColor: "#059669",
          },
          {
            label: "Chi tiêu",
            data: expenseData,
            backgroundColor: "#ef4444",
            borderColor: "#dc2626",
            borderWidth: 1,
            borderRadius: 5,
            hoverBackgroundColor: "#dc2626",
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
        position: "top",
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString(
              "vi-VN"
            )} ₫`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return value.toLocaleString("vi-VN");
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
        <p className="empty-message">Chưa có dữ liệu giao dịch</p>
      </div>
    );

  return (
    <div className="chart-container">
      <h3>Thu nhập vs Chi tiêu (6 tháng gần đây)</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
