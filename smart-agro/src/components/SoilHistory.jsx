import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Loader } from 'lucide-react';
import { getSoilHistory } from '../api/soilAPI';

/**
 * SoilHistory Component
 * Displays paginated list of user's previous soil tests
 */
export default function SoilHistory({ onSelectTest }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch soil history on mount and when page/pageSize changes
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getSoilHistory(currentPage, pageSize);

        if (result.success) {
          setHistory(result.data);
          setTotalPages(result.pagination.pages);
        } else {
          setError(result.error || 'Failed to fetch history');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch soil history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, pageSize]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get score color
  const getScoreClass = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    const colors = {
      Low: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-green-100 text-green-800',
      Acidic: 'bg-red-100 text-red-800',
      Neutral: 'bg-green-100 text-green-800',
      Alkaline: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Empty state
  if (loading && history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
        <p className="text-gray-600">Loading soil history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">No soil tests yet</p>
        <p className="text-sm text-gray-500">Run your first soil analysis to start tracking history</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold text-green-700 flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6" />
          Soil Test History
        </h3>

        {/* Page Size Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tests per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {history.map((test) => (
          <div key={test._id} className="hover:bg-gray-50 transition">
            {/* Row */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === test._id ? null : test._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    {/* Date */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(test.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {test.analysisMode === 'region' ? '📍 Region' : '🔬 Manual'}
                        {test.region && ` - ${test.region.state}, ${test.region.district}`}
                      </p>
                    </div>

                    {/* Score */}
                    <div className={`${getScoreClass(test.soilHealthScore)} px-4 py-2 rounded-lg text-center min-w-20`}>
                      <p className="text-sm font-bold">{test.soilHealthScore}</p>
                      <p className="text-xs">Score</p>
                    </div>

                    {/* Classification */}
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      <span className={`${getStatusBadgeClass(test.classification.nStatus)} text-xs px-2 py-1 rounded`}>
                        N: {test.classification.nStatus}
                      </span>
                      <span className={`${getStatusBadgeClass(test.classification.pStatus)} text-xs px-2 py-1 rounded`}>
                        P: {test.classification.pStatus}
                      </span>
                      <span className={`${getStatusBadgeClass(test.classification.kStatus)} text-xs px-2 py-1 rounded`}>
                        K: {test.classification.kStatus}
                      </span>
                      <span className={`${getStatusBadgeClass(test.classification.phStatus)} text-xs px-2 py-1 rounded`}>
                        pH: {test.classification.phStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition transform ${expandedId === test._id ? 'rotate-90' : ''}`}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === test._id && (
              <div className="bg-gray-50 p-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Nitrogen</p>
                    <p className="text-lg font-bold text-gray-900">{test.n} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Phosphorus</p>
                    <p className="text-lg font-bold text-gray-900">{test.p} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Potassium</p>
                    <p className="text-lg font-bold text-gray-900">{test.k} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">pH</p>
                    <p className="text-lg font-bold text-gray-900">{test.ph.toFixed(1)}</p>
                  </div>
                </div>

                {/* Suitable Crops */}
                {test.recommendations.suitableCrops && test.recommendations.suitableCrops.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Suitable Crops</p>
                    <div className="flex flex-wrap gap-1">
                      {test.recommendations.suitableCrops.slice(0, 5).map((crop, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {crop}
                        </span>
                      ))}
                      {test.recommendations.suitableCrops.length > 5 && (
                        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                          +{test.recommendations.suitableCrops.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {onSelectTest && (
                  <button
                    onClick={() => onSelectTest(test)}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded transition flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View Full Report
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
