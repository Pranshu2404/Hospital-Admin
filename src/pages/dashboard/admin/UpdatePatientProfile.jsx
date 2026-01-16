import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar';
import { useLocation } from 'react-router-dom';
import { FaUser, FaCloudUploadAlt, FaTimes, FaMapMarkerAlt, FaPhoneAlt, FaNotesMedical, FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';

const UpdatePatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    salutation: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    patient_image: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    blood_group: '',
    patient_type: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    village: '',
    district: '',
    tehsil: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_history: '',
    allergies: '',
    medications: ''
  });

  // Determine role from path (admin, staff, etc.)
  let role = 'admin';
  if (location.pathname.includes('/dashboard/staff/')) {
    role = 'staff';
  }
  // Add more roles as needed

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/patients/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, patient_image: response.data.imageUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, patient_image: '' }));
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients/${id}`);
        setPatient(res.data);
        setFormData({
          salutation: res.data.salutation || '',
          first_name: res.data.first_name || '',
          middle_name: res.data.middle_name || '',
          last_name: res.data.last_name || '',
          patient_image: res.data.patient_image || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          dob: res.data.dob ? res.data.dob.slice(0, 10) : '',
          gender: res.data.gender || '',
          blood_group: res.data.blood_group || '',
          patient_type: res.data.patient_type || '',
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          zipCode: res.data.zipCode || '',
          village: res.data.village || '',
          district: res.data.district || '',
          tehsil: res.data.tehsil || '',
          emergency_contact: res.data.emergency_contact || '',
          emergency_phone: res.data.emergency_phone || '',
          medical_history: res.data.medical_history || '',
          allergies: res.data.allergies || '',
          medications: res.data.medications || ''
        });
      } catch (error) {
        alert('Failed to fetch patient');
        console.error('Error fetching patient:', error);
      }
    };
    fetchPatient();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        dob: formData.dob || null
      };

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/patients/${id}`, payload);
      alert('✅ Patient updated successfully');
      // Stay on the same page after update
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      alert(err.response?.data?.error || '❌ Update failed');
    }
  };

  if (!patient) return (
    <Layout sidebarItems={role === 'admin' ? adminSidebar : staffSidebar}>
      <div className="p-6">
        <p className="text-gray-600">Loading patient information...</p>
      </div>
    </Layout>
  );

  const salutationOptions = [
    { value: '', label: 'Select Salutation' },
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Prof.', label: 'Prof.' },
    { value: 'Baby', label: 'Baby' },
    { value: 'Master', label: 'Master' }
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const patientTypeOptions = [
    { value: 'opd', label: 'OPD' },
    { value: 'ipd', label: 'IPD' }
  ];

  return (
    <Layout sidebarItems={role === 'admin' ? adminSidebar : staffSidebar}>
      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <FaUser size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Update Patient Profile</h2>
                <p className="text-sm text-gray-500 font-medium">Patient ID: <span className="text-blue-600">{patient.patientId || 'N/A'}</span></p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <FaArrowLeft /> Back
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FaUser className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
              </div>

              {/* Image Upload Section */}
              <div className="mb-8 flex justify-center">
                <div className="text-center group">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center relative">
                      {formData.patient_image ? (
                        <img
                          src={formData.patient_image}
                          alt="Patient"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-4xl text-slate-400" />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <FaCloudUploadAlt className="text-white text-2xl" />
                      </div>

                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={uploadingImage}
                        title="Change Photo"
                      />
                    </div>

                    {formData.patient_image && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute bottom-1 right-1 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-all transform hover:scale-110 z-30"
                        title="Remove Photo"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium">Allowed: JPG, PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormSelect
                  label="Salutation"
                  value={formData.salutation}
                  onChange={(e) => handleInputChange('salutation', e.target.value)}
                  options={salutationOptions}
                />
                <FormInput
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
                <FormInput
                  label="Middle Name"
                  value={formData.middle_name}
                  onChange={(e) => handleInputChange('middle_name', e.target.value)}
                />
                <FormInput
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
                <FormInput
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
                <FormSelect
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  options={genderOptions}
                />
                <FormSelect
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(e) => handleInputChange('blood_group', e.target.value)}
                  options={bloodGroupOptions}
                />
                {/* <FormSelect
                  label="Patient Type"
                  value={formData.patient_type}
                  onChange={(e) => handleInputChange('patient_type', e.target.value)}
                  options={patientTypeOptions}
                /> */}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FaMapMarkerAlt className="text-orange-500" />
                <h3 className="text-lg font-bold text-gray-800">Address Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormTextarea
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="md:col-span-3"
                />
                <FormInput
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <FormInput
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
                <FormInput
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
                <FormInput
                  label="Village/Gaon"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                />
                <FormInput
                  label="District"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
                <FormInput
                  label="Tehsil"
                  value={formData.tehsil}
                  onChange={(e) => handleInputChange('tehsil', e.target.value)}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FaPhoneAlt className="text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Contact Name"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                />
                <FormInput
                  label="Contact Phone"
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FaNotesMedical className="text-red-500" />
                <h3 className="text-lg font-bold text-gray-800">Medical Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormTextarea
                  label="Medical History"
                  value={formData.medical_history}
                  onChange={(e) => handleInputChange('medical_history', e.target.value)}
                  rows={4}
                />
                <FormTextarea
                  label="Allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  rows={4}
                />
                <FormTextarea
                  label="Medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t flex justify-end gap-4">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex items-center gap-2">
                <FaSave /> Update Patient
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdatePatientProfile;