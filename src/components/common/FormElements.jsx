

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect, useRef, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import Textarea from "./Textarea"

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

// 1. Standard Select (Arrow keys work natively)
export const FormSelect = ({ label, value, onChange, options, placeholder = "Select...", required = false, className = "" }) => (
  <div className={cn("mb-4", className)}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select value={value} onValueChange={(val) => onChange({ target: { value: val } })}>
      <SelectTrigger className="rounded-lg border-gray-300">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export const SearchableFormSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required, 
  className = "", 
  placeholder = "Search...",
  disabled 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // For arrow key tracking
  const wrapperRef = useRef(null);

  // 1. Sort options based on search (Your Hint)
  const displayedOptions = useMemo(() => {
    if (!searchTerm) return options;
    return [...options].sort((a, b) => {
      const aMatch = a.label.toLowerCase().includes(searchTerm.toLowerCase());
      const bMatch = b.label.toLowerCase().includes(searchTerm.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [searchTerm, options]);

  // 2. Handle Arrow Keys manually since we are using a custom list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < displayedOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      handleSelect(displayedOptions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (opt) => {
    onChange({ target: { value: opt.value } });
    setSearchTerm(opt.label);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setActiveIndex(0); // Reset selection to top on search
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
          style={{ height: '38px' }}
        />

        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
            style={{ maxHeight: '200px' }} // Fixed Height Controlled Here
          >
            <div className="overflow-y-auto max-h-[200px]">
              {displayedOptions.map((opt, index) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    index === activeIndex ? 'bg-teal-100 text-teal-900 font-semibold' : 'text-gray-700'
                  } ${opt.value === value ? 'text-teal-600' : ''}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  rows = 4
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="text-sm"
      />
    </div>
  )
}



// =======================
// Checkbox
// =======================
export function FormCheckbox({ label, checked, onChange, className = "" }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <label className="text-sm text-slate-700">{label}</label>
    </div>
  )
}



// =======================
// Radio
// =======================
export function FormRadioGroup({ value, onChange, options, className = "" }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className={className}>
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} />
          <label className="text-sm text-slate-700">{opt.label}</label>
        </div>
      ))}
    </RadioGroup>
  )
}



// =======================
// Button
// =======================
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



// =======================
// Search Input
// =======================
export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 h-8 text-sm"
      />
      <svg
        className="absolute left-2 top-2.5 h-4 w-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}
