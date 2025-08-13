import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../common/FormElements';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const CreateInvoiceModal = ({ onClose, onInvoiceCreated }) => {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ medicineId: '', quantity: 1, price: 0 }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch customers and medicines on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, medicineRes] = await Promise.all([
          axios.get('http://localhost:5000/api/customers'),
          axios.get('http://localhost:5000/api/pharmacy/medicines')
        ]);
        setCustomers(customerRes.data);
        setMedicines(medicineRes.data);
      } catch (err) {
        setError('Failed to load required data.');
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If medicine changes, update the price
    if (field === 'medicineId') {
      const selectedMed = medicines.find(m => m._id === value);
      newItems[index].price = selectedMed ? selectedMed.price_per_unit : 0;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.10; // Example 10% tax
  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !dueDate || items.some(i => !i.medicineId)) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');

    const payload = {
      patient_id: selectedPatient,
      dueDate,
      services: items.map(item => ({
        name: medicines.find(m => m._id === item.medicineId)?.name,
        amount: item.quantity * item.price,
      })),
      subtotal,
      tax,
      total,
    };

    try {
      await axios.post('http://localhost:5000/api/billing', payload);
      onInvoiceCreated(); // This will refresh the list on the parent page
      onClose();
    } catch (err) {
      setError('Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold">Create New Invoice</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select a patient</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <h4 className="font-semibold pt-4">Invoice Items</h4>
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="block text-sm">Medicine</label>
                  <select value={item.medicineId} onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">Select medicine</option>
                    {medicines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Qty</label>
                  <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-20 border rounded px-2 py-1" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Price:</span> ${item.price.toFixed(2)}
                </div>
                <Button type="button" onClick={() => removeItem(index)} variant="danger-outline" size="sm"><FaTrash /></Button>
              </div>
            ))}
            <Button type="button" onClick={addItem} size="sm"><FaPlus /> Add Item</Button>

            <div className="text-right pt-4">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Tax (10%): ${tax.toFixed(2)}</p>
              <p className="font-bold text-lg">Total: ${total.toFixed(2)}</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="p-5 border-t flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;