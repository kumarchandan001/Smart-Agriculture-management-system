/**
 * Expense Summary Component
 * Analytics dashboard with charts and KPIs
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { expenseAPI } from '../api/expenseAPI';

export default function ExpenseSummary() {
  const [categoryData, setCategoryData] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSummaries();
  }, [dateRange]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError('');

      const [catRes, cropRes, timeRes] = await Promise.all([
        expenseAPI.summaryByCategory(dateRange.from, dateRange.to),
        expenseAPI.summaryByCrop(dateRange.from, dateRange.to),
        expenseAPI.timeserieSummary(dateRange.from, dateRange.to)
      ]);

      setCategoryData(catRes.data.data || []);
      setCropData(cropRes.data.data || []);
      setTimeseriesData(timeRes.data.data || []);
    } catch (err) {
      // Don't show error for 401 - user just needs to login
      if (err.response?.status !== 401) {
        setError('Failed to load summaries');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const totalSpent = categoryData.reduce((sum, item) => sum + item.total, 0);
  const topCategory = categoryData[0];
  const avgMonthly = timeseriesData.length > 0
    ? (timeseriesData.reduce((sum, item) => sum + item.total, 0) / timeseriesData.length).toFixed(2)
    : 0;

  // Colors for charts
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const getCategoryColor = (index) => colors[index % colors.length];

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Expense Summary</h2>
        <div className="flex gap-3">
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-blue-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-600 mt-2">{categoryData.reduce((sum, item) => sum + item.count, 0)} transactions</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border-l-4 border-green-600">
          <p className="text-gray-600 text-sm mb-2">Average Monthly</p>
          <p className="text-3xl font-bold text-green-900">₹{avgMonthly}</p>
          <p className="text-xs text-gray-600 mt-2">Based on {timeseriesData.length} months</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm mb-2">Top Category</p>
          <p className="text-3xl font-bold text-purple-900">
            {topCategory ? topCategory.category : 'N/A'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            ₹{topCategory ? topCategory.total.toLocaleString('en-IN') : 0}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Charts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading summaries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((item, idx) => {
                  const percentage = (item.total / totalSpent) * 100;
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          ₹{item.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(idx)
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                        <span>{item.count} items</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No category data available</p>
            )}
          </div>

          {/* Crop Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Crop</h3>
            {cropData.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cropData.map((item, idx) => {
                  const percentage = (item.total / totalSpent) * 100;
                  return (
                    <div key={item.crop}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item.crop ? item.crop.charAt(0).toUpperCase() + item.crop.slice(1) : 'Unspecified'}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          ₹{item.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(idx)
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                        <span>{item.count} items</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No crop data available</p>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Trend
            </h3>
            {timeseriesData.length > 0 ? (
              <div className="space-y-3">
                {timeseriesData.map((item, idx) => {
                  const maxAmount = Math.max(...timeseriesData.map(d => d.total));
                  const percentage = (item.total / maxAmount) * 100;
                  return (
                    <div key={item.month}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.month}</span>
                        <span className="text-sm font-bold text-gray-800">
                          ₹{item.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No monthly data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
