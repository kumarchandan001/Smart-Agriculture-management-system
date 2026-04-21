import { Droplet, Leaf, Wind, Zap, TrendingUp, CheckCircle } from 'lucide-react';

/**
 * SoilReport Component
 * Displays comprehensive soil analysis results with farmer-friendly recommendations
 */
export default function SoilReport({ analysis }) {
  if (!analysis) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">Run an analysis to see results here</p>
      </div>
    );
  }

  const { classification, soilHealthScore, recommendations, analysisMode, n, p, k, ph } = analysis;

  // Helper function for status color
  const getStatusColor = (status) => {
    const colors = {
      Low: 'bg-red-100 text-red-800 border-red-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      High: 'bg-green-100 text-green-800 border-green-300',
      Acidic: 'bg-red-100 text-red-800 border-red-300',
      Neutral: 'bg-green-100 text-green-800 border-green-300',
      Alkaline: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Helper for health score color and interpretation
  const getScoreInterpretation = (score) => {
    if (score >= 80) return { color: 'text-green-700', bg: 'bg-green-100', text: 'Excellent' };
    if (score >= 60) return { color: 'text-yellow-700', bg: 'bg-yellow-100', text: 'Good' };
    if (score >= 40) return { color: 'text-orange-700', bg: 'bg-orange-100', text: 'Fair' };
    return { color: 'text-red-700', bg: 'bg-red-100', text: 'Poor' };
  };

  const scoreInterpretation = getScoreInterpretation(soilHealthScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Soil Analysis Report</h2>
        <p className="text-green-100">
          {analysisMode === 'region' ? '📍 Region-based Analysis' : '🔬 Manual Test Analysis'}
        </p>
        <p className="text-green-100 text-sm">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Soil Health Score */}
      <div className={`${scoreInterpretation.bg} rounded-lg p-6 border-2 ${scoreInterpretation.color.replace('text', 'border')}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Overall Soil Health Score</p>
            <p className={`${scoreInterpretation.color} text-5xl font-bold`}>{soilHealthScore}</p>
            <p className={`${scoreInterpretation.color} font-semibold mt-2`}>{scoreInterpretation.text}</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                stroke={scoreInterpretation.color.split('-')[1]}
                strokeDasharray={`${(soilHealthScore / 100) * 282.7} 282.7`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {soilHealthScore}%
            </div>
          </div>
        </div>
      </div>

      {/* NPK Classification Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Nitrogen */}
        <div className={`${getStatusColor(classification.nStatus)} rounded-lg p-4 border`}>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5" />
            <p className="font-semibold text-sm">Nitrogen (N)</p>
          </div>
          <p className="text-2xl font-bold">{n} mg/kg</p>
          <p className="text-sm font-semibold mt-1">{classification.nStatus}</p>
          <p className="text-xs mt-2 opacity-75">
            {classification.nStatus === 'Low' && 'Critical: Plant growth stunted'}
            {classification.nStatus === 'Medium' && 'Adequate for most crops'}
            {classification.nStatus === 'High' && 'Excessive: Risk of disease'}
          </p>
        </div>

        {/* Phosphorus */}
        <div className={`${getStatusColor(classification.pStatus)} rounded-lg p-4 border`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <p className="font-semibold text-sm">Phosphorus (P)</p>
          </div>
          <p className="text-2xl font-bold">{p} mg/kg</p>
          <p className="text-sm font-semibold mt-1">{classification.pStatus}</p>
          <p className="text-xs mt-2 opacity-75">
            {classification.pStatus === 'Low' && 'Poor root development'}
            {classification.pStatus === 'Medium' && 'Good root & flower growth'}
            {classification.pStatus === 'High' && 'May lock other nutrients'}
          </p>
        </div>

        {/* Potassium */}
        <div className={`${getStatusColor(classification.kStatus)} rounded-lg p-4 border`}>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5" />
            <p className="font-semibold text-sm">Potassium (K)</p>
          </div>
          <p className="text-2xl font-bold">{k} mg/kg</p>
          <p className="text-sm font-semibold mt-1">{classification.kStatus}</p>
          <p className="text-xs mt-2 opacity-75">
            {classification.kStatus === 'Low' && 'Weak disease resistance'}
            {classification.kStatus === 'Medium' && 'Strong plant immunity'}
            {classification.kStatus === 'High' && 'Excellent crop quality'}
          </p>
        </div>

        {/* pH */}
        <div className={`${getStatusColor(classification.phStatus)} rounded-lg p-4 border`}>
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5" />
            <p className="font-semibold text-sm">Soil pH</p>
          </div>
          <p className="text-2xl font-bold">{ph.toFixed(1)}</p>
          <p className="text-sm font-semibold mt-1">{classification.phStatus}</p>
          <p className="text-xs mt-2 opacity-75">
            {classification.phStatus === 'Acidic' && 'Add lime to neutralize'}
            {classification.phStatus === 'Neutral' && 'Ideal for most crops'}
            {classification.phStatus === 'Alkaline' && 'Iron deficiency risk'}
          </p>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Farmer-Friendly Recommendations
        </h3>

        {/* Organic Matter */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Organic Matter Improvement
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">{recommendations.organic}</p>
        </div>

        {/* Fertilizer */}
        <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
          <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Fertilizer Recommendations
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">{recommendations.fertilizer}</p>
        </div>

        {/* pH Correction */}
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            pH Correction Strategy
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">{recommendations.phFix}</p>
        </div>

        {/* Suitable Crops */}
        {recommendations.suitableCrops && recommendations.suitableCrops.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Suitable Crops for Your Soil
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendations.suitableCrops.map((crop, idx) => (
                <span key={idx} className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-medium">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Crop Rotation */}
        <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
          <p className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Crop Rotation Tips
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">{recommendations.rotationTips}</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-semibold mb-1">📋 Important Note:</p>
        <p>
          These recommendations are based on general agricultural standards. For precise recommendations, consult your local agriculture extension officer or soil testing laboratory.
        </p>
      </div>
    </div>
  );
}
