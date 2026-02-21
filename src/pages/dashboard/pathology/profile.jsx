// pages/dashboard/pathology/profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaUserMd,
  FaFlask,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const PathologyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    qualification: '',
    specialization: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  // Get current pathology staff ID from localStorage
  const pathologyStaffId = localStorage.getItem('pathologyStaffId');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // API: GET /pathology-staff/profile/me
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/pathology-staff/${pathologyStaffId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const staffData = response.data.data;
        setProfile(staffData);
        
        // Initialize form data
        setFormData({
          phone: staffData.phone || '',
          qualification: staffData.qualification || '',
          specialization: staffData.specialization || '',
          address: staffData.address || {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    // Add more validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setUpdating(true);
    setSuccessMessage('');

    try {
      // API: PUT /pathology-staff/profile/me
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/pathology-staff/profile/me`,
        formData
      );

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setEditMode(false);
        await fetchProfile(); // Refresh profile data
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setUpdating(true);
    setSuccessMessage('');

    try {
      // API: PUT /pathology-staff/change-password (you'll need to create this endpoint)
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/pathology-staff/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      );

      if (response.data.success) {
        setSuccessMessage('Password changed successfully!');
        setPasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ 
        password: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitials = () => {
    if (!profile) return 'PS';
    return `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`;
  };

  const getFullName = () => {
    if (!profile) return 'Pathology Staff';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  };

  if (loading) {
    return (
      <Layout sidebarItems={pathologySidebar} section="Pathology">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout sidebarItems={pathologySidebar} section="Pathology">
        <div className="flex flex-col items-center justify-center h-96">
          <FaExclamationTriangle className="text-5xl text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">Unable to load your profile. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserMd className="text-teal-600" />
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">View and manage your personal information</p>
          </div>
          {!editMode && !passwordMode && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={() => setPasswordMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaLock /> Change Password
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errors.submit}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white/50">
                  {getInitials()}
                </div>
                <h2 className="text-xl font-bold">{getFullName()}</h2>
                <p className="text-teal-100 mt-1">{profile.role?.replace('_', ' ') || 'Pathology Staff'}</p>
                <p className="text-xs text-teal-200 mt-2">Staff ID: {profile.staffId}</p>
              </div>

              {/* Quick Stats */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Performance Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tests Processed</span>
                      <span className="font-medium text-gray-800">{profile.tests_processed || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min((profile.tests_processed || 0) / 100 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Avg Turnaround</span>
                      <span className="font-medium text-gray-800">{profile.avg_turnaround_time || 0}h</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Accuracy Rate</span>
                      <span className="font-medium text-gray-800">{profile.accuracy_rate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.status === 'Active' ? 'bg-green-100 text-green-800' :
                      profile.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joined</span>
                    <span className="font-medium">{formatDate(profile.joined_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            {editMode ? (
              /* Edit Profile Form */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qualification
                        </label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          placeholder="e.g. MD Pathology, DMLT"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g. Hematology, Microbiology"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Address</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={formData.address.pincode}
                            onChange={(e) => handleAddressChange('pincode', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setErrors({});
                        // Reset form to original values
                        setFormData({
                          phone: profile.phone || '',
                          qualification: profile.qualification || '',
                          specialization: profile.specialization || '',
                          address: profile.address || {
                            street: '',
                            city: '',
                            state: '',
                            pincode: '',
                            country: 'India'
                          }
                        });
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : passwordMode ? (
              /* Change Password Form */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Change Password</h3>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="p-6 space-y-6">
                  {errors.password && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errors.password}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-12 border ${errors.currentPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-12 border ${errors.newPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 pr-12 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password strength indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              passwordData.newPassword.length >= level * 2
                                ? passwordData.newPassword.length >= 8
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Password strength: {
                          passwordData.newPassword.length < 4 ? 'Weak' :
                          passwordData.newPassword.length < 8 ? 'Medium' :
                          'Strong'
                        }
                      </p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordMode(false);
                        setErrors({});
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaLock /> Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* View Profile */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium text-gray-800">{getFullName()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-800">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-800">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="font-medium text-gray-800 capitalize">{profile.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-medium text-gray-800">{formatDate(profile.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Aadhar Number</p>
                      <p className="font-medium text-gray-800">{profile.aadharNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                      <p className="font-medium text-gray-800">{profile.panNumber || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <p className="font-medium text-gray-800 capitalize">{profile.role?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Qualification</p>
                        <p className="font-medium text-gray-800">{profile.qualification || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Specialization</p>
                        <p className="font-medium text-gray-800">{profile.specialization || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Department</p>
                        <p className="font-medium text-gray-800">{profile.department?.name || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {profile.address && (profile.address.street || profile.address.city) && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Address</h4>
                      <p className="text-gray-800">
                        {profile.address.street && `${profile.address.street}, `}
                        {profile.address.city && `${profile.address.city}, `}
                        {profile.address.state && `${profile.address.state} - `}
                        {profile.address.pincode}
                        {profile.address.country && `, ${profile.address.country}`}
                      </p>
                    </div>
                  )}

                  {/* Assigned Tests */}
                  {profile.assigned_lab_tests && profile.assigned_lab_tests.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <FaFlask className="text-teal-600" />
                        Assigned Lab Tests ({profile.assigned_lab_tests.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.assigned_lab_tests.slice(0, 6).map((test, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800">{test.lab_test_name}</p>
                            <p className="text-xs text-gray-500 mt-1">Code: {test.lab_test_code}</p>
                          </div>
                        ))}
                        {profile.assigned_lab_tests.length > 6 && (
                          <p className="text-sm text-teal-600 mt-2">
                            +{profile.assigned_lab_tests.length - 6} more tests
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PathologyProfile;