import { useState, useEffect } from "react";
import { transactionService, categoryService } from "../services/api";
import "../styles/Form.css";

export default function TransactionForm() {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    categoryId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
      };

      const response = await transactionService.createTransaction(dataToSubmit);

      if (response.id) {
        // Save to localStorage for offline support
        const transactions =
          JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push(response);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        setFormData({
          amount: "",
          type: "expense",
          categoryId: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        });
        setSuccess("Giao dịch tạo thành công!");
        setError("");
        // Auto dismiss success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Tạo giao dịch thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="form-container">
      <h2>Thêm Giao Dịch Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Loại Giao Dịch</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Chi Tiêu</option>
              <option value="income">Thu Nhập</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số Tiền</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Danh Mục</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ngày</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mô Tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả giao dịch"
            rows="3"
          ></textarea>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Đang lưu..." : "Lưu Giao Dịch"}
        </button>
      </form>
    </div>
  );
}
