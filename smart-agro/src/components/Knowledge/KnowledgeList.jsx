import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * KnowledgeList Component
 * Displays a searchable and filterable list of knowledge items with inline detail expansion
 */
const KnowledgeList = ({ items, title, onSelectItem, searchFields = [], renderDetailView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    return items.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      return searchFields.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.some(v => 
            String(v).toLowerCase().includes(searchStr)
          );
        }
        return String(value).toLowerCase().includes(searchStr);
      });
    });
  }, [searchTerm, items, searchFields]);

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search in this category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 font-medium">
        📊 Showing <span className="text-green-600 font-bold">{filteredItems.length}</span> of <span className="text-gray-700 font-bold">{items.length}</span> items
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-green-400 hover:shadow-md transition"
            >
              <button
                onClick={() => {
                  setExpandedId(expandedId === item.id ? null : item.id);
                  if (onSelectItem && expandedId !== item.id) {
                    onSelectItem(item);
                  }
                }}
                className="w-full p-4 hover:bg-green-50 flex items-center justify-between transition"
              >
                <div className="text-left flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">
                    {item.title || item.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description || ''}
                  </p>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition ${
                    expandedId === item.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 max-h-96 overflow-y-auto">
                  {renderDetailView && renderDetailView(item)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No results found for "{searchTerm}"</p>
            <p className="text-sm mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeList;
