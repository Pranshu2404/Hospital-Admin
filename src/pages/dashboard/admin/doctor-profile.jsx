import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="p-6 text-red-600">Doctor not found.</div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            <button
              className="px-4 py-2 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Basic Info</h3>
              <p><strong>Email:</strong> {doctor.email}</p>
              <p><strong>Phone:</strong> {doctor.phone}</p>
              <p><strong>Gender:</strong> {doctor.gender}</p>
              <p><strong>Date of Birth:</strong> {doctor.dateOfBirth}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Professional Info</h3>
              <p><strong>Department:</strong> {doctor.department?.name}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>License No:</strong> {doctor.licenseNumber}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Employment Info</h3>
              <p><strong>Start Date:</strong> {doctor.startDate}</p>
              <p><strong>Shift:</strong> {doctor.shift}</p>
              <p><strong>Status:</strong> {doctor.status || 'Active'}</p>
              <p><strong>Full Time:</strong> {doctor.isFullTime ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Other Info</h3>
              <p><strong>Emergency Contact:</strong> {doctor.emergencyContact}</p>
              <p><strong>Emergency Phone:</strong> {doctor.emergencyPhone}</p>
              <p><strong>Insurance:</strong> {doctor.hasInsurance ? 'Yes' : 'No'}</p>
              <p><strong>Notes:</strong> {doctor.notes || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfilePage;


// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const DoctorProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [doctor, setDoctor] = useState(null);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
//         setDoctor(res.data);
//       } catch (error) {
//         console.error('Failed to fetch doctor data', error);
//       }
//     };

//     fetchDoctor();
//   }, [id]);

//   if (!doctor) {
//     return <div className="p-6 text-gray-600">Loading...</div>;
//   }

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6 max-w-4xl mx-auto">
//         <div className="bg-white shadow rounded-xl p-6">
//           <h2 className="text-2xl font-bold mb-2 text-gray-800">Doctor Profile</h2>
//           <p className="text-sm text-gray-500 mb-6">Detailed information about this doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Full Name</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.firstName} {doctor.lastName}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Email</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Phone</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.phone}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Department</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.department}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Specialization</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.specialization || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">License Number</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.licenseNumber || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Experience</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.experience ? `${doctor.experience} years` : '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Shift</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.shift}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Status</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.status}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Gender</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.gender || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Date of Birth</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.dateOfBirth || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Address</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.address || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Qualification</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.qualification || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Start Date</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.startDate || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Full Time</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.isFullTime ? 'Yes' : 'No'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Consultation Fee</p>
//               <p className="text-base font-semibold text-gray-800">₹{doctor.consultationFee || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Emergency Contact</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.emergencyContact || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Emergency Phone</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.emergencyPhone || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Has Insurance</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.hasInsurance ? 'Yes' : 'No'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Languages</p>
//               <p className="text-base font-semibold text-gray-800">
//                 {doctor.languages?.length ? doctor.languages.join(', ') : '—'}
//               </p>
//             </div>
//             <div className="sm:col-span-2">
//               <p className="text-sm text-gray-500">Notes</p>
//               <p className="text-base font-semibold text-gray-800 whitespace-pre-line">{doctor.notes || '—'}</p>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={() => navigate(-1)}
//               className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
//             >
//               ← Back to List
//             </button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default DoctorProfile;
