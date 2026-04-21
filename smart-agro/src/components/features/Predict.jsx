import React, { useState } from 'react';

export default function Predict() {
  const [formData, setFormData] = useState({
    crop: '',
    ideal_n: '',
    ideal_p: '',
    ideal_k: '',
    ideal_ph: '',
    temp_c: '',
    rainfall_mm: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      crop: formData.crop.trim(),
      ideal_n: Number(formData.ideal_n || 0),
      ideal_p: Number(formData.ideal_p || 0),
      ideal_k: Number(formData.ideal_k || 0),
      ideal_ph: formData.ideal_ph.trim() || undefined,
      temp_c: formData.temp_c ? Number(formData.temp_c) : undefined,
      rainfall_mm: formData.rainfall_mm ? Number(formData.rainfall_mm) : undefined
    };

    try {
      const token = localStorage.getItem('token');
      const extraHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('Sending prediction payload:', payload);
      console.log('With headers:', extraHeaders);

      const res = await fetch('http://localhost:5000/api/predict/yield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      
      if (!res.ok) {
        throw { status: res.status, body: json };
      }

      setResult(json);
    } catch (err) {
      console.error(err);
      const msg = (err && err.body && (err.body.error || JSON.stringify(err.body))) || 'Prediction failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      crop: '',
      ideal_n: '',
      ideal_p: '',
      ideal_k: '',
      ideal_ph: '',
      temp_c: '',
      rainfall_mm: ''
    });
    setResult(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Yield Prediction</h1>
      <p className="text-gray-500 text-sm mb-4">
        Enter crop and soil parameters to predict expected yield
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1.5 font-bold text-sm">Crop Name</label>
            <input
              type="text"
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              placeholder="e.g. Rice"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-sm">Ideal pH</label>
            <input
              type="text"
              name="ideal_ph"
              value={formData.ideal_ph}
              onChange={handleChange}
              placeholder="e.g. 6.5"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1.5 font-bold text-sm">Nitrogen (N) kg/ha</label>
            <input
              type="number"
              name="ideal_n"
              value={formData.ideal_n}
              onChange={handleChange}
              placeholder="e.g. 80"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-sm">Phosphorus (P) kg/ha</label>
            <input
              type="number"
              name="ideal_p"
              value={formData.ideal_p}
              onChange={handleChange}
              placeholder="e.g. 25"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-sm">Potassium (K) kg/ha</label>
            <input
              type="number"
              name="ideal_k"
              value={formData.ideal_k}
              onChange={handleChange}
              placeholder="e.g. 60"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1.5 font-bold text-sm">Temperature (°C)</label>
            <input
              type="number"
              name="temp_c"
              value={formData.temp_c}
              onChange={handleChange}
              placeholder="e.g. 25"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-sm">Rainfall (mm)</label>
            <input
              type="number"
              name="rainfall_mm"
              value={formData.rainfall_mm}
              onChange={handleChange}
              placeholder="e.g. 1200"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Get Prediction'}
          </button>
          <button
            onClick={handleReset}
            className="bg-transparent border border-teal-500 text-teal-600 px-4 py-2 rounded-lg font-bold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      {(result || error) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          {result && (
            <>
              <div className="text-3xl font-bold text-green-700 mb-2">
                {result.predicted_yield} ton/ha
              </div>
              <div className="text-sm text-gray-600">
                Model: {result.model_version} • id: {result.prediction_id || '—'}
              </div>
            </>
          )}
          {error && (
            <div className="text-red-600 font-semibold">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}