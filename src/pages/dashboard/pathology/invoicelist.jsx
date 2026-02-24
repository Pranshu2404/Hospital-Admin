// pages/dashboard/pathology/invoices.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
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
  FaCheckCircle,
  FaTimes,
  FaSync,
  FaCreditCard,
  FaMoneyBill,
  FaMobile,
  FaUniversity,
  FaShieldAlt,
  FaFlask,
  FaMicroscope,
  FaVial,
  FaDna,
  FaClock,
  FaCheck,
  FaBan,
  FaInfoCircle
} from 'react-icons/fa';

const PathologyInvoiceListPage = ({ onViewDetails }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    byPaymentMethod: [],
    pendingTests: 0,
    completedTests: 0
  });
  const [totalInvoices, setTotalInvoices] = useState(0);

  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [printableInvoice, setPrintableInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [labTechnicians, setLabTechnicians] = useState([]);

  // Payment methods for filter dropdown
  const paymentMethods = [
    'Cash',
    'Card',
    'UPI',
    'Net Banking',
    'Insurance',
    'Government Scheme',
    'Cheque',
    'Bank Transfer',
    'Wallet'
  ];

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchHospitalInfo();
    fetchDoctors();
    fetchLabTechnicians();
  }, [
    filters.status,
    filters.paymentMethod,
    filters.dateRange,
    filters.page,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount
  ]);

  useEffect(() => {
    if (printableInvoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printableInvoice]);

  const fetchStats = async () => {
    try {
      const params = {
        type: 'Lab Test' // Force lab test stats only
      };

      if (filters.paymentMethod !== 'all') {
        params.payment_method = filters.paymentMethod;
      }

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
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
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
      
      // Calculate test statistics from lab_test_items
      const testStats = {
        pendingTests: 0,
        completedTests: 0,
        inProgressTests: 0
      };

      if (response.data.labTestStats) {
        response.data.labTestStats.forEach(stat => {
          if (stat._id === 'Pending') testStats.pendingTests = stat.count || 0;
          if (stat._id === 'Completed') testStats.completedTests = stat.count || 0;
          if (stat._id === 'In Progress') testStats.inProgressTests = stat.count || 0;
        });
      }

      setStats(prev => ({ 
        ...prev, 
        ...response.data,
        ...testStats
      }));
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

  const fetchLabTechnicians = async () => {
    try {
      // Assuming you have an endpoint for lab staff
      const res = await apiClient.get('/staff?role=lab_technician');
      setLabTechnicians(res.data);
    } catch (err) {
      console.error('Error fetching lab technicians:', err);
    }
  };

  const getDoctorName = (invoice) => {
    if (!invoice) return 'N/A';
    let doc = null;

    if (invoice.doctor_id) {
      if (typeof invoice.doctor_id === 'object') doc = invoice.doctor_id;
      else doc = doctors.find(d => d._id === invoice.doctor_id);
    }

    if (!doc && invoice.appointment_id) {
      if (typeof invoice.appointment_id === 'object' && invoice.appointment_id.doctor_id) {
        if (typeof invoice.appointment_id.doctor_id === 'object') doc = invoice.appointment_id.doctor_id;
        else doc = doctors.find(d => d._id === invoice.appointment_id.doctor_id);
      }
    }

    if (!doc && invoice.prescription_id) {
      // Try to get doctor from prescription
      // This depends on your prescription schema
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
        invoice_type: 'Lab Test', // Force lab test invoices only
        payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        min_amount: filters.minAmount || undefined,
        max_amount: filters.maxAmount || undefined,
        page: filters.page,
        limit: filters.limit
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
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
          default:
            break;
        }

        if (startDate && endDate) {
          params.startDate = startDate.toISOString().split('T')[0];
          params.endDate = endDate.toISOString().split('T')[0];
        }
      }

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

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
        (invoice.patient_id?.patientId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (invoice.customer_phone || '').includes(searchTerm);

      return matchesSearch;
    });
  }, [invoices, searchTerm]);

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
      'Pending': 'bg-orange-100 text-orange-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
      'Refunded': 'bg-purple-100 text-purple-800'
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTestStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-orange-100 text-orange-800',
      'Sample Collected': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'Verified': 'bg-teal-100 text-teal-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Cash': return <FaMoneyBill className="text-green-600" />;
      case 'Card': return <FaCreditCard className="text-blue-600" />;
      case 'UPI': return <FaMobile className="text-purple-600" />;
      case 'Net Banking': return <FaUniversity className="text-indigo-600" />;
      case 'Insurance': return <FaShieldAlt className="text-teal-600" />;
      case 'Government Scheme': return <FaShieldAlt className="text-orange-600" />;
      default: return <FaMoneyBillWave className="text-gray-600" />;
    }
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

  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentMethod: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      page: 1,
      limit: 10
    });
    setSearchTerm('');
  };

  const handleMarkAsPaid = async (invoiceId, amountDue, method = 'Cash') => {
    if (!window.confirm(`Mark this invoice as PAID? \n\nAmount: ₹${amountDue}\nMethod: ${method}`)) return;

    try {
      await apiClient.put(`/invoices/${invoiceId}/payment`, {
        amount: amountDue,
        method: method,
        reference: 'Quick Pay',
        collected_by: 'Current User'
      });
      fetchInvoices();
      fetchStats();
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Failed to update payment status.");
    }
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      setDownloadingId(invoiceId);
      
      // Fetch the invoice details
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      const invoice = response.data;
      
      // Create HTML content with lab test specific structure
      const htmlContent = generateInvoiceHTML(invoice);
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lab-invoice-${invoiceNumber}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Generate HTML for invoice (lab test specific)
  const generateInvoiceHTML = (invoice) => {
    const doctorName = getDoctorName(invoice);
    const patientName = invoice.patient_id 
      ? `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim() 
      : (invoice.customer_name || 'Unknown');
    const patientId = invoice.patient_id?.patientId || invoice.customer_phone || 'N/A';
    const paymentMethod = invoice.payment_history?.[invoice.payment_history.length - 1]?.method || 'N/A';

    // Generate lab test items HTML
    const labTestItemsHTML = invoice.lab_test_items?.map(item => `
      <tr>
        <td>${item.lab_test_code || 'LT'}</td>
        <td>${item.lab_test_name || 'Lab Test'}</td>
        <td style="text-align: right">${item.quantity || 1}</td>
        <td style="text-align: right">₹${(item.unit_price || 0).toFixed(2)}</td>
        <td style="text-align: right">₹${(item.total_price || 0).toFixed(2)}</td>
        <td style="text-align: center">
          <span class="status-badge status-${(item.status || 'Pending').toLowerCase().replace(' ', '-')}">
            ${item.status || 'Pending'}
          </span>
        </td>
      </tr>
    `).join('') || '';

    // Generate service items HTML
    const serviceItemsHTML = invoice.service_items?.map(item => `
      <tr>
        <td>SVC</td>
        <td>${item.description}</td>
        <td style="text-align: right">${item.quantity || 1}</td>
        <td style="text-align: right">₹${(item.unit_price || 0).toFixed(2)}</td>
        <td style="text-align: right">₹${(item.total_price || 0).toFixed(2)}</td>
        <td style="text-align: center">-</td>
      </tr>
    `).join('') || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Invoice #${invoice.invoice_number}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
            }
            .invoice-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              border-bottom: 4px double #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .logo-area {
              width: 100px;
              height: 100px;
            }
            .logo-area img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .hospital-details {
              text-align: center;
              flex: 1;
              padding: 0 20px;
            }
            .hospital-name {
              font-family: "Times New Roman", Times, serif;
              font-size: 24pt;
              font-weight: bold;
              text-transform: uppercase;
              margin: 0;
            }
            .hospital-address {
              font-size: 10pt;
              margin-top: 5px;
            }
            .invoice-title-box {
              border: 2px solid #333;
              padding: 5px 10px;
              text-align: center;
              text-transform: uppercase;
              font-weight: bold;
              font-size: 14pt;
              background-color: #f8f9fa;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
              font-size: 11pt;
            }
            .details-item {
              display: flex;
            }
            .details-label {
              font-weight: bold;
              width: 120px;
              color: #444;
            }
            .details-value {
              font-weight: 600;
            }
            table.invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 10pt;
            }
            table.invoice-table th {
              background-color: #f3f4f6;
              text-transform: uppercase;
              font-size: 9pt;
              padding: 10px 8px;
              border-bottom: 2px solid #333;
            }
            table.invoice-table td {
              border-bottom: 1px solid #ddd;
              padding: 8px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: bold;
            }
            .status-pending { background-color: #FEF3C7; color: #92400E; }
            .status-sample-collected { background-color: #DBEAFE; color: #1E40AF; }
            .status-in-progress { background-color: #E9D5FF; color: #6B21A8; }
            .status-completed { background-color: #D1FAE5; color: #065F46; }
            .status-verified { background-color: #CCFBF1; color: #115E59; }
            .footer-section {
              margin-top: 40px;
              border-top: 1px dashed #aaa;
              padding-top: 10px;
              text-align: center;
              font-size: 9pt;
              color: #666;
            }
            .totals-section {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 300px;
              border: 1px solid #ddd;
              padding: 15px;
              background-color: #f9f9f9;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 12pt;
              border-top: 2px solid #333;
              padding-top: 8px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="logo-area">
              ${hospitalInfo?.logo 
                ? `<img src="${hospitalInfo.logo}" alt="Logo" />` 
                : '<div style="width:100%;height:100%;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;">LOGO</div>'
              }
            </div>
            <div class="hospital-details">
              <h1 class="hospital-name">${hospitalInfo?.hospitalName || 'HOSPITAL NAME'}</h1>
              <div class="hospital-address">
                <p>${hospitalInfo?.address || 'Address Line 1, Address Line 2'}</p>
                <p>Phone: ${hospitalInfo?.contact || 'N/A'}</p>
                ${hospitalInfo?.email ? `<p>Email: ${hospitalInfo.email}</p>` : ''}
              </div>
            </div>
            <div>
              <div class="invoice-title-box">INVOICE</div>
              <div style="text-align:center;font-size:10px;margin-top:4px;">
                ${invoice.status === 'Paid' ? '(PAID)' : '(PENDING)'}
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-item"><span class="details-label">Invoice No:</span><span class="details-value">${invoice.invoice_number}</span></div>
            <div class="details-item"><span class="details-label">Date:</span><span class="details-value">${new Date(invoice.issue_date).toLocaleDateString()}</span></div>
            <div class="details-item"><span class="details-label">Patient Name:</span><span class="details-value">${patientName}</span></div>
            <div class="details-item"><span class="details-label">Patient ID:</span><span class="details-value">${patientId}</span></div>
            <div class="details-item"><span class="details-label">Referring Doctor:</span><span class="details-value">${doctorName}</span></div>
            <div class="details-item"><span class="details-label">Payment Method:</span><span class="details-value">${paymentMethod}</span></div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Test Name</th>
                <th style="text-align: right">Qty</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Total</th>
                <th style="text-align: center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${labTestItemsHTML}
              ${serviceItemsHTML}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              ${invoice.tax > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>₹${invoice.tax.toFixed(2)}</span>
              </div>
              ` : ''}
              ${invoice.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-₹${invoice.discount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>₹${(invoice.total || 0).toFixed(2)}</span>
              </div>
              ${invoice.amount_paid > 0 ? `
              <div class="total-row">
                <span>Amount Paid:</span>
                <span class="paid-amount">₹${invoice.amount_paid.toFixed(2)}</span>
              </div>
              ` : ''}
              ${invoice.balance_due > 0 ? `
              <div class="total-row">
                <span>Balance Due:</span>
                <span class="due-amount">₹${invoice.balance_due.toFixed(2)}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="footer-section">
            <p>This is a computer-generated invoice and needs no signature.</p>
            <p>Thank you for choosing ${hospitalInfo?.hospitalName || 'us'} for your diagnostic needs.</p>
          </div>
        </body>
      </html>
    `;
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

  const getTestSummary = (invoice) => {
    if (!invoice.lab_test_items || invoice.lab_test_items.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }
    console.log(invoice)
    const total = invoice.lab_test_items.length;
    
    return { total };
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
          .invoice-title-box { border: 2px solid #333; padding: 5px 10px; text-align: center; text-transform: uppercase; font-weight: bold; font-size: 14pt; background-color: #f8f9fa; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 11pt; }
          .details-item { display: flex; }
          .details-label { font-weight: bold; width: 120px; color: #444; }
          .details-value { font-weight: 600; }
          table.invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          table.invoice-table th, table.invoice-table td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          table.invoice-table th { background-color: #f3f4f6 !important; text-transform: uppercase; font-size: 9pt; -webkit-print-color-adjust: exact; }
          .status-badge { display: inline-block; padding: 2px 6px; border-radius: 12px; font-size: 8pt; }
          .footer-section { margin-top: 40px; border-top: 1px dashed #aaa; padding-top: 10px; text-align: center; font-size: 9pt; color: #666; }
          .totals-section { margin-top: 20px; }
          .totals-box { width: 300px; margin-left: auto; }
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
              <div className="details-item"><span className="details-label">Referring Doctor:</span><span className="details-value">{getDoctorName(printableInvoice)}</span></div>
              <div className="details-item"><span className="details-label">Payment Method:</span><span className="details-value">{printableInvoice.payment_history?.[printableInvoice.payment_history.length - 1]?.method || 'N/A'}</span></div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Test Name</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {printableInvoice.lab_test_items && printableInvoice.lab_test_items.map((item, idx) => (
                  <tr key={`lab-${idx}`}>
                    <td>{item.lab_test_code || 'LT'}</td>
                    <td>{item.lab_test_name || 'Lab Test'}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity || 1}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.unit_price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.total_price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'Sample Collected' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {printableInvoice.service_items && printableInvoice.service_items.map((item, idx) => (
                  <tr key={`srv-${idx}`}>
                    <td>SVC</td>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity || 1}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.unit_price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.total_price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>-</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals-section">
              <div className="bg-gray-50 p-4 rounded-lg w-64 ml-auto">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{(printableInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                {printableInvoice.tax > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Tax:</span>
                    <span>₹{printableInvoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {printableInvoice.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Discount:</span>
                    <span className="text-red-600">-₹{printableInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{(printableInvoice.total || 0).toFixed(2)}</span>
                </div>
                {printableInvoice.amount_paid > 0 && (
                  <div className="flex justify-between mt-2 text-green-600">
                    <span>Amount Paid:</span>
                    <span>₹{printableInvoice.amount_paid.toFixed(2)}</span>
                  </div>
                )}
                {printableInvoice.balance_due > 0 && (
                  <div className="flex justify-between mt-2 text-red-600">
                    <span>Balance Due:</span>
                    <span>₹{printableInvoice.balance_due.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="footer-section">
              <p>This is a computer-generated invoice and needs no signature.</p>
              <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'} for your diagnostic needs.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFlask className="text-teal-600" />
            Laboratory Invoice Management
          </h1>
          <p className="text-gray-600">Track and manage all laboratory test invoices</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/pathology/create-invoice"
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaPlus /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tests Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingTests || 0}</p>
            </div>
            <FaClock className="text-3xl text-orange-600" />
          </div>
        </div>
      </div>

      {/* Payment Method Summary */}
      {stats.byPaymentMethod && stats.byPaymentMethod.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Method Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.byPaymentMethod.map((method, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                {getPaymentMethodIcon(method.method)}
                <div>
                  <p className="text-xs text-gray-500">{method.method}</p>
                  <p className="text-sm font-bold">{formatCurrency(method.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaFilter /> Filters
          </h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
          >
            {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
            {showAdvancedFilters ? <FaTimes /> : <FaFilter />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice, patient, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status */}
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
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder="₹0"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder="₹1,00,000"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={fetchInvoices}
                className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
              >
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Laboratory Invoices</h3>
          <span className="text-sm text-gray-600">
            Showing {filteredInvoices.length} of {totalInvoices} invoices
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const testSummary = getTestSummary(invoice);
                return (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-teal-600">{invoice.invoice_number}</div>
                      {invoice.prescription_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Rx: {invoice.prescription_id.prescription_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.patient_id ? (
                        <div>
                          <div className="font-medium">{invoice.patient_id.first_name} {invoice.patient_id.last_name}</div>
                          <div className="text-xs text-gray-500">{invoice.patient_id.patientId}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{invoice.customer_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{invoice.customer_phone}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaFlask className="text-purple-500" />
                        <div>
                          <span className="text-sm font-medium">{testSummary.total} tests</span>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {testSummary.completed} done
                            </span>
                            {testSummary.pending > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                {testSummary.pending} pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{formatCurrency(invoice.total)}</div>
                      {invoice.balance_due > 0 && (
                        <div className="text-xs text-red-500">Due: {formatCurrency(invoice.balance_due)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </span>
                      {invoice.lab_tests_status && (
                        <div className="mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Tests: {invoice.lab_tests_status}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(invoice.payment_history?.[invoice.payment_history.length - 1]?.method || 'Cash')}
                        <span className="text-sm">
                          {invoice.payment_history?.[invoice.payment_history.length - 1]?.method || 'N/A'}
                        </span>
                      </div>
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
                        <button
                          onClick={() => downloadInvoice(invoice._id, invoice.invoice_number)}
                          disabled={downloadingId === invoice._id}
                          className={`${downloadingId === invoice._id ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'}`}
                          title="Download Invoice"
                        >
                          {downloadingId === invoice._id ? <FaSync className="animate-spin" /> : <FaDownload />}
                        </button>
                        {invoice.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice._id, invoice.balance_due)}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Paid"
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
                              window.location.href = `/dashboard/pathology/invoices/${invoice._id}`;
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
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaFlask className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No laboratory invoices found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'No invoices for selected filters'}
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              Page {filters.page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathologyInvoiceListPage;