// import React, { useState } from 'react';
// import apiClient from '../../api/apiClient'; // Adjust path as needed
// import { FaTimes, FaArrowLeft, FaPills } from 'react-icons/fa';

// const PrescriptionFlowModal = ({ prescriptions, onClose }) => {
//   const [selectedPrescription, setSelectedPrescription] = useState(null);
//   const [detailedItems, setDetailedItems] = useState([]);
//   const [isLoadingDetails, setIsLoadingDetails] = useState(false);

//   const formatTimestamp = (isoString) => {
//     if (!isoString) return 'N/A';
//     return new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
//   };

//   const handleViewDetails = async (prescription) => {
//     setSelectedPrescription(prescription);
//     setIsLoadingDetails(true);
//     try {
//       const response = await apiClient.get(`/api/prescriptions/${prescription._id}`);
//       setDetailedItems(response.data.items || []);
//     } catch (error) {
//       console.error(error);
//       setDetailedItems([]); // Set to empty on error
//     } finally {
//       setIsLoadingDetails(false);
//     }
//   };

//   // Details View for a single prescription
//   if (selectedPrescription) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
//           <div className="flex justify-between items-center p-5 border-b">
//             <div className="flex items-center gap-3">
//               <button onClick={() => setSelectedPrescription(null)} className="text-gray-500 hover:text-gray-800"><FaArrowLeft /></button>
//               <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
//             </div>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
//           </div>
//           <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//             <div>
//                 <h4 className="font-bold text-gray-700">Patient Information</h4>
//                 <p><strong>Name:</strong> {`${selectedPrescription.patient_id?.first_name || ''} ${selectedPrescription.patient_id?.last_name || ''}`.trim()}</p>
//                 <p><strong>Prescribed by:</strong> {`${selectedPrescription.doctor_id?.first_name || ''} ${selectedPrescription.doctor_id?.last_name || 'N/A'}`.trim()}</p>
//                 <p><strong>Date:</strong> {formatTimestamp(selectedPrescription.created_at)}</p>
//             </div>
//             <div>
//               <h4 className="font-bold text-gray-700">Diagnosis</h4>
//               <p className="text-sm mt-1">{selectedPrescription.diagnosis || 'N/A'}</p>
//             </div>
//             <div>
//               <h4 className="font-bold text-gray-700 flex items-center gap-2"><FaPills /> Medicines</h4>
//               {isLoadingDetails ? <p>Loading...</p> : (
//                 <ul className="list-disc list-inside mt-2 text-sm space-y-1">
//                   {detailedItems.length > 0 ? detailedItems.map((item, index) => 
//                     <li key={index}>{`${item.medicine_name} (${item.dosage}) - ${item.duration}`}</li>
//                   ) : <li>No medicines listed.</li>}
//                 </ul>
//               )}
//             </div>
//           </div>
//           <div className="flex justify-end p-5 border-t gap-3">
//               <button onClick={() => setSelectedPrescription(null)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Back to List</button>
//               <button onClick={onClose} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Mark as Processed</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // List View for all pending prescriptions
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">Pending Prescriptions</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
//         </div>
//         <div className="p-5">
//           <div className="overflow-y-auto max-h-96">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="px-4 py-2 text-left">Patient Name</th>
//                   <th className="px-4 py-2 text-left">Prescribed By</th>
//                   <th className="px-4 py-2 text-left">Date & Time</th>
//                   <th className="px-4 py-2 text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prescriptions.map((p) => (
//                   <tr key={p._id} className="border-b hover:bg-gray-50">
//                     <td className="px-4 py-3">{`${p.patient_id?.first_name || ''} ${p.patient_id?.last_name || 'Unknown'}`.trim()}</td>
//                     <td className="px-4 py-3">{`${p.doctor_id?.first_name || ''} ${p.doctor_id?.last_name || 'Unknown'}`.trim()}</td>
//                     <td className="px-4 py-3">{formatTimestamp(p.created_at)}</td>
//                     <td className="px-4 py-3 text-center">
//                       <button onClick={() => handleViewDetails(p)} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md hover:bg-blue-200">View</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrescriptionFlowModal;






import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; // Adjust path as needed
import { FaTimes, FaArrowLeft, FaPills, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const PrescriptionFlowModal = ({ prescriptions, onClose }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [billingItems, setBillingItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const handleViewDetails = async (prescription) => {
    setSelectedPrescription(prescription);
    setIsLoadingDetails(true);
    try {
      const presDetailsRes = await apiClient.get(`/api/prescriptions/${prescription._id}`);
      const presItems = presDetailsRes.data.items || [];

      const inventoryRes = await apiClient.get('/api/pharmacy/medicines');
      const inventory = inventoryRes.data;

      const checkedItems = presItems.map(item => {
        const stockItem = inventory.find(invItem => invItem.name.toLowerCase() === item.medicine_name.toLowerCase());
        const availableStock = stockItem ? stockItem.stock_quantity : 0;
        const requiredQty = parseInt(item.quantity) || 1;
        
        let status = 'Available';
        if (availableStock === 0) status = 'Out of Stock';
        else if (availableStock < requiredQty) status = 'Insufficient Stock';

        return {
          ...item,
          medicine_id: stockItem?._id,
          price_per_unit: stockItem?.price_per_unit || 0,
          availableStock,
          status,
          quantityToDispense: Math.min(requiredQty, availableStock),
        };
      });
      setBillingItems(checkedItems);

    } catch (error) {
      console.error(error);
      setBillingItems([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    const amount = billingItems
      .filter(item => item.status === 'Available' || item.status === 'Insufficient Stock')
      .reduce((sum, item) => sum + (item.quantityToDispense * item.price_per_unit), 0);
    setTotalAmount(amount.toFixed(2));
  }, [billingItems]);
  
  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...billingItems];
    const item = updatedItems[index];
    const qty = Math.max(0, Math.min(newQuantity, item.availableStock));
    item.quantityToDispense = qty;
    setBillingItems(updatedItems);
  };
  
  // const handleGenerateInvoice = async () => {
  //   setIsSubmitting(true);
  //    const itemsToInvoice = billingItems
  //   .filter(item => item.quantityToDispense > 0)
  //   .map(item => ({
  //     // This structure must match the backend's invoiceItemSchema
  //     medicine_id: item.medicine_id,
  //     name: item.medicine_name,
  //     quantity: item.quantityToDispense,
  //     price: item.price_per_unit
  //   }));

  //    const payload = {
  //   patient_id: selectedPrescription.patient_id._id, // Must be a valid patient ID
  //   doctor_id: selectedPrescription.doctor_id._id,   // Must be a valid doctor ID
  //   items: itemsToInvoice,                           // The array of items
  //   total_amount: totalAmount,
  //   payment_mode: paymentMode
  // };
  const handleGenerateInvoice = async () => {
  setIsSubmitting(true);
  const itemsToInvoice = billingItems
    .filter(item => item.quantityToDispense > 0)
    .map(item => ({
      medicine_id: item.medicine_id,
      name: item.medicine_name,
      quantity: item.quantityToDispense,
      price: item.price_per_unit
    }));

  const payload = {
    prescription_id: selectedPrescription._id, // ADDED: Send the prescription ID
    patient_id: selectedPrescription.patient_id._id,
    doctor_id: selectedPrescription.doctor_id._id,
    items: itemsToInvoice,
    total_amount: totalAmount,
    payment_mode: paymentMode
  };
  try {
    const response = await apiClient.post('/api/pharmacy-invoices/from-prescription', payload);
    const newInvoice = response.data;
    
    const downloadUrl = `${apiClient.defaults.baseURL}/api/pharmacy-invoices/${newInvoice._id}/download`;
    window.open(downloadUrl, '_blank');

    onClose();
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.response?.data?.message || 'Failed to generate invoice.'}`);
  } finally {
    setIsSubmitting(false);
  }
};
  // --- JSX Rendering ---

  // Details & Billing View
  if (selectedPrescription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          <div className="flex justify-between items-center p-5 border-b">
             <h3 className="text-xl font-bold text-gray-800">Process & Bill Prescription</h3>
             <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             <div>
                <p><strong>Patient:</strong> {`${selectedPrescription.patient_id?.first_name} ${selectedPrescription.patient_id?.last_name}`}</p>
                <p><strong>Doctor:</strong> {`${selectedPrescription.doctor_id?.first_name} ${selectedPrescription.doctor_id?.last_name}`}</p>
             </div>
             <div className="space-y-2">
                <h4 className="font-bold text-gray-700">Medicines</h4>
                {isLoadingDetails ? <p>Checking stock...</p> : billingItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center text-sm p-2 rounded-lg bg-gray-50">
                        <div className="col-span-5 font-semibold">{item.medicine_name} ({item.dosage})</div>
                        <div className="col-span-3">
                            {item.status === 'Available' && <span className="text-green-600 flex items-center gap-1"><FaCheckCircle /> Available</span>}
                            {item.status === 'Out of Stock' && <span className="text-red-600 flex items-center gap-1"><FaExclamationCircle /> Out of Stock</span>}
                            {item.status === 'Insufficient Stock' && <span className="text-orange-500 flex items-center gap-1"><FaExclamationCircle /> Low Stock</span>}
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label>Qty:</label>
                            <input
                                type="number"
                                value={item.quantityToDispense}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                className="w-16 p-1 border rounded"
                                max={item.availableStock}
                                disabled={item.status === 'Out of Stock'}
                            />
                            <span className="text-xs text-gray-500">/ {item.availableStock}</span>
                        </div>
                    </div>
                ))}
             </div>
             <div className="pt-4 border-t flex justify-between items-center">
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="p-2 border rounded-lg">
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Online</option>
                </select>
                <div className="text-right">
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="text-2xl font-bold">${totalAmount}</p>
                </div>
             </div>
          </div>
          <div className="flex justify-between p-5 border-t">
              <button onClick={() => setSelectedPrescription(null)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Back</button>
              <button onClick={handleGenerateInvoice} disabled={isSubmitting || totalAmount <= 0} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Generate Invoice'}
              </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial List View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Pending Prescriptions</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto">
            {prescriptions.length > 0 ? (
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left">Patient</th><th className="px-4 py-2 text-left">Doctor</th><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-center">Action</th></tr></thead>
                    <tbody>
                        {prescriptions.map((p) => (<tr key={p._id} className="border-b"><td className="px-4 py-3">{`${p.patient_id?.first_name} ${p.patient_id?.last_name}`}</td><td className="px-4 py-3">{`${p.doctor_id?.first_name} ${p.doctor_id?.last_name}`}</td><td className="px-4 py-3">{formatTimestamp(p.created_at)}</td><td className="px-4 py-3 text-center"><button onClick={() => handleViewDetails(p)} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md">View</button></td></tr>))}
                    </tbody>
                </table>
            ) : <p className="text-center text-gray-500">No pending prescriptions found.</p>}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionFlowModal;