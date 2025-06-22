// // import React, { useState } from 'react';
// // import { NavLink } from 'react-router-dom';
// // import { FaCalendarCheck, FaFileMedical, FaFileAlt, FaUserMd, FaUserCircle, FaChartLine, FaUsers } from 'react-icons/fa';

// // const SidebarDoctor = () => {
// //   const [openMenu, setOpenMenu] = useState(null);

// //   const menuItems = [
// //     { name: 'Dashboard', path: '/dashboard/doctor', icon: <FaChartLine /> },
// //     { name: 'Appointments', path: '/dashboard/doctor/appointments', icon: <FaCalendarCheck /> },
// //     { name: 'Schedule', path: '/dashboard/doctor/schedule', icon: <FaFileAlt /> },
// //     {
// //       name: 'Doctors',
// //       icon: <FaUserMd />,
// //       subItems: [
// //         { name: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
// //         { name: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
// //       ],
// //     },
// //     { name: 'Patient Files', path: '/dashboard/doctor/patient-files', icon: <FaFileMedical /> },
// //     { name: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: <FaUsers /> },
// //     { name: 'Profile', path: '/dashboard/doctor/profile', icon: <FaUserCircle /> },
// //   ];

// //   const handleToggle = (name) => {
// //     setOpenMenu(openMenu === name ? null : name);
// //   };

// //   return (
// //     <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm min-h-screen">
// //       {/* Header */}
// //       <div className="flex items-center p-6 border-b border-gray-100">
// //         <div className="p-2 bg-blue-600 rounded-lg">
// //           <FaUserMd className="text-white text-xl" />
// //         </div>
// //         <h1 className="text-xl font-bold ml-3 text-gray-800">Doctor Panel</h1>
// //       </div>

// //       {/* Navigation */}
// //       <nav className="flex-1 p-4 overflow-y-auto">
// //         {menuItems.map((item, index) =>
// //           item.subItems ? (
// //             <div key={index} className="mb-2">
// //               <button
// //                 onClick={() => handleToggle(item.name)}
// //                 className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 font-semibold focus:outline-none"
// //               >
// //                 <span className="mr-2">{item.icon}</span>
// //                 <span>{item.name}</span>
// //               </button>
// //               {openMenu === item.name && (
// //                 <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
// //                   {item.subItems.map((subItem, subIndex) => (
// //                     <NavLink
// //                       key={subIndex}
// //                       to={subItem.path}
// //                       className={({ isActive }) =>
// //                         `block py-1 text-sm rounded transition-colors ${
// //                           isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
// //                         }`
// //                       }
// //                     >
// //                       {subItem.name}
// //                     </NavLink>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           ) : (
// //             <NavLink
// //               key={index}
// //               to={item.path}
// //               className={({ isActive }) =>
// //                 `flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
// //                   isActive
// //                     ? 'bg-blue-100 text-blue-700'
// //                     : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
// //                 }`
// //               }
// //             >
// //               <span className="mr-2">{item.icon}</span>
// //               <span>{item.name}</span>
// //             </NavLink>
// //           )
// //         )}
// //       </nav>

// //       {/* Footer */}
// //       <div className="p-4 border-t border-gray-100">
// //         <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
// //           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
// //             <span className="text-white text-sm font-medium">DR</span>
// //           </div>
// //           <div className="ml-3 flex-1">
// //             <p className="text-sm font-medium text-gray-700">Dr. Sarah Wilson</p>
// //             <p className="text-xs text-gray-500">Senior Specialist</p>
// //           </div>
// //         </div>
// //       </div>
// //     </aside>
// //   );
// // };

// // export default SidebarDoctor;










// // import React, { useState } from 'react';
// // import { NavLink } from 'react-router-dom';
// // import { FaCalendarCheck, FaFileMedical, FaFileAlt, FaUserMd, FaUserCircle, FaChartLine, FaUsers } from 'react-icons/fa';

// // const SidebarDoctor = () => {
// //   const [openMenu, setOpenMenu] = useState(null);

// //   const menuItems = [
// //     { name: 'Dashboard', path: '/dashboard/doctor', icon: <FaChartLine /> },
// //     { name: 'Appointments', path: '/dashboard/doctor/appointments', icon: <FaCalendarCheck /> },
// //     { name: 'Schedule', path: '/dashboard/doctor/schedule', icon: <FaFileAlt /> },
// //     {
// //       name: 'Doctors',
// //       icon: <FaUserMd />,
// //       subItems: [
// //         { name: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
// //         { name: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
// //       ],
// //     },
// //     { name: 'Patient Files', path: '/dashboard/doctor/patient-files', icon: <FaFileMedical /> },
// //     { name: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: <FaUsers /> },
// //     { name: 'Profile', path: '/dashboard/doctor/profile', icon: <FaUserCircle /> },
// //   ];

// //   const handleToggle = (name) => {
// //     setOpenMenu(openMenu === name ? null : name);
// //   };

// //   return (
// //     <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm min-h-screen">
// //       {/* Header */}
// //       <div className="flex items-center p-6 border-b border-gray-100">
// //         <div className="p-2 bg-blue-600 rounded-lg">
// //           <FaUserMd className="text-white text-xl" />
// //         </div>
// //         <h1 className="text-xl font-bold ml-3 text-gray-800">Doctor Panel</h1>
// //       </div>

// //       {/* Navigation */}
// //       <nav className="flex-1 p-4 overflow-y-auto">
// //         {menuItems.map((item, index) =>
// //           item.subItems ? (
// //             <div key={index} className="mb-2">
// //               <button
// //                 onClick={() => handleToggle(item.name)}
// //                 className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 font-semibold focus:outline-none"
// //               >
// //                 <span className="mr-2">{item.icon}</span>
// //                 <span>{item.name}</span>
// //               </button>
// //               {openMenu === item.name && (
// //                 <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
// //                   {item.subItems.map((subItem, subIndex) => (
// //                     <NavLink
// //                       key={subIndex}
// //                       to={subItem.path}
// //                       className={({ isActive }) =>
// //                         `block py-1 text-sm rounded transition-colors ${
// //                           isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
// //                         }`
// //                       }
// //                     >
// //                       {subItem.name}
// //                     </NavLink>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           ) : (
// //             <NavLink
// //               key={index}
// //               to={item.path}
// //               className={({ isActive }) =>
// //                 `flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
// //                   isActive
// //                     ? 'bg-blue-100 text-blue-700'
// //                     : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
// //                 }`
// //               }
// //             >
// //               <span className="mr-2">{item.icon}</span>
// //               <span>{item.name}</span>
// //             </NavLink>
// //           )
// //         )}
// //       </nav>

// //       {/* Footer */}
// //       <div className="p-4 border-t border-gray-100">
// //         <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
// //           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
// //             <span className="text-white text-sm font-medium">DR</span>
// //           </div>
// //           <div className="ml-3 flex-1">
// //             <p className="text-sm font-medium text-gray-700">Dr. Sarah Wilson</p>
// //             <p className="text-xs text-gray-500">Senior Specialist</p>
// //           </div>
// //         </div>
// //       </div>
// //     </aside>
// //   );
// // };

// // export default SidebarDoctor;







// import React, { useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import {
//   FaCalendarCheck,
//   FaFileMedical,
//   FaFileAlt,
//   FaUserMd,
//   FaUserCircle,
//   FaChartLine,
//   FaUsers,
//   FaChevronDown,
//   FaChevronRight,
// } from 'react-icons/fa';

// const SidebarDoctor = () => {
//   const location = useLocation();
//   const [openMenu, setOpenMenu] = useState(null);

//   const menuItems = [
//     { name: 'Dashboard', path: '/dashboard/doctor', icon: <FaChartLine /> },
//     { name: 'Appointments', path: '/dashboard/doctor/appointments', icon: <FaCalendarCheck /> },
//     { name: 'Schedule', path: '/dashboard/doctor/schedule', icon: <FaFileAlt /> },
//     {
//       name: 'Doctors',
//       icon: <FaUserMd />,
//       subItems: [
//         { name: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
//         { name: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
//       ],
//     },
//     { name: 'Patient Files', path: '/dashboard/doctor/patient-files', icon: <FaFileMedical /> },
//     { name: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: <FaUsers /> },
//     { name: 'Profile', path: '/dashboard/doctor/profile', icon: <FaUserCircle /> },
//   ];

//   const handleToggle = (name) => {
//     setOpenMenu(openMenu === name ? null : name);
//   };

//   const isActiveRoute = (path) => location.pathname === path;

//   return (
//     <aside className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col">
//       {/* Header */}
//       <div className="flex items-center px-6 py-4 border-b border-gray-100">
//         <div className="p-2 bg-teal-600 rounded-lg">
//           <FaUserMd className="text-white text-xl" />
//         </div>
//         <h1 className="ml-3 text-xl font-bold text-gray-800">Hospital Admin</h1>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto text-sm font-medium">
//         {menuItems.map((item, index) =>
//           item.subItems ? (
//             <div key={index}>
//               <button
//                 onClick={() => handleToggle(item.name)}
//                 className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-teal-600 transition-colors"
//               >
//                 <div className="flex items-center">
//                   <span className="mr-2 text-lg">{item.icon}</span>
//                   {item.name}
//                 </div>
//                 <span className="text-xs">
//                   {openMenu === item.name ? <FaChevronDown /> : <FaChevronRight />}
//                 </span>
//               </button>
//               {openMenu === item.name && (
//                 <div className="ml-7 mt-1 border-l border-gray-200 pl-3 space-y-1">
//                   {item.subItems.map((subItem, subIndex) => (
//                     <NavLink
//                       key={subIndex}
//                       to={subItem.path}
//                       className={({ isActive }) =>
//                         `block px-2 py-1 rounded-md transition ${
//                           isActive
//                             ? 'bg-teal-100 text-teal-800 font-semibold'
//                             : 'text-gray-600 hover:text-teal-600'
//                         }`
//                       }
//                     >
//                       {subItem.name}
//                     </NavLink>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <NavLink
//               key={index}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center px-3 py-2 rounded-lg transition ${
//                   isActive
//                     ? 'bg-teal-100 text-teal-800'
//                     : 'text-gray-700 hover:text-teal-700 hover:bg-gray-50'
//                 }`
//               }
//             >
//               <span className="mr-2 text-lg">{item.icon}</span>
//               {item.name}
//             </NavLink>
//           )
//         )}
//       </nav>

//       {/* Footer */}
//       <div className="px-4 py-4 border-t border-gray-100">
//         <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
//           <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">DR</span>
//           </div>
//           <div className="ml-3 flex-1">
//             <p className="text-sm font-semibold text-gray-800">Dr. Sarah Wilson</p>
//             <p className="text-xs text-gray-500">Cardiologist</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default SidebarDoctor;



// const SidebarDoctor = () => {
//   return (
//     <div>Sidebar content here</div>
//   );
// };

// export default SidebarDoctor; 









import React from 'react';
import { NavLink } from 'react-router-dom';
import { doctorSidebar } from '../constants/sidebarItems/doctorSidebar';

const SidebarDoctor = () => {
  return (
    <aside className="w-64 bg-white shadow h-screen p-4">
      <ul className="space-y-2">
        {doctorSidebar.map((item, index) => (
          <li key={index}>
            {item.submenu ? (
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <item.icon />
                  {item.label}
                </div>
                <ul className="ml-6 space-y-1 mt-1">
                  {item.submenu.map((sub, idx) => (
                    <li key={idx}>
                      <NavLink to={sub.path} className="text-gray-600 hover:text-blue-600 block">
                        {sub.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <NavLink to={item.path} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <item.icon />
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarDoctor;