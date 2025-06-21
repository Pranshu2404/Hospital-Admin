import React from 'react';

const Textarea = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <label className="block w-full">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}{required && ' *'}</span>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none ${className}`}
        {...props}
      />
    </label>
  );
};

export default Textarea;
