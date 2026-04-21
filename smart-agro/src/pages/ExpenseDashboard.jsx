/**
 * Expense Dashboard Page
 * Main page composing all expense components
 * Route: /expenses
 */

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseSummary from '../components/ExpenseSummary';
import { expenseAPI } from '../api/expenseAPI';

export default function ExpenseDashboard() {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'form', 'summary'
  const [editingExpense, setEditingExpense] = useState(null);
  const [crops, setCrops] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [budgetAlert, setBudgetAlert] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      // User is not logged in, but don't force redirect
      // Just load defaults
      setCrops(['rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'groundnut', 'pulses']);
      return;
    }
  }, [user]);

  // Load crops on mount
  useEffect(() => {
    loadCrops();
    checkBudgetStatus();
  }, []);

  const loadCrops = async () => {
    try {
      // Fetch crops from recommendation service if available
      const response = await fetch('http://localhost:5000/api/recommendations/crops');
      if (response.ok) {
        const data = await response.json();
        const cropNames = data.data?.map(c => c.crop) || [];
        setCrops(cropNames);
      }
    } catch (err) {
      console.log('Could not load crops from API, using defaults');
      setCrops(['rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'groundnut', 'pulses']);
    }
  };

  const checkBudgetStatus = async () => {
    try {
      const monthlyBudget = 100000; // Set default budget
      const response = await expenseAPI.getBudgetStatus(monthlyBudget);
      if (response.data?.data?.isExceeded) {
        setBudgetAlert({
          spent: response.data.data.spent,
          limit: response.data.data.budgetLimit,
          percentage: response.data.data.percentageUsed
        });
      }
    } catch (err) {
      console.log('Could not check budget');
    }
  };

  const handleFormSuccess = (data) => {
    setRefreshKey(prev => prev + 1);
    setView('list');
    setEditingExpense(null);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setView('form');
    window.scrollTo(0, 0);
  };

  const handleFormCancel = () => {
    setEditingExpense(null);
    setView('list');
  };

  const handleCreateNew = () => {
    setEditingExpense(null);
    setView('form');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Expense Tracker</h1>
          <p className="text-gray-600">Track and analyze your farm expenses by category, crop, and season</p>
        </div>

        {/* Budget Alert */}
        {budgetAlert && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Budget Alert</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  You've spent ₹{budgetAlert.spent.toLocaleString('en-IN')} out of ₹{budgetAlert.limit.toLocaleString('en-IN')} 
                  ({budgetAlert.percentage.toFixed(1)}% of budget used)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 My Expenses
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              view === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Summary & Analytics
          </button>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 ml-auto"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Content Area */}
        {view === 'form' && (
          <div className="mb-8">
            <ExpenseForm
              initialData={editingExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              crops={crops}
            />
          </div>
        )}

        {view === 'list' && (
          <ExpenseList
            key={refreshKey}
            onEdit={handleEdit}
            crops={crops}
            refreshTrigger={refreshKey}
          />
        )}

        {view === 'summary' && (
          <ExpenseSummary key={refreshKey} />
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Better Tracking</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Organize by category</strong>: Seeds, fertilizer, pesticides, labour, etc.</li>
            <li>• <strong>Link to crops</strong>: Track expenses by specific crop for ROI calculation</li>
            <li>• <strong>Upload receipts</strong>: Keep digital copies of your bills and invoices</li>
            <li>• <strong>Review seasonally</strong>: Check summaries to optimize costs for Kharif, Rabi, Zaid</li>
            <li>• <strong>Export data</strong>: Download expense lists as CSV for record-keeping</li>
            <li>• <strong>Calculate ROI</strong>: Use yield and price data to see actual profit margins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
