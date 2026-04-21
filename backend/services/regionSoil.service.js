// smart agriculture/backend/services/regionSoil.service.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

let regionRows = [];

function loadRegionCSV() {
  try {
    const p = path.join(__dirname, '..', 'data', 'region_npk.csv');
    if (!fs.existsSync(p)) {
      console.warn('region_npk.csv not found at', p);
      regionRows = [];
      return;
    }
    const raw = fs.readFileSync(p, 'utf8');
    regionRows = parse(raw, { columns: true, skip_empty_lines: true })
      .map(r => ({
        state: (r.state || '').trim().toLowerCase(),
        district: (r.district || '').trim().toLowerCase(),
        block: (r.block || '').trim().toLowerCase(),
        avg_n: Number(r.avg_n || 0),
        avg_p: Number(r.avg_p || 0),
        avg_k: Number(r.avg_k || 0),
        avg_ph: Number(r.avg_ph || 0),
        notes: (r.notes || '').trim()
      }));
    console.log(`Loaded ${regionRows.length} rows from region_npk.csv`);
  } catch (err) {
    console.warn('Failed to load region_npk.csv:', err.message);
    regionRows = [];
  }
}

function findRegion({ state, district, block }) {
  if (!state) return null;
  state = (state || '').trim().toLowerCase();
  district = (district || '').trim().toLowerCase();
  block = (block || '').trim().toLowerCase();

  let r = regionRows.find(x => x.state === state && x.district === district && x.block === block);
  if (!r) r = regionRows.find(x => x.state === state && x.district === district);
  if (!r) r = regionRows.find(x => x.state === state);
  return r || null;
}

module.exports = { loadRegionCSV, findRegion };
