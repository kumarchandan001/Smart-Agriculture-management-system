/**
 * Expense Routes
 * Express router for expense endpoints
 * Mount in server.js: app.use('/api/expenses', require('./routes/expenses'));
 */

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');

/**
 * IMPORTANT: Plug in auth middleware before these routes
 * Example in server.js:
 *   const authRequired = (req, res, next) => {
 *     if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
 *     next();
 *   };
 *   app.use('/api/expenses', authRequired, require('./routes/expenses'));
 */

// ============ Basic CRUD Operations ============

// ============ Summary & Analytics Endpoints (MUST BE BEFORE /:id routes!) ============

/**
 * GET /api/expenses/summary/category
 * Get expense summary grouped by category
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get('/summary/category', expenseController.summaryByCategory);

/**
 * GET /api/expenses/summary/crop
 * Get expense summary grouped by crop
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get('/summary/crop', expenseController.summaryByCrop);

/**
 * GET /api/expenses/summary/season
 * Get seasonal expense summary
 * Query: ?season=Kharif|Rabi|Zaid
 */
router.get('/summary/season', expenseController.seasonalSummary);

/**
 * GET /api/expenses/summary/timeseries
 * Get monthly time series for charting
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get('/summary/timeseries', expenseController.timeserieSummary);

// ============ Calculation & Budget Endpoints (MUST BE BEFORE /:id routes!) ============

/**
 * POST /api/expenses/calculate/costPerAcre
 * Calculate cost per acre/hectare
 * Body: { totalExpense, areaHa }
 */
router.post('/calculate/costPerAcre', expenseController.calculateCostPerAcre);

/**
 * POST /api/expenses/calculate/roi
 * Calculate ROI
 * Body: { totalExpense, yieldQty, pricePerUnit }
 */
router.post('/calculate/roi', expenseController.calculateROI);

/**
 * GET /api/expenses/budget/status
 * Get monthly budget status
 * Query: ?limit=50000
 */
router.get('/budget/status', expenseController.getBudgetStatus);

// ============ Basic CRUD Operations ============

/**
 * POST /api/expenses
 * Create a new expense
 * Body: { category, amount, crop?, date?, notes?, farmId? }
 */
router.post(
  '/',
  expenseController.validateCreateExpense,
  expenseController.createExpense
);

/**
 * GET /api/expenses
 * List all expenses with filters and pagination
 * Query: ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&category=seeds&crop=rice&page=1&limit=10&sort=-date
 */
router.get('/', expenseController.listExpenses);

/**
 * GET /api/expenses/:id
 * Get a single expense by ID
 */
router.get('/:id', expenseController.getExpense);

/**
 * PUT /api/expenses/:id
 * Update an expense
 */
router.put(
  '/:id',
  expenseController.validateCreateExpense,
  expenseController.updateExpense
);

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
router.delete('/:id', expenseController.deleteExpense);

// ============ Specific Analysis Endpoints (MUST BE BEFORE /:id routes!) ============

/**
 * GET /api/expenses/crop/:cropName
 * Get all expenses for a specific crop with cost analysis
 * Query: ?areaHa=2.5
 */
router.get('/crop/:cropName', expenseController.getExpensesForCrop);

// ============ File Upload (MUST BE BEFORE /:id routes!) ============

/**
 * POST /api/expenses/:id/receipt
 * Upload receipt/attachment for an expense
 */
router.post(
  '/:id/receipt',
  expenseController.receiptUpload.single('receipt'),
  expenseController.uploadReceipt
);

module.exports = router;
