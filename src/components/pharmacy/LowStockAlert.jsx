import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaExclamationTriangle, 
  FaBox, 
  FaRupeeSign,
  FaShoppingCart,
  FaChartLine
} from 'react-icons/fa';

const LowStockAlert = () => {
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLowStockMedicines = async () => {
      try {
        const response = await apiClient.get('/api/medicines/low-stock');
        setLowStockMedicines(response.data);
      } catch (err) {
        setError('Failed to fetch low stock medicines. Please try again later.');
        console.error('Error fetching low stock medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockMedicines();
  }, []);

  const getUrgencyLevel = (quantity, minStock) => {
    const min = minStock || 10;
    const percentage = (quantity / min) * 100;
    
    if (quantity === 0) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage < 25) return { level: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage < 50) return { level: 'medium', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-600" />
            Low Stock Alerts
          </h1>
          <p className="text-gray-600">Medicines that need restocking attention</p>
        </div>
        <Link 
          to="/dashboard/pharmacy/purchasing/create-order"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaShoppingCart /> Create Purchase Order
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockMedicines.length}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Items</p>
              <p className="text-2xl font-bold text-red-600">
                {lowStockMedicines.filter(m => m.stock_quantity === 0).length}
              </p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value at Risk</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{lowStockMedicines.reduce((sum, med) => sum + (med.price_per_unit * med.stock_quantity), 0).toFixed(2)}
              </p>
            </div>
            <FaChartLine className="text-3xl text-gray-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Medicines */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lowStockMedicines.map((medicine) => {
                const urgency = getUrgencyLevel(medicine.stock_quantity, medicine.min_stock_level);
                const needed = (medicine.min_stock_level || 10) - medicine.stock_quantity;
                
                return (
                  <tr key={medicine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        {medicine.generic_name && (
                          <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{medicine.stock_quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{medicine.min_stock_level || 10}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                        {urgency.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaRupeeSign className="text-gray-400" />
                        <span>{medicine.price_per_unit?.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/dashboard/pharmacy/purchasing/create-order"
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        Order Now
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {lowStockMedicines.length === 0 && (
          <div className="text-center py-12">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No low stock items found</p>
            <p className="text-sm text-gray-400">All medicines are adequately stocked</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-blue-800">Quick Actions</h3>
              <p className="text-sm text-blue-600">
                {lowStockMedicines.length} items need immediate attention
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/dashboard/pharmacy/purchasing/create-order"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Bulk Order
              </Link>
              <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                Export List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;