/**
 * Restore Pest & Disease Database
 * Comprehensive pest and disease catalog for Smart Agriculture
 */

const mongoose = require('mongoose');
require('dotenv').config();
const PestCatalog = require('../models/PestCatalog');

const COMPREHENSIVE_PEST_CATALOG = [
  // ===== DISEASES =====
  {
    name: 'Early Blight',
    type: 'disease',
    severity: 'high',
    cropList: ['tomato', 'potato', 'eggplant'],
    symptomKeywords: ['brown spots', 'concentric rings', 'leaf damage', 'dark spots', 'yellowing', 'lesion'],
    description: 'Fungal disease causing dark brown spots with concentric rings on leaves',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Mancozeb',
        activeIngredient: 'Mancozeb 75%',
        dosage: 2.5,
        unit: 'g/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'chemical',
        name: 'Chlorothalonil',
        activeIngredient: 'Chlorothalonil 75%',
        dosage: 2,
        unit: 'g/L',
        frequency: 'Every 14 days',
      },
      {
        type: 'biological',
        name: 'Bacillus subtilis',
        activeIngredient: 'Bacillus subtilis',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Weekly',
      },
    ],
    preventiveMeasures: [
      { measure: 'Remove infected leaves', description: 'Remove infected leaves immediately', timing: 'As soon as symptoms appear' },
      { measure: 'Improve air circulation', description: 'Improve air circulation in field', timing: 'Throughout season' },
      { measure: 'Avoid overhead irrigation', description: 'Avoid overhead irrigation', timing: 'Every watering' },
      { measure: 'Crop rotation', description: 'Avoid planting tomato/potato for 2 years', timing: 'Plan next season' },
      { measure: 'Disease-free seeds', description: 'Use disease-free seeds', timing: 'At planting' },
    ],
    lifecycle: {
      optimalTemp: '18-25°C',
      optimalHumidity: '80-95%',
      developmentTime: '3-4 days',
    },
    isActive: true,
  },
  {
    name: 'Late Blight',
    type: 'disease',
    severity: 'critical',
    cropList: ['potato', 'tomato'],
    symptomKeywords: ['water-soaked spots', 'white mold', 'potato rot', 'rapid spread', 'wilting'],
    description: 'Oomycete disease causing water-soaked lesions and rapid crop destruction',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Metalaxyl + Mancozeb',
        activeIngredient: 'Metalaxyl 8% + Mancozeb 64%',
        dosage: 2.5,
        unit: 'g/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'chemical',
        name: 'Cymoxanil',
        activeIngredient: 'Cymoxanil 8%',
        dosage: 3,
        unit: 'g/L',
        frequency: 'Every 7-10 days',
      },
    ],
    preventiveMeasures: [
      'Use resistant varieties',
      'Remove infected plants immediately',
      'Avoid overhead watering',
      'Improve air circulation',
      'Early planting to avoid peak infection periods',
    ],
    lifecycle: {
      optimalTemp: '10-20°C',
      optimalHumidity: '90-100%',
      developmentTime: '3-5 days',
    },
    isActive: true,
  },
  {
    name: 'Powdery Mildew',
    type: 'disease',
    severity: 'medium',
    cropList: ['wheat', 'grape', 'cucumber', 'squash', 'beans'],
    symptomKeywords: ['white powder', 'powdery coating', 'leaf whitening', 'mildew', 'dust-like'],
    description: 'White powder-like fungal coating on leaves and stems',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Sulfur Dust',
        activeIngredient: 'Sulfur 80%',
        dosage: 15,
        unit: 'kg/ha',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'chemical',
        name: 'Triazole',
        activeIngredient: 'Triazole 25% EC',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'biological',
        name: 'Neem Oil Spray',
        activeIngredient: 'Neem Oil 3%',
        dosage: 5,
        unit: 'ml/L',
        frequency: 'Every 7 days',
      },
    ],
    preventiveMeasures: [
      'Improve air circulation',
      'Reduce nitrogen fertilization',
      'Avoid overhead watering',
      'Plant resistant varieties',
      'Remove infected plant parts',
    ],
    lifecycle: {
      optimalTemp: '15-25°C',
      optimalHumidity: '40-60%',
      developmentTime: '3-7 days',
    },
    isActive: true,
  },
  {
    name: 'Leaf Spot',
    type: 'disease',
    severity: 'medium',
    cropList: ['rice', 'cotton', 'sugarcane', 'banana'],
    symptomKeywords: ['spots on leaves', 'brown lesions', 'circular spots', 'leaf spots', 'necrotic'],
    description: 'Fungal disease causing brown circular spots on leaves',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Carbendazim',
        activeIngredient: 'Carbendazim 50% WP',
        dosage: 1,
        unit: 'g/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'chemical',
        name: 'Thiophanate-methyl',
        activeIngredient: 'Thiophanate-methyl 70% WP',
        dosage: 1,
        unit: 'g/L',
        frequency: 'Every 10-14 days',
      },
    ],
    preventiveMeasures: [
      'Use disease-resistant varieties',
      'Proper spacing for air circulation',
      'Avoid overhead irrigation',
      'Remove infected leaves',
      'Crop rotation',
    ],
    lifecycle: {
      optimalTemp: '18-28°C',
      optimalHumidity: '70-90%',
      developmentTime: '5-10 days',
    },
    isActive: true,
  },
  {
    name: 'Blast Disease',
    type: 'disease',
    severity: 'high',
    cropList: ['rice', 'wheat'],
    symptomKeywords: ['diamond-shaped lesions', 'leaf blast', 'panicle blast', 'neck rot'],
    description: 'Fungal disease causing diamond-shaped lesions on leaves and panicles',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Tricyclazole',
        activeIngredient: 'Tricyclazole 75% WP',
        dosage: 1,
        unit: 'g/L',
        frequency: 'At boot stage and heading',
      },
      {
        type: 'chemical',
        name: 'Propiconazole',
        activeIngredient: 'Propiconazole 25% EC',
        dosage: 1,
        unit: 'ml/L',
        frequency: 'Every 10-14 days',
      },
    ],
    preventiveMeasures: [
      'Use resistant varieties',
      'Balanced fertilization',
      'Proper water management',
      'Remove infected plant parts',
      'Crop rotation',
    ],
    lifecycle: {
      optimalTemp: '20-28°C',
      optimalHumidity: '90-100%',
      developmentTime: '4-7 days',
    },
    isActive: true,
  },

  // ===== INSECTS =====
  {
    name: 'Armyworm',
    type: 'insect',
    severity: 'high',
    cropList: ['maize', 'rice', 'wheat', 'sorghum', 'cotton'],
    symptomKeywords: ['leaf damage', 'defoliation', 'caterpillar', 'holes in leaves', 'chewed leaves'],
    description: 'Caterpillar pest that causes severe defoliation on crop leaves',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Fipronil',
        activeIngredient: 'Fipronil 5% SC',
        dosage: 2.5,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'chemical',
        name: 'Cypermethrin',
        activeIngredient: 'Cypermethrin 10% EC',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'biological',
        name: 'Bacillus thuringiensis',
        activeIngredient: 'Bt 16000 IU/mg',
        dosage: 1.5,
        unit: 'ml/L',
        frequency: 'Every 5-7 days',
      },
    ],
    preventiveMeasures: [
      'Light traps to monitor population',
      'Handpicking of egg clusters',
      'Plant border crops',
      'Timely irrigation',
      'Avoid excessive nitrogen',
    ],
    lifecycle: {
      optimalTemp: '20-30°C',
      optimalHumidity: '70-85%',
      developmentTime: '15-20 days',
    },
    isActive: true,
  },
  {
    name: 'Stem Borer',
    type: 'insect',
    severity: 'critical',
    cropList: ['maize', 'rice', 'sugarcane', 'cotton'],
    symptomKeywords: ['wilting', 'dead heart', 'damaged stems', 'entry holes', 'white holes'],
    description: 'Insect pest that bores into crop stems causing wilting and death',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Quinalphos',
        activeIngredient: 'Quinalphos 25% EC',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 10 days',
      },
      {
        type: 'chemical',
        name: 'Chlorpyrifos',
        activeIngredient: 'Chlorpyrifos 20% EC',
        dosage: 2.5,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'biological',
        name: 'Trichogramma',
        activeIngredient: 'Trichogramma @ 50,000/acre',
        dosage: 50000,
        unit: 'wasps/acre',
        frequency: 'At 50% egg laying',
      },
    ],
    preventiveMeasures: [
      'Light traps for monitoring',
      'Remove alternate hosts',
      'Proper field sanitation',
      'Use resistant varieties',
      'Timely irrigation and fertilization',
    ],
    lifecycle: {
      optimalTemp: '15-32°C',
      optimalHumidity: '70-100%',
      developmentTime: '30-45 days',
    },
    isActive: true,
  },
  {
    name: 'Aphids',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'wheat', 'pulses', 'vegetable crops'],
    symptomKeywords: ['sticky residue', 'yellowing leaves', 'distorted growth', 'sooty mold', 'curled leaves'],
    description: 'Small soft-bodied insects that suck plant sap causing yellowing and leaf curl',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Imidacloprid',
        activeIngredient: 'Imidacloprid 17.8% SL',
        dosage: 0.5,
        unit: 'ml/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'chemical',
        name: 'Dimethoate',
        activeIngredient: 'Dimethoate 30% EC',
        dosage: 1.5,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'biological',
        name: 'Neem Oil + Soap',
        activeIngredient: 'Neem 3% + Soap 1%',
        dosage: 5,
        unit: 'ml/L',
        frequency: 'Every 7 days',
      },
    ],
    preventiveMeasures: [
      'Use reflective mulches',
      'Strong water spray to dislodge insects',
      'Plant trap crops',
      'Remove alternate hosts',
      'Encourage natural enemies',
    ],
    lifecycle: {
      optimalTemp: '15-25°C',
      optimalHumidity: '60-80%',
      developmentTime: '7-10 days',
    },
    isActive: true,
  },
  {
    name: 'Whitefly',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'vegetables', 'tobacco'],
    symptomKeywords: ['white insects on leaves', 'sticky honeydew', 'yellowing', 'sooty mold', 'leaf wilting'],
    description: 'Tiny white insects that feed on plant sap and transmit viruses',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Acephate',
        activeIngredient: 'Acephate 75% SP',
        dosage: 1.5,
        unit: 'g/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'chemical',
        name: 'Thiamethoxam',
        activeIngredient: 'Thiamethoxam 25% WG',
        dosage: 0.4,
        unit: 'g/L',
        frequency: 'Every 14 days',
      },
      {
        type: 'biological',
        name: 'Yellow Sticky Traps',
        activeIngredient: 'Mechanical trap',
        dosage: 5,
        unit: 'traps/100m²',
        frequency: 'Throughout season',
      },
    ],
    preventiveMeasures: [
      'Use yellow sticky traps',
      'Remove alternate hosts',
      'Maintain proper plant spacing',
      'Avoid excessive nitrogen',
      'Encourage natural enemies',
    ],
    lifecycle: {
      optimalTemp: '20-28°C',
      optimalHumidity: '60-80%',
      developmentTime: '20-30 days',
    },
    isActive: true,
  },
  {
    name: 'Thrips',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'vegetables', 'flowers'],
    symptomKeywords: ['silvery patches', 'distorted leaves', 'browning', 'petal damage'],
    description: 'Tiny insects that scrape plant tissue causing silvery patches',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Spinosad',
        activeIngredient: 'Spinosad 2.4% SC',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'chemical',
        name: 'Profenofos',
        activeIngredient: 'Profenofos 50% EC',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 10-14 days',
      },
    ],
    preventiveMeasures: [
      'Use reflective mulches',
      'Remove alternate hosts',
      'Strong water spray',
      'Plant resistant varieties',
      'Proper spacing',
    ],
    lifecycle: {
      optimalTemp: '20-28°C',
      optimalHumidity: '40-70%',
      developmentTime: '10-14 days',
    },
    isActive: true,
  },
  {
    name: 'Mites (Spider Mites)',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'groundnut', 'vegetables', 'pulses'],
    symptomKeywords: ['fine webbing', 'speckled leaves', 'yellowing', 'leaf drying', 'stippling'],
    description: 'Tiny arachnids that create fine webbing and cause leaf yellowing',
    recommendedTreatments: [
      {
        type: 'chemical',
        name: 'Sulphur',
        activeIngredient: 'Sulphur 95%',
        dosage: 25,
        unit: 'kg/ha',
        frequency: 'Every 7-10 days',
      },
      {
        type: 'chemical',
        name: 'Dicofol',
        activeIngredient: 'Dicofol 18.5% EC',
        dosage: 2,
        unit: 'ml/L',
        frequency: 'Every 10-14 days',
      },
      {
        type: 'biological',
        name: 'Neem Oil',
        activeIngredient: 'Neem Oil 3%',
        dosage: 5,
        unit: 'ml/L',
        frequency: 'Every 7 days',
      },
    ],
    preventiveMeasures: [
      'Strong water spray',
      'Increase humidity',
      'Remove alternate hosts',
      'Encourage predatory mites',
      'Avoid sulfur and oils together',
    ],
    lifecycle: {
      optimalTemp: '20-35°C',
      optimalHumidity: '40-60%',
      developmentTime: '5-8 days',
    },
    isActive: true,
  },
];

async function restorePestDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agro');
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing existing pest catalog...');
    const deleteResult = await PestCatalog.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing records`);

    console.log(`\n📝 Seeding ${COMPREHENSIVE_PEST_CATALOG.length} pests and diseases...`);
    const result = await PestCatalog.insertMany(COMPREHENSIVE_PEST_CATALOG);
    console.log(`✅ Successfully inserted ${result.length} pests into database`);

    // Verify by counting and listing
    const count = await PestCatalog.countDocuments({});
    console.log(`\n✔️  Database verification: ${count} pests now in database`);

    // List what was added
    const pests = await PestCatalog.find({}).select('name type severity cropList');
    console.log('\n📋 Seeded pests and diseases:');
    pests.forEach((pest, idx) => {
      console.log(`  ${idx + 1}. ${pest.name} (${pest.type}) - Severity: ${pest.severity}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database restoration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring pest database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  restorePestDatabase();
}

module.exports = restorePestDatabase;
