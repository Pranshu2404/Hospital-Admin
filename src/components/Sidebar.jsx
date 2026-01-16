import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarItem } from './common/SidebarItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHospital, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const Sidebar = ({ sidebarItems, onCloseMobile }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hospitalName, setHospitalName] = useState('Mediqliq');
  const [hospitalLogo, setHospitalLogo] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize from localStorage to avoid flicker
  const [vitalsEnabled, setVitalsEnabled] = useState(() => {
    const stored = localStorage.getItem('vitalsEnabled');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          setHospitalName(res.data[0].hospitalName);
          setHospitalLogo(res.data[0].logo);

          // Handle Vitals Enabled Setting
          const v = res.data[0].vitalsEnabled !== undefined ? res.data[0].vitalsEnabled : true;
          setVitalsEnabled(v);
          localStorage.setItem('vitalsEnabled', v);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  // Filter sidebar items based on vitalsEnabled
  const filteredSidebarItems = sidebarItems.filter(item => {
    if ((item.label === 'Nurses' || item.text === 'Nurses') && !vitalsEnabled) {
      return false;
    }
    return true;
  });

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname, onCloseMobile]);

  const handleClick = (item) => {
    if (item.submenu) {
      setOpenMenu(openMenu === item.label ? null : item.label);
    } else {
      navigate(item.path);
      const isMobile = window.innerWidth < 1024;
      if (isMobile && onCloseMobile) {
        setTimeout(() => onCloseMobile(), 100); // Small delay for smooth transition
      }
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    const isMobile = window.innerWidth < 1024;
    if (isMobile && onCloseMobile) {
      setTimeout(() => onCloseMobile(), 100);
    }
  };

  // Listen for vitals updates
  useEffect(() => {
    const handleVitalsUpdate = () => {
      const stored = localStorage.getItem('vitalsEnabled');
      setVitalsEnabled(stored === null ? true : stored === 'true');
    };

    window.addEventListener('vitals-updated', handleVitalsUpdate);
    return () => window.removeEventListener('vitals-updated', handleVitalsUpdate);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-xl lg:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-5 border-b border-gray-100">
        <div className="flex items-center">
          <div className="rounded-full border-2 border-teal-600 flex-shrink-0
                  w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
            {hospitalLogo ? (
              <img
                src={hospitalLogo}
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FontAwesomeIcon
                icon={faHospital}
                className="text-teal-600 w-6 h-6 lg:w-7 lg:h-7"
              />
            )}
          </div>

          <h1 className="text-lg lg:text-xl font-bold ml-3 text-gray-800 truncate">
            {hospitalName}
          </h1>
        </div>

        {/* Close Button (Mobile) */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="text-gray-500 w-5 h-5"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto space-y-1 lg:space-y-2">
        {filteredSidebarItems.map((item, idx) => (
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
                    className={`
                      block w-full text-left text-sm lg:text-base py-1.5 transition-colors
                      ${isActive(subItem.path)
                        ? 'text-teal-600 font-medium'
                        : 'text-gray-600 hover:text-teal-600'
                      }
                    `}
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