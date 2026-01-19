# 💰 Quản Lý Tài Chính Cá Nhân

Ứng dụng quản lý tài chính cá nhân với React và Node.js/Express.

## 🚀 Tính Năng

- ✅ **Xác Thực**: Đăng ký, đăng nhập với JWT
- ✅ **Quản Lý Giao Dịch**: Thêm, sửa, xoá giao dịch chi tiêu/thu nhập
- ✅ **Danh Mục**: Tạo danh mục chi tiêu/thu nhập
- ✅ **Ngân Sách**: Đặt và theo dõi ngân sách hàng tháng
- ✅ **Mục Tiêu Tiết Kiệm**: Lập mục tiêu tiết kiệm và theo dõi tiến độ
- ✅ **Dashboard**: Tổng quan tài chính

## 📋 Yêu Cầu

- Node.js v16+
- npm hoặc yarn
- PostgreSQL

## 🛠️ Cài Đặt

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy trên: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy trên: `http://localhost:5173`

## 📁 Cấu Trúc

```
frontend/src/
├── components/
│   ├── TransactionForm.jsx
│   ├── TransactionList.jsx
│   ├── BudgetList.jsx
│   └── GoalList.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
├── services/
│   └── api.js
└── styles/
    ├── Auth.css
    ├── Dashboard.css
    ├── Form.css
    └── List.css
```

## 🔐 Tính Năng Bảo Mật

- JWT authentication
- Password hashing với bcrypt
- Protected API routes

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
