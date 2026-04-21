const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Base directory for knowledge data
const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

/**
 * Helper function to read JSON files
 */
const readJsonFile = async (filename) => {
  try {
    const filePath = path.join(KNOWLEDGE_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    throw new Error(`Failed to read ${filename}`);
  }
};

/**
 * GET /api/knowledge
 * Returns all knowledge categories
 */
router.get('/', (req, res) => {
  try {
    const categories = [
      {
        id: 'crops',
        name: 'Crop Knowledge',
        description: 'Comprehensive A-Z guide for all major crops',
        icon: 'crops',
        color: 'bg-green-500'
      },
      {
        id: 'soil',
        name: 'Soil Health',
        description: 'Learn about soil testing, conservation, and soil types',
        icon: 'soil',
        color: 'bg-amber-700'
      },
      {
        id: 'pests',
        name: 'Pest & Disease Library',
        description: 'Identification and management of common pests and diseases',
        icon: 'pests',
        color: 'bg-red-600'
      },
      {
        id: 'fertilizers',
        name: 'Fertilizer Guide',
        description: 'NPK and organic fertilizer recommendations',
        icon: 'fertilizer',
        color: 'bg-blue-600'
      },
      {
        id: 'weather',
        name: 'Climate & Weather Tips',
        description: 'Seasonal farming tips and climate management strategies',
        icon: 'weather',
        color: 'bg-sky-500'
      },
      {
        id: 'market',
        name: 'Market Tips',
        description: 'Pricing, marketing strategies, and value-added products',
        icon: 'market',
        color: 'bg-purple-600'
      },
      {
        id: 'schemes',
        name: 'Government Schemes',
        description: 'Available subsidies, schemes, and government programs',
        icon: 'schemes',
        color: 'bg-indigo-600'
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Knowledge categories retrieved successfully',
      categories: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/crops
 * Returns all crop information
 */
router.get('/crops', async (req, res) => {
  try {
    const crops = await readJsonFile('crops.json');
    res.status(200).json({
      success: true,
      message: 'Crops data retrieved successfully',
      data: crops,
      count: crops.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving crops data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/crops/:id
 * Returns specific crop information
 */
router.get('/crops/:id', async (req, res) => {
  try {
    const crops = await readJsonFile('crops.json');
    const crop = crops.find(c => c.id === parseInt(req.params.id));

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving crop data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/soil
 * Returns all soil information
 */
router.get('/soil', async (req, res) => {
  try {
    const soil = await readJsonFile('soil.json');
    res.status(200).json({
      success: true,
      message: 'Soil data retrieved successfully',
      data: soil,
      count: soil.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving soil data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/soil/:id
 * Returns specific soil information
 */
router.get('/soil/:id', async (req, res) => {
  try {
    const soil = await readJsonFile('soil.json');
    const soilData = soil.find(s => s.id === parseInt(req.params.id));

    if (!soilData) {
      return res.status(404).json({
        success: false,
        message: 'Soil data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: soilData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving soil data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/pests
 * Returns all pest information
 */
router.get('/pests', async (req, res) => {
  try {
    const pests = await readJsonFile('pests.json');
    res.status(200).json({
      success: true,
      message: 'Pests data retrieved successfully',
      data: pests,
      count: pests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pests data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/pests/:id
 * Returns specific pest information
 */
router.get('/pests/:id', async (req, res) => {
  try {
    const pests = await readJsonFile('pests.json');
    const pest = pests.find(p => p.id === parseInt(req.params.id));

    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pest data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/fertilizers
 * Returns all fertilizer information
 */
router.get('/fertilizers', async (req, res) => {
  try {
    const fertilizers = await readJsonFile('fertilizers.json');
    res.status(200).json({
      success: true,
      message: 'Fertilizers data retrieved successfully',
      data: fertilizers,
      count: fertilizers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving fertilizers data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/fertilizers/:id
 * Returns specific fertilizer information
 */
router.get('/fertilizers/:id', async (req, res) => {
  try {
    const fertilizers = await readJsonFile('fertilizers.json');
    const fertilizer = fertilizers.find(f => f.id === parseInt(req.params.id));

    if (!fertilizer) {
      return res.status(404).json({
        success: false,
        message: 'Fertilizer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fertilizer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving fertilizer data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/weather
 * Returns all weather and climate tips
 */
router.get('/weather', async (req, res) => {
  try {
    const weather = await readJsonFile('weather.json');
    res.status(200).json({
      success: true,
      message: 'Weather and climate data retrieved successfully',
      data: weather,
      count: weather.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving weather data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/market
 * Returns all market tips information
 */
router.get('/market', async (req, res) => {
  try {
    const market = await readJsonFile('market.json');
    res.status(200).json({
      success: true,
      message: 'Market data retrieved successfully',
      data: market,
      count: market.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving market data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/schemes
 * Returns all government schemes information
 */
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await readJsonFile('schemes.json');
    res.status(200).json({
      success: true,
      message: 'Government schemes data retrieved successfully',
      data: schemes,
      count: schemes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving schemes data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/schemes/:id
 * Returns specific scheme information
 */
router.get('/schemes/:id', async (req, res) => {
  try {
    const schemes = await readJsonFile('schemes.json');
    const scheme = schemes.find(s => s.id === parseInt(req.params.id));

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving scheme data',
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/search
 * Search across all knowledge bases
 * Query params: q (search query), category (optional: crops|soil|pests|fertilizers|weather|market|schemes)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const searchQuery = q.toLowerCase();
    const results = {};

    // Define categories to search
    const categoriesToSearch = category 
      ? [category] 
      : ['crops', 'soil', 'pests', 'fertilizers', 'weather', 'market', 'schemes'];

    // Search across categories
    for (const cat of categoriesToSearch) {
      try {
        const data = await readJsonFile(`${cat}.json`);
        const filtered = data.filter(item => {
          const searchableFields = JSON.stringify(item).toLowerCase();
          return searchableFields.includes(searchQuery);
        });

        if (filtered.length > 0) {
          results[cat] = filtered;
        }
      } catch (error) {
        console.error(`Error searching ${cat}:`, error.message);
      }
    }

    res.status(200).json({
      success: true,
      query: q,
      results: results,
      totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

module.exports = router;
