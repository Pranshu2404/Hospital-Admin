// import { useState, useEffect } from 'react';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// import { Button, FormInput } from '../../../components/common/FormElements';
// import axios from 'axios';

// const AddHodMain = () => {
//   const [departments, setDepartments] = useState([]);
//   const [newDeptName, setNewDeptName] = useState('');
//   const [isAdding, setIsAdding] = useState(false); // State to toggle the add form
//   const [loading, setLoading] = useState(true);

//   // Fetch departments when the component loads
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
//         setDepartments(res.data);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDepartments();
//   }, []);

//   // Handle the submission of the new department form
//   const handleAddDepartment = async (e) => {
//     e.preventDefault();
//     const trimmedName = newDeptName.trim();
//     if (!trimmedName) return;

//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/departments`, { name: trimmedName });
//       setDepartments(prevDepts => [...prevDepts, res.data]); // Add new department to the list
//       setNewDeptName(''); // Reset input field
//       setIsAdding(false); // Hide the form
//     } catch (err) {
//       alert('Failed to add department. It may already exist.');
//       console.error('❌ Failed to add department:', err);
//     }
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
//             {!isAdding && (
//               <Button onClick={() => setIsAdding(true)}>
//                 Click to add department here
//               </Button>
//             )}
//           </div>

//           {/* Conditionally render the form to add a new department */}
//           {isAdding && (
//             <form onSubmit={handleAddDepartment} className="flex items-center gap-4 p-4 mb-6 bg-gray-50 rounded-lg">
//               <FormInput
//                 placeholder="Enter new department name"
//                 value={newDeptName}
//                 onChange={(e) => setNewDeptName(e.target.value)}
//                 autoFocus
//               />
//               <div className="flex gap-2">
//                 <Button type="submit" variant="primary">Save</Button>
//                 <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
//               </div>
//             </form>
//           )}
          
//           {/* Display the list of existing departments */}
//           {loading ? (
//             <p>Loading departments...</p>
//           ) : (
//             <div className="space-y-3">
//               {departments.map((dept) => (
//                 <div key={dept._id} className="bg-gray-100 rounded-lg p-3">
//                   <p className="font-medium text-gray-800">{dept.name}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AddHodMain;





















// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
// import { Button } from '../../../components/common/FormElements';
// import axios from 'axios';

// const AddHodMain = () => {
//   const [departments, setDepartments] = useState([]);
//   const [editingDept, setEditingDept] = useState(null);
//   const [editedName, setEditedName] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
//         setDepartments(res.data);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       }
//     };
//     fetchDepartments();
//   }, []);

//   const handleDeleteDepartment = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this department?')) return;
//     try {
//       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
//       setDepartments(prev => prev.filter(dept => dept._id !== id));
//     } catch (err) {
//       alert('Failed to delete department.');
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
//       const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`, { name: trimmed });
//       setDepartments(prev =>
//         prev.map(dept => (dept._id === id ? { ...dept, name: res.data.name } : dept))
//       );
//       setEditingDept(null);
//     } catch (err) {
//       alert('Failed to update department.');
//     }
//   };
  
//   const handleDepartmentClick = (id, name) => {
//     navigate(`/dashboard/admin/add-hod/${id}?departmentName=${encodeURIComponent(name)}`);
//   };

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           {/* --- UPDATED HEADING AND TEXT --- */}
//           <h2 className="text-2xl font-bold text-gray-900">Add HOD</h2>
//           <p className="text-gray-600 mb-6">Click on the department to add HOD's.</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <div key={dept._id} className="relative group">
//                 <button
//                   onClick={() => handleDepartmentClick(dept._id, dept.name)}
//                   className="w-full h-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
//                 >
//                   {editingDept === dept._id ? (
//                     <input
//                       type="text"
//                       value={editedName}
//                       onChange={(e) => setEditedName(e.target.value)}
//                       onBlur={() => handleUpdateDepartment(dept._id)}
//                       onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)}
//                       autoFocus
//                       className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full"
//                       onClick={(e) => e.stopPropagation()}
//                     />
//                   ) : (
//                     <>
//                       <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                       <p className="text-sm text-blue-600">Click to assign HOD</p>
//                     </>
//                   )}
//                 </button>

//                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button
//                     onClick={(e) => { e.stopPropagation(); handleEditDepartment(dept._id, dept.name); }}
//                     className="text-gray-500 hover:text-blue-600 p-2 rounded-full bg-white/80 shadow"
//                     title="Edit Department Name"
//                   >
//                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
//                   </button>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept._id); }}
//                     className="text-red-500 hover:text-red-700 p-2 rounded-full bg-white/80 shadow"
//                     title="Delete Department"
//                   >
//                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.913 3.75 6 4.704 6 5.834v.916m7.5 0" /></svg>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AddHodMain;





import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import axios from 'axios'; // <--- ADD THIS LINE

const AddHodMain = () => {
  const [departments, setDepartments] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [editedName, setEditedName] = useState('');
  const navigate = useNavigate();
  const [view, setView] = useState('grid');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`);
      setDepartments(prev => prev.filter(dept => dept._id !== id));
    } catch (err) {
      alert('Failed to delete department.');
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
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`, { name: trimmed });
      setDepartments(prev =>
        prev.map(dept => (dept._id === id ? { ...dept, name: res.data.name } : dept))
      );
      setEditingDept(null);
    } catch (err) {
      alert('Failed to update department.');
    }
  };
  
  const handleDepartmentClick = (id, name) => {
    navigate(`/dashboard/admin/add-hod/${id}?departmentName=${encodeURIComponent(name)}`);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add HOD</h2>
              <p className="text-gray-600">Click on a department to add or manage its HOD.</p>
            </div>
            <button
              onClick={() => setView(v => (v === 'grid' ? 'list' : 'grid'))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-600"
              title={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
            >
              {view === 'grid' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              )}
            </button>
          </div>

          <div>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <div key={dept._id} className="relative group">
                    <button
                      onClick={() => handleDepartmentClick(dept._id, dept.name)}
                      className="w-full h-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
                    >
                      {editingDept === dept._id ? (
                        <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} onBlur={() => handleUpdateDepartment(dept._id)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)} autoFocus className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full" onClick={(e) => e.stopPropagation()} />
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                          <p className="text-sm text-blue-600">Click to assign HOD</p>
                        </>
                      )}
                    </button>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); handleEditDepartment(dept._id, dept.name); }} className="text-gray-500 hover:text-blue-600 p-2 rounded-full bg-white/80 shadow" title="Edit Department Name"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></button>
                       <button onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept._id); }} className="text-red-500 hover:text-red-700 p-2 rounded-full bg-white/80 shadow" title="Delete Department"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.913 3.75 6 4.704 6 5.834v.916m7.5 0" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition">
                    <div className="flex-grow cursor-pointer" onClick={() => handleDepartmentClick(dept._id, dept.name)}>
                      {editingDept === dept._id ? (
                        <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} onBlur={() => handleUpdateDepartment(dept._id)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateDepartment(dept._id)} autoFocus className="text-lg font-medium text-blue-900 bg-white border border-blue-300 rounded px-2 py-1 w-full" onClick={(e) => e.stopPropagation()} />
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                          <p className="text-sm text-blue-600">Click to assign HOD</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                       <button onClick={() => handleEditDepartment(dept._id, dept.name)} className="text-gray-500 hover:text-blue-600 p-2 rounded-full" title="Edit Department Name"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></button>
                       <button onClick={() => handleDeleteDepartment(dept._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full" title="Delete Department"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.913 3.75 6 4.704 6 5.834v.916m7.5 0" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddHodMain;