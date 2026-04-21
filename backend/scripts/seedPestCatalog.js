/**
 * Seed Pest Catalog
 * Populates database with common pests and diseases
 */

const mongoose = require('mongoose');
const PestCatalog = require('../models/PestCatalog');

const pests = [
  {
    name: 'Early Blight',
    type: 'disease',
    severity: 'high',
    cropList: ['tomato', 'potato'],
    symptomKeywords: ['brown', 'spot', 'leaf', 'yellow', 'lesion', 'ring', 'brown spots', 'yellowing leaves', 'yellowing', 'discoloration', 'dark'],
    description: 'Fungal disease causing dark brown spots with concentric rings on leaves',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Mancozeb',
        activeIngredient: 'Mancozeb 75%',
        dosage: 6,
        unit: 'g/L',
        applicationMethod: 'Spray',
        frequency: 'Every 10-14 days',
        interval: 14,
        maxApplications: 3,
        notes: 'Start spraying when disease first appears',
        precautions: 'Do not mix with oils or sulfur',
        ppe: ['gloves', 'mask', 'apron'],
        phi: 5,
        cost: 150,
      },
      {
        type: 'chemical',
        name: 'Chlorothalonil',
        activeIngredient: 'Chlorothalonil 75%',
        dosage: 8,
        unit: 'g/L',
        applicationMethod: 'Spray',
        frequency: 'Every 7-10 days',
        interval: 10,
        maxApplications: 4,
        notes: 'Effective preventive and curative fungicide',
        ppe: ['gloves', 'mask'],
        phi: 7,
        cost: 200,
      },
      {
        type: 'biological',
        name: 'Bacillus subtilis',
        activeIngredient: 'Bacillus subtilis strain',
        dosage: 10,
        unit: 'ml/L',
        frequency: 'Every 7 days',
        notes: 'Organic alternative, apply in evening',
      },
      {
        type: 'cultural',
        name: 'Crop rotation',
        notes: 'Avoid planting tomato/potato in same field for 2 years',
      },
    ],
    preventiveMeasures: [
      {
        measure: 'Remove infected leaves',
        description: 'Remove lower infected leaves to reduce spore production',
        timing: 'As soon as symptoms appear',
      },
      {
        measure: 'Improve air circulation',
        description: 'Prune lower branches to increase air flow',
        timing: 'Weekly',
      },
      {
        measure: 'Avoid overhead watering',
        description: 'Use drip irrigation to keep leaves dry',
        timing: 'Every watering',
      },
      {
        measure: 'Mulching',
        description: 'Mulch around plants to prevent soil splash',
        timing: 'Planting time',
      },
    ],
    lifecycle: {
      duration: '2-3 weeks',
      activeSeason: ['June', 'July', 'August', 'September'],
      optimumTemperature: '18-25°C',
      optimumHumidity: '85-95%',
    },
    isActive: true,
  },

  {
    name: 'Powdery Mildew',
    type: 'disease',
    severity: 'medium',
    cropList: ['cucumber', 'squash', 'grape', 'apple'],
    symptomKeywords: ['white', 'powder', 'coating', 'fungal', 'mildew', 'white powder', 'white coating', 'fungal coating'],
    description: 'White powder-like fungal coating on leaves and stems',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Sulfur Dust',
        activeIngredient: 'Sulfur 80%',
        dosage: 20,
        unit: 'g/L',
        applicationMethod: 'Dust or Spray',
        frequency: 'Every 7-10 days',
        interval: 10,
        notes: 'Do not use when temperature >32°C',
        ppe: ['gloves', 'mask'],
        phi: 1,
        cost: 100,
      },
      {
        type: 'chemical',
        name: 'Karathane',
        activeIngredient: 'Dinocap',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Every 14 days',
        interval: 14,
        notes: 'Also controls mites',
        phi: 7,
        cost: 250,
      },
      {
        type: 'biological',
        name: 'Neem Oil',
        activeIngredient: 'Neem oil 3%',
        dosage: 30,
        unit: 'ml/L',
        frequency: 'Every 7 days',
        notes: 'Apply in evening, organic option',
      },
    ],
    preventiveMeasures: [
      {
        measure: 'Adequate spacing',
        description: 'Space plants to ensure good air circulation',
      },
      {
        measure: 'Avoid overhead watering',
        description: 'Use drip irrigation',
      },
    ],
    isActive: true,
  },

  {
    name: 'Spotted Bollworm',
    type: 'insect',
    severity: 'high',
    cropList: ['cotton', 'tomato', 'okra'],
    symptomKeywords: ['hole', 'holes', 'feeding', 'damage', 'worm', 'larva', 'boll', 'larvae', 'feeding damage', 'holes in leaves'],
    description: 'Moth larva that damages fruit, leaves, and bolls',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Cypermethrin',
        activeIngredient: 'Cypermethrin 10%',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Every 10 days',
        interval: 10,
        maxApplications: 5,
        notes: 'Effective against young larvae',
        phi: 7,
        cost: 180,
      },
      {
        type: 'chemical',
        name: 'Spinosad',
        activeIngredient: 'Spinosad 45%',
        dosage: 0.5,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
        notes: 'Organic insecticide, safe for beneficial insects',
        phi: 1,
        cost: 350,
      },
      {
        type: 'biological',
        name: 'Pheromone Trap',
        notes: 'Use pheromone traps for monitoring and mass trapping',
      },
    ],
    preventiveMeasures: [
      {
        measure: 'Remove affected parts',
        description: 'Remove infested bolls and damaged fruits',
      },
      {
        measure: 'Monitor traps',
        description: 'Check pheromone traps weekly',
      },
    ],
    isActive: true,
  },

  {
    name: 'Leaf Rust',
    type: 'disease',
    severity: 'medium',
    cropList: ['wheat', 'barley', 'rice'],
    symptomKeywords: ['rust', 'pustule', 'pustules', 'orange', 'reddish', 'spore', 'discoloration', 'lesion'],
    description: 'Fungal disease causing rust-colored pustules on leaves',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Propiconazole',
        activeIngredient: 'Propiconazole 25%',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Every 14 days',
        interval: 14,
        notes: 'Excellent preventive fungicide',
        phi: 14,
        cost: 280,
      }
    ],
    isActive: true,
  },

  {
    name: 'Fruit Fly',
    type: 'insect',
    severity: 'critical',
    cropList: ['mango', 'guava', 'citrus', 'melon'],
    symptomKeywords: ['maggot', 'small hole', 'hole', 'rotting', 'rot', 'fermented', 'fruit damage', 'feeding damage', 'fermented smell'],
    description: 'Small fly that lays eggs in fruit, causing rot',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Malathion',
        activeIngredient: 'Malathion 50%',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 5-7 days',
        interval: 7,
        notes: 'Broad spectrum insecticide',
        phi: 1,
        cost: 120,
      },
      {
        type: 'biological',
        name: 'Methyl Eugenol Trap',
        notes: 'Use with yellow sticky traps for mass trapping',
      },
    ],
    preventiveMeasures: [
      {
        measure: 'Field sanitation',
        description: 'Remove fallen and infested fruits',
      },
      {
        measure: 'Net barriers',
        description: 'Use mosquito nets on trees',
      },
    ],
    isActive: true,
  },

  {
    name: 'Stem Borer',
    type: 'insect',
    severity: 'high',
    cropList: ['rice', 'maize', 'sugarcane'],
    symptomKeywords: ['hole', 'holes', 'stem', 'wilting', 'wilt', 'dead heart', 'white head', 'feeding damage'],
    description: 'Moth caterpillar that bores into plant stems',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Carbofuran Granules',
        activeIngredient: 'Carbofuran 3%',
        dosage: 20,
        unit: 'kg/ha',
        applicationMethod: 'Soil application',
        frequency: 'At planting',
        notes: 'Soil granules for effective control',
        cost: 400,
      },
      {
        type: 'biological',
        name: 'Trichogramma wasp',
        notes: 'Release parasitoid wasps for biological control',
      },
    ],
    isActive: true,
  },
];

async function seedPestCatalog() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agro');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing pest catalog...');
    const deleteResult = await PestCatalog.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing records`);

    // Insert new data
    console.log(`Starting to seed ${pests.length} pests...`);
    const result = await PestCatalog.insertMany(pests);
    console.log(`✓ Seeded ${result.length} pests into catalog`);

    // Verify by counting
    const count = await PestCatalog.countDocuments({});
    console.log(`✓ Verified: ${count} pests now in database`);

    // Close connection
    await mongoose.disconnect();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pest catalog:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedPestCatalog();
}

module.exports = seedPestCatalog;
