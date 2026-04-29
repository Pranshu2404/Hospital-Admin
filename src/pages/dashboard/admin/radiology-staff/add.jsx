import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaXRay,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaUserMd,
  FaUserNurse,
  FaUserTie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaBriefcase,
  FaIdCard,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
  FaUserPlus
} from 'react-icons/fa';

const AddRadiologyStaff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editStaff = location.state?.staff || null;
  const isEditMode = !!editStaff;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    employeeId: '',
    designation: 'Radiology Technician',
    specializations: [],
    qualification: '',
    experience_years: 0,
    license_number: '',
    is_active: true,
    joined_date: new Date().toISOString().split('T')[0]
  });

  const [tempSpecialization, setTempSpecialization] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const designations = [
    'Radiologist',
    'Radiology Technician',
    'Sonographer',
    'MRI Technician',
    'CT Technician',
    'X-Ray Technician',
    'Administrator'
  ];

  const specializationOptions = [
    'X-Ray',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'Mammography',
    'Interventional Radiology',
    'Nuclear Medicine',
    'Fluoroscopy',
    'Angiography',
    'DEXA Scan',
    'PET Scan'
  ];

  useEffect(() => {
    if (editStaff) {
      setFormData({
        name: editStaff.userId?.name || '',
        email: editStaff.userId?.email || '',
        phone: editStaff.userId?.phone || '',
        address: editStaff.userId?.address || '',
        employeeId: editStaff.employeeId || '',
        designation: editStaff.designation || 'Radiology Technician',
        specializations: editStaff.specializations || [],
        qualification: editStaff.qualification || '',
        experience_years: editStaff.experience_years || 0,
        license_number: editStaff.license_number || '',
        is_active: editStaff.is_active !== undefined ? editStaff.is_active : true,
        joined_date: editStaff.joined_date ? new Date(editStaff.joined_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [editStaff]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Experience cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleAddSpecialization = () => {
    if (tempSpecialization && !formData.specializations.includes(tempSpecialization)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, tempSpecialization]
      }));
      setTempSpecialization('');
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        employeeId: formData.employeeId.trim().toUpperCase(),
        designation: formData.designation,
        specializations: formData.specializations,
        qualification: formData.qualification.trim(),
        experience_years: formData.experience_years,
        license_number: formData.license_number.trim(),
        is_active: formData.is_active,
        joined_date: formData.joined_date
      };

      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/radiology/staff/${editStaff._id}`, payload);
        setSuccessMessage('Radiology staff updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/radiology/staff`, payload);
        setSuccessMessage('Radiology staff added successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard/admin/radiology-staff');
      }, 2000);
    } catch (error) {
      console.error('Error saving radiology staff:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to save staff member. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/admin/radiology-staff')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FaUserMd className="text-emerald-600" />
                {isEditMode ? 'Edit Radiology Staff' : 'Add Radiology Staff'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isEditMode ? 'Update radiology staff details' : 'Add a new staff member to the radiology department'}
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMessage}</span>
            <span className="text-sm text-green-600 ml-auto">Redirecting...</span>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl justify-center mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Personal Information */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g., RAD-001"
                    className={`w-full px-4 py-2 border ${errors.employeeId ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                  />
                  {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Professional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    {designations.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                  {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaBriefcase className="inline mr-1" />
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleNumberChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaGraduationCap className="inline mr-1" />
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., MD Radiology, Diploma in Medical Imaging"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaIdCard className="inline mr-1" />
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="e.g., MCI-12345"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FaCalendarAlt className="inline mr-1" />
                    Joined Date
                  </label>
                  <input
                    type="date"
                    name="joined_date"
                    value={formData.joined_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Specializations
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={tempSpecialization}
                    onChange={(e) => setTempSpecialization(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select specialization</option>
                    {specializationOptions.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialization(spec)}
                        className="ml-1 text-purple-500 hover:text-purple-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Staff Status</h2>
                  <p className="text-sm text-slate-500 mt-1">Activate or deactivate this staff member</p>
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
              onClick={() => navigate('/dashboard/admin/radiology-staff')}
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
                  <FaUserPlus /> {isEditMode ? 'Update Staff' : 'Add Staff'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddRadiologyStaff;