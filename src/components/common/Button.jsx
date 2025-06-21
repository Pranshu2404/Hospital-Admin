import React from 'react';

const Button = ({
  type = 'button',
  onClick,
  className = '',
  children,
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium shadow-sm transition duration-200 
        ${disabled
          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'} 
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
