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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Fetches all pharmacy invoices from the endpoint we created
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

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const patientName = `${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim();
      const matchesSearch = invoice._id.toLowerCase().includes(searchTerm.toLowerCase()) || patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const getStatusBadge = (status) => {
    const statusClasses = { 'Paid': 'bg-green-100 text-green-800', 'Cancelled': 'bg-gray-100 text-gray-800', 'Unpaid': 'bg-yellow-100 text-yellow-800' };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100'}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice Management</h1>
            <p className="text-gray-500 mt-1">Track and manage all patient invoices.</p>
          </div>
          {/* <Link to="/dashboard/finance/create-invoice" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
            <FaPlus /> Create Invoice
          </Link> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Total Invoices</div>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Total Billed Amount</div>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Status Filter</div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg">
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? <p className="text-center py-10">Loading...</p> : error ? <p className="text-center py-10 text-red-500">{error}</p> : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">Invoice ID</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">...{invoice._id.slice(-6)}</td>
                    <td className="px-6 py-4">{`${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || 'N/A'}`}</td>
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold">${invoice.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
                    <td className="px-6 py-4 text-center">
                      <a href={`${apiClient.defaults.baseURL}/api/pharmacy-invoices/${invoice._id}/download`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <FaDownload />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredInvoices.length === 0 && <div className="text-center py-10 text-gray-500">No invoices found.</div>}
        </div>
      </div>
    </div>
  );
};

export default InvoiceListPage;