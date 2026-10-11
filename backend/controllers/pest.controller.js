const pestService = require('../services/pest.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const uploadsDir = path.join(__dirname, '../data/uploads/pests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'pest-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * POST /api/pests/detect/symptoms
 * Detect pest from symptoms
 */
exports.detectFromSymptoms = async (req, res) => {
  try {
    const { symptoms, crop } = req.body;

    if (!symptoms || !crop) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms and crop are required',
      });
    }

    const result = await pestService.detectFromSymptoms(symptoms, crop);

    return res.json({
      success: result.success,
      topMatch: result.topMatch || null,
      probablePests: result.probablePests || [],
      data: result.success ? result : null,
      error: result.error || null,
    });
  } catch (error) {
    console.error('Error in detectFromSymptoms:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to detect pest',
    });
  }
};

/**
 * POST /api/pests/detect/image
 * Detect pest from uploaded image
 */
exports.detectFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required',
      });
    }

    const result = await pestService.detectFromImage(req.file.path);

    return res.json({
      success: result.success,
      data: result.success
        ? {
            prediction: result.prediction,
            confidence: result.confidence,
            fallbackUsed: result.fallbackUsed,
            imageUrl: `/uploads/pests/${req.file.filename}`,
          }
        : null,
      error: result.error || null,
    });
  } catch (error) {
    console.error('Error in detectFromImage:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
    });
  }
};

/**
 * POST /api/pests
 * Create pest record
 */
exports.createPestRecord = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await pestService.savePestRecord(userId, req.body);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('Error in createPestRecord:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create pest record',
    });
  }
};

/**
 * PUT /api/pests/:id
 * Update pest record
 */
exports.updatePestRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Verify ownership
    const PestRecord = require('../models/PestRecord');
    const record = await PestRecord.findById(id);

    if (!record || record.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this record',
      });
    }

    const result = await pestService.updatePestRecord(id, req.body);

    return res.json(result);
  } catch (error) {
    console.error('Error in updatePestRecord:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update pest record',
    });
  }
};

/**
 * GET /api/pests/:id
 * Get single pest record
 */
exports.getPestRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const PestRecord = require('../models/PestRecord');
    const record = await PestRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }

    if (record.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error in getPestRecord:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pest record',
    });
  }
};

/**
 * GET /api/pests
 * List all pest records for user
 */
exports.listPestRecords = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const filters = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      crop: req.query.crop,
      pestName: req.query.pestName,
      resolved: req.query.resolved === 'true',
    };

    const result = await pestService.listPestRecords(userId, filters);

    return res.json(result);
  } catch (error) {
    console.error('Error in listPestRecords:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pest records',
    });
  }
};

/**
 * DELETE /api/pests/:id
 * Delete pest record
 */
exports.deletePestRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await pestService.deletePestRecord(id, userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in deletePestRecord:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete pest record',
    });
  }
};

/**
 * GET /api/pests/summary/pest
 * Get pest summary
 */
exports.getPestSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await pestService.summaryByPest(userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in getPestSummary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
    });
  }
};

/**
 * GET /api/pests/summary/crop
 * Get crop summary
 */
exports.getCropSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await pestService.summaryByCrop(userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in getCropSummary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
    });
  }
};

/**
 * GET /api/pests/summary/season
 * Get seasonal summary
 */
exports.getSeasonalSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await pestService.summaryBySeason(userId);

    return res.json(result);
  } catch (error) {
    console.error('Error in getSeasonalSummary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
    });
  }
};

/**
 * GET /api/pests/alerts/region
 * Get region alerts
 */
exports.getRegionAlerts = async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state || !district) {
      return res.status(400).json({
        success: false,
        error: 'State and district are required',
      });
    }

    const result = await pestService.getRegionAlerts(state, district);

    return res.json(result);
  } catch (error) {
    console.error('Error in getRegionAlerts:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
    });
  }
};

/**
 * GET /api/pests/catalog
 * Get pest catalog (admin)
 */
exports.getPestCatalog = async (req, res) => {
  try {
    const result = await pestService.getPestCatalog();

    return res.json(result);
  } catch (error) {
    console.error('Error in getPestCatalog:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch catalog',
    });
  }
};

/**
 * Get upload middleware
 */
exports.getUploadMiddleware = () => upload.single('image');
