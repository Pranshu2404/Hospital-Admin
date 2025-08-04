
// components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarItem } from './common/SidebarItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHospital } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios'; 

const Sidebar = ({ sidebarItems }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hospitalName, setHospitalName] = useState('Hospital Management'); 
  const location = useLocation();
  const navigate = useNavigate();

useEffect(() => {
  const fetchHospitalData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals`);

      if (res.data && res.data.length > 0) {
        const hospital = res.data[0]; 
        console.log('Hospital data fetched:', hospital);
        setHospitalName(hospital.hospitalName); 
      } else {
        console.warn('No hospital data received from API.');
      }
    } catch (err) {
      console.error('Failed to fetch hospital data:', err);
    }
  };

  fetchHospitalData();
}, []);

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
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-md shadow-black">
      <div className="flex items-center p-5 border-b border-gray-100">
        <div className="p-3 rounded-[300px] border-2 border-teal-600">
          <FontAwesomeIcon icon={faHospital} className="text-teal-600 w-9 h-8" />
        </div>
        {/* Display the hospital name */}
        <h1 className="text-xl font-bold ml-3 text-gray-800">{hospitalName}</h1>
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
                    className={`block w-full text-left text-base py-1.5 transition-colors ${
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