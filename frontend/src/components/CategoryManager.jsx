import { useState, useEffect } from "react";
import { categoryService } from "../services/api";
import "../styles/List.css";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    try {
      const response = await categoryService.createCategory(
        formData.name,
        formData.type
      );

      if (response && response.id) {
        setCategories([...categories, response]);
        setFormData({ name: "", type: "expense" });
        setShowForm(false);
        alert("Tạo danh mục thành công");
      } else {
        alert("Lỗi: Không nhận được phản hồi từ server");
        console.log("Response:", response);
      }
    } catch (err) {
      console.error("Create category error:", err);
      alert(err.message || "Lỗi khi tạo danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Xoá danh mục này?")) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
      } catch (err) {
        alert("Lỗi khi xoá");
      }
    }
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
              <option value="savings">Tiết Kiệm</option>
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
                      : c.type === "savings"
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
    </div>
  );
}
