// import { useState } from 'react';
// import { FormInput, FormSelect, Button } from '../common/FormElements';
// import axios from 'axios';

// const AddRegistrarForm = () => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     role: 'registrar',
//     department: '',
//     specialization: '',
//     joiningDate: '',
//     gender: 'male',
//     status: 'Active',
//     aadharNumber: '',
//     panNumber: '',
//   });

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     console.log('Submitting form data:', formData);
//     const response = await axios.post(
//       `${import.meta.env.VITE_BACKEND_URL}/api/staff`,
//       formData
//     );
//     console.log('✅ Staff added successfully:', response.data);
//     alert('Registrar added successfully!');
//   } catch (err) {
//     console.error('❌ Error adding staff:', err.response?.data || err.message);
//     alert(err.response?.data?.error || 'Failed to add Registrar.');
//   }
// };

//   // const roleOptions = [
//   //   { value: 'Doctor', label: 'Doctor' },
//   //   { value: 'Staff', label: 'Staff' },
//   //   { value: 'Admin', label: 'Admin' },
//   // ];

//   const departmentOptions = [
//     { value: 'Cardiology', label: 'Cardiology' },
//     { value: 'Pediatrics', label: 'Pediatrics' },
//     { value: 'Orthopedics', label: 'Orthopedics' },
//     { value: 'Emergency', label: 'Emergency' },
//     { value: 'General', label: 'General' },
//   ];

//   const genderOptions = [
//     { value: 'male', label: 'Male' },
//     { value: 'female', label: 'Female' },
//     { value: 'other', label: 'Other' },
//   ];

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900">Add New Registrar</h2>
//           <p className="text-gray-600 mt-1">Fill the Registrar details to add them to the hospital system.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormInput
//             label="Full Name"
//             value={formData.fullName}
//             onChange={(e) => handleInputChange('fullName', e.target.value)}
//             required
//             placeholder="Enter full name"
//           />

//           <FormInput
//             label="Email"
//             type="email"
//             value={formData.email}
//             onChange={(e) => handleInputChange('email', e.target.value)}
//             required
//             placeholder="Enter email"
//           />

//           <FormInput
//   label="Password"
//   type="password"
//   value={formData.password || ''}
//   onChange={(e) => handleInputChange('password', e.target.value)}
//   required
//   placeholder="Enter password"
// />
//           <FormInput
//             label="Phone"
//             type="tel"
//             value={formData.phone}
//             onChange={(e) => handleInputChange('phone', e.target.value)}
//             required
//             placeholder="Enter phone number"
//           />

//           <FormSelect
//             label="Department"
//             value={formData.department}
//             onChange={(e) => handleInputChange('department', e.target.value)}
//             options={departmentOptions}
//             required
//           />

//           <FormInput
//             label="Specialization"
//             value={formData.specialization}
//             onChange={(e) => handleInputChange('specialization', e.target.value)}
//             placeholder="e.g., Cardiac Surgery"
//           />

//           <FormInput
//             label="Joining Date"
//             type="date"
//             value={formData.joiningDate}
//             onChange={(e) => handleInputChange('joiningDate', e.target.value)}
//             required
//           />

//           <FormSelect
//             label="Gender"
//             value={formData.gender}
//             onChange={(e) => handleInputChange('gender', e.target.value)}
//             options={genderOptions}
//             required
//           />

//           <FormInput
//             label="Aadhar Number"
//             value={formData.aadharNumber}
//             onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
//             placeholder="Enter Aadhar number"
//             maxLength={12}
//           />

//           <FormInput
//             label="PAN Number"
//             value={formData.panNumber}
//             onChange={(e) => handleInputChange('panNumber', e.target.value)}
//             placeholder="Enter PAN number"
//             maxLength={10}
//           />

//           <div className="md:col-span-2 flex justify-end space-x-4">
//             <Button variant="secondary" type="button">Cancel</Button>
//             <Button variant="primary" type="submit">Add Staff</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddRegistrarForm;


import { useState, useEffect } from 'react';
import { FormSelect, Button } from '../common/FormElements';
import axios from 'axios';

const AddRegistrarForm = () => {
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [password, setPassword] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/staff`);
        const filteredStaff = response.data.filter(staff => staff.role === 'Receptionist' || staff.role === 'Other' || staff.role === 'Nurse');
        setStaffOptions(filteredStaff);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
      }
    };

    fetchStaff();
  }, []);

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

    if (!selectedStaffId) return alert('Please select a staff member.');

    const selectedStaff = staffOptions.find(s => s._id === selectedStaffId);
    if (!selectedStaff) return alert('Selected staff not found.');

    const registrarData = {
      ...selectedStaff,
      department,
      specialization,
      joiningDate,
      role: 'registrar',
      status: 'Active',
      password: password.trim() || undefined  // only send password if provided
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/staff/${selectedStaffId}`,
        registrarData
      );
      alert('Registrar role assigned successfully!');
    } catch (err) {
      console.error('❌ Error updating registrar:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to assign registrar role.');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Assign Registrar</h2>
          <p className="text-gray-600 mt-1">Select from existing staff to assign Registrar role.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Select Staff"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            options={staffOptions.map(staff => ({
              value: staff._id,
              label: `${(staff.full_name || staff.first_name + ' ' + staff.last_name)+ ' - ' + (staff.phone || '')}`
            }))}
            required
          />

          <FormSelect
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departmentOptions}
            required
          />

          <input
            type="text"
            className="form-input border rounded px-3 py-2"
            placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />

          <input
            type="date"
            className="form-input border rounded px-3 py-2"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-input border rounded px-3 py-2 md:col-span-2"
            placeholder="Enter password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="md:col-span-2 flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Assign Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRegistrarForm;
