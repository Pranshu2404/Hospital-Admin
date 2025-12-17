import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import axios from 'axios';

// --- Custom Icons ---
const Icons = {
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  )
};

// Popup Modal Component
const DepartmentPopup = ({ department, onClose, onUpdate, onDelete, onAssignHod }) => {
  const [editedName, setEditedName] = useState(department?.name || '');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (department) {
      fetchDoctors();
    }
  }, [department]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/department/${department._id}`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleUpdate = async () => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === department.name) return;
    
    try {
      await onUpdate(department._id, trimmed);
      setSuccessMessage('Department name updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSuccessMessage('Failed to update department');
    }
  };

  const handleAssignHod = async (doctorId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${department._id}`, {
        head_doctor_id: doctorId
      });
      setSuccessMessage('HOD assigned successfully!');
      fetchDoctors(); // Refresh doctors list
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSuccessMessage('Failed to assign HOD');
    }
  };

  if (!department) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manage Department</h2>
            <p className="text-slate-500 mt-1">Edit department details and assign HOD</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${successMessage.includes('Failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <span className={`p-1 rounded-full ${successMessage.includes('Failed') ? 'bg-red-100' : 'bg-emerald-100'}`}>
                {successMessage.includes('Failed') ? (
                  <Icons.X />
                ) : (
                  <Icons.Check />
                )}
              </span>
              <span className="font-medium text-sm">{successMessage}</span>
            </div>
          )}

          {/* Department Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Icons.Building className="w-8 h-8" />
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={!editedName.trim() || editedName.trim() === department.name}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Current HOD */}
            {department.head_doctor_id && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">Current HOD</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600">
                    <Icons.User />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Dr. {department.head_doctor_id.firstName} {department.head_doctor_id.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {department.head_doctor_id.specialization} • {department.head_doctor_id.experience || 'N/A'} Yrs Experience
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Doctors */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Doctors</h3>
            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-slate-500 mt-2">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Icons.User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No doctors found in this department.</p>
                <p className="text-slate-400 text-sm mt-1">Add doctors to assign as HOD.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold">
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {doctor.specialization} • {doctor.experience || 'N/A'} Yrs Exp
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignHod(doctor._id)}
                      disabled={department.head_doctor_id?._id === doctor._id}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        department.head_doctor_id?._id === doctor._id
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400'
                      }`}
                    >
                      {department.head_doctor_id?._id === doctor._id ? 'Current HOD' : 'Assign as HOD'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this department?')) {
                onDelete(department._id);
              }
            }}
            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Delete Department
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AddHodMain = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
      setDepartments(prev => prev.filter(dept => dept._id !== id));
      setShowPopup(false);
      setSelectedDepartment(null);
    } catch (err) {
      alert('Failed to delete department.');
    }
  };

  const handleUpdateDepartment = async (id, newName) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`, { name: newName });
      setDepartments(prev =>
        prev.map(dept => (dept._id === id ? { ...dept, name: res.data.name } : dept))
      );
      setSelectedDepartment(prev => prev ? { ...prev, name: res.data.name } : null);
    } catch (err) {
      alert('Failed to update department.');
      throw err;
    }
  };

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setShowPopup(true);
  };

  if (isLoading) return <div className="p-8 flex justify-center text-slate-400">Loading Departments...</div>;

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-8 min-h-screen bg-slate-50/50 font-sans text-slate-800">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Departments</h1>
                <p className="text-slate-500 mt-2 font-medium">Click on a department to edit name, assign HOD, or delete.</p>
            </div>

            {/* View Toggle */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center mt-4 md:mt-0">
                <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    title="Grid View"
                >
                    <Icons.Grid />
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    title="List View"
                >
                    <Icons.List />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
          
          {departments.length === 0 ? (
             <div className="text-center py-20">
                <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                    <Icons.Building className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No departments found.</p>
             </div>
          ) : (
             <>
                {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {departments.map((dept) => (
                    <div 
                        key={dept._id} 
                        className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => handleDepartmentClick(dept)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                <Icons.Building />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Icons.UserPlus />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate" title={dept.name}>
                              {dept.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-1 group-hover:text-emerald-500/80">
                              {dept.head_doctor_id ? 'HOD Assigned' : 'Click to Assign HOD'}
                            </p>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="absolute top-4 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white px-2 py-1 rounded-lg shadow-sm">
                            <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleDepartmentClick(dept);
                                }} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit Department"
                            >
                                <Icons.Edit />
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col gap-3">
                    {departments.map((dept) => (
                    <div 
                        key={dept._id} 
                        className="group flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-emerald-200 hover:bg-slate-50/50 hover:shadow-md transition-all duration-200"
                        onClick={() => handleDepartmentClick(dept)}
                    >
                        <div className="flex items-center gap-4 flex-grow">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-emerald-600 flex items-center justify-center">
                                <Icons.Building />
                            </div>
                            
                            <div className="flex-grow">
                                <h3 className="text-base font-bold text-slate-700 group-hover:text-emerald-700">{dept.name}</h3>
                                <p className="text-xs text-slate-400">
                                  {dept.head_doctor_id 
                                    ? `HOD: Dr. ${dept.head_doctor_id.firstName} ${dept.head_doctor_id.lastName}`
                                    : 'No HOD assigned'
                                  }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.UserPlus /> Manage Department
                            </span>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleDepartmentClick(dept);
                                    }} 
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Icons.Edit />
                                </button>
                                <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (window.confirm('Are you sure you want to delete this department?')) {
                                        handleDeleteDepartment(dept._id);
                                      }
                                    }} 
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
             </>
          )}
        </div>
      </div>

      {/* Department Popup Modal */}
      {showPopup && selectedDepartment && (
        <DepartmentPopup
          department={selectedDepartment}
          onClose={() => {
            setShowPopup(false);
            setSelectedDepartment(null);
          }}
          onUpdate={handleUpdateDepartment}
          onDelete={handleDeleteDepartment}
        />
      )}
    </Layout>
  );
};

export default AddHodMain;