import { useState, useEffect } from 'react';
import { getPestRecords } from '../api/pestAPI';
import { ChevronDown, ChevronUp, Loader, AlertCircle, Trash2 } from 'lucide-react';

export default function PestList({ filters = {} }) {
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPests();
  }, [currentPage, pageSize, filters]);

  const fetchPests = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getPestRecords(currentPage, pageSize, filters);

      if (result.success) {
        setPests(result.data);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch pests');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pests');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
        <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading pest records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (pests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-8">
        <div className="text-4xl mb-3">🐛</div>
        <p className="text-gray-600 font-medium">No pest records found</p>
        <p className="text-gray-500 text-sm mt-2">Start by detecting a pest</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table View (Desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Crop</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Pest</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Severity</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Cost</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {pests.map((pest) => (
              <tbody key={pest._id}>
                <tr
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === pest._id ? null : pest._id)}
                >
                  <td className="px-4 py-3 text-sm">{formatDate(pest.dateObserved)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{pest.crop}</td>
                  <td className="px-4 py-3 text-sm">{pest.pestName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(pest.severity)}`}>
                      {pest.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{pest.cost?.total || 0}</td>
                  <td className="px-4 py-3 text-center">
                    {pest.resolved ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                        ⏳ Active
                      </span>
                    )}
                  </td>
                </tr>

                {/* Expanded Details */}
                {expandedId === pest._id && (
                  <tr className="bg-blue-50">
                    <td colSpan="6" className="px-4 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">Affected Area</p>
                          <p className="font-semibold text-gray-800">{pest.affectedArea}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">Detection Method</p>
                          <p className="font-semibold text-gray-800 capitalize">
                            {pest.detectionMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">Treatment Applied</p>
                          <p className="font-semibold text-gray-800">
                            {pest.treatmentApplied?.date
                              ? formatDate(pest.treatmentApplied.date)
                              : 'Not yet'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">Cost Breakdown</p>
                          <p className="text-xs text-gray-600">
                            Treatment: ₹{pest.cost?.treatment || 0}
                            <br />
                            Labor: ₹{pest.cost?.labor || 0}
                            <br />
                            Equipment: ₹{pest.cost?.equipment || 0}
                          </p>
                        </div>
                      </div>

                      {pest.symptoms && pest.symptoms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-gray-600 text-xs font-semibold mb-1">Symptoms</p>
                          <div className="flex flex-wrap gap-1">
                            {pest.symptoms.map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {pest.notes && (
                        <div className="mt-2 p-2 bg-white rounded text-xs">
                          <p className="text-gray-600 font-semibold">Notes:</p>
                          <p className="text-gray-700">{pest.notes}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {pests.map((pest) => (
          <div key={pest._id} className="bg-white rounded-lg shadow-md p-4">
            <div
              className="cursor-pointer"
              onClick={() => setExpandedId(expandedId === pest._id ? null : pest._id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{pest.pestName}</p>
                  <p className="text-sm text-gray-600">{pest.crop}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(pest.severity)}`}>
                  {pest.severity}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-600">{formatDate(pest.dateObserved)}</p>
                <span className="font-semibold text-green-600">₹{pest.cost?.total || 0}</span>
              </div>
            </div>

            {expandedId === pest._id && (
              <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">Affected</p>
                    <p className="font-semibold">{pest.affectedArea}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">Detection</p>
                    <p className="font-semibold capitalize">{pest.detectionMethod}</p>
                  </div>
                </div>

                {pest.symptoms && pest.symptoms.length > 0 && (
                  <div>
                    <p className="text-gray-600 text-xs font-semibold mb-1">Symptoms</p>
                    <div className="flex flex-wrap gap-1">
                      {pest.symptoms.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
