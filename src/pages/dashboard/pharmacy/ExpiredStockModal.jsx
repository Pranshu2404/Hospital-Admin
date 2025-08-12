import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ExpiredStockModal = ({ medicines, onClose }) => {
  const [showExpiringToday, setShowExpiringToday] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day for accurate comparison
  const todayDateString = getTodayDateString();

  const allExpired = medicines.filter(med => new Date(med.expireDate) < today);
  const expiringToday = medicines.filter(med => med.expireDate === todayDateString);

  const medicinesToShow = showExpiringToday ? expiringToday : allExpired;
  const title = showExpiringToday ? "Medicines Expiring Today" : "Expired Medicines";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowExpiringToday(!showExpiringToday)}
              className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors text-sm"
            >
              {showExpiringToday ? 'Show All Expired' : 'Show Expiring Today'}
            </button>
          </div>
          <div className="overflow-y-auto max-h-80">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 border text-left">Name</th>
                  <th className="px-4 py-2 border text-left">Manufacturer</th>
                  <th className="px-4 py-2 border text-left">Stock</th>
                  <th className="px-4 py-2 border text-left">Expire Date</th>
                </tr>
              </thead>
              <tbody>
                {medicinesToShow.length > 0 ? (
                  medicinesToShow.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{med.name}</td>
                      <td className="px-4 py-2 border">{med.manufacturer}</td>
                      <td className="px-4 py-2 border">{med.stock}</td>
                      <td className="px-4 py-2 border font-medium text-red-700">{med.expireDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      {showExpiringToday ? 'No medicines are expiring today.' : 'No expired medicines found.'}
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