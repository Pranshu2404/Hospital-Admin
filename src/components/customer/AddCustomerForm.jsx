// import { useState } from 'react';
// import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

// const AddCustomerForm = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     purchasedItem: '',
//     purchasedQuantity: '',
//     amount: '',
//     paymentMode: '',
//     status: '',
//     description: ''
//   });

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Customer Data:', formData);
//     // You can replace this with your actual API call or state update
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
//           <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>
//           <p className="text-gray-600 mt-1">You can add a customer by filling these fields.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <FormInput
//               label="Name"
//               value={formData.name}
//               onChange={(e) => handleInputChange('name', e.target.value)}
//               placeholder="Name"
//               required
//             />
//             <FormInput
//               label="Phone"
//               value={formData.phone}
//               onChange={(e) => handleInputChange('phone', e.target.value)}
//               placeholder="Phone no"
//               required
//             />
//             <FormInput
//               label="Email"
//               value={formData.email}
//               onChange={(e) => handleInputChange('email', e.target.value)}
//               placeholder="Email"
//               type="email"
//             />
//             <FormInput
//               label="Address"
//               value={formData.address}
//               onChange={(e) => handleInputChange('address', e.target.value)}
//               placeholder="Address"
//             />
//             <FormInput
//               label="Purchased Item"
//               value={formData.purchasedItem}
//               onChange={(e) => handleInputChange('purchasedItem', e.target.value)}
//               placeholder="Item"
//               required
//             />
//             <FormInput
//               label="Purchased Quantity"
//               value={formData.purchasedQuantity}
//               onChange={(e) => handleInputChange('purchasedQuantity', e.target.value)}
//               placeholder="Quantity"
//               type="number"
//             />
//             <FormInput
//               label="Amount"
//               value={formData.amount}
//               onChange={(e) => handleInputChange('amount', e.target.value)}
//               placeholder="Amount"
//               type="number"
//             />
//             {/* Payment Mode now comes before Status */}
//             <FormSelect
//               label="Payment Mode"
//               value={formData.paymentMode}
//               onChange={(e) => handleInputChange('paymentMode', e.target.value)}
//               options={paymentOptions}
//               placeholder="Select Payment Mode"
//               required
//             />
//             <FormSelect
//               label="Status"
//               value={formData.status}
//               onChange={(e) => handleInputChange('status', e.target.value)}
//               options={statusOptions}
//               placeholder="Select"
//               required
//             />
//           </div>

//           {/* Conditionally render QR code when 'upi' is selected */}
//           {formData.paymentMode === 'upi' && (
//             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg mb-6">
//               <img
//                 src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=your-upi-id@okhdfcbank"
//                 alt="Scan for UPI Payment"
//                 className="w-40 h-40"
//               />
//               <p className="mt-2 text-gray-600 font-medium">Scan to complete payment</p>
//             </div>
//           )}

//           <FormTextarea
//             label="Description"
//             value={formData.description}
//             onChange={(e) => handleInputChange('description', e.target.value)}
//             placeholder="Enter customer note or description"
//             rows={5}
//           />

//           <div className="flex justify-end mt-6">
//             <Button type="submit" variant="primary">
//               Add Customer
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerForm;


















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

const AddCustomerForm = () => {
  const initialFormState = {
    name: '',
    phone: '',
    email: '',
    address: '',
    medicineId: '', // Changed from purchasedItem
    purchasedItemName: '', // To store the name for history
    purchasedQuantity: '',
    amount: '',
    paymentMode: '',
    status: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [medicines, setMedicines] = useState([]); // To store the medicine list
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available medicines when the component loads
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pharmacy/medicines');
        // Format for the select dropdown
        const formattedMedicines = response.data.map(med => ({
          value: med._id,
          label: `${med.name} (Stock: ${med.stock_quantity})`
        }));
        setMedicines(formattedMedicines);
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
        setErrorMessage("Could not load medicine list.");
      }
    };
    fetchMedicines();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Special handler for medicine selection
  const handleMedicineSelect = (e) => {
    const medicineId = e.target.value;
    const selectedMedicine = medicines.find(m => m.value === medicineId);
    const medicineName = selectedMedicine ? selectedMedicine.label.split(' (')[0] : '';

    setFormData(prev => ({
      ...prev,
      medicineId: medicineId,
      purchasedItemName: medicineName
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineId) {
      setErrorMessage("Please select a medicine.");
      return;
    }
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      setSuccessMessage('Sale recorded and stock updated!');
      setFormData(initialFormState);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save customer data.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'pending', label: 'Pending' }
  ];

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Patient Sale</h2>
          <p className="text-gray-600 mt-1">Add a new sale record for a customer.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FormInput label="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            <FormInput label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
            <FormInput label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" />
            <FormInput label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            
            {/* Changed to a dropdown */}
            <FormSelect
              label="Purchased Item"
              value={formData.medicineId}
              onChange={handleMedicineSelect}
              options={medicines}
              placeholder="Select a medicine"
              required
            />

            <FormInput label="Purchased Quantity" value={formData.purchasedQuantity} onChange={(e) => handleInputChange('purchasedQuantity', e.target.value)} type="number" required/>
            <FormInput label="Amount" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} type="number" required/>
            <FormSelect label="Payment Mode" value={formData.paymentMode} onChange={(e) => handleInputChange('paymentMode', e.target.value)} options={paymentOptions} required />
            <FormSelect label="Status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} options={statusOptions} required />
          </div>

          {formData.paymentMode === 'upi' && (
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg mb-6">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=your-upi-id@okhdfcbank" alt="Scan for UPI Payment" className="w-40 h-40" />
              <p className="mt-2 text-gray-600 font-medium">Scan to complete payment</p>
            </div>
          )}

          <FormTextarea label="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={5} />

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