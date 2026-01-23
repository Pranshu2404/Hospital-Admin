import { useState, useEffect } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
import { SearchableFormSelect } from '../../../components/common/FormElements';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPatientOPDForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    age: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    patientType: 'OPD'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDOBFromAge = (age) => {
    const today = new Date();
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    return dob.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number (Indian 10-digit mobile starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit Indian mobile number for Phone (starts with 6-9).');
      return;
    }
    
    try {
      const patientPayload = {
        salutation: formData.salutation,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: calculateDOBFromAge(formData.age),
        blood_group: formData.bloodGroup,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        patient_type: "opd"
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/patients`,
        patientPayload
      );

      console.log('✅ OPD Patient added:', response.data);
      alert('OPD Patient added successfully!');
      navigate('/dashboard/admin/appointments?type=opd');

    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
      
      // Improved error handling
      let errorMessage = 'Failed to add patient.';
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error.includes('E11000')) {
          errorMessage = 'This email address is already registered. Please use a different email.';
        } else {
          errorMessage = err.response.data.error;
        }
      }
      alert(errorMessage);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group', disabled: true },
    { value: 'A+', label: 'A+' }, 
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, 
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, 
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, 
    { value: 'O-', label: 'O-' }
  ];

  const salutationOptions = [
    { value: '', label: 'Select Salutation', disabled: true },
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Prof.', label: 'Prof.' },
    { value: 'Baby', label: 'Baby' },
    { value: 'Master', label: 'Master' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add OPD Patient</h2>
          <p className="text-gray-600 mt-1">Fill in patient information for OPD registration.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableFormSelect 
                label="Salutation" 
                value={formData.salutation} 
                onChange={(e) => handleInputChange('salutation', e.target.value)} 
                options={salutationOptions} 
              />
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
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                maxLength={10}
                inputMode="numeric"
                pattern="^[6-9]\d{9}$"
                title="10 digit Indian mobile number starting with 6-9"
              />
              <FormInput 
                label="Age" 
                type="number" 
                min="0" 
                max="120"
                value={formData.age} 
                onChange={(e) => handleInputChange('age', e.target.value)} 
                required 
              />
              <SearchableFormSelect 
                label="Gender" 
                value={formData.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)} 
                options={[
                  { value: '', label: 'Select Gender', disabled: true },
                  ...genderOptions
                ]} 
              />
              <SearchableFormSelect 
                label="Blood Group" 
                value={formData.bloodGroup} 
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)} 
                options={bloodGroupOptions} 
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea 
                label="Address" 
                value={formData.address} 
                onChange={(e) => handleInputChange('address', e.target.value)} 
                rows={3} 
                className="md:col-span-2"
              />
              <FormInput 
                label="City" 
                value={formData.city} 
                onChange={(e) => handleInputChange('city', e.target.value)} 
                required
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
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="secondary" 
              type="button"
              onClick={() => navigate('/dashboard/admin/appointments?type=opd')}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add OPD Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientOPDForm;