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

  const handleShiftChange = (value) => {
    let slots = [{ start: '', end: '' }];
    if (value === 'Morning') slots = [{ start: '07:00', end: '15:00' }];
    else if (value === 'Evening') slots = [{ start: '15:00', end: '23:00' }];
    else if (value === 'Night') slots = [{ start: '23:00', end: '07:00' }];
    else if (value === 'Rotating') slots = [
      { start: '07:00', end: '15:00' }, { start: '15:00', end: '23:00' }, { start: '23:00', end: '07:00' }
    ];
    setFormData(prev => ({ ...prev, shift: value, timeSlots: slots }));
  };

  const handleAddTimeSlot = () => {
    setFormData(prev => ({ ...prev, timeSlots: [...(prev.timeSlots || []), { start: '', end: '' }] }));
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData(prev => ({ ...prev, timeSlots: (prev.timeSlots || []).filter((_, i) => i !== index) }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    setFormData(prev => {
      const slots = [...(prev.timeSlots || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, timeSlots: slots };
    });
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
                  <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                  <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                  <FormInput label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                  <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth?.split('T')[0]} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
                  <SearchableFormSelect
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                  />
                  <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value)} maxLength={12} />
                  <FormInput label="Full Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                    <FormInput label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                  </div>
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
                  <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} maxLength={10} />

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

              {/* Employment & Financial Details */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">Employment & Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormInput label="Joining Date" type="date" value={formData.startDate?.split('T')[0]} onChange={(e) => handleInputChange('startDate', e.target.value)} required />

                  <SearchableFormSelect
                    label="Employment Type"
                    value={formData.isFullTime ? 'Full-time' : 'Part-time'}
                    onChange={(e) => {
                      const isFull = e.target.value === 'Full-time';
                      setFormData(prev => ({
                        ...prev,
                        isFullTime: isFull,
                        shift: isFull ? prev.shift : '', // Clear shift if part-time
                        revenuePercentage: isFull ? 100 : prev.revenuePercentage
                      }));
                    }}
                    options={[{ value: 'Full-time', label: 'Full-time (Salaried)' }, { value: 'Part-time', label: 'Part-time (Consultant)' }]}
                  />
                </div>

                {formData.isFullTime ? (
                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">Shift Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SearchableFormSelect
                        label="Shift"
                        value={formData.shift}
                        onChange={(e) => handleShiftChange(e.target.value)}
                        options={[{ value: 'Morning', label: 'Morning' }, { value: 'Evening', label: 'Evening' }, { value: 'Night', label: 'Night' }, { value: 'Rotating', label: 'Rotating' }]}
                        required
                      />
                      <FormInput
                        label="Annual Salary (₹)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                      />
                    </div>
                    {formData.shift && formData.timeSlots && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                        <label className="text-xs font-bold text-emerald-600 uppercase mb-2 block">Active Timings</label>
                        <div className="flex flex-wrap gap-2">
                          {formData.timeSlots.map((slot, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">Consultant Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <SearchableFormSelect
                        label="Payment Model"
                        value={formData.paymentType}
                        onChange={(e) => handleInputChange('paymentType', e.target.value)}
                        options={[{ value: 'Fee per Visit', label: 'Fee per Visit' }, { value: 'Per Hour', label: 'Per Hour' }]}
                      />
                      <FormInput
                        label="Rate / Amount (₹)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                      />
                      <FormInput label="Contract Start" type="date" value={formData.contractStartDate?.split('T')[0]} onChange={(e) => handleInputChange('contractStartDate', e.target.value)} />
                      <FormInput label="Contract End" type="date" value={formData.contractEndDate?.split('T')[0]} onChange={(e) => handleInputChange('contractEndDate', e.target.value)} />
                    </div>

                    {/* Revenue Percentage */}
                    <div className="mb-6 p-4 bg-blue-100/50 rounded-xl border border-blue-200">
                      <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Doctor's Revenue Percentage: {formData.revenuePercentage}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.revenuePercentage || 0}
                        onChange={(e) => handleInputChange('revenuePercentage', parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Time Slots Management */}
                    <div>
                      <label className="block text-xs font-bold text-blue-700 uppercase mb-3">Available Time Slots</label>
                      <div className="space-y-3">
                        {(formData.timeSlots || []).map((slot, i) => (
                          <div key={i} className="grid grid-cols-3 gap-3 items-center">
                            <input
                              type="time"
                              value={slot.start || ''}
                              onChange={(e) => handleTimeSlotChange(i, 'start', e.target.value)}
                              className="col-span-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                            />
                            <input
                              type="time"
                              value={slot.end || ''}
                              onChange={(e) => handleTimeSlotChange(i, 'end', e.target.value)}
                              className="col-span-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                            />
                            <button type="button" onClick={() => handleRemoveTimeSlot(i)} className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm">Remove</button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddTimeSlot} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">Add Time Slot</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact Group */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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