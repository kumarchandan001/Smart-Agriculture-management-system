const mongoose = require('mongoose');

const PestRecordSchema = new mongoose.Schema(
  {
    // User & Farm Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
    },

    // Crop Info
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    fieldName: String,
    fieldArea: Number, // hectares

    // Pest Detection
    pestName: {
      type: String,
      required: true,
      trim: true,
    },
    probablePests: [
      {
        name: String,
        confidence: Number, // 0-100
      },
    ],

    // Symptoms & Detection
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    detectionMethod: {
      type: String,
      enum: ['symptoms', 'image', 'manual'],
      required: true,
    },
    imageUrl: String,
    imageAnalysisResult: {
      mlConfidence: Number,
      predictedPests: [String],
    },

    // Severity Assessment
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    affectedArea: Number, // percentage of field

    // Treatment Info
    recommendedTreatment: {
      pestCatalogId: mongoose.Schema.Types.ObjectId,
      name: String,
      type: String, // chemical, biological, cultural
      dosage: String,
      frequency: String,
      duration: Number, // days
      cost: Number,
    },

    // Treatment Applied
    treatmentApplied: {
      treatmentId: String,
      date: Date,
      dose: String,
      method: String,
      notes: String,
      effectiveness: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
      },
      effectivenessNotes: String,
    },

    // Cost Tracking
    cost: {
      treatment: Number,
      labor: Number,
      equipment: Number,
      total: Number,
    },

    // Timeline
    dateObserved: {
      type: Date,
      required: true,
    },
    dateTreated: Date,
    dateResolved: Date,
    resolved: {
      type: Boolean,
      default: false,
    },

    // Additional Notes
    notes: String,
    weatherCondition: String,
    preventiveMeasuresTaken: [String],

    // Follow-up
    followUpNeeded: Boolean,
    followUpDate: Date,
    followUpNotes: String,
  },
  { timestamps: true }
);

// Index for faster queries
PestRecordSchema.index({ userId: 1, createdAt: -1 });
PestRecordSchema.index({ crop: 1 });
PestRecordSchema.index({ pestName: 1 });
PestRecordSchema.index({ dateObserved: -1 });
PestRecordSchema.index({ resolved: 1 });
PestRecordSchema.index({ userId: 1, dateObserved: -1 });

module.exports = mongoose.model('PestRecord', PestRecordSchema);
