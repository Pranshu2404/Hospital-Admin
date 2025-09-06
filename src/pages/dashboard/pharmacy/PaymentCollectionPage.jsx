import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle,
  FaTimesCircle,
  FaPrint,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaRupeeSign
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

const PaymentCollection = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Issued');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'Cash',
    reference: '',
    collected_by: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, typeFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10, 
        status: statusFilter,
        invoice_type: typeFilter
      };
      
      const response = await apiClient.get('/api/invoices', { params });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      alert('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/api/invoices/${selectedInvoice._id}/payment`, paymentData);
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentData({ amount: 0, method: 'Cash', reference: '', collected_by: '' });
      fetchInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Issued: { color: 'bg-yellow-100 text-yellow-800', icon: FaTimesCircle },
      Partial: { color: 'bg-blue-100 text-blue-800', icon: FaTimesCircle },
      Paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      Cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    
    const config = statusConfig[status] || statusConfig.Issued;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <Icon className="text-xs" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: invoice.balance_due,
      method: 'Cash',
      reference: '',
      collected_by: ''
    });
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <FaMoneyBillWave className="text-blue-600" />
            Payment Collection
          </h1>
          <p className="text-gray-600">Collect payments for issued invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Issued">Issued</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Appointment">Appointment</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Purchase">Purchase</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {invoices.length} invoices
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
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
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {formatCurrency(invoice.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-medium ${invoice.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(invoice.balance_due)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/dashboard/pharmacy/invoices/${invoice._id}`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="View Invoice"
                      >
                        <FaEye />
                      </Link>
                      {invoice.balance_due > 0 && (
                        <button
                          onClick={() => openPaymentModal(invoice)}
                          className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                          title="Collect Payment"
                        >
                          <FaMoneyBillWave />
                        </button>
                      )}
                      <Link
                        to={`/api/invoices/${invoice._id}/download`}
                        className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-50"
                        title="Download PDF"
                        target="_blank"
                      >
                        <FaDownload />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Collect Payment</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">Invoice: {selectedInvoice.invoice_number}</p>
              <p>Customer: {selectedInvoice.customer_name}</p>
              <p>Total: {formatCurrency(selectedInvoice.total)}</p>
              <p>Balance Due: {formatCurrency(selectedInvoice.balance_due)}</p>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={selectedInvoice.balance_due}
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  required
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Optional reference number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collected By *</label>
                <input
                  type="text"
                  required
                  value={paymentData.collected_by}
                  onChange={(e) => setPaymentData({...paymentData, collected_by: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter collector name"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default PaymentCollection;