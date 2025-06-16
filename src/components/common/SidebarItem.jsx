import { theme } from '../../constants/theme';

export const SidebarItem = ({ icon, text, active, hasSubmenu, onClick, isOpen }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
      active 
        ? `bg-teal-50 text-teal-600 border border-teal-100` 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{text}</span>
    {hasSubmenu && (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
  </div>
);
