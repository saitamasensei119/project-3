/**
 * Utility Functions
 */

/**
 * Format currency to Vietnamese Dong
 */
export const formatCurrency = (amount) => {
  return amount.toLocaleString("vi-VN");
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

/**
 * Format datetime
 */
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

/**
 * Check if date is this month
 */
export const isThisMonth = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Get month name
 */
export const getMonthName = (monthNumber) => {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return months[monthNumber];
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  return total === 0 ? 0 : Math.round((value / total) * 100);
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 */
export const isValidPassword = (password) => {
  return password.length >= 6;
};

/**
 * Group transactions by date
 */
export const groupByDate = (transactions) => {
  const grouped = {};
  transactions.forEach((t) => {
    const date = new Date(t.date).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(t);
  });
  return grouped;
};

/**
 * Group transactions by category
 */
export const groupByCategory = (transactions) => {
  const grouped = {};
  transactions.forEach((t) => {
    const category = t.categoryName || "Khác";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(t);
  });
  return grouped;
};

/**
 * Calculate sum of amounts
 */
export const sumAmounts = (transactions) => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculate average amount
 */
export const averageAmount = (transactions) => {
  if (transactions.length === 0) return 0;
  return sumAmounts(transactions) / transactions.length;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = () => {
  return "₫";
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Local storage helper
 */
export const storage = {
  get: (key, defaultValue = null) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

/**
 * Error handler
 */
export const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.message || "Lỗi từ server";
  } else if (error.request) {
    // Request made but no response
    return "Không thể kết nối đến server";
  } else {
    // Error in request setup
    return error.message || "Lỗi không xác định";
  }
};
