import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';
import axios from 'axios';

// --- Icons ---
const Icons = {
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
};

// Department Popup Modal Component
const DepartmentPopup = ({ department, onClose, onUpdate, onDelete, onAssignHod }) => {
  const [editedName, setEditedName] = useState(department?.name || '');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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
      setDoctors([]);
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

  const handleNavigateToAssignHOD = () => {
    navigate(`/dashboard/admin/add-hod/${department._id}?departmentName=${encodeURIComponent(department.name)}`);
    onClose();
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Icons.Building />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage Department</h2>
              <p className="text-slate-500 text-sm">Edit department details and assign HOD</p>
            </div>
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
              <div className="flex-grow">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter department name"
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={!editedName.trim() || editedName.trim() === department.name}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Current HOD */}
            {department.head_doctor_id && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">Current Head of Department</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <Icons.User />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Dr. {department.head_doctor_id.firstName} {department.head_doctor_id.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {department.head_doctor_id.specialization || 'General'} • {department.head_doctor_id.experience || 'N/A'} Yrs Experience
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Doctors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Available Doctors</h3>
              <button
                onClick={handleNavigateToAssignHOD}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Full HOD Management <Icons.ArrowRight className="h-3 w-3" />
              </button>
            </div>
            
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
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold border border-slate-200">
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {doctor.specialization || 'General'} • {doctor.experience || 'N/A'} Yrs Exp
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
        <div className="flex justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
                  onDelete(department._id);
                }
              }}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Icons.Trash className="h-4 w-4" />
              Delete Department
            </button>
            <button
              onClick={handleNavigateToAssignHOD}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Icons.UserPlus className="h-4 w-4" />
              Manage HOD
            </button>
          </div>
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

// --- Modal to prompt for HOD assignment ---
const AssignHODPromptModal = ({ isOpen, onClose, onConfirm, departmentName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-100 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                 <Icons.Building className="text-emerald-600 h-6 w-6"/>
            </div>
          <h3 className="text-xl font-bold text-gray-800">Department Added!</h3>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            Would you like to assign a Head of Department (HOD) for <span className="font-bold text-gray-800">"{departmentName}"</span> now?
          </p>
          <div className="flex justify-center space-x-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold text-sm transition-colors"
            >
                No, Later
            </button>
            <button 
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all"
            >
                Yes, Assign HOD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// A comprehensive list of hospital departments for suggestions
const hospitalDepartmentSuggestions = [
  'General Medicine', 'Pediatrics', 'Geriatrics', 'Obstetrics and Gynecology (OB/GYN)', 'Cardiology',
  'Neurology', 'Oncology (Cancer Center)', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Nephrology (Renal Unit)', 'Pulmonology (Respiratory Medicine)', 'Rheumatology', 'Infectious Diseases',
  'Psychiatry and Behavioral Health', 'Palliative Care',
  'General Surgery', 'Orthopedic Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Plastic and Reconstructive Surgery',
  'Urology', 'Otolaryngology (ENT)', 'Ophthalmology (Eye Care)', 'Anesthesiology', 'Vascular Surgery',
  'Radiology (X-Ray, CT, MRI)', 'Pathology and Laboratory Medicine', 'Nuclear Medicine', 'Interventional Radiology', 'Ultrasound',
  'Emergency Department (ED/ER)', 'Intensive Care Unit (ICU)', 'Pediatric Intensive Care Unit (PICU)',
  'Neonatal Intensive Care Unit (NICU)', 'Coronary Care Unit (CCU)', 'Trauma Center',
  'Physical Therapy', 'Occupational Therapy', 'Speech-Language Pathology', 'Nutrition and Dietetics', 'Pharmacy',
  'Patient Registration / Admissions', 'Medical Records', 'Billing and Insurance', 'Information Technology (IT)',
  'Biomedical Engineering', 'Housekeeping / Environmental Services', 'Security', 'Human Resources', 'Administration'
];

// --- Main Component ---
const SelectDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAssignPrompt, setShowAssignPrompt] = useState(false);
  const [newlyAddedDept, setNewlyAddedDept] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewDeptName(value);

    if (value) {
      const existingDeptNames = departments.map(d => d.name.toLowerCase());
      const filteredSuggestions = hospitalDepartmentSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        !existingDeptNames.includes(suggestion.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setNewDeptName(name);
    setSuggestions([]);
  };
  
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    if (departments.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This department name already exists on the list.');
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/departments`, { name: trimmed });
      const newDept = res.data;
      setDepartments((prev) => [...prev, newDept]);
      setNewDeptName('');
      setNewlyAddedDept(newDept);
      setShowAssignPrompt(true);
      setSuggestions([]);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.request) {
        errorMessage = 'Could not connect to the server.';
      } else {
        errorMessage = err.message;
      }
      alert(`Error: ${errorMessage}`);
      console.error('❌ Failed to add department:', err);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));
      if (selectedDepartment && selectedDepartment._id === id) {
        setShowPopup(false);
        setSelectedDepartment(null);
      }
    } catch (err) {
      alert('Failed to delete department');
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

  const handleNavigateToAssignHOD = () => {
    if (!newlyAddedDept) return;
    navigate(`/dashboard/admin/add-hod/${newlyAddedDept._id}?departmentName=${encodeURIComponent(newlyAddedDept.name)}`);
    setShowAssignPrompt(false);
  };
  
  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-8 min-h-screen bg-slate-50/50 font-sans text-slate-800">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Departments</h1>
          <p className="text-slate-500 mt-2 font-medium">Add, edit, or remove hospital departments</p>
        </div>

        {/* Add Department Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Icons.Plus />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Add New Department</h2>
          </div>
          
          <form onSubmit={handleAddDepartment} className="relative">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-full flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder="E.g. Cardiology, Neurology..."
                        value={newDeptName}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400"
                        autoComplete="off"
                    />
                    
                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <ul className="absolute z-40 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto overflow-x-hidden animate-fade-in-down">
                        {suggestions.map((name, index) => (
                            <li
                            key={`${name}-${index}`}
                            className="px-4 py-3 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium text-slate-600 transition-colors border-b border-slate-50 last:border-b-0"
                            onClick={() => handleSuggestionClick(name)}
                            >
                            {name}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
                
                <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 transform active:scale-95 whitespace-nowrap"
                >
                    <Icons.Plus />
                    Add Department
                </button>
            </div>
          </form>
        </div>

        {/* Departments Grid */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Existing Departments</h2>
                <span className="bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-full">
                    Total: {departments.length}
                </span>
            </div>
          
          {departments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {departments.map((dept) => (
                <div 
                  key={dept._id} 
                  className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleDepartmentClick(dept)}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <Icons.Building />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate" title={dept.name}>
                            {dept.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {dept.head_doctor_id 
                              ? `HOD: Dr. ${dept.head_doctor_id.firstName?.charAt(0)}. ${dept.head_doctor_id.lastName}`
                              : 'Click to manage'
                            }
                          </p>
                        </div>
                    </div>

                    {/* Action Buttons (Visible on Hover) */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white pl-2 rounded-lg shadow-sm">
                        <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDepartmentClick(dept);
                            }} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" 
                            title="Manage Department"
                        >
                            <Icons.Edit />
                        </button>
                    </div>
                </div>
                ))}
            </div>
          ) : (
              <div className="text-center py-12">
                  <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                      <Icons.Building className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No departments added yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Start by adding a department above.</p>
              </div>
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

      <AssignHODPromptModal
        isOpen={showAssignPrompt}
        onClose={() => setShowAssignPrompt(false)}
        onConfirm={handleNavigateToAssignHOD}
        departmentName={newlyAddedDept?.name}
      />
    </Layout>
  );
};

export default SelectDepartment;