// pages/dashboard/admin/lab-tests/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaFlask,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
  FaFilter,
  FaEye,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaVial,
  FaMicroscope,
  FaHeartbeat,
  FaDna,
  FaThermometerHalf,
  FaStethoscope,
  FaFileMedical,
  FaTimes,
  FaSave,
  FaInfoCircle,
  FaUtensils,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

// Category icons mapping
const categoryIcons = {
  'Hematology': <FaHeartbeat className="text-red-500" />,
  'Biochemistry': <FaDna className="text-green-500" />,
  'Microbiology': <FaMicroscope className="text-purple-500" />,
  'Immunology': <FaFlask className="text-blue-500" />,
  'Pathology': <FaFileMedical className="text-amber-500" />,
  'Radiology': <FaStethoscope className="text-indigo-500" />,
  'Endocrinology': <FaThermometerHalf className="text-orange-500" />,
  'Cardiology': <FaHeartbeat className="text-pink-500" />,
  'Other': <FaFlask className="text-gray-500" />
};

const LabTestsList = () => {
  const navigate = useNavigate();
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ show: false, test: null });
  const [editModal, setEditModal] = useState({ show: false, test: null, formData: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, test: null });
  
  // Edit form state
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    categories: {},
    totalRevenue: 0
  });

  // Categories for filter
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
    fetchLabTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchTerm, selectedCategory, selectedStatus, labTests]);

  const fetchLabTests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      const tests = response.data.data || [];
      setLabTests(tests);
      
      // Calculate stats
      const activeTests = tests.filter(t => t.is_active);
      const categoryCount = {};
      tests.forEach(test => {
        categoryCount[test.category] = (categoryCount[test.category] || 0) + 1;
      });
      
      const totalRevenue = tests.reduce((sum, test) => sum + (test.base_price * (test.usage_count || 0)), 0);
      
      setStats({
        total: tests.length,
        active: activeTests.length,
        categories: categoryCount,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...labTests];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test => 
        test.code?.toLowerCase().includes(term) ||
        test.name?.toLowerCase().includes(term) ||
        test.category?.toLowerCase().includes(term) ||
        test.description?.toLowerCase().includes(term) ||
        test.specimen_type?.toLowerCase().includes(term)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(test => 
        selectedStatus === 'active' ? test.is_active : !test.is_active
      );
    }
    
    setFilteredTests(filtered);
  };

  const handleToggleStatus = async (test) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/labtests/${test._id}`, {
        is_active: !test.is_active
      });
      
      // Update local state
      setLabTests(prev => prev.map(t => 
        t._id === test._id ? { ...t, is_active: !t.is_active } : t
      ));
    } catch (error) {
      console.error('Error toggling lab test status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.test) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/labtests/${deleteModal.test._id}`);
      
      setLabTests(prev => prev.filter(t => t._id !== deleteModal.test._id));
      setDeleteModal({ show: false, test: null });
    } catch (error) {
      console.error('Error deleting lab test:', error);
    }
  };

  const handleEditClick = (test) => {
    setEditModal({
      show: true,
      test,
      formData: {
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
      }
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEditNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: numValue
      }
    }));
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editModal.formData.code.trim()) {
      newErrors.code = 'Test code is required';
    } else if (!/^[A-Z0-9_-]{2,20}$/i.test(editModal.formData.code)) {
      newErrors.code = 'Code must be 2-20 alphanumeric characters, hyphens or underscores';
    }

    if (!editModal.formData.name.trim()) {
      newErrors.name = 'Test name is required';
    }

    if (!editModal.formData.category) {
      newErrors.category = 'Category is required';
    }

    if (editModal.formData.base_price < 0) {
      newErrors.base_price = 'Price cannot be negative';
    }

    if (editModal.formData.turnaround_time_hours < 0) {
      newErrors.turnaround_time_hours = 'Turnaround time cannot be negative';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const payload = {
        ...editModal.formData,
        code: editModal.formData.code.toUpperCase().trim(),
        name: editModal.formData.name.trim(),
        description: editModal.formData.description?.trim() || '',
        specimen_type: editModal.formData.specimen_type?.trim() || '',
        base_price: Number(editModal.formData.base_price),
        turnaround_time_hours: Number(editModal.formData.turnaround_time_hours)
      };

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/labtests/${editModal.test._id}`, payload);
      
      // Update local state
      setLabTests(prev => prev.map(t => 
        t._id === editModal.test._id ? { ...t, ...payload } : t
      ));
      
      setSuccessMessage('Lab test updated successfully!');
      
      setTimeout(() => {
        setEditModal({ show: false, test: null, formData: null });
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error updating lab test:', error);
      if (error.response?.data?.errors) {
        setEditErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setEditErrors({ submit: error.response.data.message });
      } else {
        setEditErrors({ submit: 'Failed to update lab test. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1 text-xs" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaTimesCircle className="mr-1 text-xs" /> Inactive
      </span>
    );
  };

  const getFastingBadge = (fasting) => {
    return fasting ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaExclamationTriangle className="mr-1 text-xs" /> Fasting
      </span>
    ) : null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaFlask className="text-emerald-600" />
              Lab Tests Management
            </h1>
            <p className="text-slate-500 mt-1">Manage laboratory tests, categories, and pricing</p>
          </div>
          
          <button
            onClick={() => navigate('/dashboard/admin/lab-tests/add')}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <FaPlus /> Add New Lab Test
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <FaFlask size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Tests</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <FaCheckCircle size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Categories</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{Object.keys(stats.categories).length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <FaFilter size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Est. Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <FaDollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code, name, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {/* Toggle Filters Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 rounded-lg"
            >
              <FaFilter /> {showFilters ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredTests.length} of {labTests.length} lab tests
        </div>

        {/* Lab Tests Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaFlask className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Lab Tests Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No tests match your filters. Try adjusting your search criteria.'
                : 'Get started by adding your first lab test to the system.'}
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="mt-4 text-emerald-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard/admin/lab-tests/add')}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2"
              >
                <FaPlus /> Add First Lab Test
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Specimen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTests.map((test) => (
                    <tr key={test._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {test.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            {categoryIcons[test.category] || <FaFlask className="text-slate-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{test.name}</div>
                            {test.description && (
                              <div className="text-xs text-slate-500 mt-1 line-clamp-1">{test.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{test.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-wrap">
                        <div className="flex items-center gap-1">
                          <FaVial className="text-slate-400 text-xs" />
                          <span className="text-sm text-slate-700">{test.specimen_type || 'N/A'}</span>
                        </div>
                        {getFastingBadge(test.fasting_required)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{formatCurrency(test.base_price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{test.usage_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(test.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewModal({ show: true, test })}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditClick(test)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(test)}
                            className={`p-2 rounded-lg transition-colors ${
                              test.is_active 
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={test.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {test.is_active ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, test })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModal.show && viewModal.test && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaEye className="text-emerald-600" />
                  Lab Test Details
                </h2>
                <button
                  onClick={() => setViewModal({ show: false, test: null })}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-slate-500" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Header with Code and Status */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="font-mono text-lg font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
                      {viewModal.test.code}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(viewModal.test.is_active)}
                  </div>
                </div>

                {/* Test Name */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">{viewModal.test.name}</h3>
                  {viewModal.test.category && (
                    <div className="flex items-center gap-2 mt-2">
                      {categoryIcons[viewModal.test.category]}
                      <span className="text-sm font-medium text-slate-600">{viewModal.test.category}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {viewModal.test.description && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-700">{viewModal.test.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Test Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Specimen Type:</span>
                        <span className="text-sm font-medium text-slate-900">{viewModal.test.specimen_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Fasting Required:</span>
                        <span className={`text-sm font-medium ${viewModal.test.fasting_required ? 'text-amber-600' : 'text-slate-900'}`}>
                          {viewModal.test.fasting_required ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Turnaround Time:</span>
                        <span className="text-sm font-medium text-slate-900">{viewModal.test.turnaround_time_hours || 24} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing & Insurance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Base Price:</span>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(viewModal.test.base_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Insurance Coverage:</span>
                        <span className="text-sm font-medium text-slate-900">{viewModal.test.insurance_coverage || 'Partial'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg mb-6">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaChartLine /> Usage Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{viewModal.test.usage_count || 0}</p>
                      <p className="text-xs text-emerald-600">Total Times Used</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatCurrency((viewModal.test.base_price || 0) * (viewModal.test.usage_count || 0))}
                      </p>
                      <p className="text-xs text-emerald-600">Estimated Revenue</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                  <div>
                    <span className="block font-medium text-slate-400">Created</span>
                    <span>{formatDate(viewModal.test.createdAt || viewModal.test.created_at)}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Last Updated</span>
                    <span>{formatDate(viewModal.test.updatedAt || viewModal.test.updated_at)}</span>
                  </div>
                  {viewModal.test.last_used && (
                    <div className="col-span-2">
                      <span className="block font-medium text-slate-400">Last Used</span>
                      <span>{formatDate(viewModal.test.last_used)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => handleEditClick(viewModal.test)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => setViewModal({ show: false, test: null })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.show && editModal.test && editModal.formData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaEdit className="text-blue-600" />
                  Edit Lab Test
                </h2>
                <button
                  onClick={() => setEditModal({ show: false, test: null, formData: null })}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-slate-500" />
                </button>
              </div>
              
              <div className="p-6">
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-medium">{successMessage}</span>
                  </div>
                )}

                {editErrors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <FaExclamationTriangle className="text-red-600" />
                    <span className="font-medium">{editErrors.submit}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Test Code */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Test Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={editModal.formData.code}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-2 border ${editErrors.code ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                        />
                        {editErrors.code && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.code}</p>
                        )}
                      </div>

                      {/* Test Name */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Test Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editModal.formData.name}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-2 border ${editErrors.name ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                        />
                        {editErrors.name && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.name}</p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={editModal.formData.category}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-2 border ${editErrors.category ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white`}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {editErrors.category && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.category}</p>
                        )}
                      </div>

                      {/* Specimen Type */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Specimen Type
                        </label>
                        <select
                          name="specimen_type"
                          value={editModal.formData.specimen_type}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        >
                          <option value="">Select specimen type</option>
                          {specimenTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editModal.formData.description}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Test Settings */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Test Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fasting Required */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="edit_fasting"
                          name="fasting_required"
                          checked={editModal.formData.fasting_required}
                          onChange={handleEditChange}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                        />
                        <label htmlFor="edit_fasting" className="text-sm text-slate-700">
                          <FaUtensils className="inline mr-1 text-amber-500" />
                          Fasting Required
                        </label>
                      </div>

                      {/* Turnaround Time */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Turnaround Time (hours)
                        </label>
                        <input
                          type="number"
                          name="turnaround_time_hours"
                          value={editModal.formData.turnaround_time_hours}
                          onChange={handleEditNumberChange}
                          min="0"
                          step="1"
                          className={`w-full px-3 py-2 border ${editErrors.turnaround_time_hours ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                        />
                        {editErrors.turnaround_time_hours && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.turnaround_time_hours}</p>
                        )}
                      </div>

                      {/* Base Price */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Base Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="base_price"
                          value={editModal.formData.base_price}
                          onChange={handleEditNumberChange}
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-2 border ${editErrors.base_price ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
                        />
                        {editErrors.base_price && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.base_price}</p>
                        )}
                      </div>

                      {/* Insurance Coverage */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Insurance Coverage
                        </label>
                        <select
                          name="insurance_coverage"
                          value={editModal.formData.insurance_coverage}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        >
                          {coverageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-700">Test Status</h3>
                        <p className="text-xs text-slate-500 mt-1">Activate or deactivate this test</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, is_active: !prev.formData.is_active }
                        }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          editModal.formData.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {editModal.formData.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        <span className="font-medium">{editModal.formData.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setEditModal({ show: false, test: null, formData: null })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Delete Lab Test?</h3>
              <p className="text-slate-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteModal.test?.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, test: null })}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LabTestsList;