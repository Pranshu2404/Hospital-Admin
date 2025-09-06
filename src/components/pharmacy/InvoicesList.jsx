import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaFileInvoice, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaPlus,
  FaDownload,
  FaTimes
} from 'react-icons/fa';

// View Invoice Modal Component
const ViewInvoiceModal = ({ invoice, isOpen, onClose, onDownloadPDF }) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      Draft: 'bg-gray-100 text-gray-800',
      Issued: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Partial: 'bg-yellow-100 text-yellow-800',
      Overdue: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Refunded: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statuses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Invoice Details - {invoice.invoice_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Invoice Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Invoice Number:</span> {invoice.invoice_number}</p>
                <p><span className="font-medium">Type:</span> {invoice.invoice_type}</p>
                <p><span className="font-medium">Status:</span> {getStatusBadge(invoice.status)}</p>
                <p><span className="font-medium">Issue Date:</span> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {invoice.customer_name || (invoice.patient_id ? `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}` : 'N/A')}</p>
                <p><span className="font-medium">Phone:</span> {invoice.customer_phone || 'N/A'}</p>
                <p><span className="font-medium">Type:</span> {invoice.customer_type}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Unit Price</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Medicine Items */}
                  {invoice.medicine_items?.map((item, index) => (
                    <tr key={`medicine-${index}`}>
                      <td className="px-4 py-3 text-sm">
                        {item.medicine_id?.name || item.medicine_name || 'Medicine Item'}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(item.unit_price * item.quantity)}</td>
                    </tr>
                  ))}
                  
                  {/* Service Items */}
                  {invoice.service_items?.map((item, index) => (
                    <tr key={`service-${index}`}>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Discount:</span>
                    <span className="text-red-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="text-green-600">{formatCurrency(invoice.amount_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Balance Due:</span>
                  <span className={invoice.balance_due > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(invoice.balance_due)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payment_history?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Payment History</h3>
              <div className="space-y-2">
                {invoice.payment_history.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{payment.method} - {payment.reference || 'No reference'}</p>
                    </div>
                    <span className="text-green-600 font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onDownloadPDF(invoice._id)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [page, typeFilter, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10,
        type: typeFilter,
        status: statusFilter
      };
      
      const response = await apiClient.get('/api/invoices', { params });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/api/invoices/${invoiceId}`);
      setSelectedInvoice(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      setPdfLoading(true);
      const response = await apiClient.get(`/api/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedInvoice?.invoice_number || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error downloading PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      Draft: 'bg-gray-100 text-gray-800',
      Issued: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Partial: 'bg-yellow-100 text-yellow-800',
      Overdue: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Refunded: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statuses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      Pharmacy: 'bg-teal-100 text-teal-800',
      Appointment: 'bg-blue-100 text-blue-800',
      Mixed: 'bg-purple-100 text-purple-800',
      Purchase: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${types[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customer_name && invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (invoice.customer_phone && invoice.customer_phone.includes(searchTerm))
  );

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
            <FaFileInvoice className="text-teal-600" />
            Invoices Management
          </h1>
          <p className="text-gray-600">Manage your pharmacy invoices and billing</p>
        </div>
        <Link
          to="/dashboard/pharmacy/sales/create-invoice"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaPlus /> Create Invoice
        </Link>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Types</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Appointment">Appointment</option>
            <option value="Mixed">Mixed</option>
            <option value="Purchase">Purchase</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredInvoices.length} invoices
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">{invoice.invoice_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">
                        {invoice.customer_name || (invoice.patient_id ? `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}` : 'N/A')}
                      </div>
                      {invoice.customer_phone && (
                        <div className="text-sm text-gray-500">{invoice.customer_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(invoice.invoice_type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: {formatCurrency(invoice.amount_paid)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewInvoice(invoice._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Invoice"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="text-gray-600 hover:text-gray-800"
                        title="Print Invoice"
                      >
                        <FaPrint />
                      </button>
                      {invoice.status !== 'Paid' && (
                        <Link
                          to={`/dashboard/pharmacy/sales/invoices/${invoice._id}/payment`}
                          className="text-green-600 hover:text-green-800"
                          title="Record Payment"
                        >
                          <FaMoneyBillWave />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FaFileInvoice className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <Link
              to="/dashboard/pharmacy/sales/create-invoice"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Create your first invoice
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
            </div>
            <FaFileInvoice className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(invoices.reduce((total, inv) => total + inv.total, 0))}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(invoices.reduce((total, inv) => total + (inv.total - inv.amount_paid), 0))}
              </p>
            </div>
            <FaCalendarAlt className="text-3xl text-red-600" />
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      <ViewInvoiceModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default InvoicesList;