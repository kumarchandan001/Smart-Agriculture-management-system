// smart agriculture/backend/controllers/crop.recommend.controller.js
const cropService = require('../services/cropRecommend.service');

async function getRecommendation(req, res) {
  try {
    const input = req.body || {};
    
    // Log the request for debugging
    console.log('Recommendation request:', JSON.stringify(input));
    
    // Ensure numerical conversion
    ['n','p','k','ph'].forEach(k => {
      if (input[k] !== undefined && input[k] !== null && input[k] !== '') {
        input[k] = Number(input[k]);
      }
    });
    
    console.log('Processed input:', JSON.stringify(input));
    
    const recs = await cropService.recommend(input);
    console.log('Recommendations generated:', recs.length);
    
    return res.json({ success: true, recommendations: recs });
  } catch (err) {
    console.error('Recommendation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getRecommendation };
