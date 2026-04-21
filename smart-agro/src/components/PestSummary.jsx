import { useState, useEffect } from 'react';
import { getPestSummary, getCropSummary, getSeasonalSummary } from '../api/pestAPI';
import { Loader, AlertCircle, BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';

// Simple Chart Component (without Recharts to avoid dependency)
function SimpleBarChart({ data, dataKey, labelKey, height = 200 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d[dataKey]));
  const scale = height / maxValue;

  return (
    <div className="flex items-end justify-center gap-2" style={{ height: `${height}px` }}>
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-green-600 rounded-t hover:bg-green-700 transition"
            style={{ height: `${item[dataKey] * scale}px` }}
            title={`${item[labelKey]}: ${item[dataKey]}`}
          ></div>
          <p className="text-xs text-gray-700 mt-2 text-center truncate w-full">{item[labelKey]}</p>
        </div>
      ))}
    </div>
  );
}

export default function PestSummary() {
  const [pestSummary, setPestSummary] = useState(null);
  const [cropSummary, setCropSummary] = useState(null);
  const [seasonalSummary, setSeasonalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    setError('');

    try {
      const [pests, crops, seasonal] = await Promise.all([
        getPestSummary(),
        getCropSummary(),
        getSeasonalSummary(),
      ]);

      if (pests.success) setPestSummary(pests.data);
      if (crops.success) setCropSummary(crops.data);
      if (seasonal.success) setSeasonalSummary(seasonal.data);

      if (!pests.success || !crops.success || !seasonal.success) {
        setError('Failed to load some summaries');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
        <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading summaries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-3 text-yellow-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90">Most Frequent Pest</p>
              <p className="text-3xl font-bold">
                {pestSummary && pestSummary.length > 0
                  ? pestSummary[0].pestName
                  : 'N/A'}
              </p>
              {pestSummary && pestSummary.length > 0 && (
                <p className="text-sm opacity-90 mt-1">
                  Recorded {pestSummary[0].count} times
                </p>
              )}
            </div>
            <Target className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90">Total Cost</p>
              <p className="text-3xl font-bold">
                ₹
                {pestSummary && pestSummary.length > 0
                  ? pestSummary.reduce((sum, p) => sum + (p.totalCost || 0), 0).toLocaleString('en-IN')
                  : '0'}
              </p>
              <p className="text-sm opacity-90 mt-1">Pest management expenses</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90">Resolution Rate</p>
              <p className="text-3xl font-bold">
                {pestSummary && pestSummary.length > 0
                  ? Math.round(
                      (pestSummary.reduce((sum, p) => sum + (p.resolved || 0), 0) /
                        pestSummary.reduce((sum, p) => sum + p.count, 0)) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm opacity-90 mt-1">Successfully managed</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Pest Summary Chart */}
      {pestSummary && pestSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            Pest Frequency
          </h3>

          <SimpleBarChart
            data={pestSummary.slice(0, 8)}
            dataKey="count"
            labelKey="pestName"
            height={250}
          />

          {/* Detailed Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Pest</th>
                  <th className="text-right px-4 py-2 font-semibold">Occurrences</th>
                  <th className="text-right px-4 py-2 font-semibold">Total Cost</th>
                  <th className="text-right px-4 py-2 font-semibold">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {pestSummary.map((pest, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{pest.pestName}</td>
                    <td className="text-right px-4 py-2">{pest.count}</td>
                    <td className="text-right px-4 py-2 font-semibold text-green-600">
                      ₹{pest.totalCost?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="text-right px-4 py-2">{pest.resolved || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Crop Summary */}
      {cropSummary && cropSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pest Impact by Crop</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cropSummary.map((crop, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <p className="font-semibold text-gray-800 text-lg capitalize">{crop.crop}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">
                    Pest Incidents: <span className="font-bold text-gray-800">{crop.pestCount}</span>
                  </p>
                  <p className="text-gray-600">
                    Total Cost: <span className="font-bold text-green-600">₹{crop.totalCost}</span>
                  </p>
                  <p className="text-gray-600">
                    Unique Pests: <span className="font-bold text-gray-800">{crop.uniquePests.length}</span>
                  </p>
                </div>
                {crop.uniquePests.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {crop.uniquePests.slice(0, 3).map((pest, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pest}
                      </span>
                    ))}
                    {crop.uniquePests.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        +{crop.uniquePests.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Summary */}
      {seasonalSummary && seasonalSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Seasonal Trends</h3>

          <SimpleBarChart
            data={seasonalSummary}
            dataKey="count"
            labelKey="month"
            height={200}
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalSummary.map((season, idx) => (
              <div key={idx} className="p-4 bg-linear-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <p className="font-semibold text-gray-800">{season.month}</p>
                <div className="mt-2 text-sm space-y-1">
                  <p className="text-gray-700">
                    Incidents: <span className="font-bold">{season.count}</span>
                  </p>
                  <p className="text-gray-700">
                    Cost: <span className="font-bold text-green-600">₹{season.totalCost}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!pestSummary || pestSummary.length === 0) &&
        (!cropSummary || cropSummary.length === 0) &&
        (!seasonalSummary || seasonalSummary.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-600 font-medium">No data available yet</p>
            <p className="text-gray-500 text-sm">Record pest incidents to see summaries</p>
          </div>
        )}
    </div>
  );
}
