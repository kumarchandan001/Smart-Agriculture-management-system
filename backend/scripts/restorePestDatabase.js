/**
 * Restore Pest & Disease Database
 * Comprehensive pest and disease catalog for Smart Agriculture
 */

const mongoose = require('mongoose');
require('dotenv').config();
const PestCatalog = require('../models/PestCatalog');

const COMPREHENSIVE_PEST_CATALOG = [
  {
    name: 'Early Blight',
    type: 'disease',
    severity: 'high',
    cropList: ['tomato', 'potato'],
    symptomKeywords: ['brown spots', 'concentric rings', 'leaf damage', 'dark spots'],
    description: 'Fungal disease causing dark brown spots with concentric rings on leaves',
    recommendedTreatments: [
      { type: 'chemical', name: 'Mancozeb', activeIngredient: 'Mancozeb 75%', dosage: 2.5, unit: 'g/L', frequency: 'Every 10-14 days' },
      { type: 'chemical', name: 'Chlorothalonil', activeIngredient: 'Chlorothalonil 75%', dosage: 2, unit: 'g/L', frequency: 'Every 14 days' },
      { type: 'biological', name: 'Bacillus subtilis', activeIngredient: 'Bacillus subtilis', dosage: 1, unit: 'ml/L', frequency: 'Weekly' },
    ],
    preventiveMeasures: [
      { measure: 'Remove infected leaves', description: 'Remove infected leaves immediately', timing: 'As soon as symptoms appear' },
      { measure: 'Improve air circulation', description: 'Improve air circulation in field', timing: 'Throughout season' },
      { measure: 'Avoid overhead irrigation', description: 'Avoid overhead irrigation', timing: 'Every watering' },
      { measure: 'Crop rotation', description: 'Avoid planting tomato/potato for 2 years', timing: 'Plan next season' },
    ],
    lifecycle: { optimalTemp: '18-25°C', optimalHumidity: '80-95%', developmentTime: '3-4 days' },
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
      { type: 'chemical', name: 'Metalaxyl + Mancozeb', activeIngredient: 'Metalaxyl 8% + Mancozeb 64%', dosage: 2.5, unit: 'g/L', frequency: 'Every 7-10 days' },
      { type: 'chemical', name: 'Cymoxanil', activeIngredient: 'Cymoxanil 8%', dosage: 3, unit: 'g/L', frequency: 'Every 7-10 days' },
    ],
    preventiveMeasures: [
      { measure: 'Use resistant varieties', description: 'Plant resistant potato/tomato varieties', timing: 'At planting' },
      { measure: 'Remove infected plants', description: 'Remove infected plants immediately', timing: 'When noticed' },
      { measure: 'Avoid overhead watering', description: 'Avoid overhead watering', timing: 'Every watering' },
      { measure: 'Improve air circulation', description: 'Improve air circulation', timing: 'Throughout season' },
    ],
    lifecycle: { optimalTemp: '10-20°C', optimalHumidity: '90-100%', developmentTime: '3-5 days' },
    isActive: true,
  },
  {
    name: 'Powdery Mildew',
    type: 'disease',
    severity: 'medium',
    cropList: ['wheat', 'grape', 'cucumber', 'squash'],
    symptomKeywords: ['white powder', 'powdery coating', 'leaf whitening', 'mildew'],
    description: 'White powder-like fungal coating on leaves and stems',
    recommendedTreatments: [
      { type: 'chemical', name: 'Sulfur Dust', activeIngredient: 'Sulfur 80%', dosage: 15, unit: 'kg/ha', frequency: 'Every 7-10 days' },
      { type: 'chemical', name: 'Triazole', activeIngredient: 'Triazole 25% EC', dosage: 1, unit: 'ml/L', frequency: 'Every 10-14 days' },
      { type: 'biological', name: 'Neem Oil', activeIngredient: 'Neem Oil 3%', dosage: 5, unit: 'ml/L', frequency: 'Every 7 days' },
    ],
    preventiveMeasures: [
      { measure: 'Improve air circulation', description: 'Improve air circulation between plants', timing: 'Throughout season' },
      { measure: 'Reduce nitrogen', description: 'Reduce nitrogen fertilization', timing: 'During growth' },
      { measure: 'Avoid overhead watering', description: 'Avoid overhead watering', timing: 'Every watering' },
    ],
    lifecycle: { optimalTemp: '15-25°C', optimalHumidity: '40-60%', developmentTime: '3-7 days' },
    isActive: true,
  },
  {
    name: 'Leaf Spot',
    type: 'disease',
    severity: 'medium',
    cropList: ['rice', 'cotton', 'sugarcane'],
    symptomKeywords: ['brown lesions', 'circular spots', 'leaf spots'],
    description: 'Fungal disease causing brown circular spots on leaves',
    recommendedTreatments: [
      { type: 'chemical', name: 'Carbendazim', activeIngredient: 'Carbendazim 50% WP', dosage: 1, unit: 'g/L', frequency: 'Every 10-14 days' },
      { type: 'chemical', name: 'Thiophanate', activeIngredient: 'Thiophanate-methyl 70% WP', dosage: 1, unit: 'g/L', frequency: 'Every 10-14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Use resistant varieties', description: 'Plant disease-resistant varieties', timing: 'At planting' },
      { measure: 'Proper spacing', description: 'Proper spacing for air circulation', timing: 'During planting' },
      { measure: 'Avoid overhead irrigation', description: 'Avoid overhead irrigation', timing: 'Every watering' },
    ],
    lifecycle: { optimalTemp: '18-28°C', optimalHumidity: '70-90%', developmentTime: '5-10 days' },
    isActive: true,
  },
  {
    name: 'Blast Disease',
    type: 'disease',
    severity: 'high',
    cropList: ['rice', 'wheat'],
    symptomKeywords: ['diamond-shaped lesions', 'leaf blast', 'panicle blast'],
    description: 'Fungal disease causing diamond-shaped lesions on leaves and panicles',
    recommendedTreatments: [
      { type: 'chemical', name: 'Tricyclazole', activeIngredient: 'Tricyclazole 75% WP', dosage: 1, unit: 'g/L', frequency: 'At boot stage' },
      { type: 'chemical', name: 'Propiconazole', activeIngredient: 'Propiconazole 25% EC', dosage: 1, unit: 'ml/L', frequency: 'Every 10-14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Use resistant varieties', description: 'Plant blast-resistant varieties', timing: 'At planting' },
      { measure: 'Balanced fertilization', description: 'Balanced fertilization management', timing: 'Throughout season' },
      { measure: 'Water management', description: 'Proper water management', timing: 'Throughout season' },
    ],
    lifecycle: { optimalTemp: '20-28°C', optimalHumidity: '90-100%', developmentTime: '4-7 days' },
    isActive: true,
  },
  {
    name: 'Rust',
    type: 'disease',
    severity: 'medium',
    cropList: ['wheat', 'barley', 'oats'],
    symptomKeywords: ['reddish-brown pustules', 'rust color', 'leaf rust', 'stem rust'],
    description: 'Fungal disease causing reddish-brown pustules on leaves and stems',
    recommendedTreatments: [
      { type: 'chemical', name: 'Propiconazole', activeIngredient: 'Propiconazole 25% EC', dosage: 1, unit: 'ml/L', frequency: 'Every 14 days' },
      { type: 'chemical', name: 'Hexaconazole', activeIngredient: 'Hexaconazole 5% EC', dosage: 2, unit: 'ml/L', frequency: 'Every 14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Use resistant varieties', description: 'Plant rust-resistant varieties', timing: 'At planting' },
      { measure: 'Destroy alternate hosts', description: 'Destroy barberry plants (alternate host)', timing: 'Before season' },
      { measure: 'Remove volunteer plants', description: 'Remove volunteer crop plants', timing: 'Before planting' },
    ],
    lifecycle: { optimalTemp: '10-25°C', optimalHumidity: '80-100%', developmentTime: '7-14 days' },
    isActive: true,
  },
  {
    name: 'Armyworm',
    type: 'insect',
    severity: 'high',
    cropList: ['maize', 'rice', 'wheat', 'sorghum'],
    symptomKeywords: ['leaf damage', 'defoliation', 'caterpillar', 'holes in leaves'],
    description: 'Caterpillar pest that causes severe defoliation on crop leaves',
    recommendedTreatments: [
      { type: 'chemical', name: 'Fipronil', activeIngredient: 'Fipronil 5% SC', dosage: 2.5, unit: 'ml/L', frequency: 'Every 7-10 days' },
      { type: 'chemical', name: 'Cypermethrin', activeIngredient: 'Cypermethrin 10% EC', dosage: 2, unit: 'ml/L', frequency: 'Every 7-10 days' },
      { type: 'biological', name: 'Bacillus thuringiensis', activeIngredient: 'Bt 16000 IU/mg', dosage: 1.5, unit: 'ml/L', frequency: 'Every 5-7 days' },
    ],
    preventiveMeasures: [
      { measure: 'Light traps', description: 'Light traps to monitor population', timing: 'Throughout season' },
      { measure: 'Handpicking', description: 'Handpicking of egg clusters', timing: 'Weekly inspection' },
      { measure: 'Plant borders', description: 'Plant trap crops around field', timing: 'At planting' },
    ],
    lifecycle: { optimalTemp: '20-30°C', optimalHumidity: '70-85%', developmentTime: '15-20 days' },
    isActive: true,
  },
  {
    name: 'Stem Borer',
    type: 'insect',
    severity: 'critical',
    cropList: ['maize', 'rice', 'sugarcane'],
    symptomKeywords: ['wilting', 'dead heart', 'damaged stems', 'entry holes'],
    description: 'Insect pest that bores into crop stems causing wilting and death',
    recommendedTreatments: [
      { type: 'chemical', name: 'Quinalphos', activeIngredient: 'Quinalphos 25% EC', dosage: 2, unit: 'ml/L', frequency: 'Every 10 days' },
      { type: 'chemical', name: 'Chlorpyrifos', activeIngredient: 'Chlorpyrifos 20% EC', dosage: 2.5, unit: 'ml/L', frequency: 'Every 7-10 days' },
      { type: 'biological', name: 'Trichogramma', activeIngredient: 'Trichogramma wasps', dosage: 50000, unit: 'wasps/acre', frequency: 'At egg laying' },
    ],
    preventiveMeasures: [
      { measure: 'Light traps', description: 'Light traps for monitoring', timing: 'Throughout season' },
      { measure: 'Remove alternate hosts', description: 'Remove alternate host plants', timing: 'Before planting' },
      { measure: 'Field sanitation', description: 'Proper field sanitation', timing: 'After harvest' },
    ],
    lifecycle: { optimalTemp: '15-32°C', optimalHumidity: '70-100%', developmentTime: '30-45 days' },
    isActive: true,
  },
  {
    name: 'Aphids',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'wheat', 'pulses'],
    symptomKeywords: ['sticky residue', 'yellowing leaves', 'sooty mold'],
    description: 'Small soft-bodied insects that suck plant sap causing yellowing',
    recommendedTreatments: [
      { type: 'chemical', name: 'Imidacloprid', activeIngredient: 'Imidacloprid 17.8% SL', dosage: 0.5, unit: 'ml/L', frequency: 'Every 10-14 days' },
      { type: 'chemical', name: 'Dimethoate', activeIngredient: 'Dimethoate 30% EC', dosage: 1.5, unit: 'ml/L', frequency: 'Every 7-10 days' },
      { type: 'biological', name: 'Neem Oil', activeIngredient: 'Neem 3% + Soap 1%', dosage: 5, unit: 'ml/L', frequency: 'Every 7 days' },
    ],
    preventiveMeasures: [
      { measure: 'Reflective mulches', description: 'Use reflective mulches', timing: 'At planting' },
      { measure: 'Water spray', description: 'Strong water spray to dislodge insects', timing: 'Weekly' },
      { measure: 'Trap crops', description: 'Plant trap crops', timing: 'Around field' },
    ],
    lifecycle: { optimalTemp: '15-25°C', optimalHumidity: '60-80%', developmentTime: '7-10 days' },
    isActive: true,
  },
  {
    name: 'Whitefly',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'vegetables', 'tobacco'],
    symptomKeywords: ['white insects', 'sticky honeydew', 'yellowing', 'sooty mold'],
    description: 'Tiny white insects that feed on plant sap and transmit viruses',
    recommendedTreatments: [
      { type: 'chemical', name: 'Acephate', activeIngredient: 'Acephate 75% SP', dosage: 1.5, unit: 'g/L', frequency: 'Every 10-14 days' },
      { type: 'chemical', name: 'Thiamethoxam', activeIngredient: 'Thiamethoxam 25% WG', dosage: 0.4, unit: 'g/L', frequency: 'Every 14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Yellow sticky traps', description: 'Use yellow sticky traps', timing: 'Throughout season' },
      { measure: 'Remove hosts', description: 'Remove alternate host plants', timing: 'Before planting' },
      { measure: 'Plant spacing', description: 'Maintain proper plant spacing', timing: 'At planting' },
    ],
    lifecycle: { optimalTemp: '20-28°C', optimalHumidity: '60-80%', developmentTime: '20-30 days' },
    isActive: true,
  },
  {
    name: 'Thrips',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'vegetables', 'flowers'],
    symptomKeywords: ['silvery patches', 'distorted leaves', 'browning'],
    description: 'Tiny insects that scrape plant tissue causing silvery patches',
    recommendedTreatments: [
      { type: 'chemical', name: 'Spinosad', activeIngredient: 'Spinosad 2.4% SC', dosage: 2, unit: 'ml/L', frequency: 'Every 7-10 days' },
      { type: 'chemical', name: 'Profenofos', activeIngredient: 'Profenofos 50% EC', dosage: 2, unit: 'ml/L', frequency: 'Every 10-14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Reflective mulches', description: 'Use reflective mulches', timing: 'At planting' },
      { measure: 'Water spray', description: 'Strong water spray', timing: 'Weekly' },
      { measure: 'Resistant varieties', description: 'Plant resistant varieties', timing: 'At planting' },
    ],
    lifecycle: { optimalTemp: '20-28°C', optimalHumidity: '40-70%', developmentTime: '10-14 days' },
    isActive: true,
  },
  {
    name: 'Spider Mites',
    type: 'insect',
    severity: 'medium',
    cropList: ['cotton', 'groundnut', 'vegetables'],
    symptomKeywords: ['fine webbing', 'speckled leaves', 'leaf drying', 'yellowing'],
    description: 'Tiny arachnids that create fine webbing and cause leaf yellowing',
    recommendedTreatments: [
      { type: 'chemical', name: 'Sulphur', activeIngredient: 'Sulphur 95%', dosage: 25, unit: 'kg/ha', frequency: 'Every 7-10 days' },
      { type: 'chemical', name: 'Dicofol', activeIngredient: 'Dicofol 18.5% EC', dosage: 2, unit: 'ml/L', frequency: 'Every 10-14 days' },
      { type: 'biological', name: 'Neem Oil', activeIngredient: 'Neem Oil 3%', dosage: 5, unit: 'ml/L', frequency: 'Every 7 days' },
    ],
    preventiveMeasures: [
      { measure: 'Water spray', description: 'Strong water spray', timing: 'Weekly' },
      { measure: 'Increase humidity', description: 'Increase humidity in field', timing: 'During dry season' },
      { measure: 'Remove alternate hosts', description: 'Remove alternate host plants', timing: 'Before planting' },
    ],
    lifecycle: { optimalTemp: '20-35°C', optimalHumidity: '40-60%', developmentTime: '5-8 days' },
    isActive: true,
  },
  {
    name: 'Scale Insects',
    type: 'insect',
    severity: 'medium',
    cropList: ['citrus', 'grape', 'mango'],
    symptomKeywords: ['brown bumps on stems', 'sticky honeydew', 'sooty mold', 'yellowing'],
    description: 'Armored insects that attach to stems and leaves sucking sap',
    recommendedTreatments: [
      { type: 'chemical', name: 'Mineral Oil', activeIngredient: 'Mineral Oil 98%', dosage: 20, unit: 'ml/L', frequency: 'Every 14 days' },
      { type: 'chemical', name: 'Monocrotophos', activeIngredient: 'Monocrotophos 36% SL', dosage: 1.5, unit: 'ml/L', frequency: 'Every 10-14 days' },
    ],
    preventiveMeasures: [
      { measure: 'Pruning', description: 'Prune infested branches', timing: 'When noticed' },
      { measure: 'Mechanical removal', description: 'Manual removal of scales', timing: 'Regular inspection' },
      { measure: 'Clean tools', description: 'Disinfect pruning tools', timing: 'Between cuts' },
    ],
    lifecycle: { optimalTemp: '20-30°C', optimalHumidity: '50-70%', developmentTime: '30-60 days' },
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

    const count = await PestCatalog.countDocuments({});
    console.log(`\n✔️  Database verification: ${count} pests now in database`);

    const pests = await PestCatalog.find({}).select('name type severity');
    console.log('\n📋 Seeded pests and diseases:');
    pests.forEach((pest, idx) => {
      console.log(`  ${idx + 1}. ${pest.name} (${pest.type}) - Severity: ${pest.severity}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database restoration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  restorePestDatabase();
}

module.exports = restorePestDatabase;
