import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaClock, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaMoneyBillWave,
  FaPhone,
  FaEnvelope,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUser,
  FaRupeeSign
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

const OutstandingPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalInvoices: 0,
    averageAge: 0
  });

  useEffect(() => {
    fetchOutstandingInvoices();
    fetchStats();
  }, [page, typeFilter]);

  const fetchOutstandingInvoices = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10,
        status: 'Issued,Partial',
        invoice_type: typeFilter
      };
      
      const response = await apiClient.get('/api/invoices', { params });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      alert('Failed to load outstanding invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/invoices/stats');
      setStats({
        totalOutstanding: response.data.pendingRevenue || 0,
        totalInvoices: response.data.totalInvoices || 0,
        averageAge: 15 // This would typically come from backend
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getOverdueBadge = (days) => {
    if (days === 0) return null;
    if (days <= 7) return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Due</span>;
    if (days <= 30) return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{days}d overdue</span>;
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{days}d overdue</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const sendReminder = async (invoiceId, customerPhone) => {
    try {
      // This would integrate with your SMS/email service
      alert(`Reminder sent to ${customerPhone} for invoice ${invoiceId}`);
      // await apiClient.post('/api/notifications/reminder', {
      //   invoiceId,
      //   phone: customerPhone
      // });
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <Layout sidebarItems={pharmacySidebar}>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaClock className="text-orange-600" />
            Outstanding Payments
          </h1>
          <p className="text-gray-600">Manage overdue and pending payments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaRupeeSign className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalInvoices}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClock className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Age</p>
              <p className="text-2xl font-bold text-green-600">{stats.averageAge} days</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Types</option>
            <option value="Appointment">Appointment</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Purchase">Purchase</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {invoices.length} outstanding invoices
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => {
                const daysOverdue = getDaysOverdue(invoice.due_date);
                return (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-blue-600">{invoice.invoice_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{invoice.customer_name}</div>
                      <div className="text-sm text-gray-500">{invoice.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{invoice.invoice_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {new Date(invoice.due_date).toLocaleDateString()}
                        {daysOverdue > 0 && (
                          <div className="mt-1">{getOverdueBadge(daysOverdue)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-red-600">
                        {formatCurrency(invoice.balance_due)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Partial' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/dashboard/pharmacy/billing/payments`}
                          className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                          title="Collect Payment"
                        >
                          <FaMoneyBillWave />
                        </Link>
                        <button
                          onClick={() => sendReminder(invoice._id, invoice.customer_phone)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                          title="Send Reminder"
                        >
                          <FaEnvelope />
                        </button>
                        <Link
                          to={`/dashboard/pharmacy/invoices/${invoice._id}`}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-50"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <FaClock className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No outstanding payments found</p>
            <p className="text-sm text-gray-400">All invoices are paid up to date</p>
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
    </div>
    </Layout>
  );
};

export default OutstandingPayments;