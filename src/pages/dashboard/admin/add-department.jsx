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
//               {newDeptName.trim() !== '' &&
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
//               }
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
//         console.log('✅ Departments fetched:', res.data);
//         setDepartments(res.data);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   const departmentOptions = [
//     { value: 'General Medicine', label: 'General Medicine' },
//     { value: 'Cardiology', label: 'Cardiology' },
//     { value: 'Orthopedics', label: 'Orthopedics' },
//     { value: 'Pediatrics', label: 'Pediatrics' },
//     { value: 'Emergency', label: 'Emergency' },
//     { value: 'ICU', label: 'ICU' },
//     { value: 'Surgery', label: 'Surgery' },
//     { value: 'Radiology', label: 'Radiology' },
//     { value: 'Laboratory', label: 'Laboratory' },
//     { value: 'Pharmacy', label: 'Pharmacy' }
//   ];

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
//       // Navigate to a page that lists doctors of this department for HOD selection
//       // navigate(`/dashboard/admin/add-hod/${newDepartment._id}?departmentName=${encodeURIComponent(newDepartment.name)}`);
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

//   const handleDeleteDepartment = async (deptId) => {
//     if (!window.confirm('Are you sure you want to delete this department?')) return;
//     try {
//       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${deptId}`);
//       setDepartments((prev) => prev.filter((dept) => dept._id !== deptId));
//     } catch (err) {
//       alert('Failed to delete department');
//     }
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

//               {/* Suggestions Dropdown */}
//               {newDeptName.trim() !== '' && (
//                 <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
//                   {departmentOptions
//                     .filter(
//                       (dept) =>
//                         dept.label.toLowerCase().includes(newDeptName.toLowerCase()) &&
//                         dept.label.toLowerCase() !== newDeptName.toLowerCase()
//                     )
//                     .map((dept) => (
//                       <li
//                         // key={dept._id}
//                         onClick={() => handleSuggestionClick(dept.value)}
//                         className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
//                       >
//                         {dept.label}
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

//         {/* Select Department Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-2xl font-bold text-gray-900">Select Department</h2>
//             {/* <button
//               onClick={() => navigate('/dashboard/admin/add-doctor')}
//               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               + Add Doctor
//             </button> */}
//           </div>

//           <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <div key={dept._id} className="relative">
//                 <button
//                   onClick={() => handleDepartmentClick(dept._id, dept.name)}
//                   className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
//                 >
//                   <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                   <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
//                 </button>
//                 <button
//                   onClick={() => handleDeleteDepartment(dept._id)}
//                   className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow"
//                   title="Delete Department"
//                   type="button"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M4 7.5h16M9.75 11.25v4.5m4.5-4.5v4.5M10.5 7.5V5.25A1.5 1.5 0 0112 3.75a1.5 1.5 0 011.5 1.5V7.5" />
//                   </svg>
//                 </button>
//               </div>
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
  const [editingDept, setEditingDept] = useState(null);
  const [editedName, setEditedName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const departmentOptions = [
    'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics',
    'Emergency', 'ICU', 'Surgery', 'Radiology', 'Laboratory', 'Pharmacy'
  ];

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    const exists = departments.some(
      (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert('Department already exists');
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        name: trimmed,
      });
      setDepartments((prev) => [...prev, res.data]);
      setNewDeptName('');
    } catch (err) {
      alert('Failed to add department');
    }
  };

  const handleSuggestionClick = (name) => setNewDeptName(name);

  const handleDepartmentClick = (id, name) => {
    navigate(`/dashboard/admin/add-hod/${id}?departmentName=${encodeURIComponent(name)}`);
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`);
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const handleEditDepartment = (id, currentName) => {
    setEditingDept(id);
    setEditedName(currentName);
  };

  const handleUpdateDepartment = async (id) => {
    const trimmed = editedName.trim();
    if (!trimmed) return;
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
        name: trimmed
      });
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === id ? { ...dept, name: res.data.name } : dept))
      );
      setEditingDept(null);
    } catch (err) {
      alert('Failed to update department');
    }
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
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
              {newDeptName.trim() !== '' && (
                <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
                  {departmentOptions
                    .filter(
                      (label) =>
                        label.toLowerCase().includes(newDeptName.toLowerCase()) &&
                        label.toLowerCase() !== newDeptName.toLowerCase()
                    )
                    .map((label, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSuggestionClick(label)}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {label}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700">
              Add Department
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Select Department</h2>
          </div>

          <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept._id} className="relative">
                <button
                  onClick={() => handleDepartmentClick(dept._id, dept.name)}
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
                >
                  {editingDept === dept._id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleUpdateDepartment(dept._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)}
                      autoFocus
                      className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                      <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleEditDepartment(dept._id, dept.name)}
                  className="absolute top-2 right-10 text-gray-500 hover:text-blue-600 p-1 rounded-full bg-white shadow"
                  title="Edit Department"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.707.464L9 15l.707-2.121a2 2 0 01.464-.707z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDeleteDepartment(dept._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow"
                  title="Delete Department"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M4 7.5h16M9.75 11.25v4.5m4.5-4.5v4.5M10.5 7.5V5.25A1.5 1.5 0 0112 3.75a1.5 1.5 0 011.5 1.5V7.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectDepartment;
