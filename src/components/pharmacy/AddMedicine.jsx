// import React, { useState } from 'react';
// import Button from '../common/Button';
// import Input from '../common/Input';
// import Select from '../common/Select';
// import Textarea from '../common/Textarea';

// const AddMedicine = () => {
//   const [medicineData, setMedicineData] = useState({
//     name: '',
//     genericName: '',
//     sku: '',
//     weight: '',
//     category: '',
//     manufacturer: '',
//     price: '',
//     manufacturerPrice: '',
//     stock: 0,
//     expireDate: '',
//     status: '',
//     details: '',
//   });

//   const handleChange = (field, value) => {
//     setMedicineData({ ...medicineData, [field]: value });
//   };

//   const handleStockChange = (delta) => {
//     setMedicineData(prev => ({
//       ...prev,
//       stock: Math.max(0, prev.stock + delta),
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Medicine Data:', medicineData);
//     // TODO: Add API integration here
//   };

//   return (
//     <div className="p-6">
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//         <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Medicine</h2>
//         <p className="text-gray-600 mb-6">You can add a medicine by filling these fields.</p>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Input label="Medicine Name" value={medicineData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Medicine Name" required />
//           <Input label="Generic Name" value={medicineData.genericName} onChange={(e) => handleChange('genericName', e.target.value)} placeholder="Generic Name" />
//           <Input label="SKU" value={medicineData.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="SKU" />
//           <Input label="Weight" value={medicineData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="Weight" />

//           <Select label="Category" value={medicineData.category} onChange={(e) => handleChange('category', e.target.value)}>
//             <option value="">Select</option>
//             <option value="Tablet">Tablet</option>
//             <option value="Capsule">Capsule</option>
//             <option value="Syrup">Syrup</option>
//           </Select>

//           <Select label="Manufacturer" value={medicineData.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)}>
//             <option value="">Select</option>
//             <option value="Company A">Company A</option>
//             <option value="Company B">Company B</option>
//           </Select>

//           <Input label="Price" value={medicineData.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Price" type="number" />
//           <Input label="Manufacturer Price" value={medicineData.manufacturerPrice} onChange={(e) => handleChange('manufacturerPrice', e.target.value)} placeholder="Manufacturer Price" type="number" />

//           <div className="col-span-2 flex items-end gap-3">
//             <label className="block w-full">
//               <span className="text-gray-700 text-sm font-medium">Stock (Box)</span>
//               <div className="flex items-center mt-1 border rounded px-2">
//                 <button type="button" className="text-lg px-2" onClick={() => handleStockChange(-1)}>-</button>
//                 <span className="px-4">{medicineData.stock}</span>
//                 <button type="button" className="text-lg px-2" onClick={() => handleStockChange(1)}>+</button>
//               </div>
//             </label>

//             <Input label="Expire Date" value={medicineData.expireDate} onChange={(e) => handleChange('expireDate', e.target.value)} placeholder="yyyy-mm-dd" type="date" className="w-full" />
//           </div>

//           <Select label="Status" value={medicineData.status} onChange={(e) => handleChange('status', e.target.value)}>
//             <option value="">Select</option>
//             <option value="Active">Active</option>
//             <option value="Inactive">Inactive</option>
//           </Select>

//           <div className="col-span-full">
//             <Textarea label="Medicine Details" value={medicineData.details} onChange={(e) => handleChange('details', e.target.value)} rows={5} placeholder="Enter details about the medicine..." />
//           </div>

//           <div className="col-span-full">
//             <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">Add Medicine</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddMedicine;


import React, { useState } from 'react';
import axios from 'axios';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';

const AddMedicine = () => {
  const initialFormState = {
    name: '',
    genericName: '',
    sku: '',
    weight: '',
    category: '',
    manufacturer: '',
    price: '',
    manufacturerPrice: '',
    stock: 0,
    expireDate: '',
    status: '',
    details: '',
  };

  const [medicineData, setMedicineData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    setMedicineData({ ...medicineData, [field]: value });
  };

  const handleStockChange = (delta) => {
    setMedicineData(prev => ({
      ...prev,
      stock: Math.max(0, prev.stock + delta),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    // --- FIX IS HERE: Map frontend state to backend schema ---
    const payload = {
      name: medicineData.name,
      category: medicineData.category,
      stock_quantity: medicineData.stock,
      expiry_date: medicineData.expireDate,
      price_per_unit: medicineData.price,
      supplier: medicineData.manufacturer,
    };

    const backendUrl = 'http://localhost:5000';

    try {
      const response = await axios.post(`${backendUrl}/api/pharmacy/medicines`, payload);
      
      setSuccessMessage('Medicine added successfully!');
      setMedicineData(initialFormState);
      console.log('Server Response:', response.data);

    } catch (err) {
      console.error('Failed to add medicine:', err);
      const message = err.response?.data?.error || 'An unexpected error occurred. Please check all required fields.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Medicine</h2>
        <p className="text-gray-600 mb-6">Fill the fields to add a new medicine to the inventory.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Medicine Name" value={medicineData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Medicine Name" required />
          <Input label="Generic Name" value={medicineData.genericName} onChange={(e) => handleChange('genericName', e.target.value)} placeholder="Generic Name" />
          <Input label="SKU" value={medicineData.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="SKU" />
          <Input label="Weight" value={medicineData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="Weight" />

          <Select label="Category" value={medicineData.category} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">Select Category</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
          </Select>

          <Select label="Supplier/Manufacturer" value={medicineData.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)}>
            <option value="">Select Supplier</option>
            <option value="Company A">Company A</option>
            <option value="Company B">Company B</option>
            <option value="Pharma Inc.">Pharma Inc.</option>
          </Select>

          <Input label="Price per Unit" value={medicineData.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Price" type="number" required />
          <Input label="Manufacturer Price" value={medicineData.manufacturerPrice} onChange={(e) => handleChange('manufacturerPrice', e.target.value)} placeholder="Manufacturer Price" type="number" />

          <div className="col-span-2 flex items-end gap-3">
            <label className="block w-full">
              <span className="text-gray-700 text-sm font-medium">Stock Quantity</span>
              <div className="flex items-center mt-1 border rounded px-2">
                <button type="button" className="text-lg px-2" onClick={() => handleStockChange(-1)}>-</button>
                <span className="px-4">{medicineData.stock}</span>
                <button type="button" className="text-lg px-2" onClick={() => handleStockChange(1)}>+</button>
              </div>
            </label>

            <Input label="Expiry Date" value={medicineData.expireDate} onChange={(e) => handleChange('expireDate', e.target.value)} type="date" className="w-full" required />
          </div>

          <Select label="Status" value={medicineData.status} onChange={(e) => handleChange('status', e.target.value)}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <div className="col-span-full">
            <Textarea label="Medicine Details" value={medicineData.details} onChange={(e) => handleChange('details', e.target.value)} rows={5} placeholder="Enter details about the medicine..." />
          </div>

          <div className="col-span-full">
            <Button type="submit" disabled={submitting} className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Medicine'}
            </Button>
          </div>
        </form>

        {successMessage && <p className="mt-4 text-green-600 font-medium">{successMessage}</p>}
        {errorMessage && <p className="mt-4 text-red-600 font-medium">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default AddMedicine;