// smart agriculture/backend/controllers/ocr.controller.js
const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

async function uploadAndParse(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'file required' });

    const worker = createWorker({
      // logger: m => console.log(m) // uncomment for debugging
    });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(file.path);
    await worker.terminate();

    // crude parsing: look for patterns like N: 80 or Nitrogen 80
    const findNumber = (regexes) => {
      for (const r of regexes) {
        const m = r.exec(text);
        if (m && m[1]) return Number(m[1]);
      }
      return null;
    };
    const nVal = findNumber([/N[:\s]*([0-9]{1,4})/i, /Nitrogen[:\s]*([0-9]{1,4})/i]);
    const pVal = findNumber([/P[:\s]*([0-9]{1,4})/i, /Phosphorus[:\s]*([0-9]{1,4})/i]);
    const kVal = findNumber([/K[:\s]*([0-9]{1,4})/i, /Potassium[:\s]*([0-9]{1,4})/i]);
    const phVal = (function(){
      const m = /pH[:\s]*([0-9]+(?:\.[0-9]+)?)/i.exec(text);
      return m ? Number(m[1]) : null;
    })();

    // remove uploaded file
    try { fs.unlinkSync(file.path); } catch(e){/*ignore*/}

    return res.json({
      success: true,
      parsed: { n: nVal, p: pVal, k: kVal, ph: phVal, raw_text: text.slice(0, 2000) }
    });
  } catch (err) {
    console.error('OCR error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { uploadAndParse };
