// pages/dashboard/admin/pathology-staff/index.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button, FormInput } from '../../../components/common/FormElements';
import { 
  FaFlask, 
  FaEye, 
  FaEdit, 
  FaUserMd, 
  FaSearch,
  FaTimes,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaVenusMars,
  FaAward,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle
} from 'react-icons/fa';

const PathologyStaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ show: false, staff: null });
  const [editModal, setEditModal] = useState({ show: false, staff: null, formData: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, staff: null });
  
  // Edit form state
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Lab tests for assignment in edit modal
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState('all');
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();

  const roleOptions = [
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'lab_scientist', label: 'Lab Scientist' },
    { value: 'pathologist', label: 'Pathologist' },
    { value: 'lab_assistant', label: 'Lab Assistant' },
    { value: 'lab_manager', label: 'Lab Manager' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' }
  ];

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
    fetchStaff();
    fetchActiveLabTests();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (editModal.show && editModal.formData) {
      // Initialize selected tests from staff data
      const assignedTests = editModal.staff?.assigned_lab_tests?.map(t => ({
        _id: t.lab_test_id?._id || t.lab_test_id,
        code: t.lab_test_code,
        name: t.lab_test_name,
        category: t.category
      })) || [];
      setSelectedTests(assignedTests);
    }
  }, [editModal.show]);

  useEffect(() => {
    if (testSearchTerm || testCategoryFilter !== 'all') {
      filterTests();
    } else {
      setFilteredTests(labTests);
    }
  }, [labTests, testSearchTerm, testCategoryFilter]);

  useEffect(() => {
    if (filteredTests.length > 0) {
      const allFilteredSelected = filteredTests.every(test => 
        selectedTests.some(selected => selected._id === test._id)
      );
      setSelectAll(allFilteredSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedTests, filteredTests]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/pathology-staff`);
      setStaff(res.data.data || res.data);
      setFilteredStaff(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch pathology staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLabTests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      const activeTests = (response.data.data || []).filter(test => test.is_active === true);
      setLabTests(activeTests);
      setFilteredTests(activeTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.first_name?.toLowerCase().includes(term) ||
        s.last_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.staffId?.toLowerCase().includes(term) ||
        s.qualification?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(s => s.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const filterTests = () => {
    let filtered = [...labTests];

    if (testSearchTerm) {
      const term = testSearchTerm.toLowerCase();
      filtered = filtered.filter(test => 
        test.code?.toLowerCase().includes(term) ||
        test.name?.toLowerCase().includes(term) ||
        test.category?.toLowerCase().includes(term)
      );
    }

    if (testCategoryFilter !== 'all') {
      filtered = filtered.filter(test => test.category === testCategoryFilter);
    }

    setFilteredTests(filtered);
  };

  const handleEditClick = (member) => {
    setEditModal({
      show: true,
      staff: member,
      formData: {
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        qualification: member.qualification || '',
        specialization: member.specialization || '',
        role: member.role || 'lab_technician',
        gender: member.gender || '',
        date_of_birth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
        address: member.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        aadharNumber: member.aadharNumber || '',
        panNumber: member.panNumber || '',
        status: member.status || 'Active'
      }
    });
    setEditErrors({});
    setSelectedTests(member.assigned_lab_tests?.map(t => ({
      _id: t.lab_test_id?._id || t.lab_test_id,
      code: t.lab_test_code,
      name: t.lab_test_name,
      category: t.category
    })) || []);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (field, value) => {
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        address: {
          ...prev.formData.address,
          [field]: value
        }
      }
    }));
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editModal.formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!editModal.formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editModal.formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!editModal.formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!editModal.formData.role) {
      newErrors.role = 'Role is required';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestSelection = (test) => {
    setSelectedTests(prev => {
      const exists = prev.some(t => t._id === test._id);
      if (exists) {
        return prev.filter(t => t._id !== test._id);
      } else {
        return [...prev, {
          _id: test._id,
          code: test.code,
          name: test.name,
          category: test.category
        }];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTests(prev => prev.filter(test => 
        !filteredTests.some(ft => ft._id === test._id)
      ));
    } else {
      const newSelections = filteredTests.filter(ft => 
        !selectedTests.some(st => st._id === ft._id)
      ).map(ft => ({
        _id: ft._id,
        code: ft.code,
        name: ft.name,
        category: ft.category
      }));
      setSelectedTests(prev => [...prev, ...newSelections]);
    }
    setSelectAll(!selectAll);
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Format assigned tests
      const assignedTests = selectedTests.map(test => ({
        lab_test_id: test._id,
        lab_test_code: test.code,
        lab_test_name: test.name,
        category: test.category,
        can_perform: true
      }));

      const payload = {
        ...editModal.formData,
        assigned_lab_tests: assignedTests,
        accessible_test_ids: selectedTests.map(t => t._id)
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/pathology-staff/${editModal.staff._id}`,
        payload
      );

      if (response.data.success) {
        setSuccessMessage('Staff member updated successfully!');
        
        // Update local state
        setStaff(prev => prev.map(s => 
          s._id === editModal.staff._id ? response.data.data : s
        ));
        
        setTimeout(() => {
          setEditModal({ show: false, staff: null, formData: null });
          setSuccessMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      setEditErrors({ 
        submit: error.response?.data?.message || 'Failed to update staff member' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.staff) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/pathology-staff/${deleteModal.staff._id}`);
      
      setStaff(prev => prev.filter(s => s._id !== deleteModal.staff._id));
      setDeleteModal({ show: false, staff: null });
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/pathology-staff/${member._id}`,
        { status: newStatus }
      );

      if (response.data.success) {
        setStaff(prev => prev.map(s => 
          s._id === member._id ? { ...s, status: newStatus } : s
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const getRoleLabel = (role) => {
    const found = roleOptions.find(r => r.value === role);
    return found ? found.label : role;
  };

  const getStatusBadge = (status) => {
    const config = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
      'Inactive': { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimesCircle },
      'On Leave': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock }
    };
    const { bg, text, icon: Icon } = config[status] || config['Inactive'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="mr-1" size={10} />
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pathology Staff</h2>
            <p className="text-gray-500 mt-1">Manage laboratory personnel and their assigned tests</p>
          </div>
          <Button onClick={() => navigate('/dashboard/admin/pathology-staff/add')}>
            + Add Staff
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Roles</option>
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading staff...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Staff Found</h4>
            <p className="text-gray-500">No pathology staff match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Staff ID</th>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Role</th>
                  <th className="px-6 py-3 text-left font-semibold">Qualification</th>
                  <th className="px-6 py-3 text-left font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold">Assigned Tests</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => (
                  <tr key={member._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{member.staffId}</td>
                    <td className="px-6 py-4 font-medium">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{member.qualification || '—'}</td>
                    <td className="px-6 py-4">
                      <div>{member.email}</div>
                      <div className="text-xs text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaFlask className="text-teal-600" />
                        <span>{member.assigned_lab_tests?.length || 0} tests</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewModal({ show: true, staff: member })}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`p-2 rounded-lg transition-colors ${
                            member.status === 'Active'
                              ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={member.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {member.status === 'Active' ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, staff: member })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Modal */}
        {viewModal.show && viewModal.staff && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUserMd className="text-teal-600" />
                  Staff Profile
                </h2>
                <button
                  onClick={() => setViewModal({ show: false, staff: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-xl font-bold text-teal-700">
                    {viewModal.staff.first_name?.charAt(0)}{viewModal.staff.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewModal.staff.first_name} {viewModal.staff.last_name}
                    </h3>
                    <p className="text-gray-600">{getRoleLabel(viewModal.staff.role)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {viewModal.staff.staffId}
                      </span>
                      {getStatusBadge(viewModal.staff.status)}
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-teal-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FaFlask className="text-teal-600" />
                      <div>
                        <p className="text-xs text-gray-600">Assigned Tests</p>
                        <p className="text-xl font-bold text-gray-900">
                          {viewModal.staff.assigned_lab_tests?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FaChartLine className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Tests Processed</p>
                        <p className="text-xl font-bold text-gray-900">
                          {viewModal.staff.tests_processed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FaClock className="text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Avg TAT</p>
                        <p className="text-xl font-bold text-gray-900">
                          {viewModal.staff.avg_turnaround_time || 0}h
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FaAward className="text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Accuracy</p>
                        <p className="text-xl font-bold text-gray-900">
                          {viewModal.staff.accuracy_rate || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaUserMd className="text-teal-600" /> Personal Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm">{viewModal.staff.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm">{viewModal.staff.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaVenusMars className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm capitalize">{viewModal.staff.gender || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="text-sm">{formatDate(viewModal.staff.date_of_birth)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaBriefcase className="text-teal-600" /> Professional Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaGraduationCap className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Qualification</p>
                          <p className="text-sm">{viewModal.staff.qualification || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaAward className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Specialization</p>
                          <p className="text-sm">{viewModal.staff.specialization || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaIdCard className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Aadhar</p>
                          <p className="text-sm">{viewModal.staff.aadharNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaIdCard className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">PAN</p>
                          <p className="text-sm">{viewModal.staff.panNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {viewModal.staff.address && (
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-teal-600" /> Address
                      </h4>
                      <p className="text-sm">
                        {viewModal.staff.address.street && `${viewModal.staff.address.street}, `}
                        {viewModal.staff.address.city && `${viewModal.staff.address.city}, `}
                        {viewModal.staff.address.state && `${viewModal.staff.address.state} - `}
                        {viewModal.staff.address.pincode}
                        {viewModal.staff.address.country && `, ${viewModal.staff.address.country}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Assigned Tests */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFlask className="text-teal-600" /> Assigned Lab Tests
                  </h4>
                  {viewModal.staff.assigned_lab_tests?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {viewModal.staff.assigned_lab_tests.map((test, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-2">
                            <FaFlask className="text-teal-600 mt-1" />
                            <div>
                              <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                                {test.lab_test_code}
                              </span>
                              <p className="text-sm font-medium mt-1">{test.lab_test_name}</p>
                              <p className="text-xs text-gray-500 mt-1">{test.category}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No lab tests assigned</p>
                  )}
                </div>

                {/* Joined Date */}
                <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
                  Joined: {formatDate(viewModal.staff.joined_at)}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => handleEditClick(viewModal.staff)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => setViewModal({ show: false, staff: null })}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.show && editModal.staff && editModal.formData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaEdit className="text-blue-600" />
                  Edit Staff: {editModal.staff.first_name} {editModal.staff.last_name}
                </h2>
                <button
                  onClick={() => setEditModal({ show: false, staff: null, formData: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
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
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="First Name"
                        name="first_name"
                        value={editModal.formData.first_name}
                        onChange={handleEditChange}
                        error={editErrors.first_name}
                        required
                      />
                      <FormInput
                        label="Last Name"
                        name="last_name"
                        value={editModal.formData.last_name}
                        onChange={handleEditChange}
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={editModal.formData.email}
                        onChange={handleEditChange}
                        error={editErrors.email}
                        required
                      />
                      <FormInput
                        label="Phone"
                        name="phone"
                        value={editModal.formData.phone}
                        onChange={handleEditChange}
                        error={editErrors.phone}
                        required
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={editModal.formData.gender}
                          onChange={handleEditChange}
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
                        name="date_of_birth"
                        type="date"
                        value={editModal.formData.date_of_birth}
                        onChange={handleEditChange}
                      />

                      <FormInput
                        label="Aadhar Number"
                        name="aadharNumber"
                        value={editModal.formData.aadharNumber}
                        onChange={handleEditChange}
                      />
                      <FormInput
                        label="PAN Number"
                        name="panNumber"
                        value={editModal.formData.panNumber}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Qualification"
                        name="qualification"
                        value={editModal.formData.qualification}
                        onChange={handleEditChange}
                        placeholder="e.g. MD Pathology, DMLT"
                      />
                      <FormInput
                        label="Specialization"
                        name="specialization"
                        value={editModal.formData.specialization}
                        onChange={handleEditChange}
                        placeholder="e.g. Hematology, Microbiology"
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          name="role"
                          value={editModal.formData.role}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          required
                        >
                          {roleOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {editErrors.role && (
                          <p className="mt-1 text-xs text-red-600">{editErrors.role}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={editModal.formData.status}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Street Address"
                        value={editModal.formData.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                      <FormInput
                        label="City"
                        value={editModal.formData.address?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                      />
                      <FormInput
                        label="State"
                        value={editModal.formData.address?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                      />
                      <FormInput
                        label="Pincode"
                        value={editModal.formData.address?.pincode || ''}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Lab Test Assignment */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaFlask className="text-teal-600" />
                      Assign Lab Tests
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select which lab tests this staff member can perform.
                    </p>

                    {/* Test Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search lab tests..."
                          value={testSearchTerm}
                          onChange={(e) => setTestSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      
                      <select
                        value={testCategoryFilter}
                        onChange={(e) => setTestCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                      >
                        {selectAll ? 'Deselect All' : 'Select All'}
                      </button>
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

                    {/* Tests Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1 border border-gray-200 rounded-lg">
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
                                  <FaCheckCircle className="text-teal-600" />
                                ) : (
                                  <FaFlask className="text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                                  {test.code}
                                </span>
                                <p className="text-sm font-medium text-gray-800 mt-1 truncate" title={test.name}>
                                  {test.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{test.category}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setEditModal({ show: false, staff: null, formData: null })}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
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
              <h3 className="text-lg font-bold text-center mb-2">Delete Staff Member?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">
                  {deleteModal.staff?.first_name} {deleteModal.staff?.last_name}
                </span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, staff: null })}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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

export default PathologyStaffList;