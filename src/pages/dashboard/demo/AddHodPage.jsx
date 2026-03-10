import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// --- Badges Helper ---
const getStatusBadge = (status) => {
  const styles = {
    'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
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

// --- Custom Icons ---
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  CheckBadge: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
};

const AddHodPage = () => {
  const { id } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const deptRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
        setDepartment(deptRes.data);

        const docRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/department/${id}`);
        setDoctors(docRes.data);
      } catch (err) {
        console.error(err);
       // setSuccess('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSetHod = async (doctorId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`, {
        head_doctor_id: doctorId
      });
      setSuccess('HOD assigned successfully!');
      
      // Update local state immediately
      const deptRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
      setDepartment(deptRes.data);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setSuccess('Failed to assign HOD');
    }
  };

  if (loading) return (
    <Layout sidebarItems={adminSidebar}>
      <div className="flex items-center justify-center min-h-[600px] text-slate-400 font-medium">Loading Department Data...</div>
    </Layout>
  );

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-8 min-h-screen bg-slate-50/50 font-sans text-slate-800">
        
        {/* Header */}
        <div className="mb-8">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors"
            >
                <Icons.ArrowLeft /> Back to Departments
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {department?.name}
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-200 font-bold uppercase tracking-wider">
                            Department
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-2">Select a qualified doctor from the list below to serve as Head of Department.</p>
                </div>
            </div>
        </div>

        {/* Current HOD Card */}
        {department?.head_doctor_id && (
            <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-emerald-600">
                    {/* <Icons.CheckBadge className="w-8 h-8" /> Replaced with CheckBadge icon but sized up */}
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-1">Current Head of Department</h3>
                    <p className="text-xl font-bold text-slate-900">
                        Dr. {department.head_doctor_id.firstName} {department.head_doctor_id.lastName}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">{department.head_doctor_id.specialization} • {department.head_doctor_id.experience || 'N/A'} Yrs Experience</p>
                </div>
            </div>
        )}

        {/* Feedback Message */}
        {success && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${success.includes('Failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                <span className={`p-1 rounded-full ${success.includes('Failed') ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    {success.includes('Failed') ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    )}
                </span>
                <span className="font-medium text-sm">{success}</span>
            </div>
        )}

        {/* Doctors Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Available Doctors</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                        <tr>
                            <th className="px-8 py-4">Profile</th>
                            <th className="px-8 py-4">Specialization</th>
                            <th className="px-8 py-4">Contact</th>
                            <th className="px-8 py-4">Details</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {doctors.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center">
                                    <div className="inline-block p-4 rounded-full bg-slate-50 mb-3">
                                        <Icons.Building />
                                    </div>
                                    <p className="text-slate-500 font-medium">No doctors found in this department.</p>
                                    <p className="text-slate-400 text-sm">Add doctors to {department?.name} first.</p>
                                </td>
                            </tr>
                        ) : (
                            doctors.map((member) => (
                                <tr key={member._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">
                                                {member.firstName?.[0]}{member.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{member.firstName} {member.lastName}</div>
                                                <div className="text-xs text-slate-400">Lic: {member.licenseNumber || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-slate-600">
                                        {member.specialization || 'General'}
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="text-sm text-slate-900">{member.phone}</div>
                                        <div className="text-xs text-slate-400">{member.email}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{member.experience ? `${member.experience} Yrs` : 'N/A'} Exp</span>
                                            {member.shift && <span className={getShiftBadge(member.shift)}>{member.shift}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={getStatusBadge(member.status || 'Active')}>{member.status || 'Active'}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        {department?.head_doctor_id?._id === member._id ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                                                <Icons.CheckBadge /> Current HOD
                                            </span>
                                        ) : (
                                            <button
                                                className="bg-white hover:bg-emerald-600 text-slate-600 hover:text-white border border-slate-200 hover:border-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
                                                onClick={() => handleSetHod(member._id)}
                                            >
                                                Assign
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddHodPage;