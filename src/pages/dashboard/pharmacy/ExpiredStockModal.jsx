

// import React, { useState } from 'react';
// import { FaTimes } from 'react-icons/fa';

// const ExpiredStockModal = ({ expiredMedicines, expiringThisMonth, onClose }) => {
//   const [showExpiring, setShowExpiring] = useState(false);

//   const medicinesToShow = showExpiring ? expiringThisMonth : expiredMedicines;
//   const title = showExpiring ? "Medicines Expiring This Month" : "Expired Medicines";

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-5">
//           <div className="flex justify-end mb-4">
//             <button
//               onClick={() => setShowExpiring(!showExpiring)}
//               className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition-colors text-sm"
//             >
//               {showExpiring ? 'Show All Expired' : 'Show Expiring This Month'}
//             </button>
//           </div>
//           <div className="overflow-y-auto max-h-80">
//             <table className="min-w-full border border-gray-200 text-sm">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="px-4 py-2 border text-left">Name</th>
//                   <th className="px-4 py-2 border text-left">Stock</th>
//                   <th className="px-4 py-2 border text-left">Expire Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {medicinesToShow.length > 0 ? (
//                   medicinesToShow.map((med) => (
//                     <tr key={med._id || med.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">{med.name}</td>
//                       {/* FIXED: This now defaults to 0 if stock is null or undefined */}
//                       <td className="px-4 py-2 border">{med.stock_quantity ?? med.stock ?? 0}</td>
//                       <td className="px-4 py-2 border font-medium text-red-700">
//                         {new Date(med.expiry_date || med.expireDate).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="text-center py-4 text-gray-500">
//                       {showExpiring ? 'No medicines are expiring this month.' : 'No expired medicines found.'}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExpiredStockModal;































import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ExpiredStockModal = ({ expiringThisMonth, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Medicines Expiring This Month</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-5">
          <div className="overflow-y-auto max-h-80">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 border text-left">Name</th>
                  <th className="px-4 py-2 border text-left">Stock</th>
                  <th className="px-4 py-2 border text-left">Expire Date</th>
                </tr>
              </thead>
              <tbody>
                {expiringThisMonth.length > 0 ? (
                  expiringThisMonth.map((med) => (
                    <tr key={med._id || med.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{med.name}</td>
                      <td className="px-4 py-2 border">{med.stock_quantity ?? med.stock ?? 0}</td>
                      <td className="px-4 py-2 border font-medium text-red-700">
                        {new Date(med.expiry_date || med.expireDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No medicines are expiring this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredStockModal;