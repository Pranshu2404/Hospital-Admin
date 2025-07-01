import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
import axios from 'axios';

const AddPatientOPDForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
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
        blood_group: formData.bloodGroup,
        patient_type: "opd"
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
        payload
      );

      console.log('✅ OPD Patient added:', response.data);
      alert('OPD Patient added successfully!');
      navigate('/dashboard/staff/appointments?type=opd')
    } catch (err) {
      console.error('❌ Error adding OPD patient:', err.response?.data || err.message);
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

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>
          <p className="text-gray-600 mt-1">Basic info for walk-in or consulting patient</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
              <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              <FormInput
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
              {/* <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required /> */}
              <FormInput label="Age" type="number" value={formData.age || ''} onChange={(e) => handleInputChange('age', e.target.value)} required />

              <FormSelect
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={genderOptions}
                required
              />
              <FormSelect
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                options={bloodGroupOptions}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add OPD Patient</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientOPDForm;
