// routes/fields.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/field.controller');
const { body, query } = require('express-validator');
const { validate } = require('../utils/validators');

const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// List fields for a user (requires user_id query param)
router.get(
  '/',
  validate([ query('user_id').notEmpty().withMessage('user_id is required') ]),
  controller.listForUser
);

// Get one
router.get('/:id', controller.getOne);

// Create field — any authenticated user
router.post(
  '/',
  authMiddleware,
  validate([
    body('user_id').notEmpty().withMessage('user_id is required'),
    body('field_name').notEmpty().withMessage('field_name is required'),
    body('area_ha').optional().isFloat({ gt: 0 }).withMessage('area_ha must be a positive number'),
    body('location.lat').optional().isFloat(),
    body('location.lon').optional().isFloat()
  ]),
  controller.create
);

// Update — only authenticated; controller should check ownership (or admin)
router.put('/:id', authMiddleware, controller.update);

// Delete — only authenticated; controller should check ownership (or admin)
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
