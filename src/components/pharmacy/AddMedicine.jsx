import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaBox, 
  FaTag, 
  FaBuilding, 
  FaBarcode,
  FaRupeeSign,
  FaWeight,
  FaCalendar,
  FaInfoCircle,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

// Searchable Medicine Select Component
const SearchableMedicineSelect = ({ 
  value, 
  onChange, 
  onMedicineSelect,
  placeholder = "Search NLEM medicines...",
  disabled = false,
  error = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef(null);
  const searchTimeout = useRef(null);

  // Find selected medicine
  const selectedMedicine = useMemo(() => {
    return medicineOptions.find(opt => opt.value === value);
  }, [value, medicineOptions]);

  // Update search term when value changes externally
  useEffect(() => {
    if (selectedMedicine) {
      setSearchTerm(selectedMedicine.label);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, selectedMedicine]);

  // Search medicines API call
  const fetchMedicines = async (searchTerm = '') => {
    if (searchTerm.length < 2 && searchTerm !== '') return;

    setSearching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/NLEMmedicines/search`, {
        params: { q: searchTerm, limit: 20 }
      });

      if (response.data.data && response.data.data.medicines) {
        const medicineOpts = response.data.data.medicines.map(med => ({
          label: med.medicine_name,               // ✅ keep clean
          value: med.medicine_name,               // ✅ same as label
          dosage: med.dosage_form,                // used for autofill mapping
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
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        fetchMedicines(searchTerm);
      }, 300);
    } else if (searchTerm === '') {
      setMedicineOptions([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    e.stopPropagation();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev < medicineOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && medicineOptions[activeIndex]) {
        handleSelect(medicineOptions[activeIndex]);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (opt) => {
    const syntheticEvent = {
      target: {
        value: opt.value
      },
      stopPropagation: () => {},
      preventDefault: () => {}
    };
    
    onChange(syntheticEvent);
    
    // Pass the full medicine data to parent for autofill
    if (onMedicineSelect) {
      onMedicineSelect(opt);
    }
    
    setSearchTerm(opt.label);
    setIsOpen(false);
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

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <FaSearch />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setActiveIndex(0);
            setIsOpen(true);
            
            if (value && e.target.value !== searchTerm) {
              const syntheticEvent = {
                target: { value: '' },
                stopPropagation: () => {},
                preventDefault: () => {}
              };
              onChange(syntheticEvent);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 p-2 border ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
          } rounded-lg focus:outline-none focus:ring-2`}
        />

        {searching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          </div>
        )}

        {searchTerm && !searching && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setMedicineOptions([]);
              const syntheticEvent = {
                target: { value: '' },
                stopPropagation: () => {},
                preventDefault: () => {}
              };
              onChange(syntheticEvent);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && medicineOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {medicineOptions.map((opt, index) => (
            <div
              key={`${opt.value}-${index}`}
              onClick={() => handleSelect(opt)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                index === activeIndex ? 'bg-teal-50' : 'hover:bg-gray-50'
              } ${opt.value === value ? 'bg-teal-100 font-medium' : ''}`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {opt.strength && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                      {opt.strength}
                    </span>
                  )}
                  {opt.dosage && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                      {opt.dosage}
                    </span>
                  )}
                  {opt.category && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                      {opt.category}
                    </span>
                  )}
                </div>
                {opt.code && (
                  <span className="text-xs text-gray-500 mt-1">NLEM Code: {opt.code}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && searchTerm.length >= 2 && medicineOptions.length === 0 && !searching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center">
          <p className="text-gray-500 text-sm">No medicines found</p>
          <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

// FormField component
const FormField = ({ label, icon, children, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      <div className="flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>
    </label>
    {children}
  </div>
);

const AddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand: '',
    category: '',
    dosage_form: '',
    strength: '',
    description: '',
    price_per_unit: '',
    cost_price: '',
    min_stock_level: 10,
    prescription_required: false,
    tax_rate: 0,
    location: {
      shelf: '',
      rack: ''
    },
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes] = await Promise.all([
          apiClient.get('/suppliers')
        ]);
        setSuppliers(suppliersRes.data);
        
        // Predefined categories based on schema
        setCategories([
          'Tablet', 'Capsule', 'Syrup', 'Injection', 
          'Ointment', 'Drops', 'Inhaler', 'Other'
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  // Handle medicine selection from NLEM
  const handleMedicineSelect = (selectedMedicine) => {
    // Autofill form fields with selected medicine data
    setFormData(prev => ({
      ...prev,
      name: selectedMedicine.label || prev.name,
      generic_name: selectedMedicine.label || prev.generic_name, // You might want to map this differently
      strength: selectedMedicine.strength || prev.strength,
      dosage_form: selectedMedicine.dosage || prev.dosage_form,
      category: selectedMedicine.category || prev.category
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        min_stock_level: parseInt(formData.min_stock_level),
        tax_rate: parseFloat(formData.tax_rate)
      };

      const response = await apiClient.post('/medicines', payload);
      
      if (response.status === 201) {
        alert('Medicine added successfully!');
        navigate('/dashboard/pharmacy/medicine-list');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPlus className="text-teal-600" />
          Add New Medicine
        </h1>
        <p className="text-gray-600">Add a new medicine to your pharmacy inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* NLEM Medicine Search */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-4">
          <h3 className="text-sm font-semibold text-teal-800 mb-2 flex items-center gap-2">
            <FaSearch /> Search NLEM Medicines
          </h3>
          <p className="text-xs text-teal-600 mb-3">
            Start typing to search from National List of Essential Medicines (NLEM). Selected medicine details will auto-fill below.
          </p>
          <SearchableMedicineSelect
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onMedicineSelect={handleMedicineSelect}
            placeholder="Search by medicine name (min 2 characters)..."
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Medicine Name" icon={<FaBox className="text-gray-400" />} required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter medicine name"
            />
          </FormField>

          <FormField label="Generic Name" icon={<FaTag className="text-gray-400" />}>
            <input
              type="text"
              value={formData.generic_name}
              onChange={(e) => handleInputChange('generic_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter generic name"
            />
          </FormField>

          <FormField label="Brand" icon={<FaBuilding className="text-gray-400" />}>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Enter brand name"
            />
          </FormField>

          <FormField label="Category" icon={<FaTag className="text-gray-400" />} required>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Strength" icon={<FaWeight className="text-gray-400" />}>
            <input
              type="text"
              value={formData.strength}
              onChange={(e) => handleInputChange('strength', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., 500mg, 10ml"
            />
          </FormField>

          <FormField label="Minimum Stock Level" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              type="number"
              min="1"
              value={formData.min_stock_level}
              onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </FormField>

          {/* <FormField label="Selling Price (₹)" icon={<FaRupeeSign className="text-gray-400" />} required>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.price_per_unit}
              onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Cost Price (₹)" icon={<FaRupeeSign className="text-gray-400" />}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost_price}
              onChange={(e) => handleInputChange('cost_price', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Tax Rate (%)" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.tax_rate}
              onChange={(e) => handleInputChange('tax_rate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="0.0"
            />
          </FormField> */}
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Shelf Location" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              type="text"
              value={formData.location.shelf}
              onChange={(e) => handleInputChange('location.shelf', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., A1, B2"
            />
          </FormField>

          <FormField label="Rack Number" icon={<FaInfoCircle className="text-gray-400" />}>
            <input
              type="text"
              value={formData.location.rack}
              onChange={(e) => handleInputChange('location.rack', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Rack 1, Rack 2"
            />
          </FormField>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Prescription Required" icon={<FaInfoCircle className="text-gray-400" />}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.prescription_required}
                onChange={(e) => handleInputChange('prescription_required', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Requires prescription</span>
            </label>
          </FormField>

          <FormField label="Status" icon={<FaInfoCircle className="text-gray-400" />}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" icon={<FaInfoCircle className="text-gray-400" />}>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Enter medicine description, usage instructions, etc."
          />
        </FormField>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Medicine'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/medicine-list')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;