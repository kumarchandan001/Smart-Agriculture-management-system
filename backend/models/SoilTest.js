const mongoose = require('mongoose');

/**
 * SoilTest Schema
 * Stores soil analysis results per user with NPK, pH classification, health score, and recommendations
 */
const SoilTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Region information (optional - for region-based analysis)
    region: {
      state: String,
      district: String,
      block: String,
    },
    
    // Soil nutrient values (NPK + pH)
    n: {
      type: Number,
      min: 0,
      max: 300,
    },
    p: {
      type: Number,
      min: 0,
      max: 150,
    },
    k: {
      type: Number,
      min: 0,
      max: 300,
    },
    ph: {
      type: Number,
      min: 3,
      max: 10,
    },
    
    // Classification results
    classification: {
      nStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
      },
      pStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
      },
      kStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
      },
      phStatus: {
        type: String,
        enum: ['Acidic', 'Neutral', 'Alkaline'],
      },
    },
    
    // Overall soil health score (0-100)
    soilHealthScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Farmer-friendly recommendations
    recommendations: {
      // Organic matter improvement
      organic: {
        type: String,
        default: '',
      },
      
      // Fertilizer correction suggestions
      fertilizer: {
        type: String,
        default: '',
      },
      
      // pH correction (lime/gypsum)
      phFix: {
        type: String,
        default: '',
      },
      
      // Suitable crops based on soil
      suitableCrops: [String],
      
      // Crop rotation tips
      rotationTips: {
        type: String,
        default: '',
      },
    },
    
    // Analysis mode indicator
    analysisMode: {
      type: String,
      enum: ['region', 'manual'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
SoilTestSchema.index({ userId: 1, createdAt: -1 });
SoilTestSchema.index({ userId: 1 });

module.exports = mongoose.model('SoilTest', SoilTestSchema);
