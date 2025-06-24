// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const departments = [
//   'Cardiology',
//   'Neurology',
//   'Orthopedics',
//   'Pediatrics',
//   'General Medicine',
//   'Surgery',
//   'Dermatology',
//   'Gynecology',
// ];

// const DepartmentList = () => {
//   const navigate = useNavigate();

//   const handleDepartmentClick = (dept) => {
//     navigate(`/dashboard/admin/departments/${dept}`);
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Select Department</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {departments.map((dept) => (
//             <div
//               key={dept}
//               onClick={() => handleDepartmentClick(dept)}
//               className="bg-white shadow-md border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
//             >
//               <h3 className="text-lg font-medium">{dept}</h3>
//               <p className="text-sm text-gray-500">Click to manage doctors</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default DepartmentList;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const DepartmentList = () => {
  const [hods, setHods] = useState([]);

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors?role=HOD`);
        setHods(res.data);
      } catch (err) {
        console.error('Failed to fetch HODs:', err);
      }
    };

    fetchHods();
  }, []);

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Head of Departments</h2>
        {hods.length === 0 ? (
          <p className="text-gray-600">No HODs found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hods.map((hod) => (
              <div key={hod._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900">{hod.firstName} {hod.lastName}</h3>
                <p className="text-sm text-gray-600">Department: {hod.department}</p>
                <p className="text-sm text-gray-600">Email: {hod.email}</p>
                <p className="text-sm text-gray-600">Phone: {hod.phone}</p>
                <p className="text-sm text-gray-600">Experience: {hod.experience} years</p>
                <p className="text-sm text-gray-600">Specialization: {hod.specialization}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepartmentList;
