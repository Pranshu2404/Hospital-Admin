import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPatientForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    bloodGroup: '',
    patientType: 'OPD'
  });

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
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dateOfBirth,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,
      medical_history: formData.medicalHistory,
      allergies: formData.allergies,
      medications: formData.medications,
      blood_group: formData.bloodGroup,
      patient_type: formData.patientType,
    };

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
      payload
    );

    console.log('✅ Patient added:', response.data);
    alert('Patient added successfully!');
    navigate('/dashboard/admin/appointments?type=ipd')
  } catch (err) {
    console.error('❌ Error adding patient:', err.response?.data || err.message);
    alert(err.response?.data?.error || 'Failed to add patient.');
  }
};


  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
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
    { value: 'opd', label: 'OPD (Outpatient)' },
    { value: 'ipd', label: 'IPD (Inpatient)' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
          <p className="text-gray-600 mt-1">Enter patient information to create a new record</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
              <FormInput
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                required
              />
              <FormInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
              <FormSelect
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={genderOptions}
                placeholder="Select gender"
                required
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={3}
                className="md:col-span-2"
              />
              <FormInput
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
              <FormInput
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
              />
              <FormInput
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Contact Name"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Enter emergency contact name"
              />
              <FormInput
                label="Contact Phone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormSelect
                label="Patient Type"
                value={formData.patientType}
                onChange={(e) => handleInputChange('patientType', e.target.value)}
                options={patientTypeOptions}
                required
              />
              
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;