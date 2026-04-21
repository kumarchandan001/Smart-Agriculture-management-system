const axios = require('axios');

/**
 * Market service - proxies requests to an external market API using
 * the `MARKET_API_KEY` from environment variables.
 *
 * Behavior:
 * - Expects `process.env.MARKET_API_URL` to be provided. The URL may contain
 *   placeholders `{KEY}` and `{CROP}` which will be replaced. If placeholders
 *   are not present the service will append `key` and `crop` query params.
 */
async function getPrices(crops = []) {
  const key = process.env.MARKET_API_KEY;
  const baseUrl = process.env.MARKET_API_URL;

  if (!key) throw new Error('MARKET_API_KEY not configured in environment');
  if (!baseUrl) throw new Error('MARKET_API_URL not configured in environment');

  if (!Array.isArray(crops) || crops.length === 0) {
    crops = ['Wheat', 'Maize', 'Paddy'];
  }

  const results = [];

  for (const crop of crops) {
    let url = baseUrl.replace('{KEY}', encodeURIComponent(key)).replace('{CROP}', encodeURIComponent(crop));

    // If template placeholders were not present, append query params
    if (url === baseUrl) {
      const sep = baseUrl.includes('?') ? '&' : '?';
      url = `${baseUrl}${sep}key=${encodeURIComponent(key)}&crop=${encodeURIComponent(crop)}`;
    }

    try {
      const resp = await axios.get(url, { timeout: 10000 });
      const data = resp.data;

      // Provider-specific parsing for data.gov.in responses
      if (String(baseUrl).includes('data.gov.in') || String(url).includes('data.gov.in')) {
        // data.gov.in returns an envelope with `records` inside `raw`/`data`.
        // We pick the first record and extract modal_price/min_price/max_price if available.
        const records = data.records || data.data || data.response || [];
        const rec = Array.isArray(records) && records.length ? records[0] : null;
        if (rec) {
          const modal = rec.modal_price || rec.Modal_x0020_Price || rec.Modal_Price || rec.modal || null;
          const min = rec.min_price || rec.Min_x0020_Price || rec.min || null;
          const max = rec.max_price || rec.Max_x0020_Price || rec.max || null;
          const priceVal = modal || min || max || null;
          // Normalize numeric strings to numbers when possible
          const price = priceVal != null && !Number.isNaN(Number(priceVal)) ? Number(priceVal) : priceVal;
          const unit = rec.unit || rec.uom || null;
          results.push({ crop, price, unit, change: null, raw: rec });
          continue;
        }
      }

      // Generic heuristics fallback: Try to extract price information with some common keys.
      let price = null;
      let unit = null;
      let change = null;

      if (data.price) price = data.price;
      else if (data.latest && data.latest.price) price = data.latest.price;
      else if (data.data && data.data.price) price = data.data.price;
      else if (data.prices && Array.isArray(data.prices) && data.prices[0]) price = data.prices[0].price;

      // unit and change heuristics
      if (data.unit) unit = data.unit;
      else if (data.prices && data.prices[0] && data.prices[0].unit) unit = data.prices[0].unit;

      if (data.change) change = data.change;
      else if (data.prices && data.prices[0] && data.prices[0].change) change = data.prices[0].change;

      results.push({ crop, price, unit, change, raw: data });
    } catch (err) {
      results.push({ crop, error: err.message });
    }
  }

  return results;
}

// Fetch available crops/commodities from the provider (data.gov.in)
async function getAvailableCrops() {
  const key = process.env.MARKET_API_KEY;
  const baseUrl = process.env.MARKET_API_URL;

  if (!key) throw new Error('MARKET_API_KEY not configured in environment');
  if (!baseUrl) throw new Error('MARKET_API_URL not configured in environment');

  // Build a listing URL by removing commodity filter if present and forcing JSON + limit
  let url = baseUrl.replace('{KEY}', encodeURIComponent(key)).replace('{CROP}', '');

  // Remove filters[commodity]=... if present
  url = url.replace(/(&?filters\[commodity\]=[^&]*)/g, '');

  // Normalize format=json
  if (/format=/.test(url)) {
    url = url.replace(/format=[^&]*/,'format=json');
  } else {
    url += (url.includes('?') ? '&' : '?') + 'format=json';
  }

  // Ensure a reasonable limit
  if (/limit=/.test(url)) {
    url = url.replace(/limit=[^&]*/, 'limit=1000');
  } else {
    url += '&limit=1000';
  }

  try {
    const resp = await axios.get(url, { timeout: 15000 });
    const data = resp.data;
    const records = data.records || data.data || [];
    const set = new Set();
    for (const rec of records) {
      const c = rec.commodity || rec.Commodity || rec.commodity_name || rec.Commodity_name || null;
      if (c) set.add(String(c).trim());
    }
    const list = Array.from(set).sort((a,b)=> a.localeCompare(b));
    return list;
  } catch (err) {
    throw new Error('Failed to fetch crop list: ' + err.message);
  }
}

module.exports = {
  getPrices,
  getAvailableCrops,
};
