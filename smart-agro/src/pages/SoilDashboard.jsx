import { useState } from 'react';
import SoilForm from '../components/SoilForm';
import SoilReport from '../components/SoilReport';
import SoilHistory from '../components/SoilHistory';

/**
 * SoilDashboard Page
 * Main page combining soil form, analysis report, and test history
 */
export default function SoilDashboard({ compact = false }) {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze', 'history'
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [selectedFromHistory, setSelectedFromHistory] = useState(null);

  // Handle analysis completion
  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setSelectedFromHistory(null);
  };

  // Handle selecting a test from history
  const handleSelectFromHistory = (test) => {
    // Convert to display format
    const displayData = {
      ...test,
      n: test.n,
      p: test.p,
      k: test.k,
      ph: test.ph,
    };
    setSelectedFromHistory(displayData);
    setCurrentAnalysis(displayData);
  };

  // Handle error
  const handleError = (error) => {
    console.error('Error:', error);
  };

  // Compact mode for dashboard embedding
  if (compact) {
    return (
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === 'analyze'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            💡 New Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === 'history'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 History & Reports
          </button>
        </div>

        {/* Content Area - Single Column */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Panel */}
          <div className="w-full">
            {activeTab === 'analyze' ? (
              <SoilForm onAnalysisComplete={handleAnalysisComplete} onError={handleError} />
            ) : (
              <SoilHistory onSelectTest={handleSelectFromHistory} />
            )}
          </div>

          {/* Report Panel */}
          {currentAnalysis && (
            <div className="w-full bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-green-700 mb-4">
                {selectedFromHistory ? '📋 Previous Report' : '📈 Latest Results'}
              </h3>
              <SoilReport analysis={currentAnalysis} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full page mode
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Soil Health Analysis</h1>
          <p className="text-gray-700">
            Analyze your soil properties and get personalized recommendations for better crop health
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'analyze'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            💡 New Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'history'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 History & Reports
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2">
            {activeTab === 'analyze' ? (
              <SoilForm onAnalysisComplete={handleAnalysisComplete} onError={handleError} />
            ) : (
              <SoilHistory onSelectTest={handleSelectFromHistory} />
            )}
          </div>

          {/* Right Panel - Report */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                {currentAnalysis ? (
                  <>
                    <h3 className="text-lg font-bold text-green-700 mb-4">
                      {selectedFromHistory ? '📋 Previous Report' : '📈 Latest Results'}
                    </h3>
                    <SoilReport analysis={currentAnalysis} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🌱</div>
                    <p className="text-gray-600 font-medium">No Analysis Yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {activeTab === 'analyze'
                        ? 'Run a soil analysis to see results'
                        : 'Select a test from history'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🧪</div>
            <h4 className="font-semibold text-gray-800 mb-2">How It Works</h4>
            <p className="text-sm text-gray-600">
              Enter your soil test values or select your region to get automatic soil analysis with nutrient classification.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">💡</div>
            <h4 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h4>
            <p className="text-sm text-gray-600">
              Get farmer-friendly recommendations for fertilizer, organic matter, pH correction, and suitable crops.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-800 mb-2">Track Progress</h4>
            <p className="text-sm text-gray-600">
              Keep a history of all your soil tests and monitor soil health improvements over time.
            </p>
          </div>
        </div>

        {/* Educational Content */}
        <div className="bg-blue-50 rounded-lg p-6 mt-12 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📚 Understanding Soil Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Nitrogen (N)</h4>
              <p className="text-gray-700">
                Essential for leaf growth and plant vigor. Low nitrogen causes yellowing and stunted growth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Phosphorus (P)</h4>
              <p className="text-gray-700">
                Critical for root development, flowering, and seed production. Deficiency delays maturity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Potassium (K)</h4>
              <p className="text-gray-700">
                Improves disease resistance and fruit/grain quality. Low K reduces crop stress tolerance.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-gray-700 text-sm">
              <strong>💡 Tip:</strong> The soil health score (0-100) combines N, P, K, and pH status to give you an overall picture of your soil's fertility and suitability for cropping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
