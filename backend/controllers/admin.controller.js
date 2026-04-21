// controllers/admin.controller.js
const path = require('path');
const fs = require('fs');
const modelService = require('../services/model.service');
const logger = require('../utils/logger');

/**
 * Upload dataset file and trigger retrain.
 * Expects multipart/form-data with field 'dataset' (CSV).
 *
 * If file is uploaded, it is saved to backend/data/uploads with a timestamped name,
 * then forwarded to ML service via modelService.retrain(filePath).
 *
 * If no file provided, this endpoint will call modelService.retrain() to trigger
 * retraining using whatever dataset the ML service uses by default.
 */
async function retrain(req, res) {
  try {
    // multer will have saved file at req.file (if provided)
    let savedPath = null;
    if (req.file) {
      savedPath = req.file.path;
      logger.info('Dataset uploaded and saved to', savedPath);
    } else {
      logger.info('No dataset file uploaded — triggering retrain without file');
    }

    // call model service to retrain
    const result = await modelService.retrain(savedPath);
    return res.json({ msg: 'retrain completed', result });
  } catch (err) {
    logger.error('Admin retrain failed:', err.message || err.toString());
    return res.status(500).json({ error: 'Retrain failed', detail: err.message });
  }
}

module.exports = { retrain };
