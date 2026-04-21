const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const SoilTest = require('../models/SoilTest');

/**
 * Soil Service
 * Handles soil analysis, classification, recommendations, and data persistence
 */

class SoilService {
  constructor() {
    this.regionNpkData = [];
    this.cropIdealNpkData = [];
    this.initialized = false;
  }

  /**
   * Load region NPK data from CSV
   * Caches the data in memory for fast lookups
   */
  async loadRegionNPK() {
    return new Promise((resolve, reject) => {
      if (this.regionNpkData.length > 0) {
        resolve();
        return;
      }

      const filePath = path.join(__dirname, '../data/region_npk_final_500.csv');
      const results = [];

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
          results.push({
            state: row.state?.trim() || '',
            district: row.district?.trim() || '',
            block: row.block?.trim() || '',
            avg_n: parseFloat(row.avg_n) || 0,
            avg_p: parseFloat(row.avg_p) || 0,
            avg_k: parseFloat(row.avg_k) || 0,
            avg_ph: parseFloat(row.avg_ph) || 7,
          });
        })
        .on('end', () => {
          this.regionNpkData = results;
          console.log(`✓ Loaded ${results.length} region NPK records`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Error loading region NPK CSV:', err);
          reject(err);
        });
    });
  }

  /**
   * Load crop ideal NPK data from CSV
   */
  async loadCropIdealNpk() {
    return new Promise((resolve, reject) => {
      if (this.cropIdealNpkData.length > 0) {
        resolve();
        return;
      }

      const filePath = path.join(__dirname, '../data/crop_ideal_npk.csv');
      const results = [];

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
          results.push({
            crop: row.crop?.trim() || '',
            min_n: parseFloat(row.min_n) || 0,
            max_n: parseFloat(row.max_n) || 200,
            min_p: parseFloat(row.min_p) || 0,
            max_p: parseFloat(row.max_p) || 100,
            min_k: parseFloat(row.min_k) || 0,
            max_k: parseFloat(row.max_k) || 200,
            min_ph: parseFloat(row.min_ph) || 6,
            max_ph: parseFloat(row.max_ph) || 7.5,
          });
        })
        .on('end', () => {
          this.cropIdealNpkData = results;
          console.log(`✓ Loaded ${results.length} crop ideal NPK records`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Error loading crop ideal NPK CSV:', err);
          resolve(); // Don't fail entire service if crop data unavailable
        });
    });
  }

  /**
   * Initialize the service by loading all CSV data
   */
  async initialize() {
    if (this.initialized) return;
    await Promise.all([this.loadRegionNPK(), this.loadCropIdealNpk()]);
    this.initialized = true;
  }

  /**
   * Get region soil data (NPK, pH) using fuzzy matching
   * @param {string} state - State name
   * @param {string} district - District name
   * @param {string} block - Block name
   * @returns {object} Region averages {avg_n, avg_p, avg_k, avg_ph}
   */
  getRegionSoil(state, district, block) {
    if (!this.regionNpkData.length) {
      throw new Error('Region NPK data not loaded');
    }

    // Normalize inputs
    const normalizedState = state?.trim().toLowerCase() || '';
    const normalizedDistrict = district?.trim().toLowerCase() || '';
    const normalizedBlock = block?.trim().toLowerCase() || '';

    // Exact match first
    let match = this.regionNpkData.find(
      (r) =>
        r.state.toLowerCase() === normalizedState &&
        r.district.toLowerCase() === normalizedDistrict &&
        r.block.toLowerCase() === normalizedBlock
    );

    // Fallback: match state + district
    if (!match) {
      match = this.regionNpkData.find(
        (r) =>
          r.state.toLowerCase() === normalizedState &&
          r.district.toLowerCase() === normalizedDistrict
      );
    }

    // Fallback: match state only
    if (!match) {
      match = this.regionNpkData.find((r) => r.state.toLowerCase() === normalizedState);
    }

    if (!match) {
      throw new Error(`Region data not found for: ${state}, ${district}, ${block}`);
    }

    return {
      avg_n: match.avg_n,
      avg_p: match.avg_p,
      avg_k: match.avg_k,
      avg_ph: match.avg_ph,
    };
  }

  /**
   * Classify nutrient value as Low/Medium/High
   * Thresholds based on agricultural standards:
   * - Nitrogen (N): <50 low, 50-100 medium, >100 high
   * - Phosphorus (P): <20 low, 20-40 medium, >40 high
   * - Potassium (K): <100 low, 100-200 medium, >200 high
   *
   * @param {number} value - Nutrient value
   * @param {string} type - 'N', 'P', or 'K'
   * @returns {string} Classification: 'Low', 'Medium', or 'High'
   */
  classifyNutrient(value, type) {
    const thresholds = {
      N: { low: 50, medium: 100 },
      P: { low: 20, medium: 40 },
      K: { low: 100, medium: 200 },
    };

    const threshold = thresholds[type];
    if (!threshold) throw new Error(`Unknown nutrient type: ${type}`);

    if (value < threshold.low) return 'Low';
    if (value < threshold.medium) return 'Medium';
    return 'High';
  }

  /**
   * Classify pH value as Acidic/Neutral/Alkaline
   * Standard soil pH scale:
   * - Acidic: pH < 6
   * - Neutral: 6 ≤ pH ≤ 7.5
   * - Alkaline: pH > 7.5
   *
   * @param {number} ph - pH value
   * @returns {string} Classification: 'Acidic', 'Neutral', or 'Alkaline'
   */
  classifyPH(ph) {
    if (ph < 6) return 'Acidic';
    if (ph <= 7.5) return 'Neutral';
    return 'Alkaline';
  }

  /**
   * Calculate overall Soil Health Score (0-100)
   * Weighted formula:
   * - N status: 30%
   * - P status: 25%
   * - K status: 25%
   * - pH status: 20%
   *
   * Status scoring: Low = 0, Medium = 50, High = 100
   * pH special: Neutral = 100, Acidic/Alkaline = 50
   *
   * @param {string} nStatus - Nitrogen classification
   * @param {string} pStatus - Phosphorus classification
   * @param {string} kStatus - Potassium classification
   * @param {string} phStatus - pH classification
   * @returns {number} Health score (0-100)
   */
  calculateHealthScore(nStatus, pStatus, kStatus, phStatus) {
    // Map status to score
    const statusToScore = {
      Low: 0,
      Medium: 50,
      High: 100,
    };

    const phToScore = {
      Acidic: 50,
      Neutral: 100,
      Alkaline: 50,
    };

    const nScore = statusToScore[nStatus] || 0;
    const pScore = statusToScore[pStatus] || 0;
    const kScore = statusToScore[kStatus] || 0;
    const phScore = phToScore[phStatus] || 50;

    // Weighted calculation: N(30%) + P(25%) + K(25%) + pH(20%)
    const healthScore = Math.round(nScore * 0.3 + pScore * 0.25 + kScore * 0.25 + phScore * 0.2);

    return Math.max(0, Math.min(100, healthScore));
  }

  /**
   * Find suitable crops based on soil NPK and pH
   * Crops must fit within min/max ranges for N, P, K, and pH
   *
   * @param {number} n - Nitrogen value
   * @param {number} p - Phosphorus value
   * @param {number} k - Potassium value
   * @param {number} ph - pH value
   * @returns {array} List of suitable crop names
   */
  findSuitableCrops(n, p, k, ph) {
    if (!this.cropIdealNpkData.length) return [];

    return this.cropIdealNpkData
      .filter((crop) => {
        const nMatch = n >= crop.min_n && n <= crop.max_n;
        const pMatch = p >= crop.min_p && p <= crop.max_p;
        const kMatch = k >= crop.min_k && k <= crop.max_k;
        const phMatch = ph >= crop.min_ph && ph <= crop.max_ph;

        return nMatch && pMatch && kMatch && phMatch;
      })
      .map((crop) => crop.crop)
      .slice(0, 10); // Top 10 suggestions
  }

  /**
   * Generate farmer-friendly recommendations
   *
   * @param {object} soil - Soil data {n, p, k, ph, nStatus, pStatus, kStatus, phStatus}
   * @returns {object} Recommendations {organic, fertilizer, phFix, suitableCrops, rotationTips}
   */
  generateRecommendations(soil) {
    const { n, p, k, ph, nStatus, pStatus, kStatus, phStatus } = soil;

    // Organic matter improvement
    let organic = 'Add organic matter to improve soil health: ';
    if (nStatus === 'Low') {
      organic +=
        '10-15 tons/hectare of cow manure or compost rich in nitrogen. ';
    } else if (nStatus === 'Medium') {
      organic += '5-8 tons/hectare of well-decomposed compost. ';
    }
    if (pStatus === 'Low' || kStatus === 'Low') {
      organic += 'Consider biochar or vermicompost for phosphorus and potassium retention.';
    }

    // Fertilizer correction
    let fertilizer = 'Fertilizer recommendations: ';
    const recommendations = [];

    if (nStatus === 'Low') {
      recommendations.push('Urea: 2-3 bags/hectare (46% N)');
    } else if (nStatus === 'Medium') {
      recommendations.push('Urea: 1-1.5 bags/hectare');
    }

    if (pStatus === 'Low') {
      recommendations.push('DAP (Di-ammonium Phosphate): 2-3 bags/hectare');
    } else if (pStatus === 'Medium') {
      recommendations.push('DAP: 1-1.5 bags/hectare');
    }

    if (kStatus === 'Low') {
      recommendations.push('MOP (Muriate of Potash): 1-2 bags/hectare (60% K)');
    } else if (kStatus === 'Medium') {
      recommendations.push('MOP: 0.5-1 bag/hectare');
    }

    fertilizer += recommendations.length > 0 ? recommendations.join('; ') : 'Soil is well-balanced for nutrients.';

    // pH correction
    let phFix = 'pH is ';
    if (phStatus === 'Acidic') {
      const limeNeeded = Math.round((6 - ph) * 2); // Rough calculation
      phFix += `Acidic (${ph}). Apply ground limestone (CaCO₃): ${limeNeeded}-${limeNeeded + 2} tons/hectare to raise pH to 6-6.5.`;
    } else if (phStatus === 'Alkaline') {
      phFix += `Alkaline (${ph}). Apply sulfur or aluminum sulfate to lower pH. Consult local agriculture officer for exact quantity.`;
    } else {
      phFix += `Neutral (${ph}). No pH correction needed. Maintain with regular organic matter addition.`;
    }

    // Suitable crops
    const suitableCrops = this.findSuitableCrops(n, p, k, ph);

    // Crop rotation tips
    let rotationTips = 'Crop rotation strategy: ';
    if (nStatus === 'Low') {
      rotationTips += 'Include nitrogen-fixing legume crops (chickpea, pigeon pea, lentil) in rotation. ';
    }
    rotationTips += 'Alternate between cereal and legume crops for soil balance. ';
    if (pStatus === 'Low') {
      rotationTips += 'Use phosphate-solubilizing bacteria or mycorrhizal inoculants in next season.';
    }

    return {
      organic,
      fertilizer,
      phFix,
      suitableCrops,
      rotationTips,
    };
  }

  /**
   * Perform complete soil analysis
   *
   * @param {object} soilData - Soil data with N, P, K, pH values
   * @returns {object} Complete analysis {classification, soilHealthScore, recommendations}
   */
  analyzeSoil(soilData) {
    const { n, p, k, ph } = soilData;

    // Validate inputs
    if (typeof n !== 'number' || typeof p !== 'number' || typeof k !== 'number' || typeof ph !== 'number') {
      throw new Error('N, P, K, and pH must be numbers');
    }

    // Classify nutrients
    const nStatus = this.classifyNutrient(n, 'N');
    const pStatus = this.classifyNutrient(p, 'P');
    const kStatus = this.classifyNutrient(k, 'K');
    const phStatus = this.classifyPH(ph);

    // Calculate health score
    const soilHealthScore = this.calculateHealthScore(nStatus, pStatus, kStatus, phStatus);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      n,
      p,
      k,
      ph,
      nStatus,
      pStatus,
      kStatus,
      phStatus,
    });

    return {
      classification: {
        nStatus,
        pStatus,
        kStatus,
        phStatus,
      },
      soilHealthScore,
      recommendations,
    };
  }

  /**
   * Save soil report to database
   *
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @param {object} soilData - Complete soil analysis data
   * @returns {object} Saved SoilTest document
   */
  async saveSoilReport(userId, soilData) {
    try {
      const report = new SoilTest({
        userId,
        ...soilData,
      });
      await report.save();
      return report;
    } catch (err) {
      console.error('Error saving soil report:', err);
      throw err;
    }
  }

  /**
   * Get user's soil test history
   *
   * @param {string} userId - User ID
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Results per page
   * @returns {object} {total, data: [SoilTests]}
   */
  async getSoilHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const total = await SoilTest.countDocuments({ userId });
      const data = await SoilTest.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { total, data, page, limit };
    } catch (err) {
      console.error('Error fetching soil history:', err);
      throw err;
    }
  }

  /**
   * Get all soil test history (admin only)
   */
  async getAllSoilHistory(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const total = await SoilTest.countDocuments();
      const data = await SoilTest.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email');

      return { total, data, page, limit };
    } catch (err) {
      console.error('Error fetching all soil history:', err);
      throw err;
    }
  }
}

// Export singleton instance
module.exports = new SoilService();
