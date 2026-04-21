/**
 * Expense Model
 * Tracks farm-related expenses including seeds, fertilizer, labor, machinery, etc.
 * Enables cost tracking, ROI calculation, and expense categorization
 */

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null
    },

    crop: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true
    },

    category: {
      type: String,
      enum: {
        values: ['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'],
        message: '{VALUE} is not a valid expense category'
      },
      required: [true, 'Category is required'],
      index: true
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      set: val => parseFloat(val)
    },

    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },

    date: {
      type: Date,
      default: Date.now,
      index: true
    },

    season: {
      type: String,
      enum: {
        values: ['Kharif', 'Rabi', 'Zaid'],
        message: '{VALUE} is not a valid season'
      },
      default: null
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    },

    receiptUrl: {
      type: String,
      default: null
    },

    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: null
    },

    unit: {
      type: String,
      enum: ['kg', 'liter', 'piece', 'bag', 'hour', 'day', 'acre', 'hectare', null],
      default: null
    },

    supplier: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'expenses'
  }
);

// Compound index for efficient querying by userId and date
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, crop: 1 });
ExpenseSchema.index({ userId: 1, season: 1 });

/**
 * Pre-save hook to validate season based on date
 */
ExpenseSchema.pre('save', function(next) {
  if (!this.season && this.date) {
    const month = this.date.getMonth() + 1; // 1-12
    // Kharif: June-Oct (6-10), Rabi: Nov-Mar (11,12,1,2,3), Zaid: Apr-May (4-5)
    if (month >= 6 && month <= 10) this.season = 'Kharif';
    else if ([11, 12, 1, 2, 3].includes(month)) this.season = 'Rabi';
    else this.season = 'Zaid';
  }
  next();
});

/**
 * Instance method to format expense response
 */
ExpenseSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    userId: obj.userId,
    farmId: obj.farmId,
    crop: obj.crop,
    category: obj.category,
    amount: obj.amount,
    currency: obj.currency,
    date: obj.date,
    season: obj.season,
    notes: obj.notes,
    receiptUrl: obj.receiptUrl,
    quantity: obj.quantity,
    unit: obj.unit,
    supplier: obj.supplier,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

/**
 * Static method to calculate cost per acre
 * @param {Number} totalExpense - Total expense in currency units
 * @param {Number} areaHa - Farm area in hectares
 * @returns {Object} { costPerHa, costPerAcre }
 */
ExpenseSchema.statics.calculateCostPerAcre = function(totalExpense, areaHa) {
  if (!areaHa || areaHa <= 0) {
    throw new Error('Area in hectares must be positive');
  }
  const costPerHa = totalExpense / areaHa;
  const costPerAcre = costPerHa / 2.47105; // 1 ha = 2.47105 acres
  return {
    costPerHa: parseFloat(costPerHa.toFixed(2)),
    costPerAcre: parseFloat(costPerAcre.toFixed(2))
  };
};

/**
 * Static method to calculate ROI
 * @param {Number} totalExpense - Total investment in currency units
 * @param {Number} yieldQty - Yield quantity
 * @param {Number} pricePerUnit - Price per unit of yield
 * @returns {Object} { totalRevenue, profit, roiPercentage }
 */
ExpenseSchema.statics.calculateROI = function(totalExpense, yieldQty, pricePerUnit) {
  if (totalExpense < 0 || yieldQty < 0 || pricePerUnit < 0) {
    throw new Error('Expense, yield, and price must be non-negative');
  }
  const totalRevenue = yieldQty * pricePerUnit;
  const profit = totalRevenue - totalExpense;
  const roiPercentage = totalExpense > 0 ? (profit / totalExpense) * 100 : 0;
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    roiPercentage: parseFloat(roiPercentage.toFixed(2)),
    breakEven: totalExpense <= 0 || profit >= 0
  };
};

module.exports = mongoose.model('Expense', ExpenseSchema);
