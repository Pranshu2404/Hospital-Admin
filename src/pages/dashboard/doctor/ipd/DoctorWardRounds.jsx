import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStethoscope, FaSave, FaUser, FaBed, FaCapsules, FaMicroscope, FaProcedures, FaXRay, FaSearch, FaTimes, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaNotesMedical } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// --- SearchableFormSelect Component ---
const SearchableFormSelect = ({
  label, value, onChange, options = [], required, className = "", placeholder = "Search...",
  disabled, name, loading = false, type = "text", error = false, onSearch,
  allowCustom = true, freeSolo = false, minSearchChars = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const lastValueRef = useRef(value);

  const normalizedOptions = useMemo(() => {
    return options.map(opt => typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) });
  }, [options]);

  const syncFromValue = useCallback(() => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    if (selected) setSearchTerm(selected.label);
    else setSearchTerm(value || '');
  }, [value, normalizedOptions]);

  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      syncFromValue();
      return;
    }
    if (!isFocused) syncFromValue();
  }, [value, isFocused, syncFromValue]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredOptions(normalizedOptions.slice(0, 20));
      return;
    }
    const filtered = normalizedOptions.map(opt => {
      const haystack = [opt.label, opt.value, opt.name, opt.code].filter(Boolean).join(' ').toLowerCase();
      let score = 0;
      if (opt.label.toLowerCase() === term || opt.value.toLowerCase() === term) score += 100;
      else if (haystack.includes(term)) score += 10;
      return { ...opt, score };
    }).filter(opt => opt.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
    setFilteredOptions(filtered);
  }, [searchTerm, normalizedOptions]);

  useEffect(() => {
    if (onSearch && isFocused) {
      const delay = setTimeout(() => {
        if (searchTerm.trim().length >= minSearchChars) onSearch(searchTerm);
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [searchTerm, isFocused, onSearch, minSearchChars]);

  const emitChange = (val, opt) => {
    lastValueRef.current = val;
    if (onChange) {
      onChange({ target: { name, value: val, _selectedOption: opt } });
    }
  };

  const handleSelect = (opt) => {
    setSearchTerm(opt.label);
    setIsOpen(false);
    emitChange(opt.value, opt);
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    emitChange('', null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const hasExactMatch = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return normalizedOptions.some(opt => opt.label.toLowerCase() === t || opt.value.toLowerCase() === t);
  }, [searchTerm, normalizedOptions]);

  const handleSearchChange = (e) => {
    const next = e.target.value;
    setSearchTerm(next);
    setActiveIndex(0);
    if (next.trim()) setIsOpen(true);
    else { setIsOpen(false); emitChange('', null); }
    if (freeSolo) emitChange(next, null);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setIsOpen(true); setActiveIndex(p => (p < filteredOptions.length - 1 ? p + 1 : p)); break;
      case 'ArrowUp': e.preventDefault(); setActiveIndex(p => (p > 0 ? p - 1 : 0)); break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[activeIndex]) handleSelect(filteredOptions[activeIndex]);
        else if (allowCustom && freeSolo && searchTerm.trim() && !hasExactMatch) {
          emitChange(searchTerm.trim(), null);
          setIsOpen(false);
        }
        break;
      case 'Escape': setIsOpen(false); if (!freeSolo) syncFromValue(); break;
      default: break;
    }
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
    if (type === "radiology") return <FaXRay className="text-purple-500 text-sm" />;
    return <FaSearch className="text-gray-400 text-sm" />;
  };

  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef} type="text" value={searchTerm}
          onFocus={() => { setIsFocused(true); if (!disabled) setIsOpen(true); }}
          onBlur={() => setTimeout(() => { setIsFocused(false); setIsOpen(false); if (!freeSolo) syncFromValue(); }, 150)}
          onChange={handleSearchChange} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={disabled}
          className={`block w-full px-2 py-3 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-200'} text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all pl-10 pr-10`}
          autoComplete="off" spellCheck="false"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">{getIcon()}</div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {!!searchTerm && !disabled && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600"><FaTimes size={14} /></button>
          )}
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>}
        </div>
        {isOpen && (filteredOptions.length > 0 || (allowCustom && freeSolo && searchTerm.trim() && !hasExactMatch)) && (
          <div className="absolute border border-gray-200 z-50 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-60">
            <div className="overflow-y-auto max-h-[240px]">
              {filteredOptions.map((opt, index) => (
                <div key={`${opt.value}-${index}`} onMouseDown={e => e.preventDefault()} onClick={() => handleSelect(opt)} onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${index === activeIndex ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-gray-700'} ${opt.value === value ? 'bg-emerald-100/50 text-emerald-700' : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium">{opt.label}{opt.isCustom && <span className="ml-2 text-xs text-gray-500">(Custom)</span>}</div>
                    {(opt.name || opt.specimen_type || opt.category || opt.base_price || opt.modality) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {opt.name && <span>{opt.name} </span>}
                        {typeof opt.base_price !== 'undefined' && <span>• ₹{opt.base_price || 0} </span>}
                        {opt.specimen_type && <span>• {opt.specimen_type} </span>}
                        {opt.category && <span>• {opt.category}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
const DoctorWardRounds = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [formData, setFormData] = useState({
    patientCondition: 'Stable',
    complaints: '',
    examinationFindings: '',
    diagnosis: '',
    treatmentPlan: '',
    advice: '',
    dischargeSuggested: false,
    nextReviewDate: ''
  });

  // Prescription Data
  const [prescription, setPrescription] = useState({
    items: [],
    lab_test_requests: [],
    radiology_test_requests: [],
    procedure_requests: []
  });

  // Search States
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [labTestOptions, setLabTestOptions] = useState([]);
  const [radiologyOptions, setRadiologyOptions] = useState([]);

  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [loadingRadiology, setLoadingRadiology] = useState(false);

  const [expandedMedicineIndex, setExpandedMedicineIndex] = useState(0);
  const [expandedProcedureIndex, setExpandedProcedureIndex] = useState(0);
  const [expandedLabTestIndex, setExpandedLabTestIndex] = useState(0);
  const [expandedRadiologyIndex, setExpandedRadiologyIndex] = useState(0);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPatientData();
    // Load initial searchable data
    fetchProcedures('');
    fetchLabTests('');
    fetchRadiologyTests('');
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions/${id}`);
      setAdmission(response.data.admission);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch API Data ---
  const fetchMedicines = async (searchTerm = '', dosageForm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;
    setLoadingMedicines(true);
    try {
      const params = { q: searchTerm, limit: 30 };
      if (dosageForm) params.dosage_form = dosageForm;
      const response = await axios.get(`${API_URL}/NLEMmedicines/search`, { params });
      if (response.data.data && response.data.data.medicines) {
        setMedicineOptions(response.data.data.medicines.map(med => ({
          label: med.medicine_name + (med.strength ? ` ${med.strength}` : '') + (med.dosage_form ? ` (${med.dosage_form})` : ''),
          value: med.medicine_name,
          dosage: med.dosage_form,
          strength: med.strength,
          code: med.nlem_code
        })));
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally { setLoadingMedicines(false); }
  };

  const fetchProcedures = async (searchTerm = '') => {
    setLoadingProcedures(true);
    try {
      const response = await axios.get(`${API_URL}/procedures/search`, { params: { q: searchTerm, limit: 20 } });
      if (response.data.data && response.data.data.procedures) {
        setProcedureOptions(response.data.data.procedures.map(proc => ({
          label: proc.code, value: proc.code, name: proc.name, category: proc.category, base_price: proc.base_price
        })));
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally { setLoadingProcedures(false); }
  };

  const fetchLabTests = async (searchTerm = '') => {
    setLoadingLabTests(true);
    try {
      const response = await axios.get(`${API_URL}/labtests/search`, { params: { q: searchTerm, limit: 20 } });
      if (response.data.data && response.data.data.labTests) {
        setLabTestOptions(response.data.data.labTests.map(test => ({
          label: test.code, value: test.code, name: test.name, category: test.category, base_price: test.base_price, specimen_type: test.specimen_type
        })));
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally { setLoadingLabTests(false); }
  };

  const fetchRadiologyTests = async (searchTerm = '') => {
    setLoadingRadiology(true);
    try {
      const params = { limit: 20, active_only: true };
      if (searchTerm && searchTerm.trim().length >= 2) params.search = searchTerm.trim();
      const response = await axios.get(`${API_URL}/radiology/tests`, { params });
      if (response.data && response.data.data) {
        setRadiologyOptions(response.data.data.map(test => ({
          label: `${test.code} - ${test.name}`, value: test.code, name: test.name, category: test.category || 'Other', base_price: test.base_price || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching radiology tests:', error);
    } finally { setLoadingRadiology(false); }
  };

  // --- Helpers for Calculations ---
  const calculateQuantityFromFrequency = (frequency, duration) => {
    const durationDays = parseInt(duration) || 0;
    if (durationDays === 0) return '';
    const frequencyMap = {
      'OD': 1, 'BD': 2, 'TDS': 3, 'QDS': 4, 'q4h': 6, 'q6h': 4, 'q8h': 3, 'q12h': 2, 'PRN': 0, 'SOS': 0, 'Stat': 1
    };
    return frequencyMap[frequency] > 0 ? durationDays * frequencyMap[frequency] : '';
  };

  // --- Add/Remove Handlers ---
  const addItem = (type) => {
    if (type === 'medicine') {
      setPrescription(p => ({ ...p, items: [...p.items, { medicine_name: '', dosage: '', medicine_type: '', route_of_administration: '', duration: '', frequency: '', instructions: '', quantity: '' }] }));
      setExpandedMedicineIndex(prescription.items.length);
    } else if (type === 'lab') {
      setPrescription(p => ({ ...p, lab_test_requests: [...p.lab_test_requests, { lab_test_code: '', lab_test_name: '', notes: '', priority: 'Routine' }] }));
      setExpandedLabTestIndex(prescription.lab_test_requests.length);
    } else if (type === 'rad') {
      setPrescription(p => ({ ...p, radiology_test_requests: [...p.radiology_test_requests, { imaging_test_code: '', imaging_test_name: '', category: '', notes: '', priority: 'Routine' }] }));
      setExpandedRadiologyIndex(prescription.radiology_test_requests.length);
    } else if (type === 'proc') {
      setPrescription(p => ({ ...p, procedure_requests: [...p.procedure_requests, { procedure_code: '', procedure_name: '', notes: '', priority: 'Routine' }] }));
      setExpandedProcedureIndex(prescription.procedure_requests.length);
    }
  };

  const removeItem = (type, index) => {
    const key = type === 'medicine' ? 'items' : type === 'lab' ? 'lab_test_requests' : type === 'rad' ? 'radiology_test_requests' : 'procedure_requests';
    const newList = [...prescription[key]];
    newList.splice(index, 1);
    setPrescription(p => ({ ...p, [key]: newList }));
  };

  // --- Change Handlers ---
  const handleMedicineChange = (index, e) => {
    const { name, value, _selectedOption } = e.target;
    const newItems = [...prescription.items];
    const item = { ...newItems[index], [name]: value };

    if (name === 'medicine_type') {
      item.medicine_name = ''; item.dosage = ''; item.frequency = ''; item.duration = ''; item.quantity = '';
      if (value) fetchMedicines('', value); else setMedicineOptions([]);
    }
    
    if (name === 'medicine_name' && _selectedOption) {
      if (_selectedOption.dosage) item.medicine_type = _selectedOption.dosage;
      if (_selectedOption.strength) item.dosage = _selectedOption.strength;
    }

    if (name === 'frequency' || name === 'duration') {
      const frequency = name === 'frequency' ? value : item.frequency;
      const duration = name === 'duration' ? value : item.duration;
      const qty = calculateQuantityFromFrequency(frequency, parseInt(duration) || 0);
      if (qty) item.quantity = qty.toString();
    }

    newItems[index] = item;
    setPrescription(p => ({ ...p, items: newItems }));
  };

  const handleTestChange = (type, index, e) => {
    const { name, value, _selectedOption } = e.target;
    const key = type === 'lab' ? 'lab_test_requests' : type === 'rad' ? 'radiology_test_requests' : 'procedure_requests';
    const codeKey = type === 'lab' ? 'lab_test_code' : type === 'rad' ? 'imaging_test_code' : 'procedure_code';
    const nameKey = type === 'lab' ? 'lab_test_name' : type === 'rad' ? 'imaging_test_name' : 'procedure_name';

    const newList = [...prescription[key]];
    
    if (name === codeKey) {
      newList[index] = { ...newList[index], [codeKey]: value, [nameKey]: _selectedOption?.name || '' };
      if (type === 'rad' && _selectedOption?.category) newList[index].category = _selectedOption.category;
    } else {
      newList[index][name] = value;
    }
    setPrescription(p => ({ ...p, [key]: newList }));
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Filter out empty entries
      const validMedicines = prescription.items.filter(item => item.medicine_name.trim());
      const validLabs = prescription.lab_test_requests.filter(item => item.lab_test_code.trim());
      const validRads = prescription.radiology_test_requests.filter(item => item.imaging_test_code.trim());
      const validProcs = prescription.procedure_requests.filter(item => item.procedure_code.trim());

      // 1. Create IPD Round
      const roundResponse = await axios.post(`${API_URL}/ipd/rounds`, {
        admissionId: id,
        patientId: admission.patientId._id,
        doctorId: admission.primaryDoctorId._id,
        ...formData,
        nextReviewDate: formData.nextReviewDate ? new Date(formData.nextReviewDate) : null
      });

      const roundId = roundResponse.data.round._id;

      // 2. Create Prescription if there are items
      if (validMedicines.length > 0 || validLabs.length > 0 || validRads.length > 0 || validProcs.length > 0) {
        // Resolve costs / full data for API via same search flow AppointmentDetails does, 
        // or just rely on backend to lookup via code (backend handles it)
        await axios.post(`${API_URL}/prescriptions`, {
          patient_id: admission.patientId._id,
          doctor_id: admission.primaryDoctorId._id,
          ipd_admission_id: id,
          source_type: 'IPD',
          round_id: roundId,
          diagnosis: formData.diagnosis || 'IPD Ward Round',
          items: validMedicines,
          lab_test_requests: validLabs,
          radiology_test_requests: validRads,
          procedure_requests: validProcs
        });
        toast.success('Round and orders saved successfully');
      } else {
        toast.success('Round note saved successfully');
      }
      navigate('/dashboard/doctor/ipd/patients');
    } catch (error) {
      console.error('Error saving round:', error);
      toast.error('Failed to save round note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout sidebarItems={doctorSidebar} section="Doctor"><div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div></Layout>;

  const patient = admission?.patientId;

  // Options
  const freqOptions = ['OD', 'BD', 'TDS', 'QDS', 'SOS', 'Stat'].map(v => ({ value: v, label: v }));
  const durationOptions = Array.from({ length: 15 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} days` }));
  const typeOptions = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Other'].map(v => ({ value: v, label: v }));
  const routeOptions = ['Oral', 'Intramuscular Injection', 'Intravenous Injection', 'Topical Application', 'Other'].map(v => ({ value: v, label: v }));

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="min-h-screen bg-slate-50 p-6 font-sans pb-24">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/doctor/ipd/patients')} className="p-2 bg-white shadow-sm rounded-xl"><FaArrowLeft className="text-slate-500" /></button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-xl"><FaStethoscope className="text-teal-600" size={20} /></div>
              <h1 className="text-2xl font-bold text-slate-800">Ward Round</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">{patient?.first_name} {patient?.last_name} • Bed {admission?.bedId?.bedNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinical Notes Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><FaNotesMedical className="text-teal-500" /> Clinical Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                <input value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition</label>
                <select value={formData.patientCondition} onChange={(e) => setFormData({...formData, patientCondition: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="Stable">Stable</option>
                  <option value="Improving">Improving</option>
                  <option value="Critical">Critical</option>
                  <option value="Deteriorating">Deteriorating</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Complaints / Symptoms</label>
                <textarea value={formData.complaints} onChange={(e) => setFormData({...formData, complaints: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="1" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Examination Findings</label>
                <textarea value={formData.examinationFindings} onChange={(e) => setFormData({...formData, examinationFindings: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Plan / Advice</label>
                <textarea value={formData.advice} onChange={(e) => setFormData({...formData, advice: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" />
              </div>
            </div>
          </div>

          {/* Medicines Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaCapsules className="text-purple-500" /> Prescribe Medicines</h2>
              <button type="button" onClick={() => addItem('medicine')} className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><FaPlus /> Add</button>
            </div>
            <div className="space-y-4">
              {prescription.items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setExpandedMedicineIndex(expandedMedicineIndex === index ? -1 : index)}>
                    <h3 className="font-semibold text-slate-700">Medicine #{index + 1} {item.medicine_name && `- ${item.medicine_name}`}</h3>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('medicine', index); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                      {expandedMedicineIndex === index ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
                    </div>
                  </div>
                  {expandedMedicineIndex === index && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                        <select name="medicine_type" value={item.medicine_type} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl">
                          <option value="">Select</option>{typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="lg:col-span-3">
                        <SearchableFormSelect label="Medicine Name" name="medicine_name" value={item.medicine_name} onChange={(e) => handleMedicineChange(index, e)} options={medicineOptions} onSearch={(q) => fetchMedicines(q, item.medicine_type)} loading={loadingMedicines} type="medicine" allowCustom={true} freeSolo={true} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dosage</label>
                        <input name="dosage" value={item.dosage} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl" placeholder="e.g. 500mg" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Route</label>
                        <select name="route_of_administration" value={item.route_of_administration} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl">
                          <option value="">Select</option>{routeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frequency</label>
                        <select name="frequency" value={item.frequency} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl">
                          <option value="">Select</option>{freqOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration</label>
                        <select name="duration" value={item.duration} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl">
                          <option value="">Select</option>{durationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="lg:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instructions</label>
                        <input name="instructions" value={item.instructions} onChange={(e) => handleMedicineChange(index, e)} className="w-full p-2 bg-white border border-gray-200 rounded-xl" placeholder="e.g. After meals" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {prescription.items.length === 0 && <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">No medicines added</div>}
            </div>
          </div>

          {/* Investigations (Lab & Rad) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab Tests */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaMicroscope className="text-amber-500" /> Lab Tests</h2>
                <button type="button" onClick={() => addItem('lab')} className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><FaPlus /> Add</button>
              </div>
              <div className="space-y-4">
                {prescription.lab_test_requests.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-slate-700">Lab Test</h3>
                      <button type="button" onClick={() => removeItem('lab', index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                    </div>
                    <SearchableFormSelect label="Test Code / Name" name="lab_test_code" value={item.lab_test_code} onChange={(e) => handleTestChange('lab', index, e)} options={labTestOptions} onSearch={fetchLabTests} loading={loadingLabTests} type="labtest" />
                    <input name="notes" value={item.notes} onChange={(e) => handleTestChange('lab', index, e)} placeholder="Notes / Clinical Info" className="w-full mt-2 p-2 bg-white border border-gray-200 rounded-xl text-sm" />
                  </div>
                ))}
                {prescription.lab_test_requests.length === 0 && <div className="text-center py-4 text-slate-400">No lab tests added</div>}
              </div>
            </div>

            {/* Radiology Tests */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaXRay className="text-indigo-500" /> Radiology</h2>
                <button type="button" onClick={() => addItem('rad')} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><FaPlus /> Add</button>
              </div>
              <div className="space-y-4">
                {prescription.radiology_test_requests.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-slate-700">Imaging Test</h3>
                      <button type="button" onClick={() => removeItem('rad', index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                    </div>
                    <SearchableFormSelect label="Test Code / Name" name="imaging_test_code" value={item.imaging_test_code} onChange={(e) => handleTestChange('rad', index, e)} options={radiologyOptions} onSearch={fetchRadiologyTests} loading={loadingRadiology} type="radiology" />
                    <input name="notes" value={item.notes} onChange={(e) => handleTestChange('rad', index, e)} placeholder="Reason for imaging" className="w-full mt-2 p-2 bg-white border border-gray-200 rounded-xl text-sm" />
                  </div>
                ))}
                {prescription.radiology_test_requests.length === 0 && <div className="text-center py-4 text-slate-400">No radiology tests added</div>}
              </div>
            </div>
          </div>

          {/* Procedures */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaProcedures className="text-blue-500" /> Procedures</h2>
              <button type="button" onClick={() => addItem('proc')} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><FaPlus /> Add</button>
            </div>
            <div className="space-y-4">
              {prescription.procedure_requests.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-700">Procedure #{index + 1}</h3>
                    </div>
                    <SearchableFormSelect label="Procedure Code / Name" name="procedure_code" value={item.procedure_code} onChange={(e) => handleTestChange('proc', index, e)} options={procedureOptions} onSearch={fetchProcedures} loading={loadingProcedures} type="procedure" />
                  </div>
                  <div>
                    <div className="flex justify-end mb-2">
                      <button type="button" onClick={() => removeItem('proc', index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                    </div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 mt-1">Notes</label>
                    <input name="notes" value={item.notes} onChange={(e) => handleTestChange('proc', index, e)} placeholder="Procedure notes" className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm" />
                  </div>
                </div>
              ))}
              {prescription.procedure_requests.length === 0 && <div className="text-center py-4 text-slate-400">No procedures added</div>}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors">
                  <input type="checkbox" checked={formData.dischargeSuggested} onChange={(e) => setFormData({...formData, dischargeSuggested: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  <span className="font-medium text-slate-700">Suggest Discharge</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Review Date</label>
                <input type="date" value={formData.nextReviewDate} onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 px-6 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <button type="button" onClick={() => navigate('/dashboard/doctor/ipd/patients')} className="px-5 py-2.5 bg-slate-100 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
              {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <FaSave size={18} />}
              {saving ? 'Saving...' : 'Save Ward Round & Orders'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default DoctorWardRounds;