import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaArrowUp, 
  FaArrowDown,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaFilter,
  FaHistory
} from 'react-icons/fa';

const StockAdjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adjustmentsRes, medicinesRes] = await Promise.all([
          apiClient.get('/stock-adjustments?limit=50'),
          apiClient.get('/medicines?limit=100')
        ]);

        setAdjustments(adjustmentsRes.data.adjustments || adjustmentsRes.data);
        setMedicines(medicinesRes.data.medicines || medicinesRes.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch = adjustment.medicine_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adjustment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter ? adjustment.adjustment_type === typeFilter : true;
    
    return matchesSearch && matchesType;
  });

  const getAdjustmentIcon = (type) => {
    switch (type) {
      case 'Addition': return <FaArrowUp className="text-green-600" />;
      case 'Deduction': return <FaArrowDown className="text-red-600" />;
      case 'Damage': return <FaExclamationTriangle className="text-orange-600" />;
      case 'Expiry': return <FaCalendarTimes className="text-red-600" />;
      default: return <FaBox className="text-gray-600" />;
    }
  };

  const getAdjustmentColor = (type) => {
    switch (type) {
      case 'Addition': return 'text-green-600 bg-green-100';
      case 'Deduction': return 'text-red-600 bg-red-100';
      case 'Damage': return 'text-orange-600 bg-orange-100';
      case 'Expiry': return 'text-red-600 bg-red-100';
      case 'Correction': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
            <FaHistory className="text-teal-600" />
            Stock Adjustments
          </h1>
          <p className="text-gray-600">Track all inventory adjustments and changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search adjustments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Types</option>
            <option value="Addition">Additions</option>
            <option value="Deduction">Deductions</option>
            <option value="Damage">Damage</option>
            <option value="Expiry">Expiry</option>
            <option value="Correction">Corrections</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredAdjustments.length} of {adjustments.length} adjustments
          </div>
        </div>
      </div>

      {/* Adjustments List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdjustments.map((adjustment) => (
                <tr key={adjustment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(adjustment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(adjustment.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {adjustment.medicine_id?.name || 'Unknown Medicine'}
                    </div>
                    {adjustment.batch_id && (
                      <div className="text-sm text-gray-500">
                        Batch: {adjustment.batch_id?.batch_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getAdjustmentIcon(adjustment.adjustment_type)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAdjustmentColor(adjustment.adjustment_type)}`}>
                        {adjustment.adjustment_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 font-medium ${
                      adjustment.adjustment_type === 'Addition' ? 'text-green-600' :
                      adjustment.adjustment_type === 'Deduction' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {adjustment.adjustment_type === 'Addition' ? '+' : '-'}
                      {adjustment.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{adjustment.reason}</div>
                    {adjustment.notes && (
                      <div className="text-xs text-gray-500 mt-1">{adjustment.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {adjustment.adjusted_by?.name || 'System'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdjustments.length === 0 && (
          <div className="text-center py-12">
            <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No stock adjustments found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || typeFilter ? 'Try adjusting your filters' : 'Adjustments will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {adjustments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{adjustments.length}</div>
              <div className="text-sm text-gray-600">Total Adjustments</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {adjustments.filter(a => a.adjustment_type === 'Addition').length}
              </div>
              <div className="text-sm text-gray-600">Additions</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {adjustments.filter(a => a.adjustment_type === 'Deduction').length}
              </div>
              <div className="text-sm text-gray-600">Deductions</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {adjustments.filter(a => a.adjustment_type === 'Damage' || a.adjustment_type === 'Expiry').length}
              </div>
              <div className="text-sm text-gray-600">Losses</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustments;