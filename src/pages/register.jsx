/// <reference types="vite/client" />
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import hospitalImg from '../assets/registererp.png'; 

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

const FormInput = ({ label, name, type = "text", placeholder, required = false, pattern, title, value, onChange, autoFocus, maxLength, inputMode, ...rest }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
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
      {...rest}
      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
    />
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
          {currentStep === 3 && "Final Details"}
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

// --- Main Register Component ---
export default function Register() {
  const navigate = useNavigate();
  
  // -- State --
  const [step, setStep] = useState(1);
  const [hospitalId, setHospitalId] = useState(null); // Stores ID after Step 2
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Step 1
    hospitalName: '', hospitalID: '', registryNo: '', address: '', companyName: '', companyNumber: '',
    // Step 2
    name: '', email: '', password: '', contact: '', role: 'admin',
    // Step 3
    fireNOC: '', additionalInfo: ''
  });

  // -- Handlers --
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validate Step 1 before moving to Step 2
  const validateStep1 = () => {
    if (!form.hospitalName || !form.hospitalID || !form.registryNo || !form.address) {
      setError("Please fill in all required fields marked with *");
      return false;
    }
    setError("");
    return true;
  };

  // Step 2: Register Logic
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.contact) {
      setError("Please fill in all admin details.");
      return;
    }

    setIsLoading(true);
    setError('');
    // Validate Indian mobile number (10 digits, starts with 6-9)
    if (!/^[6-9]\d{9}$/.test(form.contact)) {
      setError("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      setIsLoading(false);
      return;
    }
    console.log(import.meta.env.VITE_BACKEND_URL)
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        hospitalName: form.hospitalName,
        hospitalID: form.hospitalID,
        registryNo: form.registryNo,
        address: form.address,
        companyName: form.companyName,
        companyNumber: form.companyNumber,
        name: form.name,
        email: form.email,
        password: form.password,
        contact: form.contact,
        role: form.role
      });

      console.log(response)
      setHospitalId(response.data.hospitalId);
      setStep(3);
    } catch (err) {
      console.log(err.response)
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save Additional Details
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      if (form.fireNOC || form.additionalInfo) {
        await axios.patch(`${process.env.VITE_BACKEND_URL}/hospitals/${hospitalId}/details`, {
          fireNOC: form.fireNOC,
          additionalInfo: form.additionalInfo
        });
      }
      // Redirect to login or dashboard
      navigate('/');
    } catch (err) {
      console.error("Failed to save details", err);
      // Even if this fails, registration (Step 2) was successful, so we can likely redirect
      navigate('/'); 
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

        <img
           src={hospitalImg}
           alt="Hospital Illustration"
           className="w-full h-full object-cover"
         />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">
            Setup your <br/><span className="text-emerald-600">Digital Hospital</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Follow the steps to configure your facility and administrator access.
          </p>
        </div>
        <div className="absolute bottom-8 text-xs text-gray-500 font-medium">© {new Date().getFullYear()} Hospital ERP System</div>
      </div>

      {/* --- RIGHT SIDE (Wizard Form) --- */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center p-6 md:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-xl mx-auto">
          
          {/* Progress Bar Header */}
          <ProgressBar currentStep={step} totalSteps={3} />

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in">
              <span className="bg-red-200 p-1 rounded-full"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></span>
              {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleRegister : (e) => e.preventDefault()}>
            
            {/* --- STEP 1: ORGANIZATION DETAILS --- */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Hospital Name" name="hospitalName" placeholder="e.g. City Care" value={form.hospitalName} onChange={handleChange} required autoFocus />
                  <FormInput label="Registry No." name="registryNo" placeholder="REG-123456" value={form.registryNo} onChange={handleChange} required />
                  <FormInput label="Hospital ID" name="hospitalID" placeholder="AB1234" pattern="^[A-Za-z]{2}\d{4}$" title="2 letters + 4 numbers" value={form.hospitalID} onChange={handleChange} required />
                  <FormInput label="Company Name" name="companyName" placeholder="LLC Name" value={form.companyName} onChange={handleChange} />
                  <FormInput label="License No." name="companyNumber" placeholder="LIC-9988" value={form.companyNumber} onChange={handleChange} />
                  <div className="md:col-span-1"></div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Address <span className="text-red-500">*</span></label>
                    <textarea
                      name="address"
                      placeholder="Street, City, State, Zip Code"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={2}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: ADMIN DETAILS --- */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-right">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Admin Name" name="name" placeholder="Dr. John Doe" value={form.name} onChange={handleChange} required autoFocus />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Contact Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="contact"
                      placeholder="9876543210"
                      value={form.contact}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 10) val = val.slice(0, 10);
                        setForm({ ...form, contact: val });
                      }}
                      required
                      maxLength={10}
                      inputMode="numeric"
                      pattern="^[6-9]\d{9}$"
                      title="10 digit Indian mobile number starting with 6-9"
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput label="Email Address" name="email" type="email" placeholder="admin@hospital.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput label="Password" name="password" type="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700">
                  <p><strong>Note:</strong> This account will have Super Admin privileges to manage doctors, staff, and pharmacy settings.</p>
                </div>
              </div>
            )}

            {/* --- STEP 3: ADDITIONAL DETAILS (Final) --- */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center mb-6">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">Account Created Successfully!</h3>
                  <p className="text-sm text-green-600">Hospital ID: <strong>{hospitalId}</strong></p>
                </div>

                <div className="space-y-4">
                  <FormInput label="Fire NOC Details" name="fireNOC" placeholder="Enter Fire NOC Number/Details" value={form.fireNOC} onChange={handleChange} />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Additional Information</label>
                    <textarea
                      name="additionalInfo"
                      placeholder="Any other relevant details regarding policies or insurance..."
                      value={form.additionalInfo}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- NAVIGATION BUTTONS --- */}
            <div className="pt-8 flex gap-4">
              {/* Back Button (Hidden on Step 1 or Step 3 Success) */}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-all"
                >
                  <BackIcon /> Back
                </button>
              )}
              {step === 3 && (
                 <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-all"
                >
                  Skip
                </button>
              )}

              {/* Next/Submit Button */}
              <button
                type={step === 1 ? 'button' : step === 3 ? 'button' : 'submit'}
                onClick={() => {
                  if (step === 1) {
                    if(validateStep1()) setStep(2);
                  } else if (step === 3) {
                    handleFinalSubmit();
                  }
                }}
                disabled={isLoading}
                className="flex-1 flex justify-center py-4 px-6 rounded-xl text-white font-bold text-sm uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
              >
                {isLoading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Processing...
                   </span>
                ) : (
                  step === 1 ? 'Next Step' : 
                  step === 2 ? 'Register Hospital' : 'Save & Finish'
                )}
              </button>
            </div>

            {/* Login Link (Only show on Step 1) */}
            {step === 1 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/" className="text-emerald-600 font-bold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}