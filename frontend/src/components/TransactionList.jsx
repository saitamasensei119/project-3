import { useState, useEffect } from "react";
import { transactionService } from "../services/api";
import "../styles/List.css";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionService.getTransactions();
      setTransactions(response || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá giao dịch này?")) {
      try {
        await transactionService.deleteTransaction(id);
        setTransactions(transactions.filter((t) => t.id !== id));
      } catch (err) {
        alert("Lỗi khi xoá giao dịch");
      }
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "income") return t.type === "income";
    if (filter === "expense") return t.type === "expense";
    return true;
  });

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="list-container">
      <h2>Danh Sách Giao Dịch</h2>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tất Cả
        </button>
        <button
          className={`filter-btn ${filter === "income" ? "active" : ""}`}
          onClick={() => setFilter("income")}
        >
          Thu Nhập
        </button>
        <button
          className={`filter-btn ${filter === "expense" ? "active" : ""}`}
          onClick={() => setFilter("expense")}
        >
          Chi Tiêu
        </button>
      </div>

      {filteredTransactions.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Mô Tả</th>
              <th>Danh Mục</th>
              <th>Loại</th>
              <th>Số Tiền</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                <td>{t.description}</td>
                <td>{t.categoryName || "---"}</td>
                <td>
                  <span className={`badge ${t.type}`}>
                    {t.type === "income" ? "Thu Nhập" : "Chi Tiêu"}
                  </span>
                </td>
                <td className={t.type === "income" ? "text-green" : "text-red"}>
                  {t.amount.toLocaleString("vi-VN")} ₫
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="btn-delete"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty-message">Không có giao dịch nào</p>
      )}
    </div>
  );
}
