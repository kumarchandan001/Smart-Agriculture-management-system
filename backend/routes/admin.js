// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer storage (save with timestamp prefix)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${ts}_${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    // Accept only csv files
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit - adjust as needed
});

// Protect admin routes: only admin role can upload/retrain
router.post('/train', authMiddleware, requireRole('admin'), upload.single('dataset'), adminController.retrain);

// Also allow triggering retrain without file
router.post('/train/trigger', authMiddleware, requireRole('admin'), adminController.retrain);

module.exports = router;
