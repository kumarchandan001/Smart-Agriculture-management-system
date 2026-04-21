// smart agriculture/backend/models/crop.model.js
const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  crop_name: { type: String, required: true },
  soil: { type: String },              // e.g., loam, sandy, clay
  season: { type: String },            // kharif, rabi, zaid
  water_need: { type: String },        // low, medium, high
  n_req: { type: Number, default: 0 },
  p_req: { type: Number, default: 0 },
  k_req: { type: Number, default: 0 },
  ph_min: { type: Number, default: 5.0 },
  ph_max: { type: Number, default: 8.5 },
  yield_min: { type: Number, default: 0 },
  yield_max: { type: Number, default: 0 },
  price_per_quintal: { type: Number, default: 0 }
});

module.exports = mongoose.model('Crop', CropSchema);
