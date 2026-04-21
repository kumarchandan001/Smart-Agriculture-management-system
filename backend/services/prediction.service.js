// services/prediction.service.js
const Prediction = require('../models/prediction.model');

/**
 * Create and save a prediction record
 * @param {Object} param0
 * @param {String|null} param0.userId - MongoDB ObjectId string (or null)
 * @param {String} param0.crop
 * @param {Object} param0.input_values
 * @param {Number} param0.predicted_yield
 * @param {String} param0.model_version
 * @returns {Promise<Object>} saved prediction doc
 */
async function createPrediction({ userId = null, crop, input_values = {}, predicted_yield = null, model_version = 'unknown' }) {
  const doc = new Prediction({
    user_id: userId,
    crop,
    input_values,
    predicted_yield,
    model_version
  });
  await doc.save();
  return doc.toObject();
}

/**
 * Get a prediction by its id
 * @param {String} id
 * @returns {Promise<Object|null>}
 */
async function getPredictionById(id) {
  return Prediction.findById(id).lean();
}

/**
 * List predictions for a user (most recent first)
 * @param {String} userId
 * @param {Number} limit
 * @param {Number} skip
 * @returns {Promise<Array>}
 */
async function listPredictionsForUser(userId, limit = 100, skip = 0) {
  return Prediction.find({ user_id: userId })
    .sort({ created_at: -1 })
    .skip(Number(skip) || 0)
    .limit(Number(limit) || 100)
    .lean();
}

/**
 * List recent predictions across all users (admin)
 * @param {Number} limit
 * @returns {Promise<Array>}
 */
async function listRecent(limit = 200) {
  return Prediction.find()
    .sort({ created_at: -1 })
    .limit(Number(limit) || 200)
    .lean();
}

/**
 * Delete a prediction by id
 * @param {String} id
 * @returns {Promise<Object|null>}
 */
async function deletePredictionById(id) {
  return Prediction.findByIdAndDelete(id);
}

module.exports = {
  createPrediction,
  getPredictionById,
  listPredictionsForUser,
  listRecent,
  deletePredictionById
};
