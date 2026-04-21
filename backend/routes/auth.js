// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../utils/validators');
const controller = require('../controllers/auth.controller');

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 5 }).withMessage('Password must be 5+ chars')
  ]),
  controller.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail(),
    body('password').exists()
  ]),
  controller.login
);

module.exports = router;
