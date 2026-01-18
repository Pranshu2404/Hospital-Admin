import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import {
  FaUser,
  FaCalendarAlt,
  FaPills,
  FaFileInvoiceDollar,
  FaNotesMedical,
  FaPlus,
  FaTrash,
  FaSave,
  FaSearch
} from 'react-icons/fa';
import Layout from '../Layout';
import { adminSidebar } from '../../constants/sidebarItems/adminSidebar';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode Selection: 'Appointment' or 'Pharmacy'
  const [invoiceType, setInvoiceType] = useState('Appointment');

  // Common Data
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  // Appointment Mode Data
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('');

  // Pharmacy Mode Data
  const [medicines, setMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  // Form Fields
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Initial Fetch
  useEffect(() => {
    fetchPatients();
    if (invoiceType === 'Pharmacy') {
      fetchMedicines();
    }
  }, [invoiceType]);

  // Fetch Patients
  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients');
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients.');
    }
  };

  // Fetch Appointments when Patient changes
  useEffect(() => {
    if (invoiceType === 'Appointment' && selectedPatient) {
      fetchPatientAppointments(selectedPatient);
    } else {
      setAppointments([]);
      setSelectedAppointment('');
    }
  }, [selectedPatient, invoiceType]);

  const fetchPatientAppointments = async (patientId) => {
    try {
      const response = await apiClient.get(`/appointments/patient/${patientId}`);
      // Filter only active or pending appointments if needed, currently showing all
      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  // Fetch Medicines
  const fetchMedicines = async () => {
    try {
      const response = await apiClient.get('/medicines');
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  // Filter Medicines Search
  useEffect(() => {
    if (invoiceType === 'Pharmacy') {
      const lower = medicineSearch.toLowerCase();
      setFilteredMedicines(medicines.filter(m =>
        m.name.toLowerCase().includes(lower) ||
        (m.generic_name && m.generic_name.toLowerCase().includes(lower))
      ));
    }
  }, [medicineSearch, medicines, invoiceType]);


  // --- Item Management ---

  const addItem = () => {
    const newItem = invoiceType === 'Appointment'
      ? { description: '', quantity: 1, unit_price: 0, total_price: 0, service_type: 'Consultation' }
      : { medicine_id: '', medicine_name: '', quantity: 1, unit_price: 0, total_price: 0, tax_amount: 0 };

    setItems([...items, newItem]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Auto-calculate totals
    if (field === 'quantity' || field === 'unit_price') {
      item.total_price = Number(item.quantity) * Number(item.unit_price);
    }

    // Pharmacy specific logic
    if (invoiceType === 'Pharmacy' && field === 'medicine_id') {
      const med = medicines.find(m => m._id === value);
      if (med) {
        item.medicine_id = med._id;
        item.medicine_name = med.name;
        item.unit_price = med.selling_price || 0;
        item.tax_amount = (med.tax_rate || 0) * item.unit_price / 100; // Simplified tax calc
        item.total_price = Number(item.quantity) * Number(item.unit_price);

        // Add batch info if available (simplified for now, ideally user selects batch)
        if (med.batches && med.batches.length > 0) {
          item.batch_id = med.batches[0]._id; // Defaulting to first batch for MVP
        }
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };


  // --- Calculations ---

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return Math.max(0, sub - Number(discount));
  };


  // --- Submit ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (items.length === 0) {
        throw new Error('Please add at least one item.');
      }

      const commonPayload = {
        payment_method: paymentMethod,
        items: items.map(item => ({
          ...item,
          amount: item.total_price // Backend expects 'amount' sometimes, ensuring compatibility
        })),
        discount: Number(discount),
        notes
      };

      if (invoiceType === 'Appointment') {
        if (!selectedPatient || !selectedAppointment) {
          throw new Error('Please select a patient and an appointment.');
        }
        await apiClient.post('/invoices/appointment', {
          ...commonPayload,
          appointment_id: selectedAppointment,
          patient_id: selectedPatient
        });
      } else {
        // Pharmacy
        if (!selectedPatient) { // Modified to require patient for now, can be optional if walk-in supported later
          throw new Error('Please select a customer/patient.');
        }
        await apiClient.post('/invoices/pharmacy', {
          ...commonPayload,
          patient_id: selectedPatient,
          //  customer_name: ... (if walk-in)
        });
      }

      navigate('/dashboard/admin/invoices');

    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.error || err.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFileInvoiceDollar className="text-teal-600" />
              Create New Invoice
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Generate invoices for patient appointments or pharmacy sales.
            </p>
          </div>

          {/* Invoice Type Toggle */}
          <div className="bg-white p-1 rounded-lg border shadow-sm flex">
            <button
              onClick={() => { setInvoiceType('Appointment'); setItems([]); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${invoiceType === 'Appointment'
                ? 'bg-teal-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <FaCalendarAlt /> Appointment
              </div>
            </button>
            <button
              onClick={() => { setInvoiceType('Pharmacy'); setItems([]); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${invoiceType === 'Pharmacy'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <FaPills /> Pharmacy
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Customer & Context Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">1. Customer Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.first_name} {p.last_name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {invoiceType === 'Appointment' && (
                <div className={`transition-opacity ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Appointment</label>
                  <select
                    value={selectedAppointment}
                    onChange={(e) => setSelectedAppointment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    required={invoiceType === 'Appointment'}
                  >
                    <option value="">-- Choose Appointment --</option>
                    {appointments.map(app => (
                      <option key={app._id} value={app._id}>
                        {new Date(app.appointment_date).toLocaleDateString()} - {app.type} (Dr. {app.doctor_id?.firstName})
                      </option>
                    ))}
                  </select>
                  {selectedPatient && appointments.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">No appointments found for this patient.</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">3. Payment & Notes</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Remarks</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg h-24 text-sm"
                  placeholder="Additional details..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Line Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-800">2. Invoice Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 font-medium"
                >
                  <FaPlus /> Add Item
                </button>
              </div>

              <div className="flex-grow space-y-4">
                {items.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <FaPills className="mx-auto text-4xl mb-3 opacity-20" />
                    <p>No items added yet.</p>
                    <button type="button" onClick={addItem} className="text-teal-600 hover:underline text-sm mt-2">Add your first item</button>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-gray-50 p-4 rounded-lg group relative">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 sm:hidden"
                      >
                        <FaTrash />
                      </button>

                      {invoiceType === 'Pharmacy' ? (
                        <div className="flex-grow w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Medicine</label>
                          <select
                            value={item.medicine_id}
                            onChange={(e) => updateItem(index, 'medicine_id', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            required
                          >
                            <option value="">Select Medicine</option>
                            {filteredMedicines.map(m => (
                              <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock_quantity})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex-grow w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="Service description"
                            required
                          />
                        </div>
                      )}

                      <div className="w-24">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm text-center"
                        />
                      </div>

                      <div className="w-32">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400 text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                            className="w-full pl-6 pr-3 py-2 border rounded-md text-sm"
                            readOnly={invoiceType === 'Pharmacy'} // Auto-filled for pharmacy
                          />
                        </div>
                      </div>

                      <div className="w-32 bg-white px-3 py-2 border rounded-md text-right text-sm font-medium text-gray-700">
                        ₹{Number(item.total_price).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="hidden sm:block text-gray-400 hover:text-red-500 pb-2 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4 mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <div className="w-32 relative">
                    <span className="absolute left-3 top-1.5 text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold text-teal-800 pt-2 border-t border-dashed">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FaSave /> Create Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateInvoicePage;