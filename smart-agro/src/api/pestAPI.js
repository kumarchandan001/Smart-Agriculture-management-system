import axios from 'axios';

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

/**
 * Pest Detection APIs
 */
export const detectPestFromSymptoms = async (symptoms, crop) => {
  try {
    const response = await api.post('/pests/detect/symptoms', {
      symptoms,
      crop,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const detectPestFromImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/pests/detect/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Pest Record APIs (CRUD)
 */
export const createPestRecord = async (data) => {
  try {
    const response = await api.post('/pests', data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const getPestRecords = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });

    const response = await api.get(`/pests?${params}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const getPestRecord = async (id) => {
  try {
    const response = await api.get(`/pests/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const updatePestRecord = async (id, data) => {
  try {
    const response = await api.put(`/pests/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const deletePestRecord = async (id) => {
  try {
    const response = await api.delete(`/pests/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Summary APIs
 */
export const getPestSummary = async () => {
  try {
    const response = await api.get('/pests/summary/pest');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const getCropSummary = async () => {
  try {
    const response = await api.get('/pests/summary/crop');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const getSeasonalSummary = async () => {
  try {
    const response = await api.get('/pests/summary/season');
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Region Alerts
 */
export const getRegionAlerts = async (state, district) => {
  try {
    const response = await api.get('/pests/alerts/region', {
      params: { state, district },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export default api;
