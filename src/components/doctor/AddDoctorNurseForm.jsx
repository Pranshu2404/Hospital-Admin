import { useState } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, FormCheckbox, Button } from '../common/FormElements';

const AddDoctorNurseForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    education: '',
    shift: '',
    emergencyContact: '',
    emergencyPhone: '',
    startDate: '',
    salary: '',
    isFullTime: true,
    hasInsurance: true,
    notes: ''
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
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/doctors`,
      formData
    );
    console.log('✅ Doctor added successfully:', response.data);
    alert('Doctor added successfully!');
  } catch (err) {
    console.error('❌ Error adding doctor:', err.response?.data || err.message);
    alert(err.response?.data?.error || 'Failed to add doctor.');
  }
};


  const roleOptions = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Technician', label: 'Technician' },
    { value: 'Administrator', label: 'Administrator' }
  ];

  const departmentOptions = [
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'ICU', label: 'ICU' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Radiology', label: 'Radiology' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Pharmacy', label: 'Pharmacy' }
  ];

  const shiftOptions = [
    { value: 'Morning', label: 'Morning (7 AM - 3 PM)' },
    { value: 'Evening', label: 'Evening (3 PM - 11 PM)' },
    { value: 'Night', label: 'Night (11 PM - 7 AM)' },
    { value: 'Rotating', label: 'Rotating Shifts' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Doctor</h2>
          <p className="text-gray-600 mt-1">Enter staff information to create a new record</p>
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
  label="Password"
  type="password"
  value={formData.password}
  onChange={(e) => handleInputChange('password', e.target.value)}
  placeholder="Create password"
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

          {/* Professional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={roleOptions}
                placeholder="Select role"
                required
              />
              <FormSelect
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departmentOptions}
                placeholder="Select department"
                required
              />
              <FormInput
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Enter specialization"
              />
              <FormInput
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />
              <FormInput
                label="Years of Experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Enter years of experience"
              />
              <FormSelect
                label="Shift"
                value={formData.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                options={shiftOptions}
                placeholder="Select shift"
                required
              />
              <FormTextarea
                label="Education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Enter educational background"
                rows={3}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
              <FormInput
                label="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Enter annual salary"
              />
              <FormCheckbox
                label="Full-time Employee"
                checked={formData.isFullTime}
                onChange={(e) => handleInputChange('isFullTime', e.target.checked)}
              />
              <FormCheckbox
                label="Has Health Insurance"
                checked={formData.hasInsurance}
                onChange={(e) => handleInputChange('hasInsurance', e.target.checked)}
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

          {/* Additional Notes */}
          <div className="mb-8">
            <FormTextarea
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes or comments"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Staff Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorNurseForm;
