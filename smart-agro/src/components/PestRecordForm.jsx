import { useState, useEffect } from 'react';
import { createPestRecord } from '../api/pestAPI';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function PestRecordForm({ detectionResult, onSaveComplete, onError }) {
  const [formData, setFormData] = useState({
    crop: '',
    pestName: '',
    severity: 'medium',
    dateObserved: new Date().toISOString().split('T')[0],
    symptoms: [],
    detectionMethod: 'manual',
    affectedArea: 10,
    treatmentApplied: {
      date: new Date().toISOString().split('T')[0],
      dose: '',
      method: '',
      effectiveness: 'fair',
      effectivenessNotes: '',
    },
    cost: {
      treatment: 0,
      labor: 0,
      equipment: 0,
      total: 0,
    },
    notes: '',
    resolved: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Populate from detection result
  useEffect(() => {
    if (detectionResult) {
      setFormData((prev) => ({
        ...prev,
        crop: detectionResult.crop || '',
        pestName: detectionResult.pestName || '',
        symptoms: detectionResult.symptoms || [],
        detectionMethod: detectionResult.detectionMethod || 'manual',
      }));
    }
  }, [detectionResult]);

  // Calculate total cost
  useEffect(() => {
    const total =
      (formData.cost.treatment || 0) +
      (formData.cost.labor || 0) +
      (formData.cost.equipment || 0);
    setFormData((prev) => ({
      ...prev,
      cost: { ...prev.cost, total },
    }));
  }, [formData.cost.treatment, formData.cost.labor, formData.cost.equipment]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');

    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.crop) {
      setError('Crop is required');
      if (onError) onError('Crop is required');
      return;
    }

    if (!formData.pestName) {
      setError('Pest name is required');
      if (onError) onError('Pest name is required');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const result = await createPestRecord(formData);

      if (result.success) {
        setSuccess(true);
        if (onSaveComplete) {
          onSaveComplete(result.data);
        }

        // Reset form
        setTimeout(() => {
          setFormData({
            crop: '',
            pestName: '',
            severity: 'medium',
            dateObserved: new Date().toISOString().split('T')[0],
            symptoms: [],
            detectionMethod: 'manual',
            affectedArea: 10,
            treatmentApplied: {
              date: new Date().toISOString().split('T')[0],
              dose: '',
              method: '',
              effectiveness: 'fair',
              effectivenessNotes: '',
            },
            cost: {
              treatment: 0,
              labor: 0,
              equipment: 0,
              total: 0,
            },
            notes: '',
            resolved: false,
          });
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Failed to save record');
        if (onError) onError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to save record');
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">📝 Record Pest Attack</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex gap-2">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Record saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pest Info Section */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Pest Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Crop <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                placeholder="e.g., tomato, cotton"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Pest Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pest Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pestName"
                value={formData.pestName}
                onChange={handleChange}
                placeholder="e.g., Early Blight"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Date Observed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date Observed
              </label>
              <input
                type="date"
                name="dateObserved"
                value={formData.dateObserved}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Affected Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Affected Area (%)
              </label>
              <input
                type="range"
                name="affectedArea"
                min="0"
                max="100"
                value={formData.affectedArea}
                onChange={handleChange}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{formData.affectedArea}% of field</div>
            </div>

            {/* Detection Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detection Method
              </label>
              <select
                name="detectionMethod"
                value={formData.detectionMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="manual">Manual</option>
                <option value="symptoms">From Symptoms</option>
                <option value="image">From Image</option>
              </select>
            </div>
          </div>
        </div>

        {/* Treatment Section */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Treatment Applied</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Date
              </label>
              <input
                type="date"
                name="treatmentApplied.date"
                value={formData.treatmentApplied.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
              <input
                type="text"
                name="treatmentApplied.dose"
                value={formData.treatmentApplied.dose}
                onChange={handleChange}
                placeholder="e.g., 10ml/L"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Application Method
              </label>
              <input
                type="text"
                name="treatmentApplied.method"
                value={formData.treatmentApplied.method}
                onChange={handleChange}
                placeholder="e.g., Spray"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Effectiveness
              </label>
              <select
                name="treatmentApplied.effectiveness"
                value={formData.treatmentApplied.effectiveness}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Effectiveness Notes
              </label>
              <textarea
                name="treatmentApplied.effectivenessNotes"
                value={formData.treatmentApplied.effectivenessNotes}
                onChange={handleChange}
                placeholder="Any observations about treatment effectiveness..."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Cost Section */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Cost Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Cost (₹)
              </label>
              <input
                type="number"
                name="cost.treatment"
                value={formData.cost.treatment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Labor Cost (₹)
              </label>
              <input
                type="number"
                name="cost.labor"
                value={formData.cost.labor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipment Cost (₹)
              </label>
              <input
                type="number"
                name="cost.equipment"
                value={formData.cost.equipment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">Total Cost:</p>
              <p className="text-2xl font-bold text-green-600">₹{formData.cost.total}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional observations or notes..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Resolved Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="resolved"
            checked={formData.resolved}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label className="text-sm font-medium text-gray-700">Mark as resolved</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : '💾 Save Record'}
        </button>
      </form>
    </div>
  );
}
