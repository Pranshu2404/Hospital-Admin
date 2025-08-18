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
import { Link } from 'react-router-dom'; // ADDED: Import for navigation
import { FaPlus } from 'react-icons/fa'; // ADDED: Icon for the button
import apiClient from '../../../api/apiClient';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const ExpiredMedicineAlready = () => {
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* --- HEADER UPDATED --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Expired Medicines</h1>
              <p className="text-gray-500 mt-1">This is a list of all medicines that have passed their expiry date.</p>
            </div>
            {/* --- ADDED "ORDER NOW" BUTTON --- */}
            <Link
              to="/dashboard/pharmacy/add-medicine"
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 whitespace-nowrap"
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
                  </tr>
                </thead>
                <tbody>
                  {expiredMedicines.map((med) => (
                    <tr key={med._id} className="bg-white border-b hover:bg-red-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{med.name}</td>
                      <td className="px-6 py-4">{med.stock_quantity ?? 0}</td>
                      <td className="px-6 py-4">{med.supplier}</td>
                      <td className="px-6 py-4 font-bold text-red-700">
                        {new Date(med.expiry_date).toLocaleDateString()}
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
    </Layout>
  );
};

export default ExpiredMedicineAlready;