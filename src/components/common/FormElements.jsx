import { useState, useRef, useEffect } from 'react';

export const FormInput = ({ label, type = "text", value, onChange, placeholder, required = false, className = "", maxLength, inputMode, pattern, title, min, max, step, onBlur, icon, disabled }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      inputMode={inputMode}
      pattern={pattern}
      title={title}
      onBlur={onBlur}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
    />
  </div>
);

export const OldFormSelect = ({ label, value, onChange, options, placeholder, required = false, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full h-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const FormSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Sync searchTerm with value when not open
  useEffect(() => {
    if (!isOpen) {
      const selectedOption = options.find((opt) => opt.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : "");
    }
  }, [value, isOpen, options]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const selectedLabel = options.find((opt) => opt.value === value)?.label;
    // Show all options if search term matches the currently selected value's label
    if (searchTerm === selectedLabel) return true;
    return option.label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`mb-4 relative ${className}`} ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Main Input Field (Acts as Search & Trigger) */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required && !value} // Only required if no value selected
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors pr-10"
        />
        <div
          className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-teal-100 ${option.value === value ? "bg-teal-50 font-semibold" : ""
                  }`}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                  // searchTerm will be updated by useEffect
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export const FormTextarea = ({ label, value, onChange, placeholder, required = false, rows = 4, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-vertical"
    />
  </div>
);

export const FormCheckbox = ({ label, checked, onChange, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  </div>
);

export const FormRadio = ({ label, name, value, checked, onChange, className = "" }) => (
  <div className={`mb-2 ${className}`}>
    <label className="flex items-center">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  </div>
);

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = ""
}) => {
  const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    outline: "border border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-teal-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
    />
    <svg
      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
);

