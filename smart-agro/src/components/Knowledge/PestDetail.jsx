import React from 'react';
import { X } from 'lucide-react';

/**
 * PestDetail Component
 * Specialized detail view for pest and disease information
 */
const PestDetail = ({ pest, onClose }) => {
  if (!pest) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto border-2 border-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 text-white p-6 sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-1">🐛 {pest.name}</h2>
            <p className="text-red-100 text-sm italic">Scientific: {pest.scientificName}</p>
            {pest.description && (
              <p className="text-red-100 text-sm mt-2 leading-relaxed">{pest.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-red-100 hover:text-white transition hover:bg-red-700 p-2 rounded"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          {pest.season && (
            <InfoCard label="🗓️ Season" value={pest.season} />
          )}
          {pest.severity && (
            <InfoCard 
              label="⚠️ Severity" 
              value={pest.severity}
              highlight={pest.severity === 'High'}
            />
          )}
        </div>

        {/* Affected Crops */}
        {pest.affectedCrops && (
          <Section title="🌾 Affected Crops">
            <div className="flex flex-wrap gap-2">
              {pest.affectedCrops.map((crop, idx) => (
                <Badge key={idx} text={crop} />
              ))}
            </div>
          </Section>
        )}

        {/* Symptoms */}
        {pest.symptoms && (
          <Section title="⚠️ Symptoms">
            <p className="text-gray-700 leading-relaxed text-sm">{pest.symptoms}</p>
          </Section>
        )}

        {/* Organic Control */}
        {pest.organicControl && (
          <Section title="🌿 Organic Control Methods">
            <ul className="space-y-2">
              {pest.organicControl.map((method, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <span className="text-gray-700 text-sm">{method}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Chemical Control */}
        {pest.chemicalControl && (
          <Section title="💊 Chemical Control (Use with Caution)">
            <ul className="space-y-2">
              {pest.chemicalControl.map((method, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">→</span>
                  <span className="text-gray-700 text-sm">{method}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3 italic">
              Always follow label instructions and safety precautions
            </p>
          </Section>
        )}

        {/* Prevention Tips */}
        {pest.preventionTips && (
          <Section title="🛡️ Prevention & Management">
            <p className="text-gray-700 leading-relaxed text-sm">{pest.preventionTips}</p>
          </Section>
        )}
      </div>
    </div>
  );
};

/**
 * InfoCard Sub-component
 */
const InfoCard = ({ label, value, highlight = false }) => (
  <div className={`p-3 rounded ${highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
    <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
    <p className={`text-sm font-semibold mt-1 ${highlight ? 'text-red-800' : 'text-gray-800'}`}>
      {value}
    </p>
  </div>
);

/**
 * Section Sub-component
 */
const Section = ({ title, children }) => (
  <div className="border-l-4 border-red-500 pl-4">
    <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);

/**
 * Badge Sub-component
 */
const Badge = ({ text }) => (
  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
    {text}
  </span>
);

export default PestDetail;
