/**
 * Fertilizer Guide Controller
 * Handles API requests for fertilizer recommendations and region/crop data
 */

const fertilizerService = require('../services/fertilizer.service');

/**
 * POST /api/fertilizer/guide
 * Generate fertilizer recommendation report
 * 
 * Request body:
 * {
 *   state: string,
 *   district: string,
 *   block: string,
 *   crop: string
 * }
 */
const getRecommendation = async (req, res) => {
  try {
    const { state, district, block, crop } = req.body;

    // Validate input
    if (!state || !district || !block || !crop) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: state, district, block, crop'
      });
    }

    console.log(`[Fertilizer Guide] Request: ${state}, ${district}, ${block}, Crop: ${crop}`);

    // Generate guide
    const result = await fertilizerService.generateFertilizerGuide(state, district, block, crop);

    if (!result.success) {
      console.log(`[Fertilizer Guide] Error: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`[Fertilizer Guide] Success: Generated guide for ${crop} in ${state}`);
    return res.json(result);
  } catch (err) {
    console.error('[Fertilizer Guide] Server Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

/**
 * GET /api/fertilizer/crops
 * Get list of available crops in the database
 */
const getAvailableCrops = async (req, res) => {
  try {
    const crops = fertilizerService.getAvailableCrops();
    
    if (crops.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No crops found in database'
      });
    }

    return res.json({
      success: true,
      data: crops,
      message: `Found ${crops.length} crops`
    });
  } catch (err) {
    console.error('[Fertilizer Crops] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch crops'
    });
  }
};

/**
 * GET /api/fertilizer/regions
 * Get list of available regions in the database
 */
const getAvailableRegions = async (req, res) => {
  try {
    const regions = fertilizerService.getAvailableRegions();
    
    if (regions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No regions found in database'
      });
    }

    return res.json({
      success: true,
      data: regions,
      message: `Found ${regions.length} regions`
    });
  } catch (err) {
    console.error('[Fertilizer Regions] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch regions'
    });
  }
};

module.exports = {
  getRecommendation,
  getAvailableCrops,
  getAvailableRegions
};
