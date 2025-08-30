



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

// const AddCustomerForm = () => {
//   const initialFormState = {
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     medicineId: '', // Changed from purchasedItem
//     purchasedItemName: '', // To store the name for history
//     purchasedQuantity: '',
//     amount: '',
//     paymentMode: '',
//     status: '',
//     description: ''
//   };

//   const [formData, setFormData] = useState(initialFormState);
//   const [medicines, setMedicines] = useState([]); // To store the medicine list
//   const [submitting, setSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   // Fetch available medicines when the component loads
//   useEffect(() => {
//     const fetchMedicines = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/pharmacy/medicines');
//         // Format for the select dropdown
//         const formattedMedicines = response.data.map(med => ({
//           value: med._id,
//           label: `${med.name} (Stock: ${med.stock_quantity})`
//         }));
//         setMedicines(formattedMedicines);
//       } catch (error) {
//         console.error("Failed to fetch medicines:", error);
//         setErrorMessage("Could not load medicine list.");
//       }
//     };
//     fetchMedicines();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   // Special handler for medicine selection
//   const handleMedicineSelect = (e) => {
//     const medicineId = e.target.value;
//     const selectedMedicine = medicines.find(m => m.value === medicineId);
//     const medicineName = selectedMedicine ? selectedMedicine.label.split(' (')[0] : '';

//     setFormData(prev => ({
//       ...prev,
//       medicineId: medicineId,
//       purchasedItemName: medicineName
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.medicineId) {
//       setErrorMessage("Please select a medicine.");
//       return;
//     }
//     setSubmitting(true);
//     setSuccessMessage('');
//     setErrorMessage('');

//     try {
//       await axios.post('http://localhost:5000/api/customers', formData);
//       setSuccessMessage('Sale recorded and stock updated!');
//       setFormData(initialFormState);
//     } catch (err) {
//       const message = err.response?.data?.error || 'Failed to save customer data.';
//       setErrorMessage(message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const statusOptions = [
//     { value: 'paid', label: 'Paid' },
//     { value: 'unpaid', label: 'Unpaid' },
//     { value: 'pending', label: 'Pending' }
//   ];

//   const paymentOptions = [
//     { value: 'cash', label: 'Cash' },
//     { value: 'card', label: 'Card' },
//     { value: 'upi', label: 'UPI' }
//   ];

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900">Add Patient Sale</h2>
//           <p className="text-gray-600 mt-1">Add a new sale record for a customer.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <FormInput label="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
//             <FormInput label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
//             <FormInput label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" />
//             <FormInput label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            
//             {/* Changed to a dropdown */}
//             <FormSelect
//               label="Purchased Item"
//               value={formData.medicineId}
//               onChange={handleMedicineSelect}
//               options={medicines}
//               placeholder="Select a medicine"
//               required
//             />

//             <FormInput label="Purchased Quantity" value={formData.purchasedQuantity} onChange={(e) => handleInputChange('purchasedQuantity', e.target.value)} type="number" required/>
//             <FormInput label="Amount" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} type="number" required/>
//             <FormSelect label="Payment Mode" value={formData.paymentMode} onChange={(e) => handleInputChange('paymentMode', e.target.value)} options={paymentOptions} required />
//             <FormSelect label="Status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} options={statusOptions} required />
//           </div>

//           {formData.paymentMode === 'upi' && (
//             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg mb-6">
//               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=your-upi-id@okhdfcbank" alt="Scan for UPI Payment" className="w-40 h-40" />
//               <p className="mt-2 text-gray-600 font-medium">Scan to complete payment</p>
//             </div>
//           )}

//           <FormTextarea label="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} />

//           <div className="flex justify-end mt-6">
//             <Button type="submit" variant="primary" disabled={submitting}>
//               {submitting ? 'Saving...' : 'Save Customer Sale'}
//             </Button>
//           </div>

//           {successMessage && <p className="text-green-600 mt-4 text-right">{successMessage}</p>}
//           {errorMessage && <p className="text-red-600 mt-4 text-right">{errorMessage}</p>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerForm;















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import { FaPlus, FaTrash } from 'react-icons/fa';

const AddCustomerForm = () => {
  const initialFormState = {
    name: '',
    phone: '',
    email: '',
    address: '',
    items: [{ medicineId: '', quantity: 1, price: 0, name: '' }],
    paymentMode: 'cash',
    status: 'paid',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [medicines, setMedicines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pharmacy/medicines');
        setMedicines(response.data);
      } catch (error) {
        setErrorMessage("Could not load medicine list.");
      }
    };
    fetchMedicines();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'medicineId') {
      const selectedMed = medicines.find(m => m._id === value);
      newItems[index].price = selectedMed ? selectedMed.price_per_unit : 0;
      newItems[index].name = selectedMed ? selectedMed.name : '';
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { medicineId: '', quantity: 1, price: 0, name: '' }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.some(item => !item.medicineId || item.quantity < 1)) {
      setErrorMessage("Please select a medicine and quantity for all items.");
      return;
    }
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      ...formData,
      items: formData.items.map(({ medicineId, quantity }) => ({ medicineId, quantity })),
    };

    try {
      await axios.post('http://localhost:5000/api/customers', payload);
      setSuccessMessage('Sale recorded and stock updated!');
      setFormData(initialFormState);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save customer data.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Add Patient Sale</h2>
          <p className="text-gray-600 mt-1">Add a new sale record for a customer.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FormInput label="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            <FormInput label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
            <FormInput label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" />
            <FormInput label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Purchased Items</h3>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow">
                    <label className="text-sm font-medium">Medicine</label>
                    <select value={item.medicineId} onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">Select medicine</option>
                      {medicines.map(m => <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock_quantity})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Qty</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-20 border rounded px-2 py-1 mt-1" />
                  </div>
                  <div className="text-sm font-medium p-1">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </div>
                  <Button type="button" onClick={() => removeItem(index)} variant="danger-outline" size="sm"><FaTrash /></Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={addItem} size="sm" className="mt-3"><FaPlus /> Add Another Item</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <div className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</div>
            </div>
            <FormSelect label="Payment Mode" value={formData.paymentMode} onChange={(e) => handleInputChange('paymentMode', e.target.value)} options={[{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'upi', label: 'UPI' }]} required />
            <FormSelect label="Status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} options={[{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} required />
          </div>

          <FormTextarea label="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} />

          <div className="flex justify-end mt-6">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Customer Sale'}
            </Button>
          </div>

          {successMessage && <p className="text-green-600 mt-4 text-right">{successMessage}</p>}
          {errorMessage && <p className="text-red-600 mt-4 text-right">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
// import axios from 'axios';
// import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
// import { FaPlus, FaTrash } from 'react-icons/fa';

// const AddCustomerForm = () => {
//   const navigate = useNavigate(); // 2. Initialize the navigate function
//   const initialFormState = {
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     items: [{ medicineId: '', quantity: 1, price: 0, name: '' }],
//     paymentMode: 'cash',
//     status: 'paid',
//     description: ''
//   };

//   const [formData, setFormData] = useState(initialFormState);
//   const [medicines, setMedicines] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     const fetchMedicines = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/pharmacy/medicines');
//         setMedicines(response.data);
//       } catch (error) {
//         setErrorMessage("Could not load medicine list.");
//       }
//     };
//     fetchMedicines();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...formData.items];
//     newItems[index][field] = value;

//     if (field === 'medicineId') {
//       const selectedMed = medicines.find(m => m._id === value);
//       newItems[index].price = selectedMed ? selectedMed.price_per_unit : 0;
//       newItems[index].name = selectedMed ? selectedMed.name : '';
//     }
//     setFormData(prev => ({ ...prev, items: newItems }));
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, { medicineId: '', quantity: 1, price: 0, name: '' }]
//     }));
//   };

//   const removeItem = (index) => {
//     const newItems = formData.items.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, items: newItems }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.items.some(item => !item.medicineId || item.quantity < 1)) {
//       setErrorMessage("Please select a medicine and quantity for all items.");
//       return;
//     }
//     setSubmitting(true);
//     setErrorMessage('');

//     const payload = {
//       ...formData,
//       items: formData.items.map(({ medicineId, quantity }) => ({ medicineId, quantity })),
//     };

//     try {
//       await axios.post('http://localhost:5000/api/customers', payload);
//       // 3. Redirect on success
//       navigate('/dashboard/pharmacy/inventory'); 
//     } catch (err) {
//       const message = err.response?.data?.error || 'Failed to save customer data.';
//       setErrorMessage(message);
//       setSubmitting(false); // Only stop submitting on error
//     }
//   };

//   const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border">
//         <div className="p-6 border-b">
//           <h2 className="text-2xl font-bold">Add Patient Sale</h2>
//           <p className="text-gray-600 mt-1">Add a new sale record for a customer.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <FormInput label="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
//             <FormInput label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
//             <FormInput label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" />
//             <FormInput label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
//           </div>

//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-800 mb-2">Purchased Items</h3>
//             <div className="space-y-3">
//               {formData.items.map((item, index) => (
//                 <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg">
//                   <div className="flex-grow">
//                     <label className="text-sm font-medium">Medicine</label>
//                     <select value={item.medicineId} onChange={(e) => handleItemChange(index, 'medicineId', e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
//                       <option value="">Select medicine</option>
//                       {medicines.map(m => <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock_quantity})</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium">Qty</label>
//                     <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-20 border rounded px-2 py-1 mt-1" />
//                   </div>
//                   <div className="text-sm font-medium p-1">
//                     ${(item.quantity * item.price).toFixed(2)}
//                   </div>
//                   <Button type="button" onClick={() => removeItem(index)} variant="danger-outline" size="sm"><FaTrash /></Button>
//                 </div>
//               ))}
//             </div>
//             <Button type="button" onClick={addItem} size="sm" className="mt-3"><FaPlus /> Add Another Item</Button>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-gray-100 p-3 rounded-lg">
//                 <label className="text-sm font-medium text-gray-600">Total Amount</label>
//                 <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
//             </div>
//             <FormSelect label="Payment Mode" value={formData.paymentMode} onChange={(e) => handleInputChange('paymentMode', e.target.value)} options={[{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'upi', label: 'UPI' }]} required />
//             <FormSelect label="Status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} options={[{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} required />
//           </div>

//           <FormTextarea label="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} />

//           <div className="flex justify-end mt-6">
//             <Button type="submit" variant="primary" disabled={submitting}>
//               {submitting ? 'Saving...' : 'Save Customer Sale'}
//             </Button>
//           </div>

//           {errorMessage && <p className="text-red-600 mt-4 text-right">{errorMessage}</p>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerForm;