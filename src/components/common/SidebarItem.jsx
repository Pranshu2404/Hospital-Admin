export const SidebarItem = ({ icon: Icon, text, onClick, hasSubmenu, isOpen, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2 rounded transition text-left ${
        active ? 'bg-teal-100 text-teal-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="mr-3">{Icon && <Icon />}</span>
      <span className="flex-1">{text}</span>
      {hasSubmenu && (
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
};
