// backend/models/field.model.js
const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farm_name: String,
  field_name: String,
  soil_type: String,
  ph: String,
  area_ha: Number,
  location: {
    lat: Number,
    lon: Number
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Field', FieldSchema);
