const SettingsSidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-teal-50 text-teal-600 border border-teal-200' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default SettingsSidebarItem;
