// services/model.service.js
// Responsible for calling the ML microservice and providing a safe fallback

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger') || console;

/**
 * Predict using the external ML service.
 * If the ML service is unreachable or errors, fall back to a lightweight heuristic.
 * @param {Object} input - prediction input ({ crop, ideal_n, ideal_p, ideal_k, ideal_ph, temp_c, rainfall_mm })
 * @returns {Promise<Object>} - { predicted_yield, model_version }
 */
async function predict(input) {
  const mlUrl = (config.ML_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
  try {
    const resp = await axios.post(`${mlUrl}/predict`, input, { timeout: 8000 });
    if (resp && resp.data) return resp.data;
    throw new Error('Empty response from ML service');
  } catch (err) {
    // Log error and use fallback
    logger.error('ML service call failed:', err.message || err.toString());
    // Lightweight heuristic fallback: combine nutrients and environment to form a plausible yield
    const n = Number(input.ideal_n) || 0;
    const p = Number(input.ideal_p) || 0;
    const k = Number(input.ideal_k) || 0;
    const temp = Number(input.temp_c) || 25;
    const rain = Number(input.rainfall_mm) || 100;

    // Heuristic: base yield proportional to average NPK, adjusted by temp and rainfall
    const base = (n + p + k) / 3;
    // scale and clamp
    let predicted = base * 0.12 + (temp - 20) * 0.02 + Math.log1p(rain) * 0.12;
    if (!isFinite(predicted) || predicted <= 0) predicted = 1.0;
    predicted = Math.round(predicted * 1000) / 1000;

    return { predicted_yield: predicted, model_version: 'fallback' };
  }
}

module.exports = { predict };
