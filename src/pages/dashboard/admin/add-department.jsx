

// // // import React, { useState } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import Layout from '../../../components/Layout';
// // // import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// // // const initialDepartments = [
// // //   { id: 'cardiology', name: 'Cardiology' },
// // //   { id: 'neurology', name: 'Neurology' },
// // //   { id: 'orthopedics', name: 'Orthopedics' },
// // //   { id: 'pediatrics', name: 'Pediatrics' },
// // //   { id: 'general', name: 'General Medicine' },
// // //   { id: 'surgery', name: 'Surgery' },
// // //   { id: 'dermatology', name: 'Dermatology' },
// // //   { id: 'gynecology', name: 'Gynecology' },
// // // ];

// // // const SelectDepartment = () => {
// // //   const [departments, setDepartments] = useState(initialDepartments);
// // //   const [newDeptName, setNewDeptName] = useState('');
// // //   const navigate = useNavigate();

// // //   const handleSelect = (deptId) => {
// // //     navigate(`/dashboard/admin/departments/${deptId}`);
// // //   };

// // //   const handleAddDepartment = (e) => {
// // //     e.preventDefault();
// // //     const trimmed = newDeptName.trim();
// // //     if (!trimmed) return;

// // //     const newId = trimmed.toLowerCase().replace(/\s+/g, '-');
// // //     const exists = departments.find((d) => d.id === newId);
// // //     if (exists) return alert('Department already exists');

// // //     setDepartments([
// // //       ...departments,
// // //       { id: newId, name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) },
// // //     ]);
// // //     setNewDeptName('');
// // //   };

// // //   return (
// // //     <Layout sidebarItems={adminSidebar}>
// // //       <div className="p-6">
// // //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
// // //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
// // //           <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
// // //             <input
// // //               type="text"
// // //               placeholder="Enter department name"
// // //               value={newDeptName}
// // //               onChange={(e) => setNewDeptName(e.target.value)}
// // //               className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
// // //             />
// // //             <button
// // //               type="submit"
// // //               className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
// // //             >
// // //               Add Department
// // //             </button>
// // //           </form>
// // //         </div>

// // //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
// // //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
// // //           <p className="text-gray-600 mb-6">Choose a department to manage or view details</p>

// // //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// // //             {departments.map((dept) => (
// // //               <button
// // //                 key={dept.id}
// // //                 onClick={() => handleSelect(dept.id)}
// // //                 className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
// // //               >
// // //                 <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
// // //                 <p className="text-sm text-blue-600">Click to manage</p>
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </Layout>
// // //   );
// // // };

// // // export default SelectDepartment;



// // import React, { useState } from 'react';
// // import { Dialog } from '@headlessui/react';
// // import Layout from '../../../components/Layout';
// // import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// // const initialDepartments = [
// //   { id: 'cardiology', name: 'Cardiology' },
// //   { id: 'neurology', name: 'Neurology' },
// //   { id: 'orthopedics', name: 'Orthopedics' },
// //   { id: 'pediatrics', name: 'Pediatrics' },
// //   { id: 'general', name: 'General Medicine' },
// //   { id: 'surgery', name: 'Surgery' },
// //   { id: 'dermatology', name: 'Dermatology' },
// //   { id: 'gynecology', name: 'Gynecology' },
// // ];

// // const SelectDepartment = () => {
// //   const [departments, setDepartments] = useState(initialDepartments);
// //   const [newDeptName, setNewDeptName] = useState('');
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [selectedDept, setSelectedDept] = useState(null);

// //   const openModal = (dept) => {
// //     setSelectedDept(dept);
// //     setIsOpen(true);
// //   };

// //   const closeModal = () => {
// //     setIsOpen(false);
// //     setSelectedDept(null);
// //   };

// //   const handleAddDepartment = (e) => {
// //     e.preventDefault();
// //     const trimmed = newDeptName.trim();
// //     if (!trimmed) return;

// //     const newId = trimmed.toLowerCase().replace(/\s+/g, '-');
// //     const exists = departments.find((d) => d.id === newId);
// //     if (exists) return alert('Department already exists');

// //     setDepartments([
// //       ...departments,
// //       { id: newId, name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) },
// //     ]);
// //     setNewDeptName('');
// //   };

// //   return (
// //     <Layout sidebarItems={adminSidebar}>
// //       <div className="p-6">
// //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
// //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
// //           <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
// //             <input
// //               type="text"
// //               placeholder="Enter department name"
// //               value={newDeptName}
// //               onChange={(e) => setNewDeptName(e.target.value)}
// //               className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
// //             />
// //             <button
// //               type="submit"
// //               className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
// //             >
// //               Add Department
// //             </button>
// //           </form>
// //         </div>

// //         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
// //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
// //           <p className="text-gray-600 mb-6">Choose a department to add a doctor</p>

// //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// //             {departments.map((dept) => (
// //               // <button
// //               //   key={dept.id}
// //               //   onClick={() => openModal(dept)}
// //               //   className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
// //               // >
// //               //   <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
// //               //   <p className="text-sm text-blue-600">Click to add Head of Department </p>
// //               // </button>



// //               <button
// //                 key={dept.id}
// //                 onClick={() => navigate('/dashboard/admin/add-doctor')}
// //                 className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition">
// //                 <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
// //                 <p className="text-sm text-blue-600">Click to add Head of Department</p>
// //               </button>






// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Modal */}
// //       <Dialog open={isOpen} onClose={closeModal} className="fixed z-50 inset-0 overflow-y-auto">
// //         <div className="flex items-center justify-center min-h-screen p-4">
// //           <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-xl shadow-xl border border-gray-200">
// //             <Dialog.Title className="text-xl font-bold mb-4">
// //               Add Head Of department to {selectedDept?.name}
// //             </Dialog.Title>
            



// //             <form className="space-y-4">
// //               <input
// //                 type="text"
// //                 placeholder="Full Name"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="email"
// //                 placeholder="Email Address"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="tel"
// //                 placeholder="Phone Number"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Qualification (e.g., MBBS, MD)"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Years of Experience"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Specialization"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Availability (e.g., Mon-Fri, 9AM-1PM)"
// //                 className="w-full px-4 py-2 border rounded-md"
// //                 required
// //               />

// //               <div className="flex justify-end gap-2">
// //                 <button
// //                   type="button"
// //                   onClick={closeModal}
// //                   className="px-4 py-2 bg-gray-300 rounded-md"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="px-4 py-2 bg-blue-600 text-white rounded-md"
// //                 >
// //                   Add Doctor
// //                 </button>
// //               </div>
// //             </form>




// //           </Dialog.Panel>
// //         </div>
// //       </Dialog>
// //     </Layout>
// //   );
// // };

// // export default SelectDepartment;





// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const initialDepartments = [
//   { id: 'cardiology', name: 'Cardiology' },
//   { id: 'neurology', name: 'Neurology' },
//   { id: 'orthopedics', name: 'Orthopedics' },
//   { id: 'pediatrics', name: 'Pediatrics' },
//   { id: 'general', name: 'General Medicine' },
//   { id: 'surgery', name: 'Surgery' },
//   { id: 'dermatology', name: 'Dermatology' },
//   { id: 'gynecology', name: 'Gynecology' },
// ];

// const SelectDepartment = () => {
//   const [departments, setDepartments] = useState(initialDepartments);
//   const [newDeptName, setNewDeptName] = useState('');
//   const navigate = useNavigate();

//   const handleAddDepartment = (e) => {
//     e.preventDefault();
//     const trimmed = newDeptName.trim();
//     if (!trimmed) return;

//     const newId = trimmed.toLowerCase().replace(/\s+/g, '-');
//     const exists = departments.find((d) => d.id === newId);
//     if (exists) return alert('Department already exists');

//     setDepartments([
//       ...departments,
//       { id: newId, name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) },
//     ]);
//     setNewDeptName('');
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
//           <p className="text-gray-600 mb-6">Click a department to add its Head Doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {departments.map((dept) => (
//               <button
//                 key={dept.id}
//                 onClick={() => navigate('/dashboard/admin/add-doctor')}
//                 className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
//               >
//                 <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
//                 <p className="text-sm text-blue-600">Click to add Head of Department</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default SelectDepartment;









import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const initialDepartments = [
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'general', name: 'General Medicine' },
  { id: 'surgery', name: 'Surgery' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'gynecology', name: 'Gynecology' },
];

const SelectDepartment = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [newDeptName, setNewDeptName] = useState('');
  const navigate = useNavigate();

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    const newId = trimmed.toLowerCase().replace(/\s+/g, '-');
    const exists = departments.find((d) => d.id === newId);
    if (exists) return alert('Department already exists');

    setDepartments([
      ...departments,
      { id: newId, name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) },
    ]);
    setNewDeptName('');
  };

  const handleDepartmentClick = (deptId) => {
    navigate(`/dashboard/admin/add-hod/${deptId}`);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        {/* Add Department Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Department Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
          <p className="text-gray-600 mb-6">Click a department to add its Head Doctor</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentClick(dept.id)}
                className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
              >
                <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                <p className="text-sm text-blue-600">Click to add Head of Department</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectDepartment;

