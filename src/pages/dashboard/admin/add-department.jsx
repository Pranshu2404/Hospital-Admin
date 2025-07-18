
// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Layout from '../../../components/Layout';
// // import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// // import axios from 'axios';

// // const SelectDepartment = () => {
// //   const [departments, setDepartments] = useState([]);
// //   const [newDeptName, setNewDeptName] = useState('');
// //   const [editingDept, setEditingDept] = useState(null);
// //   const [editedName, setEditedName] = useState('');
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const fetchDepartments = async () => {
// //       try {
// //         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
// //         setDepartments(res.data);
// //       } catch (err) {
// //         console.error('❌ Failed to fetch departments:', err);
// //       }
// //     };

// //     fetchDepartments();
// //   }, []);

// //   const departmentOptions = [
// //     'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics',
// //     'Emergency', 'ICU', 'Surgery', 'Radiology', 'Laboratory', 'Pharmacy'
// //   ];

// //   const handleAddDepartment = async (e) => {
// //     e.preventDefault();
// //     const trimmed = newDeptName.trim();
// //     if (!trimmed) return;

// //     const exists = departments.some(
// //       (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
// //     );

// //     if (exists) {
// //       alert('Department already exists');
// //       return;
// //     }

// //     try {
// //       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
// //         name: trimmed,
// //       });
// //       setDepartments((prev) => [...prev, res.data]);
// //       setNewDeptName('');
// //     } catch (err) {
// //       alert('Failed to add department');
// //     }
// //   };

// //   const handleSuggestionClick = (name) => setNewDeptName(name);

// //   const handleDepartmentClick = (id, name) => {
// //     navigate(`/dashboard/admin/add-hod/${id}?departmentName=${encodeURIComponent(name)}`);
// //   };

// //   const handleDeleteDepartment = async (id) => {
// //     if (!window.confirm('Are you sure you want to delete this department?')) return;
// //     try {
// //       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`);
// //       setDepartments((prev) => prev.filter((dept) => dept._id !== id));
// //     } catch (err) {
// //       alert('Failed to delete department');
// //     }
// //   };

// //   const handleEditDepartment = (id, currentName) => {
// //     setEditingDept(id);
// //     setEditedName(currentName);
// //   };

// //   const handleUpdateDepartment = async (id) => {
// //     const trimmed = editedName.trim();
// //     if (!trimmed) return;
// //     try {
// //       const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
// //         name: trimmed
// //       });
// //       setDepartments((prev) =>
// //         prev.map((dept) => (dept._id === id ? { ...dept, name: res.data.name } : dept))
// //       );
// //       setEditingDept(null);
// //     } catch (err) {
// //       alert('Failed to update department');
// //     }
// //   };

// //   return (
// //     <Layout sidebarItems={adminSidebar}>
// //       <div className="p-6">
// //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
// //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
// //           <form onSubmit={handleAddDepartment} className="relative flex flex-col sm:flex-row gap-4">
// //             <div className="relative w-full sm:w-auto flex-1 z-10">
// //               <input
// //                 type="text"
// //                 placeholder="Enter department name"
// //                 value={newDeptName}
// //                 onChange={(e) => setNewDeptName(e.target.value)}
// //                 className="w-full border border-gray-300 rounded-lg px-4 py-2"
// //               />
// //               {newDeptName.trim() !== '' && (
// //                 <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
// //                   {departmentOptions
// //                     .filter(
// //                       (label) =>
// //                         label.toLowerCase().includes(newDeptName.toLowerCase()) &&
// //                         label.toLowerCase() !== newDeptName.toLowerCase()
// //                     )
// //                     .map((label, idx) => (
// //                       <li
// //                         key={idx}
// //                         onClick={() => handleSuggestionClick(label)}
// //                         className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
// //                       >
// //                         {label}
// //                       </li>
// //                     ))}
// //                 </ul>
// //               )}
// //             </div>
// //             <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700">
// //               Add Department
// //             </button>
// //           </form>
// //         </div>

// //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
// //           <div className="flex justify-between items-center mb-2">
// //             <h2 className="text-2xl font-bold text-gray-900">Select Department</h2>
// //           </div>

// //           <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

// //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// //             {departments.map((dept) => (
// //               <div key={dept._id} className="relative">
// //                 <button
// //                   onClick={() => handleDepartmentClick(dept._id, dept.name)}
// //                   className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
// //                 >
// //                   {editingDept === dept._id ? (
// //                     <input
// //                       type="text"
// //                       value={editedName}
// //                       onChange={(e) => setEditedName(e.target.value)}
// //                       onBlur={() => handleUpdateDepartment(dept._id)}
// //                       onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)}
// //                       autoFocus
// //                       className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full"
// //                     />
// //                   ) : (
// //                     <>
// //                       <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
// //                       <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
// //                     </>
// //                   )}
// //                 </button>

// //                 <button
// //                   onClick={() => handleEditDepartment(dept._id, dept.name)}
// //                   className="absolute top-2 right-10 text-gray-500 hover:text-blue-600 p-1 rounded-full bg-white shadow"
// //                   title="Edit Department"
// //                   type="button"
// //                 >
// //                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
// //                     viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
// //                     <path strokeLinecap="round" strokeLinejoin="round"
// //                       d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.707.464L9 15l.707-2.121a2 2 0 01.464-.707z" />
// //                   </svg>
// //                 </button>

// //                 <button
// //                   onClick={() => handleDeleteDepartment(dept._id)}
// //                   className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow"
// //                   title="Delete Department"
// //                   type="button"
// //                 >
// //                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
// //                     viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
// //                     <path strokeLinecap="round" strokeLinejoin="round"
// //                       d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M4 7.5h16M9.75 11.25v4.5m4.5-4.5v4.5M10.5 7.5V5.25A1.5 1.5 0 0112 3.75a1.5 1.5 0 011.5 1.5V7.5" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </Layout>
// //   );
// // };

// // export default SelectDepartment;



// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// import axios from 'axios';

// const SelectDepartment = () => {
//   const [departments, setDepartments] = useState([]);
//   const [newDeptName, setNewDeptName] = useState('');
//   const [editingDept, setEditingDept] = useState(null);
//   const [editedName, setEditedName] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
//         setDepartments(res.data);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       }
//     };
//     fetchDepartments();
//   }, []);

//   const departmentOptions = [
//     'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics',
//     'Emergency', 'ICU', 'Surgery', 'Radiology', 'Laboratory', 'Pharmacy'
//   ];

//   const handleAddDepartment = async (e) => {
//     e.preventDefault();
//     const trimmed = newDeptName.trim();
//     if (!trimmed) return;
//     const exists = departments.some((dept) => dept.name.toLowerCase() === trimmed.toLowerCase());
//     if (exists) {
//       alert('Department already exists');
//       return;
//     }
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, { name: trimmed });
//       setDepartments((prev) => [...prev, res.data]);
//       setNewDeptName('');
//     } catch (err) {
//       alert('Failed to add department');
//     }
//   };

//   const handleSuggestionClick = (name) => setNewDeptName(name);

//   // --- REMOVED this function ---
//   // const handleDepartmentClick = (id, name) => {
//   //   navigate(`/dashboard/admin/add-hod/${id}?departmentName=${encodeURIComponent(name)}`);
//   // };

//   const handleDeleteDepartment = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this department?')) return;
//     try {
//       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`);
//       setDepartments((prev) => prev.filter((dept) => dept._id !== id));
//     } catch (err) {
//       alert('Failed to delete department');
//     }
//   };

//   const handleEditDepartment = (id, currentName) => {
//     setEditingDept(id);
//     setEditedName(currentName);
//   };

//   const handleUpdateDepartment = async (id) => {
//     const trimmed = editedName.trim();
//     if (!trimmed) return;
//     try {
//       const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, { name: trimmed });
//       setDepartments((prev) =>
//         prev.map((dept) => (dept._id === id ? { ...dept, name: res.data.name } : dept))
//       );
//       setEditingDept(null);
//     } catch (err) {
//       alert('Failed to update department');
//     }
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
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
//               {newDeptName.trim() !== '' && (
//                 <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-48 overflow-y-auto mt-1">
//                   {departmentOptions
//                     .filter((label) => label.toLowerCase().includes(newDeptName.toLowerCase()) && label.toLowerCase() !== newDeptName.toLowerCase())
//                     .map((label, idx) => (
//                       <li key={idx} onClick={() => handleSuggestionClick(label)} className="px-4 py-2 hover:bg-blue-100 cursor-pointer">{label}</li>
//                     ))}
//                 </ul>
//               )}
//             </div>
//             <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700">Add Department</button>
//           </form>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-2xl font-bold text-gray-900">Manage Departments</h2>
//           </div>
//           <p className="text-gray-600 mb-6">Add, edit, or delete departments from the list below.</p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <div key={dept._id} className="relative">
//                 {/* --- CHANGED: This is now a div instead of a button --- */}
//                 <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
//                   {editingDept === dept._id ? (
//                     <input
//                       type="text"
//                       value={editedName}
//                       onChange={(e) => setEditedName(e.target.value)}
//                       onBlur={() => handleUpdateDepartment(dept._id)}
//                       onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)}
//                       autoFocus
//                       className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     <>
//                       <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                       {/* --- REMOVED: "Click to Edit Head of Department" text --- */}
//                     </>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => handleEditDepartment(dept._id, dept.name)}
//                   className="absolute top-2 right-10 text-gray-500 hover:text-blue-600 p-1 rounded-full bg-white shadow"
//                   title="Edit Department Name"
//                   type="button"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
//                   </svg>
//                 </button>

//                 <button
//                   onClick={() => handleDeleteDepartment(dept._id)}
//                   className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow"
//                   title="Delete Department"
//                   type="button"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.913 3.75 6 4.704 6 5.834v.916m7.5 0" />
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














import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';
import axios from 'axios';

// --- Modal to prompt for HOD assignment ---
const AssignHODPromptModal = ({ isOpen, onClose, onConfirm, departmentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-bold text-gray-900">Department Added!</h3>
        <p className="text-gray-600 my-4">
          Would you like to assign a Head of Department (HOD) for "{departmentName}" now?
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="secondary" onClick={onClose}>No, Later</Button>
          <Button variant="primary" onClick={onConfirm}>Yes, Assign HOD</Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const SelectDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [showAssignPrompt, setShowAssignPrompt] = useState(false);
  const [newlyAddedDept, setNewlyAddedDept] = useState(null);
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

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    if (departments.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This department name already exists on the list.');
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, { name: trimmed });
      const newDept = res.data;
      setDepartments((prev) => [...prev, newDept]);
      setNewDeptName('');
      setNewlyAddedDept(newDept);
      setShowAssignPrompt(true);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.request) {
        errorMessage = 'Could not connect to the server.';
      } else {
        errorMessage = err.message;
      }
      alert(`Error: ${errorMessage}`);
      console.error('❌ Failed to add department:', err);
    }
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
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, { name: trimmed });
      setDepartments((prev) => prev.map((dept) => (dept._id === id ? { ...dept, name: res.data.name } : dept)));
      setEditingDept(null);
    } catch (err) {
      alert('Failed to update department');
    }
  };

  const handleNavigateToAssignHOD = () => {
    if (!newlyAddedDept) return;
    navigate(`/dashboard/admin/add-hod/${newlyAddedDept._id}?departmentName=${encodeURIComponent(newlyAddedDept.name)}`);
    setShowAssignPrompt(false);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 flex-1"
            />
            <Button type="submit" variant="primary">Add Department</Button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Manage Departments</h2>
          <p className="text-gray-600 mb-6">Edit or delete departments from the list below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept._id} className="relative group bg-blue-50 border border-blue-200 rounded-xl p-4">
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
                  <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditDepartment(dept._id, dept.name)} className="text-gray-500 hover:text-blue-600 p-2 rounded-full bg-white/80 shadow" title="Edit Department Name">
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteDepartment(dept._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full bg-white/80 shadow" title="Delete Department">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AssignHODPromptModal
        isOpen={showAssignPrompt}
        onClose={() => setShowAssignPrompt(false)}
        onConfirm={handleNavigateToAssignHOD}
        departmentName={newlyAddedDept?.name}
      />
    </Layout>
  );
};

export default SelectDepartment;
