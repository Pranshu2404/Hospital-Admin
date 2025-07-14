
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