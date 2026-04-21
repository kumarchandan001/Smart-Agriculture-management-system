import { useState, useEffect } from 'react';
import { Droplet, Leaf, Wind, Zap } from 'lucide-react';
import { analyzeSoil } from '../api/soilAPI';

/**
 * SoilForm Component
 * User input form for soil analysis
 * Supports two modes: Region-based (auto-detect from CSV) or Manual NPK/pH input
 */
export default function SoilForm({ onAnalysisComplete, onError }) {
  const [analysisMode, setAnalysisMode] = useState('manual'); // 'region' or 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Region-based form state
  const [regionData, setRegionData] = useState({
    state: '',
    district: '',
    block: '',
  });

  // Manual input form state
  const [manualData, setManualData] = useState({
    n: 50,
    p: 20,
    k: 100,
    ph: 6.5,
  });

  // Nutrient ranges for validation
  const nutrientRanges = {
    n: { min: 0, max: 300, label: 'Nitrogen (N)' },
    p: { min: 0, max: 150, label: 'Phosphorus (P)' },
    k: { min: 0, max: 300, label: 'Potassium (K)' },
    ph: { min: 3, max: 10, label: 'pH' },
  };

  // Handle region input changes
  const handleRegionChange = (e) => {
    const { name, value } = e.target;
    setRegionData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Handle manual input changes
  const handleManualChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setManualData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
    setError('');
  };

  // Validate manual inputs
  const isManualValid = () => {
    return (
      manualData.n >= nutrientRanges.n.min &&
      manualData.n <= nutrientRanges.n.max &&
      manualData.p >= nutrientRanges.p.min &&
      manualData.p <= nutrientRanges.p.max &&
      manualData.k >= nutrientRanges.k.min &&
      manualData.k <= nutrientRanges.k.max &&
      manualData.ph >= nutrientRanges.ph.min &&
      manualData.ph <= nutrientRanges.ph.max
    );
  };

  // Validate region inputs
  const isRegionValid = () => {
    return regionData.state.trim() !== '' && regionData.district.trim() !== '' && regionData.block.trim() !== '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload;

      if (analysisMode === 'region') {
        if (!isRegionValid()) {
          setError('Please fill in all region fields');
          setLoading(false);
          return;
        }
        payload = {
          analysisMode: 'region',
          state: regionData.state,
          district: regionData.district,
          block: regionData.block,
        };
      } else {
        if (!isManualValid()) {
          setError('Please ensure all values are within valid ranges');
          setLoading(false);
          return;
        }
        payload = {
          analysisMode: 'manual',
          n: manualData.n,
          p: manualData.p,
          k: manualData.k,
          ph: manualData.ph,
        };
      }

      const result = await analyzeSoil(payload);

      if (result.success) {
        onAnalysisComplete(result.data);
      } else {
        setError(result.error || 'Analysis failed');
        if (onError) onError(result.error);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to analyze soil';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Soil Health Analysis</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-6 border-b pb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="region"
              checked={analysisMode === 'region'}
              onChange={(e) => {
                setAnalysisMode(e.target.value);
                setError('');
              }}
              className="w-4 h-4"
            />
            <span className="font-medium text-gray-700">Region-Based (Auto-detect)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="manual"
              checked={analysisMode === 'manual'}
              onChange={(e) => {
                setAnalysisMode(e.target.value);
                setError('');
              }}
              className="w-4 h-4"
            />
            <span className="font-medium text-gray-700">Manual Input</span>
          </label>
        </div>

        {/* Region-Based Inputs */}
        {analysisMode === 'region' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your location to get average soil data for your region
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={regionData.state}
                  onChange={handleRegionChange}
                  placeholder="e.g., Maharashtra"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={regionData.district}
                  onChange={handleRegionChange}
                  placeholder="e.g., Pune"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <input
                  type="text"
                  name="block"
                  value={regionData.block}
                  onChange={handleRegionChange}
                  placeholder="e.g., Haveli"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Fields */}
        {analysisMode === 'manual' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your soil test results from your local soil testing lab
            </p>

            {/* Nitrogen */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-yellow-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Nitrogen (N) - mg/kg
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="range"
                  name="n"
                  min={nutrientRanges.n.min}
                  max={nutrientRanges.n.max}
                  value={manualData.n}
                  onChange={handleManualChange}
                  className="flex-1"
                />
                <input
                  type="number"
                  name="n"
                  value={manualData.n}
                  onChange={handleManualChange}
                  min={nutrientRanges.n.min}
                  max={nutrientRanges.n.max}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {manualData.n < 50 ? 'Low' : manualData.n < 100 ? 'Medium' : 'High'} (Range: 0-300)
              </p>
            </div>

            {/* Phosphorus */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-pink-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Phosphorus (P) - mg/kg
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="range"
                  name="p"
                  min={nutrientRanges.p.min}
                  max={nutrientRanges.p.max}
                  value={manualData.p}
                  onChange={handleManualChange}
                  className="flex-1"
                />
                <input
                  type="number"
                  name="p"
                  value={manualData.p}
                  onChange={handleManualChange}
                  min={nutrientRanges.p.min}
                  max={nutrientRanges.p.max}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {manualData.p < 20 ? 'Low' : manualData.p < 40 ? 'Medium' : 'High'} (Range: 0-150)
              </p>
            </div>

            {/* Potassium */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-orange-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Potassium (K) - mg/kg
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="range"
                  name="k"
                  min={nutrientRanges.k.min}
                  max={nutrientRanges.k.max}
                  value={manualData.k}
                  onChange={handleManualChange}
                  className="flex-1"
                />
                <input
                  type="number"
                  name="k"
                  value={manualData.k}
                  onChange={handleManualChange}
                  min={nutrientRanges.k.min}
                  max={nutrientRanges.k.max}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {manualData.k < 100 ? 'Low' : manualData.k < 200 ? 'Medium' : 'High'} (Range: 0-300)
              </p>
            </div>

            {/* pH */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">
                  pH Value
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="range"
                  name="ph"
                  min={nutrientRanges.ph.min}
                  max={nutrientRanges.ph.max}
                  step="0.1"
                  value={manualData.ph}
                  onChange={handleManualChange}
                  className="flex-1"
                />
                <input
                  type="number"
                  name="ph"
                  value={manualData.ph}
                  onChange={handleManualChange}
                  min={nutrientRanges.ph.min}
                  max={nutrientRanges.ph.max}
                  step="0.1"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {manualData.ph < 6 ? 'Acidic' : manualData.ph <= 7.5 ? 'Neutral' : 'Alkaline'} (Range:
                3-10)
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (analysisMode === 'region' ? !isRegionValid() : !isManualValid())}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Analyzing...
            </>
          ) : (
            'Analyze Soil Health'
          )}
        </button>
      </form>
    </div>
  );
}
