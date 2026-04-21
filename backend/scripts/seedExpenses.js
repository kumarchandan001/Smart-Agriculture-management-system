/**
 * Seed Expenses Script
 * Populates the database with sample expense data for demonstration
 * 
 * Usage: node backend/scripts/seedExpenses.js
 * Note: Run this AFTER ensuring MongoDB is running and models are loaded
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Expense = require('../models/Expense');

// MongoDB connection string (adjust in .env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-agro';

/**
 * Load crop names from CSV file
 */
function loadCropData() {
  try {
    const csvPath = path.join(__dirname, '..', 'data', 'crop_500_dataset.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  CSV file not found at:', csvPath);
      // Return sample crops if file not available
      return ['rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'groundnut'];
    }

    const data = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(data, {
      columns: true,
      skip_empty_lines: true
    });

    const crops = new Set();
    records.forEach(record => {
      const crop = record.crop || record.Crop || record.CROP;
      if (crop) crops.add(crop.trim().toLowerCase());
    });

    return Array.from(crops).slice(0, 10); // Return first 10 unique crops
  } catch (error) {
    console.error('Error loading crops:', error.message);
    return ['rice', 'wheat', 'maize', 'sugarcane', 'cotton'];
  }
}

/**
 * Generate sample expenses
 */
function generateSampleExpenses(userId, crops) {
  const categories = ['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'];
  const expenses = [];
  const startDate = new Date(2024, 0, 1); // Jan 1, 2024

  // Generate 50 sample expenses
  for (let i = 0; i < 50; i++) {
    const randomCrop = crops[Math.floor(Math.random() * crops.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const daysOffset = Math.floor(Math.random() * 365);
    const expenseDate = new Date(startDate);
    expenseDate.setDate(expenseDate.getDate() + daysOffset);

    // Amount ranges by category
    const amountRanges = {
      seeds: [500, 3000],
      fertilizer: [800, 5000],
      pesticides: [400, 2000],
      labour: [1000, 8000],
      irrigation: [500, 3000],
      transport: [500, 2000],
      machinery: [2000, 15000],
      misc: [200, 1000]
    };

    const [min, max] = amountRanges[randomCategory];
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    expenses.push({
      userId,
      crop: randomCrop,
      category: randomCategory,
      amount,
      currency: 'INR',
      date: expenseDate,
      notes: `Sample expense for ${randomCrop} - ${randomCategory}`,
      quantity: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : null,
      unit: randomCategory === 'labour' ? 'day' : 'kg',
      supplier: ['Local Market', 'Agriculture Store', 'Online Supplier', 'Cooperative'][
        Math.floor(Math.random() * 4)
      ]
    });
  }

  return expenses;
}

/**
 * Main seed function
 */
async function seedExpenses() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');

    // Check if expenses already exist
    const existingCount = await Expense.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} expenses. Clear them first if you want to reseed.`);
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('Run with --force flag to clear and reseed: node seedExpenses.js --force');
        process.exit(0);
      }
      await Expense.deleteMany({});
      console.log('🗑️  Cleared existing expenses');
    }

    // Load crops from CSV
    const crops = loadCropData();
    console.log(`📊 Loaded ${crops.length} crops from data file`);

    // Create a test user ID (or use existing one)
    // In production, you'd use a real user's ObjectId
    const testUserId = new mongoose.Types.ObjectId();
    console.log(`👤 Using test user ID: ${testUserId}`);

    // Generate sample expenses
    const sampleExpenses = generateSampleExpenses(testUserId, crops);
    console.log(`💰 Generated ${sampleExpenses.length} sample expenses`);

    // Insert into database
    const result = await Expense.insertMany(sampleExpenses);
    console.log(`✅ Inserted ${result.length} expenses successfully`);

    // Print summary statistics
    console.log('\n📈 Summary Statistics:');
    const totalAmount = sampleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    const byCrop = {};

    sampleExpenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
      byCrop[exp.crop] = (byCrop[exp.crop] || 0) + exp.amount;
    });

    console.log(`  Total Expenses: ₹${totalAmount.toLocaleString('en-IN')}`);
    console.log(`  Average Expense: ₹${(totalAmount / sampleExpenses.length).toFixed(2)}`);
    console.log('\n  By Category:');
    Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, amt]) => {
        console.log(`    ${cat}: ₹${amt.toLocaleString('en-IN')}`);
      });

    console.log('\n  By Crop:');
    Object.entries(byCrop)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([crop, amt]) => {
        console.log(`    ${crop}: ₹${amt.toLocaleString('en-IN')}`);
      });

    console.log(`\n✨ Seed data loaded successfully!`);
    console.log(`📝 User ID for testing: ${testUserId}`);
    console.log(`   Use this ID in your frontend tests or API calls`);

  } catch (error) {
    console.error('❌ Error seeding expenses:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedExpenses();
}

module.exports = seedExpenses;
