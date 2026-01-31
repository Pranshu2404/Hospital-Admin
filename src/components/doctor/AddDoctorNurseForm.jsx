import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput, FormSelect, SearchableFormSelect } from '../common/FormElements';

// --- Icons ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Percent: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>,
};

const AddDoctorNurseForm = () => {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();
  
  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
    address: '', city: '', state: '', zipCode: '', aadharNumber: '', panNumber: '',
    department: '', specialization: '', licenseNumber: '', experience: '', education: '',
    startDate: getTodayDate(), isFullTime: true, paymentType: 'Salary', amount: '',
    contractStartDate: '', contractEndDate: '', visitsPerWeek: '', workingDaysPerWeek: [],
    shift: '', timeSlots: [{ start: '', end: '' }], notes: '', emergencyContact: '', emergencyPhone: '',
    revenuePercentage: 80, // NEW FIELD: Default 80% for part-time doctors
    // hospitalId will be added from localStorage during submission
  });

  const config = {
    headers: {
      "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        setDepartmentOptions(deptRes.data?.map(d => ({ value: d._id, label: d.name })) || []);

        // Get hospital ID from localStorage and fetch hospital info
        const hospitalId = localStorage.getItem('hospitalId');
        if (hospitalId) {
          try {
            const hospitalRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalId}`);
            setHospitalInfo(hospitalRes.data);
          } catch (err) {
            console.error('Error fetching hospital info:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch States on component mount
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

  // Fetch Cities when state changes
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'state') {
      fetchCities(value);
      setFormData(prev => ({ ...prev, city: '' })); // Reset city when state changes
    }

    // If changing to full-time, reset revenue percentage to 100
    if (field === 'isFullTime' && value === true) {
      setFormData(prev => ({ ...prev, revenuePercentage: 100 }));
    }
    
    // If changing to part-time, set default to 80%
    if (field === 'isFullTime' && value === false) {
      setFormData(prev => ({ 
        ...prev, 
        revenuePercentage: prev.revenuePercentage === 100 ? 80 : prev.revenuePercentage 
      }));
    }
  };

  const handleShiftChange = (value) => {
    let slots = [{ start: '', end: '' }];
    if (value === 'Morning') slots = [{ start: '07:00', end: '15:00' }];
    else if (value === 'Evening') slots = [{ start: '15:00', end: '23:00' }];
    else if (value === 'Night') slots = [{ start: '23:00', end: '07:00' }];
    else if (value === 'Rotating') slots = [
      { start: '07:00', end: '15:00' }, { start: '15:00', end: '23:00' }, { start: '23:00', end: '07:00' }
    ];
    setFormData(prev => ({ ...prev, shift: value, timeSlots: slots }));
  };

  // Time slot helpers for part-time doctors (add/edit/remove)
  const handleAddTimeSlot = () => {
    setFormData(prev => ({ ...prev, timeSlots: [...(prev.timeSlots || []), { start: '', end: '' }] }));
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData(prev => ({ ...prev, timeSlots: (prev.timeSlots || []).filter((_, i) => i !== index) }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    setFormData(prev => {
      const slots = Array.isArray(prev.timeSlots) ? [...prev.timeSlots] : [];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, timeSlots: slots };
    });
  };

  const handleWorkingDaysChange = (e) => {
    const day = String(e.target.value);
    const isChecked = e.target.checked;
    setFormData(prev => {
      const prevDays = Array.isArray(prev.workingDaysPerWeek) ? prev.workingDaysPerWeek : [];
      if (isChecked) {
        return day && !prevDays.includes(day) ? { ...prev, workingDaysPerWeek: [...prevDays, day] } : prev;
      } else {
        return { ...prev, workingDaysPerWeek: prevDays.filter(d => d !== day) };
      }
    });
  };

  // Prevent form submission on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step < totalSteps) {
      e.preventDefault(); // Prevent form submission
      nextStep(); // Move to next step instead
    }
  };

  // Step validation functions
  const validateStep1 = () => {
    const errors = {};
    
    // Required fields for step 1
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'Invalid Indian mobile number (10 digits starting with 6-9)';
    
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    
    if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
      errors.aadharNumber = 'Aadhar must be 12 digits';
    }
    
    if (formData.emergencyPhone && !/^[6-9]\d{9}$/.test(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Invalid Indian mobile number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    // Required fields for step 2
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.specialization.trim()) errors.specialization = 'Specialization is required';
    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    if (!formData.education) errors.education = 'Highest qualification is required';
    
    // Experience validation
    if (!formData.experience) errors.experience = 'Experience is required';
    else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
      errors.experience = 'Experience must be a positive number';
    }
    
    // PAN validation (if provided)
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      errors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    
    // Required fields for step 3
    if (!formData.startDate) errors.startDate = 'Joining date is required';
    
    if (formData.isFullTime) {
      // Full-time validation
      if (!formData.shift) errors.shift = 'Shift is required for full-time employees';
      if (!formData.amount) errors.amount = 'Salary amount is required';
      else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        errors.amount = 'Salary must be a positive number';
      }
    } else {
      // Part-time validation
      if (!formData.paymentType) errors.paymentType = 'Payment model is required';
      if (!formData.amount) errors.amount = 'Rate/Amount is required';
      else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        errors.amount = 'Rate must be a positive number';
      }
      
      // Revenue percentage validation for part-time doctors
      if (formData.revenuePercentage < 0 || formData.revenuePercentage > 100) {
        errors.revenuePercentage = 'Revenue percentage must be between 0 and 100';
      }
      
      if (!formData.contractStartDate) errors.contractStartDate = 'Contract start date is required';
      if (!formData.contractEndDate) errors.contractEndDate = 'Contract end date is required';
      
      // Validate contract dates
      if (formData.contractStartDate && formData.contractEndDate) {
        const start = new Date(formData.contractStartDate);
        const end = new Date(formData.contractEndDate);
        if (end <= start) {
          errors.contractEndDate = 'Contract end date must be after start date';
        }
      }
      
      // Validate time slots
      if (!formData.timeSlots || formData.timeSlots.length === 0) {
        errors.timeSlots = 'At least one time slot is required';
      } else {
        // Validate each time slot
        formData.timeSlots.forEach((slot, index) => {
          if (!slot.start || !slot.end) {
            errors.timeSlots = 'All time slots must have both start and end times';
          } else if (slot.start >= slot.end) {
            errors.timeSlots = 'End time must be after start time in each slot';
          }
        });
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation before submission
    if (!validateStep3()) {
    alert('Please fix the validation errors before submitting.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
    
    setIsLoading(true);
    try {
      // Get hospital ID from localStorage
      const hospitalId = localStorage.getItem('hospitalId');
      if (!hospitalId) {
        alert('Hospital ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Prepare submission data with hospitalId
      const submissionData = {
        ...formData,
        workingDaysPerWeek: formData.isFullTime ? [] : formData.workingDaysPerWeek,
        shift: formData.isFullTime ? formData.shift : '',
        hospitalId: hospitalId, // Add hospitalId from localStorage
        // Only send revenuePercentage if doctor is part-time
        revenuePercentage: formData.isFullTime ? 100 : formData.revenuePercentage
      };

      console.log('Submitting doctor data:', submissionData);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/doctors`, submissionData);
      alert('Doctor added successfully!');
      navigate('/dashboard/admin/doctor-list');
    } catch (err) {
      console.error('Error adding doctor:', err);
      alert(err.response?.data?.error || 'Failed to add doctor. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

const nextStep = () => {
  let isValid = false;
  
  // Validate current step before proceeding
  if (step === 1) {
    isValid = validateStep1();
  } else if (step === 2) {
    isValid = validateStep2();
  }
  
  if (isValid && step < totalSteps) {  // Add check: step < totalSteps
    setStep(prev => Math.min(prev + 1, totalSteps));
    // Clear validation errors when moving to next step
    setValidationErrors({});
  } else if (step === totalSteps) {
    // If we're already on the last step, the submit button will handle submission
    return;
  } else {
    // Scroll to top to show validation errors
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    // Clear validation errors when going back
    setValidationErrors({});
  };

  const stateOptions = states.map(state => ({
    value: state.iso2,
    label: state.name
  }));

  const cityOptions = cities.map(city => ({
    value: city.name,
    label: city.name
  }));

  const getLocalDateString = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Error display component
  const ErrorMessage = ({ field }) => {
    if (!validationErrors[field]) return null;
    
    return (
      <div className="mt-1.5 text-xs text-rose-600 font-medium animate-fade-in">
        {validationErrors[field]}
      </div>
    );
  };

  // --- Step Indicator ---
  const StepIndicator = () => {
    const steps = ['Personal Details', 'Professional Info', 'Employment & Shift'];

    return (
      <div className="mb-10 px-4">
        <div className="relative flex justify-between items-center w-full">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0 rounded-full transform -translate-y-1/2"></div>
          {/* Active Line */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-0 rounded-full transition-all duration-500 ease-in-out transform -translate-y-1/2"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          {steps.map((label, index) => {
            const stepNum = index + 1;
            const isActive = step >= stepNum;
            const isCurrent = step === stepNum;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            // Alignment logic to prevent cut-off
            let labelClass = "left-1/2 -translate-x-1/2 text-center"; // Default Center
            if (isFirst) labelClass = "left-0 translate-x-0 text-left"; // Left align first
            if (isLast) labelClass = "right-0 translate-x-0 text-right"; // Right align last

            return (
              <div key={index} className="flex flex-col items-center relative z-10 group cursor-default">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 
                              ${isActive ? 'bg-emerald-600 border-emerald-100 text-white shadow-lg shadow-emerald-500/20 scale-110' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  {isActive && step > stepNum ? <Icons.Check /> : stepNum}
                </div>
                <span className={`absolute top-12 text-xs font-bold uppercase tracking-wider whitespace-nowrap w-40 transition-colors duration-300 ${labelClass} ${isCurrent ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex justify-start py-1 px-5">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-white px-8 py-8 pb-0">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Register New Doctor</h2>
              <p className="text-slate-500 text-sm mt-1">Complete the details to onboard a new medical professional.</p>

              {/* Hospital Info Badge */}
              {hospitalInfo && (
                <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  <Icons.Building className="w-4 h-4 mr-2" />
                  {hospitalInfo.name}
                </div>
              )}
            </div>
          </div>
          <StepIndicator />
        </div>

        <div className="p-8 pt-12 flex-grow overflow-y-auto">
          {/* Show validation errors summary at top if any */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in">
              <h3 className="text-sm font-bold text-rose-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Please fix the following errors:
              </h3>
              <ul className="text-sm text-rose-600 list-disc pl-5 space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="h-full flex flex-col justify-between">

            {/* --- STEP 1: PERSONAL DETAILS --- */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <FormInput 
                      label="First Name" 
                      value={formData.firstName} 
                      onChange={(e) => handleInputChange('firstName', e.target.value)} 
                      required 
                      placeholder="e.g. John"
                      error={!!validationErrors.firstName}
                    />
                    <ErrorMessage field="firstName" />
                  </div>
                  
                  <div>
                    <FormInput 
                      label="Last Name" 
                      value={formData.lastName} 
                      onChange={(e) => handleInputChange('lastName', e.target.value)} 
                      placeholder="e.g. Doe"
                    />
                  </div>

                  <div>
                    <FormInput 
                      label="Email Address" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)} 
                      required 
                      placeholder="doctor@hospital.com"
                      error={!!validationErrors.email}
                    />
                    <ErrorMessage field="email" />
                  </div>
                  
                  <div>
                    <FormInput 
                      label="Phone Number" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} 
                      required 
                      placeholder="e.g. 9876543210" 
                      maxLength={10}
                      error={!!validationErrors.phone}
                    />
                    <ErrorMessage field="phone" />
                  </div>

                  <div>
                    <FormInput 
                      label="Date of Birth" 
                      type="date" 
                      value={formData.dateOfBirth} 
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
                      required 
                      max={getLocalDateString()}
                      error={!!validationErrors.dateOfBirth}
                    />
                    <ErrorMessage field="dateOfBirth" />
                  </div>

                  <div>
                    <SearchableFormSelect 
                      label="Gender" 
                      value={formData.gender} 
                      onChange={(e) => handleInputChange('gender', e.target.value)} 
                      options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} 
                    />
                  </div>
                  
                  <div>
                    <FormInput 
                      label="Aadhar Number" 
                      value={formData.aadharNumber} 
                      onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))} 
                      maxLength={12} 
                      placeholder="12-digit UID"
                      error={!!validationErrors.aadharNumber}
                    />
                    <ErrorMessage field="aadharNumber" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Address & Emergency
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1.5">Full Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        placeholder="Street, Apartment, etc."
                      ></textarea>
                    </div>
                    
                    <SearchableFormSelect label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} options={stateOptions} />
                    <SearchableFormSelect label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} options={cityOptions} disabled={!formData.state} />
                    <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />

                    <FormInput label="Emergency Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} />
                    
                    <div>
                      <FormInput 
                        label="Emergency Contact Phone" 
                        type="tel" 
                        value={formData.emergencyPhone} 
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} 
                        placeholder="e.g. 9876543210" 
                        maxLength={10}
                        error={!!validationErrors.emergencyPhone}
                      />
                      <ErrorMessage field="emergencyPhone" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1.5 mt-5">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                      placeholder="Any specific requirements or comments..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: PROFESSIONAL INFO --- */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in-right">
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <SearchableFormSelect 
                        label="Department" 
                        value={formData.department} 
                        onChange={(e) => handleInputChange('department', e.target.value)} 
                        options={departmentOptions} 
                        required 
                        icon={<Icons.Briefcase />}
                        error={!!validationErrors.department}
                      />
                      <ErrorMessage field="department" />
                    </div>
                    
                    <div>
                      <FormInput 
                        label="Specialization" 
                        value={formData.specialization} 
                        onChange={(e) => handleInputChange('specialization', e.target.value)} 
                        required 
                        placeholder="e.g. Cardiology"
                        error={!!validationErrors.specialization}
                      />
                      <ErrorMessage field="specialization" />
                    </div>

                    <div>
                      <FormInput 
                        label="License / Registration No." 
                        value={formData.licenseNumber} 
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)} 
                        required 
                        placeholder="MED-12345"
                        error={!!validationErrors.licenseNumber}
                      />
                      <ErrorMessage field="licenseNumber" />
                    </div>
                    
                    <div>
                      <SearchableFormSelect
                        label="Highest Qualification"
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        options={['MBBS', 'MD', 'MS', 'BDS', 'PhD', 'Fellowship'].map(v => ({ value: v, label: v }))}
                        required
                        error={!!validationErrors.education}
                      />
                      <ErrorMessage field="education" />
                    </div>

                    <div>
                      <FormInput 
                        label="Years of Experience" 
                        type="number" 
                        value={formData.experience} 
                        onChange={(e) => handleInputChange('experience', e.target.value)} 
                        placeholder="e.g. 5"
                        error={!!validationErrors.experience}
                      />
                      <ErrorMessage field="experience" />
                    </div>
                    
                    <div>
                      <FormInput 
                        label="PAN Number" 
                        value={formData.panNumber} 
                        onChange={(e) => handleInputChange('panNumber', e.target.value)} 
                        maxLength={10} 
                        placeholder="ABCDE1234F"
                        error={!!validationErrors.panNumber}
                      />
                      <ErrorMessage field="panNumber" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: EMPLOYMENT & SHIFT --- */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormInput 
                      label="Joining Date" 
                      type="date" 
                      value={formData.startDate} 
                      onChange={(e) => handleInputChange('startDate', e.target.value)} 
                      required
                      error={!!validationErrors.startDate}
                    />
                    <ErrorMessage field="startDate" />
                  </div>
                  
                  <SearchableFormSelect
                    label="Employment Type"
                    value={formData.isFullTime ? 'Full-time' : 'Part-time'}
                    onChange={(e) => {
                      const isFull = e.target.value === 'Full-time';
                      setFormData(prev => ({ 
                        ...prev, 
                        isFullTime: isFull, 
                        workingDaysPerWeek: isFull ? [] : prev.workingDaysPerWeek,
                        revenuePercentage: isFull ? 100 : prev.revenuePercentage
                      }));
                    }}
                    options={[{ value: 'Full-time', label: 'Full-time (Salaried)' }, { value: 'Part-time', label: 'Part-time (Consultant)' }]}
                  />
                </div>

                {formData.isFullTime ? (
                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="text-sm font-bold text-emerald-800 mb-6 flex items-center gap-2">
                      <Icons.Clock /> Shift Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <SearchableFormSelect
                          label="Select Shift"
                          value={formData.shift}
                          onChange={(e) => handleShiftChange(e.target.value)}
                          options={['Morning', 'Evening', 'Night', 'Rotating'].map(v => ({ value: v, label: v }))}
                          required
                          error={!!validationErrors.shift}
                        />
                        <ErrorMessage field="shift" />
                      </div>
                      
                      <div>
                        <FormInput 
                          label="Annual Salary (₹)" 
                          type="number" 
                          value={formData.amount} 
                          onChange={(e) => handleInputChange('amount', e.target.value)} 
                          placeholder="e.g. 1200000"
                          error={!!validationErrors.amount}
                        />
                        <ErrorMessage field="amount" />
                      </div>
                    </div>
                    {formData.shift && (
                      <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                        <label className="text-xs font-bold text-emerald-600 uppercase mb-2 block">Active Timings</label>
                        <div className="flex flex-wrap gap-2">
                          {formData.timeSlots.map((slot, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 mb-6 flex items-center gap-2">
                      <Icons.Briefcase /> Consultant Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <SearchableFormSelect 
                          label="Payment Model" 
                          value={formData.paymentType} 
                          onChange={(e) => handleInputChange('paymentType', e.target.value)} 
                          options={[{ value: 'Fee per Visit', label: 'Fee per Visit' }, { value: 'Per Hour', label: 'Per Hour' }]} 
                          required
                          error={!!validationErrors.paymentType}
                        />
                        <ErrorMessage field="paymentType" />
                      </div>
                      
                      <div>
                        <FormInput 
                          label="Rate / Amount (₹)" 
                          type="number" 
                          value={formData.amount} 
                          onChange={(e) => handleInputChange('amount', e.target.value)} 
                          required
                          error={!!validationErrors.amount}
                        />
                        <ErrorMessage field="amount" />
                      </div>
                      
                      <div>
                        <FormInput 
                          label="Contract Start" 
                          type="date" 
                          value={formData.contractStartDate} 
                          onChange={(e) => handleInputChange('contractStartDate', e.target.value)} 
                          required
                          error={!!validationErrors.contractStartDate}
                        />
                        <ErrorMessage field="contractStartDate" />
                      </div>
                      
                      <div>
                        <FormInput 
                          label="Contract End" 
                          type="date" 
                          value={formData.contractEndDate} 
                          onChange={(e) => handleInputChange('contractEndDate', e.target.value)} 
                          required
                          error={!!validationErrors.contractEndDate}
                        />
                        <ErrorMessage field="contractEndDate" />
                      </div>
                    </div>

                    {/* NEW: Revenue Percentage Field for Part-time Doctors */}
                    <div className="mb-6 p-4 bg-blue-100/50 rounded-xl border border-blue-200">
                      <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <Icons.Percent /> Revenue Distribution
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-blue-700 uppercase mb-1">
                            Doctor's Revenue Percentage
                          </label>
                          <div className="relative">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={formData.revenuePercentage}
                              onChange={(e) => handleInputChange('revenuePercentage', parseInt(e.target.value))}
                              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-blue-600 mt-1">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-lg font-bold text-blue-700">
                              {formData.revenuePercentage}%
                            </span>
                            <p className="text-xs text-blue-600 mt-1">
                              {formData.revenuePercentage}% of appointment fees will go to doctor
                              <br />
                              {100 - formData.revenuePercentage}% will be hospital revenue
                            </p>
                          </div>
                          <ErrorMessage field="revenuePercentage" />
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="text-xs font-bold text-blue-700 mb-2">Example Calculation</h5>
                          <div className="text-sm">
                            <p className="mb-1">
                              <span className="font-medium">Consultant Fees:</span> ₹{formData.amount || 0}
                            </p>
                            <p className="mb-1">
                              <span className="font-medium">Doctor's Share ({formData.revenuePercentage}%):</span> 
                              <span className="text-green-600 font-bold"> ₹{(formData.amount * formData.revenuePercentage / 100).toFixed(2) || 0}</span>
                            </p>
                            <p>
                              <span className="font-medium">Hospital's Share ({100 - formData.revenuePercentage}%):</span> 
                              <span className="text-blue-600 font-bold"> ₹{(formData.amount * (100 - formData.revenuePercentage) / 100).toFixed(2) || 0}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-700 uppercase mb-3">Available Time Slots</label>
                      {validationErrors.timeSlots && (
                        <div className="mb-3 text-sm text-rose-600">
                          {validationErrors.timeSlots}
                        </div>
                      )}
                      <div className="space-y-3">
                        {(formData.timeSlots || []).map((slot, i) => (
                          <div key={i} className="grid grid-cols-3 gap-3 items-center">
                            <input
                              type="time"
                              value={slot.start || ''}
                              onChange={(e) => handleTimeSlotChange(i, 'start', e.target.value)}
                              className="col-span-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                            />
                            <input
                              type="time"
                              value={slot.end || ''}
                              onChange={(e) => handleTimeSlotChange(i, 'end', e.target.value)}
                              className="col-span-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                            />
                            <div className="col-span-1 flex items-center gap-2">
                              <button type="button" onClick={() => handleRemoveTimeSlot(i)} className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm">Remove</button>
                            </div>
                          </div>
                        ))}

                        <div>
                          <button type="button" onClick={handleAddTimeSlot} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">Add Time Slot</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hospital Info Display */}
                {hospitalInfo && (
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Icons.Building className="w-5 h-5 text-slate-600" />
                      <h4 className="text-sm font-bold text-slate-900">Doctor will be registered under:</h4>
                    </div>
                    <p className="text-slate-700 text-sm ml-8">{hospitalInfo.name}</p>
                    {hospitalInfo.address && (
                      <p className="text-slate-500 text-xs ml-8 mt-1">{hospitalInfo.address}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- NAVIGATION ACTIONS --- */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </>
                  ) : 'Create Account'}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddDoctorNurseForm;