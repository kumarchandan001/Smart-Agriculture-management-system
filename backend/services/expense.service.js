/**
 * Expense Service
 * Business logic for managing farm expenses with aggregations and calculations
 */

const Expense = require('../models/Expense');
const path = require('path');
const fs = require('fs');

/**
 * Load crop data from CSV for seed references
 * @returns {Array} Array of crop names
 */
function loadCropData() {
  try {
    const csvPath = path.join(__dirname, '..', 'data', 'crop_500_dataset.csv');
    if (fs.existsSync(csvPath)) {
      const data = fs.readFileSync(csvPath, 'utf-8');
      const lines = data.split('\n').slice(1); // Skip header
      const crops = new Set();
      lines.forEach(line => {
        const [crop] = line.split(',');
        if (crop) crops.add(crop.trim().toLowerCase());
      });
      return Array.from(crops);
    }
  } catch (err) {
    console.log('Note: Crop CSV not found, proceeding without seed data.');
  }
  return [];
}

/**
 * Create a new expense
 * @param {String} userId - User ID
 * @param {Object} payload - Expense data
 * @returns {Promise<Object>} Created expense
 */
async function createExpense(userId, payload) {
  try {
    const expense = new Expense({
      userId,
      ...payload
    });
    await expense.save();
    return expense.toJSON();
  } catch (error) {
    throw new Error(`Failed to create expense: ${error.message}`);
  }
}

/**
 * Update an existing expense
 * @param {String} userId - User ID (for authorization)
 * @param {String} expenseId - Expense ID
 * @param {Object} payload - Updated data
 * @returns {Promise<Object>} Updated expense
 */
async function updateExpense(userId, expenseId, payload) {
  try {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    if (!expense) {
      throw new Error('Expense not found or unauthorized');
    }
    Object.assign(expense, payload);
    await expense.save();
    return expense.toJSON();
  } catch (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }
}

/**
 * Delete an expense
 * @param {String} userId - User ID (for authorization)
 * @param {String} expenseId - Expense ID
 * @returns {Promise<Boolean>} Deletion success
 */
async function deleteExpense(userId, expenseId) {
  try {
    const result = await Expense.deleteOne({ _id: expenseId, userId });
    if (result.deletedCount === 0) {
      throw new Error('Expense not found or unauthorized');
    }
    return true;
  } catch (error) {
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
}

/**
 * Get a single expense by ID
 * @param {String} userId - User ID (for authorization)
 * @param {String} expenseId - Expense ID
 * @returns {Promise<Object>} Expense object
 */
async function getExpense(userId, expenseId) {
  try {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    if (!expense) {
      throw new Error('Expense not found or unauthorized');
    }
    return expense.toJSON();
  } catch (error) {
    throw new Error(`Failed to fetch expense: ${error.message}`);
  }
}

/**
 * List expenses with filters and pagination
 * @param {String} userId - User ID
 * @param {Object} filters - { dateFrom, dateTo, category, crop, farmId, sort, page, limit }
 * @returns {Promise<Object>} { data: Array, meta: { total, page, limit, pages } }
 */
async function listExpenses(userId, filters = {}) {
  try {
    const {
      dateFrom,
      dateTo,
      category,
      crop,
      farmId,
      sort = '-date',
      page = 1,
      limit = 10
    } = filters;

    const query = { userId };
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (category) query.category = category;
    if (crop) query.crop = crop.toLowerCase();
    if (farmId) query.farmId = farmId;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Expense.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limitNum);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages
      }
    };
  } catch (error) {
    throw new Error(`Failed to list expenses: ${error.message}`);
  }
}

/**
 * Summary by category using MongoDB aggregation
 * @param {String} userId - User ID
 * @param {String} dateFrom - Start date (ISO string)
 * @param {String} dateTo - End date (ISO string)
 * @returns {Promise<Array>} Array of { category, total, count, avgAmount }
 */
async function summaryByCategory(userId, dateFrom, dateTo) {
  try {
    const mongoose = require('mongoose');
    
    // Ensure userId is an ObjectId
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const match = { $match: { userId: userObjectId } };

    if (dateFrom || dateTo) {
      match.$match.date = {};
      if (dateFrom) match.$match.date.$gte = new Date(dateFrom);
      if (dateTo) match.$match.date.$lte = new Date(dateTo);
    }

    const pipeline = [
      match,
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] }
        }
      },
      { $sort: { total: -1 } }
    ];

    const result = await Expense.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Failed to generate category summary: ${error.message}`);
  }
}

/**
 * Summary by crop using MongoDB aggregation
 * @param {String} userId - User ID
 * @param {String} dateFrom - Start date (ISO string)
 * @param {String} dateTo - End date (ISO string)
 * @returns {Promise<Array>} Array of { crop, total, count, categories: [...] }
 */
async function summaryByCrop(userId, dateFrom, dateTo) {
  try {
    const mongoose = require('mongoose');
    
    // Ensure userId is an ObjectId
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const match = { $match: { userId: userObjectId } };

    if (dateFrom || dateTo) {
      match.$match.date = {};
      if (dateFrom) match.$match.date.$gte = new Date(dateFrom);
      if (dateTo) match.$match.date.$lte = new Date(dateTo);
    }

    const pipeline = [
      match,
      {
        $group: {
          _id: '$crop',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          crop: { $ifNull: ['$_id', 'Unspecified'] },
          total: { $round: ['$total', 2] },
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] }
        }
      },
      { $sort: { total: -1 } }
    ];

    const result = await Expense.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Failed to generate crop summary: ${error.message}`);
  }
}


/**
 * Seasonal summary
 * @param {String} userId - User ID
 * @param {String} season - Season (Kharif, Rabi, Zaid)
 * @returns {Promise<Array>} Array of { category, total, count }
 */
async function seasonalSummary(userId, season) {
  try {
    const mongoose = require('mongoose');
    
    // Ensure userId is an ObjectId
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const validSeasons = ['Kharif', 'Rabi', 'Zaid'];
    if (!validSeasons.includes(season)) {
      throw new Error(`Invalid season. Valid options: ${validSeasons.join(', ')}`);
    }

    const pipeline = [
      {
        $match: {
          userId: userObjectId,
          season
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ];

    const result = await Expense.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Failed to generate seasonal summary: ${error.message}`);
  }
}

/**
 * Time series summary for charting (monthly aggregation)
 * @param {String} userId - User ID
 * @param {String} dateFrom - Start date
 * @param {String} dateTo - End date
 * @returns {Promise<Array>} Array of { month, total, count }
 */
async function timeserieSummary(userId, dateFrom, dateTo) {
  try {
    const mongoose = require('mongoose');
    
    // Ensure userId is an ObjectId
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const match = { $match: { userId: userObjectId } };

    if (dateFrom || dateTo) {
      match.$match.date = {};
      if (dateFrom) match.$match.date.$gte = new Date(dateFrom);
      if (dateTo) match.$match.date.$lte = new Date(dateTo);
    }

    const pipeline = [
      match,
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: { $round: ['$total', 2] },
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ];

    const result = await Expense.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Failed to generate timeseries summary: ${error.message}`);
  }
}

/**
 * Calculate cost per acre/hectare
 * @param {Number} totalExpense - Total expense amount
 * @param {Number} areaHa - Area in hectares
 * @returns {Object} { costPerHa, costPerAcre }
 */
function computeCostPerAcre(totalExpense, areaHa) {
  return Expense.calculateCostPerAcre(totalExpense, areaHa);
}

/**
 * Calculate ROI
 * @param {Number} totalExpense - Total investment
 * @param {Number} yieldQty - Yield quantity
 * @param {Number} pricePerUnit - Price per unit
 * @returns {Object} { totalRevenue, profit, roiPercentage, breakEven }
 */
function computeROI(totalExpense, yieldQty, pricePerUnit) {
  return Expense.calculateROI(totalExpense, yieldQty, pricePerUnit);
}

/**
 * Get expenses for a specific farm/crop combination
 * @param {String} userId - User ID
 * @param {String} crop - Crop name
 * @param {Number} areaHa - Area in hectares
 * @returns {Promise<Object>} Detailed expense breakdown with cost metrics
 */
async function getExpensesForCrop(userId, crop, areaHa) {
  try {
    const expenses = await Expense.find({ userId, crop: crop.toLowerCase() }).lean();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};

    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amount;
    });

    const costMetrics = areaHa ? computeCostPerAcre(total, areaHa) : null;

    return {
      crop,
      total: parseFloat(total.toFixed(2)),
      count: expenses.length,
      byCategory,
      costMetrics,
      expenses
    };
  } catch (error) {
    throw new Error(`Failed to fetch crop expenses: ${error.message}`);
  }
}

/**
 * Get monthly budget status
 * @param {String} userId - User ID
 * @param {Number} budgetLimit - Monthly budget limit
 * @returns {Promise<Object>} { currentMonth, spent, remaining, percentageUsed }
 */
async function getBudgetStatus(userId, budgetLimit) {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId,
      date: { $gte: firstDay, $lte: lastDay }
    }).lean();

    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budgetLimit - spent;
    const percentageUsed = (spent / budgetLimit) * 100;

    return {
      currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      spent: parseFloat(spent.toFixed(2)),
      budgetLimit,
      remaining: parseFloat(remaining.toFixed(2)),
      percentageUsed: parseFloat(percentageUsed.toFixed(2)),
      isExceeded: spent > budgetLimit
    };
  } catch (error) {
    throw new Error(`Failed to get budget status: ${error.message}`);
  }
}

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  summaryByCategory,
  summaryByCrop,
  seasonalSummary,
  timeserieSummary,
  computeCostPerAcre,
  computeROI,
  getExpensesForCrop,
  getBudgetStatus,
  loadCropData
};
