// routes/predictions.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/prediction.controller');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/predict/yield  (validation + create prediction)

router.use(authMiddleware)

router.post(
  '/yield',
  validate([
    body('crop').notEmpty().withMessage('crop is required'),
    body('ideal_n').notEmpty().withMessage('ideal_n required').isNumeric().withMessage('ideal_n must be numeric'),
    body('ideal_p').notEmpty().withMessage('ideal_p required').isNumeric().withMessage('ideal_p must be numeric'),
    body('ideal_k').notEmpty().withMessage('ideal_k required').isNumeric().withMessage('ideal_k must be numeric')
  ]),
  controller.predictYield
);

// GET /api/predictions/user  (protected) - predictions for current user
router.get('/user', authMiddleware, controller.listForUser);

// Optionally: admin list all predictions (not protected here, you can add role middleware if needed)
router.get('/', async (req, res) => {
  const Prediction = require('../models/prediction.model');
  const all = await Prediction.find().sort({ created_at: -1 }).limit(200).lean();
  res.json(all);
});

module.exports = router;
