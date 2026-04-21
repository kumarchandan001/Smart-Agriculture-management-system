import { useState } from 'react';
import PestSymptomForm from '../components/PestSymptomForm';
import PestImageDetect from '../components/PestImageDetect';
import PestRecordForm from '../components/PestRecordForm';
import PestList from '../components/PestList';
import PestSummary from '../components/PestSummary';

export default function PestDashboard({ compact = false }) {
  const [activeTab, setActiveTab] = useState('detect'); // detect, records, summary
  const [detectionResult, setDetectionResult] = useState(null);
  const [detectionMode, setDetectionMode] = useState('symptoms'); // symptoms, image
  const [recordSaved, setRecordSaved] = useState(false);

  const handleDetectionComplete = (result) => {
    setDetectionResult(result);
  };

  const handleRecordSaved = (record) => {
    setRecordSaved(true);
    setTimeout(() => {
      setRecordSaved(false);
      setActiveTab('records');
      setDetectionResult(null);
      setDetectionMode('symptoms');
    }, 2000);
  };

  return (
    <div className={compact ? '' : 'min-h-screen bg-linear-to-b from-green-50 to-emerald-50 py-8'}>
      <div className={compact ? '' : 'max-w-7xl mx-auto px-4'}>
        {/* Page Header - Hide in compact mode */}
        {!compact && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">🐛 Pest & Disease Management</h1>
            <p className="text-gray-700">
              Detect pests, record incidents, and track management strategies
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`flex flex-wrap gap-2 ${compact ? 'mb-4' : 'mb-8'}`}>
          <button
            onClick={() => setActiveTab('detect')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'detect'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔍 Detect
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'records'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 Records
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'summary'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 Summary
          </button>
        </div>

        {/* Content */}
        <div className={compact ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
          {/* Main Content */}
          <div className={compact ? '' : 'lg:col-span-2'}>
            {/* Detect Tab */}
            {activeTab === 'detect' && (
              <div className="space-y-6">
                {/* Detection Mode Selector */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Detection Method</h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDetectionMode('symptoms')}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                        detectionMode === 'symptoms'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📋 Symptom-Based
                    </button>
                    <button
                      onClick={() => setDetectionMode('image')}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                        detectionMode === 'image'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📸 Image Upload
                    </button>
                  </div>
                </div>

                {/* Detection Forms */}
                {detectionMode === 'symptoms' ? (
                  <PestSymptomForm onDetectionComplete={handleDetectionComplete} />
                ) : (
                  <PestImageDetect onDetectionComplete={handleDetectionComplete} />
                )}

                {/* Detection Results + Record Form */}
                {detectionResult && (
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-4">✓ Detection Complete</h3>
                    <PestRecordForm
                      detectionResult={detectionResult}
                      onSaveComplete={handleRecordSaved}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Records Tab */}
            {activeTab === 'records' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Pest Records</h2>
                <PestList />
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Summary</h2>
                <PestSummary />
              </div>
            )}
          </div>

          {/* Right Sidebar - Tips & Info - Hide in compact mode */}
          {!compact && (
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Quick Tips */}
              <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Describe symptoms accurately</li>
                  <li>✓ Upload clear leaf photos</li>
                  <li>✓ Record all treatments applied</li>
                  <li>✓ Track costs for ROI analysis</li>
                  <li>✓ Monitor seasonal patterns</li>
                </ul>
              </div>

              {/* Severity Levels */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-800 mb-3">Severity Levels</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Low - Minor damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">Medium - Notable damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">High - Significant damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-700">Critical - Severe damage</span>
                  </div>
                </div>
              </div>

              {/* Common Pests */}
              <div className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3">🐛 Common Pests</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Early Blight</li>
                  <li>• Powdery Mildew</li>
                  <li>• Fruit Fly</li>
                  <li>• Spotted Bollworm</li>
                  <li>• Leaf Rust</li>
                  <li>• Stem Borer</li>
                </ul>
              </div>

              {/* Safety Guidelines */}
              <div className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
                <h3 className="font-bold text-red-900 mb-3">⚠️ Safety First</h3>
                <ul className="text-xs text-red-800 space-y-1">
                  <li>✓ Always wear PPE</li>
                  <li>✓ Follow label instructions</li>
                  <li>✓ Respect PHI (Pre-harvest Interval)</li>
                  <li>✓ Store chemicals safely</li>
                  <li>✓ Consult experts for new pests</li>
                </ul>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 rounded-lg shadow-md p-6 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">📚 About This Tool</h3>
                <p className="text-sm text-green-800">
                  This tool helps you identify pests, record management activities, and analyze trends
                  to improve your farm's health and profitability.
                </p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Footer Info - Hide in compact mode */}
        {!compact && (
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-3">🌾 Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Prevention</p>
              <ul className="text-gray-700 space-y-1">
                <li>• Crop rotation</li>
                <li>• Field sanitation</li>
                <li>• Resistant varieties</li>
                <li>• Regular monitoring</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Cultural Control</p>
              <ul className="text-gray-700 space-y-1">
                <li>• Pruning & thinning</li>
                <li>• Proper spacing</li>
                <li>• Irrigation management</li>
                <li>• Weed control</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Chemical Treatment</p>
              <ul className="text-gray-700 space-y-1">
                <li>• Use recommended products</li>
                <li>• Rotate chemicals</li>
                <li>• Correct dosage</li>
                <li>• Timing matters</li>
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
