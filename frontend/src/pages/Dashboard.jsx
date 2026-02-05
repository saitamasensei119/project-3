import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TransactionList from "../components/TransactionList";
import TransactionForm from "../components/TransactionForm";
import BudgetList from "../components/BudgetList";
import GoalList from "../components/GoalList";
import CategoryManager from "../components/CategoryManager";
import ExpenseByCategoryChart from "../components/ExpenseByCategoryChart";
import IncomeVsExpenseChart from "../components/IncomeVsExpenseChart";
import AIInsights from "../components/AIInsights";
import { AuthContext } from "../contexts/AuthContext";
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

  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout(); // ❗ xóa STATE
    navigate("/login", { replace: true });
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

      <main className="dashboard-content">
        {activeTab === "overview" && <Overview />}
        {activeTab === "insights" && <AIInsights />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "budgets" && <BudgetList />}
        {activeTab === "goals" && <GoalList />}
      </main>

      <nav className="dashboard-nav-bottom">
        <button
          className={`nav-btn-bottom ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          title="Tổng Quan"
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Tổng Quan</span>
        </button>
        <button
          className={`nav-btn-bottom ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
          title="Danh Mục"
        >
          <span className="nav-icon">📂</span>
          <span className="nav-label">Danh Mục</span>
        </button>
        <button
          className={`nav-btn-bottom ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
          title="Giao Dịch"
        >
          <span className="nav-icon">💳</span>
          <span className="nav-label">Giao Dịch</span>
        </button>
        <button
          className={`nav-btn-bottom ${activeTab === "budgets" ? "active" : ""}`}
          onClick={() => setActiveTab("budgets")}
          title="Ngân Sách"
        >
          <span className="nav-icon">💼</span>
          <span className="nav-label">Ngân Sách</span>
        </button>
        <button
          className={`nav-btn-bottom ${activeTab === "goals" ? "active" : ""}`}
          onClick={() => setActiveTab("goals")}
          title="Mục Tiêu"
        >
          <span className="nav-icon">🎯</span>
          <span className="nav-label">Mục Tiêu</span>
        </button>
      </nav>
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
        },
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
