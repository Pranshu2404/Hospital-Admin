// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { FaPlus, FaTimes } from 'react-icons/fa';

// // --- Details Modal (Updated to match backend schema) ---
// const MedicineDetailsModal = ({ medicine, onClose }) => {
//   if (!medicine) return null;

//   // Helper to format date string
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
//         <div className="flex justify-between items-center p-6 border-b">
//           <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-6 space-y-4">
//           <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
//             <strong className="text-gray-600 col-span-1">Category:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.category || 'N/A'}</span>

//             <strong className="text-gray-600 col-span-1">Supplier:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.supplier || 'N/A'}</span>

//             <strong className="text-gray-600 col-span-1">Stock:</strong>
//             <span className="text-gray-800 col-span-2">{medicine.stock_quantity} units</span>

//             <strong className="text-gray-600 col-span-1">Price:</strong>
//             <span className="text-gray-800 col-span-2">${medicine.price_per_unit}</span>

//             <strong className="text-gray-600 col-span-1">Expiry Date:</strong>
//             <span className="text-gray-800 col-span-2">{formatDate(medicine.expiry_date)}</span>
//           </div>
//         </div>
//         <div className="p-6 border-t text-right">
//             <button
//                 onClick={onClose}
//                 className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300"
//             >
//                 Close
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // --- Main Medicine List Component (Updated to fetch data) ---
// const MedicineList = () => {
//   const [medicines, setMedicines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedMedicine, setSelectedMedicine] = useState(null);

//   useEffect(() => {
//     const fetchMedicines = async () => {
//       const backendUrl = 'http://localhost:5000';
//       try {
//         const response = await axios.get(`${backendUrl}/api/pharmacy/medicines`);
//         setMedicines(response.data);
//       } catch (err) {
//         setError('Failed to fetch medicines. Please try again later.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMedicines();
//   }, []); // Empty dependency array means this runs once on mount

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
//             className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700"
//           >
//             <FaPlus />
//             Add Medicine
//           </Link>
//         </div>

//         <div className="overflow-x-auto">
//           {loading && <p className="text-center py-4">Loading medicines...</p>}
//           {error && <p className="text-center py-4 text-red-500">{error}</p>}
//           {!loading && !error && (
//             <table className="min-w-full border border-gray-200 text-sm">
//               <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-4 py-2 border text-left">Name</th>
//                     <th className="px-4 py-2 border text-left">Category</th>
//                     <th className="px-4 py-2 border text-left">Stock</th>
//                     <th className="px-4 py-2 border text-left">Price</th>
//                     <th className="px-4 py-2 border text-center">Action</th>
//                   </tr>
//               </thead>
//               <tbody>
//                   {medicines.map((med) => (
//                     <tr key={med._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-2 border">{med.name}</td>
//                         <td className="px-4 py-2 border">{med.category}</td>
//                         <td className="px-4 py-2 border">{med.stock_quantity}</td>
//                         <td className="px-4 py-2 border">${med.price_per_unit}</td>
//                         <td className="px-4 py-2 border text-center">
//                           <button onClick={() => handleViewClick(med)} className="text-blue-600 hover:underline font-semibold">
//                               View
//                           </button>
//                         </td>
//                     </tr>
//                   ))}
//                   {medicines.length === 0 && (
//                     <tr>
//                         <td colSpan="5" className="text-center py-4 text-gray-500">No medicines found.</td>
//                     </tr>
//                   )}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       <MedicineDetailsModal medicine={selectedMedicine} onClose={handleCloseModal} />
//     </div>
//   );
// };

// export default MedicineList;


import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // UPDATED: Using consistent API client
import { FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

// --- Details Modal (Unchanged) ---
const MedicineDetailsModal = ({ medicine, onClose }) => {
  if (!medicine) return null;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <strong className="text-gray-600">Category:</strong><span className="col-span-2">{medicine.category || 'N/A'}</span>
            <strong className="text-gray-600">Supplier:</strong><span className="col-span-2">{medicine.supplier || 'N/A'}</span>
            <strong className="text-gray-600">Stock:</strong><span className="col-span-2">{medicine.stock_quantity} units</span>
            <strong className="text-gray-600">Price:</strong><span className="col-span-2">${medicine.price_per_unit}</span>
            <strong className="text-gray-600">Expiry Date:</strong><span className="col-span-2">{formatDate(medicine.expiry_date)}</span>
          </div>
        </div>
        <div className="p-6 border-t text-right">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Medicine List Component ---
const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // ADDED: State for suppliers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // ADDED: State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // UPDATED: useEffect now fetches both medicines and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medicinesResponse, suppliersResponse] = await Promise.all([
          apiClient.get('/api/pharmacy/medicines'),
          apiClient.get('/api/suppliers')
        ]);
        setMedicines(medicinesResponse.data);
        setSuppliers(suppliersResponse.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ADDED: Memoized filtering logic for performance
  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      const nameMatch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const supplierMatch = selectedSupplier ? med.supplier === selectedSupplier : true;
      return nameMatch && supplierMatch;
    });
  }, [medicines, searchTerm, selectedSupplier]);

  const handleViewClick = (medicine) => setSelectedMedicine(medicine);
  const handleCloseModal = () => setSelectedMedicine(null);

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Medicine List</h2>
          <Link to="/dashboard/pharmacy/add-medicine" className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
            <FaPlus /> Add Medicine
          </Link>
        </div>

        {/* --- ADDED: Filter Controls --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by medicine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier._id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
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
                  {/* UPDATED: Map over the filtered list */}
                  {filteredMedicines.map((med) => (
                    <tr key={med._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{med.name}</td>
                        <td className="px-4 py-2 border">{med.category}</td>
                        <td className="px-4 py-2 border">{med.stock_quantity}</td>
                        <td className="px-4 py-2 border">${med.price_per_unit}</td>
                        <td className="px-4 py-2 border text-center">
                          <button onClick={() => handleViewClick(med)} className="text-blue-600 hover:underline font-semibold">View</button>
                        </td>
                    </tr>
                  ))}
                  {filteredMedicines.length === 0 && (
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