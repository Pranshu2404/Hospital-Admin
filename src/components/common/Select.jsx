import React from 'react';

const Select = ({ label, value, onChange, className = '', children, required = false, ...props }) => {
  return (
    <label className="block w-full">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}{required && ' *'}</span>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${className}`}
        required={required}
        {...props}
      >
        {children}
      </select>
    </label>
  );
};

export default Select;
