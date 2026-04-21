import React from 'react';
import { X } from 'lucide-react';

/**
 * CropDetail Component
 * Specialized detail view for crop information
 */
const CropDetail = ({ crop, onClose }) => {
  if (!crop) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto border-2 border-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6 sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">🌾 {crop.title}</h2>
            <p className="text-green-100 text-sm leading-relaxed">{crop.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-green-100 hover:text-white transition hover:bg-green-700 p-2 rounded"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard label="🗓️ Season" value={crop.bestSeason} />
          <InfoCard label="🌍 Soil Type" value={crop.soilType} />
          <InfoCard label="🧪 NPK" value={crop.idealNPK} />
          <InfoCard label="💧 Water" value={crop.waterNeeds} />
          <InfoCard label="⏱️ Maturity" value={crop.daysToMaturity} />
          <InfoCard label="📊 Yield" value={crop.yieldPerHectare} />
          <InfoCard label="📏 Depth" value={crop.plantingDepth} />
          <InfoCard label="📐 Spacing" value={crop.spacing} />
        </div>

        {/* Pests & Diseases */}
        {(crop.commonPests || crop.diseases) && (
          <Section title="🐛 Pests & Diseases">
            {crop.commonPests && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Common Pests:</h4>
                <div className="flex flex-wrap gap-2">
                  {crop.commonPests.map((pest, idx) => (
                    <Badge key={idx} text={pest} />
                  ))}
                </div>
              </div>
            )}
            {crop.diseases && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Diseases:</h4>
                <div className="flex flex-wrap gap-2">
                  {crop.diseases.map((disease, idx) => (
                    <Badge key={idx} text={disease} color="red" />
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Fertilizer Schedule */}
        {crop.fertilizerSchedule && (
          <Section title="💧 Fertilizer Schedule">
            <p className="text-gray-700 leading-relaxed text-sm">{crop.fertilizerSchedule}</p>
          </Section>
        )}

        {/* Prevention Tips */}
        {crop.preventionTips && (
          <Section title="🛡️ Prevention Tips">
            <p className="text-gray-700 leading-relaxed text-sm">{crop.preventionTips}</p>
          </Section>
        )}

        {/* Harvesting & Storage */}
        <div className="grid grid-cols-2 gap-4">
          {crop.harvesting && (
            <Section title="🌾 Harvesting">
              <p className="text-gray-700 text-sm leading-relaxed">{crop.harvesting}</p>
            </Section>
          )}
          {crop.storageTemp && (
            <Section title="❄️ Storage">
              <p className="text-gray-700 text-sm leading-relaxed">{crop.storageTemp}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * InfoCard Sub-component
 */
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
  </div>
);

/**
 * Section Sub-component
 */
const Section = ({ title, children }) => (
  <div className="border-l-4 border-green-500 pl-4">
    <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);

/**
 * Badge Sub-component
 */
const Badge = ({ text, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[color]}`}>
      {text}
    </span>
  );
};

export default CropDetail;
