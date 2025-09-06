import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; // Adjust path as needed

const LowStockList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        // Call the new endpoint with a threshold of 5
        const response = await apiClient.get('/api/medicines/low-stock?threshold=5');
        setMedicines(response.data);
      } catch (err) {
        console.error("Failed to fetch low stock medicines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="font-bold text-lg text-red-600 mb-4">Low Stock Medicines (Less than 5)</h2>
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : medicines.length > 0 ? (
          medicines.map((med) => (
            <div key={med._id} className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">{med.name}</div>
                <div className="text-sm text-gray-500">{med.supplier}</div>
              </div>
              <div className="font-bold text-red-700">{med.stock_quantity} left</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No items with stock less than 5.</p>
        )}
      </div>
    </div>
  );
};

export default LowStockList;