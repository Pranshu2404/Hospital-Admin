import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import {
  FaPlus,
  FaDownload,
  FaSearch,
  FaFilter,
  FaEye,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaUserMd,
  FaFileInvoice,
  FaPrint,
  FaCheckCircle
} from 'react-icons/fa';

const InvoiceListPage = ({ onViewDetails, defaultType }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: defaultType || 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0
  });
  const [totalInvoices, setTotalInvoices] = useState(0);

  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [printableInvoice, setPrintableInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchHospitalInfo();
    fetchDoctors();
  }, [filters.status, filters.type, filters.dateRange, filters.page, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (printableInvoice) {
      // Allow time for DOM to update
      const timer = setTimeout(() => {
        window.print();
        // Optional: Reset after print dialog triggers/closes
        // setPrintableInvoice(null); 
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printableInvoice]);

  const handleMarkAsPaid = async (invoiceId, amountDue) => {
    if (!window.confirm(`Mark this invoice as PAID? \n\nAmount: ₹${amountDue}\nMethod: Cash`)) return;

    try {
      await apiClient.put(`/invoices/${invoiceId}/payment`, {
        amount: amountDue,
        method: 'Cash',
        reference: 'Quick Pay'
      });
      fetchInvoices();
      fetchStats();
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Failed to update payment status.");
    }
  };

  const fetchStats = async () => {
    try {
      const params = {
        invoice_type: filters.type !== 'all' ? filters.type : undefined
      };

      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate, endDate;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          default:
            break;
        }

        if (startDate && endDate) {
          params.startDate = startDate.toISOString().split('T')[0];
          params.endDate = endDate.toISOString().split('T')[0];
        }
      }

      const response = await apiClient.get('/invoices/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const res = await apiClient.get('/hospitals');
      if (res.data && res.data.length > 0) {
        setHospitalInfo(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching hospital info:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const getDoctorName = () => {
    if (!printableInvoice) return 'N/A';
    let doc = null;
    const inv = printableInvoice;

    if (inv.doctor_id) {
      if (typeof inv.doctor_id === 'object') doc = inv.doctor_id;
      else doc = doctors.find(d => d._id === inv.doctor_id);
    }

    if (!doc && inv.appointment_id) {
      if (typeof inv.appointment_id === 'object' && inv.appointment_id.doctor_id) {
        if (typeof inv.appointment_id.doctor_id === 'object') doc = inv.appointment_id.doctor_id;
        else doc = doctors.find(d => d._id === inv.appointment_id.doctor_id);
      }
    }

    if (doc && (doc.firstName || doc.first_name || doc.name)) {
      return `${doc.firstName || doc.first_name || doc.name || ''} ${doc.lastName || doc.last_name || ''}`.trim();
    }
    return 'N/A';
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        invoice_type: filters.type !== 'all' ? filters.type : undefined,
        page: filters.page,
        limit: filters.limit
      };

      // Add date range filter if specified
      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else if (filters.dateRange !== 'all') {
        // Handle other date ranges (today, week, month, etc.)
        const now = new Date();
        let startDate, endDate;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          default:
            break;
        }

        if (startDate && endDate) {
          params.startDate = startDate.toISOString().split('T')[0];
          params.endDate = endDate.toISOString().split('T')[0];
        }
      }

      const response = await apiClient.get('/invoices', { params });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
      setTotalInvoices(response.data.total);
    } catch (err) {
      setError('Failed to fetch invoices.');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const patientName = invoice.patient_id ? `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim() : (invoice.customer_name || '');
      const doctorName = invoice.appointment_id?.doctor_id ? `${invoice.appointment_id.doctor_id.firstName || ''} ${invoice.appointment_id.doctor_id.lastName || ''}`.trim() : '';

      const matchesSearch =
        (invoice.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.patient_id?.patientId?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [invoices, searchTerm]);

  // Calculations based on currently fetched page (Note: ideally should be backend stats, but this works for page view)
  // Replaced with stats from backend
  const totalAmount = stats.totalRevenue || 0;
  const paidAmount = stats.paidRevenue || 0;
  const pendingAmount = stats.pendingRevenue || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Issued': 'bg-blue-100 text-blue-800',
      'Partial': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Refunded': 'bg-purple-100 text-purple-800'
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate: '',
      endDate: ''
    }));
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const printInvoice = async (invoiceId) => {
    try {
      const res = await apiClient.get(`/invoices/${invoiceId}`);
      setPrintableInvoice(res.data);
    } catch (err) {
      console.error("Failed to fetch invoice for printing", err);
      alert("Could not load invoice details for printing.");
    }
  };

  if (loading && !invoices.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          body * { 
            visibility: hidden; 
          }
          .printable-invoice-container, .printable-invoice-container * {
            visibility: visible;
          }
          .printable-invoice-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 9999;
            background: white;
          }
          .printable-invoice { 
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            background: white;
            font-size: 11pt;
            box-sizing: border-box;
          }
          .invoice-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            border-bottom: 4px double #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo-area { width: 100px; height: 100px; }
          .logo-area img { max-width: 100%; max-height: 100%; object-fit: contain; }
          .hospital-details { text-align: center; flex: 1; padding: 0 20px; }
          .hospital-name { font-family: "Times New Roman", Times, serif; font-size: 24pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .hospital-address { font-size: 10pt; margin-top: 5px; }
          .invoice-title-box { border: 2px solid #333; padding: 5px 10px; text-align: center; text-transform: uppercase; font-weight: bold; font-size: 14pt; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 11pt; }
          .details-item { display: flex; }
          .details-label { font-weight: bold; width: 120px; color: #444; }
          .details-value { font-weight: 600; }
          table.invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          table.invoice-table th, table.invoice-table td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          table.invoice-table th { background-color: #f3f4f6 !important; text-transform: uppercase; font-size: 9pt; -webkit-print-color-adjust: exact; }
          .footer-section { margin-top: 40px; border-top: 1px dashed #aaa; padding-top: 10px; text-align: center; font-size: 9pt; color: #666; }
        }
        @media screen {
          .printable-invoice-container { display: none; }
        }
        `}</style>

      {/* Hidden Printable Invoice Structure */}
      {printableInvoice && (
        <div className="printable-invoice-container">
          <div className="printable-invoice">
            <div className="invoice-header">
              <div className="logo-area">
                {hospitalInfo?.logo ? <img src={hospitalInfo.logo} alt="Logo" /> : <div className="w-full h-full border border-dashed flex items-center justify-center text-xs">LOGO</div>}
              </div>
              <div className="hospital-details">
                <h1 className="hospital-name">{hospitalInfo?.hospitalName || 'HOSPITAL NAME'}</h1>
                <div className="hospital-address">
                  <p>{hospitalInfo?.address || 'Address Line 1, Address Line 2'}</p>
                  <p>Phone: {hospitalInfo?.contact || 'N/A'}</p>
                  {hospitalInfo?.email && <p>Email: {hospitalInfo.email}</p>}
                </div>
              </div>
              <div>
                <div className="invoice-title-box">INVOICE</div>
                <div className="text-center text-xs mt-1">
                  {printableInvoice.status === 'Paid' ? '(PAID)' : '(PENDING)'}
                </div>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-item"><span className="details-label">Invoice No:</span><span className="details-value">{printableInvoice.invoice_number}</span></div>
              <div className="details-item"><span className="details-label">Date:</span><span className="details-value">{new Date(printableInvoice.issue_date).toLocaleDateString()}</span></div>
              <div className="details-item"><span className="details-label">Patient Name:</span><span className="details-value">{printableInvoice.patient_id ? `${printableInvoice.patient_id.first_name || ''} ${printableInvoice.patient_id.last_name || ''}`.trim() : (printableInvoice.customer_name || 'Unknown')}</span></div>
              <div className="details-item"><span className="details-label">Patient ID:</span><span className="details-value">{printableInvoice.patient_id?.patientId || printableInvoice.customer_phone || 'N/A'}</span></div>
              <div className="details-item"><span className="details-label">Doctor:</span><span className="details-value">{getDoctorName()}</span></div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Total</th></tr>
              </thead>
              <tbody>
                {printableInvoice.service_items && printableInvoice.service_items.map((item, idx) => (
                  <tr key={`srv-${idx}`}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.unit_price ? item.unit_price.toFixed(2) : (item.total_price / (item.quantity || 1)).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_price ? item.total_price.toFixed(2) : (item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {printableInvoice.medicine_items && printableInvoice.medicine_items.map((item, idx) => (
                  <tr key={`med-${idx}`}>
                    <td>{item.medicine_name} {item.batch_number ? `(${item.batch_number})` : ''}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.unit_price?.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'right', paddingRight: '20px' }}>TOTAL:</td>
                  <td style={{ textAlign: 'right' }}>₹{printableInvoice.total?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="footer-section">
              <p>This is a computer-generated invoice and needs no signature.</p>
              <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'}.</p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoice className="text-teal-600" />
            Invoice Management
          </h1>
          <p className="text-gray-600">Track and manage all hospital invoices</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/finance/create-invoice"
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaPlus /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalInvoices}</p>
            </div>
            <FaFileInvoice className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-teal-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              disabled={!!defaultType}
            >
              <option value="all">All Types</option>
              <option value="Appointment">Appointment</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Purchase">Purchase</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Issued">Issued</option>
              <option value="Partial">Partial</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              {/* <option value="month">This Month</option> */}
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{invoice.invoice_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {invoice.patient_id ? (
                        <div>
                          <div className="font-medium">{invoice.patient_id.first_name} {invoice.patient_id.last_name}</div>
                          <div className="text-xs text-gray-500">{invoice.patient_id.patientId}</div>
                        </div>
                      ) : (
                        <div className="font-medium">{invoice.customer_name || 'N/A'}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{formatCurrency(invoice.total)}</div>
                    {invoice.balance_due > 0 && <div className="text-xs text-red-500">Due: {formatCurrency(invoice.balance_due)}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => printInvoice(invoice._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Print Invoice"
                      >
                        <FaPrint />
                      </button>
                      {/* <button
                        onClick={() => downloadInvoice(invoice._id, invoice.invoice_number)}
                        className="text-teal-600 hover:text-teal-800"
                        title="Download PDF"
                      >
                        <FaDownload />
                      </button> */}
                      {invoice.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(invoice._id, invoice.balance_due)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Paid (Cash)"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (onViewDetails) {
                            onViewDetails(invoice._id);
                          } else {
                            window.location.href = `/dashboard/invoices/${invoice._id}`;
                          }
                        }}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaFileInvoice className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'No invoices for selected filters'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 p-4 border-t">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {
        error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default InvoiceListPage;