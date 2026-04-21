const PestCatalog = require('../models/PestCatalog');
const PestRecord = require('../models/PestRecord');
const fs = require('fs');
const path = require('path');

class PestService {
  constructor() {
    this.catalogCache = [];
    this.lastCacheUpdate = null;
  }

  /**
   * Initialize pest service - load catalog into cache
   */
  async initialize() {
    try {
      await this.loadCatalogCache();
      console.log('✓ Pest service initialized');
    } catch (error) {
      console.error('Error initializing pest service:', error);
      throw error;
    }
  }

  /**
   * Load pest catalog into memory cache
   */
  async loadCatalogCache() {
    try {
      this.catalogCache = await PestCatalog.find({ isActive: true }).lean();
      this.lastCacheUpdate = new Date();
      console.log(`✓ Loaded ${this.catalogCache.length} pests into cache`);
    } catch (error) {
      console.error('Error loading pest catalog:', error);
      throw error;
    }
  }

  /**
   * Detect pest from symptoms
   * Returns: { success, pestName, confidence, recommendations, probablePests[] }
   */
  async detectFromSymptoms(symptoms, crop) {
    try {
      if (!symptoms || symptoms.length === 0) {
        return {
          success: false,
          error: 'No symptoms provided',
        };
      }

      const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

      // Search in cache
      const matches = [];

      for (const pest of this.catalogCache) {
        if (pest.cropList.length > 0 && !pest.cropList.includes(crop)) {
          continue; // Skip if crop not applicable
        }

        // Calculate match score
        let matchScore = 0;
        let matchedSymptoms = 0;

        for (const symptom of normalizedSymptoms) {
          for (const keyword of pest.symptomKeywords) {
            // Flexible matching: check if symptom contains keyword or keyword contains symptom
            // Also check for partial word matches (e.g., "yellow" matches "yellowing")
            const symptomWords = symptom.split(' ');
            const keywordWords = keyword.split(' ');
            
            let isMatch = false;
            for (const swrd of symptomWords) {
              for (const kwrd of keywordWords) {
                if (swrd.includes(kwrd) || kwrd.includes(swrd)) {
                  isMatch = true;
                  break;
                }
              }
              if (isMatch) break;
            }
            
            if (isMatch) {
              matchScore += 25;
              matchedSymptoms++;
              break;
            }
          }
        }

        if (matchedSymptoms > 0) {
          const confidence = Math.min(100, (matchScore / (normalizedSymptoms.length * 25)) * 100);
          matches.push({
            id: pest._id,
            name: pest.name,
            type: pest.type,
            confidence: Math.round(confidence),
            severity: pest.severity,
            treatments: pest.recommendedTreatments,
            preventiveMeasures: pest.preventiveMeasures,
          });
        }
      }

      // Sort by confidence
      matches.sort((a, b) => b.confidence - a.confidence);

      if (matches.length === 0) {
        return {
          success: false,
          error: 'No matching pests found for these symptoms',
        };
      }

      // Return top match + alternatives
      return {
        success: true,
        topMatch: matches[0],
        probablePests: matches.slice(0, 5),
      };
    } catch (error) {
      console.error('Error in detectFromSymptoms:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect pest from image (calls ML service, with fallback)
   * Returns: { success, prediction, confidence, fallbackUsed }
   */
  async detectFromImage(imagePath) {
    try {
      if (!imagePath || !fs.existsSync(imagePath)) {
        return {
          success: false,
          error: 'Image file not found',
        };
      }

      // Try ML service first
      try {
        const mlResult = await this.callMLService(imagePath);
        if (mlResult.success) {
          return {
            success: true,
            prediction: mlResult.prediction,
            confidence: mlResult.confidence,
            fallbackUsed: false,
            detectionMethod: 'ml',
          };
        }
      } catch (mlError) {
        console.warn('ML service unavailable, using fallback:', mlError.message);
      }

      // Fallback: basic image analysis (file size, format as proxy)
      const fileStats = fs.statSync(imagePath);
      const fileName = path.basename(imagePath).toLowerCase();

      const fallbackPrediction = {
        pestName: 'Unidentified pest (image analysis)',
        confidence: 30,
        recommendation: 'Please upload a clearer image or provide symptoms',
      };

      return {
        success: true,
        prediction: fallbackPrediction,
        confidence: 30,
        fallbackUsed: true,
        detectionMethod: 'fallback',
      };
    } catch (error) {
      console.error('Error in detectFromImage:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Call ML FastAPI service for image detection
   */
  async callMLService(imagePath) {
    // This is a hook for integration with FastAPI ML service
    // For now, return mock response
    // In production, use FormData + axios to send image to ML endpoint

    return {
      success: false, // ML service not available by default
      error: 'ML service not configured',
    };
  }

  /**
   * Get treatment recommendations for a pest
   */
  async recommendTreatment(pestName, crop = null) {
    try {
      const pest = this.catalogCache.find(p => p.name.toLowerCase() === pestName.toLowerCase());

      if (!pest) {
        return {
          success: false,
          error: `Pest "${pestName}" not found in catalog`,
        };
      }

      return {
        success: true,
        pestName: pest.name,
        treatments: pest.recommendedTreatments,
        preventiveMeasures: pest.preventiveMeasures,
        severity: pest.severity,
        description: pest.description,
      };
    } catch (error) {
      console.error('Error in recommendTreatment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Save a pest record to database
   */
  async savePestRecord(userId, pestData) {
    try {
      const record = new PestRecord({
        userId,
        ...pestData,
      });

      await record.save();

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      console.error('Error in savePestRecord:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a pest record
   */
  async updatePestRecord(recordId, updates) {
    try {
      const record = await PestRecord.findByIdAndUpdate(recordId, updates, {
        new: true,
      });

      if (!record) {
        return {
          success: false,
          error: 'Record not found',
        };
      }

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      console.error('Error in updatePestRecord:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all pest records for a user
   */
  async listPestRecords(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.crop) {
        query.crop = filters.crop;
      }
      if (filters.pestName) {
        query.pestName = new RegExp(filters.pestName, 'i');
      }
      if (filters.resolved !== undefined) {
        query.resolved = filters.resolved;
      }

      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const records = await PestRecord.find(query)
        .sort({ dateObserved: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await PestRecord.countDocuments(query);

      return {
        success: true,
        data: records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in listPestRecords:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get summary statistics by pest
   */
  async summaryByPest(userId) {
    try {
      const records = await PestRecord.find({ userId }).lean();

      const summary = {};

      for (const record of records) {
        if (!summary[record.pestName]) {
          summary[record.pestName] = {
            count: 0,
            totalCost: 0,
            resolved: 0,
            avgSeverity: [],
          };
        }

        summary[record.pestName].count++;
        summary[record.pestName].totalCost += record.cost?.total || 0;
        if (record.resolved) {
          summary[record.pestName].resolved++;
        }
        if (record.severity) {
          summary[record.pestName].avgSeverity.push(
            { low: 1, medium: 2, high: 3, critical: 4 }[record.severity] || 2
          );
        }
      }

      // Calculate averages
      for (const pest in summary) {
        const severities = summary[pest].avgSeverity;
        summary[pest].avgSeverity =
          severities.length > 0
            ? Math.round(severities.reduce((a, b) => a + b) / severities.length)
            : 0;
        delete summary[pest].avgSeverity;
      }

      const sortedSummary = Object.entries(summary)
        .map(([pestName, stats]) => ({ pestName, ...stats }))
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: sortedSummary,
      };
    } catch (error) {
      console.error('Error in summaryByPest:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get summary by crop
   */
  async summaryByCrop(userId) {
    try {
      const records = await PestRecord.find({ userId }).lean();

      const summary = {};

      for (const record of records) {
        if (!summary[record.crop]) {
          summary[record.crop] = {
            count: 0,
            totalCost: 0,
            pests: new Set(),
          };
        }

        summary[record.crop].count++;
        summary[record.crop].totalCost += record.cost?.total || 0;
        summary[record.crop].pests.add(record.pestName);
      }

      const sortedSummary = Object.entries(summary)
        .map(([crop, stats]) => ({
          crop,
          pestCount: stats.count,
          totalCost: stats.totalCost,
          uniquePests: Array.from(stats.pests),
        }))
        .sort((a, b) => b.pestCount - a.pestCount);

      return {
        success: true,
        data: sortedSummary,
      };
    } catch (error) {
      console.error('Error in summaryByCrop:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get seasonal summary
   */
  async summaryBySeason(userId) {
    try {
      const records = await PestRecord.find({ userId }).lean();

      const months = {
        1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
        7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
      };

      const summary = {};

      for (const record of records) {
        const month = new Date(record.dateObserved).getMonth() + 1;
        const monthName = months[month];

        if (!summary[monthName]) {
          summary[monthName] = {
            count: 0,
            totalCost: 0,
          };
        }

        summary[monthName].count++;
        summary[monthName].totalCost += record.cost?.total || 0;
      }

      const monthOrder = Object.values(months);
      const sortedSummary = monthOrder
        .map(m => ({
          month: m,
          ...(summary[m] || { count: 0, totalCost: 0 }),
        }))
        .filter(m => m.count > 0);

      return {
        success: true,
        data: sortedSummary,
      };
    } catch (error) {
      console.error('Error in summaryBySeason:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get region-level alerts
   * Threshold: >5 same pest records in last 30 days
   */
  async getRegionAlerts(state, district) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // For now, return mock alerts. In production, would query user's region data
      const alerts = [];

      // Example alert structure
      const exampleAlert = {
        pestName: 'Early Blight',
        severity: 'high',
        count: 8,
        region: `${state}, ${district}`,
        recommendation: 'Apply fungicide immediately. Avoid overhead irrigation.',
      };

      return {
        success: true,
        data: alerts,
        message: 'No active pest alerts for your region',
      };
    } catch (error) {
      console.error('Error in getRegionAlerts:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a pest record
   */
  async deletePestRecord(recordId, userId) {
    try {
      const record = await PestRecord.findOneAndDelete({
        _id: recordId,
        userId,
      });

      if (!record) {
        return {
          success: false,
          error: 'Record not found or unauthorized',
        };
      }

      return {
        success: true,
        message: 'Record deleted',
      };
    } catch (error) {
      console.error('Error in deletePestRecord:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get pest catalog (for admin)
   */
  async getPestCatalog() {
    try {
      return {
        success: true,
        data: this.catalogCache,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add pest to catalog (admin)
   */
  async addPestToCatalog(pestData) {
    try {
      const pest = new PestCatalog(pestData);
      await pest.save();
      await this.loadCatalogCache(); // Refresh cache

      return {
        success: true,
        data: pest,
      };
    } catch (error) {
      console.error('Error in addPestToCatalog:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new PestService();
