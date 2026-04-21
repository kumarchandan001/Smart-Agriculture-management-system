// services/field.service.js
const Field = require('../models/field.model');

/**
 * List fields for a user
 * @param {String} userId
 */
async function listFieldsForUser(userId) {
  if (!userId) return [];
  return Field.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

/**
 * Get a single field by id
 * @param {String} id
 */
async function getField(id) {
  return Field.findById(id).lean();
}

/**
 * Create a field
 * payload should contain user_id, field_name, farm_name, area_ha (optional), soil_type, ph, location
 */
async function createField(payload) {
  const doc = new Field(payload);
  await doc.save();
  return doc.toObject();
}

/**
 * Update a field
 */
async function updateField(id, payload) {
  return Field.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
}

/**
 * Delete a field
 */
async function deleteField(id) {
  return Field.findByIdAndDelete(id);
}

module.exports = {
  listFieldsForUser,
  getField,
  createField,
  updateField,
  deleteField
};
