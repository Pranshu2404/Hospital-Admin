import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import {
  FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStethoscope,
  FaAward, FaBirthdayCake, FaVenusMars, FaBuilding, FaClock,
  FaFileAlt, FaMoneyBillWave, FaIdCard, FaEdit, FaCheckCircle,
  FaCalendarAlt, FaBriefcase, FaGraduationCap, FaTimes, FaSave, FaExclamationCircle
} from 'react-icons/fa';

const DoctorProfilePage1 = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({});

  const doctorId = localStorage.getItem('doctorId');

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`
        );
        setDoctor(response.data);
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchDoctorProfile();
  }, [doctorId]);

  // --- Helper Components ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`,
        formData
      );

      setDoctor(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(doctor);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  // --- Helper Components ---

  const ProfileField = ({ icon: Icon, label, value, colorClass = "text-slate-400" }) => (
    <div className="flex items-start group p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`mt-1 mr-3 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-700 font-medium text-sm break-all">{value || <span className="text-slate-300 italic">Not provided</span>}</p>
      </div>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <Icon className="text-teal-600" />
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
  );

  const StatusBadge = ({ fullTime }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
      fullTime 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {fullTime ? 'Full-Time' : 'Part-Time'}
    </span>
  );

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const EditForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Grid of Edit Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase">Address</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase">Professional</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Shift</label>
              <select
                name="shift"
                value={formData.shift || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency & Other */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase">Emergency & Legal</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhar Number</label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          rows="4"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-slate-200">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold disabled:opacity-50"
        >
          <FaTimes /> Cancel
        </button>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  // --- Render States ---

  if (loading) {
    return (
      <Layout sidebarItems={doctorSidebar} section="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[85vh] bg-slate-50/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Retrieving physician record...</p>
        </div>
      </Layout>
    );
  }

  if (error || !doctor) {
    return (
      <Layout sidebarItems={doctorSidebar} section="Doctor">
        <div className="p-8 flex items-center justify-center min-h-[85vh]">
          <div className="text-center max-w-md">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUserMd className="text-red-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Profile Unavailable</h3>
            <p className="text-slate-500 mb-6">{error || "We couldn't find the doctor details you requested."}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
              Retry Connection
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="min-h-screen bg-slate-50/50 p-2 font-sans">
        
        {/* --- Hero Section --- */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-teal-600 to-cyan-700 relative">
            <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div> {/* Abstract pattern overlay */}
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg">
                  <img 
                    src={doctor.user_id?.profile_image || `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0d9488&color=fff&size=128`} 
                    alt="Doctor" 
                    className="w-full h-full object-cover rounded-xl bg-slate-100"
                  />
                </div>
                <div className="absolute bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full" title="Active"></div>
              </div>

              {/* Name & Title */}
              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                      Dr. {doctor.firstName} {doctor.lastName}
                      <FaCheckCircle className="text-blue-500 text-lg" title="Verified Profile" />
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm">
                        <FaStethoscope className="text-xs" /> {doctor.specialization}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="text-sm">{doctor.department?.name || 'General Department'}</span>
                      <span className="hidden md:inline">•</span>
                      <StatusBadge fullTime={doctor.isFullTime} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-all shadow-md text-sm font-semibold"
                  >
                    <FaEdit /> {isEditing ? 'View Profile' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
               <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <p className="text-xs text-slate-500 font-bold uppercase">Experience</p>
                 <p className="text-xl font-bold text-slate-800">{doctor.experience}+ Years</p>
               </div>
               <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <p className="text-xs text-slate-500 font-bold uppercase">Doctor ID</p>
                 <p className="text-xl font-bold text-slate-800 font-mono tracking-tight">{doctor.doctorId}</p>
               </div>
               <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <p className="text-xs text-slate-500 font-bold uppercase">Joined</p>
                 <p className="text-lg font-bold text-slate-800">{formatDate(doctor.joined_at)}</p>
               </div>
               <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <p className="text-xs text-slate-500 font-bold uppercase">Shift</p>
                 <p className="text-lg font-bold text-slate-800">{doctor.shift}</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        {isEditing ? (
          <EditForm />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Personal & Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Personal Details" icon={FaUserMd} />
              <div className="space-y-1">
                <ProfileField icon={FaEnvelope} label="Email Address" value={doctor.email} />
                <ProfileField icon={FaPhone} label="Phone Number" value={doctor.phone} />
                <ProfileField icon={FaBirthdayCake} label="Date of Birth" value={formatDate(doctor.dateOfBirth)} />
                <ProfileField icon={FaVenusMars} label="Gender" value={doctor.gender} />
                <div className="my-4 border-t border-slate-100"></div>
                <ProfileField icon={FaMapMarkerAlt} label="Address" value={`${doctor.address}, ${doctor.city}`} />
                <ProfileField icon={FaBuilding} label="State / Zip" value={`${doctor.state} - ${doctor.zipCode}`} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-l-4 border-l-red-400">
              <SectionTitle title="Emergency Contact" icon={FaPhone} />
              <div className="space-y-1">
                <ProfileField icon={FaUserMd} label="Contact Name" value={doctor.emergencyContact} colorClass="text-red-400" />
                <ProfileField icon={FaPhone} label="Emergency Phone" value={doctor.emergencyPhone} colorClass="text-red-400" />
              </div>
            </div>
          </div>

          {/* Middle Column: Professional */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Professional Information" icon={FaBriefcase} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-3 bg-slate-50 p-2 rounded">Qualifications</h4>
                   <div className="space-y-1">
                      <ProfileField icon={FaGraduationCap} label="Education" value={doctor.education} colorClass="text-blue-500" />
                      <ProfileField icon={FaAward} label="Specialization" value={doctor.specialization} colorClass="text-blue-500" />
                      <ProfileField icon={FaIdCard} label="License Number" value={doctor.licenseNumber} colorClass="text-blue-500" />
                   </div>
                </div>
                
                <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-3 bg-slate-50 p-2 rounded">Employment</h4>
                   <div className="space-y-1">
                      <ProfileField icon={FaBuilding} label="Department" value={doctor.department?.name} colorClass="text-purple-500" />
                      <ProfileField icon={FaCalendarAlt} label="Start Date" value={formatDate(doctor.startDate)} colorClass="text-purple-500" />
                      {doctor.contractEndDate && (
                        <ProfileField icon={FaCalendarAlt} label="Contract Ends" value={formatDate(doctor.contractEndDate)} colorClass="text-purple-500" />
                      )}
                   </div>
                </div>
              </div>

              {doctor.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-slate-400" /> Additional Notes
                  </h4>
                  <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-lg border border-amber-100 leading-relaxed">
                    {doctor.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Info (Collapsible style visually) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Financial & Legal" icon={FaMoneyBillWave} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Pan Number</p>
                    <p className="font-mono font-medium text-slate-800">{doctor.panNumber || 'N/A'}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Aadhar Number</p>
                    <p className="font-mono font-medium text-slate-800">{doctor.aadharNumber || 'N/A'}</p>
                 </div>
                 <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Current Salary</p>
                    <p className="font-bold text-emerald-800 text-lg">₹ {doctor.amount?.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 mt-1">{doctor.paymentType}</p>
                 </div>
              </div>
            </div>
          </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorProfilePage1;