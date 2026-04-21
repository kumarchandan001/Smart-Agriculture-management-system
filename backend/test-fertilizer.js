/**
 * Fertilizer Guide System - Test Script
 * Run from backend directory: node test-fertilizer.js
 */

const fertilizerService = require('./services/fertilizer.service');

const runTests = async () => {
  console.log('='.repeat(80));
  console.log('FERTILIZER GUIDE SYSTEM - TEST SUITE');
  console.log('='.repeat(80));

  // Test 1: Get available crops
  console.log('\n[TEST 1] Available Crops');
  console.log('-'.repeat(80));
  const crops = fertilizerService.getAvailableCrops();
  console.log(`✓ Total crops: ${crops.length}`);
  console.log('Sample crops:', crops.slice(0, 3));

  // Test 2: Get available regions
  console.log('\n[TEST 2] Available Regions');
  console.log('-'.repeat(80));
  const regions = fertilizerService.getAvailableRegions();
  console.log(`✓ Total regions: ${regions.length}`);
  console.log('Sample regions:', regions.slice(0, 3));

  // Test 3: Generate fertilizer guide for Rice in Pune
  console.log('\n[TEST 3] Generate Fertilizer Guide - Rice in Pune');
  console.log('-'.repeat(80));
  const result1 = await fertilizerService.generateFertilizerGuide(
    'Maharashtra',
    'Pune',
    'Haveli',
    'Rice'
  );
  console.log(JSON.stringify(result1, null, 2));

  // Test 4: Generate fertilizer guide for Wheat in Punjab
  console.log('\n[TEST 4] Generate Fertilizer Guide - Wheat in Punjab');
  console.log('-'.repeat(80));
  const result2 = await fertilizerService.generateFertilizerGuide(
    'Punjab',
    'Ludhiana',
    'Ludhiana',
    'Wheat'
  );
  console.log(JSON.stringify(result2, null, 2));

  // Test 5: Generate fertilizer guide for Sugarcane in Maharashtra
  console.log('\n[TEST 5] Generate Fertilizer Guide - Sugarcane in Maharashtra');
  console.log('-'.repeat(80));
  const result3 = await fertilizerService.generateFertilizerGuide(
    'Maharashtra',
    'Pune',
    'Bhor',
    'Sugarcane'
  );
  console.log(JSON.stringify(result3, null, 2));

  // Test 6: Invalid region (should fail gracefully)
  console.log('\n[TEST 6] Invalid Region (Error Handling)');
  console.log('-'.repeat(80));
  const result4 = await fertilizerService.generateFertilizerGuide(
    'InvalidState',
    'InvalidDistrict',
    'InvalidBlock',
    'Rice'
  );
  console.log(JSON.stringify(result4, null, 2));

  // Test 7: Invalid crop (should fail gracefully)
  console.log('\n[TEST 7] Invalid Crop (Error Handling)');
  console.log('-'.repeat(80));
  const result5 = await fertilizerService.generateFertilizerGuide(
    'Maharashtra',
    'Pune',
    'Haveli',
    'InvalidCrop'
  );
  console.log(JSON.stringify(result5, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('TEST SUITE COMPLETED');
  console.log('='.repeat(80));
};

// Run tests
runTests().catch(console.error);
