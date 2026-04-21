import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export default function Knowledge(){
  const navigate = useNavigate();

  const handleNavigateToHub = () => {
    navigate('/knowledge');
  };

  return (
    <div className="w-full p-8">
      {/* Hero Card */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">Knowledge Hub</h2>
                <p className="text-indigo-100 text-sm mt-1">Complete agricultural resource center</p>
              </div>
            </div>
            <Sparkles size={32} className="text-yellow-300 animate-pulse" />
          </div>

          <p className="text-lg text-indigo-50 mb-8 max-w-lg leading-relaxed">
            Access comprehensive guides, expert tips, and best practices for modern farming. Explore 7 categories with 35+ resources curated just for you.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">📚 7 Categories</div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">💡 35+ Resources</div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">⚡ Always Updated</div>
          </div>

          <button
            onClick={handleNavigateToHub}
            className="inline-flex items-center gap-3 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
          >
            <span>Explore Full Hub</span>
            <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all">
          <div className="text-3xl mb-3">🌾</div>
          <h3 className="font-bold text-gray-900 mb-2">Crop Knowledge</h3>
          <p className="text-sm text-gray-600 mb-4">Comprehensive guides for all major crops with best practices.</p>
          <button
            onClick={handleNavigateToHub}
            className="text-green-600 font-semibold text-sm hover:text-green-700 flex items-center gap-2"
          >
            Learn more <ChevronRight size={16} />
          </button>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all">
          <div className="text-3xl mb-3">💧</div>
          <h3 className="font-bold text-gray-900 mb-2">Fertilizer Guide</h3>
          <p className="text-sm text-gray-600 mb-4">NPK recommendations and organic fertilizer options.</p>
          <button
            onClick={handleNavigateToHub}
            className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-2"
          >
            Learn more <ChevronRight size={16} />
          </button>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all">
          <div className="text-3xl mb-3">🌱</div>
          <h3 className="font-bold text-gray-900 mb-2">Soil Health</h3>
          <p className="text-sm text-gray-600 mb-4">Soil testing guides and improvement strategies.</p>
          <button
            onClick={handleNavigateToHub}
            className="text-amber-600 font-semibold text-sm hover:text-amber-700 flex items-center gap-2"
          >
            Learn more <ChevronRight size={16} />
          </button>
        </div>

        <div className="bg-linear-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all">
          <div className="text-3xl mb-3">🐛</div>
          <h3 className="font-bold text-gray-900 mb-2">Pest Management</h3>
          <p className="text-sm text-gray-600 mb-4">Organic and chemical pest control solutions.</p>
          <button
            onClick={handleNavigateToHub}
            className="text-red-600 font-semibold text-sm hover:text-red-700 flex items-center gap-2"
          >
            Learn more <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
