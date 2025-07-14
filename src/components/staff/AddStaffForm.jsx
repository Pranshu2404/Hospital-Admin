import { useState, useEffect } from 'react';
import { FormInput, FormSelect, Button } from '../common/FormElements';
import axios from 'axios';

const AddStaffForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    joiningDate: '',
    gender: 'male',
    status: 'Active',
    aadharNumber: '',
    panNumber: '',
    password: '', // ✅ Password field added here
  });

  const [customRole, setCustomRole] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        const departments = res.data?.map(dep => ({
          value: dep.name,
          label: dep.name
        })) || [];

        setDepartmentOptions(departments);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      role: formData.role === 'Others' ? customRole : formData.role
    };

    try {
      console.log('Submitting form data:', finalData);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/staff`,
        finalData
      );
      console.log('✅ Staff added successfully:', response.data);
      alert('Staff added successfully!');
      window.location.reload(); // ✅ Reloads the page after adding staff
    } catch (err) {
      console.error('❌ Error adding staff:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add staff.');
    }
  };

  const roleOptions = [
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Wardboy', label: 'Wardboy' },
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Lab Technician', label: 'Lab Technician' },
    { value: 'Radiologist', label: 'Radiologist' },
    { value: 'Surgeon', label: 'Surgeon' },
    { value: 'Anesthesiologist', label: 'Anesthesiologist' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Cleaner', label: 'Cleaner' },
    { value: 'Security', label: 'Security' },
    { value: 'Ambulance Driver', label: 'Ambulance Driver' },
    { value: 'HR', label: 'HR' },
    { value: 'IT Support', label: 'IT Support' },
    { value: 'Others', label: 'Others' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-600 mt-1">Fill the staff details to add them to the hospital system.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Full Name" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required placeholder="Enter full name" />
          <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="Enter email" />
          <FormInput label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required placeholder="Enter phone number" />

          <FormSelect label="Role" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)} options={roleOptions} required />

          {formData.role === 'Others' && (
            <FormInput label="Please specify role" value={customRole} onChange={(e) => setCustomRole(e.target.value)} required placeholder="Enter custom role" />
          )}

          <FormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} required />
          <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="e.g., ICU, Lab Tech" />
          <FormInput label="Joining Date" type="date" value={formData.joiningDate} onChange={(e) => handleInputChange('joiningDate', e.target.value)} required />
          <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
          <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value)} placeholder="Enter Aadhar number" maxLength={12} />
          <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} placeholder="Enter PAN number" maxLength={10} />

          {/* ✅ Password Field */}
          <FormInput label="Password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required placeholder="Set a password" />

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
