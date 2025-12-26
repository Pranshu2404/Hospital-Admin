import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaCapsules, 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClipboardList,
  FaBox,
  FaExclamationTriangle,
  FaHistory,
  FaFileInvoice
} from 'react-icons/fa';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/medicines/${id}`);
      setMedicine(response.data);
      setFormData(response.data); // Initialize form data
    } catch (err) {
      setError('Failed to fetch medicine details.');
      console.error('Error fetching medicine:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiClient.put(`/api/medicines/${id}`, formData);
      setMedicine(response.data);
      setIsEditing(false);
      // Show success message
    } catch (err) {
      setError('Failed to update medicine.');
      console.error('Error updating medicine:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(medicine);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStockStatus = (quantity, minStock = 10) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < minStock) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(medicine?.stock_quantity, medicine?.min_stock_level);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/pharmacy/inventory/overview')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FaExclamationTriangle />
            <span>Medicine not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/pharmacy/inventory')}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <FaCapsules className="text-3xl text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="text-2xl font-bold border-b-2 border-teal-600 focus:outline-none"
                  />
                ) : (
                  medicine.name
                )}
              </h1>
              {medicine.generic_name && (
                <p className="text-sm text-gray-600">
                  {isEditing ? (
                    <input
                      type="text"
                      name="generic_name"
                      value={formData.generic_name || ''}
                      onChange={handleInputChange}
                      placeholder="Generic name"
                      className="text-sm border-b border-gray-300 focus:outline-none focus:border-teal-600"
                    />
                  ) : (
                    `Generic: ${medicine.generic_name}`
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <FaEdit /> Edit Medicine
            </button>
          )}
        </div>
      </div>

      {/* Stock Status Alert */}
      {medicine.stock_quantity <= (medicine.min_stock_level || 10) && (
        <div className={`p-4 rounded-lg ${
          medicine.stock_quantity === 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className={
              medicine.stock_quantity === 0 ? 'text-red-600' : 'text-orange-600'
            } />
            <span className={
              medicine.stock_quantity === 0 ? 'text-red-800' : 'text-orange-800'
            }>
              {medicine.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock Alert'} - 
              Only {medicine.stock_quantity} units remaining
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-teal-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {isEditing ? (
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{medicine.category || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="dosage_form"
                    value={formData.dosage_form || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.dosage_form || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.strength || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.brand || 'N/A'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.description || 'No description available'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaRupeeSign className="text-teal-600" />
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={formData.cost_price || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatCurrency(medicine.cost_price)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_unit"
                    value={formData.price_per_unit || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatCurrency(medicine.price_per_unit)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="tax_rate"
                    value={formData.tax_rate || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.tax_rate || 0}%</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Inventory */}
        <div className="space-y-6">
          {/* Stock Information */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBox className="text-teal-600" />
              Stock Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{medicine.stock_quantity || 0} units</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.min_stock_level || 10} units</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-teal-600" />
              Storage Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location?.shelf || ''}
                    onChange={(e) => handleNestedInputChange('location', 'shelf', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.location?.shelf || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location?.rack || ''}
                    onChange={(e) => handleNestedInputChange('location', 'rack', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-gray-900">{medicine.location?.rack || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-teal-600" />
              Status & Requirements
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active || false}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {medicine.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Prescription Required</label>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="prescription_required"
                      checked={formData.prescription_required || false}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.prescription_required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {medicine.prescription_required ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          onClick={() => navigate('/dashboard/pharmacy/inventory')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Inventory
        </button>
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Edit Medicine
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;