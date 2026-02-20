// pages/dashboard/admin/lab-tests/add.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaFlask,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaInfoCircle,
  FaDollarSign,
  FaVial,
  FaClock,
  FaUtensils,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const AddLabTest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Other',
    description: '',
    specimen_type: '',
    fasting_required: false,
    turnaround_time_hours: 24,
    base_price: 0,
    insurance_coverage: 'Partial',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [successMessage, setSuccessMessage] = useState('');

  // Categories from schema
  const categories = [
    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Immunology',
    'Pathology',
    'Radiology',
    'Endocrinology',
    'Cardiology',
    'Other'
  ];

  // Insurance coverage options
  const coverageOptions = ['None', 'Partial', 'Full'];

  // Common specimen types
  const specimenTypes = [
    'Whole blood',
    'Serum',
    'Plasma',
    'Urine',
    'Stool',
    'CSF',
    'Sputum',
    'Swab',
    'Tissue',
    'Bone marrow',
    'Capillary blood',
    'EDTA whole blood',
    'Citrate plasma',
    'Other'
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchLabTest();
    }
  }, [id]);

  const fetchLabTest = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/${id}`);
      const test = response.data.data || response.data;
      setFormData({
        code: test.code || '',
        name: test.name || '',
        category: test.category || 'Other',
        description: test.description || '',
        specimen_type: test.specimen_type || '',
        fasting_required: test.fasting_required || false,
        turnaround_time_hours: test.turnaround_time_hours || 24,
        base_price: test.base_price || 0,
        insurance_coverage: test.insurance_coverage || 'Partial',
        is_active: test.is_active !== undefined ? test.is_active : true
      });
    } catch (error) {
      console.error('Error fetching lab test:', error);
      setErrors({ fetch: 'Failed to load lab test details' });
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Test code is required';
    } else if (!/^[A-Z0-9_-]{2,20}$/i.test(formData.code)) {
      newErrors.code = 'Code must be 2-20 alphanumeric characters, hyphens or underscores';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Test name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.base_price < 0) {
      newErrors.base_price = 'Price cannot be negative';
    }

    if (formData.turnaround_time_hours < 0) {
      newErrors.turnaround_time_hours = 'Turnaround time cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        specimen_type: formData.specimen_type?.trim() || '',
        base_price: Number(formData.base_price),
        turnaround_time_hours: Number(formData.turnaround_time_hours)
      };

      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/labtests/${id}`, payload);
        setSuccessMessage('Lab test updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/labtests`, payload);
        setSuccessMessage('Lab test added successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard/admin/lab-tests');
      }, 2000);
    } catch (error) {
      console.error('Error saving lab test:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to save lab test. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Layout sidebarItems={adminSidebar} section="Admin">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/admin/lab-tests')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FaFlask className="text-emerald-600" />
                {isEditMode ? 'Edit Lab Test' : 'Add New Lab Test'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isEditMode ? 'Update lab test details' : 'Create a new laboratory test'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMessage}</span>
            <span className="text-sm text-green-600 ml-auto">Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl justify-center mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Basic Information */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Test Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. LT-CBC-001"
                    className={`w-full px-4 py-2 border ${errors.code ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">Unique identifier for the test (2-20 characters)</p>
                </div>

                {/* Test Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Complete Blood Count"
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.category ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Specimen Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaVial className="inline mr-1 text-slate-400" />
                    Specimen Type
                  </label>
                  <select
                    name="specimen_type"
                    value={formData.specimen_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select specimen type</option>
                    {specimenTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FaInfoCircle className="inline mr-1 text-slate-400" />
                  Description / Clinical Information
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the test, clinical significance, etc."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Test Settings */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Test Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fasting Required */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fasting_required"
                      name="fasting_required"
                      checked={formData.fasting_required}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="fasting_required" className="font-medium text-slate-700">
                      <FaUtensils className="inline mr-1 text-amber-500" />
                      Fasting Required
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Check if patient needs to fast before test</p>
                  </div>
                </div>

                {/* Turnaround Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaClock className="inline mr-1 text-slate-400" />
                    Turnaround Time (hours)
                  </label>
                  <input
                    type="number"
                    name="turnaround_time_hours"
                    value={formData.turnaround_time_hours}
                    onChange={handleNumberChange}
                    min="0"
                    step="1"
                    className={`w-full px-4 py-2 border ${errors.turnaround_time_hours ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.turnaround_time_hours && (
                    <p className="mt-1 text-sm text-red-600">{errors.turnaround_time_hours}</p>
                  )}
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaDollarSign className="inline mr-1 text-slate-400" />
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border ${errors.base_price ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.base_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
                  )}
                </div>

                {/* Insurance Coverage */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Insurance Coverage
                  </label>
                  <select
                    name="insurance_coverage"
                    value={formData.insurance_coverage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    {coverageOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Test Status</h2>
                  <p className="text-sm text-slate-500 mt-1">Activate or deactivate this test</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    formData.is_active 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formData.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                  <span className="font-medium">{formData.is_active ? 'Active' : 'Inactive'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin/lab-tests')}
              className="px-6 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <FaSave /> {isEditMode ? 'Update Test' : 'Save Test'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddLabTest;