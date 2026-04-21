// controllers/prediction.controller.js
// Handles prediction creation (calls ML service), listing, retrieval and deletion.
// Uses modelService for ML calls and predictionService for DB operations.

const modelService = require('../services/model.service');
const predictionService = require('../services/prediction.service');
const Prediction = require('../models/prediction.model');

/**
 * POST /api/predict/yield
 * Creates a prediction by calling the ML service (or fallback) and saving the result.
 * If a user is authenticated (req.user), attaches user_id to the saved record.
 */
async function predictYield(req, res) {
  try {
    const input = req.body || {};

    console.log('Received prediction request with input:', input);
    console.log('Authenticated user:', req.user);

    // Basic validation (routes also validate but double-check)
    if (!input.crop) return res.status(400).json({ error: 'crop is required' });
    if (input.ideal_n == null || input.ideal_p == null || input.ideal_k == null) {
      return res.status(400).json({ error: 'ideal_n, ideal_p and ideal_k are required' });
    }

    // Call ML service (returns object like { predicted_yield, model_version })
    const out = await modelService.predict(input);

    const predicted_yield = out.predicted_yield ?? out.predictedYield ?? null;
    const model_version = out.model_version ?? out.modelVersion ?? 'unknown';

    // Save via service
    const saved = await predictionService.createPrediction({
      userId: req.user?.id ?? null,
      crop: input.crop,
      input_values: input,
      predicted_yield,
      model_version
    });

    return res.json({
      predicted_yield: saved.predicted_yield,
      model_version: saved.model_version,
      prediction_id: saved._id
    });
  } catch (err) {
    console.error('Prediction error:', err);
    return res.status(500).json({ error: 'Prediction failed', detail: err.message });
  }
}

/**
 * GET /api/predictions/user
 * Returns predictions for the authenticated user (most recent first).
 * Requires auth middleware to populate req.user.
 */
async function listForUser(req, res) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    const preds = await predictionService.listPredictionsForUser(req.user.id, 100, 0);
    return res.json(preds);
  } catch (err) {
    console.error('List predictions failed:', err);
    return res.status(500).json({ error: 'Failed to get predictions' });
  }
}

/**
 * GET /api/predictions/:id
 * Returns a specific prediction if the requester is owner or admin.
 */
async function getOne(req, res) {
  try {
    const id = req.params.id;
    const p = await predictionService.getPredictionById(id);
    if (!p) return res.status(404).json({ error: 'Prediction not found' });

    // If has user and not owner and not admin -> forbidden
    if (req.user && req.user.role !== 'admin' && String(p.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(p);
  } catch (err) {
    console.error('Get prediction failed:', err);
    return res.status(500).json({ error: 'Failed to get prediction' });
  }
}

/**
 * DELETE /api/predictions/:id
 * Delete a prediction — only owner or admin allowed.
 */
async function remove(req, res) {
  try {
    const id = req.params.id;
    const p = await predictionService.getPredictionById(id);
    if (!p) return res.status(404).json({ error: 'Prediction not found' });

    // Ownership check
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin' && String(p.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await predictionService.deletePredictionById(id);
    return res.json({ msg: 'deleted' });
  } catch (err) {
    console.error('Delete prediction failed:', err);
    return res.status(500).json({ error: 'Failed to delete prediction' });
  }
}

/**
 * GET /api/predictions
 * Admin endpoint: list recent predictions across users (optional, limited).
 * Protect this with role middleware in routes if needed.
 */
async function listAll(req, res) {
  try {
    const preds = await predictionService.listRecent(200);
    return res.json(preds);
  } catch (err) {
    console.error('List all predictions failed:', err);
    return res.status(500).json({ error: 'Failed to list predictions' });
  }
}

module.exports = {
  predictYield,
  listForUser,
  getOne,
  remove,
  listAll
};
