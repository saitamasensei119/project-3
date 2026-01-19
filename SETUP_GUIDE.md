# 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

## 1️⃣ Cài Đặt Backend

### Bước 1: Vào thư mục backend

```bash
cd backend
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `backend`:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_app
JWT_SECRET=your_secret_key_12345
```

### Bước 4: Khởi tạo Database

- Sử dụng PostgreSQL client hoặc tool như pgAdmin
- Chạy các script SQL từ thư mục `data/`
- Hoặc chạy command:

```bash
psql -U postgres -c "CREATE DATABASE finance_app;"
```

### Bước 5: Chạy server

```bash
npm run dev
```

✅ Backend chạy trên: `http://localhost:5000`

---

## 2️⃣ Cài Đặt Frontend

### Bước 1: Vào thư mục frontend

```bash
cd frontend
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy ứng dụng

```bash
npm run dev
```

✅ Frontend chạy trên: `http://localhost:5173`

---

## 3️⃣ Sử Dụng Ứng Dụng

### Đăng Ký Tài Khoản

1. Vào `/register`
2. Nhập Tên, Email, Mật khẩu
3. Click "Đăng Ký"

### Đăng Nhập

1. Vào `/login`
2. Nhập Email và Mật khẩu
3. Click "Đăng Nhập"

### Dashboard

Sau khi đăng nhập, bạn có thể:

- 📊 Xem tổng quan tài chính
- 💳 Quản lý giao dịch (thêm, sửa, xoá)
- 💼 Quản lý ngân sách hàng tháng
- 🎯 Lập và theo dõi mục tiêu tiết kiệm

---

## 4️⃣ Cấu Trúc Thư Mục Frontend

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── TransactionForm.jsx    # Form thêm giao dịch
│   │   ├── TransactionList.jsx    # Danh sách giao dịch
│   │   ├── BudgetList.jsx         # Quản lý ngân sách
│   │   ├── GoalList.jsx           # Quản lý mục tiêu
│   │   └── CategoryManager.jsx    # Quản lý danh mục
│   ├── pages/                # Trang chính
│   │   ├── Login.jsx         # Trang đăng nhập
│   │   ├── Register.jsx      # Trang đăng ký
│   │   └── Dashboard.jsx     # Trang chính
│   ├── services/             # API services
│   │   └── api.js           # Gọi API backend
│   ├── styles/               # CSS files
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Form.css
│   │   └── List.css
│   ├── App.jsx              # Root component
│   ├── App.css              # Global styles
│   ├── index.css            # Base styles
│   └── main.jsx             # Entry point
├── public/                   # Static files
├── package.json
├── vite.config.js           # Vite configuration
└── index.html
```

---

## 5️⃣ API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Transactions

- `GET /api/transaction` - Lấy tất cả
- `POST /api/transaction` - Tạo mới
- `PUT /api/transaction/:id` - Cập nhật
- `DELETE /api/transaction/:id` - Xoá

### Categories

- `GET /api/category` - Lấy tất cả
- `POST /api/category` - Tạo mới
- `PUT /api/category/:id` - Cập nhật
- `DELETE /api/category/:id` - Xoá

### Budgets

- `GET /api/budget` - Lấy tất cả
- `POST /api/budget` - Tạo mới
- `PUT /api/budget/:id` - Cập nhật
- `DELETE /api/budget/:id` - Xoá

### Goals

- `GET /api/goal` - Lấy tất cả
- `POST /api/goal` - Tạo mới
- `PUT /api/goal/:id` - Cập nhật
- `PATCH /api/goal/:id/progress` - Cập nhật tiến độ
- `DELETE /api/goal/:id` - Xoá

---

## 6️⃣ Troubleshooting

### Lỗi: "Cannot GET /api/transaction"

- Kiểm tra backend có chạy trên port 5000
- Kiểm tra file `.env` trong backend

### Lỗi: "CORS error"

- Kiểm tra CORS middleware trong `app.js`
- Đảm bảo frontend URL được cho phép

### Lỗi: "Database connection failed"

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra credentials trong `.env`
- Kiểm tra database đã được tạo

### Lỗi: "Module not found"

- Chạy `npm install` lại
- Xoá folder `node_modules` và `package-lock.json`, rồi cài lại

---

## 7️⃣ Tính Năng Chính

✅ **Authentication**: JWT-based login/register
✅ **Transactions**: CRUD operations cho giao dịch
✅ **Categories**: Quản lý danh mục chi tiêu/thu nhập
✅ **Budgets**: Theo dõi ngân sách hàng tháng
✅ **Goals**: Lập mục tiêu tiết kiệm với tracking
✅ **Dashboard**: Tổng quan tài chính với overview cards
✅ **Responsive**: Hoạt động tốt trên mobile/tablet/desktop
✅ **Modern UI**: Gradient designs, smooth animations

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra xem server backend có chạy không
2. Kiểm tra biến môi trường
3. Xem console để tìm error messages
4. Đảm bảo database đã được khởi tạo

---

**Chúc bạn sử dụng ứng dụng vui vẻ!** 🎉
