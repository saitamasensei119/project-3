/**
 * API Service
 * Xử lý tất cả các request tới backend
 */

const API_URL = "http://localhost:5000/api";

// Normalize backend objects to frontend-friendly shapes
const normalizeCategory = (c) => ({
  id: c.category_id ?? c.id,
  name: c.name,
  type: c.type,
  icon: c.icon,
  is_default: c.is_default ?? c.isDefault,
});

const normalizeBudget = (b) => ({
  id: b.budget_id ?? b.id,
  categoryName: b.category_name ?? b.categoryName,
  amount: b.limit_amount ?? b.amount,
  spentAmount: b.spent_amount ?? b.spentAmount ?? 0,
  month: b.month,
  year: b.year,
  isOverBudget: b.is_over_budget ?? b.isOverBudget ?? false,
});

const normalizeTransaction = (t) => ({
  id: t.transaction_id ?? t.id,
  description: t.note ?? t.description,
  amount: Number(t.amount),
  type: t.type,
  categoryName: t.category_name || t.categoryName || "Khác",
  date: t.date,
});

const normalizeGoal = (g) => ({
  id: g.goal_id ?? g.id,
  name: g.title ?? g.name,
  targetAmount: g.target_amount ?? g.targetAmount,
  currentAmount: g.current_amount ?? g.currentAmount ?? 0,
  targetDate: g.deadline ?? g.targetDate,
});

/**
 * Get JWT token từ localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Set Authorization header
 */
const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

/**
 * Auth Service
 */
export const authService = {
  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

/**
 * Category Service
 */
export const categoryService = {
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeCategory) : [];
  },

  createCategory: async (name, type) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, type }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Lỗi khi tạo danh mục");
    }
    return data ? normalizeCategory(data) : data;
  },

  updateCategory: async (id, name, type) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ name, type }),
    });
    const data = await response.json();
    return data ? normalizeCategory(data) : data;
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};

/**
 * Transaction Service
 */
export const transactionService = {
  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append("month", params.month);
    if (params.year) queryParams.append("year", params.year);

    const url = queryParams.toString()
      ? `${API_URL}/transactions?${queryParams.toString()}`
      : `${API_URL}/transactions`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTransaction) : [];
  },

  createTransaction: async (data) => {
    const payload = {
      type: data.type,
      amount: Math.round(Number(data.amount)),
      category_id: data.categoryId || null,
      note: data.description,
      date: data.date,
    };
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    return resData ? normalizeTransaction(resData) : resData;
  },

  updateTransaction: async (id, data) => {
    const payload = {
      type: data.type,
      amount: data.amount,
      category_id: data.categoryId || null,
      note: data.description,
      date: data.date,
    };
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    return resData ? normalizeTransaction(resData) : resData;
  },

  deleteTransaction: async (id) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};

/**
 * Budget Service
 */
export const budgetService = {
  getBudgets: async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const response = await fetch(
      `${API_URL}/budgets?month=${month}&year=${year}`,
      {
        headers: getHeaders(),
      }
    );
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeBudget) : [];
  },

  createBudget: async (data) => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData ? normalizeBudget(resData) : resData;
  },

  updateBudget: async (id, data) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData ? normalizeBudget(resData) : resData;
  },

  deleteBudget: async (id) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};

/**
 * Goal Service
 */
export const goalService = {
  getGoals: async () => {
    const response = await fetch(`${API_URL}/goals`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeGoal) : [];
  },

  createGoal: async (data) => {
    const payload = {
      title: data.name,
      target_amount: data.targetAmount,
      deadline: data.targetDate || null,
    };
    const response = await fetch(`${API_URL}/goals`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    return resData ? normalizeGoal(resData) : resData;
  },

  updateGoal: async (id, data) => {
    const payload = {
      title: data.name,
      target_amount: data.targetAmount,
      deadline: data.targetDate || null,
    };
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    return resData ? normalizeGoal(resData) : resData;
  },

  updateGoalProgress: async (id, currentAmount) => {
    const response = await fetch(`${API_URL}/goals/${id}/progress`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ amount: currentAmount }),
    });
    const resData = await response.json();
    return resData ? normalizeGoal(resData) : resData;
  },

  deleteGoal: async (id) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
