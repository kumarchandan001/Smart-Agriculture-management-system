/**
 * Seed Sample Pest Records
 * Creates example pest records for demonstration
 */

const mongoose = require('mongoose');
const PestRecord = require('../models/PestRecord');

const sampleRecords = [
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    crop: 'tomato',
    fieldName: 'Field A',
    fieldArea: 0.5,
    pestName: 'Early Blight',
    symptoms: ['brown spots', 'concentric rings', 'yellowing leaves'],
    detectionMethod: 'symptoms',
    severity: 'high',
    affectedArea: 25,
    dateObserved: new Date('2025-01-15'),
    cost: {
      treatment: 300,
      labor: 200,
      equipment: 50,
      total: 550,
    },
    notes: 'Started spraying Mancozeb after detection',
    resolved: false,
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    crop: 'cotton',
    fieldName: 'Field B',
    fieldArea: 1.2,
    pestName: 'Spotted Bollworm',
    symptoms: ['holes in bolls', 'larva feeding', 'fruit damage'],
    detectionMethod: 'manual',
    severity: 'critical',
    affectedArea: 40,
    dateObserved: new Date('2025-01-10'),
    dateTreated: new Date('2025-01-11'),
    treatmentApplied: {
      treatmentId: 'cyp-001',
      date: new Date('2025-01-11'),
      dose: '1 ml/L',
      method: 'Spray',
      effectiveness: 'good',
      effectivenessNotes: 'Larval population reduced by 60%',
    },
    cost: {
      treatment: 400,
      labor: 300,
      equipment: 0,
      total: 700,
    },
    resolved: true,
    dateResolved: new Date('2025-01-25'),
  },
  {
    userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    crop: 'mango',
    fieldName: 'Field C',
    fieldArea: 2.0,
    pestName: 'Fruit Fly',
    symptoms: ['small holes in fruit', 'fermented smell', 'maggots visible'],
    detectionMethod: 'manual',
    severity: 'high',
    affectedArea: 15,
    dateObserved: new Date('2025-01-08'),
    cost: {
      treatment: 250,
      labor: 150,
      equipment: 100,
      total: 500,
    },
    notes: 'Set up fruit fly traps, ongoing monitoring',
  },
];

async function seedPestRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agro');

    console.log('Connected to MongoDB');

    // Clear existing records
    await PestRecord.deleteMany({});
    console.log('Cleared existing pest records');

    // Insert sample records
    const result = await PestRecord.insertMany(sampleRecords);
    console.log(`✓ Created ${result.length} sample pest records`);

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding pest records:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedPestRecords();
}

module.exports = seedPestRecords;
