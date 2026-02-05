import { useState, useEffect } from "react";
import { categoryService } from "../services/api";
import "../styles/List.css";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên danh mục");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      const response = await categoryService.createCategory(
        formData.name,
        formData.type,
      );

      if (response && response.id) {
        setCategories([...categories, response]);
        setFormData({ name: "", type: "expense" });
        setShowForm(false);
        setSuccess("Tạo danh mục thành công");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Lỗi: Không nhận được phản hồi từ server");
        setTimeout(() => setError(""), 3000);
        console.log("Response:", response);
      }
    } catch (err) {
      console.error("Create category error:", err);
      setError(err.message || "Lỗi khi tạo danh mục");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    console.log("handleDelete clicked", id);
    // Trigger inline confirmation first
    setPendingDelete(id);
  };

  const confirmDelete = async (id) => {
    try {
      const res = await categoryService.deleteCategory(id);
      // backend returns { message } on success
      setCategories(categories.filter((c) => c.id !== id));
      setSuccess(res?.message || "Đã xoá danh mục");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete category error:", err);
      setError(err.message || "Lỗi khi xoá danh mục");
      setTimeout(() => setError(""), 3000);
    } finally {
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Danh Mục</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Huỷ" : "+ Thêm Danh Mục"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-inline">
          <div className="form-group">
            <label>Tên Danh Mục</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Ăn uống, Giáo dục"
              required
            />
          </div>

          <div className="form-group">
            <label>Loại</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            >
              <option value="expense">Chi Tiêu</option>
              <option value="income">Thu Nhập</option>
              <option value="saving">Tiết Kiệm</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Lưu
          </button>
        </form>
      )}

      {categories.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Loại</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <span className={`badge ${c.type}`}>
                    {c.type === "income"
                      ? "Thu Nhập"
                      : c.type === "saving"
                        ? "Tiết Kiệm"
                        : "Chi Tiêu"}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(c.id)}
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
        <p className="empty-message">Không có danh mục nào</p>
      )}

      {/* Confirmation modal */}
      {pendingDelete &&
        (() => {
          const deleting = categories.find((it) => it.id === pendingDelete);
          return (
            <div className="modal-overlay">
              <div className="confirm-modal">
                <h3>Xác nhận xoá</h3>
                <p>
                  Bạn có chắc chắn muốn xoá danh mục{" "}
                  <strong>{deleting?.name}</strong> không?
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
