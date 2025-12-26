import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchIcon, BellIcon, ChevronDownIcon } from './common/Icons';
import { useSetupTracker } from '../context/SetupTrackerContext';
import { RefreshCwIcon } from 'lucide-react';

// --- Icons for the Dropdown ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>
        </div>
        <div className="flex border-t border-gray-100 p-4 gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
          >
            Reset Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ currentPage, section = 'Hospital', sidebarItems = [], user = { name: '', role: '', image: null } }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const dropdownRef = useRef(null);
  const [displayName, setDisplayName] = useState(user.name);
  
  const { resetProgress } = useSetupTracker();
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const roleSegment = pathSegments[1] || 'admin';
    const keysToCheck = [
      'profileName',
      'selectedName',
      'name',
      `${roleSegment}Name`,
      `${roleSegment}name`
    ];

    for (const key of keysToCheck) {
      const val = localStorage.getItem(key);
      if (val) {
        setDisplayName(val);
        return;
      }
    }
    const domEl = document.querySelector('[data-profile-name]') || document.getElementById('profile-name');
    if (domEl && domEl.textContent && domEl.textContent.trim()) {
      setDisplayName(domEl.textContent.trim());
      return;
    }
    setDisplayName(roleSegment.charAt(0).toUpperCase() + roleSegment.slice(1));
  }, [location.pathname, user.name]);

  const handleProfileNavigation = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.length > 2 && pathSegments[1] === 'dashboard') {
      const currentRole = pathSegments[2];
      navigate(`/dashboard/${currentRole}/profile`);
    } else {
      navigate('/dashboard/admin/profile'); 
    }
    setIsProfileOpen(false);
  };

  const handleResetTutorial = () => {
    resetProgress(); // Use the resetProgress from the hook
    setShowResetModal(false);
    setIsProfileOpen(false);
  };

  const getPageTitle = () => {
    let found = null;
    for (const item of sidebarItems) {
      if ((item.path && window.location.pathname === item.path) || (item.page && currentPage === item.page)) {
        found = item.label || item.text; break;
      }
    }
    if (found) return found;
    switch (currentPage) {
       case 'Dashboard': return 'Dashboard';
       case 'AppointmentList': return 'Appointments';
       default: return section;
    }
  };

  // Get user role from path
  const getUserRole = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.length > 2 && pathSegments[1] === 'dashboard') {
      const role = pathSegments[2];
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
    return user.role || 'Admin';
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 sticky top-0 z-40 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          
          {/* --- Left: Title & Breadcrumbs --- */}
          <div className="flex flex-col">
             <div className="flex items-center text-sm text-gray-500 font-medium space-x-2 mb-0.5">
                <span>{section}</span>
                <span className="text-gray-300">/</span>
                <span className="text-teal-600">{getPageTitle()}</span>
             </div>
             <h2 className="text-xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h2>
          </div>
          
          {/* --- Right: Actions --- */}
          <div className="flex items-center space-x-4">
            
            {/* Reset Tutorial Button */}
            <button 
              onClick={() => setShowResetModal(true)}
              className="relative p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 group flex items-center gap-2"
              title="Reset Tutorial Progress"
            >
              <RefreshCwIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Reset Tutorial</span>
            </button>

            {/* Professional Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border transition-all duration-200 ${isProfileOpen ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-100' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'}`}
              >
                <div className="relative">
                  {/* Avatar Image or Gradient Initials */}
                  {user.image ? (
                     <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-300 to-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-sm border-2 border-white">
                       {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                     </div>
                  )}
                  {/* Online Status Dot */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                
                <div className="hidden md:block text-left mr-1">
                  <p className="text-sm font-bold text-gray-700 leading-none">{displayName}</p>
                  <p className="text-[10px] font-medium text-teal-600 uppercase tracking-wide mt-0.5">{getUserRole()}</p>
                </div>
                
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 transform origin-top-right transition-all z-50">
                  <div className="p-4 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{displayName}</p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={handleProfileNavigation}
                      className="flex w-full items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <UserIcon /> My Profile
                    </button>
                    
                    <button 
                      onClick={() => setShowResetModal(true)}
                      className="flex w-full items-center px-3 py-2 text-sm text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <ResetIcon /> Reset Tutorial
                    </button>
                  </div>
                  
                  <div className="p-2 border-t border-gray-50">
                    <button 
                      onClick={() => navigate('/')} // Update with your actual logout logic
                      className="flex w-full items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetTutorial}
        title="Reset Tutorial Progress"
        message="Are you sure you want to reset your tutorial progress? This will clear all completed steps and you'll need to start the tutorial from the beginning."
      />
    </>
  );
};

export default Header;