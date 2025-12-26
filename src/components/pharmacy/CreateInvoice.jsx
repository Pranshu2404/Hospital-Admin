import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaFileInvoice, 
  FaSearch, 
  FaPlus, 
  FaMinus,
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaSave,
  FaTimes,
  FaBox,
  FaStethoscope
} from 'react-icons/fa';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    customer_type: 'Walk-in',
    patient_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    invoice_type: 'Pharmacy',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_items: [],
    medicine_items: [],
    discount: 0,
    tax: 0,
    notes: '',
    terms_and_conditions: 'Payment due within 7 days. Late payments may incur fees.'
  });

  const customerId = searchParams.get('customer');

  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
    fetchServices();
    
    if (customerId) {
      fetchCustomerDetails(customerId);
    }
  }, [customerId]);

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/api/customers?is_active=true');
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await apiClient.get('/api/medicines?is_active=true&stock_quantity[gt]=0');
      setMedicines(response.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/api/services?is_active=true');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      const customer = response.data.customer;
      
      setFormData(prev => ({
        ...prev,
        customer_type: customer.customer_type,
        patient_id: customer.patient_id?._id || '',
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address || ''
      }));
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  const addServiceItem = () => {
    setFormData(prev => ({
      ...prev,
      service_items: [...prev.service_items, {
        description: '',
        quantity: 1,
        unit_price: 0,
        service_type: 'Consultation'
      }]
    }));
  };

  const addMedicineItem = () => {
    setFormData(prev => ({
      ...prev,
      medicine_items: [...prev.medicine_items, {
        medicine_id: '',
        medicine_name: '',
        quantity: 1,
        unit_price: 0,
        batch_number: '',
        expiry_date: ''
      }]
    }));
  };

  const removeServiceItem = (index) => {
    setFormData(prev => ({
      ...prev,
      service_items: prev.service_items.filter((_, i) => i !== index)
    }));
  };

  const removeMedicineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      medicine_items: prev.medicine_items.filter((_, i) => i !== index)
    }));
  };

  const updateServiceItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      service_items: prev.service_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateMedicineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicine_items: prev.medicine_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateSubtotal = () => {
    const serviceTotal = formData.service_items.reduce((total, item) => 
      total + (item.quantity * item.unit_price), 0);
    
    const medicineTotal = formData.medicine_items.reduce((total, item) => 
      total + (item.quantity * item.unit_price), 0);
    
    return serviceTotal + medicineTotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
    
    return subtotal - discountAmount + taxAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        total: calculateTotal()
      };

      await apiClient.post('/api/invoices', invoiceData);
      alert('Invoice created successfully!');
      navigate('/dashboard/pharmacy/sales/invoices');
    } catch (err) {
      alert('Failed to create invoice');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoice className="text-teal-600" />
            Create Invoice
          </h1>
          <p className="text-gray-600">Create a new invoice for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-6">
        {/* Customer Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Walk-in">Walk-in Customer</option>
                <option value="Patient">Patient</option>
                <option value="Corporate">Corporate</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>

            {formData.customer_type === 'Patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Patient</option>
                  {customers
                    .filter(c => c.customer_type === 'Patient')
                    .map(customer => (
                      <option key={customer._id} value={customer.patient_id?._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.customer_address}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Type
            </label>
            <select
              value={formData.invoice_type}
              onChange={(e) => setFormData(prev => ({ ...prev, invoice_type: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="Pharmacy">Pharmacy</option>
              <option value="Appointment">Appointment</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Service Items */}
        {(formData.invoice_type === 'Appointment' || formData.invoice_type === 'Mixed') && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaStethoscope className="text-blue-600" />
                Service Items
              </h3>
              <button
                type="button"
                onClick={addServiceItem}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg"
              >
                <FaPlus /> Add Service
              </button>
            </div>

            {formData.service_items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <select
                    value={item.service_type}
                    onChange={(e) => updateServiceItem(index, 'service_type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Test">Test</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateServiceItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateServiceItem(index, 'unit_price', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeServiceItem(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FaMinus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medicine Items */}
        {(formData.invoice_type === 'Pharmacy' || formData.invoice_type === 'Mixed') && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaBox className="text-teal-600" />
                Medicine Items
              </h3>
              <button
                type="button"
                onClick={addMedicineItem}
                className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1 rounded-lg"
              >
                <FaPlus /> Add Medicine
              </button>
            </div>

            {formData.medicine_items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
                  <select
                    required
                    value={item.medicine_id}
                    onChange={(e) => {
                      const medicine = medicines.find(m => m._id === e.target.value);
                      updateMedicineItem(index, 'medicine_id', e.target.value);
                      updateMedicineItem(index, 'medicine_name', medicine?.name || '');
                      updateMedicineItem(index, 'unit_price', medicine?.price_per_unit || 0);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map(medicine => (
                      <option key={medicine._id} value={medicine._id}>
                        {medicine.name} ({medicine.strength}) - ₹{medicine.price_per_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateMedicineItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateMedicineItem(index, 'unit_price', parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    value={item.batch_number}
                    onChange={(e) => updateMedicineItem(index, 'batch_number', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={item.expiry_date}
                      onChange={(e) => updateMedicineItem(index, 'expiry_date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedicineItem(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FaMinus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Financial Summary */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax (%)
              </label>
              <input
                type="number"
                min="0"
                value={formData.tax}
                onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount:</span>
                <span className="text-red-600">-₹{((calculateSubtotal() * formData.discount) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span className="text-blue-600">+₹{(((calculateSubtotal() - (calculateSubtotal() * formData.discount) / 100) * formData.tax) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-teal-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms_and_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Any additional notes for this invoice..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            <FaSave /> {loading ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/pharmacy/sales/invoices')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;