// smart agriculture/backend/services/estimator.service.js
/**
 * Simple rule-based estimator from basic farmer answers.
 * Inputs (example): { soil_color, texture, organic, irrigation, last_crop }
 */
function estimateFromQuestions({ soil_color, texture, organic, irrigation }) {
  // baseline
  let n = 60, p = 25, k = 60, ph = 6.5, confidence = 0.45;

  // texture adjustments
  if (texture === 'sandy') { n -= 12; k -= 8; ph = 6.0; confidence += 0.08; }
  if (texture === 'clay')  { n += 10; p += 6; ph = 6.8; confidence += 0.08; }
  if (texture === 'loam')  { confidence += 0.12; }

  // organic matter
  if (organic === 'high') { n += 12; confidence += 0.08; }
  if (organic === 'low')  { n -= 10; confidence -= 0.05; }

  // irrigation
  if (irrigation === 'low')  { n -= 6; confidence -= 0.03; }
  if (irrigation === 'high') { n += 6; confidence += 0.03; }

  // soil color hints (optional)
  if (soil_color === 'black') { n += 6; confidence += 0.03; }
  if (soil_color === 'red')   { p += 4; confidence += 0.02; }

  const clamp = v => Math.round(Math.max(0, Math.min(500, v)));
  return {
    n: clamp(n),
    p: clamp(p),
    k: clamp(k),
    ph: Math.round(ph * 10) / 10,
    confidence: Math.min(0.99, confidence),
    source: 'estimate'
  };
}

module.exports = { estimateFromQuestions };
