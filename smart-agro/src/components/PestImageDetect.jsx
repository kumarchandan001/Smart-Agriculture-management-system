import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { detectPestFromImage } from '../api/pestAPI';

export default function PestImageDetect({ onDetectionComplete, onError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      if (onError) onError('Invalid file type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      if (onError) onError('File too large');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Detect
    setError('');
    setLoading(true);

    try {
      const result = await detectPestFromImage(file);

      if (result.success) {
        setResults(result.data);
        if (onDetectionComplete) {
          onDetectionComplete({
            detectionMethod: 'image',
            pestName: result.data.prediction.pestName,
            confidence: result.data.confidence,
            imageUrl: result.data.imageUrl,
            fallbackUsed: result.data.fallbackUsed,
          });
        }
      } else {
        setError(result.error || 'Could not analyze image');
        if (onError) onError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Image analysis failed');
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResults(null);
    setError('');
    fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">📸 Detect from Leaf Image</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:bg-green-50 transition"
          >
            <Upload className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Upload a leaf image</h3>
            <p className="text-sm text-gray-600 mb-3">
              Take a clear photo of affected leaves or plant parts
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WebP • Max 5MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img src={preview} alt="Leaf preview" className="w-full h-64 object-cover" />
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 mt-2">Analyzing image...</p>
              </div>
            )}

            {/* Results */}
            {results && !loading && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-2 items-start mb-3">
                  {results.fallbackUsed ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {results.prediction.pestName}
                    </h4>
                    {results.fallbackUsed ? (
                      <p className="text-sm text-yellow-700">
                        ML service unavailable - using fallback analysis
                      </p>
                    ) : (
                      <p className="text-sm text-green-700">
                        Confidence: {Math.round(results.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </div>

                {results.prediction.recommendation && (
                  <p className="text-sm text-gray-700 p-2 bg-white rounded">
                    💡 {results.prediction.recommendation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              📤 Choose Image
            </button>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
              >
                📷 Choose Another
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2">📋 Tips for best results:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>✓ Use good lighting (avoid shadows)</li>
            <li>✓ Focus on affected leaves/parts</li>
            <li>✓ Keep background simple</li>
            <li>✓ Capture multiple angles if possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
