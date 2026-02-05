import { useState, useEffect } from "react";
import { transactionService } from "../services/api";
import "../styles/List.css";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  // Listen for newly created transactions so the list updates immediately
  useEffect(() => {
    const handler = (e) => {
      const newTx = e?.detail;
      if (newTx) setTransactions((prev) => [newTx, ...prev]);
    };

    window.addEventListener("transactions:created", handler);
    return () => window.removeEventListener("transactions:created", handler);
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

  const handleDelete = (id) => {
    setPendingDelete(id);
  };

  const confirmDelete = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      setSuccess("Đã xoá giao dịch");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete transaction error:", err);
      setError(err.message || "Lỗi khi xoá giao dịch");
      setTimeout(() => setError(""), 3000);
    } finally {
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
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

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

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

      {/* Confirmation modal */}
      {pendingDelete &&
        (() => {
          const deleting = filteredTransactions.find(
            (it) => it.id === pendingDelete,
          );
          return (
            <div className="modal-overlay">
              <div className="confirm-modal">
                <h3>Xác nhận xoá giao dịch</h3>
                <p>
                  Bạn có chắc chắn muốn xoá giao dịch{" "}
                  <strong>{deleting?.description}</strong> (
                  {deleting?.amount.toLocaleString("vi-VN")} ₫) không?
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => confirmDelete(pendingDelete)}
                    className="btn-delete"
                  >
                    Xoá
                  </button>
                  <button onClick={cancelDelete} className="btn-secondary">
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
