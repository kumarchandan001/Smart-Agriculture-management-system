/**
 * Knowledge API Service
 * Handles all API calls to the backend knowledge endpoints
 */

const API_BASE = 'http://localhost:3000/api/knowledge';

// Error handling utility
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Get all knowledge categories
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get crops data
 */
export const getCrops = async () => {
  try {
    const response = await fetch(`${API_BASE}/crops`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching crops:', error);
    throw error;
  }
};

/**
 * Get specific crop by ID
 */
export const getCropById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/crops/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching crop ${id}:`, error);
    throw error;
  }
};

/**
 * Get soil data
 */
export const getSoilData = async () => {
  try {
    const response = await fetch(`${API_BASE}/soil`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw error;
  }
};

/**
 * Get specific soil data by ID
 */
export const getSoilById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/soil/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching soil data ${id}:`, error);
    throw error;
  }
};

/**
 * Get pests data
 */
export const getPests = async () => {
  try {
    const response = await fetch(`${API_BASE}/pests`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching pests:', error);
    throw error;
  }
};

/**
 * Get specific pest by ID
 */
export const getPestById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/pests/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching pest ${id}:`, error);
    throw error;
  }
};

/**
 * Get fertilizers data
 */
export const getFertilizers = async () => {
  try {
    const response = await fetch(`${API_BASE}/fertilizers`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching fertilizers:', error);
    throw error;
  }
};

/**
 * Get specific fertilizer by ID
 */
export const getFertilizerById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/fertilizers/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching fertilizer ${id}:`, error);
    throw error;
  }
};

/**
 * Get weather and climate tips
 */
export const getWeatherTips = async () => {
  try {
    const response = await fetch(`${API_BASE}/weather`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching weather tips:', error);
    throw error;
  }
};

/**
 * Get market tips
 */
export const getMarketTips = async () => {
  try {
    const response = await fetch(`${API_BASE}/market`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching market tips:', error);
    throw error;
  }
};

/**
 * Get government schemes
 */
export const getSchemes = async () => {
  try {
    const response = await fetch(`${API_BASE}/schemes`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    throw error;
  }
};

/**
 * Get specific scheme by ID
 */
export const getSchemeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/schemes/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching scheme ${id}:`, error);
    throw error;
  }
};

/**
 * Search across all knowledge bases
 * @param {string} query - Search query
 * @param {string} category - Optional specific category to search
 */
export const searchKnowledge = async (query, category = null) => {
  try {
    let url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }
};

export default {
  getCategories,
  getCrops,
  getCropById,
  getSoilData,
  getSoilById,
  getPests,
  getPestById,
  getFertilizers,
  getFertilizerById,
  getWeatherTips,
  getMarketTips,
  getSchemes,
  getSchemeById,
  searchKnowledge
};
