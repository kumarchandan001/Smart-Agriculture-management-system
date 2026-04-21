/**
 * Test script to verify pest detection without starting full server
 * Usage: node testDetection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const pestService = require('./services/pest.service');

async function testDetection() {
  try {
    console.log('🔍 Starting Pest Detection Tests...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agro');
    console.log('✓ Connected to MongoDB\n');

    // Initialize pest service
    await pestService.initialize();
    console.log(`✓ Pest service initialized\n`);

    // Test Cases
    const testCases = [
      { crop: 'tomato', symptoms: ['brown spots', 'yellowing leaves'], expected: 'Early Blight' },
      { crop: 'cucumber', symptoms: ['white powder', 'fungal coating'], expected: 'Powdery Mildew' },
      { crop: 'cotton', symptoms: ['holes in leaves', 'feeding damage'], expected: 'Spotted Bollworm' },
      { crop: 'mango', symptoms: ['fermented smell', 'rot'], expected: 'Fruit Fly' },
      { crop: 'rice', symptoms: ['wilting', 'discoloration'], expected: 'Leaf Rust or Stem Borer' },
      { crop: 'potato', symptoms: ['brown spots', 'leaf curl'], expected: 'Early Blight' },
    ];

    for (const test of testCases) {
      console.log(`\n📋 Test: ${test.crop.toUpperCase()}`);
      console.log(`   Symptoms: ${test.symptoms.join(', ')}`);
      console.log(`   Expected: ${test.expected}`);

      const result = await pestService.detectFromSymptoms(test.symptoms, test.crop);

      if (result.success) {
        console.log(`   ✅ Result: ${result.topMatch.name}`);
        console.log(`   Confidence: ${result.topMatch.confidence}%`);
        console.log(`   Alternatives: ${result.probablePests.slice(1).map(p => p.name).join(', ') || 'None'}`);
      } else {
        console.log(`   ❌ Result: ${result.error}`);
      }
    }

    console.log('\n✓ All tests completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDetection();
