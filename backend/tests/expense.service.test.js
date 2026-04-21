/**
 * Expense Service Unit Tests - Example Skeleton
 * Full Jest test suite for expense business logic
 * 
 * To run:
 * npm install --save-dev jest supertest
 * npm test -- expense.service.test.js
 */

const expenseService = require('../services/expense.service');
const Expense = require('../models/Expense');

// Mock MongoDB/Mongoose
jest.mock('../models/Expense');

describe('Expense Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============ CRUD Operations ============

  describe('createExpense', () => {
    it('should create a new expense with valid data', async () => {
      const userId = 'user123';
      const payload = {
        category: 'seeds',
        amount: 2500,
        crop: 'rice'
      };

      const mockExpense = {
        ...payload,
        userId,
        toJSON: jest.fn().mockReturnValue({
          id: 'exp123',
          ...payload,
          userId
        })
      };

      Expense.prototype.save = jest.fn().mockResolvedValue(true);
      Expense.mockImplementation(() => mockExpense);

      const result = await expenseService.createExpense(userId, payload);

      expect(result.userId).toBe(userId);
      expect(result.category).toBe('seeds');
      expect(result.amount).toBe(2500);
    });

    it('should throw error if amount is negative', async () => {
      const userId = 'user123';
      const payload = {
        category: 'seeds',
        amount: -100
      };

      Expense.prototype.save = jest.fn()
        .mockRejectedValue(new Error('Amount cannot be negative'));

      await expect(
        expenseService.createExpense(userId, payload)
      ).rejects.toThrow();
    });
  });

  describe('updateExpense', () => {
    it('should update expense for authorized user', async () => {
      const userId = 'user123';
      const expenseId = 'exp123';
      const updateData = { amount: 3000 };

      const mockExpense = {
        _id: expenseId,
        userId,
        amount: 2500,
        category: 'seeds',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: expenseId,
          userId,
          amount: 3000,
          category: 'seeds'
        })
      };

      Expense.findOne = jest.fn().mockResolvedValue(mockExpense);

      const result = await expenseService.updateExpense(userId, expenseId, updateData);

      expect(result.amount).toBe(3000);
      expect(Expense.findOne).toHaveBeenCalledWith({ _id: expenseId, userId });
    });

    it('should throw error if expense not found', async () => {
      const userId = 'user123';
      const expenseId = 'nonexistent';

      Expense.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        expenseService.updateExpense(userId, expenseId, {})
      ).rejects.toThrow('Expense not found or unauthorized');
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense for authorized user', async () => {
      const userId = 'user123';
      const expenseId = 'exp123';

      Expense.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const result = await expenseService.deleteExpense(userId, expenseId);

      expect(result).toBe(true);
      expect(Expense.deleteOne).toHaveBeenCalledWith({ _id: expenseId, userId });
    });

    it('should throw error if expense not found', async () => {
      const userId = 'user123';
      const expenseId = 'nonexistent';

      Expense.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

      await expect(
        expenseService.deleteExpense(userId, expenseId)
      ).rejects.toThrow('Expense not found or unauthorized');
    });
  });

  // ============ List & Filter ============

  describe('listExpenses', () => {
    it('should list expenses with pagination', async () => {
      const userId = 'user123';
      const filters = { page: 1, limit: 10 };

      const mockExpenses = [
        { id: 'exp1', category: 'seeds', amount: 2500 },
        { id: 'exp2', category: 'fertilizer', amount: 4500 }
      ];

      Expense.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockExpenses)
          })
        })
      });

      Expense.countDocuments = jest.fn().mockResolvedValue(2);

      const result = await expenseService.listExpenses(userId, filters);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter expenses by date range', async () => {
      const userId = 'user123';
      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        page: 1,
        limit: 10
      };

      Expense.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      Expense.countDocuments = jest.fn().mockResolvedValue(0);

      await expenseService.listExpenses(userId, filters);

      const queryArg = Expense.find.mock.calls[0][0];
      expect(queryArg.date).toBeDefined();
      expect(queryArg.date.$gte).toBeDefined();
      expect(queryArg.date.$lte).toBeDefined();
    });

    it('should filter expenses by category', async () => {
      const userId = 'user123';
      const filters = { category: 'seeds', page: 1, limit: 10 };

      Expense.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      Expense.countDocuments = jest.fn().mockResolvedValue(0);

      await expenseService.listExpenses(userId, filters);

      const queryArg = Expense.find.mock.calls[0][0];
      expect(queryArg.category).toBe('seeds');
    });
  });

  // ============ Aggregations ============

  describe('summaryByCategory', () => {
    it('should return expenses grouped by category', async () => {
      const userId = 'user123';

      const mockResult = [
        { category: 'fertilizer', total: 25000, count: 5, avgAmount: 5000 },
        { category: 'seeds', total: 12500, count: 5, avgAmount: 2500 }
      ];

      Expense.aggregate = jest.fn().mockResolvedValue(mockResult);

      const result = await expenseService.summaryByCategory(userId);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('fertilizer');
      expect(result[0].total).toBe(25000);
      expect(Expense.aggregate).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      const userId = 'user123';
      const dateFrom = '2024-01-01';
      const dateTo = '2024-12-31';

      Expense.aggregate = jest.fn().mockResolvedValue([]);

      await expenseService.summaryByCategory(userId, dateFrom, dateTo);

      const pipeline = Expense.aggregate.mock.calls[0][0];
      const matchStage = pipeline[0];

      expect(matchStage.$match.date).toBeDefined();
      expect(matchStage.$match.date.$gte).toBeDefined();
      expect(matchStage.$match.date.$lte).toBeDefined();
    });
  });

  describe('summaryByCrop', () => {
    it('should return expenses grouped by crop', async () => {
      const userId = 'user123';

      const mockResult = [
        { crop: 'rice', total: 45000, count: 10, avgAmount: 4500 },
        { crop: 'wheat', total: 35000, count: 8, avgAmount: 4375 }
      ];

      Expense.aggregate = jest.fn().mockResolvedValue(mockResult);

      const result = await expenseService.summaryByCrop(userId);

      expect(result).toHaveLength(2);
      expect(result[0].crop).toBe('rice');
      expect(result[0].total).toBe(45000);
    });
  });

  describe('seasonalSummary', () => {
    it('should return expenses for Kharif season', async () => {
      const userId = 'user123';
      const season = 'Kharif';

      const mockResult = [
        { category: 'fertilizer', total: 15000, count: 3 },
        { category: 'labour', total: 10000, count: 2 }
      ];

      Expense.aggregate = jest.fn().mockResolvedValue(mockResult);

      const result = await expenseService.seasonalSummary(userId, season);

      expect(result).toHaveLength(2);
      expect(Expense.aggregate).toHaveBeenCalled();

      const pipeline = Expense.aggregate.mock.calls[0][0];
      const matchStage = pipeline[0];
      expect(matchStage.$match.season).toBe('Kharif');
    });

    it('should throw error for invalid season', async () => {
      const userId = 'user123';
      const season = 'InvalidSeason';

      await expect(
        expenseService.seasonalSummary(userId, season)
      ).rejects.toThrow('Invalid season');
    });
  });

  describe('timeserieSummary', () => {
    it('should return monthly aggregation', async () => {
      const userId = 'user123';

      const mockResult = [
        { month: '2024-01', total: 8500, count: 5 },
        { month: '2024-02', total: 12300, count: 8 },
        { month: '2024-03', total: 9800, count: 6 }
      ];

      Expense.aggregate = jest.fn().mockResolvedValue(mockResult);

      const result = await expenseService.timeserieSummary(userId);

      expect(result).toHaveLength(3);
      expect(result[0].month).toBe('2024-01');
      expect(result[0].total).toBe(8500);
    });
  });

  // ============ Calculations ============

  describe('computeCostPerAcre', () => {
    it('should calculate cost per hectare and per acre', () => {
      const totalExpense = 50000;
      const areaHa = 2.5;

      const result = expenseService.computeCostPerAcre(totalExpense, areaHa);

      expect(result.costPerHa).toBe(20000);
      expect(result.costPerAcre).toBeCloseTo(8093.71, 2);
    });

    it('should throw error for zero area', () => {
      const totalExpense = 50000;
      const areaHa = 0;

      expect(() => {
        expenseService.computeCostPerAcre(totalExpense, areaHa);
      }).toThrow('Area in hectares must be positive');
    });

    it('should throw error for negative area', () => {
      const totalExpense = 50000;
      const areaHa = -2.5;

      expect(() => {
        expenseService.computeCostPerAcre(totalExpense, areaHa);
      }).toThrow('Area in hectares must be positive');
    });
  });

  describe('computeROI', () => {
    it('should calculate ROI correctly', () => {
      const totalExpense = 50000;
      const yieldQty = 500;
      const pricePerUnit = 200;

      const result = expenseService.computeROI(totalExpense, yieldQty, pricePerUnit);

      expect(result.totalRevenue).toBe(100000);
      expect(result.profit).toBe(50000);
      expect(result.roiPercentage).toBe(100);
      expect(result.breakEven).toBe(true);
    });

    it('should handle loss scenario', () => {
      const totalExpense = 50000;
      const yieldQty = 200;
      const pricePerUnit = 150;

      const result = expenseService.computeROI(totalExpense, yieldQty, pricePerUnit);

      expect(result.totalRevenue).toBe(30000);
      expect(result.profit).toBe(-20000);
      expect(result.roiPercentage).toBe(-40);
      expect(result.breakEven).toBe(false);
    });

    it('should throw error for negative values', () => {
      expect(() => {
        expenseService.computeROI(-50000, 500, 200);
      }).toThrow('Expense, yield, and price must be non-negative');
    });
  });

  describe('getExpensesForCrop', () => {
    it('should return crop expenses with cost analysis', async () => {
      const userId = 'user123';
      const crop = 'rice';
      const areaHa = 2.5;

      const mockExpenses = [
        { crop: 'rice', category: 'seeds', amount: 2500 },
        { crop: 'rice', category: 'fertilizer', amount: 25000 }
      ];

      Expense.find = jest.fn().mockResolvedValue(mockExpenses);

      const result = await expenseService.getExpensesForCrop(userId, crop, areaHa);

      expect(result.crop).toBe('rice');
      expect(result.total).toBe(27500);
      expect(result.count).toBe(2);
      expect(result.costMetrics).toBeDefined();
      expect(result.costMetrics.costPerHa).toBe(11000);
    });
  });

  describe('getBudgetStatus', () => {
    it('should show budget within limit', async () => {
      const userId = 'user123';
      const budgetLimit = 100000;

      const mockExpenses = [
        { amount: 25000, date: new Date() },
        { amount: 20000, date: new Date() }
      ];

      Expense.find = jest.fn().mockResolvedValue(mockExpenses);

      const result = await expenseService.getBudgetStatus(userId, budgetLimit);

      expect(result.spent).toBe(45000);
      expect(result.budgetLimit).toBe(100000);
      expect(result.remaining).toBe(55000);
      expect(result.percentageUsed).toBe(45);
      expect(result.isExceeded).toBe(false);
    });

    it('should show budget exceeded', async () => {
      const userId = 'user123';
      const budgetLimit = 50000;

      const mockExpenses = [
        { amount: 35000, date: new Date() },
        { amount: 20000, date: new Date() }
      ];

      Expense.find = jest.fn().mockResolvedValue(mockExpenses);

      const result = await expenseService.getBudgetStatus(userId, budgetLimit);

      expect(result.spent).toBe(55000);
      expect(result.isExceeded).toBe(true);
      expect(result.remaining).toBe(-5000);
    });
  });
});

// ============ Controller Tests ============

describe('Expense Controller', () => {
  // Similar structure for controller tests
  // Testing request validation, response formatting, error handling
  // Example:
  /*
  describe('createExpense endpoint', () => {
    it('should validate required fields', async () => {
      const req = {
        user: { id: 'user123' },
        body: { amount: 2500 } // Missing category
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await expenseController.createExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
  */
});
