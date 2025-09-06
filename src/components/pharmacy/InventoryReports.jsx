import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaBoxes, 
  FaFilter,
  FaDownload,
  FaExclamationTriangle,
  FaChartBar,
  FaBoxOpen,
  FaMoneyBillWave
} from 'react-icons/fa';

const InventoryReports = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    lowStockThreshold: 10
  });

  useEffect(() => {
    fetchInventoryData();
  }, [filters.lowStockThreshold]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Fetch inventory data
      const inventoryRes = await apiClient.get('/api/medicines', {
        params: { 
          category: filters.category,
          supplier: filters.supplier,
          withStock: true
        }
      });
      setInventory(inventoryRes.data.medicines || inventoryRes.data);

      // Identify low stock items
      const lowStockItems = inventoryRes.data.medicines.filter(
        item => item.stock_quantity <= filters.lowStockThreshold
      );
      setLowStock(lowStockItems);

      // Fetch expiring batches (you'll need to implement this endpoint)
      try {
        const expiringRes = await apiClient.get('/api/medicines/expiring');
        setExpiring(expiringRes.data);
      } catch (err) {
        console.error('Error fetching expiring items:', err);
      }

    } catch (err) {
      console.error('Error fetching inventory data:', err);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'inventory') {
      csvContent += "Medicine,Category,Stock Quantity,Unit Price,Total Value\n";
      inventory.forEach(item => {
        csvContent += `${item.name},${item.category},${item.stock_quantity},${item.unit_price},${item.stock_quantity * item.unit_price}\n`;
      });
    } else if (type === 'lowstock') {
      csvContent += "Medicine,Current Stock,Threshold,Category\n";
      lowStock.forEach(item => {
        csvContent += `${item.name},${item.stock_quantity},${filters.lowStockThreshold},${item.category}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const totalInventoryValue = inventory.reduce(
    (total, item) => total + (item.stock_quantity * (item.unit_price || 0)), 
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxes className="text-teal-600" />
            Inventory Reports
          </h1>
          <p className="text-gray-600">Monitor medicine stock levels and values</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('inventory')}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Export Inventory
          </button>
          <button
            onClick={() => exportReport('lowstock')}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <FaDownload /> Export Low Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="Ointment">Ointments</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
            <input
              type="number"
              value={filters.lowStockThreshold}
              onChange={(e) => handleFilterChange('lowStockThreshold', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              min="1"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchInventoryData}
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
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{inventory.length}</p>
            </div>
            <FaBoxes className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalInventoryValue)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">{expiring.length}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 mb-3">
            <FaExclamationTriangle />
            <span className="font-medium">Low Stock Alert:</span>
            <span>{lowStock.length} items are below stock threshold</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {lowStock.slice(0, 4).map((item, index) => (
              <div key={index} className="text-sm text-orange-700">
                {item.name} ({item.stock_quantity} left)
              </div>
            ))}
            {lowStock.length > 4 && (
              <div className="text-sm text-orange-600">
                +{lowStock.length - 4} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Inventory Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.generic_name}</div>
                  </td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={item.stock_quantity <= filters.lowStockThreshold ? 'text-orange-600 font-medium' : ''}>
                      {item.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(item.unit_price)}</td>
                  <td className="px-6 py-4">{formatCurrency(item.stock_quantity * item.unit_price)}</td>
                  <td className="px-6 py-4">
                    {item.stock_quantity === 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Out of Stock</span>
                    ) : item.stock_quantity <= filters.lowStockThreshold ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;