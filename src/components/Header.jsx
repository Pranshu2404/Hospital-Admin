import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchIcon, BellIcon, ChevronDownIcon } from './common/Icons'; // Ensure these are imported correctly

// --- Icons for the Dropdown ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Header = ({ currentPage, section = 'Hospital', sidebarItems = [], user = { name: '', role: '', image: null } }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [displayName, setDisplayName] = useState(user.name);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Compute a display name based on route and common localStorage keys used by profile pages.
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const roleSegment = pathSegments[1] || 'admin';

    // Try a set of common localStorage keys profile pages might set
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

    // Try a DOM fallback (some pages render the profile name on the page)
    const domEl = document.querySelector('[data-profile-name]') || document.getElementById('profile-name');
    if (domEl && domEl.textContent && domEl.textContent.trim()) {
      setDisplayName(domEl.textContent.trim());
      return;
    }

    // Default to a capitalized role segment if nothing else found
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

  const getPageTitle = () => {
    // ... (Your existing getPageTitle logic here - keeping it same for brevity)
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
       default: return section; // Simplified for this snippet
    }
  };

  return (
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
        <div className="flex items-center space-x-6">
          
          {/* 1. Modern Search Bar */}
          {/* <div className="hidden md:flex relative group">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm text-gray-700 focus:ring-2 focus:ring-teal-500/50 focus:bg-white transition-all shadow-inner placeholder-gray-400"
            />
            <div className="absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-teal-600 transition-colors">
              <SearchIcon className="w-4 h-4" />
            </div>
          </div> */}

          {/* 2. Notification Bell with Pulse */}
          <button className="relative p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          </button>

          {/* 3. Professional Profile Dropdown */}
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
                     {user.name.substring(0, 2).toUpperCase()}
                   </div>
                )}
                {/* Online Status Dot */}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              
                <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-bold text-gray-700 leading-none">{displayName}</p>
                <p className="text-[10px] font-medium text-teal-600 uppercase tracking-wide mt-0.5">{user.role}</p>
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
                  {/* <button className="flex w-full items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors">
                    <SettingsIcon /> Account Settings
                  </button> */}
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
  );
};

export default Header;