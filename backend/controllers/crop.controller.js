// controllers/crop.controller.js
const cropService = require('../services/crop.service');

/**
 * GET /api/crops
 */
async function list(req, res) {
  try {
    const crops = await cropService.listCrops();
    return res.json(crops);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list crops' });
  }
}

/**
 * GET /api/crops/:id
 */
async function getOne(req, res) {
  try {
    const c = await cropService.getCrop(req.params.id);
    if (!c) return res.status(404).json({ error: 'Crop not found' });
    return res.json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get crop' });
  }
}

/**
 * POST /api/crops
 */
async function create(req, res) {
  try {
    const payload = req.body;
    const created = await cropService.createCrop(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    // Mongoose validation errors may appear here
    return res.status(400).json({ error: err.message || 'Failed to create crop' });
  }
}

/**
 * PUT /api/crops/:id
 */
async function update(req, res) {
  try {
    const updated = await cropService.updateCrop(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Crop not found' });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to update crop' });
  }
}

/**
 * DELETE /api/crops/:id
 */
async function remove(req, res) {
  try {
    const del = await cropService.deleteCrop(req.params.id);
    if (!del) return res.status(404).json({ error: 'Crop not found' });
    return res.json({ msg: 'deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete crop' });
  }
}

module.exports = { list, getOne, create, update, remove };
