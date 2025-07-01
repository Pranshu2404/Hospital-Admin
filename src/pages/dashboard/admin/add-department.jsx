// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// import axios from 'axios';

// const SelectDepartment = () => {
//   const [departments, setDepartments] = useState([]);
//   const [newDeptName, setNewDeptName] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
//         setDepartments(res.data); // Should be [{ _id, name }]
//       } catch (err) {
//         console.error('Failed to fetch departments:', err);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   const handleAddDepartment = async (e) => {
//     e.preventDefault();
//     const trimmed = newDeptName.trim();
//     if (!trimmed) return;

//     const alreadyExists = departments.some(
//       (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
//     );

//     if (alreadyExists) {
//       alert('Department already exists');
//       return;
//     }

//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, { name: trimmed });
//       const newDepartment = res.data; // Should contain _id and name
//       setDepartments((prev) => [...prev, newDepartment]);
//       setNewDeptName('');
//       // Navigate to a page that lists doctors of this department for HOD selection
//       navigate(`/dashboard/admin/add-hod/${newDepartment._id}?departmentName=${encodeURIComponent(newDepartment.name)}`);
//     } catch (err) {
//       alert('Failed to add department');
//     }
//   };

//   const handleDepartmentClick = (deptId, deptName) => {
//     navigate(`/dashboard/admin/add-hod/${deptId}?departmentName=${encodeURIComponent(deptName)}`);
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
//         {/* Add Department Form */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
//           <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
//             <input
//               type="text"
//               placeholder="Enter department name"
//               value={newDeptName}
//               onChange={(e) => setNewDeptName(e.target.value)}
//               className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
//             />
//             <button
//               type="submit"
//               className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
//             >
//               Add Department
//             </button>
//           </form>
//         </div>

//         {/* Department Selection */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
//           <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <button
//                 key={dept._id}
//                 onClick={() => handleDepartmentClick(dept._id, dept.name)}
//                 className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
//               >
//                 <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                 <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default SelectDepartment;














// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// import axios from 'axios';

// const SelectDepartment = () => {
//   const [departments, setDepartments] = useState([]);
//   const [newDeptName, setNewDeptName] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
//         setDepartments(res.data);
//         console.log('✅ Departments fetched:', res.data);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       }
//     };

//     fetchDepartments();
//   }, []);

// //   useEffect(() => {
// //   const fetchDepartments = async () => {
// //     try {
// //       console.log('🔥 Calling API at:', `${import.meta.env.VITE_BACKEND_URL}/api/departments`);
// //       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
// //       console.log('✅ Departments fetched:', res.data);
// //       setDepartments(res.data);
// //     } catch (err) {
// //       console.error('❌ Failed to fetch departments:', err);
// //     }
// //   };
// //   fetchDepartments();
// // }, []);



//   // ✅ Add new department
//   const handleAddDepartment = async (e) => {
//     e.preventDefault();
//     const trimmed = newDeptName.trim();
//     if (!trimmed) return;

//     const alreadyExists = departments.some(
//       (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
//     );

//     if (alreadyExists) {
//       alert('Department already exists');
//       return;
//     }

//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
//         name: trimmed,
//       });
//       const newDepartment = res.data;
//       setDepartments((prev) => [...prev, newDepartment]);
//       setNewDeptName('');
//       navigate(
//         `/dashboard/admin/add-hod/${newDepartment._id}?departmentName=${encodeURIComponent(
//           newDepartment.name
//         )}`
//       );
//     } catch (err) {
//       alert('Failed to add department');
//     }
//   };

//   const handleSuggestionClick = (name) => {
//     setNewDeptName(name);
//   };

//   const handleDepartmentClick = (deptId, deptName) => {
//     navigate(`/dashboard/admin/add-hod/${deptId}?departmentName=${encodeURIComponent(deptName)}`);
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
//         {/* Add Department Form */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
//           <form onSubmit={handleAddDepartment} className="relative flex flex-col sm:flex-row gap-4">
//             <div className="relative w-full sm:w-auto flex-1 z-10">
//               <input
//                 type="text"
//                 placeholder="Enter department name"
//                 value={newDeptName}
//                 onChange={(e) => setNewDeptName(e.target.value)}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2"
//               />

//               {/* ✅ Suggestions Dropdown */}
//               {newDeptName.trim() !== '' && (
//                 <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
//                   {departments
//                     .filter(
//                       (dept) =>
//                         dept.name.toLowerCase().includes(newDeptName.toLowerCase()) &&
//                         dept.name.toLowerCase() !== newDeptName.toLowerCase()
//                     )
//                     .map((dept) => (
//                       <li
//                         key={dept._id}
//                         onClick={() => handleSuggestionClick(dept.name)}
//                         className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
//                       >
//                         {dept.name}
//                       </li>
//                     ))}
//                 </ul>
//               )}
//             </div>
//             <button
//               type="submit"
//               className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
//             >
//               Add Department
//             </button>
//           </form>
//         </div>

//         {/* Department List */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
//           <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <button
//                 key={dept._id}
//                 onClick={() => handleDepartmentClick(dept._id, dept.name)}
//                 className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
//               >
//                 <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                 <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default SelectDepartment;










import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import axios from 'axios';

const SelectDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        console.log('✅ Departments fetched:', res.data);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    const alreadyExists = departments.some(
      (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      alert('Department already exists');
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        name: trimmed,
      });
      const newDepartment = res.data;
      setDepartments((prev) => [...prev, newDepartment]);
      setNewDeptName('');
      navigate(
        `/dashboard/admin/add-hod/${newDepartment._id}?departmentName=${encodeURIComponent(
          newDepartment.name
        )}`
      );
    } catch (err) {
      alert('Failed to add department');
    }
  };

  const handleSuggestionClick = (name) => {
    setNewDeptName(name);
  };

  const handleDepartmentClick = (deptId, deptName) => {
    navigate(`/dashboard/admin/add-hod/${deptId}?departmentName=${encodeURIComponent(deptName)}`);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">

        {/* Add Department Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="relative flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-auto flex-1 z-10">
              <input
                type="text"
                placeholder="Enter department name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />

              {/* Suggestions Dropdown */}
              {newDeptName.trim() !== '' && (
                <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
                  {departments
                    .filter(
                      (dept) =>
                        dept.name.toLowerCase().includes(newDeptName.toLowerCase()) &&
                        dept.name.toLowerCase() !== newDeptName.toLowerCase()
                    )
                    .map((dept) => (
                      <li
                        key={dept._id}
                        onClick={() => handleSuggestionClick(dept.name)}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {dept.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Select Department Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Select Department</h2>
            <button
              onClick={() => navigate('/dashboard/admin/add-doctor')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add Doctor
            </button>
          </div>

          <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <button
                key={dept._id}
                onClick={() => handleDepartmentClick(dept._id, dept.name)}
                className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
              >
                <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectDepartment;
