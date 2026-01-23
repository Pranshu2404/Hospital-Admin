// File: src/pages/dashboard/admin/EditDoctor.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { SearchableFormSelect } from '../../../components/common/FormElements';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// --- Icons ---
const Icons = {
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
};

// --- Reusable Input Components (Consistent with Add Form) ---
const FormInput = ({ label, type = "text", value, onChange, required, disabled }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-500"
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, required }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled>Select Option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, deptRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`)
        ]);
        
        // Ensure department is set correctly (handle populated object vs ID)
        const doctorData = doctorRes.data;
        if (doctorData.department && typeof doctorData.department === 'object') {
            doctorData.department = doctorData.department._id;
        }

        setFormData(doctorData);
        setDepartmentOptions(deptRes.data.map(d => ({ value: d._id, label: d.name })));
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`, formData);
      navigate('/dashboard/admin/doctor-list');
    } catch (err) {
      console.error('Failed to update doctor:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <Layout sidebarItems={adminSidebar}>
        <div className="flex h-screen items-center justify-center text-slate-400 font-medium">Loading Doctor Details...</div>
    </Layout>
  );

  if (!formData) return <div className="p-8 text-center text-red-500">Doctor not found.</div>;

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-8 min-h-screen bg-slate-50/50 font-sans text-slate-800 flex justify-center">
        <div className="w-full max-w-5xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                    >
                        <Icons.ArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h2>
                        <p className="text-slate-500 text-sm">Update information for Dr. {formData.firstName} {formData.lastName}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 space-y-8">
                    
                    {/* Personal Information Group */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
                            <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
                            <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                            <FormInput label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                        </div>
                    </div>

                    {/* Professional Information Group */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">Professional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SearchableFormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} required />
                            <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} />
                            <FormInput label="License Number" value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} required />
                            <FormInput label="Experience (Years)" type="number" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} />
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1">Education / Qualifications</label>
                                <textarea 
                                    value={formData.education} 
                                    onChange={(e) => handleInputChange('education', e.target.value)}
                                    rows={3}
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Shift & Emergency Group */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">Shift & Emergency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SearchableFormSelect 
                                label="Shift" 
                                value={formData.shift} 
                                onChange={(e) => handleInputChange('shift', e.target.value)} 
                                options={[{value:'Morning',label:'Morning'}, {value:'Evening',label:'Evening'}, {value:'Night',label:'Night'}, {value:'Rotating',label:'Rotating'}]} 
                                required 
                            />
                            <FormInput label="Emergency Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} />
                            <FormInput label="Emergency Phone" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)} />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white hover:border-slate-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditDoctor;