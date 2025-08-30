// import React from 'react';
// import { useState, useEffect } from 'react';
// import apiClient from '../../../api/apiClient';
// import Layout from '../../../components/Layout';
// import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

// const ExpiredMedicineAlready = () => {
//   const [expiredMedicines, setExpiredMedicines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchExpiredMedicines = async () => {
//       try {
//         // This endpoint fetches only the medicines that have already expired
//         const response = await apiClient.get('/api/pharmacy/medicines/expired');
//         setExpiredMedicines(response.data);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch expired medicines.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExpiredMedicines();
//   }, []);

//   return (
//     <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h1 className="text-3xl font-bold text-gray-800">Expired Medicines</h1>
//           <p className="text-gray-500 mt-1">This is a list of all medicines that have passed their expiry date.</p>

//           <div className="mt-6 overflow-x-auto">
//             {loading ? (
//               <p className="text-center py-10 text-gray-600">Loading expired medicines...</p>
//             ) : error ? (
//               <p className="text-center py-10 text-red-600 font-semibold">{error}</p>
//             ) : (
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-100">
//                   <tr>
//                     <th scope="col" className="px-6 py-3">Medicine Name</th>
//                     <th scope="col" className="px-6 py-3">Stock</th>
//                     <th scope="col" className="px-6 py-3">Supplier</th>
//                     <th scope="col" className="px-6 py-3">Expiry Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {expiredMedicines.map((med) => (
//                     <tr key={med._id} className="bg-white border-b hover:bg-red-50">
//                       <td className="px-6 py-4 font-medium text-gray-900">{med.name}</td>
//                       <td className="px-6 py-4">{med.stock_quantity ?? 0}</td>
//                       <td className="px-6 py-4">{med.supplier}</td>
//                       <td className="px-6 py-4 font-bold text-red-700">
//                         {new Date(med.expiry_date).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//             {!loading && expiredMedicines.length === 0 && (
//               <div className="text-center py-10 text-gray-500">
//                 No expired medicines found.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ExpiredMedicineAlready;
























import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
// ICONS: Added FaRupeeSign for the modal
import {
  FaPlus, FaTimes, FaCapsules, FaTag, FaBarcode, FaBuilding,
  FaWeightHanging, FaHashtag, FaCalendarAlt, FaBoxes,
  FaClipboardList, FaRupeeSign
} from 'react-icons/fa';

// --- Reusable UI component for the details modal ---
const IconDetailItem = ({ icon, label, children }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 mt-0.5 text-teal-600 text-xl">
      {icon}
    </div>
    <div className="ml-3">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  </div>
);

// --- The Details Modal Component (Teal Themed) ---
const MedicineDetailsModal = ({ medicine, onClose }) => {
  if (!medicine) return null;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const batch = medicine.batch_number || medicine.batchNumber || medicine.batch || 'N/A';
  const sku = medicine.sku || medicine.SKU || 'N/A';
  const weight = medicine.weight || medicine.package_size || 'N/A';
  const manufacturer = medicine.manufacturer || medicine.supplier || medicine.provider || 'N/A';
  const status = medicine.status || 'Expired';
  const stock = medicine.stock_quantity ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-4 border-teal-500">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <FaCapsules className="text-3xl text-teal-600" />
            <h3 className="text-2xl font-bold text-gray-800">{medicine.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <IconDetailItem icon={<FaTag />} label="Category">{medicine.category || 'N/A'}</IconDetailItem>
            <IconDetailItem icon={<FaBuilding />} label="Supplier / Manufacturer">{manufacturer}</IconDetailItem>
            <IconDetailItem icon={<FaBarcode />} label="SKU">{sku}</IconDetailItem>
            {/* MODIFIED: Replaced dollar ($) with rupee (₹) symbol and icon */}
            <IconDetailItem icon={<FaRupeeSign />} label="Price / Unit">{`₹${medicine.price_per_unit ?? 'N/A'}`}</IconDetailItem>
            <IconDetailItem icon={<FaWeightHanging />} label="Weight">{weight}</IconDetailItem>
            <IconDetailItem icon={<FaHashtag />} label="Batch No.">{batch}</IconDetailItem>
            <IconDetailItem icon={<FaBoxes />} label="Stock">
              <span className="font-semibold text-gray-900">{stock} units</span>
            </IconDetailItem>
            <IconDetailItem icon={<FaCalendarAlt />} label="Expiry Date">
              <span className="font-bold text-red-700">{formatDate(medicine.expiry_date)}</span>
            </IconDetailItem>
            <IconDetailItem icon={<FaClipboardList />} label="Status">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                {status}
              </span>
            </IconDetailItem>
          </dl>
        </div>
      </div>
    </div>
  );
};


// --- Your Main Component, Now with a View Button ---
const ExpiredMedicineAlready = () => {
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  useEffect(() => {
    const fetchExpiredMedicines = async () => {
      try {
        const response = await apiClient.get('/api/pharmacy/medicines/expired');
        setExpiredMedicines(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch expired medicines.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpiredMedicines();
  }, []);

  const handleViewClick = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleCloseModal = () => {
    setSelectedMedicine(null);
  };

  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Expired Medicines</h1>
              <p className="text-gray-500 mt-1">A list of all medicines that have passed their expiry date.</p>
            </div>
            <Link
              to="/dashboard/pharmacy/add-medicine"
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors whitespace-nowrap"
            >
              <FaPlus /> Order Now
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-10 text-gray-600">Loading expired medicines...</p>
            ) : error ? (
              <p className="text-center py-10 text-red-600 font-semibold">{error}</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Medicine Name</th>
                    <th scope="col" className="px-6 py-3">Stock</th>
                    <th scope="col" className="px-6 py-3">Supplier</th>
                    <th scope="col" className="px-6 py-3">Expiry Date</th>
                    {/* MODIFIED: Added an Action column header */}
                    <th scope="col" className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredMedicines.map((med) => (
                    // MODIFIED: Removed onClick from the row
                    <tr key={med._id} className="bg-white border-b hover:bg-red-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{med.name}</td>
                      <td className="px-6 py-4">{med.stock_quantity ?? 0}</td>
                      <td className="px-6 py-4">{med.supplier}</td>
                      <td className="px-6 py-4 font-bold text-red-700">
                        {new Date(med.expiry_date).toLocaleDateString()}
                      </td>
                      {/* MODIFIED: Added a new cell with the View button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewClick(med)}
                          className="font-medium text-teal-600 hover:text-teal-800 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && expiredMedicines.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No expired medicines found.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedMedicine && (
        <MedicineDetailsModal
          medicine={selectedMedicine}
          onClose={handleCloseModal}
        />
      )}
    </Layout>
  );
};

export default ExpiredMedicineAlready;