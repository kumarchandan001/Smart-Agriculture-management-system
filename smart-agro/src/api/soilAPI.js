import axios from 'axios';

/**
 * Soil API Client
 * Axios instance configured for soil analysis endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const soilClient = axios.create({
  baseURL: `${API_BASE_URL}/api/soil`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
soilClient.interceptors.request.use(
  (config) => {
    // Check multiple possible token locations
    let token =
      localStorage.getItem('token') ||
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

// Response interceptor - handle errors gracefully
soilClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 401 errors to handle gracefully in components
    if (error.response?.status === 401) {
      console.warn('Unauthorized: User not authenticated');
    }
    return Promise.reject(error);
  }
);

/**
 * Analyze soil based on region or manual inputs
 *
 * @param {object} payload - Analysis parameters
 *   For region: {analysisMode: "region", state, district, block}
 *   For manual: {analysisMode: "manual", n, p, k, ph}
 * @returns {object} Analysis result with classification, health score, recommendations
 */
export const analyzeSoil = async (payload) => {
  try {
    const response = await soilClient.post('/analyze', payload);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.error || error.message || 'Failed to analyze soil',
      status: error.response?.status,
    };
  }
};

/**
 * Get user's soil test history
 *
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Results per page
 * @returns {object} History data with pagination
 */
export const getSoilHistory = async (page = 1, limit = 10) => {
  try {
    const response = await soilClient.get('/history', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.error || error.message || 'Failed to fetch soil history',
      status: error.response?.status,
    };
  }
};

/**
 * Get all soil test history (admin only)
 *
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {object} All history data
 */
export const getSoilHistoryAll = async (page = 1, limit = 10) => {
  try {
    const response = await soilClient.get('/history/all', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.error || error.message || 'Failed to fetch all soil history',
      status: error.response?.status,
    };
  }
};

export default soilClient;
