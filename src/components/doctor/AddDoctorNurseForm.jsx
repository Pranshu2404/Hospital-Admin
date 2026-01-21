import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// --- Icons ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};

// --- Reusable Modern Input Component ---
const FormInput = ({ label, type = "text", value, onChange, placeholder, required, className = "", icon, maxLength }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder-slate-400 hover:bg-white hover:shadow-sm`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, value, onChange, options, required, className = "", icon }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer hover:bg-white hover:shadow-sm`}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const SearchableFormSelect = ({ label, value, onChange, options, required, className = "", icon, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    if (selected) {
      setSearchTerm(selected.label);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        const selected = options.find(opt => opt.value === value);
        // If the user typed something but didn't select, revert to the valid selected value's label or empty if none
        if (!selected && searchTerm !== '') {
          // If we want to allow custom text, we wouldn't clear it. 
          // But for State/City API which strictly follows the list, we should probably revert.
          // However, strictly reverting might be annoying if they just clicked out.
          // Let's clear it if no match found for now to enforce selection.
          // Better: if the current searchTerm EXACTLY matches a label, select it?
          // For simplicity: Revert to last valid value text.
          setSearchTerm(selected ? selected.label : '');
        } else if (selected) {
          setSearchTerm(selected.label);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value, options, searchTerm]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-1.5 ${className}`} ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange({ target: { value: '' } });
            }
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder || "Select or type..."}
          disabled={disabled}
          className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all hover:bg-white hover:shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer text-sm"
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
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

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'Male',
    address: '', city: '', state: '', zipCode: '', aadharNumber: '', panNumber: '',
    department: '', specialization: '', licenseNumber: '', experience: '', education: '',
    startDate: getTodayDate(), isFullTime: true, paymentType: 'Salary', amount: '',
    contractStartDate: '', contractEndDate: '', visitsPerWeek: '', workingDaysPerWeek: [],
    shift: '', timeSlots: [{ start: '', end: '' }], notes: '', emergencyContact: '', emergencyPhone: '',
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

    if (field === 'state') {
      fetchCities(value);
      setFormData(prev => ({ ...prev, city: '' })); // Reset city when state changes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate phone numbers (Indian 10-digit mobile starting with 6-9)
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit Indian mobile number for Phone (starts with 6-9).');
        setIsLoading(false);
        return;
      }
      if (formData.emergencyPhone && !/^[6-9]\d{9}$/.test(formData.emergencyPhone)) {
        alert('Please enter a valid 10-digit Indian mobile number for Emergency Phone (starts with 6-9).');
        setIsLoading(false);
        return;
      }

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
        hospitalId: hospitalId // Add hospitalId from localStorage
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const stateOptions = states.map(state => ({
    value: state.iso2,
    label: state.name
  }));

  const cityOptions = cities.map(city => ({
    value: city.name,
    label: city.name
  }));

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
          <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">

            {/* --- STEP 1: PERSONAL DETAILS --- */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required placeholder="e.g. John" />
                  <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required placeholder="e.g. Doe" />

                  <FormInput label="Email Address" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="doctor@hospital.com" />
                  <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} required placeholder="e.g. 9876543210" maxLength={10} />

                  <FormInput label="Password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required placeholder="••••••••" />
                  <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required />

                  <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                  <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))} maxLength={12} placeholder="12-digit UID" />
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
                    {/* Modified City and State inputs to SearchableFormSelect */}
                    <SearchableFormSelect label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} options={stateOptions} />
                    <SearchableFormSelect label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} options={cityOptions} disabled={!formData.state} />
                    <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />

                    <FormInput label="Emergency Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} />
                    <FormInput label="Emergency Contact Phone" type="tel" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="e.g. 9876543210" maxLength={10} />

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
                    <FormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} required icon={<Icons.Briefcase />} />
                    <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} required placeholder="e.g. Cardiology" />

                    <FormInput label="License / Registration No." value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} required placeholder="MED-12345" />
                    <FormSelect
                      label="Highest Qualification"
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      options={['MBBS', 'MD', 'MS', 'BDS', 'PhD', 'Fellowship'].map(v => ({ value: v, label: v }))}
                      required
                    />

                    <FormInput label="Years of Experience" type="number" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} placeholder="e.g. 5" />
                    <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} maxLength={10} placeholder="ABCDE1234F" />
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: EMPLOYMENT & SHIFT --- */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Joining Date" type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} required />
                  <FormSelect
                    label="Employment Type"
                    value={formData.isFullTime ? 'Full-time' : 'Part-time'}
                    onChange={(e) => {
                      const isFull = e.target.value === 'Full-time';
                      setFormData(prev => ({ ...prev, isFullTime: isFull, workingDaysPerWeek: isFull ? [] : prev.workingDaysPerWeek }));
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
                      <FormSelect
                        label="Select Shift"
                        value={formData.shift}
                        onChange={(e) => handleShiftChange(e.target.value)}
                        options={['Morning', 'Evening', 'Night', 'Rotating'].map(v => ({ value: v, label: v }))}
                        required
                      />
                      <FormInput label="Annual Salary (₹)" type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="e.g. 1200000" />
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
                      <FormSelect label="Payment Model" value={formData.paymentType} onChange={(e) => handleInputChange('paymentType', e.target.value)} options={[{ value: 'Fee per Visit', label: 'Fee per Visit' }, { value: 'Per Hour', label: 'Per Hour' }]} />
                      <FormInput label="Rate / Amount (₹)" type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} />
                      <FormInput label="Contract Start" type="date" value={formData.contractStartDate} onChange={(e) => handleInputChange('contractStartDate', e.target.value)} />
                      <FormInput label="Contract End" type="date" value={formData.contractEndDate} onChange={(e) => handleInputChange('contractEndDate', e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-700 uppercase mb-3">Available Time Slots</label>
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