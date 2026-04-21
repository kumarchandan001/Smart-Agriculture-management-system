import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * DetailView Component
 * Displays detailed information about a knowledge item
 */
const DetailView = ({ item, onClose, renderContent }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!item) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{item.title || item.name}</h2>
            {item.description && (
              <p className="text-green-100 text-sm leading-relaxed">{item.description}</p>
            )}
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
      <div className="p-6 max-h-96 overflow-y-auto">
        {renderContent ? (
          renderContent(item, toggleSection, expandedSections)
        ) : (
          <DefaultDetailContent item={item} />
        )}
      </div>
    </div>
  );
};

/**
 * Default detail content renderer - Beautiful formatting without JSON
 */
const DefaultDetailContent = ({ item }) => {
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      // Convert object to readable format
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {Object.entries(item).map(([key, value]) => {
        if (key === 'id' || key === 'title' || key === 'name' || key === 'description' || key === '_category') {
          return null;
        }

        const displayKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/NPK/g, 'NPK')
          .trim()
          .replace(/^./, str => str.toUpperCase());

        if (Array.isArray(value) && value.length > 0) {
          return (
            <div key={key} className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-gray-800 text-sm mb-2">📌 {displayKey}</h4>
              <ul className="space-y-1">
                {value.map((v, idx) => (
                  <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{typeof v === 'object' ? JSON.stringify(v) : v}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-gray-800 text-sm mb-2">📊 {displayKey}</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(value).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-gray-700">
                    <span className="font-semibold text-gray-600">{k}:</span>
                    <span className="text-gray-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={key} className="border-b border-gray-200 py-3 flex justify-between items-start gap-4">
            <span className="font-semibold text-gray-700 text-sm">{displayKey}:</span>
            <span className="text-gray-600 text-sm text-right">{renderValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DetailView;
