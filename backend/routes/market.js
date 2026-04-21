const express = require('express');
const router = express.Router();
const marketService = require('../services/market.service');

// GET /api/market/prices?crops=Wheat,Maize
router.get('/prices', async (req, res) => {
  try {
    const cropsParam = req.query.crops;
    const crops = cropsParam ? cropsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const data = await marketService.getPrices(crops);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/market/crops - return list of available commodities
router.get('/crops', async (req, res) => {
  try {
    const list = await marketService.getAvailableCrops();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
