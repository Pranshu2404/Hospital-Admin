import { useState, useEffect } from 'react';
import { Button, SearchInput } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaTrash, FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const StaffList = ({ setCurrentPage, setSelectedStaff }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/staff`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setStaffMembers(response.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/staff/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setStaffMembers(prev => prev.filter(s => s._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert('Failed to delete staff member');
    }
  };

  const handleView = (staff) => {
    // Save ID for persistence if page refresh happens
    localStorage.setItem('staffId', staff._id);

    // If we are in a context where setSelectedStaff/setCurrentPage works (Admin Dashboard typically)
    if (setSelectedStaff && setCurrentPage) {
      setSelectedStaff(staff);
      setCurrentPage('StaffProfile');
    } else {
      // Fallback navigation
      navigate('/dashboard/admin/staff-profile');
    }
  };

  const filteredStaff = staffMembers
    .filter((staff) =>
      staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Staff Directory</h2>
            <p className="text-slate-500 mt-1">Manage hospital staff, view details, and update records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-full md:w-64 transition-all"
              />
            </div>
            <Button onClick={() => navigate('/dashboard/admin/add-staff')} className="shadow-lg shadow-teal-500/20">
              + Add Staff
            </Button>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Dept</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading staff data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No staff members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://ui-avatars.com/api/?name=${staff.first_name}+${staff.last_name}`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <div className="font-semibold text-slate-800">
                              {staff.first_name} {staff.last_name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              ID: {staff.staffId || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FaEnvelope className="text-slate-300 text-xs" />
                            {staff.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FaPhone className="text-slate-300 text-xs" />
                            {staff.phone || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {staff.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1) : 'Staff'}
                          </span>
                          <div className="text-xs text-slate-500 pl-1">
                            {staff.department || 'General'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${staff.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : staff.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : staff.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></span>
                          {staff.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2  transition-opacity">
                          <button
                            onClick={() => handleView(staff)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleView(staff)} // Edit goes to profile then click edit
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            title="Edit Details"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(staff._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Staff"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination or Footer info could go here */}
          {!loading && filteredStaff.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-400 text-center">
              Showing {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
              >
                Delete Staff
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;

