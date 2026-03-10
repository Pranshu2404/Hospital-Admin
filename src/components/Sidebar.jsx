import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarItem } from './common/SidebarItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHospital, faBars, faTimes, faUserSecret, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const Sidebar = ({ sidebarItems, onCloseMobile }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hospitalName, setHospitalName] = useState('Mediqliq');
  const [hospitalLogo, setHospitalLogo] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [userRole, setUserRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize from localStorage to avoid flicker
  const [vitalsEnabled, setVitalsEnabled] = useState(() => {
    const stored = localStorage.getItem('vitalsEnabled');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    // Check if current user is a demo user
    const demoFlag = localStorage.getItem('isDemoUser') === 'true';
    setIsDemoUser(demoFlag);

    // Get current user role
    const userData = JSON.parse(localStorage.getItem('hospitalUser') || '{}');
    setUserRole(userData.role || '');
  }, []);

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

  // Handle return to demo user
  const handleReturnToDemo = async () => {
    try {
      // Get the original demo user's data from localStorage
      const userData = JSON.parse(localStorage.getItem('hospitalUser') || '{}');
      const originalDemoToken = userData?.token;
      const originalDemoRole = 'demo';

      if (originalDemoToken) {
        // Clear all role-specific data
        localStorage.removeItem('doctorId');
        localStorage.removeItem('staffId');
        localStorage.removeItem('pharmacyId');
        localStorage.removeItem('pathologyStaffId');

        // Create demo user data
        const demoUserData = {
          token: originalDemoToken,
          role: originalDemoRole,
        };

        // Store in localStorage
        localStorage.setItem('hospitalUser', JSON.stringify(demoUserData));
        localStorage.setItem('isDemoUser', 'true');

        // Navigate to demo dashboard
        navigate('/dashboard/demo');
      } else {
        // If no original token, just logout and go to demo login
        localStorage.removeItem('hospitalUser');
        localStorage.removeItem('isDemoUser');
        localStorage.removeItem('doctorId');
        localStorage.removeItem('staffId');
        localStorage.removeItem('pharmacyId');
        localStorage.removeItem('pathologyStaffId');
        navigate('/');
      }
    } catch (error) {
      console.error('Error returning to demo user:', error);
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

          <div className="ml-3 flex flex-col leading-tight">
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 whitespace-normal break-words">
              {hospitalName}
            </h1>
            <span className="text-[11px] lg:text-xs text-gray-400 font-medium ml-1">
              Powered by <span className="text-emerald-600 font-semibold">MediQliq</span>
            </span>
          </div>

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

      {/* Demo User Banner (Mobile/Desktop) - Only show when in demo mode but not on demo role */}
      {isDemoUser && userRole !== 'demo' && (
        <div className="mx-3 lg:mx-4 mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserSecret} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Demo Mode</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto space-y-1 lg:space-y-3">
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

      {/* Footer - Back to Demo Button - Only show for demo users who are not in demo role */}
      {isDemoUser && userRole !== 'demo' && (
        <div className="p-3 lg:p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleReturnToDemo}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors group"
          >
            <FontAwesomeIcon icon={faUserSecret} className="text-white" />
            <span className="flex-1 text-sm font-medium text-left">Back to Demo Dashboard</span>
            <FontAwesomeIcon icon={faSignOutAlt} className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
          
          {/* Optional: Small hint text */}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Return to your original demo account
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;