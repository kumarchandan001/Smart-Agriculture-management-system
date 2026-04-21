const soilService = require('../services/soil.service');

/**
 * Soil Controller
 * Handles HTTP requests for soil analysis and history
 */

/**
 * POST /api/soil/analyze
 * Analyze soil based on region or manual NPK/pH values
 *
 * Request body options:
 * Option 1 (Region-based):
 * {
 *   analysisMode: "region",
 *   state: "Maharashtra",
 *   district: "Pune",
 *   block: "Haveli"
 * }
 *
 * Option 2 (Manual values):
 * {
 *   analysisMode: "manual",
 *   n: 45,
 *   p: 18,
 *   k: 95,
 *   ph: 6.2
 * }
 */
async function analyzeSoil(req, res) {
  try {
    const { analysisMode, state, district, block, n, p, k, ph } = req.body;

    // Validate input
    if (!analysisMode) {
      return res.status(400).json({
        success: false,
        error: 'analysisMode is required (region or manual)',
      });
    }

    let soilData = {};

    if (analysisMode === 'region') {
      // Region-based analysis
      if (!state || !district || !block) {
        return res.status(400).json({
          success: false,
          error: 'state, district, and block are required for region mode',
        });
      }

      try {
        const regionSoil = soilService.getRegionSoil(state, district, block);
        soilData = {
          analysisMode: 'region',
          region: { state, district, block },
          n: regionSoil.avg_n,
          p: regionSoil.avg_p,
          k: regionSoil.avg_k,
          ph: regionSoil.avg_ph,
        };
      } catch (err) {
        return res.status(404).json({
          success: false,
          error: `Region data not found: ${err.message}`,
        });
      }
    } else if (analysisMode === 'manual') {
      // Manual NPK/pH input analysis
      if (n === undefined || p === undefined || k === undefined || ph === undefined) {
        return res.status(400).json({
          success: false,
          error: 'n, p, k, and ph are required for manual mode',
        });
      }

      // Validate numeric values
      if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph)) {
        return res.status(400).json({
          success: false,
          error: 'n, p, k, and ph must be valid numbers',
        });
      }

      soilData = {
        analysisMode: 'manual',
        n: parseFloat(n),
        p: parseFloat(p),
        k: parseFloat(k),
        ph: parseFloat(ph),
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'analysisMode must be "region" or "manual"',
      });
    }

    // Perform analysis
    const analysis = soilService.analyzeSoil({
      n: soilData.n,
      p: soilData.p,
      k: soilData.k,
      ph: soilData.ph,
    });

    // Combine all data
    const fullData = {
      ...soilData,
      ...analysis,
    };

    // Save to database if user is authenticated
    if (req.user && req.user.id) {
      try {
        const savedReport = await soilService.saveSoilReport(req.user.id, fullData);
        fullData._id = savedReport._id;
        fullData.createdAt = savedReport.createdAt;
      } catch (err) {
        console.error('Error saving soil report:', err);
        // Continue without saving - don't fail the request
      }
    }

    return res.json({
      success: true,
      data: fullData,
    });
  } catch (err) {
    console.error('Error in analyzeSoil:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}

/**
 * GET /api/soil/history
 * Get authenticated user's soil test history
 * Query params: page (default 1), limit (default 10)
 */
async function getSoilHistory(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

    const result = await soilService.getSoilHistory(req.user.id, page, limit);

    return res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) {
    console.error('Error in getSoilHistory:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}

/**
 * GET /api/soil/history/all
 * Get all soil test history (admin only)
 * Query params: page (default 1), limit (default 10)
 */
async function getSoilHistoryAll(req, res) {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || !req.user.id || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

    const result = await soilService.getAllSoilHistory(page, limit);

    return res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) {
    console.error('Error in getSoilHistoryAll:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}

module.exports = {
  analyzeSoil,
  getSoilHistory,
  getSoilHistoryAll,
};
