// api.js — Axios based clean API wrapper

import axios from "axios";

const RAW_URL = import.meta.env.VITE_API_URL || "https://smart-agri-backend-ole9.onrender.com";
// Strip trailing /api and trailing slash so ROOT_URL is always the origin domain
export const ROOT_URL = RAW_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
export const API_BASE_URL = `${ROOT_URL}/api`;

function normalizePath(p) {
  if (!p) return "/api";
  let clean = p.startsWith("/") ? p : `/${p}`;
  if (!clean.startsWith("/api/")) {
    clean = `/api${clean}`;
  }
  return clean;
}

// -------------------------------------------------
// Axios Instance
// -------------------------------------------------
const apiClient = axios.create({
  baseURL: ROOT_URL,
  headers: {
    Accept: "application/json",
  },
});

// -------------------------------------------------
// Automatically attach token if exists
// -------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token");

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
      body: error.response?.data || { message: error.message || "Unknown error" },
    };
    return Promise.reject(err);
  }
);

// -------------------------------------------------
// API Methods
// -------------------------------------------------
export const api = {
  get: (path, params) => apiClient.get(normalizePath(path), { params }),
  post: (path, data, config) => apiClient.post(normalizePath(path), data, config),
  put: (path, data, config) => apiClient.put(normalizePath(path), data, config),
  delete: (path) => apiClient.delete(normalizePath(path)),
};

export default api;
