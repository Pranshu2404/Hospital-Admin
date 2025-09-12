import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { FaPlus, FaDownload } from 'react-icons/fa';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await apiClient.get('/api/invoices/pharmacy');
        setInvoices(response.data.invoices);
      } catch (err) {
        setError('Failed to fetch invoices.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDownload = async (invoiceId) => {
    setDownloading(prev => ({ ...prev, [invoiceId]: true }));
    try {
      const response = await apiClient.get(`/api/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const patientName = `${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim();
      const matchesSearch = invoice._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const getStatusBadge = (status) => {
    const statusClasses = { 
      'Paid': 'bg-green-100 text-green-800', 
      'Cancelled': 'bg-gray-100 text-gray-800', 
      'Unpaid': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100'}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Invoice Management</h1>
            <p className="text-gray-500 mt-1">Track and manage all pharmacy invoices.</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by invoice number, patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Invoices</div>
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Billed Amount</div>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Status Filter</div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <p className="text-center py-10">Loading invoices...</p>
          ) : error ? (
            <p className="text-center py-10 text-red-500">{error}</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Patient/Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {invoice.invoice_number || `...${invoice._id.slice(-6)}`}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.patient_id 
                        ? `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim()
                        : invoice.customer_name || 'Walk-in Customer'
                      }
                    </td>
                    <td className="px-6 py-4">
                      {new Date(invoice.issue_date || invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold">₹{invoice.total?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(invoice._id)}
                        disabled={downloading[invoice._id]}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download Invoice"
                      >
                        {downloading[invoice._id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                        ) : (
                          <FaDownload className="inline" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredInvoices.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No invoices found. {searchTerm && `No results for "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceListPage;