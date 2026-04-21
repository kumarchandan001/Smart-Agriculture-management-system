/**
 * Expense List Component
 * Display expenses in list/table format with filters and pagination
 */

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Download, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { expenseAPI } from '../api/expenseAPI';

const categories = ['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'];

export default function ExpenseList({
  onEdit = () => {},
  crops = [],
  refreshTrigger = 0
}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    crop: '',
    page: 1,
    limit: 10,
    sort: '-date'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });

  const [showFilters, setShowFilters] = useState(false);

  // Load expenses on mount and when filters/refresh change
  useEffect(() => {
    fetchExpenses();
  }, [filters, refreshTrigger]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await expenseAPI.list(filters);
      setExpenses(response.data.data || []);
      setPagination(response.data.meta || {});
    } catch (err) {
      // Don't show error for 401 - user just needs to login
      if (err.response?.status !== 401) {
        setError(err.response?.data?.error || 'Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      setDeleting(id);
      await expenseAPI.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError('Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const headers = ['Date', 'Crop', 'Category', 'Amount (₹)', 'Notes'];
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.crop || '-',
      e.category,
      e.amount,
      e.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            placeholder="From Date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            placeholder="To Date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="crop"
            value={filters.crop}
            onChange={handleFilterChange}
            placeholder="Crop"
            list="crops-list-filter"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="crops-list-filter">
            {crops.map(crop => (
              <option key={crop} value={crop} />
            ))}
          </datalist>
          <button
            onClick={() => setFilters({
              dateFrom: '', dateTo: '', category: '', crop: '',
              page: 1, limit: 10, sort: '-date'
            })}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 md:col-span-5"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Count</p>
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Average</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(0) : 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm">Per Page</p>
          <p className="text-2xl font-bold text-gray-800">{expenses.length}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      )}

      {/* Expenses Table - Desktop */}
      {!loading && expenses.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Crop</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, idx) => (
                  <tr key={expense.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {expense.crop ? expense.crop.charAt(0).toUpperCase() + expense.crop.slice(1) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                      {expense.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleting === expense.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expenses List - Mobile */}
          <div className="md:hidden space-y-3">
            {expenses.map(expense => (
              <div key={expense.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {expense.crop ? expense.crop.charAt(0).toUpperCase() + expense.crop.slice(1) : 'Unspecified'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {expense.category}
                  </span>
                </div>
                {expense.notes && (
                  <p className="text-sm text-gray-600 mb-3">{expense.notes}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="flex-1 text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleting === expense.id}
                    className="flex-1 text-red-600 hover:text-red-800 flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && expenses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No expenses found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page === pagination.pages}
            className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
