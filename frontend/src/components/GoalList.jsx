import { useState, useEffect } from "react";
import { goalService } from "../services/api";
import "../styles/List.css";

export default function GoalList() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals();
      setGoals(response || []);
    } catch (err) {
      console.error("Error loading goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await goalService.createGoal({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
      });

      if (response.id) {
        setGoals([...goals, response]);
        setFormData({ name: "", targetAmount: "", targetDate: "" });
        setShowForm(false);
      }
    } catch (err) {
      alert("Lỗi khi tạo mục tiêu");
    }
  };

  const handleUpdateProgress = async (id, currentGoal) => {
    const newAmount = prompt(
      "Cập nhật số tiền hiện tại:",
      currentGoal.currentAmount
    );
    if (newAmount !== null) {
      try {
        const response = await goalService.updateGoalProgress(
          id,
          parseFloat(newAmount)
        );
        if (response.id) {
          loadGoals();
        }
      } catch (err) {
        alert("Lỗi khi cập nhật");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Xoá mục tiêu này?")) {
      try {
        await goalService.deleteGoal(id);
        setGoals(goals.filter((g) => g.id !== id));
      } catch (err) {
        alert("Lỗi khi xoá");
      }
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Mục Tiêu Tiết Kiệm</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Huỷ" : "+ Thêm Mục Tiêu"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-inline">
          <div className="form-group">
            <label>Tên Mục Tiêu</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Mua xe, Đi du lịch"
              required
            />
          </div>

          <div className="form-group">
            <label>Số Tiền Mục Tiêu</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({ ...formData, targetAmount: e.target.value })
              }
              placeholder="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày Hoàn Thành</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) =>
                setFormData({ ...formData, targetDate: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Lưu
          </button>
        </form>
      )}

      {goals.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Mục Tiêu</th>
              <th>Ngày Hoàn Thành</th>
              <th>Mục Tiêu</th>
              <th>Hiện Tại</th>
              <th>Tiến Độ</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => {
              const percentage = (g.currentAmount / g.targetAmount) * 100 || 0;
              return (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{new Date(g.targetDate).toLocaleDateString("vi-VN")}</td>
                  <td>{g.targetAmount.toLocaleString("vi-VN")} ₫</td>
                  <td>{g.currentAmount.toLocaleString("vi-VN")} ₫</td>
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
                      onClick={() => handleUpdateProgress(g.id, g)}
                      className="btn-secondary"
                      title="Cập nhật tiến độ"
                    >
                      Cập Nhật
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
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
        <p className="empty-message">Không có mục tiêu nào</p>
      )}
    </div>
  );
}
