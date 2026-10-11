/**
 * Expense API Client
 * Axios instance for frontend API communication with JWT interceptors
 */

import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'https://smart-agri-backend-ole9.onrender.com';
const ROOT_URL = RAW_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
const API_BASE_URL = `${ROOT_URL}/api`;

// Create axios instance with base URL
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor to attach JWT token
 */
API.interceptors.request.use(
  (config) => {
    // Try multiple possible token keys
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for error handling
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect on 401
    // Let components handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      // Don't redirect here - let the app handle it
    }
    return Promise.reject(error);
  }
);

// ========== Expense CRUD Operations ==========

export const expenseAPI = {
  /**
   * Create a new expense
   */
  create: (data) =>
    API.post('/expenses', data),

  /**
   * Get a single expense
   */
  getOne: (id) =>
    API.get(`/expenses/${id}`),

  /**
   * Update an expense
   */
  update: (id, data) =>
    API.put(`/expenses/${id}`, data),

  /**
   * Delete an expense
   */
  delete: (id) =>
    API.delete(`/expenses/${id}`),

  /**
   * List expenses with filters
   * @param {Object} filters - { dateFrom, dateTo, category, crop, page, limit, sort }
   */
  list: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return API.get('/expenses', { params });
  },

  /**
   * Upload receipt for an expense
   */
  uploadReceipt: (id, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return API.post(`/expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ========== Summary & Analytics ==========

  /**
   * Get category-wise summary
   */
  summaryByCategory: (dateFrom, dateTo) =>
    API.get('/expenses/summary/category', {
      params: { from: dateFrom, to: dateTo }
    }),

  /**
   * Get crop-wise summary
   */
  summaryByCrop: (dateFrom, dateTo) =>
    API.get('/expenses/summary/crop', {
      params: { from: dateFrom, to: dateTo }
    }),

  /**
   * Get seasonal summary
   */
  seasonalSummary: (season) =>
    API.get('/expenses/summary/season', {
      params: { season }
    }),

  /**
   * Get time series data for charting
   */
  timeserieSummary: (dateFrom, dateTo) =>
    API.get('/expenses/summary/timeseries', {
      params: { from: dateFrom, to: dateTo }
    }),

  /**
   * Get expenses for a specific crop
   */
  getExpensesForCrop: (cropName, areaHa) =>
    API.get(`/expenses/crop/${cropName}`, {
      params: { areaHa }
    }),

  /**
   * Get monthly budget status
   */
  getBudgetStatus: (limit) =>
    API.get('/expenses/budget/status', {
      params: { limit }
    }),

  /**
   * Calculate cost per acre
   */
  calculateCostPerAcre: (totalExpense, areaHa) =>
    API.post('/expenses/calculate/costPerAcre', {
      totalExpense,
      areaHa
    }),

  /**
   * Calculate ROI
   */
  calculateROI: (totalExpense, yieldQty, pricePerUnit) =>
    API.post('/expenses/calculate/roi', {
      totalExpense,
      yieldQty,
      pricePerUnit
    })
};

export default API;
