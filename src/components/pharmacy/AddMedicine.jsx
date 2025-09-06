import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaBox, 
  FaTag, 
  FaBuilding, 
  FaBarcode,
  FaRupeeSign,
  FaWeight,
  FaCalendar,
  FaInfoCircle
} from 'react-icons/fa';

const AddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand: '',
    category: '',
    dosage_form: '',
    strength: '',
    description: '',
    price_per_unit: '',
    cost_price: '',
    min_stock_level: 10,
    prescription_required: false,
    tax_rate: 0,
    location: {
      shelf: '',
      rack: ''
    },
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes] = await Promise.all([
          apiClient.get('/api/suppliers')
        ]);
        setSuppliers(suppliersRes.data);
        
        // Predefined categories based on schema
        setCategories([
          'Tablet', 'Capsule', 'Syrup', 'Injection', 
          'Ointment', 'Drops', 'Inhaler', 'Other'
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        min_stock_level: parseInt(formData.min_stock_level),
        tax_rate: parseFloat(formData.tax_rate)
      };

      const response = await apiClient.post('/api/medicines', payload);
      
      if (response.status === 201) {
        alert('Medicine added successfully!');
        navigate('/dashboard/pharmacy/medicine-list');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ label, icon, children, required = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      {children}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPlus className="text-teal-600" />
          Add New Medicine
        </h1>
        <p className="text-gray-600">Add a new medicine to your pharmacy inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Medicine Name" icon={<FaBox className="text-gray-400" />} required>
            <input
              key="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter medicine name"
            />
          </FormField>

          <FormField label="Generic Name" icon={<FaTag className="text-gray-400" />}>
            <input
              key="generic_name"
              type="text"
              value={formData.generic_name}
              onChange={(e) => handleInputChange('generic_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter generic name"
            />
          </FormField>

          <FormField label="Brand" icon={<FaBuilding className="text-gray-400" />}>
            <input
              key="brand"
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter brand name"
            />
          </FormField>

          <FormField label="Category" icon={<FaTag className="text-gray-400" />} required>
            <select
              key="category"
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Dosage Form" icon={<FaBarcode className="text-gray-400" />}>
            <select
              key="dosage_form"
              value={formData.dosage_form}
              onChange={(e) => handleInputChange('dosage_form', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Dosage Form</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
              <option value="Drops">Drops</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <FormField label="Strength" icon={<FaWeight className="text-gray-400" />}>
            <input
              key="strength"
              type="text"
              value={formData.strength}
              onChange={(e) => handleInputChange('strength', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500mg, 10ml"
            />
          </FormField>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Selling Price (₹)" icon={<FaRupeeSign className="text-gray-400" />} required>
            <input
              key="price_per_unit"
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.price_per_unit}
              onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Cost Price (₹)" icon={<FaRupeeSign className="text-gray-400" />}>
            <input
              key="cost_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost_price}
              onChange={(e) => handleInputChange('cost_price', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Tax Rate (%)" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              key="tax_rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.tax_rate}
              onChange={(e) => handleInputChange('tax_rate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </FormField>

          <FormField label="Minimum Stock Level" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              key="min_stock_level"
              type="number"
              min="1"
              value={formData.min_stock_level}
              onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Shelf Location" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              key="shelf"
              type="text"
              value={formData.location.shelf}
              onChange={(e) => handleInputChange('location.shelf', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A1, B2"
            />
          </FormField>

          <FormField label="Rack Number" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              key="rack"
              type="text"
              value={formData.location.rack}
              onChange={(e) => handleInputChange('location.rack', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Rack 1, Rack 2"
            />
          </FormField>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Prescription Required" icon={<FaInfoCircle className="text-gray-400" />}>
            <label className="flex items-center gap-2">
              <input
                key="prescription_required"
                type="checkbox"
                checked={formData.prescription_required}
                onChange={(e) => handleInputChange('prescription_required', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Requires prescription</span>
            </label>
          </FormField>

          <FormField label="Status" icon={<FaInfoCircle className="text-gray-400" />}>
            <label className="flex items-center gap-2">
              <input
                key="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" icon={<FaInfoCircle className="text-gray-400" />}>
          <textarea
            key="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter medicine description, usage instructions, etc."
          />
        </FormField>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Medicine'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/medicine-list')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;