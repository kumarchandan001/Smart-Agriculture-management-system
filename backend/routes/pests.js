const express = require('express');
const router = express.Router();
const pestController = require('../controllers/pest.controller');

// Middleware placeholder for auth
const authRequired = (req, res, next) => {
  // In production, verify JWT here
  req.userId = req.headers['x-user-id'] || 'test-user';
  next();
};

// Detection endpoints
router.post('/detect/symptoms', pestController.detectFromSymptoms);
router.post(
  '/detect/image',
  pestController.getUploadMiddleware(),
  pestController.detectFromImage
);

// CRUD endpoints
router.post('/', authRequired, pestController.createPestRecord);
router.get('/', authRequired, pestController.listPestRecords);
router.get('/:id', authRequired, pestController.getPestRecord);
router.put('/:id', authRequired, pestController.updatePestRecord);
router.delete('/:id', authRequired, pestController.deletePestRecord);

// Summary endpoints
router.get('/summary/pest', authRequired, pestController.getPestSummary);
router.get('/summary/crop', authRequired, pestController.getCropSummary);
router.get('/summary/season', authRequired, pestController.getSeasonalSummary);

// Alerts
router.get('/alerts/region', pestController.getRegionAlerts);

// Catalog (admin)
router.get('/catalog/all', pestController.getPestCatalog);

module.exports = router;
