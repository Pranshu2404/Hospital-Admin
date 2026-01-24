import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser, FaClock, FaStethoscope, FaNotesMedical,
  FaCheckCircle, FaPlus, FaTimes, FaMoneyBillWave,
  FaArrowLeft, FaFilePrescription, FaCloudUploadAlt, FaTrash,
  FaHistory, FaCalendarCheck, FaPrescriptionBottleAlt,
  FaFlask, FaFileAlt, FaChevronDown, FaChevronUp, FaCapsules, FaHeartbeat, FaMagic, FaTimesCircle,
  FaProcedures, FaSearch, FaExclamationTriangle
} from 'react-icons/fa';
import { summarizePatientHistory } from '@/utils/geminiService';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

// Searchable Form Select Component
// Searchable Form Select Component - Fixed Version
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
  onCustomInput,
  loading = false,
  type = "text", // "medicine" or "procedure"
  error = false,
  onSearch,
  debounceDelay = 500, // Add debounce delay
  allowCustom = true // Allow custom input
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Normalize options once
  const normalizedOptions = useMemo(() => {
    return options.map(opt => 
      typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) }
    );
  }, [options]);

  // Initialize search term from value
  useEffect(() => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    if (selected) {
      setSearchTerm(selected.label);
    } else if (value) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value, normalizedOptions]);

  // Filter options based on search term (local filtering)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(normalizedOptions.slice(0, 20)); // Show first 20 when empty
      return;
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = normalizedOptions.filter(opt => 
      opt.label.toLowerCase().includes(lowerSearch) || 
      opt.value.toLowerCase().includes(lowerSearch) ||
      (opt.dosage && opt.dosage.toLowerCase().includes(lowerSearch)) ||
      (opt.category && opt.category.toLowerCase().includes(lowerSearch)) ||
      (opt.strength && opt.strength.toLowerCase().includes(lowerSearch))
    );
    
    setFilteredOptions(filtered.slice(0, 20)); // Limit to 20 results
  }, [searchTerm, normalizedOptions]);

  // Debounced search for external API
  useEffect(() => {
    if (searchTerm.length >= 2 && onSearch) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchTerm);
      }, debounceDelay);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch, debounceDelay]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[activeIndex]) {
          handleSelect(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        if (!isOpen && searchTerm && allowCustom) {
          e.preventDefault();
          const exactMatch = normalizedOptions.some(
            opt => opt.label.toLowerCase() === searchTerm.toLowerCase()
          );
          if (!exactMatch) {
            setShowCustomInput(true);
            setCustomInput(searchTerm);
          }
        }
        break;
    }
  };

  const handleSelect = (opt) => {
    if (onChange) {
      onChange({ 
        target: { 
          name: name || label.toLowerCase().replace(/\s/g, ''), 
          value: opt.value 
        } 
      });
    }
    setSearchTerm(opt.label);
    setIsOpen(false);
    setShowCustomInput(false);
    // Keep focus on input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  const handleCustomInput = () => {
    if (customInput.trim()) {
      if (onChange) {
        onChange({ 
          target: { 
            name: name || label.toLowerCase().replace(/\s/g, ''), 
            value: customInput 
          } 
        });
      }
      setSearchTerm(customInput);
      setShowCustomInput(false);
      if (onCustomInput) {
        onCustomInput(customInput);
      }
      // Keep focus on input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveIndex(0);
    
    // Only open dropdown if there's text
    if (value.trim()) {
      setIsOpen(true);
    }
    
    setShowCustomInput(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() || normalizedOptions.length > 0) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Get icon based on type
  const getIcon = () => {
    if (type === "medicine") return <FaCapsules className="text-purple-500 text-sm" />;
    if (type === "procedure") return <FaProcedures className="text-blue-500 text-sm" />;
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
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full px-4 py-3 bg-gray-50 border ${
              error ? 'border-red-300' : 'border-gray-200'
            } text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all pl-10 ${
              loading ? 'pr-10' : ''
            }`}
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {getIcon()}
          </div>
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            </div>
          )}
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute border border-gray-200 z-50 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-60">
            <div className="overflow-y-auto">
              {filteredOptions.map((opt, index) => (
                <div
                  key={`${opt.value}-${index}`}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                    index === activeIndex ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-gray-700'
                  } ${opt.value === value ? 'bg-emerald-100/50 text-emerald-700' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{opt.label}</div>
                    {(opt.dosage || opt.strength || opt.category) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {opt.dosage && <span>Form: {opt.dosage} </span>}
                        {opt.strength && <span>• Strength: {opt.strength} </span>}
                        {opt.category && <span>• Category: {opt.category}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {searchTerm && allowCustom && !filteredOptions.some(
              opt => opt.label.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <div 
                className="px-4 py-3 text-sm border-t border-gray-100 bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setShowCustomInput(true);
                  setCustomInput(searchTerm);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span>Add custom: </span>
                    <strong className="text-amber-700">"{searchTerm}"</strong>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Custom</span>
                </div>
              </div>
            )}
          </div>
        )}

        {showCustomInput && allowCustom && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-1">Add Custom {label}</h4>
              <p className="text-xs text-gray-500">This will be saved as a custom entry</p>
            </div>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomInput();
                } else if (e.key === 'Escape') {
                  setShowCustomInput(false);
                  setCustomInput('');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={`Enter custom ${label.toLowerCase()}`}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomInput('');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomInput}
                className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Add Custom
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">Please select a valid option</p>}
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

  // Frequency options with common medical abbreviations
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

  // Duration options (1-30 days)
  const durationOptions = Array.from({ length: 30 }, (_, i) => ({
    value: `${i + 1} days`,
    label: `${i + 1} day${i > 0 ? 's' : ''}`
  }));

  // Route of administration options
  const routeOptions = [
    "Oral",
    "Sublingual",
    "Intramuscular Injection",
    "Intravenous Injection",
    "Subcutaneous Injection",
    "Topical Application",
    "Inhalation",
    "Nasal",
    "Eye Drops",
    "Ear Drops",
    "Rectal",
    "Other"
  ];

  // Medicine type options
  const medicineTypeOptions = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Ointment",
    "Drops",
    "Inhaler",
    "Suppository",
    "Powder",
    "Cream",
    "Lotion",
    "Other"
  ];

  const [prescription, setPrescription] = useState({
    diagnosis: '',
    notes: '',
    investigation: '',
    recommendedProcedures: [],
    items: [{
      medicine_name: '',
      dosage: '',
      medicine_type: '',
      route_of_administration: '',
      duration: '7 days',
      frequency: 'BD',
      instructions: '',
      quantity: ''
    }],
    prescriptionImage: null
  });

  // Gemini Summary State
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch medicines from backend
  const fetchMedicines = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;
    
    setSearchingMedicines(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/NLEMmedicines/search`, {
        params: { q: searchTerm, limit: 20 }
      });
      console.log(response.data)
      if (response.data.data && response.data.data.medicines) {
        const medicineOpts = response.data.data.medicines.map(med => ({
          label: `${med.medicine_name}${med.strength ? ` - ${med.strength}` : ''}${med.dosage_form ? ` (${med.dosage_form})` : ''}`,
          value: med.medicine_name,
          dosage: med.dosage_form,
          strength: med.strength,
          code: med.nlem_code,
          healthcare_level: med.healthcare_level,
          therapeutic_category: med.therapeutic_category
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

  // Fetch procedures from backend
  const fetchProcedures = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;
    
    setSearchingProcedures(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/procedures/search`, {
        params: { q: searchTerm, limit: 20 }
      });
      console.log(response.data)
      if (response.data.data && response.data.data.procedures) {
        const procedureOpts = response.data.data.procedures.map(proc => ({
          label: `${proc.code} - ${proc.name}`,
          value: proc.code,
          name: proc.name,
          category: proc.category,
          base_price: proc.base_price
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

  // Load initial medicines and procedures
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingMedicines(true);
      setLoadingProcedures(true);
      
      try {
        // Fetch initial medicines (empty search to get popular ones)
        await fetchMedicines('');
        // Fetch initial procedures (empty search to get popular ones)
        await fetchProcedures('');
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingMedicines(false);
        setLoadingProcedures(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!state?.appointment || (state?.appointment && !state.appointment.vitals)) {
      if (id) {
        console.log("Fetching full appointment details (including vitals)...");
        fetchAppointment();
      }
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
    const id = appointmentId && appointmentId._id ? appointmentId._id : appointmentId;
    if (!id) return;

    setActiveTab('prescriptions');
    setLoadingHistory(true);
    setPastPrescriptions([]);

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions?appointment_id=${encodeURIComponent(id)}&limit=20`);
      const list = res.data.prescriptions || res.data || [];

      if (!list || list.length === 0) {
        setMessage('No prescriptions found for this appointment');
      }
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
      const data = response.data;
      setAppointment(data);
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
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

    if (frequencyMap.hasOwnProperty(frequency)) {
      const dailyFrequency = frequencyMap[frequency];
      return dailyFrequency > 0 ? durationDays * dailyFrequency : '';
    }

    const numericMatch = frequency.match(/(\d+)\s*(?:times|time)\s*(?:daily|per day)/i);
    if (numericMatch) {
      return durationDays * parseInt(numericMatch[1]);
    }

    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, {
        medicine_name: '',
        dosage: '',
        medicine_type: '',
        route_of_administration: '',
        duration: '7 days',
        frequency: 'BD',
        instructions: '',
        quantity: ''
      }]
    }));
  };

  const removeMedicine = (index) => {
    if (prescription.items.length <= 1) return;
    const newItems = [...prescription.items];
    newItems.splice(index, 1);
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

  const addProcedure = () => {
    setPrescription(prev => ({
      ...prev,
      recommendedProcedures: [...prev.recommendedProcedures, {
        procedure_code: '',
        procedure_name: '',
        notes: ''
      }]
    }));
  };

  const removeProcedure = (index) => {
    const newProcedures = [...prescription.recommendedProcedures];
    newProcedures.splice(index, 1);
    setPrescription(prev => ({ ...prev, recommendedProcedures: newProcedures }));
  };

  const handleProcedureChange = (index, e) => {
    const { name, value } = e.target;
    const newProcedures = [...prescription.recommendedProcedures];
    
    if (name === 'procedure_code') {
      const selectedProcedure = procedureOptions.find(proc => proc.value === value);
      if (selectedProcedure) {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: value,
          procedure_name: selectedProcedure.name || selectedProcedure.label.replace(`${value} - `, ''),
          notes: newProcedures[index].notes || ''
        };
      } else {
        newProcedures[index][name] = value;
        // Clear procedure_name if code is cleared
        if (!value) {
          newProcedures[index].procedure_name = '';
        }
      }
    } else {
      newProcedures[index][name] = value;
    }
    
    setPrescription(prev => ({ ...prev, recommendedProcedures: newProcedures }));
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

  // Add debounce utility at the top of your file:
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// In your main component, update these handlers:

// Handle medicine search - with debouncing
const handleMedicineSearch = useCallback(
  debounce(async (searchTerm) => {
    if (searchTerm.length >= 2) {
      setSearchingMedicines(true);
      try {
        await fetchMedicines(searchTerm);
      } catch (error) {
        console.error('Medicine search error:', error);
      } finally {
        setSearchingMedicines(false);
      }
    }
  }, 500),
  []
);

// Handle procedure search - with debouncing
const handleProcedureSearch = useCallback(
  debounce(async (searchTerm) => {
    if (searchTerm.length >= 2) {
      setSearchingProcedures(true);
      try {
        await fetchProcedures(searchTerm);
      } catch (error) {
        console.error('Procedure search error:', error);
      } finally {
        setSearchingProcedures(false);
      }
    }
  }, 500),
  []
);

// Update your medicine change handler:
const handleMedicineChange = (index, e) => {
  const { name, value } = e.target;
  const newItems = [...prescription.items];
  newItems[index][name] = value;

  // Clear medicineErrors when medicine is selected
  if (name === 'medicine_name' && value) {
    setMedicineErrors(prev => ({ ...prev, [index]: false }));
  }

  if (name === 'frequency' || name === 'duration') {
    const frequency = name === 'frequency' ? value : newItems[index].frequency;
    const duration = name === 'duration' ? value : newItems[index].duration;
    const durationDays = parseInt(duration) || 0;
    const calculatedQuantity = calculateQuantityFromFrequency(frequency, durationDays);

    if (calculatedQuantity) {
      newItems[index].quantity = calculatedQuantity.toString();
    }
  }

  setPrescription(prev => ({ ...prev, items: newItems }));
};

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    // Validate medicines
    const medicineErrors = {};
    prescription.items.forEach((item, index) => {
      if (!item.medicine_name.trim()) {
        medicineErrors[index] = true;
      }
    });
    setMedicineErrors(medicineErrors);

    // Validate procedures
    const procedureErrors = {};
    prescription.recommendedProcedures.forEach((proc, index) => {
      if (proc.procedure_code && !proc.procedure_name) {
        procedureErrors[index] = true;
      }
    });
    setProcedureErrors(procedureErrors);

    if (Object.keys(medicineErrors).length > 0) {
      setMessage('Please select valid medicines for all items');
      setSubmitting(false);
      return;
    }

    try {
      if (!prescription.diagnosis.trim()) {
        throw new Error('Diagnosis is required');
      }

      const validItems = prescription.items.filter(item =>
        item.medicine_name.trim() && item.dosage.trim()
      );

      if (validItems.length === 0) {
        throw new Error('At least one valid medicine is required');
      }

      const prescriptionData = {
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
        appointment_id: appointment._id,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        investigation: prescription.investigation,
        recommendedProcedures: prescription.recommendedProcedures.filter(proc => 
          proc.procedure_code || proc.procedure_name
        ),
        items: validItems.map(item => ({
          ...item,
          quantity: parseInt(item.quantity) || 0
        })),
        prescription_image: prescription.prescriptionImage
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions`, prescriptionData);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointment._id}/complete`);

      setCalculatingSalary(true);
      try {
        const salaryResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/salaries/calculate-appointment/${appointment._id}`
        );
        if (salaryResponse.data) {
          setSalaryInfo(salaryResponse.data);
          setMessage('Success! Prescription saved & Salary credited.');
        } else {
          setMessage('Prescription saved successfully.');
        }
      } catch (salaryError) {
        setMessage('Prescription saved, but salary calculation failed.');
      } finally {
        setCalculatingSalary(false);
      }

      setTimeout(() => {
        navigate('/dashboard/doctor/appointments', {
          state: { message: 'Appointment completed successfully.' }
        });
      }, 2500);

    } catch (err) {
      console.error('Error submitting prescription:', err);
      setMessage(err.response?.data?.error || err.message || 'Error submitting prescription.');
      setSubmitting(false);
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
                                  <span className="font-bold text-slate-900">Dr. {apt.doctor_id.firstName} ${apt.doctor_id.lastName}</span>
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
                                  {apt.type || 'N/A'} <span className="text-slate-400">(${apt.appointment_type || 'General'})</span>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!appointment) return null;

  const patientName = appointment.patient_id
    ? `${appointment.patient_id.first_name || ''} ${appointment.patient_id.last_name || ''}`.trim()
    : 'Unknown Patient';

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

          {salaryInfo && (
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center mb-1">
                    <FaMoneyBillWave className="mr-2 opacity-80" /> Appointment Earnings Calculated
                  </h3>
                  <p className="text-blue-100 text-sm">Amount credited to your pending balance</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">₹{salaryInfo.amount}</div>
                  <div className="text-xs bg-white/20 px-2 py-1 rounded inline-block mt-1">
                    {salaryInfo.status ? salaryInfo.status.toUpperCase() : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="lg:col-span-1 space-y-4">

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

              {appointment.vitals && (appointment.vitals.bp || appointment.vitals.pulse || appointment.vitals.weight || appointment.vitals.spo2 || appointment.vitals.temperature || appointment.vitals.respiratory_rate || appointment.vitals.random_blood_sugar || appointment.vitals.height) && (
                <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
                  <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                      <FaHeartbeat />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-md">Vitals</h3>
                    <span className="text-xs text-slate-500 ml-auto font-normal">
                      {appointment.vitals?.recorded_at
                        ? new Date(appointment.vitals.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
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
                </div>
              )}

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

                              {/* Clinical Notes (moved to top) */}
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Clinical Notes</label>
                                <textarea
                                  name="notes"
                                  value={prescription.notes}
                                  onChange={handleInputChange}
                                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                  rows="3"
                                  placeholder="Any additional observations..."
                                />
                              </div>

                              {/* Diagnosis Section (after notes) */}
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Diagnosis / Provisional Diagnosis <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  name="diagnosis"
                                  value={prescription.diagnosis}
                                  onChange={handleInputChange}
                                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                  placeholder="e.g. Acute Viral Fever"
                                  required
                                />
                              </div>

                              {/* Investigation Field */}
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Investigation (Lab tests / Reports)</label>
                                <textarea
                                  name="investigation"
                                  value={prescription.investigation}
                                  onChange={handleInputChange}
                                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                  rows="2"
                                  placeholder="Write any lab tests or report requests here..."
                                />
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

                                <div className="space-y-4">
                                  {prescription.items.map((item, index) => (
                                    <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-4 transition-all hover:shadow-md hover:border-teal-200 group">
                                      <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase">Medicine #{index + 1}</h4>
                                        {prescription.items.length > 1 && (
                                          <button onClick={() => removeMedicine(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <FaTrash size={14} />
                                          </button>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                                        {/* Medicine Type Dropdown */}
                                        <div className="md:col-span-3">
                                          <select
                                            name="medicine_type"
                                            value={item.medicine_type || ''}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                          >
                                            <option value="">Medicine Type</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Capsule">Capsule</option>
                                            <option value="Syrup">Syrup</option>
                                            <option value="Injection">Injection</option>
                                            <option value="Ointment">Ointment</option>
                                            <option value="Drops">Drops</option>
                                            <option value="Inhaler">Inhaler</option>
                                            <option value="Other">Other</option>
                                          </select>
                                        </div>

                                        {/* Medicine Name with SearchableFormSelect */}
                                        <div className="md:col-span-6">
                                          <SearchableFormSelect
                                            label="Medicine Name"
                                            value={item.medicine_name}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            options={medicineOptions}
                                            placeholder="Search medicine..."
                                            required
                                            type="medicine"
                                            name="medicine_name"
                                            loading={searchingMedicines}
                                            error={medicineErrors[index]}
                                            onSearch={(searchTerm) => handleMedicineSearch(searchTerm, index)}
                                          />
                                        </div>

                                        <div className="md:col-span-3">
                                          <input
                                            type="text"
                                            name="dosage"
                                            value={item.dosage}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-1 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                            placeholder="Dosage(500mg)"
                                            required
                                          />
                                        </div>

                                        {/* Route of Administration Dropdown */}
                                        <div className="md:col-span-3">
                                          <select
                                            name="route_of_administration"
                                            value={item.route_of_administration || ""}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                          >
                                            <option value="">Medicine Route</option>
                                            {[
                                              "Oral",
                                              "Sublingual",
                                              "Intramuscular Injection",
                                              "Intravenous Injection",
                                              "Subcutaneous Injection",
                                              "Topical Application",
                                              "Inhalation",
                                              "Nasal",
                                              "Eye Drops",
                                              "Ear Drops",
                                              "Rectal",
                                              "Other"
                                            ].map((route) => (
                                              <option key={route} value={route}>
                                                {route}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Frequency Dropdown */}
                                        <div className="md:col-span-3">
                                          <select
                                            name="frequency"
                                            value={item.frequency}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-1 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                            required
                                          >
                                            <option value="">Frequency</option>
                                            {frequencyOptions.map(opt => (
                                              <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Duration Dropdown */}
                                        <div className="md:col-span-3">
                                          <select
                                            name="duration"
                                            value={item.duration}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                            required
                                          >
                                            <option value="">Duration</option>
                                            {durationOptions.map(opt => (
                                              <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Auto-calculated Quantity */}
                                        <div className="md:col-span-3">
                                          <input
                                            type="text"
                                            name="quantity"
                                            value={item.quantity}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                            placeholder="Auto-calculated"
                                            readOnly
                                          />
                                          <div className="text-xs text-slate-500 mt-1">
                                            {item.frequency && item.duration ?
                                              `Based on ${item.frequency} for ${item.duration}` :
                                              'Set freq & duration'}
                                          </div>
                                        </div>

                                        <div className="md:col-span-12">
                                          <input
                                            type="text"
                                            name="instructions"
                                            value={item.instructions}
                                            onChange={(e) => handleMedicineChange(index, e)}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                            placeholder="Special Instructions (e.g. After food)"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                                  <div className="space-y-4 mb-4">
                                    {prescription.recommendedProcedures.map((proc, index) => (
                                      <div key={index} className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                          <h4 className="text-xs font-bold text-blue-400 uppercase">Procedure #{index + 1}</h4>
                                          <button onClick={() => removeProcedure(index)} className="text-blue-400 hover:text-red-500 transition-colors">
                                            <FaTrash size={14} />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                          {/* Procedure Code with SearchableFormSelect */}
                                          <div className="md:col-span-6">
                                            <SearchableFormSelect
                                              label="Procedure Code"
                                              value={proc.procedure_code}
                                              onChange={(e) => handleProcedureChange(index, e)}
                                              options={procedureOptions}
                                              placeholder="Search procedure..."
                                              type="procedure"
                                              name="procedure_code"
                                              loading={searchingProcedures}
                                              error={procedureErrors[index]}
                                              onSearch={(searchTerm) => handleProcedureSearch(searchTerm, index)}
                                            />
                                          </div>

                                          {/* Procedure Name (auto-filled) */}
                                          <div className="md:col-span-6">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-2">
                                              Procedure Name
                                            </label>
                                            <input
                                              type="text"
                                              value={proc.procedure_name || ''}
                                              readOnly
                                              className="w-full border border-blue-300 rounded px-3 py-2 text-sm bg-blue-50 text-blue-700"
                                              placeholder="Will auto-fill when code selected"
                                            />
                                          </div>

                                          {/* Notes */}
                                          <div className="md:col-span-12">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-2">
                                              Notes
                                            </label>
                                            <textarea
                                              name="notes"
                                              value={proc.notes || ''}
                                              onChange={(e) => handleProcedureChange(index, e)}
                                              className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                              rows="2"
                                              placeholder="Additional notes for this procedure..."
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
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

                            {/* Footer Action Buttons */}
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
    </Layout>
  );
};

export default AppointmentDetails;