// File: src/pages/dashboard/admin/EditDoctor.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import {
  FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStethoscope,
  FaAward, FaBirthdayCake, FaVenusMars, FaBuilding, FaClock,
  FaFileAlt, FaMoneyBillWave, FaIdCard, FaEdit, FaCheckCircle,
  FaCalendarAlt, FaBriefcase, FaTimes, FaSave, FaExclamationCircle,
  FaGraduationCap
} from 'react-icons/fa';

const SectionTitle = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <Icon className="text-teal-600" />
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
  </div>
);

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, deptRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`)
        ]);

        const doctorData = doctorRes.data;
        if (doctorData.department && typeof doctorData.department === 'object') {
          doctorData.department = doctorData.department._id;
        }

        setFormData(doctorData);
        setDepartmentOptions(deptRes.data.map(d => ({ value: d._id, label: d.name })));
      } catch (err) {
        console.error('Failed to load data', err);
        setMessage({ type: 'error', text: 'Failed to load doctor data' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`, formData);
      setMessage({ type: 'success', text: 'Doctor profile updated successfully' });
      setTimeout(() => navigate('/dashboard/admin/doctor-list'), 1500);
    } catch (err) {
      console.error('Failed to update doctor:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => {
    try {
      return d ? new Date(d).toLocaleDateString() : '-';
    } catch {
      return d || '-';
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="flex h-screen items-center justify-center text-slate-400 font-medium">Loading Doctor Details...</div>
      </Layout>
    );
  }

  if (!formData) return <div className="p-8 text-center text-red-500">Doctor not found.</div>;

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="min-h-screen bg-slate-50/50 p-2 font-sans">

        {/* Header Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-teal-600 to-cyan-700 relative"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-lg">
                  <img
                    src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0d9488&color=fff&size=128`}
                    alt="Doctor"
                    className="w-full h-full object-cover rounded-xl bg-slate-100"
                  />
                </div>
                <div className="absolute bottom-1 -right-1 bg-green-500 border-4 border-white w-5 h-5 rounded-full" title="Active"></div>
              </div>

              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      Dr. {formData.firstName} {formData.lastName}
                      <FaCheckCircle className="text-blue-500 text-sm" title="Verified" />
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm">
                        <FaIdCard className="text-xs" /> {formData.doctorId || 'ID: --'}
                      </span>
                      <span className="text-sm border flex items-center gap-1 px-2 rounded-md bg-slate-50">
                        <FaStethoscope className="text-xs text-slate-400" /> {formData.specialization || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 text-slate-600 font-semibold hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-semibold shadow-md shadow-teal-500/20"
                    >
                      <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Experience</p>
                <p className="text-xl font-bold text-slate-800">{formData.experience || 0} Years</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Joined</p>
                <p className="text-xl font-bold text-slate-800">{fmtDate(formData.startDate || formData.createdAt)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Type</p>
                <p className="text-xl font-bold text-slate-800">{formData.isFullTime ? 'Full-Time' : 'Part-Time'}</p>
              </div>
              {/* <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Patients</p>
                <p className="text-xl font-bold text-slate-800">--</p>
              </div> */}
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`max-w-5xl mx-auto mb-4 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.type === 'success' ? <FaCheckCircle className="inline mr-2" /> : <FaExclamationCircle className="inline mr-2" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Personal Details" icon={FaUserMd} />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                  <input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                  <input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                  <input name="dateOfBirth" type="date" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Address & Location" icon={FaMapMarkerAlt} />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Address</label>
                  <textarea name="address" rows="2" value={formData.address || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                    <input name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                    <input name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Important IDs" icon={FaIdCard} />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhar Number</label>
                  <input name="aadharNumber" value={formData.aadharNumber || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number</label>
                  <input name="panNumber" value={formData.panNumber || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Professional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Professional Details" icon={FaStethoscope} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select name="department" value={formData.department || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option value="">Select Department</option>
                    {departmentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
                  <input name="specialization" value={formData.specialization || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
                  <input name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Experience (Years)</label>
                  <input name="experience" type="number" value={formData.experience || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Education</label>
                  <textarea name="education" rows="3" value={formData.education || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
              </div>
            </div>

            {/* Employment & Financial */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Employment & Compensation" icon={FaMoneyBillWave} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Joining Date</label>
                  <input name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employment Type</label>
                  <select
                    value={formData.isFullTime ? 'Full-time' : 'Part-time'}
                    onChange={(e) => {
                      const isFull = e.target.value === 'Full-time';
                      setFormData(prev => ({
                        ...prev,
                        isFullTime: isFull,
                        shift: isFull ? prev.shift : '',
                        revenuePercentage: isFull ? 100 : prev.revenuePercentage
                      }));
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50"
                  >
                    <option value="Full-time">Full-time (Salaried)</option>
                    <option value="Part-time">Part-time (Consultant)</option>
                  </select>
                </div>
              </div>

              {formData.isFullTime ? (
                <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">Shift</label>
                      <select name="shift" value={formData.shift || ''} onChange={(e) => handleShiftChange(e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500">
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                        <option value="Rotating">Rotating</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">Annual Salary (₹)</label>
                      <input name="amount" type="number" value={formData.amount || ''} onChange={handleInputChange} className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500" />
                    </div>
                  </div>
                  {/* Time Slots Display for Full Time */}
                  {formData.timeSlots && formData.timeSlots.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-2">Shift Timings:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.timeSlots.map((slot, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 bg-white border border-emerald-100 text-emerald-600 rounded text-xs">
                            <FaClock className="mr-1" /> {slot.start} - {slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Payment Model</label>
                      <select name="paymentType" value={formData.paymentType || ''} onChange={handleInputChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500">
                        <option value="Fee per Visit">Fee per Visit</option>
                        <option value="Per Hour">Per Hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Rate / Amount (₹)</label>
                      <input name="amount" type="number" value={formData.amount || ''} onChange={handleInputChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Contract Start</label>
                      <input name="contractStartDate" type="date" value={formData.contractStartDate?.split('T')[0] || ''} onChange={handleInputChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Contract End</label>
                      <input name="contractEndDate" type="date" value={formData.contractEndDate?.split('T')[0] || ''} onChange={handleInputChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-100">
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Revenue Share Percentage ({formData.revenuePercentage}%)</label>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={formData.revenuePercentage || 0}
                      name="revenuePercentage"
                      onChange={handleInputChange}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Time Slots Management (Mainly for Part Time, but editable for all) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Schedule & Availability" icon={FaClock} />
              <div className="space-y-3">
                {(formData.timeSlots || []).map((slot, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 block">Start</label>
                      <input type="time" value={slot.start || ''} onChange={(e) => handleTimeSlotChange(i, 'start', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 block">End</label>
                      <input type="time" value={slot.end || ''} onChange={(e) => handleTimeSlotChange(i, 'end', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" />
                    </div>
                    <div className="pt-4">
                      <button type="button" onClick={() => handleRemoveTimeSlot(i)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded hover:bg-red-100">
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddTimeSlot} className="mt-2 text-sm text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1">
                  + Add Time Slot
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Emergency Contact" icon={FaPhone} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Name</label>
                  <input name="emergencyContact" value={formData.emergencyContact || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Phone</label>
                  <input name="emergencyPhone" value={formData.emergencyPhone || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditDoctor;