import { useState, useEffect, useRef } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';

// --- Icons ---
const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Filter: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Delete: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

const DoctorNurseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const cacheBust = `?_cacheBust=${new Date().getTime()}`;
      const url = `${import.meta.env.VITE_BACKEND_URL}/doctors${cacheBust}`;
      const res = await axios.get(url);
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to refresh doctor list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Derived state for departments
  const departments = [...new Map(staff.filter(m => m.department).map(m => [m.department._id, m.department])).values()];

  // Filtering Logic
  const filteredStaff = staff.filter(member => {
    const matchesSearch = (member.firstName + ' ' + member.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole; // Assuming 'role' exists in data, otherwise adjust
    const matchesDept = filterDepartment === 'all' || member.department?._id === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploadSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/doctors/bulk-add`, results.data);
          setUploadSuccess(response.data.message || 'Doctors uploaded successfully!');
          fetchDoctors();
          setTimeout(() => setIsModalOpen(false), 2000);
        } catch (apiError) {
          setUploadError(apiError.response?.data?.message || 'An error occurred.');
        } finally {
          event.target.value = null;
        }
      },
      error: (error) => {
        setUploadError(`CSV Parsing Error: ${error.message}`);
        event.target.value = null;
      },
    });
  };

  const openConfirmDelete = (member) => {
    setDeleteError('');
    setDeleteTarget(member);
    setConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
    setConfirmDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/doctors/${deleteTarget._id}`);
      closeConfirmDelete();
      fetchDoctors();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete doctor.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const downloadDemoCSV = () => {
    const csvContent = 'firstName,lastName,email,password,phone,role,department,specialization,licenseNumber,experience,paymentType,amount,isFullTime,dateOfBirth,gender,address,city,state,zipCode,contractStartDate,contractEndDate,visitsPerWeek,workingDaysPerWeek,aadharNumber,panNumber,notes\n' +
    'Sanjay,Gupta,sanjay.gupta@hospital.com,newpass123,9123456780,Doctor,Cardiology,Orthopedics,NEWTESTLIC005,14,Fee per Visit,1500,false,03-12-1984,Male,22A Lajpat Nagar,Kanpur,Uttar Pradesh,208005,2025-02-01,2025-12-31,3,4,1234-5678-9012,ABCDE1234F,Experienced Cardiologist';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo_doctors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/30',
      'On Leave': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      'Inactive': 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/30',
      'Suspended': 'bg-red-50 text-red-700 border-red-200 ring-red-500/30'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${styles[status] || styles['Active']}`;
  };

  const getShiftBadge = (shift) => {
    const styles = {
      'Morning': 'bg-orange-50 text-orange-700 border-orange-200',
      'Evening': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Night': 'bg-slate-800 text-slate-200 border-slate-700',
      'Rotating': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[shift] || 'bg-slate-50 text-slate-600 border-slate-200'}`;
  };

  return (
    <div className="p-2 min-h-screen bg-slate-50/50 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctors Management</h1>
          <p className="text-slate-500 mt-1">Manage doctor records, roles, and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <Icons.Upload /> Bulk Upload
          </button>
          <button 
            onClick={() => navigate('/dashboard/admin/add-doctor')}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <Icons.Plus /> Add Doctor
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
            </div>
            <input 
                type="text" 
                placeholder="Search by name, specialization..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
                <option value="all">All Roles</option>
                <option value="Doctor">Doctors</option>
                {/* Add Nurse if applicable */}
            </select>
            <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-slate-400">Loading staff data...</div>
        ) : filteredStaff.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <Icons.Search />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No staff found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your filters or add a new doctor.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Profile</th>
                            <th className="px-6 py-4">Department & Role</th>
                            <th className="px-6 py-4">Contact Info</th>
                            <th className="px-6 py-4">Experience</th>
                            <th className="px-6 py-4">Shift</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStaff.map((member) => (
                            <tr key={member._id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                                            {member.firstName?.[0]}{member.lastName?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{member.firstName} {member.lastName}</div>
                                            <div className="text-xs text-slate-400 font-medium">Lic: {member.licenseNumber || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-800">{member.department?.name || 'Unassigned'}</div>
                                    <div className="text-xs text-slate-500">{member.specialization}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600">{member.phone}</div>
                                    <div className="text-xs text-slate-400 truncate max-w-[150px]" title={member.email}>{member.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                    {member.experience ? `${member.experience} Yrs` : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={getShiftBadge(member.shift)}>{member.shift || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={getStatusBadge(member.status || 'Active')}>{member.status || 'Active'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 ">
                                        <button onClick={() => navigate(`/dashboard/admin/doctor-profile/${member._id}`)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="View Profile">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button onClick={() => navigate(`/dashboard/admin/edit-doctor/${member._id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                            <Icons.Edit />
                                        </button>
                                        <button onClick={() => openConfirmDelete(member)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                          <Icons.Delete />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Bulk Upload Doctors</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icons.Close />
              </button>
            </div>
            
            <div className="p-6">
                <p className="text-slate-600 text-sm mb-4">Please upload a CSV file following the format below. You can download a template to get started.</p>
                
                {/* Preview Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    {['firstName', 'lastName', 'email', 'phone', 'role', 'department'].map(h => (
                                        <th key={h} className="px-4 py-2">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                <tr>
                                    <td className="px-4 py-2">Sanjay</td>
                                    <td className="px-4 py-2">Gupta</td>
                                    <td className="px-4 py-2">sanjay@hosp...</td>
                                    <td className="px-4 py-2">9123456789</td>
                                    <td className="px-4 py-2">Doctor</td>
                                    <td className="px-4 py-2">Cardiology</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2 bg-slate-100/50 text-xs text-slate-400 border-t border-slate-200 text-center italic">
                        (Scroll horizontally to see all columns in actual CSV)
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={downloadDemoCSV} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm">
                        Download Template
                    </button>
                    <button onClick={() => fileInputRef.current.click()} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 text-sm flex justify-center items-center gap-2">
                        <Icons.Upload /> Select CSV File
                    </button>
                </div>
                
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />

                {/* Status Messages */}
                {uploadSuccess && (
                    <div className="mt-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100 flex items-center gap-2">
                        <Icons.Check /> {uploadSuccess}
                    </div>
                )}
                {uploadError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                        {uploadError}
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Confirm Delete</h3>
              <button onClick={closeConfirmDelete} className="text-slate-400 hover:text-slate-600">
                <Icons.Close />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">Are you sure you want to delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?</p>
              {deleteError && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">{deleteError}</div>}
              <div className="flex justify-end gap-3">
                <button onClick={closeConfirmDelete} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700">Cancel</button>
                <button onClick={confirmDelete} disabled={deleteLoading} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorNurseList;