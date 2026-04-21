// backend/models/user.model.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
