// smart agriculture/backend/services/cropRecommend.service.js
// Simple hybrid recommendation using dataset (CSV/DB)
// It looks for matching soil/season and scores crops by NPK compatibility.

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
// Optionally you can read from DB (Crop model) instead

const CROP_METADATA = {
  cotton: { soil: 'Black / Clayey Loam', season: 'Kharif', price: 7120 },
  maize: { soil: 'Well-drained Loam', season: 'Kharif / Rabi', price: 2225 },
  sugarcane: { soil: 'Deep Loam / Alluvial', season: 'Annual', price: 340 },
  soybean: { soil: 'Fertile Loam', season: 'Kharif', price: 4892 },
  rice: { soil: 'Clayey / Alluvial', season: 'Kharif', price: 2300 },
  paddy: { soil: 'Clayey / Alluvial', season: 'Kharif', price: 2300 },
  wheat: { soil: 'Well-drained Loam', season: 'Rabi', price: 2425 },
  tomato: { soil: 'Sandy Loam / Red Soil', season: 'Kharif / Rabi', price: 2100 },
  potato: { soil: 'Sandy Loam', season: 'Rabi', price: 1500 },
  onion: { soil: 'Sandy Loam / Clay Loam', season: 'Kharif / Rabi', price: 2400 },
  groundnut: { soil: 'Sandy Loam', season: 'Kharif', price: 6780 },
  mustard: { soil: 'Loamy to Heavy Clay', season: 'Rabi', price: 5950 },
  chana: { soil: 'Deep Clay / Loam', season: 'Rabi', price: 5650 },
  chickpea: { soil: 'Deep Clay / Loam', season: 'Rabi', price: 5650 },
  barley: { soil: 'Sandy Loam', season: 'Rabi', price: 1850 },
  bajra: { soil: 'Sandy Loam / Black Soil', season: 'Kharif', price: 2500 }
};

let cropData = []; // will be loaded from csv or DB

function loadCropCSV() {
  try {
    // default path (if dataset exists in backend/data)
    const p = path.join(__dirname, '..', 'data', 'crop_500_dataset.csv');
    if (!fs.existsSync(p)) {
      console.warn('crop_500_dataset.csv not found at', p);
      cropData = [];
      return;
    }
    const raw = fs.readFileSync(p, 'utf8');
    const rows = parse(raw, { columns: true, skip_empty_lines: true });
    // Normalize expected columns; adjust field names based on your CSV
    cropData = rows.map(r => {
      // prefer known headers from this dataset
      const cropName = (r.crop || r.Crop || r.crop_name || r.CropName || '').toString();
      const idealN = Number(r.ideal_n || r.idealN || r.N || r.n || 0);
      const idealP = Number(r.ideal_p || r.idealP || r.P || r.p || 0);
      const idealK = Number(r.ideal_k || r.idealK || r.K || r.k || 0);
      // parse ideal_ph like "5.7-6.6"
      let phMin = 0, phMax = 14;
      const phRaw = (r.ideal_ph || r.idealPh || r.ph || '').toString();
      if (phRaw && phRaw.includes('-')) {
        const parts = phRaw.split('-').map(s => parseFloat(s)).filter(n => !isNaN(n));
        if (parts.length === 2) { phMin = parts[0]; phMax = parts[1]; }
      } else if (phRaw) {
        const v = parseFloat(phRaw);
        if (!isNaN(v)) { phMin = v; phMax = v; }
      }

      const expectedYield = Number(r.expected_yield_ton_per_hectare || r.expected_yield || r.yield || 0);
      const fertSug = (r.fertilizer_suggestion || r.fertilizer || r.fertilizer_suggestion || '').toString();

      const key = cropName.toLowerCase().trim();
      const meta = CROP_METADATA[key] || { soil: 'Alluvial Loam', season: 'Kharif / Rabi', price: 2200 };

      return {
        crop_name: cropName,
        soil: (r.soil_type || r.soil || r.Soil || meta.soil).toString(),
        season: (r.season || r.Season || meta.season).toString(),
        water_need: (r.water_need || r.water || r.Water || 'medium').toString().toLowerCase(),
        n_req: idealN,
        p_req: idealP,
        k_req: idealK,
        ph_min: phMin,
        ph_max: phMax,
        yield_expected_t_ha: expectedYield,
        fertilizer_suggestion: fertSug,
        price_per_quintal: Number(r.price || r.price_per_quintal || meta.price)
      };
    });
    console.log('Loaded crop dataset rows:', cropData.length);
  } catch (err) {
    console.warn('Failed to load crop dataset:', err.message);
    cropData = [];
  }
}

// Simple scoring function
function scoreCrop(crop, input) {
  let score = 50; // Start with base score for all crops

  // soil + season matches (if provided)
  if (input.soil_type && crop.soil) {
    const soilLower = crop.soil.toLowerCase();
    const inputSoilLower = (input.soil_type || '').toLowerCase();
    if (soilLower.includes(inputSoilLower) || inputSoilLower.includes(soilLower)) score += 15;
  }
  
  if (input.season && crop.season) {
    const seasonLower = crop.season.toLowerCase();
    const inputSeasonLower = (input.season || '').toLowerCase();
    if (seasonLower.includes(inputSeasonLower) || inputSeasonLower.includes(seasonLower)) score += 10;
  }

  // NPK compatibility: give + if input >= req, else - penalty proportional
  if (typeof input.n === 'number' && !isNaN(input.n)) {
    if (input.n >= crop.n_req) score += 8;
    else if (crop.n_req > 0) score -= Math.min(5, (crop.n_req - input.n) / crop.n_req * 5);
  }
  
  if (typeof input.p === 'number' && !isNaN(input.p)) {
    if (input.p >= crop.p_req) score += 5;
    else if (crop.p_req > 0) score -= Math.min(3, (crop.p_req - input.p) / crop.p_req * 3);
  }
  
  if (typeof input.k === 'number' && !isNaN(input.k)) {
    if (input.k >= crop.k_req) score += 8;
    else if (crop.k_req > 0) score -= Math.min(5, (crop.k_req - input.k) / crop.k_req * 5);
  }

  // ph compatibility
  if (typeof input.ph === 'number' && !isNaN(input.ph)) {
    const cropPhMin = crop.ph_min || 0;
    const cropPhMax = crop.ph_max || 14;
    if (input.ph >= cropPhMin && input.ph <= cropPhMax) score += 6;
    else if (input.ph > 0) score -= 3;
  }

  // water availability: if farmer says low and crop needs high -> penalty
  if (input.water) {
    const w = input.water.toLowerCase();
    const cropW = (crop.water_need || '').toLowerCase();
    if (w === 'low' && cropW === 'high') score -= 8;
    if (w === 'high' && cropW === 'low') score -= 2;
    if (w === 'medium' || w === 'medium') score += 2;
  }

  return Math.max(0, score);
}

async function recommend(input) {
  if (!cropData || cropData.length === 0) loadCropCSV();

  // fallback: if no cropData, return empty
  if (!cropData || cropData.length === 0) return [];

  // score all crops
  const scored = cropData.map(c => {
    const s = scoreCrop(c, input);
    return { ...c, score: Math.round(s * 100) / 100 };
  });

  // sort by score desc
  scored.sort((a, b) => b.score - a.score);

  // prepare top recommendations
  const top = scored.slice(0, 6).map(c => {
    const key = (c.crop_name || '').toLowerCase().trim();
    const meta = CROP_METADATA[key] || { soil: 'Alluvial Loam', season: 'Kharif / Rabi', price: 2200 };
    return {
      crop_name: c.crop_name || 'Unknown',
      soil: c.soil && c.soil !== '-' ? c.soil : meta.soil,
      season: c.season && c.season !== '-' ? c.season : meta.season,
      score: c.score,
      expected_yield: (c.yield_expected_t_ha !== undefined && c.yield_expected_t_ha !== null && c.yield_expected_t_ha !== 0) ? `${c.yield_expected_t_ha} t/ha` : 'N/A',
      n_req: c.n_req || '-', p_req: c.p_req || '-', k_req: c.k_req || '-',
      ph_range: `${(c.ph_min !== undefined ? c.ph_min : '-') } - ${(c.ph_max !== undefined ? c.ph_max : '-')}`,
      price_per_quintal: (c.price_per_quintal && c.price_per_quintal > 0 && c.price_per_quintal !== '-') ? c.price_per_quintal : meta.price
    };
  });

  return top;
}

module.exports = { loadCropCSV, recommend };
