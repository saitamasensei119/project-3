/**
 * Constants
 */

// API
export const API_URL = "http://localhost:5000/api";

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

// Colors
export const COLORS = {
  PRIMARY: "#667eea",
  SECONDARY: "#764ba2",
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
};

// Common Categories
export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: "Lương", type: "income" },
    { name: "Tiền Thưởng", type: "income" },
    { name: "Kinh Doanh", type: "income" },
    { name: "Đầu Tư", type: "income" },
    { name: "Khác", type: "income" },
  ],
  EXPENSE: [
    { name: "Ăn Uống", type: "expense" },
    { name: "Giáo Dục", type: "expense" },
    { name: "Giải Trí", type: "expense" },
    { name: "Giao Thông", type: "expense" },
    { name: "Y Tế", type: "expense" },
    { name: "Nhà Cửa", type: "expense" },
    { name: "Mua Sắm", type: "expense" },
    { name: "Khác", type: "expense" },
  ],
};

// Date Formats
export const DATE_FORMAT = "YYYY-MM-DD";
export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
};

// Messages
export const MESSAGES = {
  SUCCESS: "Thành công!",
  ERROR: "Có lỗi xảy ra",
  LOADING: "Đang tải...",
  DELETING: "Đang xoá...",
  SAVING: "Đang lưu...",
  CONFIRM_DELETE: "Bạn có chắc chắn muốn xoá?",
  NETWORK_ERROR: "Lỗi kết nối mạng",
  UNAUTHORIZED: "Vui lòng đăng nhập lại",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  TRANSACTIONS: "transactions",
  CATEGORIES: "categories",
  BUDGETS: "budgets",
  GOALS: "goals",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
