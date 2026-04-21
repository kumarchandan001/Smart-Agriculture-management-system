// services/crop.service.js
const Crop = require('../models/crop.model');

/**
 * List all crops (optionally with pagination in future)
 */
async function listCrops() {
  return Crop.find().sort({ crop: 1 }).lean();
}

/**
 * Get a single crop by id
 * @param {String} id - Mongo ObjectId string
 */
async function getCrop(id) {
  return Crop.findById(id).lean();
}

/**
 * Create a new crop document
 * @param {Object} payload - fields matching Crop schema
 */
async function createCrop(payload) {
  const doc = new Crop(payload);
  await doc.save();
  return doc.toObject();
}

/**
 * Update crop by id
 * @param {String} id
 * @param {Object} payload
 */
async function updateCrop(id, payload) {
  return Crop.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
}

/**
 * Delete crop by id
 * @param {String} id
 */
async function deleteCrop(id) {
  return Crop.findByIdAndDelete(id);
}

module.exports = {
  listCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop
};
