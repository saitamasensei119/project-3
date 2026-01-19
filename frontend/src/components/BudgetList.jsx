import { useState, useEffect } from "react";
import { budgetService, categoryService } from "../services/api";
import BudgetDetail from "./BudgetDetail";
import "../styles/List.css";

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategories(),
      ]);
      setBudgets(budgetsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const [yearStr, monthStr] = [
        formData.month.split("-")[0],
        formData.month.split("-")[1],
      ];
      const payload = {
        category_id: parseInt(formData.categoryId) || null,
        limit_amount: parseFloat(formData.amount),
        month: parseInt(monthStr, 10),
        year: parseInt(yearStr, 10),
      };

      const response = await budgetService.createBudget(payload);

      if (response && response.id) {
        setBudgets([...budgets, response]);
        setFormData({
          categoryId: "",
          amount: "",
          month: new Date().toISOString().slice(0, 7),
        });
        setShowForm(false);
      }
    } catch (err) {
      alert("Lỗi khi tạo ngân sách");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Xoá ngân sách này?")) {
      try {
        await budgetService.deleteBudget(id);
        setBudgets(budgets.filter((b) => b.id !== id));
      } catch (err) {
        alert("Lỗi khi xoá");
      }
    }
  };

  if (loading) return <p>Đang tải...</p>;

  if (selectedBudget) {
    return (
      <BudgetDetail
        budget={selectedBudget}
        onBack={() => setSelectedBudget(null)}
      />
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Ngân Sách</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Huỷ" : "+ Thêm Ngân Sách"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-inline">
          <div className="form-group">
            <label>Danh Mục</label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Số Tiền</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Tháng</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Lưu
          </button>
        </form>
      )}

      {budgets.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Danh Mục</th>
              <th>Tháng</th>
              <th>Ngân Sách</th>
              <th>Chi Tiêu</th>
              <th>Tiến Độ</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => {
              const percentage = (b.spentAmount / b.amount) * 100 || 0;
              return (
                <tr key={b.id}>
                  <td>{b.categoryName || "---"}</td>
                  <td>{b.month}</td>
                  <td>{b.amount.toLocaleString("vi-VN")} ₫</td>
                  <td>{b.spentAmount.toLocaleString("vi-VN")} ₫</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(percentage)}%</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedBudget(b)}
                      className="btn-secondary"
                      title="Xem chi tiết"
                    >
                      Chi Tiết
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="btn-delete"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="empty-message">Không có ngân sách nào</p>
      )}
    </div>
  );
}
