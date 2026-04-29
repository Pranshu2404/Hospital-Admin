import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaXRay,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserMd,
  FaUserNurse,
  FaUserTie,
  FaCalendarAlt,
  FaIdCard,
  FaGraduationCap,
  FaBriefcase,
  FaStethoscope,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

const RadiologyStaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [viewModal, setViewModal] = useState({ show: false, staff: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, staff: null });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const designations = [
    'Radiologist',
    'Radiology Technician',
    'Sonographer',
    'MRI Technician',
    'CT Technician',
    'X-Ray Technician',
    'Administrator'
  ];

  useEffect(() => {
    fetchRadiologyStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, designationFilter, statusFilter, staff]);

  const fetchRadiologyStaff = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/radiology/staff`);
      setStaff(response.data.data || []);
    } catch (error) {
      console.error('Error fetching radiology staff:', error);
      setErrorMessage('Failed to load radiology staff');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.userId?.name?.toLowerCase().includes(term) ||
        s.employeeId?.toLowerCase().includes(term) ||
        s.designation?.toLowerCase().includes(term) ||
        s.specializations?.some(spec => spec.toLowerCase().includes(term))
      );
    }
    
    if (designationFilter !== 'all') {
      filtered = filtered.filter(s => s.designation === designationFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => 
        statusFilter === 'active' ? s.is_active : !s.is_active
      );
    }
    
    setFilteredStaff(filtered);
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/radiology/staff/${staffMember._id}/toggle-status`);
      fetchRadiologyStaff();
      setSuccessMessage(`Staff status updated successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      setErrorMessage('Failed to update staff status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.staff) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/radiology/staff/${deleteModal.staff._id}`);
      fetchRadiologyStaff();
      setDeleteModal({ show: false, staff: null });
      setSuccessMessage('Staff member deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setErrorMessage('Failed to delete staff member');
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1 text-xs" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaTimes className="mr-1 text-xs" /> Inactive
      </span>
    );
  };

  const getDesignationIcon = (designation) => {
    if (designation === 'Radiologist') return <FaUserMd className="text-purple-500" />;
    if (designation.includes('Technician')) return <FaUserNurse className="text-blue-500" />;
    return <FaUserTie className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaXRay className="text-emerald-600" />
              Radiology Staff Management
            </h1>
            <p className="text-slate-500 mt-1">Manage radiologists, technicians, and radiology department staff</p>
          </div>
          
          <button
            onClick={() => navigate('/dashboard/admin/radiology-staff/add')}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <FaPlus /> Add Staff Member
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, employee ID, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="all">All Designations</option>
              {designations.map(des => (
                <option key={des} value={des}>{des}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>

        {/* Staff Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaUserMd className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Staff Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm || designationFilter !== 'all' || statusFilter !== 'all'
                ? 'No staff match your filters. Try adjusting your search criteria.'
                : 'Get started by adding your first radiology staff member.'}
            </p>
            {!(searchTerm || designationFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => navigate('/dashboard/admin/radiology-staff/add')}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2"
              >
                <FaPlus /> Add Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStaff.map((staffMember) => (
              <div
                key={staffMember._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                        {getDesignationIcon(staffMember.designation)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {staffMember.userId?.name || 'Unknown'}
                        </h3>
                        <p className="text-xs text-slate-500">{staffMember.employeeId}</p>
                      </div>
                    </div>
                    {getStatusBadge(staffMember.is_active)}
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FaStethoscope className="text-slate-400" />
                      <span className="text-slate-700">{staffMember.designation}</span>
                    </div>
                    
                    {staffMember.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {staffMember.specializations.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {staffMember.qualification && (
                      <div className="flex items-center gap-2 text-sm">
                        <FaGraduationCap className="text-slate-400" />
                        <span className="text-slate-600 text-sm">{staffMember.qualification}</span>
                      </div>
                    )}

                    {staffMember.experience_years > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FaBriefcase className="text-slate-400" />
                        <span className="text-slate-600">{staffMember.experience_years} years experience</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-slate-400" />
                      <span className="text-slate-600">Joined: {formatDate(staffMember.joined_date)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setViewModal({ show: true, staff: staffMember })}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FaEye size={12} /> View
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/admin/radiology-staff/add`, { state: { staff: staffMember } })}
                      className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(staffMember)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${staffMember.is_active 
                        ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      title={staffMember.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {staffMember.is_active ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, staff: staffMember })}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Modal */}
        {viewModal.show && viewModal.staff && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaEye className="text-emerald-600" />
                  Staff Details
                </h2>
                <button onClick={() => setViewModal({ show: false, staff: null })}>
                  <FaTimes className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
                    {getDesignationIcon(viewModal.staff.designation)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{viewModal.staff.userId?.name}</h3>
                    <p className="text-slate-500">{viewModal.staff.employeeId}</p>
                    {getStatusBadge(viewModal.staff.is_active)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Designation</label>
                      <p className="text-slate-800 font-medium">{viewModal.staff.designation}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Specializations</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewModal.staff.specializations?.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Qualification</label>
                      <p className="text-slate-800">{viewModal.staff.qualification || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Experience</label>
                      <p className="text-slate-800">{viewModal.staff.experience_years || 0} years</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">License Number</label>
                      <p className="text-slate-800">{viewModal.staff.license_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Joined Date</label>
                      <p className="text-slate-800">{formatDate(viewModal.staff.joined_date)}</p>
                    </div>
                  </div>
                </div>

                {viewModal.staff.userId && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewModal.staff.userId.email && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-slate-400" />
                          <span className="text-slate-700">{viewModal.staff.userId.email}</span>
                        </div>
                      )}
                      {viewModal.staff.userId.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-slate-400" />
                          <span className="text-slate-700">{viewModal.staff.userId.phone}</span>
                        </div>
                      )}
                      {viewModal.staff.userId.address && (
                        <div className="flex items-center gap-2 col-span-2">
                          <FaMapMarkerAlt className="text-slate-400" />
                          <span className="text-slate-700">{viewModal.staff.userId.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => navigate('/dashboard/admin/radiology-staff/add', { state: { staff: viewModal.staff } })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => setViewModal({ show: false, staff: null })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Delete Staff Member?</h3>
              <p className="text-slate-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteModal.staff?.userId?.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, staff: null })}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
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

export default RadiologyStaffList;