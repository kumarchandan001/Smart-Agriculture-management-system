// api.js — Axios based clean API wrapper

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// -------------------------------------------------
// Axios Instance
// -------------------------------------------------
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// -------------------------------------------------
// Automatically attach token if exists
// -------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------------------------------------
// Standard error format
// -------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const err = {
      status: error.response?.status || 500,
      body: error.response?.data || { message: "Unknown error" },
    };
    return Promise.reject(err);
  }
);

// -------------------------------------------------
// API Methods
// -------------------------------------------------
export const api = {
  get: (path, params) => apiClient.get(path, { params }),
  post: (path, data) => apiClient.post(path, data),
  put: (path, data) => apiClient.put(path, data),
  delete: (path) => apiClient.delete(path),
};

export default api;
