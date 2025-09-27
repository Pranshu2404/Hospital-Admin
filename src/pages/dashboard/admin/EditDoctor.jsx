// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const EditDoctor = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState(null);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
//         setFormData(res.data);
//       } catch (err) {
//         console.error('Failed to load doctor', err);
//       }
//     };
//     fetchDoctor();
//   }, [id]);

//   const handleChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`, formData);
//       navigate(`/dashboard/admin/doctor-profile/${id}`);
//     } catch (err) {
//       console.error('Failed to update doctor:', err);
//     }
//   };

//   if (!formData) return <div className="p-6">Loading...</div>;

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6 max-w-3xl mx-auto">
//         <h2 className="text-xl font-bold mb-4">Edit Doctor</h2>
//         <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">First Name</label>
//             <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Last Name</label>
//             <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
//           </div>
//           {/* Add more fields as needed */}
//           <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Save Changes</button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default EditDoctor;



// File: src/pages/dashboard/admin/EditDoctor.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { FormInput, FormSelect, FormTextarea, FormCheckbox, Button } from '../../../components/common/FormElements';

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load doctor', err);
      }
    };
    fetchDoctor();

    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        const departments = res.data.map(dep => ({
          value: dep._id,
          label: dep.name
        }));
        setDepartmentOptions(departments);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
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
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`, formData);
    navigate('/dashboard/admin/doctor-list'); // 👈 Navigate to the list page after update
  } catch (err) {
    console.error('Failed to update doctor:', err);
  }
};

  if (!formData) return <div className="p-6">Loading...</div>;

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Doctor</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
            <FormInput
              label="Last Name"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            <FormInput
              label="Phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            <FormSelect
              label="Department"
              value={formData.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
              options={departmentOptions}
              required
            />
            <FormInput
              label="Specialization"
              value={formData.specialization || ''}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
            />
            <FormInput
              label="License Number"
              value={formData.licenseNumber || ''}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              required
            />
            <FormInput
              label="Experience (years)"
              type="number"
              value={formData.experience || ''}
              onChange={(e) => handleInputChange('experience', e.target.value)}
            />
            <FormSelect
              label="Shift"
              value={formData.shift || ''}
              onChange={(e) => handleInputChange('shift', e.target.value)}
              options={[
                { value: 'Morning', label: 'Morning' },
                { value: 'Evening', label: 'Evening' },
                { value: 'Night', label: 'Night' },
                { value: 'Rotating', label: 'Rotating' }
              ]}
              required
            />
            <FormInput
              label="Emergency Contact"
              value={formData.emergencyContact || ''}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            />
            <FormInput
              label="Emergency Phone"
              value={formData.emergencyPhone || ''}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
            />
          </div>
          <FormTextarea
            label="Education"
            value={formData.education || ''}
            onChange={(e) => handleInputChange('education', e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-4">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="primary" type="submit">Update Doctor</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditDoctor;
