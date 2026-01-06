import Sidebar from './Sidebar';
import Header from './Header';
import { useState, useEffect, useCallback } from 'react';

const Layout = ({ sidebarItems, section, children, resetProgress }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Close sidebar when switching from mobile to desktop
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen, isMobile]);

  // Memoize the toggle function to prevent unnecessary re-renders
  const handleToggleSidebar = useCallback(() => {
    console.log('Toggling sidebar. Current state:', sidebarOpen, 'Setting to:', !sidebarOpen);
    setSidebarOpen(prev => !prev);
  }, [sidebarOpen]);

  // Memoize the close function
  const handleCloseSidebar = useCallback(() => {
    console.log('Closing sidebar');
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay - Only show when sidebar is open on mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-full
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0 lg:w-72
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        // This prevents clicks inside sidebar from bubbling to overlay
        onClick={(e) => e.stopPropagation()}
      >
        <Sidebar 
          sidebarItems={sidebarItems} 
          section={section}
          onCloseMobile={handleCloseSidebar}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header 
          section={section} 
          sidebarItems={sidebarItems} 
          onResetTutorial={resetProgress}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen} // Pass this to Header for debugging
        />
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;