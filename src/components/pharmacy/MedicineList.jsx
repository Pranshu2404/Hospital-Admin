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
import apiClient from '../../api/apiClient';
// Icons (no change in imports)
import { 
  FaPlus, FaTimes, FaSearch, FaCopy, FaCapsules, FaTag, FaBarcode, 
  FaBuilding, FaDollarSign, FaWeightHanging, FaFileInvoiceDollar, 
  FaHashtag, FaCalendarAlt, FaBoxes, FaClipboardList 
} from 'react-icons/fa';

// --- Helper component for the modal ---
const IconDetailItem = ({ icon, label, children }) => (
  <div className="flex items-start">
    {/* MODIFIED: Increased icon size and changed color to green */}
    <div className="flex-shrink-0 w-6 mt-0.5 text-teal-600 text-xl">
      {icon}
    </div>
    <div className="ml-3">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  </div>
);


// --- REFINED: MedicineDetailsModal with green theme and larger elements ---
const MedicineDetailsModal = ({ medicine, onClose }) => {
  if (!medicine) return null;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  // --- Data normalization (unchanged) ---
  const batch = medicine.batch_number || medicine.batchNumber || medicine.batch || 'N/A';
  const sku = medicine.sku || medicine.SKU || 'N/A';
  const weight = medicine.weight || medicine.package_size || 'N/A';
  const manufacturer = medicine.manufacturer || medicine.supplier || medicine.provider || 'N/A';
  const manufacturerPrice = medicine.manufacturerPrice || medicine.manufacturer_price || medicine.mrp || 'N/A';
  const status = medicine.status || medicine.state || 'Active';
  const stock = medicine.stock_quantity ?? 0;

  // --- UI logic for dynamic styles (unchanged) ---
  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-teal-100 text-teal-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStockColor = () => {
    if (stock === 0) return 'text-red-600 font-bold';
    if (stock < 20) return 'text-orange-600 font-semibold';
    return 'text-gray-900';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300 animate-fadeIn">
      {/* MODIFIED: Changed top border to green */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 animate-scaleUp border-t-4 border-teal-500">
        
        {/* MODIFIED: Modal Header with larger icon and text */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            {/* Icon is larger */}
            <FaCapsules className="text-3xl text-teal-600" />
            {/* Heading is larger */}
            <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body (unchanged) */}
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <IconDetailItem icon={<FaTag />} label="Category">{medicine.category || 'N/A'}</IconDetailItem>
            <IconDetailItem icon={<FaBuilding />} label="Supplier / Manufacturer">{manufacturer}</IconDetailItem>
            <IconDetailItem icon={<FaBarcode />} label="SKU">{sku}</IconDetailItem>
            <IconDetailItem icon={<FaDollarSign />} label="Price / Unit">{`₹${medicine.price_per_unit ?? 'N/A'}`}</IconDetailItem>
            <IconDetailItem icon={<FaWeightHanging />} label="Weight">{weight}</IconDetailItem>
            <IconDetailItem icon={<FaFileInvoiceDollar />} label="Manufacturer Price">{manufacturerPrice}</IconDetailItem>
            <IconDetailItem icon={<FaHashtag />} label="Batch No.">{batch}</IconDetailItem>
            <IconDetailItem icon={<FaCalendarAlt />} label="Expiry Date">{formatDate(medicine.expiry_date)}</IconDetailItem>
            <IconDetailItem icon={<FaBoxes />} label="Stock">
              <span className={getStockColor()}>{stock} units</span>
            </IconDetailItem>
            <IconDetailItem icon={<FaClipboardList />} label="Status">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge()}`}>
                {status}
              </span>
            </IconDetailItem>
            <div className="sm:col-span-2 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <dt className="text-sm font-medium text-gray-600 mb-1">Additional Details</dt>
              <dd className="text-sm text-gray-700 whitespace-pre-wrap">
                {medicine.details || medicine.description || 'No additional details provided.'}
              </dd>
            </div>
          </dl>
        </div>

        {/* REMOVED: The entire footer with the "Close" and "Copy JSON" buttons has been removed. */}

      </div>
    </div>
  );
};


// --- MedicineList Component ---
const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Medicine Inventory</h1>
          {/* MODIFIED: "Add Medicine" button is now green */}
          <Link to="/dashboard/pharmacy/add-medicine" className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            <FaPlus /> Add Medicine
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="relative flex-grow">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            {/* MODIFIED: Search input focus ring is now green */}
            <input
              type="text"
              placeholder="Search by medicine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
            />
          </div>
          {/* MODIFIED: Select dropdown focus ring is now green */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier._id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          {loading && <p className="text-center py-10 text-gray-500">Loading medicines...</p>}
          {error && <p className="text-center py-10 text-red-500 font-medium">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.stock_quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{med.price_per_unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.batch_number || med.batchNumber || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* MODIFIED: "View Details" button text is now green */}
                      <button onClick={() => handleViewClick(med)} className="text-teal-600 hover:text-teal-800 font-semibold">View Details</button>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No medicines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedMedicine && <MedicineDetailsModal medicine={selectedMedicine} onClose={handleCloseModal} />}
    </div>
  );
};

export default MedicineList;