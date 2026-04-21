// routes/crops.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/crop.controller');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

// auth middleware
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Public endpoints
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Crop Recommendation endpoint (MUST come before generic POST / to prevent route conflict)
const cropCtrl = require('../controllers/crop.recommend.controller');
router.post('/recommend', cropCtrl.getRecommendation);

// Protected: Create (admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate([
    body('crop').notEmpty().withMessage('crop is required'),
    body('ideal_n').optional().isNumeric().withMessage('ideal_n must be numeric'),
    body('ideal_p').optional().isNumeric().withMessage('ideal_p must be numeric'),
    body('ideal_k').optional().isNumeric().withMessage('ideal_k must be numeric')
  ]),
  controller.create
);


// Protected: Update (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), controller.update);

// Protected: Delete (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;


