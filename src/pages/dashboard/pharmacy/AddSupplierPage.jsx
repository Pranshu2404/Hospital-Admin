import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaBuilding, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaArrowLeft
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/suppliers', formData);
      
      if (response.status === 201) {
        alert('Supplier added successfully!');
        navigate('/dashboard/pharmacy/purchasing/suppliers');
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(err.response?.data?.error || 'Failed to add supplier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ label, icon, name, type = 'text', required = false, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        {...props}
      />
    </div>
  );

  return (
    <Layout sidebarItems={pharmacySidebar}>
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/pharmacy/suppliers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft /> Back to Suppliers
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBuilding className="text-teal-600" />
          Add New Supplier
        </h1>
        <p className="text-gray-600">Add a new supplier to your pharmacy network</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Supplier Name"
            icon={<FaBuilding className="text-gray-400" />}
            name="name"
            required
            placeholder="Enter supplier company name"
          />
          <FormField
            label="Company Name"
            icon={<FaBuilding className="text-gray-400" />}
            name="companyName"
            placeholder="Enter company name"
          />
          <FormField
            label="Contact Person"
            icon={<FaUser className="text-gray-400" />}
            name="contactPerson"
            placeholder="Enter contact person name"
          />

          <FormField
            label="Phone Number"
            icon={<FaPhone className="text-gray-400" />}
            name="phone"
            type="tel"
            required
            placeholder="Enter phone number"
          />

          <FormField
            label="Email Address"
            icon={<FaEnvelope className="text-gray-400" />}
            name="email"
            type="email"
            required
            placeholder="Enter email address"
          />
        </div>

        <FormField
          label="Address"
          icon={<FaMapMarkerAlt className="text-gray-400" />}
          name="address"
          placeholder="Enter full address"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <label className="text-sm text-gray-700">Active Supplier</label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Supplier'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/purchasing/suppliers')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Additional Information */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Supplier Information</h3>
        <p className="text-sm text-blue-700">
          Suppliers are essential for managing your pharmacy's inventory. Ensure all contact information 
          is accurate to maintain smooth communication and order processing.
        </p>
      </div>
    </div>
    </Layout>
  );
};

export default AddSupplier;