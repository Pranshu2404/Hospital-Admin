import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaCalendarTimes, 
  FaExclamationTriangle,
  FaFilter,
  FaDownload,
  FaBox,
  FaClock
} from 'react-icons/fa';

const ExpiryReports = () => {
  const [expiringItems, setExpiringItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    daysThreshold: 30,
    category: ''
  });

  useEffect(() => {
    fetchExpiryData();
  }, [filters.daysThreshold]);

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      // Fetch expiring and expired items
      const [expiringRes, expiredRes] = await Promise.all([
        apiClient.get('/api/medicines/expiring', {
          params: { days: filters.daysThreshold, category: filters.category }
        }),
        apiClient.get('/api/medicines/expired', {
          params: { category: filters.category }
        })
      ]);
      
      setExpiringItems(expiringRes.data);
      setExpiredItems(expiredRes.data);
    } catch (err) {
      console.error('Error fetching expiry data:', err);
      // Mock data for demonstration
      setExpiringItems([
        {
          _id: '1',
          medicine_id: { name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin' },
          batch_number: 'BATCH001',
          expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          quantity: 50,
          purchase_price: 5.00,
          selling_price: 8.50
        },
        {
          _id: '2',
          medicine_id: { name: 'Paracetamol 500mg', generic_name: 'Paracetamol' },
          batch_number: 'BATCH002',
          expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          quantity: 100,
          purchase_price: 2.00,
          selling_price: 4.00
        }
      ]);
      setExpiredItems([
        {
          _id: '3',
          medicine_id: { name: 'Vitamin C 100mg', generic_name: 'Ascorbic Acid' },
          batch_number: 'BATCH003',
          expiry_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          quantity: 25,
          purchase_price: 3.00,
          selling_price: 6.00
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const items = type === 'expiring' ? expiringItems : expiredItems;
    
    csvContent += "Medicine,Batch Number,Expiry Date,Days Until Expiry,Quantity,Purchase Value\n";
    items.forEach(item => {
      const days = type === 'expiring' ? daysUntilExpiry(item.expiry_date) : 'EXPIRED';
      csvContent += `${item.medicine_id.name},${item.batch_number},${formatDate(item.expiry_date)},${days},${item.quantity},${item.quantity * item.purchase_price}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_items_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const totalExpiringValue = expiringItems.reduce(
    (total, item) => total + (item.quantity * item.purchase_price), 
    0
  );

  const totalExpiredValue = expiredItems.reduce(
    (total, item) => total + (item.quantity * item.purchase_price), 
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarTimes className="text-teal-600" />
            Expiry Reports
          </h1>
          <p className="text-gray-600">Monitor medicine expiration dates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('expiring')}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <FaDownload /> Export Expiring
          </button>
          <button
            onClick={() => exportReport('expired')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <FaDownload /> Export Expired
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days Threshold</label>
            <input
              type="number"
              value={filters.daysThreshold}
              onChange={(e) => handleFilterChange('daysThreshold', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Categories</option>
              <option value="Tablet">Tablets</option>
              <option value="Capsule">Capsules</option>
              <option value="Syrup">Syrups</option>
              <option value="Injection">Injections</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchExpiryData}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{expiringItems.length}</p>
            </div>
            <FaClock className="text-3xl text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{expiredItems.length}</p>
            </div>
            <FaCalendarTimes className="text-3xl text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Value</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalExpiringValue)}
              </p>
            </div>
            <FaExclamationTriangle className="text-3xl text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Value</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpiredValue)}
              </p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
        </div>
      </div>

      {/* Expiring Items */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
            <FaClock className="text-orange-600" />
            Items Expiring in Next {filters.daysThreshold} Days
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiringItems.map((item) => {
                const daysLeft = daysUntilExpiry(item.expiry_date);
                return (
                  <tr key={item._id} className="hover:bg-orange-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.medicine_id.name}</div>
                      <div className="text-sm text-gray-500">{item.medicine_id.generic_name}</div>
                    </td>
                    <td className="px-6 py-4">{item.batch_number}</td>
                    <td className="px-6 py-4">{formatDate(item.expiry_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                        daysLeft <= 14 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {daysLeft} days
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">{formatCurrency(item.quantity * item.purchase_price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expiringItems.length === 0 && (
          <div className="text-center py-8">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No items expiring in the next {filters.daysThreshold} days</p>
          </div>
        )}
      </div>

      {/* Expired Items */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
            <FaCalendarTimes className="text-red-600" />
            Expired Items
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Expired</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiredItems.map((item) => {
                const daysExpired = Math.abs(daysUntilExpiry(item.expiry_date));
                return (
                  <tr key={item._id} className="hover:bg-red-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.medicine_id.name}</div>
                      <div className="text-sm text-gray-500">{item.medicine_id.generic_name}</div>
                    </td>
                    <td className="px-6 py-4">{item.batch_number}</td>
                    <td className="px-6 py-4">{formatDate(item.expiry_date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {daysExpired} days ago
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">{formatCurrency(item.quantity * item.purchase_price)}</td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                        Dispose
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expiredItems.length === 0 && (
          <div className="text-center py-8">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expired items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiryReports;