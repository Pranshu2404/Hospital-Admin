import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaCalendarTimes, 
  FaTrash, 
  FaExclamationTriangle,
  FaBox,
  FaRupeeSign
} from 'react-icons/fa';

const ExpiredMedicines = () => {
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpiredMedicines = async () => {
      try {
        const response = await apiClient.get('/medicines/expired');
        setExpiredMedicines(response.data);
      } catch (err) {
        setError('Failed to fetch expired medicines. Please try again later.');
        console.error('Error fetching expired medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredMedicines();
  }, []);

  const handleDispose = async (medicineId) => {
    if (!window.confirm('Are you sure you want to dispose of this expired medicine? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.post('/stock-adjustments', {
        medicine_id: medicineId,
        adjustment_type: 'Expiry',
        quantity: 0, // This will be set to the current stock quantity
        reason: 'Disposal of expired medicine',
        notes: 'Automated disposal process'
      });

      // Remove from local state
      setExpiredMedicines(prev => prev.filter(med => med._id !== medicineId));
      
      alert('Medicine disposed successfully');
    } catch (err) {
      alert('Failed to dispose medicine. Please try again.');
      console.error('Error disposing medicine:', err);
    }
  };

  const totalLoss = expiredMedicines.reduce((sum, med) => {
    return sum + (med.price_per_unit * (med.stock_quantity || 0));
  }, 0);

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
            <FaCalendarTimes className="text-red-600" />
            Expired Medicines
          </h1>
          <p className="text-gray-600">Manage and dispose of expired stock</p>
        </div>
        
        {expiredMedicines.length > 0 && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              <span className="text-red-800 font-medium">
                Total Loss: ₹{totalLoss.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{expiredMedicines.length}</p>
            </div>
            <FaCalendarTimes className="text-3xl text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-800">
                {expiredMedicines.reduce((sum, med) => sum + (med.stock_quantity || 0), 0)}
              </p>
            </div>
            <FaBox className="text-3xl text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Financial Impact</p>
              <p className="text-2xl font-bold text-red-600">₹{totalLoss.toFixed(2)}</p>
            </div>
            <FaRupeeSign className="text-3xl text-red-600" />
          </div>
        </div>
      </div>

      {/* Expired Medicines List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiredMedicines.map((medicine) => (
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
                    <span className="text-sm text-gray-600">{medicine.batch_number || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-600 font-medium">
                      {new Date(medicine.expiry_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{medicine.stock_quantity || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-600 font-medium">
                      ₹{(medicine.price_per_unit * (medicine.stock_quantity || 0)).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDispose(medicine._id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <FaTrash /> Dispose
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expiredMedicines.length === 0 && (
          <div className="text-center py-12">
            <FaBox className="text-4xl text-green-300 mx-auto mb-4" />
            <p className="text-green-600 font-medium">No expired medicines found</p>
            <p className="text-sm text-green-500">All medicines are within validity period</p>
          </div>
        )}
      </div>

      {/* Important Notice */}
      {expiredMedicines.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Important Notice</h3>
              <p className="text-sm text-red-700">
                Expired medicines must be disposed of properly according to regulatory guidelines. 
                Do not sell or distribute expired medications. Record all disposals in the system 
                for audit purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredMedicines;