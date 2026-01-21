/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import hospitalImg from '../assets/registererp.png';

// ISD codes for Indian states
const ISD_CODES = [
  { code: '011', states: ['Delhi'] },
  { code: '0120', states: ['Gurugram', 'Faridabad'] },
  { code: '0124', states: ['Gurugram'] },
  { code: '0135', states: ['Dehradun', 'Uttarakhand'] },
  { code: '0141', states: ['Jaipur', 'Rajasthan'] },
  { code: '0172', states: ['Chandigarh', 'Punjab'] },
  { code: '020', states: ['Pune', 'Maharashtra'] },
  { code: '022', states: ['Mumbai', 'Maharashtra'] },
  { code: '033', states: ['Kolkata', 'West Bengal'] },
  { code: '040', states: ['Hyderabad', 'Telangana'] },
  { code: '044', states: ['Chennai', 'Tamil Nadu'] },
  { code: '0484', states: ['Kochi', 'Kerala'] },
  { code: '0512', states: ['Lucknow', 'Uttar Pradesh'] },
  { code: '0522', states: ['Prayagraj', 'Uttar Pradesh'] },
  { code: '0532', states: ['Varanasi', 'Uttar Pradesh'] },
  { code: '0612', states: ['Patna', 'Bihar'] },
  { code: '0712', states: ['Nagpur', 'Maharashtra'] },
  { code: '0731', states: ['Indore', 'Madhya Pradesh'] },
  { code: '0742', states: ['Jodhpur', 'Rajasthan'] },
  { code: '0771', states: ['Raipur', 'Chhattisgarh'] },
  { code: '079', states: ['Ahmedabad', 'Gujarat'] },
  { code: '080', states: ['Bengaluru', 'Karnataka'] },
  { code: '0821', states: ['Mysuru', 'Karnataka'] },
  { code: '0832', states: ['Panaji', 'Goa'] },
  { code: '0858', states: ['Vijayawada', 'Andhra Pradesh'] },
  { code: '0891', states: ['Visakhapatnam', 'Andhra Pradesh'] },
];

// --- Icons ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const FormInput = ({ label, name, type = "text", placeholder, required = false, pattern, title, value, onChange, autoFocus, maxLength, inputMode, icon, ...rest }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        pattern={pattern}
        title={title}
        autoFocus={autoFocus}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400 ${icon ? 'pl-10' : ''}`}
        {...rest}
      />
    </div>
  </div>
);

// --- Progress Bar Component ---
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressPercentage = ((currentStep) / (totalSteps)) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {currentStep === 1 && "Organization Details"}
          {currentStep === 2 && "Administrator Account"}
          {currentStep === 3 && "Preview & Submit"}
        </h2>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          Step {currentStep}/{totalSteps}
        </span>
      </div>
      {/* Track */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Preview Component ---
const PreviewDetails = ({ form, isdCode, stateName, cityName, pincode }) => {
  return (
    <div className="space-y-6 animate-fade-in-right">
      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Review Your Details</h3>
        <p className="text-sm text-green-600 mb-2">Please review all information before submitting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hospital Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center">
            <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hospital Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Hospital Name:</span>
              <span className="text-gray-900">{form.hospitalName || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Hospital ID:</span>
              <span className="text-gray-900 font-mono">{form.hospitalID || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Registry No:</span>
              <span className="text-gray-900">{form.registryNo || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Company Name:</span>
              <span className="text-gray-900">{form.companyName || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">License No:</span>
              <span className="text-gray-900">{form.companyNumber || 'Not provided'}</span>
            </div>
            {form.logo && (
              <div className="mt-3">
                <span className="font-medium text-gray-600 block mb-2">Logo:</span>
                <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img src={URL.createObjectURL(form.logo)} alt="Logo Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center">
            <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-600 w-24">Address:</span>
              <span className="text-gray-900 flex-1">{form.address || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-24">City:</span>
              <span className="text-gray-900">{cityName || 'Not detected'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-24">State:</span>
              <span className="text-gray-900">{stateName || 'Not detected'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-24">Pincode:</span>
              <span className="text-gray-900">{pincode || 'Not detected'}</span>
            </div>
          </div>
        </div>

        {/* Admin Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2">
          <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center">
            <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Administrator Account
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Admin Name:</span>
                <span className="text-gray-900">{form.name || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Email:</span>
                <span className="text-gray-900">{form.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Contact:</span>
                <span className="text-gray-900">
                  {isdCode ? `+91 ${isdCode} ` : ''}{form.contact}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Role:</span>
                <span className="text-gray-900 capitalize">{form.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {(form.fireNOC || form.additionalInfo) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2">
            <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">Additional Information</h4>
            <div className="space-y-2 text-sm">
              {form.fireNOC && (
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Fire NOC:</span>
                  <span className="text-gray-900">{form.fireNOC}</span>
                </div>
              )}
              {form.additionalInfo && (
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Other Details:</span>
                  <span className="text-gray-900 flex-1">{form.additionalInfo}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Register Component ---
export default function Register() {
  const navigate = useNavigate();

  // -- State --
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isdCode, setIsdCode] = useState('');
  const [detectedState, setDetectedState] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [detectedPincode, setDetectedPincode] = useState('');
  const [addressTouched, setAddressTouched] = useState(false);

  const config = {
    headers: {
      "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
    },
  };

  const [form, setForm] = useState({
    // Step 1
    hospitalName: '', hospitalID: '', registryNo: '', address: '', 
    companyName: '', companyNumber: '', logo: null,
    pinCode: '', city: '', state: '',
    // Step 2
    name: '', email: '', password: '', contact: '', role: 'admin',
    // Step 3
    fireNOC: '', additionalInfo: ''
  });

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states`,
          config
        );
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  const fetchCities = async (stateIso) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states/${stateIso}/cities`,
        config
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  const extractAddressDetails = (address) => {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    const pincode = pincodeMatch ? pincodeMatch[0] : '';
    setDetectedPincode(pincode);
    setForm(prev => ({ ...prev, pinCode: pincode }));
    if (states.length > 0) {
      let foundState = '';
      let foundCity = '';

      for (const state of states) {
        if (address.toLowerCase().includes(state.name.toLowerCase())) {
          foundState = state.iso2;
          setDetectedState(state.name);
          setForm(prev => ({ ...prev, state: state.iso2 }));
          
          // Fetch cities for this state
          fetchCities(state.iso2);
          break;
        }
      }

      if (cities.length > 0) {
        for (const city of cities) {
          if (address.toLowerCase().includes(city.name.toLowerCase())) {
            foundCity = city.name;
            setDetectedCity(city.name);
            setForm(prev => ({ ...prev, city: city.name }));
            break;
          }
        }
      }
    }
  };

  // Handle ISD code detection based on state
  const detectIsdCode = (stateName) => {
    if (!stateName) return;
    
    const isdEntry = ISD_CODES.find(entry => 
      entry.states.some(s => stateName.toLowerCase().includes(s.toLowerCase()))
    );
    
    if (isdEntry) {
      setIsdCode(isdEntry.code);
    } else {
      // Default to common codes based on region
      if (stateName.includes('Uttar Pradesh') || stateName.includes('Uttarakhand')) {
        setIsdCode('0512');
      } else if (stateName.includes('Maharashtra')) {
        setIsdCode('022');
      } else if (stateName.includes('Karnataka')) {
        setIsdCode('080');
      } else if (stateName.includes('Tamil Nadu')) {
        setIsdCode('044');
      } else if (stateName.includes('Chhattisgarh')) {
        setIsdCode('0771');
      } else {
        setIsdCode('');
      }
    }
  };

  // -- Handlers --
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'logo') {
      setForm({ ...form, logo: e.target.files[0] });
    } else {
      const newForm = { ...form, [name]: value };
      setForm(newForm);

      // Extract details when address changes
      if (name === 'address') {
        setAddressTouched(true);
        extractAddressDetails(value);
      }

      // Detect ISD code when state changes
      if (name === 'state') {
        const selectedState = states.find(s => s.iso2 === value);
        if (selectedState) {
          setDetectedState(selectedState.name);
          detectIsdCode(selectedState.name);
          fetchCities(value);
        }
      }

      // Update detected city when city changes
      if (name === 'city') {
        setDetectedCity(value);
      }
    }
  };

  // Validate Step 1 before moving to Step 2
  const validateStep1 = () => {
    if (!form.hospitalName || !form.hospitalID || !form.registryNo || !form.address) {
      setError("Please fill in all required fields marked with *");
      return false;
    }
    // Validate Hospital ID format
    if (!/^[A-Za-z]{2}\d{4}$/.test(form.hospitalID)) {
      setError("Hospital ID must be 2 letters followed by 4 numbers (e.g., AB1234)");
      return false;
    }
    setError("");
    return true;
  };

  // Validate Step 2 before moving to Step 3
  const validateStep2 = () => {
    if (!form.name || !form.email || !form.password || !form.contact) {
      setError("Please fill in all admin details.");
      return false;
    }
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    // Validate contact number (accepts landlines and mobiles)
    const contactRegex = /^(\d{10}|\d{6,8})$/;
    if (!contactRegex.test(form.contact)) {
      setError("Please enter a valid contact number (6-10 digits)");
      return false;
    }
    // Validate password strength
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  // Step 2: Register Logic
  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Hospital details
      formData.append('hospitalName', form.hospitalName);
      formData.append('hospitalID', form.hospitalID);
      formData.append('registryNo', form.registryNo);
      formData.append('address', form.address);
      formData.append('companyName', form.companyName || '');
      formData.append('companyNumber', form.companyNumber || '');
      formData.append('pinCode', form.pinCode || '');
      formData.append('city', form.city || '');
      formData.append('state', form.state || '');
      
      if (form.logo) {
        formData.append('logo', form.logo);
      }
      
      // Admin details
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('contact', form.contact);
      formData.append('role', form.role);
      
      // Additional details
      formData.append('fireNOC', form.fireNOC || '');
      formData.append('additionalInfo', form.additionalInfo || '');

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setStep(3);
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      console.log(err.response);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white overflow-hidden">
      {/* --- LEFT SIDE (Sticky Panel) --- */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-emerald-50 to-teal-100 sticky top-0 h-screen flex-col items-center justify-center p-12 text-center border-r border-emerald-100/50">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-md">
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] shadow-xl ring-1 ring-white/60 mb-8 w-[380px] h-[280px] overflow-hidden mx-auto">
            <img src={hospitalImg} alt="Hospital Illustration" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">
            Setup your <br /><span className="text-emerald-600">Digital Hospital</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Follow the steps to configure your facility and administrator access.
          </p>
        </div>
        <div className="absolute bottom-8 text-xs text-gray-500 font-medium">© {new Date().getFullYear()} Hospital ERP System</div>
      </div>

      {/* --- RIGHT SIDE (Wizard Form) --- */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center p-6 md:p-12 lg:p-10 bg-white">
        <div className="w-full max-w-xl mx-auto">
          {/* Progress Bar Header */}
          <ProgressBar currentStep={step} totalSteps={3} />

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in">
              <span className="bg-red-200 p-1 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* --- STEP 1: ORGANIZATION DETAILS --- */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput 
                    label="Hospital Name" 
                    name="hospitalName" 
                    placeholder="e.g. City Care Hospital" 
                    value={form.hospitalName} 
                    onChange={handleChange} 
                    required 
                    autoFocus 
                  />
                  <FormInput 
                    label="Registry No." 
                    name="registryNo" 
                    placeholder="REG-123456" 
                    value={form.registryNo} 
                    onChange={handleChange} 
                    required 
                  />
                  <FormInput 
                    label="Hospital ID" 
                    name="hospitalID" 
                    placeholder="AB1234" 
                    pattern="^[A-Za-z]{2}\d{4}$" 
                    title="2 letters + 4 numbers" 
                    value={form.hospitalID} 
                    onChange={handleChange} 
                    required 
                  />
                  <FormInput 
                    label="Company Name" 
                    name="companyName" 
                    placeholder="Optional Company Name" 
                    value={form.companyName} 
                    onChange={handleChange} 
                  />
                  <FormInput 
                    label="License No." 
                    name="companyNumber" 
                    placeholder="Optional License Number" 
                    value={form.companyNumber} 
                    onChange={handleChange} 
                  />

                  {/* Logo Upload */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                      Hospital Logo (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${form.logo ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-300 hover:border-emerald-400'
                          }`}
                      >
                        {form.logo ? (
                          <div className="relative w-full h-full flex items-center justify-center p-2 group">
                            <img
                              src={URL.createObjectURL(form.logo)}
                              alt="Logo Preview"
                              className="h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setForm({ ...form, logo: null });
                              }}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm transform translate-x-1/3 -translate-y-1/3"
                              title="Remove Logo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-3 text-gray-500">
                            <svg className="w-6 h-6 mb-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="text-xs font-medium"><span className="font-bold text-emerald-600">Click</span> to upload logo</p>
                          </div>
                        )}
                        <input
                          id="dropzone-file"
                          type="file"
                          name="logo"
                          accept="image/*"
                          className="hidden"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Address with auto-detection */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      placeholder="Street, City, State, Pincode. We'll auto-detect city, state and pincode for you."
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={1}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />

                    {/* Manual override fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                        <select
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state.iso2} value={state.iso2}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                        <select
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          disabled={!form.state}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-gray-100"
                        >
                          <option value="">Select City</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          name="pinCode"
                          value={form.pinCode}
                          onChange={handleChange}
                          maxLength="6"
                          placeholder="6-digit pincode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: ADMIN DETAILS --- */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput 
                    label="Admin Name" 
                    name="name" 
                    placeholder="Dr. John Doe" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    autoFocus 
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {isdCode && (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                            +91 {isdCode}
                          </div>
                        )}
                        <input
                          type="tel"
                          name="contact"
                          placeholder={isdCode ? "Enter number" : "Enter landline or mobile"}
                          value={form.contact}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            // Allow 6-10 digits for landlines and mobiles
                            if (val.length > 10) val = val.slice(0, 10);
                            setForm({ ...form, contact: val });
                          }}
                          required
                          maxLength={isdCode ? 8 : 10}
                          inputMode="numeric"
                          className={`block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400 ${isdCode ? 'pl-16' : ''}`}
                        />
                      </div>
                    </div>
                    {isdCode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Landline detected for {detectedState}. Area code: {isdCode}
                      </p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormInput 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      placeholder="admin@hospital.com" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormInput 
                      label="Password" 
                      name="password" 
                      type="password" 
                      placeholder="Create a strong password (min. 8 characters)" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700">
                  <p className="font-medium mb-1">Note:</p>
                  <p>This account will have Super Admin privileges to manage doctors, staff, and hospital settings.</p>
                  <p className="mt-2">Contact number accepts both landline (6-8 digits with area code) and mobile (10 digits).</p>
                </div>
                
                {/* Additional Details */}
                <div className="space-y-4 mt-6">
                  <FormInput 
                    label="Fire NOC Details (Optional)" 
                    name="fireNOC" 
                    placeholder="Enter Fire NOC Number/Details" 
                    value={form.fireNOC} 
                    onChange={handleChange} 
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      name="additionalInfo"
                      placeholder="Any other relevant details regarding policies, insurance, or special requirements..."
                      value={form.additionalInfo}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: PREVIEW --- */}
            {step === 3 && (
              <PreviewDetails 
                form={form}
                isdCode={isdCode}
                stateName={detectedState}
                cityName={detectedCity}
                pincode={detectedPincode}
              />
            )}

            {/* --- NAVIGATION BUTTONS --- */}
            <div className="pt-8 flex gap-4">
              {/* Back Button */}
              {step > 1 && step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-all"
                >
                  <BackIcon /> Back
                </button>
              )}
              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-all"
                >
                  <BackIcon /> Edit Details
                </button>
              )}

              {/* Next/Submit Button */}
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (validateStep1()) setStep(2);
                  } else if (step === 2) {
                    if (validateStep2()) setStep(3);
                  } else if (step === 3) {
                    handleRegister();
                  }
                }}
                disabled={isLoading}
                className="flex-1 flex justify-center py-4 px-6 rounded-xl text-white font-bold text-sm uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  step === 1 ? 'Continue to Admin Details' :
                  step === 2 ? 'Preview & Submit' : 'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}