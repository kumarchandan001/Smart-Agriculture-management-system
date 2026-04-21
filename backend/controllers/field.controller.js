// controllers/field.controller.js
const fieldService = require('../services/field.service');
const Field = require('../models/field.model');

/**
 * List fields for user
 */
async function listForUser(req, res) {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id query parameter required' });
    const list = await fieldService.listFieldsForUser(userId);
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list fields' });
  }
}

/**
 * Get single field
 */
async function getOne(req, res) {
  try {
    const f = await fieldService.getField(req.params.id);
    if (!f) return res.status(404).json({ error: 'Field not found' });
    return res.json(f);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get field' });
  }
}

/**
 * Create field
 */
async function create(req, res) {
  try {
    const payload = req.body;
    // Ensure user creating is same as token user (if token provided)
    if (req.user && String(req.user.id) !== String(payload.user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only create fields for yourself unless admin' });
    }
    if (!payload.user_id) return res.status(400).json({ error: 'user_id is required' });
    const created = await fieldService.createField(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to create field' });
  }
}

/**
 * Update field — allow if owner or admin
 */
async function update(req, res) {
  try {
    const id = req.params.id;
    const field = await Field.findById(id);
    if (!field) return res.status(404).json({ error: 'Field not found' });

    // ownership check
    if (req.user && String(req.user.id) !== String(field.user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden — you do not own this field' });
    }

    const updated = await fieldService.updateField(id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to update field' });
  }
}

/**
 * Delete field — allow if owner or admin
 */
async function remove(req, res) {
  try {
    const id = req.params.id;
    const field = await Field.findById(id);
    if (!field) return res.status(404).json({ error: 'Field not found' });

    if (req.user && String(req.user.id) !== String(field.user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden — you do not own this field' });
    }

    await fieldService.deleteField(id);
    return res.json({ msg: 'deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete field' });
  }
}

module.exports = { listForUser, getOne, create, update, remove };
