const mongoose = require('mongoose');

const PestCatalogSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['insect', 'disease', 'weed', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // Crop Association
    cropList: [
      {
        type: String,
        trim: true,
      },
    ],

    // Detection
    symptomKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    description: String,

    // Treatments
    recommendedTreatments: [
      {
        type: {
          type: String,
          enum: ['chemical', 'biological', 'cultural'],
        },
        name: String,
        activeIngredient: String,
        dosage: Number,
        unit: {
          type: String,
          enum: ['ml/L', 'g/L', 'kg/ha', 'units/L'],
        },
        applicationMethod: String,
        frequency: String, // e.g., "Every 7 days", "2-3 times per season"
        interval: Number, // days between applications
        maxApplications: Number,
        notes: String,
        precautions: String,
        ppe: [String], // PPE requirements
        phi: Number, // Pre-harvest interval in days
        cost: Number, // Approx cost per application
      },
    ],

    // Prevention
    preventiveMeasures: [
      {
        measure: String,
        description: String,
        timing: String, // When to apply
      },
    ],

    // Region-specific Info
    regionNotes: {
      type: Map,
      of: String, // state -> notes
    },

    // Sample Images/References
    sampleImages: [
      {
        url: String,
        description: String,
      },
    ],

    // Life Cycle Info
    lifecycle: {
      duration: String,
      activeSeason: [String],
      optimumTemperature: String,
      optimumHumidity: String,
    },

    // Admin Fields
    createdBy: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PestCatalogSchema.index({ name: 1 });
PestCatalogSchema.index({ cropList: 1 });
PestCatalogSchema.index({ symptomKeywords: 1 });
PestCatalogSchema.index({ severity: 1 });

module.exports = mongoose.model('PestCatalog', PestCatalogSchema);
