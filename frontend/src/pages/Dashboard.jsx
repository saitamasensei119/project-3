import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransactionList from "../components/TransactionList";
import TransactionForm from "../components/TransactionForm";
import BudgetList from "../components/BudgetList";
import GoalList from "../components/GoalList";
import CategoryManager from "../components/CategoryManager";
import ExpenseByCategoryChart from "../components/ExpenseByCategoryChart";
import IncomeVsExpenseChart from "../components/IncomeVsExpenseChart";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>💰 Quản Lý Tài Chính</h1>
        </div>
        <div className="header-right">
          <span>Xin chào, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Đăng Xuất
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Tổng Quan
        </button>
        <button
          className={`nav-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          📂 Danh Mục
        </button>
        <button
          className={`nav-btn ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          💳 Giao Dịch
        </button>
        <button
          className={`nav-btn ${activeTab === "budgets" ? "active" : ""}`}
          onClick={() => setActiveTab("budgets")}
        >
          💼 Ngân Sách
        </button>
        <button
          className={`nav-btn ${activeTab === "goals" ? "active" : ""}`}
          onClick={() => setActiveTab("goals")}
        >
          🎯 Mục Tiêu
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "overview" && <Overview />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "budgets" && <BudgetList />}
        {activeTab === "goals" && <GoalList />}
      </main>
    </div>
  );
}

function Overview() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      const token = localStorage.getItem("token");

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const res = await fetch(
        `http://localhost:5000/api/transactions?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const income = data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotalIncome(income);
      setTotalExpense(expense);
      setRecentTransactions(data.slice(0, 5));
    };

    fetchOverview();
  }, []);

  return (
    <div className="overview">
      <div className="overview-cards">
        <div className="card income-card">
          <h3>Thu Nhập</h3>
          <p className="amount">{totalIncome.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="card expense-card">
          <h3>Chi Tiêu</h3>
          <p className="amount">{totalExpense.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="card balance-card">
          <h3>Số Dư</h3>
          <p className="amount">
            {(totalIncome - totalExpense).toLocaleString("vi-VN")} ₫
          </p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <ExpenseByCategoryChart />
        </div>
        <div className="chart-wrapper">
          <IncomeVsExpenseChart />
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Giao Dịch Gần Đây</h2>
        {recentTransactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô Tả</th>
                <th>Loại</th>
                <th>Số Tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr key={i}>
                  <td>{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                  <td>{t.description}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.type === "income" ? "income" : "expense"
                      }`}
                    >
                      {t.type === "income" ? "Thu Nhập" : "Chi Tiêu"}
                    </span>
                  </td>
                  <td className={t.type === "income" ? "text-green" : ""}>
                    {t.amount.toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Chưa có giao dịch nào</p>
        )}
      </div>
    </div>
  );
}

function TransactionsTab() {
  return (
    <div className="transactions-tab">
      <TransactionForm />
      <TransactionList />
    </div>
  );
}
