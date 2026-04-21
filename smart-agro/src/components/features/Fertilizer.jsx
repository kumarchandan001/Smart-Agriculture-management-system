import React, { useState, useEffect } from 'react';
import { Droplets, Leaf, DollarSign, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Fertilizer() {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    block: '',
    crop: ''
  });

  // Load crops and regions on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [cropsRes, regionsRes] = await Promise.all([
        fetch('/api/fertilizer/crops'),
        fetch('/api/fertilizer/regions')
      ]);

      if (cropsRes.ok) {
        const cropsData = await cropsRes.json();
        setCrops(cropsData.data || []);
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json();
        setRegions(regionsData.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.state || !formData.district || !formData.block || !formData.crop) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await fetch('/api/fertilizer/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to get recommendations');
        return;
      }

      setRecommendation(data.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get unique states, districts, blocks
  const uniqueStates = [...new Set(regions.map(r => r.state))];
  const districts = formData.state 
    ? [...new Set(regions.filter(r => r.state === formData.state).map(r => r.district))]
    : [];
  const blocks = formData.state && formData.district
    ? [...new Set(regions.filter(r => r.state === formData.state && r.district === formData.district).map(r => r.block))]
    : [];

  return (
    <div className="space-y-6 p-6 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Droplets className="w-8 h-8 text-green-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Fertilizer Guide</h2>
          <p className="text-gray-600">Get customized fertilizer recommendations for your region and crop</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select State</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              disabled={!formData.state}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Block Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
            <select
              name="block"
              value={formData.block}
              onChange={handleInputChange}
              disabled={!formData.district}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <option value="">Select Block</option>
              {blocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>

          {/* Crop Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Crop</option>
              {crops.map(crop => (
                <option key={crop.crop} value={crop.crop}>{crop.crop}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Loading Recommendations...
            </>
          ) : (
            <>
              <Leaf className="w-5 h-5" />
              Get Recommendations
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Recommendations Display */}
      {recommendation && (
        <div className="space-y-6">
          {/* Region & Crop Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Region Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">State:</span> {recommendation.region_info.state}</p>
                <p><span className="font-medium">District:</span> {recommendation.region_info.district}</p>
                <p><span className="font-medium">Block:</span> {recommendation.region_info.block}</p>
                <p className="pt-2 border-t"><span className="font-medium">Soil NPK:</span></p>
                <p className="ml-4">N: {recommendation.region_info.soil_npk.nitrogen} kg/ha</p>
                <p className="ml-4">P: {recommendation.region_info.soil_npk.phosphorus} kg/ha</p>
                <p className="ml-4">K: {recommendation.region_info.soil_npk.potassium} kg/ha</p>
                <p className="ml-4">pH: {recommendation.region_info.soil_ph}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Crop Requirements
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Crop:</span> {recommendation.crop_info.crop_name}</p>
                <p className="pt-2 border-t"><span className="font-medium">Ideal NPK:</span></p>
                <p className="ml-4">N: {recommendation.crop_info.ideal_npk.nitrogen} kg/ha</p>
                <p className="ml-4">P: {recommendation.crop_info.ideal_npk.phosphorus} kg/ha</p>
                <p className="ml-4">K: {recommendation.crop_info.ideal_npk.potassium} kg/ha</p>
                <p className="pt-2 border-t"><span className="font-medium">pH Range:</span> {recommendation.crop_info.suitable_ph_range.min} - {recommendation.crop_info.suitable_ph_range.max}</p>
              </div>
            </div>
          </div>

          {/* Nutrient Deficiency */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-3">Nutrient Deficiency Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{recommendation.nutrient_deficiency.nitrogen_deficiency}</p>
                <p className="text-sm text-gray-600">N Deficiency (kg/ha)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{recommendation.nutrient_deficiency.phosphorus_deficiency}</p>
                <p className="text-sm text-gray-600">P Deficiency (kg/ha)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{recommendation.nutrient_deficiency.potassium_deficiency}</p>
                <p className="text-sm text-gray-600">K Deficiency (kg/ha)</p>
              </div>
            </div>
          </div>

          {/* pH Analysis */}
          <div className={`p-4 rounded-lg flex gap-3 ${recommendation.ph_analysis.ph_suitable ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            {recommendation.ph_analysis.ph_suitable ? (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-semibold mb-1 ${recommendation.ph_analysis.ph_suitable ? 'text-green-800' : 'text-yellow-800'}`}>pH Analysis</h3>
              <p className={recommendation.ph_analysis.ph_suitable ? 'text-green-700 text-sm' : 'text-yellow-700 text-sm'}>
                {recommendation.ph_analysis.recommendation}
              </p>
            </div>
          </div>

          {/* Fertilizer Recommendations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-green-600" />
              Fertilizer Recommendations
            </h3>
            {recommendation.fertilizer_recommendations.map((fert, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                <h4 className="font-bold text-lg text-gray-800 mb-3">{fert.fertilizer}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Quantity (kg/ha)</p>
                    <p className="text-xl font-bold text-green-600">{fert.quantity_kg_ha}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Quantity (kg/acre)</p>
                    <p className="text-xl font-bold text-green-600">{fert.quantity_kg_acre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cost/kg</p>
                    <p className="text-lg font-bold text-blue-600">₹{fert.cost_per_kg}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Cost</p>
                    <p className="text-lg font-bold text-blue-600">₹{fert.total_cost}</p>
                  </div>
                </div>

                {/* Split Dose Schedule */}
                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Split Dose Schedule:</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-blue-700">Basal (50%)</p>
                      <p className="text-blue-900">{fert.split_dose.basal_kg_ha} kg/ha</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-700">Mid-growth (25%)</p>
                      <p className="text-blue-900">{fert.split_dose.mid_growth_kg_ha} kg/ha</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-700">Flowering (25%)</p>
                      <p className="text-blue-900">{fert.split_dose.flowering_kg_ha} kg/ha</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic">{fert.timing}</p>
              </div>
            ))}
          </div>

          {/* Cost Estimate */}
          <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6" />
              <h3 className="font-bold text-xl">Cost Estimate</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Per Hectare</p>
                <p className="text-3xl font-bold">₹{recommendation.cost_estimate.total_cost_per_ha}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Per Acre</p>
                <p className="text-3xl font-bold">₹{recommendation.cost_estimate.total_cost_per_acre}</p>
              </div>
            </div>
          </div>

          {/* Application Notes */}
          <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <h3 className="font-semibold text-gray-800">Application Notes & Best Practices</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Best Practice:</span> {recommendation.application_notes.best_practice}</p>
              <p><span className="font-medium">Watering:</span> {recommendation.application_notes.watering}</p>
              <p><span className="font-medium">Soil Testing:</span> {recommendation.application_notes.soil_testing}</p>
              <p><span className="font-medium">Organic Matter:</span> {recommendation.application_notes.organic_matter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
