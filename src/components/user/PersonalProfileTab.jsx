import { useState } from 'react';
import axios from 'axios';
import { Button } from '../common/FormElements';
import { EditIcon } from '../common/Icons';
import {
  FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFileAlt, FaCheckCircle, FaExclamationCircle, FaEdit,
  FaTimes, FaSave, FaShieldAlt, FaHospital
} from 'react-icons/fa';

const PersonalProfileTab = ({ hospitalData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    hospitalName: hospitalData?.hospitalName || '',
    adminName: hospitalData?.name || '',
    email: hospitalData?.email || '',
    phone: hospitalData?.contact || '',
    address: hospitalData?.address || '',
    registryNo: hospitalData?.registryNo || '',
    hospitalID: hospitalData?.hospitalID || '',
    companyName: hospitalData?.companyName || '',
    companyNumber: hospitalData?.companyNumber || '',
    fireNOC: hospitalData?.fireNOC || '',
    healthBima: hospitalData?.healthBima || '',
    additionalInfo: hospitalData?.additionalInfo || '',
    logo: hospitalData?.logo || null,
    newLogo: null // For handling file upload
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('hospitalName', profileData.hospitalName);
      formData.append('name', profileData.adminName);
      formData.append('email', profileData.email);
      formData.append('contact', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('registryNo', profileData.registryNo);
      formData.append('companyName', profileData.companyName);
      formData.append('companyNumber', profileData.companyNumber);
      formData.append('fireNOC', profileData.fireNOC);
      formData.append('healthBima', profileData.healthBima);
      formData.append('additionalInfo', profileData.additionalInfo);

      if (profileData.newLogo) {
        formData.append('logo', profileData.newLogo);
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalData._id}/details`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update local state with returned data (especially new logo URL if changed)
      if (response.data.hospital) {
        const updated = response.data.hospital;
        setProfileData(prev => ({
          ...prev,
          logo: updated.logo,
          newLogo: null
        }));
        // Emit event to update Sidebar
        window.dispatchEvent(new Event('vitals-updated')); // Reusing existing event or create new one? Sidebar listens to 'vitals-updated' but maybe we should reload or use a specific one. 
        // Actually Sidebar fetches on mount. To force update we might need a page reload or context.
        // For now let's just show success. Ideally, use a context for hospital data.
      }

      setMessage({ type: 'success', text: 'Hospital details updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Optional: Refresh page to show new logo in Sidebar if state not shared
      // window.location.reload(); 
    } catch (err) {
      console.error('Error updating hospital details:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update details' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      hospitalName: hospitalData?.hospitalName || '',
      adminName: hospitalData?.name || '',
      email: hospitalData?.email || '',
      phone: hospitalData?.contact || '',
      address: hospitalData?.address || '',
      registryNo: hospitalData?.registryNo || '',
      hospitalID: hospitalData?.hospitalID || '',
      companyName: hospitalData?.companyName || '',
      companyNumber: hospitalData?.companyNumber || '',
      fireNOC: hospitalData?.fireNOC || '',
      healthBima: hospitalData?.healthBima || '',
      additionalInfo: hospitalData?.additionalInfo || ''
    });
    setMessage({ type: '', text: '' });
  };

  const ProfileField = ({ icon: Icon, label, value, colorClass = 'text-slate-400' }) => (
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

  return (
    <div className="min-h-screen bg-slate-50/50 p-2 font-sans">
      {/* Hero Section */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-r from-teal-600 to-cyan-700 relative">
          <div className="absolute inset-0 opacity-10"></div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg relative group">
                {profileData.newLogo ? (
                  <img
                    src={URL.createObjectURL(profileData.newLogo)}
                    alt="New Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : profileData.logo ? (
                  <img
                    src={profileData.logo}
                    alt="Hospital Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                    <FaHospital className="text-4xl text-white" />
                  </div>
                )}

                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                      <FaEdit /> Change
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setProfileData(prev => ({ ...prev, newLogo: e.target.files[0] }));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="absolute bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full"></div>
            </div>

            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    {profileData.hospitalName || 'Hospital'}
                    <FaCheckCircle className="text-blue-500 text-lg" title="Verified" />
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm">
                      <FaFileAlt className="text-xs" /> ID: {profileData.hospitalID}
                    </span>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
                  >
                    <FaEdit /> Edit Details
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      <FaSave /> {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Registry No</p>
              <p className="text-lg font-bold text-slate-800">{profileData.registryNo || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Admin</p>
              <p className="text-lg font-bold text-slate-800 truncate">{profileData.adminName || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Company</p>
              <p className="text-lg font-bold text-slate-800 truncate">{profileData.companyName || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-bold uppercase">Status</p>
              <p className="text-lg font-bold text-emerald-800">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Message */}
      {message.text && (
        <div className={`max-w-5xl mx-auto mb-4 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Hospital Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Hospital Details" icon={FaBuilding} />
            <div className="space-y-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      value={profileData.hospitalName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, hospitalName: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Registry No</label>
                    <input
                      type="text"
                      value={profileData.registryNo}
                      onChange={(e) => setProfileData(prev => ({ ...prev, registryNo: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ProfileField icon={FaBuilding} label="Hospital Name" value={profileData.hospitalName} />
                  <ProfileField icon={FaFileAlt} label="Registry No" value={profileData.registryNo} />
                  <ProfileField icon={FaMapMarkerAlt} label="Address" value={profileData.address} />
                </>
              )}
            </div>
          </div>

          {/* Admin Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Admin Details" icon={FaUser} />
            <div className="space-y-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={profileData.adminName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, adminName: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contact</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ProfileField icon={FaUser} label="Admin Name" value={profileData.adminName} />
                  <ProfileField icon={FaEnvelope} label="Email" value={profileData.email} />
                  <ProfileField icon={FaPhone} label="Contact" value={profileData.phone} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Company Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Company Information" icon={FaShieldAlt} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company Number</label>
                    <input
                      type="text"
                      value={profileData.companyNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyNumber: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fire NOC</label>
                    <input
                      type="text"
                      value={profileData.fireNOC}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fireNOC: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Health Bima Details</label>
                    <input
                      type="text"
                      value={profileData.healthBima}
                      onChange={(e) => setProfileData(prev => ({ ...prev, healthBima: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <ProfileField icon={FaBuilding} label="Company Name" value={profileData.companyName} />
                  <ProfileField icon={FaFileAlt} label="Company Number" value={profileData.companyNumber} />
                  <ProfileField icon={FaShieldAlt} label="Fire NOC" value={profileData.fireNOC} />
                  <ProfileField icon={FaShieldAlt} label="Health Bima" value={profileData.healthBima} />
                </>
              )}
            </div>
          </div>

          {/* Additional Information Card */}
          {(isEditing || profileData.additionalInfo) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Additional Information" icon={FaFileAlt} />
              {isEditing ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Additional Info</label>
                  <textarea
                    value={profileData.additionalInfo}
                    onChange={(e) => setProfileData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows="4"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="Add any additional notes..."
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-lg border border-amber-100 leading-relaxed">
                  {profileData.additionalInfo || 'No additional information'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalProfileTab;
