/**
 * Soil Routes
 * Endpoints for soil analysis and history management
 */

const express = require('express');
const router = express.Router();
const soilCtrl = require('../controllers/soil.controller');

// Placeholder middleware - replace with actual auth middleware
const authRequired = (req, res, next) => {
  // Mock implementation - in production, verify JWT token
  req.user = req.user || { id: '507f1f77bcf86cd799439011', role: 'user' }; // Mock user
  next();
};

/**
 * POST /api/soil/analyze
 * Analyze soil based on region or manual NPK/pH input
 */
router.post('/analyze', soilCtrl.analyzeSoil);

/**
 * GET /api/soil/history
 * Get authenticated user's soil test history
 * Query: page (default 1), limit (default 10)
 */
router.get('/history', authRequired, soilCtrl.getSoilHistory);

/**
 * GET /api/soil/history/all
 * Get all soil test history (admin only)
 */
router.get('/history/all', authRequired, soilCtrl.getSoilHistoryAll);

module.exports = router;
