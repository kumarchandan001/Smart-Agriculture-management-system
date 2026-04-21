/**
 * Expense Form Component
 * Form to create/edit expenses with validation and file upload
 */

import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { expenseAPI } from '../api/expenseAPI';

const categories = ['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'];
const seasons = ['Kharif', 'Rabi', 'Zaid'];

export default function ExpenseForm({ 
  initialData = null, 
  onSuccess = () => {}, 
  onCancel = () => {},
  crops = []
}) {
  const [formData, setFormData] = useState({
    crop: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    season: '',
    notes: '',
    quantity: '',
    unit: 'kg',
    supplier: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        crop: initialData.crop || '',
        category: initialData.category || '',
        amount: initialData.amount || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        season: initialData.season || '',
        notes: initialData.notes || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || 'kg',
        supplier: initialData.supplier || ''
      });
      if (initialData.receiptUrl) {
        setReceiptPreview(initialData.receiptUrl);
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must not exceed 5MB');
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      setReceiptFile(file);
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.category || !formData.amount) {
      setError('Category and amount are required');
      return false;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : null
      };

      let response;
      if (initialData && initialData.id) {
        response = await expenseAPI.update(initialData.id, submitData);
      } else {
        response = await expenseAPI.create(submitData);
      }

      // Upload receipt if selected
      if (receiptFile && response.data?.data?.id) {
        await expenseAPI.uploadReceipt(response.data.data.id, receiptFile);
      }

      setSuccess(
        initialData ? 'Expense updated successfully!' : 'Expense created successfully!'
      );
      setFormData({
        crop: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        season: '',
        notes: '',
        quantity: '',
        unit: 'kg',
        supplier: ''
      });
      setReceiptFile(null);

      setTimeout(() => {
        onSuccess(response.data.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Success</h3>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Category & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Row 2: Crop & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop
            </label>
            <input
              type="text"
              name="crop"
              value={formData.crop}
              onChange={handleInputChange}
              placeholder="e.g., rice, wheat"
              list="crops-list"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <datalist id="crops-list">
              {crops.map(crop => (
                <option key={crop} value={crop} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Row 3: Season & Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Auto-detect</option>
              {seasons.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="e.g., Local Market"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Row 4: Quantity & Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="piece">piece</option>
              <option value="bag">bag</option>
              <option value="hour">hour</option>
              <option value="day">day</option>
              <option value="acre">acre</option>
              <option value="hectare">hectare</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes..."
            rows="3"
            maxLength="500"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt/Document
          </label>
          {receiptPreview && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">📎 {receiptPreview}</span>
              <button
                type="button"
                onClick={() => setReceiptPreview(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload JPEG, PNG, or PDF (max 5MB)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
