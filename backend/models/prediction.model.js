// backend/models/prediction.model.js
const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  crop: String,
  input_values: Object,
  predicted_yield: Number,
  model_version: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
