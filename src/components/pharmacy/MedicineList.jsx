

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FaPlus, FaTimes } from 'react-icons/fa'; // Import FaTimes for the close icon

// // A new component for the details modal
// const MedicineDetailsModal = ({ medicine, onClose }) => {
//   if (!medicine) return null;

//   return (
//     // Modal backdrop
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       {/* Modal content */}
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
//         <div className="flex justify-between items-center p-6 border-b">
//           <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-6 space-y-4">
//           {/* Using a grid for cleaner alignment */}
//           <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
//             <strong className="text-gray-600 col-span-1">Generic Name:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.genericName}</span>

//             <strong className="text-gray-600 col-span-1">Category:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.category}</span>

//             <strong className="text-gray-600 col-span-1">Manufacturer:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.manufacturer}</span>

//             <strong className="text-gray-600 col-span-1">Stock:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.stock} units</span>

//             <strong className="text-gray-600 col-span-1">Price:</strong>
//             <span className="text-gray-800 col-span-2">${medicine.price}</span>

//             <strong className="text-gray-600 col-span-1">Status:</strong>
//             <span className={`px-2 py-1 text-xs rounded-full ${medicine.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//               {medicine.status}
//             </span>

//             <strong className="text-gray-600 col-span-1">Expire Date:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.expireDate}</span>
//           </div>
//           <div>
//             <strong className="text-gray-600 text-sm">Details:</strong>
//             <p className="text-gray-800 text-sm mt-1 p-3 bg-gray-50 rounded-lg">{medicine.details}</p>
//           </div>
//         </div>
//         <div className="p-6 border-t text-right">
//             <button
//                 onClick={onClose}
//                 className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//                 Close
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// const MedicineList = () => {
//   const [medicines] = useState([
//     {
//       id: 1,
//       name: 'Zimax',
//       genericName: 'Azithromycin',
//       category: 'Tablet',
//       manufacturer: 'Healthcare',
//       stock: 180,
//       price: 60,
//       status: 'Active',
//       expireDate: '2025-03-01',
//       details: 'Used for bacterial infections.',
//     },
//     {
//       id: 2,
//       name: 'Amoxicillin',
//       genericName: 'Penicillin',
//       category: 'Capsule',
//       manufacturer: 'Company B',
//       stock: 30,
//       price: 45,
//       status: 'Inactive',
//       expireDate: '2024-12-20',
//       details: 'Treats respiratory infections.',
//     },
//   ]);

//   // State to manage the modal
//   const [selectedMedicine, setSelectedMedicine] = useState(null);

//   const handleViewClick = (medicine) => {
//     setSelectedMedicine(medicine);
//   };

//   const handleCloseModal = () => {
//     setSelectedMedicine(null);
//   };

//   return (
//     <div className="p-6">
//       <div className="bg-white p-6 rounded-xl shadow-sm border">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold">Medicine List</h2>
//           <Link
//             to="/dashboard/pharmacy/add-medicine"
//             className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
//           >
//             <FaPlus />
//             Add Medicine
//           </Link>
//         </div>

//         <div className="overflow-x-auto">
//             <table className="min-w-full border border-gray-200 text-sm">
//             <thead className="bg-gray-100">
//                 <tr>
//                 <th className="px-4 py-2 border text-left">Name</th>
//                 <th className="px-4 py-2 border text-left">Generic</th>
//                 <th className="px-4 py-2 border text-left">Stock</th>
//                 <th className="px-4 py-2 border text-left">Price</th>
//                 <th className="px-4 py-2 border text-center">Action</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {medicines.map((med) => (
//                 <tr key={med.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 border">{med.name}</td>
//                     <td className="px-4 py-2 border">{med.genericName}</td>
//                     <td className="px-4 py-2 border">{med.stock}</td>
//                     <td className="px-4 py-2 border">${med.price}</td>
//                     <td className="px-4 py-2 border text-center">
//                     {/* This button now opens the modal */}
//                     <button onClick={() => handleViewClick(med)} className="text-blue-600 hover:underline font-semibold">
//                         View
//                     </button>
//                     </td>
//                 </tr>
//                 ))}
//                 {medicines.length === 0 && (
//                 <tr>
//                     <td colSpan="5" className="text-center py-4 text-gray-500">No medicines found.</td>
//                 </tr>
//                 )}
//             </tbody>
//             </table>
//         </div>
//       </div>

//       {/* Render the modal component */}
//       <MedicineDetailsModal medicine={selectedMedicine} onClose={handleCloseModal} />
//     </div>
//   );
// };

// export default MedicineList;



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTimes } from 'react-icons/fa';

// --- Details Modal (Updated to match backend schema) ---
const MedicineDetailsModal = ({ medicine, onClose }) => {
  if (!medicine) return null;

  // Helper to format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <strong className="text-gray-600 col-span-1">Category:</strong>
            <span className="text-gray-800 col-span-2">{medicine.category || 'N/A'}</span>

            <strong className="text-gray-600 col-span-1">Supplier:</strong>
            <span className="text-gray-800 col-span-2">{medicine.supplier || 'N/A'}</span>

            <strong className="text-gray-600 col-span-1">Stock:</strong>
            <span className="text-gray-800 col-span-2">{medicine.stock_quantity} units</span>

            <strong className="text-gray-600 col-span-1">Price:</strong>
            <span className="text-gray-800 col-span-2">${medicine.price_per_unit}</span>

            <strong className="text-gray-600 col-span-1">Expiry Date:</strong>
            <span className="text-gray-800 col-span-2">{formatDate(medicine.expiry_date)}</span>
          </div>
        </div>
        <div className="p-6 border-t text-right">
            <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Medicine List Component (Updated to fetch data) ---
const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      const backendUrl = 'http://localhost:5000';
      try {
        const response = await axios.get(`${backendUrl}/api/pharmacy/medicines`);
        setMedicines(response.data);
      } catch (err) {
        setError('Failed to fetch medicines. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []); // Empty dependency array means this runs once on mount

  const handleViewClick = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleCloseModal = () => {
    setSelectedMedicine(null);
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Medicine List</h2>
          <Link
            to="/dashboard/pharmacy/add-medicine"
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            <FaPlus />
            Add Medicine
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading && <p className="text-center py-4">Loading medicines...</p>}
          {error && <p className="text-center py-4 text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border text-left">Name</th>
                    <th className="px-4 py-2 border text-left">Category</th>
                    <th className="px-4 py-2 border text-left">Stock</th>
                    <th className="px-4 py-2 border text-left">Price</th>
                    <th className="px-4 py-2 border text-center">Action</th>
                  </tr>
              </thead>
              <tbody>
                  {medicines.map((med) => (
                    <tr key={med._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{med.name}</td>
                        <td className="px-4 py-2 border">{med.category}</td>
                        <td className="px-4 py-2 border">{med.stock_quantity}</td>
                        <td className="px-4 py-2 border">${med.price_per_unit}</td>
                        <td className="px-4 py-2 border text-center">
                          <button onClick={() => handleViewClick(med)} className="text-blue-600 hover:underline font-semibold">
                              View
                          </button>
                        </td>
                    </tr>
                  ))}
                  {medicines.length === 0 && (
                    <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">No medicines found.</td>
                    </tr>
                  )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <MedicineDetailsModal medicine={selectedMedicine} onClose={handleCloseModal} />
    </div>
  );
};

export default MedicineList;