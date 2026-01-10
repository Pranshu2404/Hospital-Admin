import React, { useEffect, useState } from 'react';
import { Button } from '../common/FormElements';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStethoscope,
  FaAward, FaBirthdayCake, FaVenusMars, FaBuilding, FaClock,
  FaFileAlt, FaMoneyBillWave, FaIdCard, FaEdit, FaCheckCircle,
  FaCalendarAlt, FaBriefcase, FaTimes, FaSave, FaExclamationCircle
} from 'react-icons/fa';

const StaffProfile = ({ selectedStaff, setCurrentPage }) => {
  const { user } = useAuth();
  const [staff, setStaff] = useState(selectedStaff || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedStaff) {
      setStaff(selectedStaff);
      return;
    }

    const staffId = localStorage.getItem('staffId');
    if (!staffId) {
      setError('No staff selected or logged in.');
      return;
    }

    const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setStaff(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [selectedStaff, user]);

  const fmtDate = (d) => {
    try {
      return d ? new Date(d).toLocaleDateString() : '-';
    } catch {
      return d || '-';
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (staff) setFormData({
      first_name: staff.first_name || staff.name || '',
      last_name: staff.last_name || '',
      email: staff.email || '',
      phone: staff.phone || staff.mobile || '',
      role: staff.role || '',
      department: staff.department || '',
      specialization: staff.specialization || '',
      gender: staff.gender || '',
      status: staff.status || '',
      aadharNumber: staff.aadharNumber || '',
      panNumber: staff.panNumber || '',
      joined_at: staff.joined_at ? new Date(staff.joined_at).toISOString().split('T')[0] : (staff.joinedDate ? new Date(staff.joinedDate).toISOString().split('T')[0] : ''),
      notes: staff.notes || ''
    });
  }, [staff]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!staff?._id) return setMessage({ type: 'error', text: 'Invalid staff id' });
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const payload = { ...formData };
      const res = await apiClient.put(`/staff/${staff._id}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setStaff(res.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (staff) {
      setFormData(prev => ({
        ...prev,
        first_name: staff.first_name || staff.name || '',
        last_name: staff.last_name || '',
        email: staff.email || '',
        phone: staff.phone || staff.mobile || '',
        role: staff.role || '',
        department: staff.department || '',
        specialization: staff.specialization || '',
        gender: staff.gender || '',
        status: staff.status || '',
        aadharNumber: staff.aadharNumber || '',
        panNumber: staff.panNumber || '',
        joined_at: staff.joined_at ? new Date(staff.joined_at).toISOString().split('T')[0] : (staff.joinedDate ? new Date(staff.joinedDate).toISOString().split('T')[0] : ''),
      }));
    }
    setMessage({ type: '', text: '' });
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => setCurrentPage && setCurrentPage('StaffList')} className="mt-4">
          Back to Staff List
        </Button>
      </div>
    );

  if (!staff)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No staff selected</p>
        <Button onClick={() => setCurrentPage && setCurrentPage('StaffList')} className="mt-4">
          Back to Staff List
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 p-2 font-sans">
      <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-teal-600 to-cyan-700 relative"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-lg">
                <img
                  src={`https://ui-avatars.com/api/?name=${staff.first_name || staff.name}+${staff.last_name || ''}&background=0d9488&color=fff&size=128`}
                  alt="Staff"
                  className="w-full h-full object-cover rounded-xl bg-slate-100"
                />
              </div>
              <div className="absolute bottom-1 -right-1 bg-green-500 border-4 border-white w-5 h-5 rounded-full" title="Active"></div>
            </div>

            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {staff.first_name} {staff.last_name}
                    <FaCheckCircle className="text-blue-500 text-sm" title="Verified" />
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm">
                      <FaIdCard className="text-xs" /> {staff.staffId}
                    </span>
                    <span className="text-sm">• {staff.department || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
                  >
                    <FaEdit /> {isEditing ? 'View' : 'Edit'}
                  </button>
                  {setCurrentPage && <Button onClick={() => setCurrentPage('StaffList')}>Back</Button>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
              <p className="text-xl font-bold text-slate-800">{staff.status || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Joined</p>
              <p className="text-xl font-bold text-slate-800">{fmtDate(staff.joined_at || staff.joinedDate || staff.createdAt)}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Role</p>
              <p className="text-xl font-bold text-slate-800">{staff.role || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase">Dept.</p>
              <p className="text-xl font-bold text-slate-800">{staff.department || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`max-w-3xl mx-auto mb-4 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <FaCheckCircle className="inline mr-2" /> : <FaExclamationCircle className="inline mr-2" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Main grid - left personal, right professional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Personal Details" icon={FaUserMd} />
            <div className="space-y-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                    <input name="first_name" value={formData.first_name || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                    <input name="last_name" value={formData.last_name || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
              ) : (
                <>
                  <ProfileField icon={FaEnvelope} label="Email" value={staff.email} />
                  <ProfileField icon={FaPhone} label="Phone" value={staff.phone || staff.mobile} />
                  <ProfileField icon={FaVenusMars} label="Gender" value={staff.gender} />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Emergency & Legal" icon={FaPhone} />
            <div className="space-y-1">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhar Number</label>
                    <input name="aadharNumber" value={formData.aadharNumber || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number</label>
                    <input name="panNumber" value={formData.panNumber || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                </>
              ) : (
                <>
                  <ProfileField icon={FaIdCard} label="Aadhar Number" value={staff.aadharNumber} />
                  <ProfileField icon={FaIdCard} label="PAN Number" value={staff.panNumber} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <SectionTitle title="Professional Information" icon={FaBriefcase} />

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                  <input name="role" value={formData.role || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <input name="department" value={formData.department || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
                  <input name="specialization" value={formData.specialization || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select name="status" value={formData.status || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Joined At</label>
                  <input name="joined_at" type="date" value={formData.joined_at || ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField icon={FaBuilding} label="Department" value={staff.department} />
                <ProfileField icon={FaStethoscope} label="Specialization" value={staff.specialization} />
                <ProfileField icon={FaBriefcase} label="Role" value={staff.role} />
                <ProfileField icon={FaCalendarAlt} label="Joined" value={fmtDate(staff.joined_at || staff.joinedDate || staff.createdAt)} />
              </div>
            )}

            {staff.notes && !isEditing && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><FaFileAlt className="text-slate-400" /> Additional Notes</h4>
                <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-lg border border-amber-100">{staff.notes}</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={handleCancel} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold disabled:opacity-50">
                  <FaTimes /> Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50">
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
