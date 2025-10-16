import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint,
  FaCalendarAlt,
  FaMoneyBillWave
} from 'react-icons/fa';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSales();
  }, [page, dateFilter, statusFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiClient.get('/orders/sale', { params });
      setSales(response.data.sales);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching sales:', err);
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

  const getPaymentBadge = (method) => {
    const methods = {
      Cash: 'bg-green-100 text-green-800',
      Card: 'bg-blue-100 text-blue-800',
      UPI: 'bg-purple-100 text-purple-800',
      'Net Banking': 'bg-orange-100 text-orange-800',
      Insurance: 'bg-teal-100 text-teal-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methods[method] || 'bg-gray-100 text-gray-800'}`}>
        {method}
      </span>
    );
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
            Sales History
          </h1>
          <p className="text-gray-600">View and manage your pharmacy sales records</p>
        </div>
        <Link
          to="/dashboard/pharmacy/sales/pos"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaMoneyBillWave /> New Sale
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {sales.length} sales
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">{sale.sale_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">
                        {sale.patient_id 
                          ? `${sale.patient_id.first_name} ${sale.patient_id.last_name}`
                          : sale.customer_name
                        }
                      </div>
                      {sale.customer_phone && (
                        <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.sale_date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {sale.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {formatCurrency(sale.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentBadge(sale.payment_method)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/dashboard/pharmacy/sales/${sale._id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() => window.print()}
                        className="text-gray-600 hover:text-gray-800"
                        title="Print Receipt"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <div className="text-center py-12">
            <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sales records found</p>
            <Link
              to="/dashboard/pharmacy/sales/pos"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Make your first sale
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
            </div>
            <FaHistory className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(sales.reduce((total, sale) => total + sale.total_amount, 0))}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Sale</p>
              <p className="text-2xl font-bold text-teal-600">
                {formatCurrency(sales.length > 0 ? sales.reduce((total, sale) => total + sale.total_amount, 0) / sales.length : 0)}
              </p>
            </div>
            <FaCalendarAlt className="text-3xl text-teal-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;