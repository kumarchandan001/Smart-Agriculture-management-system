/**
 * Expense Controller
 * HTTP request handlers for expense operations with validation
 */

const { validationResult, body, query } = require('express-validator');
const expenseService = require('../services/expense.service');
const Expense = require('../models/Expense');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configure multer for receipt uploads
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${req.user.id}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const receiptFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
};

const receiptUpload = multer({
  storage: receiptStorage,
  fileFilter: receiptFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * Validation middleware for creating expenses
 */
const validateCreateExpense = [
  body('category')
    .isIn(['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'])
    .withMessage('Invalid category'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('crop')
    .optional()
    .trim()
    .isString()
    .withMessage('Crop must be a string'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

/**
 * Create a new expense
 * POST /api/expenses
 * Requires: userId from req.user (auth middleware), category, amount
 */
async function createExpense(req, res) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }

    const userId = req.user.id || req.user._id;
    const payload = {
      ...req.body,
      crop: req.body.crop ? req.body.crop.toLowerCase() : null
    };

    const expense = await expenseService.createExpense(userId, payload);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('[Expense] Create error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get a single expense
 * GET /api/expenses/:id
 */
async function getExpense(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const expense = await expenseService.getExpense(userId, req.params.id);

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('[Expense] Get error:', error.message);
    res.status(404).json({ success: false, error: error.message });
  }
}

/**
 * Update an expense
 * PUT /api/expenses/:id
 */
async function updateExpense(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }

    const userId = req.user.id || req.user._id;
    const payload = {
      ...req.body,
      crop: req.body.crop ? req.body.crop.toLowerCase() : req.body.crop
    };

    const expense = await expenseService.updateExpense(userId, req.params.id, payload);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('[Expense] Update error:', error.message);
    res.status(404).json({ success: false, error: error.message });
  }
}

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
async function deleteExpense(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    await expenseService.deleteExpense(userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('[Expense] Delete error:', error.message);
    res.status(404).json({ success: false, error: error.message });
  }
}

/**
 * List expenses with filters and pagination
 * GET /api/expenses?dateFrom=&dateTo=&category=&crop=&page=1&limit=10
 */
async function listExpenses(req, res) {
  try {
    const userId = req.user.id || req.user._id;

    const filters = {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      category: req.query.category,
      crop: req.query.crop,
      farmId: req.query.farmId,
      sort: req.query.sort || '-date',
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await expenseService.listExpenses(userId, filters);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('[Expense] List error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get expense summary by category
 * GET /api/expenses/summary/category?from=&to=
 */
async function summaryByCategory(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { from, to } = req.query;

    const summary = await expenseService.summaryByCategory(userId, from, to);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Expense] Category summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get expense summary by crop
 * GET /api/expenses/summary/crop?from=&to=
 */
async function summaryByCrop(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { from, to } = req.query;

    const summary = await expenseService.summaryByCrop(userId, from, to);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Expense] Crop summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get seasonal summary
 * GET /api/expenses/summary/season?season=Kharif
 */
async function seasonalSummary(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { season } = req.query;

    if (!season) {
      return res.status(400).json({
        success: false,
        error: 'Season parameter is required (Kharif, Rabi, or Zaid)'
      });
    }

    const summary = await expenseService.seasonalSummary(userId, season);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Expense] Seasonal summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get time series summary for charting
 * GET /api/expenses/summary/timeseries?from=&to=
 */
async function timeserieSummary(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { from, to } = req.query;

    const summary = await expenseService.timeserieSummary(userId, from, to);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Expense] Timeseries summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Upload receipt for an expense
 * POST /api/expenses/:id/receipt
 */
async function uploadReceipt(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const userId = req.user.id || req.user._id;
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    const expense = await expenseService.updateExpense(userId, req.params.id, {
      receiptUrl
    });

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Receipt uploaded successfully'
    });
  } catch (error) {
    console.error('[Expense] Receipt upload error:', error.message);
    if (req.file) {
      fs.unlink(req.file.path, () => {}); // Clean up uploaded file on error
    }
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get expenses for a specific crop with cost analysis
 * GET /api/expenses/crop/:cropName?areaHa=1
 */
async function getExpensesForCrop(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { cropName } = req.params;
    const { areaHa } = req.query;

    const result = await expenseService.getExpensesForCrop(
      userId,
      cropName,
      areaHa ? parseFloat(areaHa) : null
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Expense] Get crop expenses error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get monthly budget status
 * GET /api/expenses/budget/status?limit=50000
 */
async function getBudgetStatus(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { limit } = req.query;

    if (!limit || parseFloat(limit) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid budget limit is required'
      });
    }

    const status = await expenseService.getBudgetStatus(userId, parseFloat(limit));

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('[Expense] Budget status error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Calculate cost per acre for given total and area
 * POST /api/expenses/calculate/costPerAcre
 */
async function calculateCostPerAcre(req, res) {
  try {
    const { totalExpense, areaHa } = req.body;

    if (!totalExpense || !areaHa || areaHa <= 0 || totalExpense < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid totalExpense and positive areaHa are required'
      });
    }

    const result = expenseService.computeCostPerAcre(totalExpense, areaHa);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Expense] Cost per acre calculation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Calculate ROI
 * POST /api/expenses/calculate/roi
 */
async function calculateROI(req, res) {
  try {
    const { totalExpense, yieldQty, pricePerUnit } = req.body;

    if (totalExpense === undefined || yieldQty === undefined || pricePerUnit === undefined) {
      return res.status(400).json({
        success: false,
        error: 'totalExpense, yieldQty, and pricePerUnit are required'
      });
    }

    const result = expenseService.computeROI(totalExpense, yieldQty, pricePerUnit);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Expense] ROI calculation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  validateCreateExpense,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  listExpenses,
  summaryByCategory,
  summaryByCrop,
  seasonalSummary,
  timeserieSummary,
  uploadReceipt,
  receiptUpload,
  getExpensesForCrop,
  getBudgetStatus,
  calculateCostPerAcre,
  calculateROI
};
