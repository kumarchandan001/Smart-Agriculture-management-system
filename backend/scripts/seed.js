/**
 * seed.js
 * Run with:  node seed.js
 * Make sure .env contains MONGO_URI
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// MODELS
const User = require("./models/user.model");
const Crop = require("./models/crop.model");
const Field = require("./models/field.model");
const Prediction = require("./models/prediction.model");

// CSV parser
const papa = require("papaparse");

// ------------------------------
// Connect to MongoDB
// ------------------------------
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

// ------------------------------
// Load CSV function
// ------------------------------
function loadCSV(filePath) {
  try {
    const file = fs.readFileSync(filePath, "utf8");
    const parsed = papa.parse(file, { header: true });
    return parsed.data;
  } catch (err) {
    console.error("⚠ CSV load error:", err.message);
    return null;
  }
}

// ------------------------------
// Seed Script
// ------------------------------
async function seed() {
  await connectDB();

  console.log("🧹 Clearing old collections...");
  await User.deleteMany({});
  await Crop.deleteMany({});
  await Field.deleteMany({});
  await Prediction.deleteMany({});

  // ------------------------------
  // Create Admin User
  // ------------------------------
  console.log("👤 Creating admin user...");
  const admin = new User({
    name: "Admin User",
    email: "admin@example.com",
    password_hash: bcrypt.hashSync("admin123", 10),
    role: "admin"
  });
  await admin.save();

  // ------------------------------
  // Create Farmer User
  // ------------------------------
  console.log("👤 Creating farmer user...");
  const farmer = new User({
    name: "Farmer User",
    email: "farmer@example.com",
    password_hash: bcrypt.hashSync("farmer123", 10),
    role: "farmer"
  });
  await farmer.save();

  // ------------------------------
  // Insert CROPS data
  // ------------------------------
  console.log("🌾 Importing crop dataset...");

  const datasetPath = path.join(__dirname, "data", "crop_enhanced_ml_dataset.csv");

  let rows = loadCSV(datasetPath);

  if (!rows || rows.length === 0) {
    console.log("⚠ CSV missing → inserting fallback sample crops...");

    rows = [
      {
        crop: "rice",
        ideal_n: 80,
        ideal_p: 40,
        ideal_k: 40,
        ideal_ph: "5.5-6.5",
        temp_c: 30,
        rainfall_mm: 200,
        humidity: 70,
        soil_type: "loam",
        season: "kharif",
        notes: "Fallback seed record",
        expected_yield_ton_per_hectare: 6.0
      },
      {
        crop: "wheat",
        ideal_n: 60,
        ideal_p: 30,
        ideal_k: 20,
        ideal_ph: "6.0-7.0",
        temp_c: 22,
        rainfall_mm: 120,
        humidity: 50,
        soil_type: "sandy",
        season: "rabi",
        notes: "Fallback seed record",
        expected_yield_ton_per_hectare: 3.5
      }
    ];
  }

  await Crop.insertMany(rows);
  console.log(`🌱 Inserted ${rows.length} crops`);

  // ------------------------------
  // Insert a sample FIELD
  // ------------------------------
  console.log("🌍 Creating sample field...");
  const field = new Field({
    user_id: farmer._id,
    farm_name: "Green Farm",
    field_name: "Plot 1",
    soil_type: "loam",
    ph: "6.2",
    area_ha: 2.5,
    location: { lat: 12.97, lon: 77.59 }
  });
  await field.save();

  // ------------------------------
  // Sample Prediction
  // ------------------------------
  console.log("📈 Creating a sample prediction...");
  const pred = new Prediction({
    user_id: farmer._id,
    crop: "rice",
    input_values: {
      ideal_n: 80,
      ideal_p: 40,
      ideal_k: 40
    },
    predicted_yield: 5.8,
    model_version: "sample_v1"
  });
  await pred.save();

  // Finish
  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

// Run the function
seed();
