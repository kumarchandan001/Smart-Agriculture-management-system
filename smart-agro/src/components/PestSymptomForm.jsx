import { useState } from 'react';
import { Search, Plus, X, AlertCircle } from 'lucide-react';
import { detectPestFromSymptoms } from '../api/pestAPI';

const COMMON_SYMPTOMS = [
  'brown spots',
  'yellowing leaves',
  'white powder',
  'holes in leaves',
  'wilting',
  'leaf curl',
  'pustules',
  'fermented smell',
  'feeding damage',
  'discoloration',
  'fungal coating',
  'rot',
  'lesions',
  'necrosis',
];

const CROPS = [
  'tomato',
  'potato',
  'cucumber',
  'squash',
  'rice',
  'wheat',
  'maize',
  'cotton',
  'mango',
  'guava',
  'citrus',
  'grape',
];

export default function PestSymptomForm({ onDetectionComplete, onError }) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // Toggle symptom selection
  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
    setError('');
  };

  // Add custom symptom
  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  // Remove symptom
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  // Detect pest
  const handleDetect = async () => {
    setError('');

    if (!selectedCrop) {
      setError('Please select a crop');
      if (onError) onError('Crop is required');
      return;
    }

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      if (onError) onError('At least one symptom is required');
      return;
    }

    setLoading(true);

    try {
      const result = await detectPestFromSymptoms(selectedSymptoms, selectedCrop);
      const data = result.topMatch ? result : (result.data || result);
      const topMatch = data.topMatch || (data.data && data.data.topMatch);
      const probablePests = data.probablePests || (data.data && data.data.probablePests) || [];

      if (result.success && topMatch) {
        setResults({
          ...data,
          topMatch,
          probablePests,
        });
        if (onDetectionComplete) {
          onDetectionComplete({
            detectionMethod: 'symptoms',
            pestName: topMatch.name,
            probablePests: probablePests,
            symptoms: selectedSymptoms,
            crop: selectedCrop,
            confidence: topMatch.confidence,
          });
        }
      } else {
        setError(result.error || data.error || 'No matching pests found for these symptoms');
        if (onError) onError(result.error || data.error);
      }
    } catch (err) {
      setError(err.message || 'Detection failed');
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedCrop('');
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setError('');
    setResults(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">🔍 Detect Pest from Symptoms</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Crop Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Crop</label>
          <div className="relative">
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select a crop --</option>
              {CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptoms Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Symptoms
          </label>

          {/* Common symptoms grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  selectedSymptoms.includes(symptom)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Custom symptom input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') addCustomSymptom();
              }}
              placeholder="Add custom symptom..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addCustomSymptom}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected symptoms */}
        {selectedSymptoms.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Selected Symptoms ({selectedSymptoms.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {symptom}
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDetect}
            disabled={loading || !selectedCrop || selectedSymptoms.length === 0}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Detecting...' : '🔍 Detect Pest'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        {results?.topMatch && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">Detection Results</h3>

            {/* Top match */}
            <div className="mb-4 p-3 bg-white rounded border-l-4 border-green-600">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-gray-800">{results.topMatch?.name}</h4>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {results.topMatch?.confidence}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Severity: <span className="font-semibold capitalize">{results.topMatch?.severity}</span>
              </p>
              <p className="text-sm text-gray-600">Type: <span className="font-semibold capitalize">{results.topMatch?.type}</span></p>
            </div>

            {/* Alternative matches */}
            {Array.isArray(results?.probablePests) && results.probablePests.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Other Possible Pests:</p>
                <div className="space-y-2">
                  {results.probablePests.slice(1, 4).map((pest, idx) => (
                    <div key={idx} className="p-2 bg-white rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{pest?.name}</span>
                        <span className="text-yellow-600 font-bold">{pest?.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
