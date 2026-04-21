/**
 * Fertilizer Guide Routes
 * API endpoints for fertilizer recommendations and data lookup
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/fertilizer.controller');

/**
 * POST /api/fertilizer/guide
 * Generate fertilizer recommendation report
 * 
 * Example request:
 * {
 *   "state": "Maharashtra",
 *   "district": "Pune",
 *   "block": "Haveli",
 *   "crop": "Rice"
 * }
 */
router.post('/guide', controller.getRecommendation);

/**
 * GET /api/fertilizer/crops
 * List all available crops with their nutrient requirements
 */
router.get('/crops', controller.getAvailableCrops);

/**
 * GET /api/fertilizer/regions
 * List all available regions with their soil NPK data
 */
router.get('/regions', controller.getAvailableRegions);

module.exports = router;
