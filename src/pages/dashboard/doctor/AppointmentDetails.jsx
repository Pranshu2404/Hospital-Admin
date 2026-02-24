import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser, FaClock, FaStethoscope, FaNotesMedical,
  FaCheckCircle, FaPlus, FaTimes, FaMoneyBillWave,
  FaArrowLeft, FaFilePrescription, FaCloudUploadAlt, FaTrash,
  FaHistory, FaCalendarCheck, FaPrescriptionBottleAlt,
  FaFlask, FaFileAlt, FaChevronDown, FaChevronUp, FaCapsules, FaHeartbeat, FaMagic, FaTimesCircle,
  FaProcedures, FaSearch, FaVial, FaMicroscope, FaThermometerHalf, FaDna,
  FaUserMd, FaUserNurse, FaUserTie, FaExclamationTriangle, FaEdit
} from 'react-icons/fa';
import { summarizePatientHistory } from '@/utils/geminiService';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

const SearchableFormSelect = ({
  label,
  value,
  onChange,
  options = [],
  required,
  className = "",
  placeholder = "Search...",
  disabled,
  name,
  loading = false,
  type = "text",
  error = false,
  onSearch,
  debounceDelay = 2000,
  allowCustom = true,
  freeSolo = false,
  minSearchChars = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastValueRef = useRef(value);
  const searchCacheRef = useRef(new Map());

  const normalizedOptions = useMemo(() => {
    return options.map(opt =>
      typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) }
    );
  }, [options]);

  const syncFromValue = useCallback(() => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    if (selected) setSearchTerm(selected.label);
    else setSearchTerm(value || '');
  }, [value, normalizedOptions]);

  useEffect(() => {
    const valueChanged = value !== lastValueRef.current;

    if (valueChanged) {
      lastValueRef.current = value;
      syncFromValue();
      return;
    }
    if (!isFocused) {
      syncFromValue();
    }
  }, [value, isFocused, syncFromValue]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setFilteredOptions(normalizedOptions.slice(0, 20));
      return;
    }

    // Split search term into words for better matching
    const searchWords = term.split(/\s+/).filter(word => word.length > 0);
    
    // Filter and score options
    const filtered = normalizedOptions
      .map(opt => {
        const haystack = [
          opt.label,
          opt.value,
          opt.name,
          opt.category,
          opt.specimen_type,
          opt.description
        ].filter(Boolean).join(' ').toLowerCase();

        // Calculate score: higher score means better match
        let score = 0;
        
        // Check if starts with search term (highest priority)
        if (haystack.startsWith(term)) {
          score += 100;
        }
        // Check if any word starts with search term
        else if (haystack.split(/\s+/).some(word => word.startsWith(term))) {
          score += 50;
        }
        // Check if contains search term
        else if (haystack.includes(term)) {
          score += 25;
        }
        
        // Check for word boundary matches
        searchWords.forEach(word => {
          if (word.length > 0) {
            if (haystack.startsWith(word)) {
              score += 10;
            } else if (haystack.includes(` ${word}`)) {
              score += 5;
            } else if (haystack.includes(word)) {
              score += 1;
            }
          }
        });

        return {
          ...opt,
          score
        };
      })
      .filter(opt => opt.score > 0) // Only keep matches
      .sort((a, b) => {
        // Sort by score (highest first)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // If scores are equal, sort alphabetically
        return (a.label || '').localeCompare(b.label || '');
      })
      .slice(0, 20);

    setFilteredOptions(filtered);
  }, [searchTerm, normalizedOptions]);

  useEffect(() => {
    if (!onSearch) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (isFocused && searchTerm.length >= minSearchChars) {
      const cachedResult = searchCacheRef.current.get(searchTerm);
      if (cachedResult) {
        console.log(`Using cached results for "${searchTerm}"`);
        return;
      }

      searchCacheRef.current.set(searchTerm, 'pending');

      const rapidTypingDelay = Math.max(debounceDelay, 2000);

      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchTerm);
      }, rapidTypingDelay);
    }
    else if (isFocused && searchTerm.length === 0) {
      onSearch('');
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch, isFocused, minSearchChars, debounceDelay]);

  const emitChange = (nextValue, selectedOption = null) => {
    if (!onChange) return;
    onChange({
      target: {
        name: name || label.toLowerCase().replace(/\s/g, ''),
        value: nextValue,
        _selectedOption: selectedOption
      }
    });
  };

  const handleSelect = (opt) => {
    emitChange(opt.value, opt);
    setSearchTerm(opt.label);
    setIsOpen(false);
    setActiveIndex(0);

    if (opt.value && opt.label) {
      searchCacheRef.current.set(opt.label, [opt]);
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setActiveIndex(0);
    emitChange('', null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const hasExactMatch = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return true;
    return normalizedOptions.some(opt =>
      opt.label.toLowerCase() === t || opt.value.toLowerCase() === t
    );
  }, [searchTerm, normalizedOptions]);

  const handleSearchChange = (e) => {
    const next = e.target.value;
    setSearchTerm(next);
    setActiveIndex(0);

    if (next.trim()) setIsOpen(true);
    else {
      setIsOpen(false);
      emitChange('', null);
    }

    if (freeSolo) {
      emitChange(next, null);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter': {
        e.preventDefault();
        if (isOpen && filteredOptions[activeIndex]) {
          handleSelect(filteredOptions[activeIndex]);
          return;
        }
        if (allowCustom && freeSolo && searchTerm.trim() && !hasExactMatch) {
          emitChange(searchTerm.trim(), null);
          setIsOpen(false);

          const customOption = {
            label: searchTerm.trim(),
            value: searchTerm.trim(),
            isCustom: true
          };
          searchCacheRef.current.set(searchTerm.trim(), [customOption]);

          return;
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        if (!freeSolo) syncFromValue();
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (!disabled) setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setIsOpen(false);
      if (!freeSolo) syncFromValue();
    }, 120);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
        if (!freeSolo) syncFromValue();
      }
    };

    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [freeSolo, syncFromValue]);

  const getIcon = () => {
    if (type === "medicine") return <FaCapsules className="text-purple-500 text-sm" />;
    if (type === "procedure") return <FaProcedures className="text-blue-500 text-sm" />;
    if (type === "labtest") return <FaMicroscope className="text-amber-500 text-sm" />;
    return <FaSearch className="text-gray-400 text-sm" />;
  };

  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full px-2 py-3 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-200'
              } text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all pl-10 pr-10`}
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {getIcon()}
          </div>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {!!searchTerm && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
                title="Clear"
              >
                <FaTimes size={14} />
              </button>
            )}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            )}
          </div>
        </div>

        {isOpen && (filteredOptions.length > 0 || (allowCustom && freeSolo && searchTerm.trim() && !hasExactMatch)) && (
          <div className="absolute border border-gray-200 z-50 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-60">
            <div className="overflow-y-auto max-h-[240px]">
              {filteredOptions.map((opt, index) => (
                <div
                  key={`${opt.value}-${index}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${index === activeIndex ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-gray-700'
                    } ${opt.value === value ? 'bg-emerald-100/50 text-emerald-700' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {opt.label}
                      {opt.isCustom && <span className="ml-2 text-xs text-gray-500">(Custom)</span>}
                    </div>

                    {(opt.name || opt.specimen_type || opt.category || opt.base_price) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {opt.name && <span>{opt.name} </span>}
                        {typeof opt.base_price !== 'undefined' && <span>• ₹{opt.base_price || 0} </span>}
                        {opt.specimen_type && <span>• {opt.specimen_type} </span>}
                        {opt.category && <span>• {opt.category}</span>}
                        {opt.fasting_required && <span>• Fasting Required</span>}
                      </div>
                    )}
                    
                    {/* Show match indicator for debugging (remove in production) */}
                    {/* {opt.score && (
                      <div className="text-[8px] text-gray-300 mt-0.5">Score: {opt.score}</div>
                    )} */}
                  </div>
                </div>
              ))}

              {allowCustom && freeSolo && searchTerm.trim() && !hasExactMatch && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    emitChange(searchTerm.trim(), null);
                    setIsOpen(false);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="px-4 py-2 text-sm cursor-pointer transition-colors bg-gray-50 hover:bg-emerald-50 text-gray-700"
                >
                  Use “<span className="font-semibold">{searchTerm.trim()}</span>”
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppointmentDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(state?.appointment || null);
  const [loading, setLoading] = useState(!state?.appointment);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [calculatingSalary, setCalculatingSalary] = useState(false);
  const [message, setMessage] = useState('');
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [currentDoctorDept, setCurrentDoctorDept] = useState(null);

  // Vitals configuration state
  const [vitalsConfig, setVitalsConfig] = useState({
    vitalsEnabled: true,
    vitalsController: 'doctor'
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState(null);
  const [userRole, setUserRole] = useState('doctor');
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  // Default Vitals
  const defaultVitals = {
    bp: '120/80',
    weight: '70',
    pulse: '72',
    spo2: '98',
    temperature: '98.6',
    respiratory_rate: '16',
    random_blood_sugar: '100',
    height: '170'
  };

  // Vitals Form State
  const [vitals, setVitals] = useState(defaultVitals);

  // State for medicine search
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  const [medicineErrors, setMedicineErrors] = useState({});

  // State for procedure search
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [searchingProcedures, setSearchingProcedures] = useState(false);
  const [procedureErrors, setProcedureErrors] = useState({});

  // State for lab test search
  const [labTestOptions, setLabTestOptions] = useState([]);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [searchingLabTests, setSearchingLabTests] = useState(false);
  const [labTestErrors, setLabTestErrors] = useState({});

  // State to track expanded indexes
  const [expandedMedicineIndex, setExpandedMedicineIndex] = useState(0);
  const [expandedProcedureIndex, setExpandedProcedureIndex] = useState(0);
  const [expandedLabTestIndex, setExpandedLabTestIndex] = useState(0);

  // Frequency options
  const frequencyOptions = [
    { value: 'OD', label: 'Once daily' },
    { value: 'BD', label: 'Twice daily' },
    { value: 'TDS', label: 'Three times daily' },
    { value: 'QDS', label: 'Four times daily' },
    { value: 'q4h', label: 'Every 4 hours' },
    { value: 'q6h', label: 'Every 6 hours' },
    { value: 'q8h', label: 'Every 8 hours' },
    { value: 'q12h', label: 'Every 12 hours' },
    { value: 'Mane', label: 'In the morning' },
    { value: 'Nocte', label: 'At night' },
    { value: 'q.a.m.', label: 'Every morning' },
    { value: 'q.p.m.', label: 'Every evening' },
    { value: 'AC', label: 'Before meals' },
    { value: 'PC', label: 'After meals' },
    { value: 'PRN', label: 'As needed' },
    { value: 'SOS', label: 'When required' },
    { value: 'Stat', label: 'Immediately' },
    { value: 'q.o.d.', label: 'Every other day' }
  ];

  // Duration options
  const durationOptions = Array.from({ length: 30 }, (_, i) => ({
    value: `${i + 1} days`,
    label: `${i + 1} day${i > 0 ? 's' : ''}`
  }));

  // Route options
  const routeOptions = [
    { value: "Oral", label: "Oral" },
    { value: "Sublingual", label: "Sublingual" },
    { value: "Intramuscular Injection", label: "Intramuscular Injection" },
    { value: "Intravenous Injection", label: "Intravenous Injection" },
    { value: "Subcutaneous Injection", label: "Subcutaneous Injection" },
    { value: "Topical Application", label: "Topical Application" },
    { value: "Inhalation", label: "Inhalation" },
    { value: "Nasal", label: "Nasal" },
    { value: "Eye Drops", label: "Eye Drops" },
    { value: "Ear Drops", label: "Ear Drops" },
    { value: "Rectal", label: "Rectal" },
    { value: "Other", label: "Other" }
  ];

  // Medicine type options
  const medicineTypeOptions = [
    { value: "Tablet", label: "Tablet" },
    { value: "Capsule", label: "Capsule" },
    { value: "Syrup", label: "Syrup" },
    { value: "Injection", label: "Injection" },
    { value: "Ointment", label: "Ointment" },
    { value: "Drops", label: "Drops" },
    { value: "Inhaler", label: "Inhaler" },
    { value: "Suppository", label: "Suppository" },
    { value: "Powder", label: "Powder" },
    { value: "Cream", label: "Cream" },
    { value: "Lotion", label: "Lotion" },
    { value: "Other", label: "Other" }
  ];

  const [prescription, setPrescription] = useState({
    diagnosis: '',
    notes: '',
    investigation: '',
    presenting_complaint: '',
    history_of_presenting_complaint: '',
    recommendedProcedures: [{
      procedure_code: '',
      procedure_name: '',
      notes: ''
    }],
    recommendedLabTests: [{
      lab_test_code: '',
      lab_test_name: '',
      notes: '',
      fasting_required: false,
      specimen_type: ''
    }],
    items: [{
      medicine_name: '',
      dosage: '',
      medicine_type: '',
      route_of_administration: '',
      duration: '',
      frequency: '',
      instructions: '',
      quantity: ''
    }],
    prescriptionImage: null
  });

  // Gemini Summary State
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Get hospital ID from localStorage
    const hospitalID = localStorage.getItem('hospitalId');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (hospitalID) {
      setHospitalId(hospitalID);
      fetchVitalsConfig(hospitalID);
    }
    
    if (userData.role) {
      setUserRole(userData.role);
    }
  }, []);

  // Fetch vitals configuration
  const fetchVitalsConfig = async (hospitalId) => {
    try {
      setConfigLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalId}/vitals-config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVitalsConfig(response.data);
    } catch (err) {
      console.error('Error fetching vitals config:', err);
      setVitalsConfig({
        vitalsEnabled: true,
        vitalsController: 'doctor'
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // Listen for vitals config updates
  useEffect(() => {
    const handleVitalsUpdate = () => {
      if (hospitalId) {
        fetchVitalsConfig(hospitalId);
      }
    };

    window.addEventListener('vitals-updated', handleVitalsUpdate);
    return () => window.removeEventListener('vitals-updated', handleVitalsUpdate);
  }, [hospitalId]);

  // Check if doctor can access vitals
  const canAccessVitals = () => {
    return vitalsConfig.vitalsEnabled && vitalsConfig.vitalsController === 'doctor';
  };

  // Get vitals access message
  const getVitalsAccessMessage = () => {
    if (!vitalsConfig.vitalsEnabled) {
      return {
        message: 'Vitals collection is currently disabled',
        color: 'gray',
        icon: FaExclamationTriangle
      };
    }

    switch(vitalsConfig.vitalsController) {
      case 'doctor':
        return {
          message: 'You have full access to manage vitals',
          color: 'blue',
          icon: FaUserMd
        };
      case 'nurse':
        return {
          message: 'Vitals are managed by Nurses',
          color: 'green',
          icon: FaUserNurse
        };
      case 'registrar':
        return {
          message: 'Vitals are managed by Registrars',
          color: 'purple',
          icon: FaUserTie
        };
      default:
        return {
          message: 'Vitals access information',
          color: 'gray',
          icon: FaExclamationTriangle
        };
    }
  };

  // Vitals handlers
  const handleVitalsClick = () => {
    if (!canAccessVitals()) {
      alert('You do not have permission to manage vitals.');
      return;
    }
    
    // Pre-fill with existing vitals if available
    setVitals({
      bp: appointment.vitals?.bp || defaultVitals.bp,
      weight: appointment.vitals?.weight || defaultVitals.weight,
      pulse: appointment.vitals?.pulse || defaultVitals.pulse,
      spo2: appointment.vitals?.spo2 || defaultVitals.spo2,
      temperature: appointment.vitals?.temperature || defaultVitals.temperature,
      respiratory_rate: appointment.vitals?.respiratory_rate || defaultVitals.respiratory_rate,
      random_blood_sugar: appointment.vitals?.random_blood_sugar || defaultVitals.random_blood_sugar,
      height: appointment.vitals?.height || defaultVitals.height
    });
    setIsVitalsModalOpen(true);
  };

  const handleVitalsChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const submitVitals = async (e) => {
    e.preventDefault();
    
    if (!canAccessVitals()) {
      alert('Vitals access has been revoked or reassigned.');
      setIsVitalsModalOpen(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/appointments/${appointment._id}/vitals`,
        { ...vitals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Vitals updated successfully!');
      setIsVitalsModalOpen(false);
      
      // Refresh appointment data to show updated vitals
      fetchAppointment();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating vitals:', err);
      alert('Failed to update vitals.');
    }
  };

  // Fetch medicines
  const fetchMedicines = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;

    setSearchingMedicines(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/NLEMmedicines/search`, {
        params: { q: searchTerm, limit: 20 }
      });

      if (response.data.data && response.data.data.medicines) {
        const medicineOpts = response.data.data.medicines.map(med => ({
          label: med.medicine_name,
          value: med.medicine_name,
          dosage: med.dosage_form,
          strength: med.strength,
          code: med.nlem_code,
          healthcare_level: med.healthcare_level,
          category: med.therapeutic_category
        }));
        setMedicineOptions(medicineOpts);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicineOptions([]);
    } finally {
      setSearchingMedicines(false);
    }
  };

  // Fetch procedures
  const fetchProcedures = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;

    setSearchingProcedures(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/procedures/search`, {
        params: { q: searchTerm, limit: 20 }
      });

      if (response.data.data && response.data.data.procedures) {
        const procedureOpts = response.data.data.procedures.map(proc => ({
          label: proc.code,
          value: proc.code,
          name: proc.name,
          category: proc.category,
          base_price: proc.base_price,
          duration_minutes: proc.duration_minutes,
          insurance_coverage: proc.insurance_coverage
        }));
        setProcedureOptions(procedureOpts);
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
      setProcedureOptions([]);
    } finally {
      setSearchingProcedures(false);
    }
  };

  // Fetch lab tests
  const fetchLabTests = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;

    setSearchingLabTests(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/search`, {
        params: { q: searchTerm, limit: 20 }
      });

      if (response.data.data && response.data.data.labTests) {
        const labTestOpts = response.data.data.labTests.map(test => ({
          label: test.code,
          value: test.code,
          name: test.name,
          category: test.category,
          base_price: test.base_price,
          specimen_type: test.specimen_type,
          fasting_required: test.fasting_required,
          turnaround_time_hours: test.turnaround_time_hours,
          description: test.description
        }));
        setLabTestOptions(labTestOpts);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setLabTestOptions([]);
    } finally {
      setSearchingLabTests(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingMedicines(true);
      setLoadingProcedures(true);
      setLoadingLabTests(true);

      try {
        await fetchMedicines('');
        await fetchProcedures('');
        await fetchLabTests('');
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingMedicines(false);
        setLoadingProcedures(false);
        setLoadingLabTests(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch current doctor's department
  useEffect(() => {
    const fetchCurrentDoctorDept = async () => {
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`);
        if (res.data) {
          const dept = res.data.department?._id || res.data.department;
          setCurrentDoctorDept(dept);
        }
      } catch (error) {
        console.error("Error fetching current doctor details:", error);
      }
    };

    fetchCurrentDoctorDept();
  }, []);

  useEffect(() => {
    if (!state?.appointment || (state?.appointment && !state.appointment.vitals)) {
      if (id) fetchAppointment();
    }
  }, [id, state]);

  useEffect(() => {
    if ((appointment?.patient_id?._id || appointment?.patient_id) && currentDoctorDept) {
      fetchPatientHistory();
    }
  }, [appointment, currentDoctorDept]);

  const fetchPatientHistory = async () => {
    const patientId = appointment.patient_id?._id || appointment.patient_id;
    if (!patientId || !currentDoctorDept) return;

    setLoadingHistory(true);
    try {
      const doctorsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors`);
      const doctorsMap = {};
      if (doctorsRes.data) {
        doctorsRes.data.forEach(doc => {
          const dDept = doc.department?._id || doc.department;
          doctorsMap[doc._id] = dDept;
        });
      }

      const prescriptionsRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/patient/${patientId}?limit=10`
      );
      let rxs = prescriptionsRes.data.prescriptions || prescriptionsRes.data || [];

      if (currentDoctorDept) {
        rxs = rxs.filter(rx => {
          const dId = rx.doctor_id?._id || rx.doctor_id;
          const docDept = doctorsMap[dId];
          return docDept === currentDoctorDept;
        });
      }
      setPastPrescriptions(rxs);

      const appointmentsRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/appointments/patient/${patientId}?status=Completed&limit=5`
      );
      let appts = appointmentsRes.data.appointments || appointmentsRes.data || [];

      if (currentDoctorDept) {
        appts = appts.filter(appt => {
          const dId = appt.doctor_id?._id || appt.doctor_id;
          const docDept = doctorsMap[dId];
          return docDept === currentDoctorDept;
        });
      }
      setPastAppointments(appts);
    } catch (err) {
      console.error('Error fetching patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPrescriptionsByAppointment = async (appointmentId) => {
    const aid = appointmentId && appointmentId._id ? appointmentId._id : appointmentId;
    if (!aid) return;

    setActiveTab('prescriptions');
    setLoadingHistory(true);
    setPastPrescriptions([]);

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions?appointment_id=${encodeURIComponent(aid)}&limit=20`);
      const list = res.data.prescriptions || res.data || [];

      if (!list || list.length === 0) setMessage('No prescriptions found for this appointment');
      setPastPrescriptions(list);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setMessage('Failed to load prescriptions');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setMessage('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const calculateQuantityFromFrequency = (frequency, duration) => {
    const durationDays = parseInt(duration) || 0;
    if (durationDays === 0) return '';

    const frequencyMap = {
      'OD': 1, 'Mane': 1, 'Nocte': 1, 'q.a.m.': 1, 'q.p.m.': 1,
      'q.o.d.': 0.5,
      'Stat': 1,
      'BD': 2, '1-0-1': 2,
      'TDS': 3, '1-1-1': 3,
      'QDS': 4,
      'q4h': Math.floor(24 / 4),
      'q6h': Math.floor(24 / 6),
      'q8h': Math.floor(24 / 8),
      'q12h': Math.floor(24 / 12),
      'AC': 3,
      'PC': 3,
      'PRN': 0,
      'SOS': 0
    };

    if (/^\d+-\d+-\d+$/.test(frequency)) {
      const parts = frequency.split('-').map(Number);
      const dailyDoses = parts.reduce((sum, num) => sum + num, 0);
      return durationDays * dailyDoses;
    }

    if (Object.prototype.hasOwnProperty.call(frequencyMap, frequency)) {
      const dailyFrequency = frequencyMap[frequency];
      return dailyFrequency > 0 ? durationDays * dailyFrequency : '';
    }

    const numericMatch = frequency.match(/(\d+)\s*(?:times|time)\s*(?:daily|per day)/i);
    if (numericMatch) return durationDays * parseInt(numericMatch[1]);

    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    const newIndex = prescription.items.length;
    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, {
        medicine_name: '',
        dosage: '',
        medicine_type: '',
        route_of_administration: '',
        duration: '',
        frequency: '',
        instructions: '',
        quantity: ''
      }]
    }));
    setExpandedMedicineIndex(newIndex);
  };

  const removeMedicine = (index) => {
    if (prescription.items.length <= 1) return;
    const newItems = [...prescription.items];
    newItems.splice(index, 1);
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

  const addProcedure = () => {
    const newIndex = prescription.recommendedProcedures.length;
    setPrescription(prev => ({
      ...prev,
      recommendedProcedures: [...prev.recommendedProcedures, {
        procedure_code: '',
        procedure_name: '',
        notes: ''
      }]
    }));
    setExpandedProcedureIndex(newIndex);
  };

  const removeProcedure = (index) => {
    const newProcedures = [...prescription.recommendedProcedures];
    newProcedures.splice(index, 1);
    setPrescription(prev => ({ ...prev, recommendedProcedures: newProcedures }));
  };

  const addLabTest = () => {
    const newIndex = prescription.recommendedLabTests.length;
    setPrescription(prev => ({
      ...prev,
      recommendedLabTests: [...prev.recommendedLabTests, {
        lab_test_code: '',
        lab_test_name: '',
        notes: '',
        fasting_required: false,
        specimen_type: ''
      }]
    }));
    setExpandedLabTestIndex(newIndex);
  };

  const removeLabTest = (index) => {
    const newLabTests = [...prescription.recommendedLabTests];
    newLabTests.splice(index, 1);
    setPrescription(prev => ({ ...prev, recommendedLabTests: newLabTests }));
  };

  const handleProcedureChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newProcedures = [...prescription.recommendedProcedures];

    if (name === 'procedure_code') {
      if (!value) {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: '',
          procedure_name: '',
          base_price: 0,
          category: '',
          notes: newProcedures[index].notes || ''
        };
      } else if (_selectedOption) {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: value,
          procedure_name: _selectedOption.name || '',
          base_price: _selectedOption.base_price || 0,
          category: _selectedOption.category,
          notes: newProcedures[index].notes || ''
        };
      } else {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: value
        };
      }
    } else {
      newProcedures[index][name] = value;
    }

    setPrescription(prev => ({ ...prev, recommendedProcedures: newProcedures }));
  };

  const handleLabTestChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newLabTests = [...prescription.recommendedLabTests];

    if (name === 'lab_test_code') {
      if (!value) {
        newLabTests[index] = {
          ...newLabTests[index],
          lab_test_code: '',
          lab_test_name: '',
          base_price: 0,
          category: '',
          fasting_required: false,
          specimen_type: '',
          notes: newLabTests[index].notes || ''
        };
      } else if (_selectedOption) {
        newLabTests[index] = {
          ...newLabTests[index],
          lab_test_code: value,
          lab_test_name: _selectedOption.name || '',
          base_price: _selectedOption.base_price || 0,
          category: _selectedOption.category,
          fasting_required: _selectedOption.fasting_required || false,
          specimen_type: _selectedOption.specimen_type || '',
          turnaround_time_hours: _selectedOption.turnaround_time_hours,
          notes: newLabTests[index].notes || ''
        };
      } else {
        newLabTests[index] = {
          ...newLabTests[index],
          lab_test_code: value
        };
      }
    } else if (name === 'fasting_required') {
      newLabTests[index].fasting_required = e.target.checked;
    } else {
      newLabTests[index][name] = value;
    }

    setPrescription(prev => ({ ...prev, recommendedLabTests: newLabTests }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newItems = [...prescription.items];
    const item = { ...newItems[index], [name]: value };

    if (name === 'medicine_name') {
      if (!value) {
        item.medicine_type = '';
        item.dosage = '';
        item.route_of_administration = '';
        item.instructions = '';
        item.frequency = '';
        item.quantity = '';
        item.duration = '';
        newItems[index] = item;
        setPrescription(prev => ({ ...prev, items: newItems }));
        return;
      }

      if (_selectedOption) {
        setMedicineErrors(prev => ({ ...prev, [index]: false }));

        const selectedMedicine = _selectedOption;

        if (selectedMedicine.dosage) {
          const dosageToTypeMap = {
            'Tablet': 'Tablet',
            'Capsule': 'Capsule',
            'Syrup': 'Syrup',
            'Injection': 'Injection',
            'Ointment': 'Ointment',
            'Cream': 'Cream',
            'Lotion': 'Lotion',
            'Drops': 'Drops',
            'Eye Drops': 'Drops',
            'Ear Drops': 'Drops',
            'Nasal Drops': 'Drops',
            'Inhaler': 'Inhaler',
            'Suppository': 'Suppository',
            'Powder': 'Powder',
            'Suspension': 'Suspension',
            'Solution': 'Solution',
            'Gel': 'Gel',
            'Spray': 'Spray',
            'Patch': 'Patch',
            'Implants': 'Implants',
            'Liquid for inhalation': 'Inhalation',
            'Granules': 'Powder',
            'Pessary': 'Suppository',
            'Foam': 'Spray'
          };
          item.medicine_type = dosageToTypeMap[selectedMedicine.dosage] || selectedMedicine.dosage;
        }

        if (selectedMedicine.strength) {
          item.dosage = selectedMedicine.strength;
        } else if (selectedMedicine.dosage) {
          const defaultDosageMap = {
            'Tablet': '1 tab',
            'Capsule': '1 cap',
            'Syrup': '5ml',
            'Injection': '1 amp',
            'Ointment': 'Apply thinly',
            'Cream': 'Apply thinly',
            'Lotion': 'Apply thinly',
            'Drops': '2 drops',
            'Inhaler': '2 puffs',
            'Suppository': '1 suppository',
            'Powder': '1 sachet'
          };
          item.dosage = defaultDosageMap[selectedMedicine.dosage] || '';
        }

        if (selectedMedicine.dosage) {
          const dosageToRouteMap = {
            'Tablet': 'Oral',
            'Capsule': 'Oral',
            'Syrup': 'Oral',
            'Suspension': 'Oral',
            'Solution': 'Oral',
            'Powder': 'Oral',
            'Granules': 'Oral',
            'Injection': 'Intravenous Injection',
            'Intravenous Injection': 'Intravenous Injection',
            'Intramuscular Injection': 'Intramuscular Injection',
            'Subcutaneous Injection': 'Subcutaneous Injection',
            'Ointment': 'Topical Application',
            'Cream': 'Topical Application',
            'Lotion': 'Topical Application',
            'Gel': 'Topical Application',
            'Eye Drops': 'Eye Drops',
            'Ear Drops': 'Ear Drops',
            'Nasal Drops': 'Nasal',
            'Drops': 'Oral',
            'Inhaler': 'Inhalation',
            'Liquid for inhalation': 'Inhalation',
            'Spray': 'Nasal',
            'Patch': 'Transdermal',
            'Suppository': 'Rectal',
            'Pessary': 'Vaginal',
            'Foam': 'Topical Application'
          };
          item.route_of_administration = dosageToRouteMap[selectedMedicine.dosage] || 'Oral';
        }

        if (selectedMedicine.dosage) {
          const dosageToInstructionsMap = {
            'Tablet': 'After food with water',
            'Capsule': 'After food with water',
            'Syrup': 'After food',
            'Injection': 'As directed by healthcare professional',
            'Ointment': 'Apply to affected area twice daily',
            'Cream': 'Apply to affected area twice daily',
            'Lotion': 'Apply to affected area twice daily',
            'Eye Drops': '1-2 drops in affected eye',
            'Ear Drops': '2-3 drops in affected ear',
            'Inhaler': 'Shake well before use',
            'Suppository': 'Insert as directed'
          };
          item.instructions = dosageToInstructionsMap[selectedMedicine.dosage] || 'As directed';
        }
      }
    }

    if (name === 'frequency' || name === 'duration') {
      const frequency = name === 'frequency' ? value : item.frequency;
      const duration = name === 'duration' ? value : item.duration;
      const durationDays = parseInt(duration) || 0;
      const calculatedQuantity = calculateQuantityFromFrequency(frequency, durationDays);
      if (calculatedQuantity) item.quantity = calculatedQuantity.toString();
    }

    newItems[index] = item;
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
      setMessage('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setPrescription(prev => ({ ...prev, prescriptionImage: null }));
    setMessage('');
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    setMedicineErrors({});
    setProcedureErrors({});
    setLabTestErrors({});

    if (!prescription.diagnosis.trim()) {
      setMessage('Diagnosis is required');
      setSubmitting(false);
      return;
    }

    const medicineErrorsLocal = {};
    let hasMedicineErrors = false;
    prescription.items.forEach((item, index) => {
      const errors = [];
      if (!item.medicine_name.trim()) errors.push('Medicine name is required');
      if (!item.dosage.trim()) errors.push('Dosage is required');
      if (!item.frequency) errors.push('Frequency is required');
      if (!item.duration) errors.push('Duration is required');

      if (errors.length > 0) {
        medicineErrorsLocal[index] = errors;
        hasMedicineErrors = true;
      }
    });
    setMedicineErrors(medicineErrorsLocal);

    const procedureErrorsLocal = {};
    let hasProcedureErrors = false;
    prescription.recommendedProcedures.forEach((proc, index) => {
      const errors = [];
      if (proc.procedure_code && !proc.procedure_name) {
        errors.push('Procedure name is required when code is selected');
      }
      if (errors.length > 0) {
        procedureErrorsLocal[index] = errors;
        hasProcedureErrors = true;
      }
    });
    setProcedureErrors(procedureErrorsLocal);

    const labTestErrorsLocal = {};
    let hasLabTestErrors = false;
    prescription.recommendedLabTests.forEach((test, index) => {
      const errors = [];
      if (test.lab_test_code && !test.lab_test_name) {
        errors.push('Lab test name is required when code is selected');
      }
      if (errors.length > 0) {
        labTestErrorsLocal[index] = errors;
        hasLabTestErrors = true;
      }
    });
    setLabTestErrors(labTestErrorsLocal);

    if (hasMedicineErrors || hasProcedureErrors || hasLabTestErrors) {
      setMessage('Please fix all validation errors before submitting');
      setSubmitting(false);
      return;
    }

    try {
      const validItems = prescription.items.filter(item =>
        item.medicine_name.trim() && item.dosage.trim()
      );

      if (validItems.length === 0) {
        setMessage('At least one valid medicine is required');
        setSubmitting(false);
        return;
      }

      const proceduresWithCosts = await Promise.all(
        prescription.recommendedProcedures
          .filter(proc => proc.procedure_code && proc.procedure_name)
          .map(async (proc) => {
            try {
              const procedureResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/procedures/${proc.procedure_code}`
              );
              const procedureData = procedureResponse.data.data || procedureResponse.data;

              await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/procedures/${proc.procedure_code}/increment-usage`
              );

              return {
                procedure_code: proc.procedure_code,
                procedure_name: proc.procedure_name,
                notes: proc.notes?.trim() || '',
                status: 'Pending',
                cost: procedureData.base_price || 0,
                base_price: procedureData.base_price || 0,
                category: procedureData.category,
                duration_minutes: procedureData.duration_minutes,
                insurance_coverage: procedureData.insurance_coverage,
                is_billed: false
              };
            } catch (error) {
              console.warn(`Could not fetch procedure ${proc.procedure_code}:`, error);
              return {
                procedure_code: proc.procedure_code,
                procedure_name: proc.procedure_name,
                notes: proc.notes?.trim() || '',
                status: 'Pending',
                cost: 0,
                base_price: 0,
                category: 'Other',
                duration_minutes: 30,
                insurance_coverage: 'Partial',
                is_billed: false
              };
            }
          })
      );

      const labTestsWithCosts = await Promise.all(
        prescription.recommendedLabTests
          .filter(test => test.lab_test_code && test.lab_test_name)
          .map(async (test) => {
            try {
              const labTestResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/labtests/${test.lab_test_code}`
              );
              const labTestData = labTestResponse.data.data || labTestResponse.data;

              await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/labtests/${test.lab_test_code}/increment-usage`
              );

              return {
                lab_test_code: test.lab_test_code,
                lab_test_name: test.lab_test_name,
                notes: test.notes?.trim() || '',
                status: 'Pending',
                cost: labTestData.base_price || 0,
                base_price: labTestData.base_price || 0,
                category: labTestData.category,
                specimen_type: labTestData.specimen_type || test.specimen_type,
                fasting_required: labTestData.fasting_required || test.fasting_required || false,
                turnaround_time_hours: labTestData.turnaround_time_hours,
                insurance_coverage: labTestData.insurance_coverage || 'Partial',
                is_billed: false
              };
            } catch (error) {
              console.warn(`Could not fetch lab test ${test.lab_test_code}:`, error);
              return {
                lab_test_code: test.lab_test_code,
                lab_test_name: test.lab_test_name,
                notes: test.notes?.trim() || '',
                status: 'Pending',
                cost: 0,
                base_price: 0,
                category: 'Other',
                specimen_type: test.specimen_type || '',
                fasting_required: test.fasting_required || false,
                turnaround_time_hours: 24,
                insurance_coverage: 'Partial',
                is_billed: false
              };
            }
          })
      );

      const prescriptionData = {
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
        appointment_id: appointment._id,
        diagnosis: prescription.diagnosis.trim(),
        symptoms: prescription.symptoms?.trim() || '',
        notes: prescription.notes?.trim() || '',
        investigation: prescription.investigation?.trim() || '',
        presenting_complaint: prescription.presenting_complaint?.trim() || '',
        history_of_presenting_complaint: prescription.history_of_presenting_complaint?.trim() || '',
        recommendedProcedures: proceduresWithCosts,
        recommendedLabTests: labTestsWithCosts,
        items: validItems.map(item => ({
          medicine_name: item.medicine_name.trim(),
          dosage: item.dosage.trim(),
          medicine_type: item.medicine_type || '',
          route_of_administration: item.route_of_administration || '',
          frequency: item.frequency,
          duration: item.duration,
          quantity: parseInt(item.quantity) || 0,
          instructions: item.instructions?.trim() || '',
          timing: item.timing || ''
        })),
        prescription_image: prescription.prescriptionImage,
        follow_up_date: prescription.followUpDate || null,
        is_repeatable: prescription.isRepeatable || false,
        repeat_count: prescription.repeatCount || 0,
        has_procedures: proceduresWithCosts.length > 0,
        procedures_status: proceduresWithCosts.length > 0 ? 'Pending' : 'None',
        has_lab_tests: labTestsWithCosts.length > 0,
        lab_tests_status: labTestsWithCosts.length > 0 ? 'Pending' : 'None'
      };

      const prescriptionResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions`,
        prescriptionData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const savedPrescription = prescriptionResponse.data;

      const proceduresWithPrice = proceduresWithCosts.filter(proc => proc.cost > 0);
      const labTestsWithPrice = labTestsWithCosts.filter(test => test.cost > 0);
      
      let procedureBillingNote = '';
      let labTestBillingNote = '';

      if (proceduresWithPrice.length > 0) {
        const totalProcedureCost = proceduresWithPrice.reduce((sum, proc) => sum + proc.cost, 0);
        procedureBillingNote = ` ${proceduresWithPrice.length} procedure(s) added with total cost: ₹${totalProcedureCost}. `;
        procedureBillingNote += `These procedures will need to be billed separately by the billing department.`;
      }

      if (labTestsWithPrice.length > 0) {
        const totalLabTestCost = labTestsWithPrice.reduce((sum, test) => sum + test.cost, 0);
        labTestBillingNote = ` ${labTestsWithPrice.length} lab test(s) added with total cost: ₹${totalLabTestCost}. `;
        labTestBillingNote += `These tests will need to be billed separately by the billing department.`;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/appointments/${appointment._id}/complete`
      );

      setCalculatingSalary(true);
      let salaryInfoLocal = null;
      try {
        const salaryResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/salaries/calculate-appointment/${appointment._id}`
        );
        salaryInfoLocal = salaryResponse.data;
      } catch (salaryError) {
        console.warn('Salary calculation failed:', salaryError);
      } finally {
        setCalculatingSalary(false);
      }

      let successMessage = 'Prescription saved successfully. ';
      if (procedureBillingNote) successMessage += procedureBillingNote;
      if (labTestBillingNote) successMessage += labTestBillingNote;
      successMessage += ` ${validItems.length} medicine(s) prescribed.`;
      if (salaryInfoLocal) {
        successMessage += ` Appointment salary credited: ₹${salaryInfoLocal.amount}.`;
        setSalaryInfo(salaryInfoLocal);
      }
      successMessage += ' Appointment completed successfully.';
      setMessage(successMessage);

      setPrescription({
        diagnosis: '',
        notes: '',
        investigation: '',
        presenting_complaint: '',
        history_of_presenting_complaint: '',
        recommendedProcedures: [],
        recommendedLabTests: [],
        items: [{
          medicine_name: '',
          dosage: '',
          medicine_type: '',
          route_of_administration: '',
          duration: '',
          frequency: '',
          instructions: '',
          quantity: ''
        }],
        prescriptionImage: null
      });

      setTimeout(() => {
        navigate('/dashboard/doctor/appointments', {
          state: {
            message: 'Appointment completed and prescription saved successfully.',
            prescriptionId: savedPrescription._id,
            prescriptionNumber: savedPrescription.prescription_number,
            hasProcedures: proceduresWithPrice.length > 0,
            proceduresCount: proceduresWithPrice.length,
            totalProcedureCost: proceduresWithPrice.reduce((sum, proc) => sum + proc.cost, 0),
            hasLabTests: labTestsWithPrice.length > 0,
            labTestsCount: labTestsWithPrice.length,
            totalLabTestCost: labTestsWithPrice.reduce((sum, test) => sum + test.cost, 0),
            medicineCount: validItems.length,
            salaryCredited: !!salaryInfoLocal
          }
        });
      }, 3000);
    } catch (err) {
      console.error('Error submitting prescription:', err);

      let errorMessage = 'Error submitting prescription.';
      if (err.response) {
        if (err.response.data?.error) errorMessage = err.response.data.error;
        else if (err.response.data?.message) errorMessage = err.response.data.message;
        else if (err.response.status === 400) errorMessage = 'Validation error. Please check your inputs.';
        else if (err.response.status === 401) errorMessage = 'Authentication required. Please login again.';
        else if (err.response.status === 403) errorMessage = 'You do not have permission to create prescriptions.';
        else if (err.response.status === 404) errorMessage = 'Appointment not found.';
        else if (err.response.status === 422) errorMessage = 'Invalid procedure or lab test selection. Please try again.';
        else if (err.response.status >= 500) errorMessage = 'Server error. Please try again later.';
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || 'Unknown error occurred.';
      }

      setMessage(errorMessage);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSummarizeHistory = async () => {
    if (!pastPrescriptions || pastPrescriptions.length === 0) {
      setMessage('No past prescriptions to summarize.');
      return;
    }

    setSummarizing(true);
    setShowSummary(true);
    setSummary('');

    try {
      const patientDetails = {
        name: appointment.patient_id?.first_name
          ? `${appointment.patient_id.first_name} ${appointment.patient_id.last_name || ''}`
          : 'Patient',
        age: calculateAge(appointment.patient_id?.dob),
        gender: appointment.patient_id?.gender || 'Unknown'
      };

      const result = await summarizePatientHistory(pastPrescriptions, patientDetails);
      let cleanResult = result.replace(/\*\*/g, '');
      const lines = cleanResult.split('\n');
      if (lines.length > 0 && lines[0].toLowerCase().includes('patient summary')) {
        cleanResult = lines.slice(1).join('\n').trim();
      } else {
        cleanResult = cleanResult.trim();
      }

      setSummary(cleanResult);
    } catch (error) {
      console.error('Summarization failed:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const PatientHistoryTabs = () => {
    if (!appointment?.patient_id) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-1 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'current'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              Current Consultation
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'appointments'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <FaHistory /> Past Appointments ({pastAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'prescriptions'
                ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <FaPrescriptionBottleAlt /> Past Prescriptions ({pastPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'summary'
                ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <FaMagic /> Patient History
            </button>
          </nav>
        </div>

        {/* Patient History Tabs Content - Keep existing content */}
        <div className="p-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-slate-500">Loading history...</span>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* Keep existing summary content */}
                  <div className="mb-6">
                    {!showSummary ? (
                      <div className="text-center py-8">
                        <FaMagic className="mx-auto text-4xl text-violet-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Generate Clinical Summary</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                          Analyze past prescriptions and generate a concise clinical summary for this patient.
                        </p>
                        <button
                          onClick={handleSummarizeHistory}
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group mx-auto"
                        >
                          <FaMagic className="group-hover:animate-pulse" /> Summarize Patient History
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-violet-100 overflow-hidden shadow-lg animate-fade-in ring-1 ring-violet-50">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                              <FaMagic className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">Clinical Summary</h3>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowSummary(false)}
                            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                          >
                            <FaTimesCircle size={20} />
                          </button>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-violet-50/50 to-white">
                          {summarizing ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="relative">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-100 border-t-violet-600 mb-4"></div>
                                <div className="absolute top-0 left-0 h-10 w-10 bg-violet-400 rounded-full animate-ping opacity-20"></div>
                              </div>
                              <p className="text-violet-800 font-semibold text-sm tracking-wide animate-pulse">GENERATING CLINICAL INSIGHTS...</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {summary.split('\n').map((line, idx) => {
                                if (!line.trim()) return null;
                                if (line.startsWith('OVERVIEW:')) {
                                  return (
                                    <div key={idx} className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4 mb-4 shadow-sm flex items-start gap-3">
                                      <div className="p-2 bg-white rounded-full text-teal-600 shadow-sm mt-0.5">
                                        <FaHeartbeat />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">Patient History Overview</h4>
                                        <p className="text-slate-800 font-medium text-base leading-relaxed">
                                          {line.replace('OVERVIEW:', '').trim()}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                }

                                const parts = line.split(' -> ');
                                if (parts.length >= 6) {
                                  const [dateStr, doctorStr, diagnosisStr, notesStr, investStr, medsStr, statusStr] = parts;
                                  const isFollowUp = statusStr && statusStr.toLowerCase().includes('follow-up');

                                  return (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 text-sm">
                                      <div className="min-w-[140px]">
                                        <div className="font-bold text-slate-800">{dateStr}</div>
                                        <div className="text-xs text-slate-500 mt-1 truncate" title={doctorStr}>{doctorStr}</div>
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div>
                                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                                          <div className="font-medium text-teal-700">{diagnosisStr}</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                          {notesStr && notesStr !== 'None' && (
                                            <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                              <span className="font-semibold text-yellow-700 block mb-0.5">Clinical Notes:</span>
                                              <span className="text-slate-700">{notesStr}</span>
                                            </div>
                                          )}
                                          {investStr && investStr !== 'None' && (
                                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                              <span className="font-semibold text-blue-700 block mb-0.5">Investigation:</span>
                                              <span className="text-slate-700">{investStr}</span>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicines</span>
                                          <div className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{medsStr}</div>
                                        </div>
                                      </div>
                                      {statusStr && (
                                        <div className="min-w-[100px] flex items-start justify-end">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isFollowUp
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}>
                                            {statusStr.replace('Status:', '').trim()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else {
                                  return <div key={idx} className="text-slate-600 text-sm py-1 border-b border-dashed border-slate-100 last:border-0">{line}</div>;
                                }
                              })}
                            </div>
                          )}
                        </div>
                        <div className="px-6 py-2 bg-violet-50/50 border-t border-violet-100 flex justify-between items-center text-xs text-violet-400">
                          <span>Generated summary based on visible records</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {/* Keep existing prescriptions content */}
                  {pastPrescriptions.length > 0 ? (
                    pastPrescriptions.map((rx, idx) => (
                      <div key={rx._id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3">
                                <FaFilePrescription className="text-lg opacity-80" />
                                <span className="text-lg font-bold">{rx.prescription_number}</span>
                                <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${rx.status === 'Completed' ? 'bg-green-400 text-green-900' :
                                  rx.status === 'Active' ? 'bg-teal-500 text-teal-900' :
                                    'bg-slate-400 text-slate-900'
                                  }`}>
                                  {rx.status}
                                </span>
                              </div>
                              <p className="text-sm text-teal-100 mt-1">Issued: {formatDate(rx.issue_date)}</p>
                            </div>
                            <button
                              onClick={() => setExpandedPrescription(expandedPrescription === rx._id ? null : rx._id)}
                              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                              {expandedPrescription === rx._id ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                        </div>

                        {expandedPrescription === rx._id && (
                          <div className="px-6 py-5 space-y-5">
                            {/* Keep existing expanded prescription content */}
                            {rx.presenting_complaint && (
                              <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                                <div className="flex items-start gap-3">
                                  <FaNotesMedical className="text-rose-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-1">Presenting Complaint</h6>
                                    <p className="text-slate-700 text-sm whitespace-pre-line">{rx.presenting_complaint}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {rx.history_of_presenting_complaint && (
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-start gap-3">
                                  <FaHistory className="text-orange-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-1">History of Presenting Complaint</h6>
                                    <p className="text-slate-700 text-sm whitespace-pre-line">{rx.history_of_presenting_complaint}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {rx.notes && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-start gap-3">
                                  <FaFileAlt className="text-purple-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-1">Clinical Notes</h6>
                                    <p className="text-slate-700 text-sm whitespace-pre-line">{rx.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {rx.investigation && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <FaFlask className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-1">Investigation / Lab Tests</h6>
                                    <p className="text-slate-700 text-sm">{rx.investigation}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <div className="flex items-start gap-3">
                                <FaStethoscope className="text-amber-600 text-lg mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <h6 className="font-bold text-slate-800 mb-1">Diagnosis</h6>
                                  <p className="text-slate-700 text-sm">{rx.diagnosis || '-'}</p>
                                </div>
                              </div>
                            </div>

                            {rx.recommendedProcedures && rx.recommendedProcedures.length > 0 && (
                              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <div className="flex items-start gap-3">
                                  <FaProcedures className="text-indigo-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-2">Recommended Procedures</h6>
                                    <div className="space-y-2">
                                      {rx.recommendedProcedures.map((proc, i) => (
                                        <div key={i} className="bg-white p-3 rounded border border-indigo-100">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-slate-700">{proc.procedure_name}</span>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                              {proc.procedure_code}
                                            </span>
                                          </div>
                                          {proc.notes && (
                                            <p className="text-xs text-slate-600 mt-1">{proc.notes}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {rx.recommendedLabTests && rx.recommendedLabTests.length > 0 && (
                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <div className="flex items-start gap-3">
                                  <FaMicroscope className="text-amber-600 text-lg mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-bold text-slate-800 mb-2">Recommended Lab Tests</h6>
                                    <div className="space-y-2">
                                      {rx.recommendedLabTests.map((test, i) => (
                                        <div key={i} className="bg-white p-3 rounded border border-amber-100">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-slate-700">{test.lab_test_name}</span>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                              {test.lab_test_code}
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-1">
                                            {test.specimen_type && (
                                              <span className="bg-slate-100 px-2 py-0.5 rounded">Specimen: {test.specimen_type}</span>
                                            )}
                                            {test.fasting_required && (
                                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">Fasting Required</span>
                                            )}
                                          </div>
                                          {test.notes && (
                                            <p className="text-xs text-slate-600 mt-1">{test.notes}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {rx.items && rx.items.length > 0 && (
                              <div>
                                <h6 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                  <FaCapsules className="text-teal-600" />
                                  Prescribed Medicines ({rx.items.length})
                                </h6>
                                <div className="grid gap-3">
                                  {rx.items.map((item, i) => (
                                    <div key={i} className="flex items-start justify-between bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">{item.medicine_name ? item.medicine_name.charAt(0).toUpperCase() : 'M'}</div>
                                          <div>
                                            <div className="text-sm font-bold text-slate-900">{item.medicine_name || '-'}</div>
                                            <div className="text-xs text-slate-600 mt-0.5">{item.instructions ? `Instructions: ${item.instructions}` : ''}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 flex-wrap justify-end mt-2">
                                        <span className="text-xs bg-teal-600 text-white px-2 py-1.5 rounded-full font-semibold">{item.dosage || '-'}</span>
                                        <span className="text-xs bg-cyan-600 text-white px-2 py-1.5 rounded-full font-semibold">{item.frequency || '-'}</span>
                                      </div>
                                      <div className="flex gap-2 flex-wrap justify-end ml-2 mt-2">
                                        <span className="text-xs bg-slate-500 text-white px-2 py-1.5 rounded-full font-semibold">{item.duration || '-'}</span>
                                        <span className="text-xs bg-slate-600 text-white px-2 py-1.5 rounded-full font-semibold">Qty: {item.quantity || '-'}</span>
                                      </div>
                                      {(item.medicine_type || item.route_of_administration) && (
                                        <div className="flex gap-2 flex-wrap justify-end ml-2 mt-2">
                                          {item.medicine_type && (
                                            <span className="text-xs bg-indigo-500 text-white px-2 py-1.5 rounded-full font-semibold">Type: {item.medicine_type}</span>
                                          )}
                                          {item.route_of_administration && (
                                            <span className="text-xs bg-rose-500 text-white px-2 py-1.5 rounded-full font-semibold">Route: {item.route_of_administration}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rx.prescription_image && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <h6 className="font-bold text-slate-800 mb-3">Prescription Document</h6>
                                <img src={rx.prescription_image} alt="Prescription" className="w-full max-h-60 object-contain rounded-lg border border-slate-300 shadow-sm" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FaPrescriptionBottleAlt className="mx-auto text-5xl text-slate-300 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No past prescriptions found</p>
                      <p className="text-sm mt-1">Prescriptions will appear here when available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {/* Keep existing appointments content */}
                  {pastAppointments.length > 0 ? (
                    pastAppointments.map((apt, idx) => (
                      <div key={apt._id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3">
                                <FaCalendarCheck className="text-lg opacity-80" />
                                <span className="text-lg font-bold capitalize">
                                  {apt.appointment_type || 'Consultation'}
                                </span>
                                <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${apt.status === 'Completed' ? 'bg-green-400 text-green-900' :
                                  apt.status === 'Cancelled' ? 'bg-red-400 text-red-900' :
                                    'bg-slate-400 text-slate-900'
                                  }`}>
                                  {apt.status}
                                </span>
                              </div>
                              <p className="text-sm text-indigo-100 mt-1">
                                {new Date(apt.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              {apt.doctor_id && (
                                <p className="text-sm">
                                  <span className="text-slate-600">Consulted with</span><br />
                                  <span className="font-bold text-slate-900">Dr. {apt.doctor_id.firstName} {apt.doctor_id.lastName}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 font-semibold block">Priority</span>
                              <span className={`inline-block px-3 py-1.5 text-sm font-bold rounded-full mt-1 ${apt.priority === 'High' || apt.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {apt.priority || 'Normal'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                              <FaHistory className="text-slate-500" />
                              <h6 className="font-bold text-slate-700 text-sm">Appointment History Details</h6>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                              <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Scheduled Time</span>
                                <div className="font-medium text-slate-700 mt-0.5">
                                  {apt.start_time ? new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                  {' - '}
                                  {apt.end_time ? new Date(apt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Actual Completion</span>
                                <div className="font-medium text-slate-700 mt-0.5">
                                  {apt.actual_end_time
                                    ? new Date(apt.actual_end_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : <span className="text-slate-400 italic">Not recorded</span>}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Duration</span>
                                <div className="font-medium text-slate-700 mt-0.5 flex items-center gap-1">
                                  <FaClock className="text-slate-400 text-xs" /> {apt.duration || 0} mins
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Category</span>
                                <div className="font-medium text-slate-700 mt-0.5 capitalize">
                                  {apt.type || 'N/A'} <span className="text-slate-400">({apt.appointment_type || 'General'})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {apt.notes && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <div className="flex items-start gap-3">
                                <FaFileAlt className="text-amber-600 text-lg mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <h6 className="font-bold text-slate-800 mb-1">Notes</h6>
                                  <p className="text-slate-700 text-sm">{apt.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => fetchPrescriptionsByAppointment(apt._id)}
                              className="w-full bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                            >
                              <FaPrescriptionBottleAlt className="text-sm" />
                              View Associated Prescription
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FaHistory className="mx-auto text-5xl text-slate-300 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No past appointments found</p>
                      <p className="text-sm mt-1">Your appointment history will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Show loading state while fetching config
  if (configLoading) {
    return (
      <Layout sidebarItems={doctorSidebar} section={'Doctor'}>
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-2 font-sans flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout sidebarItems={doctorSidebar} section={'Doctor'}>
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-2 font-sans flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading details...</p>
        </div>
      </Layout>
    );
  }

  if (!appointment) return null;

  const patientName = appointment.patient_id
    ? `${appointment.patient_id.first_name || ''} ${appointment.patient_id.last_name || ''}`.trim()
    : 'Unknown Patient';

  const vitalsInfo = getVitalsAccessMessage();
  const VitalsIcon = vitalsInfo.icon;

  return (
    <Layout sidebarItems={doctorSidebar} section={'Doctor'}>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-2 font-sans">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/dashboard/doctor/appointments')}
              className="flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium"
            >
              <FaArrowLeft className="mr-2" /> Back to Queue
            </button>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                appointment.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                {appointment.status}
              </span>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center shadow-sm animate-fade-in ${message.includes('Error') || message.includes('Failed')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
              {message.includes('Error') ? <FaTimes className="mr-3" /> : <FaCheckCircle className="mr-3" />}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Vitals Access Banner */}
          {!vitalsConfig.vitalsEnabled ? (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-gray-500" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-700">Vitals Collection Disabled</h3>
                  <p className="text-gray-600 text-sm">
                    The hospital administrator has disabled vitals collection.
                  </p>
                </div>
              </div>
            </div>
          ) : vitalsConfig.vitalsController !== 'doctor' && (
            <div className={`bg-${vitalsInfo.color}-50 border-l-4 border-${vitalsInfo.color}-400 p-4 rounded-lg mb-6`}>
              <div className="flex items-center gap-3">
                <VitalsIcon className={`text-${vitalsInfo.color}-600`} size={24} />
                <div>
                  <h3 className={`font-semibold text-${vitalsInfo.color}-700`}>
                    {vitalsInfo.message}
                  </h3>
                  <p className={`text-${vitalsInfo.color}-600 text-sm`}>
                    You have view-only access to vitals. Vitals can only be recorded by {vitalsConfig.vitalsController}s.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {/* Patient Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
                  {appointment.patient_id?.patient_image ? (
                    <img
                      src={appointment.patient_id.patient_image}
                      alt={appointment.patient_id?.first_name || 'Patient'}
                      className="h-8 w-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                      <FaUser />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-800 text-md">Patient</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                    <p className="text-slate-700 font-medium text-sm">{patientName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Gender</label>
                      <p className="text-slate-700 text-sm">{appointment.patient_id?.gender || '--'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Age</label>
                      <p className="text-slate-700 text-sm">{calculateAge(appointment.patient_id?.dob)} yrs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood</label>
                      <p className="text-slate-700 text-sm">{appointment.patient_id?.blood_group || '--'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</label>
                      <p className="text-slate-700 text-sm truncate">{appointment.patient_id?.phone || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vitals Card */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
                <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                      <FaHeartbeat />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-md">Vitals</h3>
                  </div>
                  {canAccessVitals() && (
                    <button
                      onClick={handleVitalsClick}
                      className="p-1.5 text-teal-600 hover:bg-teal-200 rounded-lg transition-colors"
                      title="Update Vitals"
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
                </div>
                
                {appointment.vitals && (appointment.vitals.bp || appointment.vitals.pulse || appointment.vitals.weight || appointment.vitals.spo2 || appointment.vitals.temperature || appointment.vitals.respiratory_rate || appointment.vitals.random_blood_sugar || appointment.vitals.height) ? (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Height</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.height || '--'} <span className="text-[10px] text-slate-400">cm</span></span>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Weight</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.weight || '--'} <span className="text-[10px] text-slate-400">kg</span></span>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">BP</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.bp || '--'}</span>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Pulse</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.pulse || '--'} <span className="text-[10px] text-slate-400">bpm</span></span>
                      </div>

                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">SPO2</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.spo2 || '--'} <span className="text-[10px] text-slate-400">%</span></span>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">RR</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.respiratory_rate || '--'} <span className="text-[10px] text-slate-400">/min</span></span>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">RBS</span>
                        <span className="text-md font-bold text-slate-800">{appointment.vitals?.random_blood_sugar || '--'} <span className="text-[10px] text-slate-400">mg/dL</span></span>
                      </div>

                      {appointment.vitals?.temperature && (
                        <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Temp</span>
                          <span className="text-md font-bold text-slate-800">{appointment.vitals.temperature} <span className="text-[10px] text-slate-400">°F</span></span>
                        </div>
                      )}
                    </div>
                    {appointment.vitals?.recorded_at && (
                      <p className="text-xs text-slate-400 mt-2 text-right">
                        Recorded: {new Date(appointment.vitals.recorded_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-400">No vitals recorded yet</p>
                    {canAccessVitals() && (
                      <button
                        onClick={handleVitalsClick}
                        className="mt-2 text-teal-600 text-sm font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <FaPlus size={12} /> Add Vitals
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Session Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 text-sm">
                    <FaClock />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-md">Session</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-medium text-slate-700 text-xs">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 text-sm">Time</span>
                    <span className="font-medium text-slate-700 text-xs">
                      {appointment.time_slot
                        ? appointment.time_slot.split('-')[0].trim()
                        : (appointment.start_time
                          ? new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : (appointment.time
                            ? appointment.time
                            : 'N/A'))}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 text-sm">Type</span>
                    <span className="font-medium text-slate-700 text-xs capitalize">{appointment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Priority</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${appointment.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                      {appointment.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <PatientHistoryTabs />

              {activeTab === 'current' ? (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    {appointment.status === 'Completed' ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                        <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                          <FaCheckCircle className="text-4xl text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Consultation Completed</h2>
                        <p className="text-slate-500 max-w-md">The prescription has been issued and saved to the patient's record.</p>

                        <button onClick={() => navigate('/dashboard/doctor/appointments')} className="mt-8 text-teal-600 font-medium hover:underline">
                          Return to Dashboard
                        </button>
                      </div>
                    ) : (
                      <>
                        {!showPrescriptionForm ? (
                          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                              <FaNotesMedical className="text-4xl text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Consultation</h3>
                            <p className="text-slate-500 max-w-sm mb-8">Begin the diagnosis process to prescribe medication and complete this appointment.</p>
                            <button
                              onClick={() => setShowPrescriptionForm(true)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-teal-600/20 transition-all transform hover:-translate-y-1"
                            >
                              Create Prescription
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitPrescription} className="flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                              <h3 className="font-bold text-slate-800 flex items-center">
                                <FaFilePrescription className="mr-2 text-teal-600" /> New Prescription
                              </h3>
                            </div>

                            <div className="p-6 space-y-6 flex-grow">
                              {/* Keep all existing prescription form fields */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Presenting Complaint
                                </label>
                                <textarea
                                  name="presenting_complaint"
                                  value={prescription.presenting_complaint}
                                  onChange={handleInputChange}
                                  placeholder="Chief complaint or main reason for visit..."
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  History of Presenting Complaint
                                </label>
                                <textarea
                                  name="history_of_presenting_complaint"
                                  value={prescription.history_of_presenting_complaint}
                                  onChange={handleInputChange}
                                  placeholder="Detailed history of the presenting complaint..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Clinical Notes
                                </label>
                                <textarea
                                  name="notes"
                                  value={prescription.notes}
                                  onChange={handleInputChange}
                                  placeholder="Any additional observations..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Diagnosis / Provisional Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="diagnosis"
                                  value={prescription.diagnosis}
                                  onChange={handleInputChange}
                                  placeholder="e.g. Acute Viral Fever"
                                  required={true}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                              </div>

                              {/* Procedures Section */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <label className="text-sm font-semibold text-slate-700">Recommended Procedures</label>
                                  <button
                                    type="button"
                                    onClick={addProcedure}
                                    className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center"
                                  >
                                    <FaPlus className="mr-1" /> Add Procedure
                                  </button>
                                </div>

                                {prescription.recommendedProcedures.length > 0 && (
                                  <div className="space-y-3 mb-4">
                                    {prescription.recommendedProcedures.map((proc, index) => {
                                      const isExpanded = expandedProcedureIndex === index;
                                      const isFilled = proc.procedure_code && proc.procedure_name;

                                      return (
                                        <div
                                          key={index}
                                          className={`rounded-lg border transition-all ${isExpanded
                                              ? 'border-blue-200 bg-blue-50 shadow-md'
                                              : 'border-blue-100 bg-blue-50 hover:border-blue-300'
                                            }`}
                                        >
                                          {/* Procedure header and content */}
                                          <div className="flex items-center justify-between">
                                            <button
                                              type="button"
                                              onClick={() => setExpandedProcedureIndex(isExpanded ? -1 : index)}
                                              className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-blue-100 rounded-lg transition-colors text-left"
                                            >
                                              <div className="flex items-center gap-3 flex-1">
                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                                                  }`}>
                                                  {index + 1}
                                                </div>
                                                {isExpanded ? (
                                                  <div className="text-xs font-bold text-blue-400 uppercase">Procedure #{index + 1}</div>
                                                ) : (
                                                  <div className="flex-1 min-w-0">
                                                    {isFilled ? (
                                                      <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium text-slate-800 truncate">{proc.procedure_code}</span>
                                                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{proc.procedure_name}</span>
                                                        {proc.notes && (
                                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded truncate">{proc.notes}</span>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <span className="text-sm text-slate-500 italic">Empty - Click to fill</span>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                              <div className={`text-slate-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <FaChevronDown size={14} />
                                              </div>
                                            </button>
                                            {!isExpanded && prescription.recommendedProcedures.length > 0 && (
                                              <button
                                                type="button"
                                                onClick={() => removeProcedure(index)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
                                              >
                                                <FaTrash size={14} />
                                              </button>
                                            )}
                                          </div>

                                          {isExpanded && (
                                            <div className="border-t border-blue-200 p-3 rounded-b-lg">
                                              <div className="flex justify-between items-start mb-2">
                                                <button onClick={() => removeProcedure(index)} className="text-blue-400 hover:text-red-500 transition-colors ml-auto">
                                                  <FaTrash size={14} />
                                                </button>
                                              </div>

                                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5">
                                                  <SearchableFormSelect
                                                    label="Procedure Name/Code"
                                                    value={proc.procedure_code}
                                                    onChange={(e) => handleProcedureChange(index, e)}
                                                    options={procedureOptions}
                                                    placeholder="Search procedure..."
                                                    type="procedure"
                                                    name="procedure_code"
                                                    loading={searchingProcedures}
                                                    error={procedureErrors[index]}
                                                    onSearch={fetchProcedures}
                                                    debounceDelay={1000}
                                                    minSearchChars={0}
                                                    allowCustom={true}
                                                    freeSolo={true}
                                                  />
                                                </div>

                                                <div className="md:col-span-3">
                                                  <div className="mb-0">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                      Details
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={proc.procedure_name || ''}
                                                      readOnly={true}
                                                      placeholder="Auto-fill"
                                                      className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                                                    />
                                                  </div>
                                                </div>

                                                <div className="md:col-span-4">
                                                  <div className="mb-0">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                      Notes
                                                    </label>
                                                    <textarea
                                                      name="notes"
                                                      value={proc.notes || ''}
                                                      onChange={(e) => handleProcedureChange(index, e)}
                                                      placeholder="Notes..."
                                                      rows={1}
                                                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 transition-colors bg-white"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Lab Tests Section */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <label className="text-sm font-semibold text-slate-700">Recommended Lab Tests</label>
                                  <button
                                    type="button"
                                    onClick={addLabTest}
                                    className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center"
                                  >
                                    <FaPlus className="mr-1" /> Add Lab Test
                                  </button>
                                </div>

                                {prescription.recommendedLabTests.length > 0 && (
                                  <div className="space-y-3 mb-4">
                                    {prescription.recommendedLabTests.map((test, index) => {
                                      const isExpanded = expandedLabTestIndex === index;
                                      const isFilled = test.lab_test_code && test.lab_test_name;

                                      return (
                                        <div
                                          key={index}
                                          className={`rounded-lg border transition-all ${isExpanded
                                              ? 'border-amber-200 bg-amber-50 shadow-md'
                                              : 'border-amber-100 bg-amber-50 hover:border-amber-300'
                                            }`}
                                        >
                                          {/* Lab test header and content */}
                                          <div className="flex items-center justify-between">
                                            <button
                                              type="button"
                                              onClick={() => setExpandedLabTestIndex(isExpanded ? -1 : index)}
                                              className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-amber-100 rounded-lg transition-colors text-left"
                                            >
                                              <div className="flex items-center gap-3 flex-1">
                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isExpanded ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'
                                                  }`}>
                                                  {index + 1}
                                                </div>
                                                {isExpanded ? (
                                                  <div className="text-xs font-bold text-amber-400 uppercase">Lab Test #{index + 1}</div>
                                                ) : (
                                                  <div className="flex-1 min-w-0">
                                                    {isFilled ? (
                                                      <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium text-slate-800 truncate">{test.lab_test_code}</span>
                                                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{test.lab_test_name}</span>
                                                        {test.fasting_required && (
                                                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Fasting</span>
                                                        )}
                                                        {test.notes && (
                                                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded truncate">{test.notes}</span>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <span className="text-sm text-slate-500 italic">Empty - Click to fill</span>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                              <div className={`text-slate-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <FaChevronDown size={14} />
                                              </div>
                                            </button>
                                            {!isExpanded && prescription.recommendedLabTests.length > 0 && (
                                              <button
                                                type="button"
                                                onClick={() => removeLabTest(index)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
                                              >
                                                <FaTrash size={14} />
                                              </button>
                                            )}
                                          </div>

                                          {isExpanded && (
                                            <div className="border-t border-amber-200 p-3 rounded-b-lg">
                                              <div className="flex justify-between items-start mb-2">
                                                <button onClick={() => removeLabTest(index)} className="text-amber-400 hover:text-red-500 transition-colors ml-auto">
                                                  <FaTrash size={14} />
                                                </button>
                                              </div>

                                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5">
                                                  <SearchableFormSelect
                                                    label="Lab Test Name/Code"
                                                    value={test.lab_test_code}
                                                    onChange={(e) => handleLabTestChange(index, e)}
                                                    options={labTestOptions}
                                                    placeholder="Search lab test..."
                                                    type="labtest"
                                                    name="lab_test_code"
                                                    loading={searchingLabTests}
                                                    error={labTestErrors[index]}
                                                    onSearch={fetchLabTests}
                                                    debounceDelay={1000}
                                                    minSearchChars={0}
                                                    allowCustom={true}
                                                    freeSolo={true}
                                                  />
                                                </div>

                                                <div className="md:col-span-4">
                                                  <div className="mb-0">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                      Details
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={test.lab_test_name || ''}
                                                      readOnly={true}
                                                      placeholder="Auto-fill"
                                                      className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                                                    />
                                                  </div>
                                                </div>

                                                <div className="md:col-span-3">
                                                  <div className="mb-0">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                      Specimen Type
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={test.specimen_type || ''}
                                                      readOnly={true}
                                                      placeholder="Auto-fill"
                                                      className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 transition-colors"
                                                    />
                                                  </div>
                                                </div>

                                                <div className="md:col-span-12">
                                                  <div className="flex items-center mb-3">
                                                    <input
                                                      type="checkbox"
                                                      id={`fasting-${index}`}
                                                      name="fasting_required"
                                                      checked={test.fasting_required || false}
                                                      onChange={(e) => handleLabTestChange(index, e)}
                                                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`fasting-${index}`} className="ml-2 block text-sm text-slate-700">
                                                      Fasting Required
                                                    </label>
                                                  </div>
                                                </div>

                                                <div className="md:col-span-12">
                                                  <div className="mb-0">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                      Notes / Instructions
                                                    </label>
                                                    <textarea
                                                      name="notes"
                                                      value={test.notes || ''}
                                                      onChange={(e) => handleLabTestChange(index, e)}
                                                      placeholder="e.g. First morning void, 8-12 hour fasting required, etc."
                                                      rows={2}
                                                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 transition-colors bg-white"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Medicines Section */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <label className="text-sm font-semibold text-slate-700">Prescribed Medicines</label>
                                  <button
                                    type="button"
                                    onClick={addMedicine}
                                    className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center"
                                  >
                                    <FaPlus className="mr-1" /> Add Medicine
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  {prescription.items.map((item, index) => {
                                    const isExpanded = expandedMedicineIndex === index;
                                    const isFilled = item.medicine_name && item.dosage && item.frequency;

                                    return (
                                      <div
                                        key={index}
                                        className={`rounded-lg border transition-all ${isExpanded
                                            ? 'border-teal-200 bg-teal-50 shadow-md'
                                            : 'border-teal-100 bg-teal-50 hover:border-teal-300'
                                          }`}
                                      >
                                        {/* Medicine header and content */}
                                        <div className="flex items-center justify-between">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedMedicineIndex(isExpanded ? -1 : index)}
                                            className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-teal-100 rounded-lg transition-colors text-left"
                                          >
                                            <div className="flex items-center gap-3 flex-1">
                                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isExpanded ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {index + 1}
                                              </div>
                                              {isExpanded ? (
                                                <div className="text-xs font-bold text-slate-400 uppercase">Medicine #{index + 1}</div>
                                              ) : (
                                                <div className="flex-1 min-w-0">
                                                  {isFilled ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span className="font-medium text-slate-800 truncate">{item.medicine_name}</span>
                                                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{item.dosage}</span>
                                                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{item.frequency}</span>
                                                      {item.route_of_administration && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{item.route_of_administration}</span>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <span className="text-sm text-slate-500 italic">Empty - Click to fill</span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className={`text-slate-400 transition-transform ml-2 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                              <FaChevronDown size={14} />
                                            </div>
                                          </button>
                                          {!isExpanded && prescription.items.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeMedicine(index)}
                                              className="text-slate-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
                                            >
                                              <FaTrash size={14} />
                                            </button>
                                          )}
                                        </div>

                                        {isExpanded && (
                                          <div className="border-t border-slate-200 p-3 rounded-b-lg">
                                            <div className="flex justify-between items-start mb-2">
                                              <button onClick={() => removeMedicine(index)} className="text-slate-400 hover:text-red-500 transition-colors ml-auto">
                                                <FaTrash size={14} />
                                              </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                              <div className="md:col-span-4">
                                                <SearchableFormSelect
                                                  label="Medicine Name"
                                                  value={item.medicine_name}
                                                  onChange={(e) => handleMedicineChange(index, e)}
                                                  options={medicineOptions}
                                                  placeholder="Search..."
                                                  required
                                                  type="medicine"
                                                  name="medicine_name"
                                                  loading={searchingMedicines}
                                                  error={medicineErrors[index]}
                                                  onSearch={fetchMedicines}
                                                  debounceDelay={1000}
                                                  minSearchChars={0}
                                                  allowCustom={true}
                                                  freeSolo={true}
                                                />
                                              </div>
                                              <div className="md:col-span-2">
                                                <SearchableFormSelect
                                                  label="Type"
                                                  value={item.medicine_type || ''}
                                                  onChange={(e) => handleMedicineChange(index, e)}
                                                  options={medicineTypeOptions}
                                                  placeholder="Type"
                                                  name="medicine_type"
                                                  allowCustom={false}
                                                  freeSolo={false}
                                                />
                                              </div>
                                              <div className="md:col-span-2">
                                                <div className="mb-0">
                                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Dosage <span className="text-red-500">*</span>
                                                  </label>
                                                  <input
                                                    type="text"
                                                    name="dosage"
                                                    value={item.dosage}
                                                    onChange={(e) => handleMedicineChange(index, e)}
                                                    placeholder="500mg"
                                                    required={true}
                                                    className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 transition-colors bg-grey-100"
                                                  />
                                                </div>
                                              </div>
                                              <div className="md:col-span-2">
                                                <SearchableFormSelect
                                                  label="Route"
                                                  value={item.route_of_administration || ""}
                                                  onChange={(e) => handleMedicineChange(index, e)}
                                                  options={routeOptions}
                                                  placeholder="Route"
                                                  name="route_of_administration"
                                                  allowCustom={false}
                                                  freeSolo={false}
                                                />
                                              </div>
                                              <div className="md:col-span-2">
                                                <SearchableFormSelect
                                                  label="Frequency"
                                                  value={item.frequency}
                                                  onChange={(e) => handleMedicineChange(index, e)}
                                                  options={frequencyOptions}
                                                  placeholder="Freq"
                                                  name="frequency"
                                                  required={true}
                                                  allowCustom={false}
                                                  freeSolo={false}
                                                />
                                              </div>

                                              <div className="md:col-span-2">
                                                <SearchableFormSelect
                                                  label="Duration"
                                                  value={item.duration}
                                                  onChange={(e) => handleMedicineChange(index, e)}
                                                  options={durationOptions}
                                                  placeholder="Dur"
                                                  name="duration"
                                                  required={true}
                                                  allowCustom={false}
                                                  freeSolo={false}
                                                />
                                              </div>
                                              <div className="md:col-span-2">
                                                <div className="mb-0">
                                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Qty
                                                  </label>
                                                  <input
                                                    type="text"
                                                    name="quantity"
                                                    value={item.quantity}
                                                    onChange={(e) => handleMedicineChange(index, e)}
                                                    placeholder="Qty"
                                                    readOnly={true}
                                                    className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg bg-gray-100 focus:ring-1 focus:ring-teal-500 transition-colors"
                                                  />
                                                </div>
                                              </div>
                                              <div className="md:col-span-8">
                                                <div className="mb-0">
                                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Instructions
                                                  </label>
                                                  <input
                                                    type="text"
                                                    name="instructions"
                                                    value={item.instructions}
                                                    onChange={(e) => handleMedicineChange(index, e)}
                                                    placeholder="e.g. After food with water"
                                                    className="w-full mt-1 px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 transition-colors bg-white"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Image Upload Section */}
                              <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-100 transition-colors">
                                {!prescription.prescriptionImage ? (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      disabled={uploadingImage}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                      {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                                      ) : (
                                        <FaCloudUploadAlt className="text-3xl text-slate-400 mb-2" />
                                      )}
                                      <span className="text-sm font-medium text-slate-600">
                                        {uploadingImage ? 'Uploading...' : 'Click to upload prescription image (Optional)'}
                                      </span>
                                      <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative group">
                                    <img
                                      src={prescription.prescriptionImage}
                                      alt="Prescription Preview"
                                      className="max-h-64 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                                    />
                                    <button
                                      type="button"
                                      onClick={removeImage}
                                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                      <FaTimes />
                                    </button>
                                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center justify-center">
                                      <FaCheckCircle className="mr-1" /> Image attached successfully
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-xl">
                              <button
                                type="button"
                                onClick={() => setShowPrescriptionForm(false)}
                                className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submitting || calculatingSalary}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                              >
                                {submitting ? (
                                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
                                ) : (
                                  <>Complete Consultation <FaCheckCircle className="ml-2" /></>
                                )}
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Update Vitals</h2>
              <button
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Patient: {patientName}
            </p>

            <form onSubmit={submitVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
                  <input
                    type="text" name="height" value={vitals.height} onChange={handleVitalsChange}
                    placeholder="e.g. 170"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="text" name="weight" value={vitals.weight} onChange={handleVitalsChange}
                    placeholder="e.g. 70"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Pressure</label>
                  <input
                    type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange}
                    placeholder="e.g. 120/80"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pulse (bpm)</label>
                  <input
                    type="text" name="pulse" value={vitals.pulse} onChange={handleVitalsChange}
                    placeholder="e.g. 72"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SPO2 (%)</label>
                  <input
                    type="text" name="spo2" value={vitals.spo2} onChange={handleVitalsChange}
                    placeholder="e.g. 98"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temperature (°F)</label>
                  <input
                    type="text" name="temperature" value={vitals.temperature} onChange={handleVitalsChange}
                    placeholder="e.g. 98.6"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RR (breaths/min)</label>
                  <input
                    type="text" name="respiratory_rate" value={vitals.respiratory_rate} onChange={handleVitalsChange}
                    placeholder="e.g. 16"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RBS (mg/dL)</label>
                  <input
                    type="text" name="random_blood_sugar" value={vitals.random_blood_sugar} onChange={handleVitalsChange}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AppointmentDetails;