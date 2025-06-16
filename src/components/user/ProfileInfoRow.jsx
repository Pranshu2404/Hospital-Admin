const ProfileInfoRow = ({ label, value, isEditing, onChange, className = "" }) => {
  if (isEditing && onChange) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
        />
      </div>
    );
  }

  return (
    <div className={`border-b border-gray-100 pb-4 ${className}`}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
};

export default ProfileInfoRow;
