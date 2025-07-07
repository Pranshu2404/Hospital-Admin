
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const UpdatePatientProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [patient, setPatient] = useState(null);
//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     email: '',
//     phone: '',
//     dob: '',
//     gender: '',
//     blood_group: '',
//     patient_type: 'OPD'
//   });

//   useEffect(() => {
//     const fetchPatient = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${id}`);
//         setPatient(res.data);
//         setFormData(res.data);
//       } catch (error) {
//         alert('Failed to fetch patient');
//       }
//     };
//     fetchPatient();
//   }, [id]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${id}`, formData);
//       alert('✅ Patient updated');
//       navigate('/dashboard/admin/patients');
//     } catch (err) {
//       alert('❌ Update failed');
//     }
//   };

//   if (!patient) return <p className="p-6">Loading...</p>;

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
//         <h2 className="text-2xl font-bold mb-6 text-gray-900">Update Patient Profile</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="flex gap-4">
//             <input name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="First Name" className="w-full border p-2 rounded" />
//             <input name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Last Name" className="w-full border p-2 rounded" />
//           </div>
//           <div className="flex gap-4">
//             <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
//             <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" />
//           </div>
//           <div className="flex gap-4">
//             <input type="date" name="dob" value={formData.dob?.slice(0, 10)} onChange={handleChange} className="w-full border p-2 rounded" />
//             <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
//               <option value="">Gender</option>
//               <option>Male</option>
//               <option>Female</option>
//               <option>Other</option>
//             </select>
//           </div>
//           <div className="flex gap-4">
//             <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full border p-2 rounded">
//               <option value="">Blood Group</option>
//               <option>A+</option><option>A-</option>
//               <option>B+</option><option>B-</option>
//               <option>AB+</option><option>AB-</option>
//               <option>O+</option><option>O-</option>
//             </select>
//             <select name="patient_type" value={formData.patient_type} onChange={handleChange} className="w-full border p-2 rounded">
//               <option value="OPD">OPD</option>
//               <option value="IPD">IPD</option>
//             </select>
//           </div>
//           <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
//             Update Patient
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default UpdatePatientProfile;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const UpdatePatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    blood_group: '',
    patient_type: 'OPD',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${id}`);
        setPatient(res.data);
        setFormData({
          ...res.data,
          dob: res.data.dob?.slice(0, 10) || ''
        });
      } catch (error) {
        alert('Failed to fetch patient');
      }
    };
    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${id}`, formData);
    alert('✅ Patient updated successfully');
    // navigate('/dashboard/admin/patients'); // ❌ Remove this line
  } catch (err) {
    alert('❌ Update failed');
  }
};

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${id}`, formData);
//       alert('✅ Patient updated');
//       navigate('/dashboard/admin/patients');
//     } catch (err) {
//       alert('❌ Update failed');
//     }
//   };

  if (!patient) return <p className="p-6">Loading...</p>;

  return (
    <Layout sidebarItems={adminSidebar}>
      {/* <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Update Patient Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="First Name" className="w-full border p-2 rounded" />
            <input name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Last Name" className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-4">
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-4">
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border p-2 rounded" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex gap-4">
            <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Blood Group</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
            <select name="patient_type" value={formData.patient_type} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </select>
          </div>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2 rounded"
          />
          <input
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleChange}
            placeholder="Emergency Contact Number"
            className="w-full border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Update Patient
          </button>
        </form>
      </div> */}

      <div className="p-6 max-w-8xl mx-auto">
  <div className="bg-white rounded-xl shadow p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Update Patient Profile</h2>
    <p className="text-sm text-gray-500 mb-6">Edit patient details below</p>

    <h3 className="text-lg font-semibold text-gray-700 mb-4">Patient Information</h3>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
        <input name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
        <input name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
        <input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
        <input type="date" name="dob" value={formData.dob?.slice(0, 10)} onChange={handleChange} className="w-full border rounded-lg p-2" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg p-2">
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Blood Group</label>
        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full border rounded-lg p-2">
          <option value="">Select Blood Group</option>
          <option>A+</option><option>A-</option>
          <option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option>
          <option>O+</option><option>O-</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Patient Type</label>
        <select name="patient_type" value={formData.patient_type} onChange={handleChange} className="w-full border rounded-lg p-2">
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
        <input name="address" value={formData.address || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Emergency Contact</label>
        <input name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
      </div>

      <div className="md:col-span-2 text-right">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Update Patient
        </button>
      </div>
    </form>
  </div>
</div>

    </Layout>
  );
};

export default UpdatePatientProfile;
