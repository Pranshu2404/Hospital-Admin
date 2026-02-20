// pages/dashboard/admin/add-pathology-staff.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { FormInput, Button } from '../../../components/common/FormElements';
import { FaFlask, FaSearch, FaCheck, FaTimes, FaSave } from 'react-icons/fa';

const AddPathologyStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    role: 'lab_technician',
    gender: '',
    aadharNumber: '',
    panNumber: '',
    date_of_birth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });

  // Role options
  const roleOptions = [
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'lab_scientist', label: 'Lab Scientist' },
    { value: 'pathologist', label: 'Pathologist' },
    { value: 'lab_assistant', label: 'Lab Assistant' },
    { value: 'lab_manager', label: 'Lab Manager' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Categories from your schema
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

  useEffect(() => {
    fetchActiveLabTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [labTests, searchTerm, categoryFilter]);

  useEffect(() => {
    // Update select all checkbox based on selected tests
    if (filteredTests.length > 0) {
      const allFilteredSelected = filteredTests.every(test => 
        selectedTests.some(selected => selected._id === test._id)
      );
      setSelectAll(allFilteredSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedTests, filteredTests]);

  const fetchActiveLabTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      // Only show active lab tests
      const activeTests = (response.data.data || []).filter(test => test.is_active === true);
      setLabTests(activeTests);
      setFilteredTests(activeTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...labTests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test => 
        test.code?.toLowerCase().includes(term) ||
        test.name?.toLowerCase().includes(term) ||
        test.category?.toLowerCase().includes(term) ||
        test.specimen_type?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(test => test.category === categoryFilter);
    }

    setFilteredTests(filtered);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleTestSelection = (test) => {
    setSelectedTests(prev => {
      const exists = prev.some(t => t._id === test._id);
      if (exists) {
        return prev.filter(t => t._id !== test._id);
      } else {
        return [...prev, test];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered tests
      setSelectedTests(prev => prev.filter(test => 
        !filteredTests.some(ft => ft._id === test._id)
      ));
    } else {
      // Select all filtered tests
      const newSelections = filteredTests.filter(ft => 
        !selectedTests.some(st => st._id === ft._id)
      );
      setSelectedTests(prev => [...prev, ...newSelections]);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Create pathology staff record only (no user registration)
      const staffResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/pathology-staff`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        qualification: form.qualification,
        specialization: form.specialization,
        role: form.role,
        gender: form.gender,
        aadharNumber: form.aadharNumber,
        panNumber: form.panNumber,
        date_of_birth: form.date_of_birth,
        address: form.address,
        accessible_test_ids: selectedTests.map(test => test._id),
        assigned_lab_tests: selectedTests.map(test => ({
          lab_test_id: test._id,
          lab_test_code: test.code,
          lab_test_name: test.name,
          category: test.category,
          can_perform: true
        }))
      });

      if (staffResponse.data.success) {
        navigate('/dashboard/admin/pathology-staff');
      }
    } catch (err) {
      console.error('Failed to add pathology staff:', err);
      alert(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add Pathology Staff</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput 
                label="First Name" 
                value={form.first_name} 
                onChange={(e) => handleChange('first_name', e.target.value)} 
                required 
              />
              <FormInput 
                label="Last Name" 
                value={form.last_name} 
                onChange={(e) => handleChange('last_name', e.target.value)} 
              />
              <FormInput 
                label="Email" 
                value={form.email} 
                onChange={(e) => handleChange('email', e.target.value)} 
                type="email" 
                required 
              />
              <FormInput 
                label="Phone" 
                value={form.phone} 
                onChange={(e) => handleChange('phone', e.target.value)} 
                required 
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <FormInput 
                label="Date of Birth" 
                value={form.date_of_birth} 
                onChange={(e) => handleChange('date_of_birth', e.target.value)} 
                type="date"
              />
              
              <FormInput 
                label="Aadhar Number" 
                value={form.aadharNumber} 
                onChange={(e) => handleChange('aadharNumber', e.target.value)} 
              />
              <FormInput 
                label="PAN Number" 
                value={form.panNumber} 
                onChange={(e) => handleChange('panNumber', e.target.value)} 
              />
            </div>

            {/* Address Fields */}
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  label="Street Address" 
                  value={form.address.street} 
                  onChange={(e) => handleAddressChange('street', e.target.value)} 
                />
                <FormInput 
                  label="City" 
                  value={form.address.city} 
                  onChange={(e) => handleAddressChange('city', e.target.value)} 
                />
                <FormInput 
                  label="State" 
                  value={form.address.state} 
                  onChange={(e) => handleAddressChange('state', e.target.value)} 
                />
                <FormInput 
                  label="Pincode" 
                  value={form.address.pincode} 
                  onChange={(e) => handleAddressChange('pincode', e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput 
                label="Qualification" 
                value={form.qualification} 
                onChange={(e) => handleChange('qualification', e.target.value)} 
                placeholder="e.g. MD Pathology, DMLT"
              />
              <FormInput 
                label="Specialization" 
                value={form.specialization} 
                onChange={(e) => handleChange('specialization', e.target.value)} 
                placeholder="e.g. Hematology, Microbiology"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Role</option>
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lab Test Assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaFlask className="text-teal-600" />
              Assign Lab Tests
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select which lab tests this staff member can perform. Only active tests are shown.
            </p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lab tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Selection Summary */}
            <div className="mb-4 p-3 bg-teal-50 rounded-lg flex justify-between items-center">
              <span className="text-sm text-teal-700">
                <strong>{selectedTests.length}</strong> tests selected
              </span>
              {selectedTests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTests([])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Lab Tests Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading lab tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaFlask className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No lab tests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {filteredTests.map((test) => {
                  const isSelected = selectedTests.some(t => t._id === test._id);
                  return (
                    <div
                      key={test._id}
                      onClick={() => handleTestSelection(test)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {isSelected ? (
                            <FaCheck className="text-teal-600" />
                          ) : (
                            <FaFlask className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                              {test.code}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-1 truncate" title={test.name}>
                            {test.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {test.category}
                            </span>
                            {test.specimen_type && (
                              <span>{test.specimen_type}</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            Price: {formatCurrency(test.base_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/admin/pathology-staff')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || selectedTests.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaSave /> Add Staff Member
                </>
              )}
            </Button>
          </div>

          {selectedTests.length === 0 && (
            <p className="text-amber-600 text-sm text-right">
              * Please select at least one lab test
            </p>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddPathologyStaff;