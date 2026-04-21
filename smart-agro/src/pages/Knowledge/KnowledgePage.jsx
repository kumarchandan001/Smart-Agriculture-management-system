import React, { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle, X } from 'lucide-react';
import { KnowledgeCard, KnowledgeList, CropDetail, PestDetail, DetailView } from '../../components/Knowledge';

/**
 * Knowledge Hub Page
 * Main page for accessing all agricultural knowledge resources
 */
const KnowledgePage = () => {
  // State Management
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // API Base URL
  const API_BASE = 'http://localhost:5000/api/knowledge';

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Fetch all knowledge categories
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle category selection
   */
  const handleCategorySelect = async (category) => {
    try {
      setSelectedCategory(category);
      setSelectedItem(null);
      setSearchQuery('');
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/${category.id}`);
      const data = await response.json();

      if (data.success) {
        setCategoryData(data.data);
      } else {
        setError('Failed to load category data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle global search across all categories
   */
  const handleGlobalSearch = async () => {
    if (!globalSearch.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(globalSearch)}`
      );
      const data = await response.json();

      if (data.success) {
        // Flatten results into a single array
        const flatResults = [];
        Object.entries(data.results).forEach(([category, items]) => {
          items.forEach(item => {
            flatResults.push({
              ...item,
              _category: category
            });
          });
        });

        setCategoryData(flatResults);
        setSelectedCategory({
          name: `Search Results for "${globalSearch}"`,
          id: 'search'
        });
      } else {
        setError('Search failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get search fields based on category
   */
  const getSearchFields = (category) => {
    const searchFieldsMap = {
      crops: ['title', 'description', 'commonPests', 'diseases', 'soilType'],
      soil: ['title', 'description', 'parameters', 'methods', 'types'],
      pests: ['name', 'scientificName', 'description', 'affectedCrops', 'symptoms'],
      fertilizers: ['name', 'description', 'sources', 'function'],
      weather: ['title', 'description', 'tips', 'crops'],
      market: ['title', 'description', 'tips', 'platforms', 'products'],
      schemes: ['name', 'description', 'eligibility', 'benefits']
    };
    return searchFieldsMap[category] || [];
  };

  /**
   * Render detail view based on category type
   */
  const renderDetailView = (item) => {
    if (!selectedCategory) return null;

    switch (selectedCategory.id) {
      case 'crops':
        return (
          <CropDetail
            crop={item}
            onClose={() => setSelectedItem(null)}
          />
        );
      case 'pests':
        return (
          <PestDetail
            pest={item}
            onClose={() => setSelectedItem(null)}
          />
        );
      default:
        return (
          <DetailView
            item={item}
            onClose={() => setSelectedItem(null)}
          />
        );
    }
  };

  // Main view: Show categories
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-linear-to-r from-green-700 via-emerald-600 to-teal-600 text-white p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl animate-bounce">📚</div>
              <div>
                <h1 className="text-4xl font-bold">Agricultural Knowledge Hub</h1>
                <p className="text-green-100 text-lg mt-1">Comprehensive guides, tips & best practices for modern farming</p>
              </div>
            </div>
            <p className="text-green-50 text-lg mb-6 max-w-2xl">
              Access comprehensive guides on crop farming, pest management, soil health, fertilizers, weather patterns, market trends, and government schemes
            </p>

            {/* Global Search Bar */}
            <div className="flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-green-200" size={20} />
                <input
                  type="text"
                  placeholder="Search crops, pests, soil, fertilizers..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-500"
                />
                {globalSearch && (
                  <button
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <button
                onClick={handleGlobalSearch}
                className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-6xl mx-auto m-6 p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 shadow-sm">
            <AlertCircle size={24} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Failed to load</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <Loader className="animate-spin mx-auto mb-6 text-green-600" size={48} />
              <p className="text-gray-600 text-lg font-medium">Loading knowledge categories...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the data</p>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-600 mb-10 text-lg">Select any category to explore detailed information and recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(category => (
                <KnowledgeCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategorySelect(category)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && !error && (
          <div className="flex justify-center items-center py-32">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg font-medium">No categories available</p>
              <p className="text-gray-400 text-sm mt-2">The knowledge base is being prepared</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Item detail view: Show item details expanded below in the list
  // Removed - now handled inline in KnowledgeList component

  // Category view: Show selected category with list
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="bg-linear-to-r from-green-600 via-green-500 to-emerald-600 text-white p-8 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setCategoryData([]);
              setSelectedItem(null);
              setGlobalSearch('');
            }}
            className="mb-4 text-green-100 hover:text-white font-semibold flex items-center gap-2 transition"
          >
            ← Back to Categories
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl">
              {selectedCategory.id === 'crops' && '🌾'}
              {selectedCategory.id === 'soil' && '🌱'}
              {selectedCategory.id === 'pests' && '🐛'}
              {selectedCategory.id === 'fertilizers' && '💧'}
              {selectedCategory.id === 'weather' && '⛅'}
              {selectedCategory.id === 'market' && '📊'}
              {selectedCategory.id === 'schemes' && '📋'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{selectedCategory.name}</h1>
              <p className="text-green-100 text-sm">{categoryData.length} items available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="w-full">
          {/* List View - Full Width with Inline Detail Expansion */}
          {loading ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-4 text-green-600" size={40} />
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : (
            <KnowledgeList
              items={categoryData}
              title={selectedCategory.name}
              onSelectItem={setSelectedItem}
              searchFields={getSearchFields(selectedCategory.id)}
              renderDetailView={renderDetailView}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
