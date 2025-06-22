// import { useState } from 'react';
// import { SidebarItem } from './common/SidebarItem';

// const Sidebar = ({ sidebarItems, currentPage, setCurrentPage, setSelectedPatient, setSelectedInvoice }) => {
//   const [openMenu, setOpenMenu] = useState(null);

//   const handleMenuClick = (item) => {
//     if (item.subItems) {
//       setOpenMenu(openMenu === item.text ? null : item.text);
//     } else {
//       if (item.page) {
//         if (item.page !== 'PatientProfile') setSelectedPatient?.(null);
//         if (item.page !== 'InvoiceDetailsPage') setSelectedInvoice?.(null);
//         setCurrentPage(item.page);
//       }
//     }
//   };

//   const handleSubMenuClick = (subPage) => {
//     if (subPage !== 'PatientProfile') setSelectedPatient?.(null);
//     if (subPage !== 'InvoiceDetailsPage') setSelectedInvoice?.(null);
//     setCurrentPage(subPage);
//   };

//   return (
//     <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
//       {/* Header */}
//       <div className="flex items-center p-6 border-b border-gray-100">
//         <div className="p-2 bg-teal-600 rounded-lg">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4a2 2 0 110-4m6 4a2 2 0 100 4m0-4a2 2 0 110-4m0 4V4a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414A1 1 0 0018 16.586V4a2 2 0 00-2-2z" />
//           </svg>
//         </div>
//         <h1 className="text-xl font-bold ml-3 text-gray-800">Hospital</h1>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 overflow-y-auto">
//         {sidebarItems.map((item) => (
//           <div key={item.text}>
//             <SidebarItem
//               icon={item.icon}
//               text={item.text}
//               onClick={() => handleMenuClick(item)}
//               hasSubmenu={!!item.subItems}
//               isOpen={openMenu === item.text}
//               active={item.page === currentPage || (item.subItems && item.subItems.some(s => s.page === currentPage))}
//             />
//             {item.subItems && openMenu === item.text && (
//               <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
//                 {item.subItems.map((sub) => (
//                   <a
//                     key={sub.page}
//                     href="#"
//                     onClick={() => handleSubMenuClick(sub.page)}
//                     className={`block py-2 text-sm transition-colors ${
//                       currentPage === sub.page ? 'text-teal-600 font-medium' : 'text-gray-600 hover:text-teal-600'
//                     }`}
//                   >
//                     {sub.label}
//                   </a>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>

//       {/* Optional Footer */}
//       <div className="p-4 border-t border-gray-100">
//         <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
//           <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">DR</span>
//           </div>
//           <div className="ml-3 flex-1">
//             <p className="text-sm font-medium text-gray-700">Dr. Admin</p>
//             <p className="text-xs text-gray-500">Dashboard Access</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// components/Sidebar.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarItem } from './common/SidebarItem';

const Sidebar = ({ sidebarItems, section = 'Hospital Management' }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.submenu) {
      setOpenMenu(openMenu === item.label ? null : item.label);
    } else {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="flex items-center p-6 border-b border-gray-100">
        <div className="p-2 bg-teal-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold ml-3 text-gray-800">{section}</h1>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-2">
        {sidebarItems.map((item, idx) => (
          <div key={item.label || item.text || idx}>
            <SidebarItem
              icon={item.icon}
              text={item.label || item.text}
              onClick={() => handleClick(item)}
              hasSubmenu={!!item.submenu}
              isOpen={openMenu === (item.label || item.text)}
              active={isActive(item.path)}
            />
            {item.submenu && openMenu === (item.label || item.text) && (
              <div className="ml-8 border-l border-gray-200 pl-4 py-2 space-y-1">
                {item.submenu.map((subItem, subIdx) => (
                  <button
                    key={subItem.label || subIdx}
                    onClick={() => handleSubItemClick(subItem)}
                    className={`block w-full text-left text-sm py-1.5 transition-colors ${
                      isActive(subItem.path)
                        ? 'text-teal-600 font-medium'
                        : 'text-gray-600 hover:text-teal-600'
                    }`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
