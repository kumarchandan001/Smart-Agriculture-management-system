/**
 * Fertilizer Guide Service
 * Analyzes soil NPK levels and crop requirements to recommend fertilizers
 * with exact quantities and application schedules.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// ============================================
// FERTILIZER DATABASE (Hardcoded)
// ============================================
const FERTILIZER_DB = {
  urea: {
    name: 'Urea',
    nitrogen: 46,
    phosphorus: 0,
    potassium: 0,
    cost_per_kg: 25,
    description: 'High nitrogen fertilizer, suitable for vegetative growth'
  },
  dap: {
    name: 'DAP (Di-Ammonium Phosphate)',
    nitrogen: 18,
    phosphorus: 46, // P2O5 - needs conversion
    phosphorus_p2o5: true,
    potassium: 0,
    cost_per_kg: 28,
    description: 'Balanced N:P, good for early growth stage'
  },
  mop: {
    name: 'MOP (Muriate of Potash)',
    nitrogen: 0,
    phosphorus: 0,
    potassium: 60, // K2O - needs conversion
    potassium_k2o: true,
    cost_per_kg: 18,
    description: 'Pure potassium source, essential for fruiting and quality'
  },
  ssp: {
    name: 'SSP (Single Super Phosphate)',
    nitrogen: 0,
    phosphorus: 16, // P2O5 - needs conversion
    phosphorus_p2o5: true,
    potassium: 0,
    cost_per_kg: 15,
    description: 'Phosphorus rich with calcium sulphate'
  },
  npk_10_26_26: {
    name: 'NPK 10:26:26',
    nitrogen: 10,
    phosphorus: 26, // P2O5 - needs conversion
    phosphorus_p2o5: true,
    potassium: 26, // K2O - needs conversion
    potassium_k2o: true,
    cost_per_kg: 30,
    description: 'Balanced NPK ratio, suitable for multiple crops'
  },
  npk_12_32_16: {
    name: 'NPK 12:32:16',
    nitrogen: 12,
    phosphorus: 32, // P2O5
    phosphorus_p2o5: true,
    potassium: 16, // K2O
    potassium_k2o: true,
    cost_per_kg: 32,
    description: 'P-rich formulation, good for flowering crops'
  }
};

// ============================================
// NUTRIENT CONVERSION FORMULAS
// ============================================
/**
 * Convert P2O5 to elemental P
 * P = P2O5 * 0.436
 */
const convertP2O5toP = (p2o5) => p2o5 * 0.436;

/**
 * Convert K2O to elemental K
 * K = K2O * 0.83
 */
const convertK2OtoK = (k2o) => k2o * 0.83;

// ============================================
// CSV LOADING & CACHING
// ============================================
let regionNPKCache = [];
let cropIdealNPKCache = [];

const loadRegionNPKCSV = () => {
  try {
    const filePath = path.join(__dirname, '../data/region_npk_final_500.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    regionNPKCache = parse(content, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.column === 'avg_n' || context.column === 'avg_p' ||
            context.column === 'avg_k' || context.column === 'avg_ph') {
          return parseFloat(value);
        }
        return value;
      }
    });
    console.log(`✓ Loaded ${regionNPKCache.length} region NPK records`);
    return regionNPKCache;
  } catch (err) {
    console.error('Error loading region_npk_final_500.csv:', err.message);
    return [];
  }
};

const loadCropIdealNPKCSV = () => {
  try {
    const filePath = path.join(__dirname, '../data/crop_ideal_npk.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    cropIdealNPKCache = parse(content, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.column === 'ideal_N' || context.column === 'ideal_P' ||
            context.column === 'ideal_K' || context.column === 'pH_min' ||
            context.column === 'pH_max') {
          return parseFloat(value);
        }
        return value;
      }
    });
    console.log(`✓ Loaded ${cropIdealNPKCache.length} crop ideal NPK records`);
    return cropIdealNPKCache;
  } catch (err) {
    console.error('Error loading crop_ideal_npk.csv:', err.message);
    return [];
  }
};

// Load on service startup
if (regionNPKCache.length === 0) loadRegionNPKCSV();
if (cropIdealNPKCache.length === 0) loadCropIdealNPKCSV();

// ============================================
// CORE SERVICE FUNCTIONS
// ============================================

/**
 * Find region soil NPK and pH data
 */
const findRegionNPK = (state, district, block) => {
  return regionNPKCache.find(
    (row) =>
      row.state.toLowerCase() === state.toLowerCase() &&
      row.district.toLowerCase() === district.toLowerCase() &&
      row.block.toLowerCase() === block.toLowerCase()
  );
};

/**
 * Find ideal crop nutrient requirements
 */
const findCropIdealNPK = (cropName) => {
  return cropIdealNPKCache.find(
    (row) => row.crop.toLowerCase() === cropName.toLowerCase()
  );
};

/**
 * Calculate nutrient deficiency (max(0, ideal - current))
 */
const calculateDeficiency = (ideal, current) => {
  return Math.max(0, ideal - current);
};

/**
 * Calculate fertilizer quantity needed to meet deficiency
 * Formula: qty_kg_per_ha = (deficiency / nutrient_percentage) * 100
 */
const calculateFertilizerQuantity = (deficiency, nutrientPercentage) => {
  if (deficiency <= 0 || nutrientPercentage <= 0) return 0;
  return (deficiency / nutrientPercentage) * 100;
};

/**
 * Convert kg/ha to kg/acre
 * 1 hectare = 2.471 acres
 */
const convertKgHaToKgAcre = (kg_ha) => {
  return kg_ha / 2.471;
};

/**
 * Calculate split dose application schedule
 * - Basal: 50% at planting
 * - Mid-growth: 25% at growth stage
 * - Flowering: 25% at flowering stage
 */
const calculateSplitDose = (totalKg) => {
  return {
    basal: totalKg * 0.5,
    mid_growth: totalKg * 0.25,
    flowering: totalKg * 0.25
  };
};

/**
 * Select and calculate fertilizer recommendations
 * Chooses best fertilizers to meet N, P, K deficiencies
 */
const calculateFertilizerRecommendations = (defN, defP, defK) => {
  const recommendations = [];
  const totalCost = { value: 0 };

  // Nitrogen requirement
  if (defN > 0) {
    const ureaQty_kg_ha = calculateFertilizerQuantity(defN, FERTILIZER_DB.urea.nitrogen);
    const ureaQty_kg_acre = convertKgHaToKgAcre(ureaQty_kg_ha);
    const ureaCost = ureaQty_kg_ha * FERTILIZER_DB.urea.cost_per_kg;
    
    recommendations.push({
      fertilizer: FERTILIZER_DB.urea.name,
      deficiency: defN,
      nutrient_percentage: FERTILIZER_DB.urea.nitrogen,
      quantity_kg_ha: parseFloat(ureaQty_kg_ha.toFixed(2)),
      quantity_kg_acre: parseFloat(ureaQty_kg_acre.toFixed(2)),
      cost_per_kg: FERTILIZER_DB.urea.cost_per_kg,
      total_cost: parseFloat(ureaCost.toFixed(2)),
      split_dose: {
        basal_kg_ha: parseFloat((ureaQty_kg_ha * 0.5).toFixed(2)),
        mid_growth_kg_ha: parseFloat((ureaQty_kg_ha * 0.25).toFixed(2)),
        flowering_kg_ha: parseFloat((ureaQty_kg_ha * 0.25).toFixed(2))
      },
      application_schedule: 'Split in 3 doses: 50% Basal, 25% Mid-growth, 25% Flowering',
      timing: 'Basal at planting, Mid-growth at tillering/branching, Flowering at reproductive stage'
    });
    
    totalCost.value += ureaCost;
  }

  // Phosphorus requirement
  if (defP > 0) {
    // Use DAP for combined N+P, else use SSP for P only
    const useDAP = defN > 0; // If we also need N, DAP is better
    const fert = useDAP ? FERTILIZER_DB.dap : FERTILIZER_DB.ssp;
    const pElemental = fert.phosphorus_p2o5 ? convertP2O5toP(fert.phosphorus) : fert.phosphorus;
    
    const fertQty_kg_ha = calculateFertilizerQuantity(defP, pElemental);
    const fertQty_kg_acre = convertKgHaToKgAcre(fertQty_kg_ha);
    const fertCost = fertQty_kg_ha * fert.cost_per_kg;
    
    recommendations.push({
      fertilizer: fert.name,
      deficiency: defP,
      nutrient_percentage: fert.phosphorus,
      nutrient_form: fert.phosphorus_p2o5 ? 'P2O5' : 'P',
      elemental_p_percentage: parseFloat(pElemental.toFixed(2)),
      quantity_kg_ha: parseFloat(fertQty_kg_ha.toFixed(2)),
      quantity_kg_acre: parseFloat(fertQty_kg_acre.toFixed(2)),
      cost_per_kg: fert.cost_per_kg,
      total_cost: parseFloat(fertCost.toFixed(2)),
      split_dose: {
        basal_kg_ha: parseFloat((fertQty_kg_ha * 0.5).toFixed(2)),
        mid_growth_kg_ha: parseFloat((fertQty_kg_ha * 0.25).toFixed(2)),
        flowering_kg_ha: parseFloat((fertQty_kg_ha * 0.25).toFixed(2))
      },
      application_schedule: 'Split in 3 doses: 50% Basal, 25% Mid-growth, 25% Flowering',
      timing: 'Basal at planting, Mid-growth at growth stage, Flowering at reproductive stage'
    });
    
    totalCost.value += fertCost;
  }

  // Potassium requirement
  if (defK > 0) {
    const mopQty_kg_ha = calculateFertilizerQuantity(defK, convertK2OtoK(FERTILIZER_DB.mop.potassium));
    const mopQty_kg_acre = convertKgHaToKgAcre(mopQty_kg_ha);
    const mopCost = mopQty_kg_ha * FERTILIZER_DB.mop.cost_per_kg;
    
    recommendations.push({
      fertilizer: FERTILIZER_DB.mop.name,
      deficiency: defK,
      nutrient_form: 'K2O',
      nutrient_percentage: FERTILIZER_DB.mop.potassium,
      elemental_k_percentage: parseFloat(convertK2OtoK(FERTILIZER_DB.mop.potassium).toFixed(2)),
      quantity_kg_ha: parseFloat(mopQty_kg_ha.toFixed(2)),
      quantity_kg_acre: parseFloat(mopQty_kg_acre.toFixed(2)),
      cost_per_kg: FERTILIZER_DB.mop.cost_per_kg,
      total_cost: parseFloat(mopCost.toFixed(2)),
      split_dose: {
        basal_kg_ha: parseFloat((mopQty_kg_ha * 0.5).toFixed(2)),
        mid_growth_kg_ha: parseFloat((mopQty_kg_ha * 0.25).toFixed(2)),
        flowering_kg_ha: parseFloat((mopQty_kg_ha * 0.25).toFixed(2))
      },
      application_schedule: 'Split in 3 doses: 50% Basal, 25% Mid-growth, 25% Flowering',
      timing: 'Critical at flowering and fruiting stages for quality'
    });
    
    totalCost.value += mopCost;
  }

  return { recommendations, totalCost: parseFloat(totalCost.value.toFixed(2)) };
};

/**
 * Main function: Generate fertilizer guide
 * Input: { state, district, block, crop }
 * Output: { success, data, message }
 */
const generateFertilizerGuide = async (state, district, block, cropName) => {
  try {
    // Validate inputs
    if (!state || !district || !block || !cropName) {
      return {
        success: false,
        message: 'Missing required fields: state, district, block, crop'
      };
    }

    // Find region soil data
    const regionData = findRegionNPK(state, district, block);
    if (!regionData) {
      return {
        success: false,
        message: `Region not found: ${state}, ${district}, ${block}`
      };
    }

    // Find crop ideal NPK requirements
    const cropData = findCropIdealNPK(cropName);
    if (!cropData) {
      return {
        success: false,
        message: `Crop not found: ${cropName}. Available crops in database.`
      };
    }

    // Calculate nutrient deficiency
    const defN = calculateDeficiency(cropData.ideal_N, regionData.avg_n);
    const defP = calculateDeficiency(cropData.ideal_P, regionData.avg_p);
    const defK = calculateDeficiency(cropData.ideal_K, regionData.avg_k);

    // Generate fertilizer recommendations
    const { recommendations, totalCost } = calculateFertilizerRecommendations(defN, defP, defK);

    // Check pH suitability
    const phSuitable = regionData.avg_ph >= cropData.pH_min && regionData.avg_ph <= cropData.pH_max;
    let phRecommendation = '';
    if (!phSuitable) {
      if (regionData.avg_ph < cropData.pH_min) {
        phRecommendation = `Soil is too acidic (pH ${regionData.avg_ph}). Consider adding lime to raise pH to ${cropData.pH_min}-${cropData.pH_max}.`;
      } else {
        phRecommendation = `Soil is too alkaline (pH ${regionData.avg_ph}). Consider adding sulfur to lower pH to ${cropData.pH_min}-${cropData.pH_max}.`;
      }
    } else {
      phRecommendation = `Soil pH (${regionData.avg_ph}) is suitable for ${cropName} (${cropData.pH_min}-${cropData.pH_max}).`;
    }

    // Format response
    return {
      success: true,
      data: {
        region_info: {
          state: regionData.state,
          district: regionData.district,
          block: regionData.block,
          soil_npk: {
            nitrogen: regionData.avg_n,
            phosphorus: regionData.avg_p,
            potassium: regionData.avg_k,
            unit: 'kg/ha'
          },
          soil_ph: regionData.avg_ph
        },
        crop_info: {
          crop_name: cropData.crop,
          ideal_npk: {
            nitrogen: cropData.ideal_N,
            phosphorus: cropData.ideal_P,
            potassium: cropData.ideal_K,
            unit: 'kg/ha'
          },
          suitable_ph_range: {
            min: cropData.pH_min,
            max: cropData.pH_max
          }
        },
        nutrient_deficiency: {
          nitrogen_deficiency: parseFloat(defN.toFixed(2)),
          phosphorus_deficiency: parseFloat(defP.toFixed(2)),
          potassium_deficiency: parseFloat(defK.toFixed(2)),
          unit: 'kg/ha'
        },
        fertilizer_recommendations: recommendations,
        cost_estimate: {
          total_cost_per_ha: totalCost,
          total_cost_per_acre: parseFloat((totalCost / 2.471).toFixed(2)),
          currency: 'INR'
        },
        ph_analysis: {
          ph_suitable: phSuitable,
          recommendation: phRecommendation
        },
        application_notes: {
          best_practice: 'Apply fertilizers after soil preparation and before planting. For split doses, apply at specific crop growth stages.',
          watering: 'Ensure adequate water availability during and after fertilizer application.',
          soil_testing: 'Conduct soil test every 2-3 years to update nutrient recommendations.',
          organic_matter: 'Consider adding organic matter (compost/manure) 2-4 weeks before planting to improve soil health.'
        }
      },
      message: 'Fertilizer guide generated successfully'
    };
  } catch (err) {
    return {
      success: false,
      message: `Error generating fertilizer guide: ${err.message}`
    };
  }
};

/**
 * Get available crops
 */
const getAvailableCrops = () => {
  return cropIdealNPKCache.map((row) => ({
    crop: row.crop,
    ideal_N: row.ideal_N,
    ideal_P: row.ideal_P,
    ideal_K: row.ideal_K,
    pH_min: row.pH_min,
    pH_max: row.pH_max
  }));
};

/**
 * Get available regions
 */
const getAvailableRegions = () => {
  return regionNPKCache.map((row) => ({
    state: row.state,
    district: row.district,
    block: row.block,
    avg_n: row.avg_n,
    avg_p: row.avg_p,
    avg_k: row.avg_k,
    avg_ph: row.avg_ph
  }));
};

module.exports = {
  generateFertilizerGuide,
  getAvailableCrops,
  getAvailableRegions,
  loadRegionNPKCSV,
  loadCropIdealNPKCSV
};
