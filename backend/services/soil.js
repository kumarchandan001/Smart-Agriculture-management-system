// smart agriculture/backend/routes/soil.js
const express = require('express');
const router = express.Router();
const soilCtrl = require('../controllers/soil.controller');
const ocrCtrl = require('../controllers/ocr.controller');
const multer = require('multer');
const upload = multer({ dest: '/tmp/uploads/' });

// GET /api/soil/region?state=...&district=...
router.get('/region', soilCtrl.getRegionNpk);

// POST /api/soil/estimate  (questionnaire)
router.post('/estimate', soilCtrl.estimateFromQuestions);

// POST /api/soil/ocr  (upload image)
router.post('/ocr', upload.single('file'), ocrCtrl.uploadAndParse);

module.exports = router;
