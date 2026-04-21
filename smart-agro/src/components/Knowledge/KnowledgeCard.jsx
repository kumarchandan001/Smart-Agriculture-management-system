import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * KnowledgeCard Component
 * Displays individual knowledge category cards with beautiful gradients
 */
const KnowledgeCard = ({ category, onClick }) => {
  const iconMap = {
    crops: '🌾',
    soil: '🌱',
    pests: '🐛',
    fertilizers: '💧',
    weather: '⛅',
    market: '📊',
    schemes: '📋'
  };

  // Beautiful gradient colors for each category
  const gradientMap = {
    crops: 'from-green-500 via-emerald-500 to-teal-600',
    soil: 'from-amber-500 via-orange-500 to-yellow-600',
    pests: 'from-red-500 via-pink-500 to-purple-600',
    fertilizers: 'from-blue-500 via-cyan-500 to-teal-600',
    weather: 'from-sky-400 via-blue-400 to-indigo-600',
    market: 'from-indigo-600 via-purple-500 to-pink-500',
    schemes: 'from-violet-600 via-purple-500 to-indigo-600'
  };

  const gradient = gradientMap[category.id] || 'from-gray-500 to-gray-700';

  return (
    <div
      onClick={onClick}
      className={`bg-linear-to-br ${gradient} rounded-2xl shadow-lg hover:shadow-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-3 group overflow-hidden relative`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{iconMap[category.id] || '📚'}</div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-white transition">{category.name}</h3>
        <p className="text-sm leading-relaxed opacity-90 mb-6 line-clamp-2">{category.description}</p>
        <div className="flex items-center gap-2 text-xs opacity-85 group-hover:opacity-100 transition font-semibold">
          <span>Explore</span>
          <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCard;
