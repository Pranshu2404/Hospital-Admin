import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaMinus, 
  FaSearch, 
  FaShoppingCart,
  FaSave,
  FaTimes,
  FaMinusCircle,
  FaBuilding,
  FaPills,
  FaUser,
  FaBox
} from 'react-icons/fa';

// Searchable Form Select Component
const SearchableFormSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required, 
  className = "", 
  placeholder = "Search...",
  disabled,
  error,
  icon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);

  // Normalize options
  const normalizedOptions = useMemo(() => {
    return options.map(opt => 
      typeof opt === 'object' ? opt : { value: String(opt), label: String(opt) }
    );
  }, [options]);

  // Filter and sort options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return normalizedOptions;
    const lowerSearch = searchTerm.toLowerCase();
    
    return normalizedOptions
      .filter(opt => opt.label.toLowerCase().includes(lowerSearch))
      .sort((a, b) => {
        const aStarts = a.label.toLowerCase().startsWith(lowerSearch);
        const bStarts = b.label.toLowerCase().startsWith(lowerSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
  }, [searchTerm, normalizedOptions]);

  // Sync search term when value changes externally
  useEffect(() => {
    const selected = normalizedOptions.find(opt => opt.value === value);
    if (selected) setSearchTerm(selected.label);
    else if (!value) setSearchTerm('');
  }, [value, normalizedOptions]);

  const handleKeyDown = (e) => {
    e.stopPropagation();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
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
        name: label.toLowerCase().replace(/\s/g, ''),
        value: opt.value
      },
      stopPropagation: () => {},
      preventDefault: () => {}
    };
    
    onChange(syntheticEvent);
    setSearchTerm(opt.label);
    setIsOpen(false);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
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
                target: {
                  name: label.toLowerCase().replace(/\s/g, ''),
                  value: ''
                },
                stopPropagation: () => {},
                preventDefault: () => {}
              };
              onChange(syntheticEvent);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-2 border ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
          } rounded-lg focus:outline-none focus:ring-2 ${
            icon ? 'pl-10' : ''
          }`}
        />

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {filteredOptions.map((opt, index) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  index === activeIndex ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                } ${opt.value === value ? 'bg-teal-100 font-medium' : ''}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchSuppliers();
    fetchMedicines();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.get('/suppliers?isActive=true');
      setSuppliers(response.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await apiClient.get('/medicines');
      console.log('Fetched medicines:', response.data);
      setMedicines(response.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        medicine_id: '',
        quantity: 1,
        unit_cost: 0,
        total_cost: 0,
        batch_number: '',
        expiry_date: ''
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_cost);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/orders/purchase-orders', {
        ...formData,
        total_amount: calculateTotal(),
        user_id: 'currentUserId' // Replace with actual user ID from auth context or state
      });
      console.log('Purchase order created:', response.data);
      alert('Purchase order created successfully!');
      navigate('/dashboard/pharmacy/orders');
    } catch (err) {
      alert('Failed to create purchase order');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare supplier options for searchable select
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier._id,
    label: `${supplier.name} - ${supplier.contactPerson || supplier.email}`
  }));

  // Prepare medicine options for searchable select
  const medicineOptions = medicines.map(medicine => ({
    value: medicine._id,
    label: `${medicine.name} (${medicine.strength || 'N/A'}) - ${medicine.category || 'N/A'}`
  }));

  // Handle supplier change
  const handleSupplierChange = (e) => {
    setFormData(prev => ({ ...prev, supplier_id: e.target.value }));
  };

  // Handle medicine change for a specific item
  const handleMedicineChange = (index, e) => {
    updateItem(index, 'medicine_id', e.target.value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-teal-600" />
            Create Purchase Order
          </h1>
          <p className="text-gray-600">Create a new purchase order for your pharmacy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-6">
        {/* Supplier Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableFormSelect
            label="Supplier"
            value={formData.supplier_id}
            onChange={handleSupplierChange}
            options={supplierOptions}
            required
            placeholder="Search suppliers by name, contact..."
            icon={<FaBuilding className="text-gray-400" />}
            error={!formData.supplier_id && formData.items.length > 0 ? "Please select a supplier" : ""}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expected_delivery}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus /> Add Item
            </button>
          </div>

          {formData.items.map((item, index) => {
            // Find selected medicine details for display
            const selectedMedicine = medicines.find(m => m._id === item.medicine_id);
            
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="md:col-span-2">
                  <SearchableFormSelect
                    label={`Medicine #${index + 1}`}
                    value={item.medicine_id}
                    onChange={(e) => handleMedicineChange(index, e)}
                    options={medicineOptions}
                    required
                    placeholder="Search medicines..."
                    icon={<FaPills className="text-gray-400" />}
                  />
                  
                  {/* Display additional medicine info when selected */}
                  {selectedMedicine && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      {selectedMedicine.category && (
                        <p><span className="font-medium">Category:</span> {selectedMedicine.category}</p>
                      )}
                      {selectedMedicine.manufacturer && (
                        <p><span className="font-medium">Manufacturer:</span> {selectedMedicine.manufacturer}</p>
                      )}
                      {selectedMedicine.package_size && (
                        <p><span className="font-medium">Package:</span> {selectedMedicine.package_size}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={(item.quantity * item.unit_cost).toFixed(2)}
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  />
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <FaMinusCircle size={20} />
                  </button>
                </div>
              </div>
            );
          })}

          {formData.items.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <FaBox className="mx-auto text-gray-400 text-4xl mb-3" />
              <p className="text-gray-500 font-medium">No items added yet</p>
              <p className="text-gray-400 text-sm mt-1">Start adding medicines to create your purchase order</p>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 mx-auto"
              >
                <FaPlus className="text-sm" /> Add your first item
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            placeholder="Any special instructions or notes for this order..."
          />
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-teal-600">
              ₹{calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading || formData.items.length === 0 || !formData.supplier_id}
            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaSave /> {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/orders')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;