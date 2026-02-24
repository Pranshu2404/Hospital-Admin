import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaClock,
  FaUser,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaEye,
  FaCalendarAlt,
  FaHeartbeat,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaTimes,
  FaFilePrescription,
  FaEdit,
  FaSave,
  FaCapsules,
  FaStethoscope,
  FaNotesMedical,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaFlask,
  FaProcedures
} from 'react-icons/fa';

// Searchable Form Select Component (same as before)
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

    const searchWords = term.split(/\s+/).filter(word => word.length > 0);
    
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

        let score = 0;
        
        if (haystack.startsWith(term)) {
          score += 100;
        }
        else if (haystack.split(/\s+/).some(word => word.startsWith(term))) {
          score += 50;
        }
        else if (haystack.includes(term)) {
          score += 25;
        }
        
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
      .filter(opt => opt.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
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
    if (type === "labtest") return <FaFlask className="text-amber-500 text-sm" />;
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

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [vitalsEnabled, setVitalsEnabled] = useState(() => {
    const stored = localStorage.getItem('vitalsEnabled');
    return stored === null ? true : stored === 'true';
  });
  const [showWithoutVitals, setShowWithoutVitals] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeDifference, setTimeDifference] = useState({ minutes: 0, isEarly: false });
  const [showEditPrescriptionModal, setShowEditPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [expandedMedicineIndex, setExpandedMedicineIndex] = useState(0);
  const [expandedProcedureIndex, setExpandedProcedureIndex] = useState(0);
  const [expandedLabTestIndex, setExpandedLabTestIndex] = useState(0);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [searchingProcedures, setSearchingProcedures] = useState(false);
  const [labTestOptions, setLabTestOptions] = useState([]);
  const [searchingLabTests, setSearchingLabTests] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

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

  // Duration options (1-30 days)
  const durationOptions = Array.from({ length: 30 }, (_, i) => ({
    value: `${i + 1} days`,
    label: `${i + 1} day${i > 0 ? 's' : ''}`
  }));

  // Route of administration options
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

  const formatStoredTime = (utcTimeString) => {
    if (!utcTimeString) return 'N/A';

    try {
      const date = new Date(utcTimeString);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';

      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  // Parse a UTC time string to Date object
  const parseStoredTime = (utcTimeString) => {
    if (!utcTimeString) return null;

    try {
      const date = new Date(utcTimeString);
      return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    } catch (error) {
      console.error('Error parsing time:', error);
      return null;
    }
  };

  // Check if appointment time is within 15 minutes
  const checkAppointmentTime = (appointment) => {
    const appointmentTime = parseStoredTime(appointment.start_time);
    if (!appointmentTime) return { isValid: true, minutes: 0, isEarly: false };

    const now = new Date();
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));

    return {
      isValid: Math.abs(minutesDiff) <= 15,
      minutes: Math.abs(minutesDiff),
      isEarly: minutesDiff > 0
    };
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          const v = res.data[0].vitalsEnabled !== undefined ? res.data[0].vitalsEnabled : true;
          setVitalsEnabled(v);
          localStorage.setItem('vitalsEnabled', v);
        }
      } catch (err) {
        console.error("Error fetching hospital settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

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

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`);
      const allAppointments = response.data.appointments || response.data || [];

      const myAppointments = allAppointments.filter(appt => {
        const dId = appt.doctor_id?._id || appt.doctor_id;
        return dId === doctorId;
      });

      myAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

      setAppointments(myAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    }
  };

  const fetchPrescription = async (appointmentId) => {
    setLoadingPrescription(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions?appointment_id=${appointmentId}`);
      const prescriptions = response.data.prescriptions || response.data;
      
      if (prescriptions && prescriptions.length > 0) {
        const prescription = prescriptions[0];
        setSelectedPrescription(prescription);
        
        // Initialize form data from prescription
        setPrescriptionData({
          diagnosis: prescription.diagnosis || '',
          notes: prescription.notes || '',
          investigation: prescription.investigation || '',
          presenting_complaint: prescription.presenting_complaint || '',
          history_of_presenting_complaint: prescription.history_of_presenting_complaint || '',
          recommendedProcedures: prescription.recommendedProcedures?.length > 0 
            ? prescription.recommendedProcedures 
            : [{ procedure_code: '', procedure_name: '', notes: '' }],
          recommendedLabTests: prescription.recommendedLabTests?.length > 0 
            ? prescription.recommendedLabTests 
            : [{ lab_test_code: '', lab_test_name: '', notes: '', fasting_required: false, specimen_type: '' }],
          items: prescription.items?.length > 0 
            ? prescription.items 
            : [{
                medicine_name: '',
                dosage: '',
                medicine_type: '',
                route_of_administration: '',
                duration: '',
                frequency: '',
                instructions: '',
                quantity: ''
              }],
          prescriptionImage: prescription.prescription_image || null
        });
        
        setShowEditPrescriptionModal(true);
      } else {
        alert('No prescription found for this appointment');
      }
    } catch (err) {
      console.error('Error fetching prescription:', err);
      alert('Failed to load prescription');
    } finally {
      setLoadingPrescription(false);
    }
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

  const handlePrescriptionInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    const newIndex = prescriptionData.items.length;
    setPrescriptionData(prev => ({
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
    if (prescriptionData.items.length <= 1) return;
    const newItems = [...prescriptionData.items];
    newItems.splice(index, 1);
    setPrescriptionData(prev => ({ ...prev, items: newItems }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newItems = [...prescriptionData.items];
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
        setPrescriptionData(prev => ({ ...prev, items: newItems }));
        return;
      }

      if (_selectedOption) {
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
    setPrescriptionData(prev => ({ ...prev, items: newItems }));
  };

  const addProcedure = () => {
    const newIndex = prescriptionData.recommendedProcedures.length;
    setPrescriptionData(prev => ({
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
    const newProcedures = [...prescriptionData.recommendedProcedures];
    newProcedures.splice(index, 1);
    setPrescriptionData(prev => ({ ...prev, recommendedProcedures: newProcedures }));
  };

  const handleProcedureChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newProcedures = [...prescriptionData.recommendedProcedures];

    if (name === 'procedure_code') {
      if (!value) {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: '',
          procedure_name: '',
          notes: newProcedures[index].notes || ''
        };
      } else if (_selectedOption) {
        newProcedures[index] = {
          ...newProcedures[index],
          procedure_code: value,
          procedure_name: _selectedOption.name || '',
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

    setPrescriptionData(prev => ({ ...prev, recommendedProcedures: newProcedures }));
  };

  const addLabTest = () => {
    const newIndex = prescriptionData.recommendedLabTests.length;
    setPrescriptionData(prev => ({
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
    const newLabTests = [...prescriptionData.recommendedLabTests];
    newLabTests.splice(index, 1);
    setPrescriptionData(prev => ({ ...prev, recommendedLabTests: newLabTests }));
  };

  const handleLabTestChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newLabTests = [...prescriptionData.recommendedLabTests];

    if (name === 'lab_test_code') {
      if (!value) {
        newLabTests[index] = {
          ...newLabTests[index],
          lab_test_code: '',
          lab_test_name: '',
          notes: newLabTests[index].notes || ''
        };
      } else if (_selectedOption) {
        newLabTests[index] = {
          ...newLabTests[index],
          lab_test_code: value,
          lab_test_name: _selectedOption.name || '',
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

    setPrescriptionData(prev => ({ ...prev, recommendedLabTests: newLabTests }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescriptionData(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setPrescriptionData(prev => ({ ...prev, prescriptionImage: null }));
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setSavingPrescription(true);

    try {
      const validItems = prescriptionData.items.filter(item =>
        item.medicine_name.trim() && item.dosage.trim()
      );

      if (validItems.length === 0) {
        alert('At least one valid medicine is required');
        setSavingPrescription(false);
        return;
      }

      const updateData = {
        diagnosis: prescriptionData.diagnosis,
        notes: prescriptionData.notes,
        investigation: prescriptionData.investigation,
        presenting_complaint: prescriptionData.presenting_complaint,
        history_of_presenting_complaint: prescriptionData.history_of_presenting_complaint,
        recommendedProcedures: prescriptionData.recommendedProcedures.filter(p => p.procedure_code && p.procedure_name),
        recommendedLabTests: prescriptionData.recommendedLabTests.filter(t => t.lab_test_code && t.lab_test_name),
        items: validItems,
        prescription_image: prescriptionData.prescriptionImage
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/${selectedPrescription._id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      alert('Prescription updated successfully!');
      setShowEditPrescriptionModal(false);
      setSelectedPrescription(null);
      setPrescriptionData(null);
      
      // Refresh appointments to show updated data
      fetchAppointments();
    } catch (err) {
      console.error('Error updating prescription:', err);
      alert('Failed to update prescription. Please try again.');
    } finally {
      setSavingPrescription(false);
    }
  };

  const hasVitals = (appointment) => {
    if (!vitalsEnabled) return true;
    if (appointment.vitals) {
      const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature',
        'respiratory_rate', 'random_blood_sugar', 'height'];

      return vitalFields.some(field => {
        const value = appointment.vitals[field];
        return value !== undefined && value !== null && value !== '' && value.trim() !== '';
      });
    }

    if (appointment.vitals_id) {
      const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature',
        'respiratory_rate', 'random_blood_sugar', 'height'];

      return vitalFields.some(field => {
        const value = appointment.vitals_id?.[field];
        return value !== undefined && value !== null && value !== '' && value.trim() !== '';
      });
    }

    return false;
  };

  // Calculate statistics
  const appointmentsWithVitals = appointments.filter(appt => hasVitals(appt)).length;
  const appointmentsWithoutVitals = appointments.length - appointmentsWithVitals;

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;

    const appointmentHasVitals = hasVitals(appt);

    let meetsVitalsRequirement;
    if (!vitalsEnabled) {
      meetsVitalsRequirement = true;
    } else if (showWithoutVitals) {
      meetsVitalsRequirement = true;
    } else {
      meetsVitalsRequirement = appointmentHasVitals;
    }

    return matchesSearch && matchesStatus && meetsVitalsRequirement;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleViewDetails = (appointment) => {
    navigate(`/dashboard/doctor/appointments/${appointment._id}`, {
      state: { appointment }
    });
  };

  const handleEditPrescription = (appointment) => {
    fetchPrescription(appointment._id);
  };

  const handleStartClick = (appointment) => {
    const appointmentHasVitals = hasVitals(appointment);
    if (vitalsEnabled && !appointmentHasVitals) {
      alert('Please record vitals before starting the appointment.');
      return;
    }

    const timeCheck = checkAppointmentTime(appointment);

    if (!timeCheck.isValid) {
      setSelectedAppointment(appointment);
      setTimeDifference({
        minutes: timeCheck.minutes,
        isEarly: timeCheck.isEarly
      });
      setShowTimeWarning(true);
    } else {
      startAppointment(appointment);
    }
  };

  const startAppointment = async (appointment) => {
    const appointmentId = appointment._id || appointment;
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        status: 'In Progress'
      });
      const updatedAppointment = { ...appointment, status: 'In Progress' };
      navigate(`/dashboard/doctor/appointments/${appointmentId}`, {
        state: { appointment: updatedAppointment }
      });
    } catch (err) {
      console.error('Error starting appointment:', err);
      alert("Failed to start appointment. Please check console.");
    }
  };

  const handleConfirmStart = () => {
    if (selectedAppointment) {
      startAppointment(selectedAppointment);
    }
    setShowTimeWarning(false);
    setSelectedAppointment(null);
  };

  const handleCancelStart = () => {
    setShowTimeWarning(false);
    setSelectedAppointment(null);
  };

  // Custom Modal Component
  const TimeWarningModal = () => {
    if (!showTimeWarning) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancelStart}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center text-amber-600">
                <FaExclamationCircle className="mr-3 text-xl" />
                <span className="font-semibold text-lg">Time Check Required</span>
              </div>
              <button
                onClick={handleCancelStart}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                  <FaClock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {timeDifference.isEarly ? 'Starting Early' : 'Starting Late'}
                </h3>
                <p className="text-gray-600 mb-4">
                  This appointment is scheduled for{' '}
                  <span className="font-semibold">
                    {selectedAppointment && formatStoredTime(selectedAppointment.start_time)}
                  </span>
                </p>
                <div className={`text-2xl font-bold mb-4 ${timeDifference.isEarly ? 'text-blue-600' : 'text-red-600'}`}>
                  {timeDifference.isEarly
                    ? `${timeDifference.minutes} minutes early`
                    : `${timeDifference.minutes} minutes late`
                  }
                </div>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to start this appointment now?
                  <br />
                  <span className="text-amber-600 font-medium">
                    Recommended: Start within 15 minutes of scheduled time
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 space-x-3">
              <button
                onClick={handleCancelStart}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors ${timeDifference.isEarly
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Start Appointment Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Prescription Modal
  const EditPrescriptionModal = () => {
    if (!showEditPrescriptionModal || !prescriptionData) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setShowEditPrescriptionModal(false)}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaFilePrescription className="text-teal-600" />
                <h3 className="text-xl font-bold text-gray-800">Edit Prescription</h3>
              </div>
              <button
                onClick={() => setShowEditPrescriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-6">
              {/* Presenting Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presenting Complaint
                </label>
                <textarea
                  name="presenting_complaint"
                  value={prescriptionData.presenting_complaint}
                  onChange={handlePrescriptionInputChange}
                  placeholder="Chief complaint or main reason for visit..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              {/* History of Presenting Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  History of Presenting Complaint
                </label>
                <textarea
                  name="history_of_presenting_complaint"
                  value={prescriptionData.history_of_presenting_complaint}
                  onChange={handlePrescriptionInputChange}
                  placeholder="Detailed history of the presenting complaint..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  name="notes"
                  value={prescriptionData.notes}
                  onChange={handlePrescriptionInputChange}
                  placeholder="Any additional observations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis / Provisional Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  value={prescriptionData.diagnosis}
                  onChange={handlePrescriptionInputChange}
                  placeholder="e.g. Acute Viral Fever"
                  required
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

                {prescriptionData.recommendedProcedures.map((proc, index) => {
                  const isExpanded = expandedProcedureIndex === index;
                  const isFilled = proc.procedure_code && proc.procedure_name;

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border transition-all mb-3 ${
                        isExpanded
                          ? 'border-blue-200 bg-blue-50 shadow-md'
                          : 'border-blue-100 bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedProcedureIndex(isExpanded ? -1 : index)}
                          className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-blue-100 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
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
                        {!isExpanded && prescriptionData.recommendedProcedures.length > 0 && (
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
                            <button
                              type="button"
                              onClick={() => removeProcedure(index)}
                              className="text-blue-400 hover:text-red-500 transition-colors ml-auto"
                            >
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
                                  readOnly
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

                {prescriptionData.recommendedLabTests.map((test, index) => {
                  const isExpanded = expandedLabTestIndex === index;
                  const isFilled = test.lab_test_code && test.lab_test_name;

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border transition-all mb-3 ${
                        isExpanded
                          ? 'border-amber-200 bg-amber-50 shadow-md'
                          : 'border-amber-100 bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedLabTestIndex(isExpanded ? -1 : index)}
                          className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-amber-100 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isExpanded ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'
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
                        {!isExpanded && prescriptionData.recommendedLabTests.length > 0 && (
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
                            <button
                              type="button"
                              onClick={() => removeLabTest(index)}
                              className="text-amber-400 hover:text-red-500 transition-colors ml-auto"
                            >
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
                                  readOnly
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
                                  readOnly
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
                  {prescriptionData.items.map((item, index) => {
                    const isExpanded = expandedMedicineIndex === index;
                    const isFilled = item.medicine_name && item.dosage && item.frequency;

                    return (
                      <div
                        key={index}
                        className={`rounded-lg border transition-all ${
                          isExpanded
                            ? 'border-teal-200 bg-teal-50 shadow-md'
                            : 'border-teal-100 bg-teal-50 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedMedicineIndex(isExpanded ? -1 : index)}
                            className="flex-1 px-4 py-2 flex justify-between items-center hover:bg-teal-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isExpanded ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-600'
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
                          {!isExpanded && prescriptionData.items.length > 1 && (
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
                              <button
                                type="button"
                                onClick={() => removeMedicine(index)}
                                className="text-slate-400 hover:text-red-500 transition-colors ml-auto"
                              >
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
                                    required
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
                                  required
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
                                  required
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
                                    readOnly
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
                {!prescriptionData.prescriptionImage ? (
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
                      src={prescriptionData.prescriptionImage}
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

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditPrescriptionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrescription}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPrescription ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- UI HELPER COMPONENTS ---

  const StatusBadge = ({ status }) => {
    const styles = {
      'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const VitalsIndicator = ({ appointment }) => {
    const hasVitalsData = hasVitals(appointment);

    if (!vitalsEnabled) {
      return null;
    }

    return (
      <div className="flex items-center mt-1">
        {hasVitalsData ? (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
            <FaHeartbeat className="mr-1 h-2 w-2" />
            Vitals Recorded
          </span>
        ) : (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center">
            <FaExclamationTriangle className="mr-1 h-2 w-2" />
            Needs Vitals
          </span>
        )}
      </div>
    );
  };

  const TimeIndicator = ({ appointment }) => {
    const timeCheck = checkAppointmentTime(appointment);

    if (appointment.status !== 'Scheduled' || timeCheck.isValid) {
      return null;
    }

    const appointmentTime = parseStoredTime(appointment.start_time);
    if (!appointmentTime) return null;

    const now = new Date();
    const isPast = appointmentTime < now;
    const timeDiff = Math.abs(appointmentTime.getTime() - now.getTime());
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(minutesDiff / 60);
    const remainingMinutes = minutesDiff % 60;

    let timeText = '';
    if (hoursDiff > 0) {
      timeText = `${hoursDiff}h ${remainingMinutes}m`;
    } else {
      timeText = `${minutesDiff}m`;
    }

    return (
      <div className="flex items-center mt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${isPast
            ? 'bg-red-50 text-red-600'
            : 'bg-blue-50 text-blue-600'
          }`}>
          <FaExclamationCircle className="mr-1 h-2 w-2" />
          {isPast ? `Started ${timeText} ago` : `Starts in ${timeText}`}
        </span>
      </div>
    );
  };

  const TabButton = ({ label, value, current, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`pb-3 px-4 text-sm font-medium transition-colors relative ${current === value
        ? 'text-teal-600'
        : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {label}
      {current === value && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-2 font-sans">
      {/* Custom Time Warning Modal */}
      <TimeWarningModal />
      
      {/* Edit Prescription Modal */}
      <EditPrescriptionModal />

      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your patient schedule and consultations</p>
            {vitalsEnabled && (
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-gray-600">
                  Total: <span className="font-semibold">{appointments.length}</span> appointments
                </span>
                <span className="text-emerald-600">
                  With vitals: <span className="font-semibold">{appointmentsWithVitals}</span>
                </span>
                <span className="text-amber-600">
                  Without vitals: <span className="font-semibold">{appointmentsWithoutVitals}</span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {vitalsEnabled && (
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWithoutVitals}
                    onChange={(e) => setShowWithoutVitals(e.target.checked)}
                    className="mr-2 h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Show without vitals</span>
                </label>
              </div>
            )}
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <FaClock className="text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Controls Toolbar */}
          <div className="p-5 border-b border-gray-100 space-y-4">

            {/* Tabs Row */}
            <div className="flex items-center space-x-1 border-b border-gray-100 overflow-x-auto no-scrollbar">
              <TabButton label="All" value="all" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="Scheduled" value="Scheduled" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="In Progress" value="In Progress" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="Completed" value="Completed" current={filterStatus} onClick={setFilterStatus} />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <span className="hidden sm:inline">Show:</span>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10 rows</option>
                    <option value={20}>20 rows</option>
                    <option value={50}>50 rows</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appt) => {
                    const patientName = `${appt.patient_id?.first_name || 'Unknown'} ${appt.patient_id?.last_name || ''}`;
                    const apptDate = new Date(appt.appointment_date);
                    const hasVitalsData = hasVitals(appt);
                    const isScheduled = appt.status === 'Scheduled';
                    const isCompleted = appt.status === 'Completed';
                    const timeCheck = checkAppointmentTime(appt);

                    return (
                      <tr
                        key={appt._id}
                        className={`hover:bg-gray-50/80 transition-colors group ${vitalsEnabled && !hasVitalsData ? 'bg-amber-50/30' : ''
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {appt.patient_id?.patient_image ? (
                              <img
                                src={appt.patient_id.patient_image}
                                alt={patientName}
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                                {patientName.charAt(0)}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patientName}</div>
                              <div className="text-xs text-gray-500">
                                {appt.patient_id?.gender || 'N/A'}, {appt.patient_id?.dob ?
                                  `${new Date().getFullYear() - new Date(appt.patient_id.dob).getFullYear()} yrs` : 'Age N/A'}
                              </div>
                              <VitalsIndicator appointment={appt} />
                              <TimeIndicator appointment={appt} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 h-3 w-3" />
                            {apptDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-5">
                            {formatStoredTime(appt.start_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700 capitalize bg-gray-100 px-2 py-1 rounded">
                              {appt.appointment_type || appt.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {appt.priority || 'Normal'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex items-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {isScheduled && (
                              <button
                                onClick={() => handleStartClick(appt)}
                                className={`flex items-center px-3 py-1.5 rounded-md transition-colors shadow-sm text-xs font-semibold tracking-wide ${vitalsEnabled && !hasVitalsData
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-not-allowed'
                                    : !timeCheck.isValid
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-teal-600 text-white hover:bg-teal-700'
                                  }`}
                                title={
                                  vitalsEnabled && !hasVitalsData ? "Vitals required before starting" :
                                    !timeCheck.isValid ? `Appointment ${timeCheck.isEarly ? 'starts' : 'started'} ${timeCheck.minutes} minutes ${timeCheck.isEarly ? 'later' : 'ago'}` :
                                      "Start appointment"
                                }
                              >
                                <FaPlay className="mr-1.5 h-2.5 w-2.5" />
                                {vitalsEnabled && !hasVitalsData ? 'NEEDS VITALS' :
                                  !timeCheck.isValid ? 'START' : 'START'}
                              </button>
                            )}
                            {isCompleted && (
                              <button
                                onClick={() => handleEditPrescription(appt)}
                                className="flex items-center px-3 py-1.5 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors shadow-sm text-xs font-semibold tracking-wide"
                                title="Edit Prescription"
                              >
                                <FaEdit className="mr-1.5 h-2.5 w-2.5" />
                                EDIT PRESCRIPTION
                              </button>
                            )}
                            {(appt.status === "In Progress" || appt.status === "Completed") && (
                              <button
                                onClick={() => handleViewDetails(appt)}
                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaUser className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">No appointments found</p>
                        <p className="text-sm">
                          {vitalsEnabled && !showWithoutVitals
                            ? "Try enabling 'Show without vitals' or adjust your search"
                            : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> of <span className="font-medium">{filteredAppointments.length}</span> results
              {vitalsEnabled && (
                <span className="ml-2">
                  • <span className="text-emerald-600">{appointmentsWithVitals} with vitals</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${currentPage === i + 1
                      ? 'bg-teal-600 text-white shadow-sm font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;