import { useState } from 'react';
import { FormInput, FormSelect, Button } from '../common/FormElements';

const AddStaffForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    joiningDate: '',
    gender: '',
    status: 'Active',
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New staff data:', formData);
    // TODO: Send this to backend
  };

  const roleOptions = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Admin', label: 'Admin' },
  ];

  const departmentOptions = [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'General', label: 'General' },
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-600 mt-1">Fill the staff details to add them to the hospital system.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            required
            placeholder="Enter full name"
          />

          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="Enter email"
          />

          <FormInput
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            placeholder="Enter phone number"
          />

          <FormSelect
            label="Role"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            options={roleOptions}
            required
          />

          <FormSelect
            label="Department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={departmentOptions}
            required
          />

          <FormInput
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => handleInputChange('specialization', e.target.value)}
            placeholder="e.g., Cardiac Surgery"
          />

          <FormInput
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => handleInputChange('joiningDate', e.target.value)}
            required
          />

          <FormSelect
            label="Gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            options={genderOptions}
            required
          />

          <div className="md:col-span-2 flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add Staff</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffForm;
