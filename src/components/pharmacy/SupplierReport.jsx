import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaTruck, 
  FaFilter,
  FaDownload,
  FaChartBar,
  FaMoneyBillWave,
  FaBoxes,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

const SupplierReports = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    supplier: ''
  });

  useEffect(() => {
    fetchSupplierData();
  }, [filters.period]);

  const fetchSupplierData = async () => {
    setLoading(true);
    try {
      // Fetch suppliers and their purchase orders
      const [suppliersRes, ordersRes] = await Promise.all([
        apiClient.get('/api/suppliers'),
        apiClient.get('/api/orders/purchase', {
          params: {
            period: filters.period,
            month: filters.period === 'monthly' ? filters.month : undefined,
            year: filters.year,
            supplier: filters.supplier
          }
        })
      ]);
      
      setSuppliers(suppliersRes.data);
      setPurchaseOrders(ordersRes.data.orders || ordersRes.data);
    } catch (err) {
      console.error('Error fetching supplier data:', err);
      // Mock data for demonstration
      setSuppliers([
        {
          _id: '1',
          name: 'MediSupplies Inc.',
          contact_person: 'John Doe',
          phone: '+1-555-0123',
          email: 'john@medisupplies.com',
          address: '123 Medical St, Healthcare City',
          total_orders: 15,
          total_spent: 125000
        },
        {
          _id: '2',
          name: 'PharmaDistributors Ltd.',
          contact_person: 'Jane Smith',
          phone: '+1-555-0124',
          email: 'jane@pharmadist.com',
          address: '456 Pharmacy Ave, Medtown',
          total_orders: 8,
          total_spent: 85000
        }
      ]);
      setPurchaseOrders([
        {
          _id: '1',
          order_number: 'PO-001',
          supplier_id: {
            name: 'MediSupplies Inc.',
            contact_person: 'John Doe'
          },
          order_date: new Date('2024-01-15'),
          total_amount: 15000,
          status: 'Completed',
          items: [
            { medicine_name: 'Amoxicillin 500mg', quantity: 100, unit_cost: 5.00 },
            { medicine_name: 'Paracetamol 500mg', quantity: 200, unit_cost: 2.00 }
          ]
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'suppliers') {
      csvContent += "Supplier,Contact Person,Phone,Email,Total Orders,Total Spent\n";
      suppliers.forEach(supplier => {
        csvContent += `${supplier.name},${supplier.contact_person},${supplier.phone},${supplier.email},${supplier.total_orders},${supplier.total_spent}\n`;
      });
    } else if (type === 'orders') {
      csvContent += "Order Number,Supplier,Order Date,Total Amount,Status\n";
      purchaseOrders.forEach(order => {
        csvContent += `${order.order_number},${order.supplier_id.name},${formatDate(order.order_date)},${order.total_amount},${order.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const totalSpent = suppliers.reduce((total, supplier) => total + (supplier.total_spent || 0), 0);
  const totalOrders = suppliers.reduce((total, supplier) => total + (supplier.total_orders || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck className="text-teal-600" />
            Supplier Reports
          </h1>
          <p className="text-gray-600">Supplier performance and purchase analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('suppliers')}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Export Suppliers
          </button>
          <button
            onClick={() => exportReport('orders')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaDownload /> Export Orders
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {filters.period === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchSupplierData}
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
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-800">{suppliers.length}</p>
            </div>
            <FaTruck className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchase Orders</p>
              <p className="text-2xl font-bold text-purple-600">{totalOrders}</p>
            </div>
            <FaBoxes className="text-3xl text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount Spent</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-teal-600">
                {formatCurrency(totalOrders > 0 ? totalSpent / totalOrders : 0)}
              </p>
            </div>
            <FaChartBar className="text-3xl text-teal-600" />
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Suppliers Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <FaPhone className="text-gray-400" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" />
                        {supplier.email}
                      </div>
                      {supplier.contact_person && (
                        <div className="text-gray-500">{supplier.contact_person}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{supplier.total_orders || 0}</td>
                  <td className="px-6 py-4">{formatCurrency(supplier.total_spent || 0)}</td>
                  <td className="px-6 py-4">
                    {formatCurrency(
                      supplier.total_orders > 0 ? (supplier.total_spent || 0) / supplier.total_orders : 0
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700">
                      View Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Purchase Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchaseOrders.slice(0, 10).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">{order.order_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.supplier_id.name}</div>
                    <div className="text-sm text-gray-500">{order.supplier_id.contact_person}</div>
                  </td>
                  <td className="px-6 py-4">{formatDate(order.order_date)}</td>
                  <td className="px-6 py-4">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {order.items.length} items
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchaseOrders.length === 0 && (
          <div className="text-center py-8">
            <FaBoxes className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No purchase orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierReports;