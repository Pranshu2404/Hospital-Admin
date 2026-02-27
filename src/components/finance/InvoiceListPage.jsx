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
  FaCheckCircle,
  FaTimes,
  FaSync,
  FaCreditCard,
  FaMoneyBill,
  FaMobile,
  FaUniversity,
  FaShieldAlt,
  FaFlask,
  FaSyringe,
  FaPills,
  FaStethoscope,
  FaTrash,
  FaClock,
  FaCheck,
  FaBan,
  FaInfoCircle,
  FaUserShield,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const InvoiceListPage = ({ onViewDetails, defaultType }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeletionRequests, setShowDeletionRequests] = useState(false);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showDirectDeleteModal, setShowDirectDeleteModal] = useState(false);
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [userRole, setUserRole] = useState('admin'); // This should come from your auth context

  const location = useLocation();

  const [filters, setFilters] = useState({
    status: location.state?.status || 'all',
    type: defaultType || 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    doctorId: 'all',
    departmentId: 'all',
    patientType: 'all',
    hasProcedures: false,
    hasLabTests: false,
    isPharmacySale: false,
    showDeleted: false,
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
    pendingDeletions: 0
  });
  const [totalInvoices, setTotalInvoices] = useState(0);

  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [printableInvoice, setPrintableInvoice] = useState(null);

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

  // Patient types
  const patientTypes = ['OPD', 'IPD', 'Emergency', 'Walk-in', 'Corporate'];

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchHospitalInfo();
    fetchDoctors();
    fetchDepartments();
    fetchDeletionRequests();
  }, [
    filters.status,
    filters.type,
    filters.paymentMethod,
    filters.dateRange,
    filters.page,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    filters.doctorId,
    filters.departmentId,
    filters.patientType,
    filters.hasProcedures,
    filters.hasLabTests,
    filters.isPharmacySale,
    filters.showDeleted
  ]);

  useEffect(() => {
    if (printableInvoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printableInvoice]);

  const fetchDeletionRequests = async () => {
    try {
      const res = await apiClient.get('/billing/deletion-requests/pending');
      setDeletionRequests(res.data.requests || []);
      setStats(prev => ({ ...prev, pendingDeletions: res.data.count || 0 }));
    } catch (err) {
      console.error('Error fetching deletion requests:', err);
    }
  };

  const handleReviewDeletion = async (id, action) => {
    if (action === 'reject' && !reviewNotes.trim()) {
      alert('Please provide review notes for rejection');
      return;
    }

    const confirmMessage = action === 'approve'
      ? 'Are you sure you want to APPROVE this deletion? This will permanently remove the bill and associated invoice.'
      : 'Are you sure you want to REJECT this deletion request?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await apiClient.put(`/billing/${id}/review-deletion`, {
        action,
        review_notes: reviewNotes || `Request ${action === 'approve' ? 'approved' : 'rejected'} by admin`
      });

      alert(`Deletion request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowRequestModal(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchDeletionRequests();
      fetchInvoices(); // Refresh invoices to update status
    } catch (err) {
      console.error('Error reviewing deletion:', err);
      alert(err.response?.data?.error || 'Failed to process request');
    }
  };

  const handleDirectDelete = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    if (!window.confirm('⚠️ WARNING: This will permanently delete this bill and its associated invoice. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      await apiClient.delete(`/billing/${selectedInvoiceForDelete._id}`, {
        data: { reason: deleteReason }
      });

      alert('Bill and associated invoice deleted successfully');
      setShowDirectDeleteModal(false);
      setSelectedInvoiceForDelete(null);
      setDeleteReason('');
      fetchInvoices();
      fetchStats();
    } catch (err) {
      console.error('Error deleting bill:', err);
      alert(err.response?.data?.error || 'Failed to delete bill');
    }
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

  const fetchStats = async () => {
    try {
      const params = {
        invoice_type: filters.type !== 'all' ? filters.type : undefined
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
      setStats(prev => ({ ...prev, ...response.data }));
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

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
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
        payment_method: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        doctor_id: filters.doctorId !== 'all' ? filters.doctorId : undefined,
        department_id: filters.departmentId !== 'all' ? filters.departmentId : undefined,
        patient_type: filters.patientType !== 'all' ? filters.patientType : undefined,
        has_procedures: filters.hasProcedures ? true : undefined,
        has_lab_tests: filters.hasLabTests ? true : undefined,
        is_pharmacy_sale: filters.isPharmacySale ? true : undefined,
        min_amount: filters.minAmount || undefined,
        max_amount: filters.maxAmount || undefined,
        include_deleted: filters.showDeleted ? true : undefined,
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

  const getDeletionStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'pending' && <FaClock className="inline mr-1" />}
        {status === 'approved' && <FaCheck className="inline mr-1" />}
        {status === 'rejected' && <FaBan className="inline mr-1" />}
        Deletion {status}
      </span>
    );
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

  const getInvoiceTypeIcon = (type) => {
    switch (type) {
      case 'Procedure': return <FaSyringe className="text-indigo-600" />;
      case 'Lab Test': return <FaFlask className="text-purple-600" />;
      case 'Pharmacy': return <FaPills className="text-green-600" />;
      case 'Appointment': return <FaStethoscope className="text-blue-600" />;
      default: return <FaFileInvoice className="text-gray-600" />;
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
      type: defaultType || 'all',
      paymentMethod: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      doctorId: 'all',
      departmentId: 'all',
      patientType: 'all',
      hasProcedures: false,
      hasLabTests: false,
      isPharmacySale: false,
      showDeleted: false,
      page: 1,
      limit: 10
    });
    setSearchTerm('');
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
      {/* Print Styles (keep existing) */}
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
              <div className="details-item"><span className="details-label">Payment Method:</span><span className="details-value">{printableInvoice.payment_history?.[printableInvoice.payment_history.length - 1]?.method || 'N/A'}</span></div>
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
                {printableInvoice.procedure_items && printableInvoice.procedure_items.map((item, idx) => (
                  <tr key={`proc-${idx}`}>
                    <td>{item.procedure_name} ({item.procedure_code})</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.unit_price?.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
                {printableInvoice.lab_test_items && printableInvoice.lab_test_items.map((item, idx) => (
                  <tr key={`lab-${idx}`}>
                    <td>{item.lab_test_name} ({item.lab_test_code})</td>
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
          {userRole === 'admin' && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              <FaUserShield /> Admin Access - Direct deletion available
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {stats.pendingDeletions > 0 && (
            <button
              onClick={() => setShowDeletionRequests(!showDeletionRequests)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showDeletionRequests
                ? 'bg-teal-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
            >
              <FaTrash />
              Pending Deletions ({stats.pendingDeletions})
            </button>
          )}
          {/* <Link
            to="/dashboard/finance/create-invoice"
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaPlus /> Create Invoice
          </Link> */}
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
              <p className="text-sm text-gray-600">Deletion Requests</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingDeletions}</p>
            </div>
            <FaTrash className="text-3xl text-red-600" />
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

      {/* Deletion Requests Section */}
      {showDeletionRequests && deletionRequests.length > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow border border-yellow-200 overflow-hidden">
          <div className="p-4 bg-yellow-100 border-b border-yellow-200 flex justify-between items-center">
            <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
              <FaTrash /> Pending Deletion Requests ({deletionRequests.length})
            </h3>
            <button
              onClick={() => setShowDeletionRequests(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <FaTimes />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellow-200">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Bill ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Invoice</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Reason</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Requested</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-yellow-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-yellow-100">
                {deletionRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-yellow-50">
                    <td className="px-4 py-2 font-mono text-sm">#{request._id?.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-2 text-sm">{request.invoice_id?.invoice_number || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {request.patient_id ? `${request.patient_id.first_name} ${request.patient_id.last_name}` : 'Unknown'}
                    </td>
                    <td className="px-4 py-2 font-bold">{formatCurrency(request.total_amount)}</td>
                    <td className="px-4 py-2 max-w-xs">
                      <p className="text-sm truncate" title={request.deletion_request?.reason}>
                        {request.deletion_request?.reason}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(request.deletion_request?.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="Review Request"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

          {/* Invoice Type */}
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
              <option value="Procedure">Procedure</option>
              <option value="Lab Test">Lab Test</option>
              <option value="Mixed">Mixed</option>
              <option value="Purchase">Purchase</option>
            </select>
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
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  value={filters.doctorId}
                  onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Doctors</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.firstName} {doc.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.departmentId}
                  onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Type</label>
                <select
                  value={filters.patientType}
                  onChange={(e) => handleFilterChange('patientType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  {patientTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

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

              {/* Show Deleted */}
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.showDeleted}
                    onChange={(e) => handleFilterChange('showDeleted', e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Show Deleted</span>
                </label>
              </div>
            </div>

            {/* Checkbox Filters */}
            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasProcedures}
                  onChange={(e) => handleFilterChange('hasProcedures', e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Has Procedures</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasLabTests}
                  onChange={(e) => handleFilterChange('hasLabTests', e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Has Lab Tests</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isPharmacySale}
                  onChange={(e) => handleFilterChange('isPharmacySale', e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Pharmacy Sale</span>
              </label>
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
          <h3 className="text-lg font-semibold text-gray-800">Invoices</h3>
          <span className="text-sm text-gray-600">
            Showing {filteredInvoices.length} of {totalInvoices} invoices
          </span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className={`hover:bg-gray-50 ${invoice.is_deleted ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">{invoice.invoice_number}</div>
                    {invoice.deletion_request && invoice.deletion_request.status === 'pending' && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                        <FaClock /> Deletion Pending
                      </span>
                    )}
                    {invoice.is_deleted && (
                      <span className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <FaTrash /> Deleted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getInvoiceTypeIcon(invoice.invoice_type)}
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {invoice.invoice_type}
                      </span>
                    </div>
                    {invoice.has_procedures && (
                      <span className="text-xs text-indigo-600 block mt-1">
                        {invoice.procedure_items?.length || 0} procedures
                      </span>
                    )}
                    {invoice.has_lab_tests && (
                      <span className="text-xs text-purple-600 block">
                        {invoice.lab_test_items?.length || 0} lab tests
                      </span>
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
                      {invoice.status !== 'Paid' && !invoice.is_deleted && (
                        <button
                          onClick={() => handleMarkAsPaid(invoice._id, invoice.balance_due)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Paid (Cash)"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      {invoice.deletion_request && invoice.deletion_request.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(invoice);
                            setShowRequestModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Review Deletion Request"
                        >
                          <FaClock />
                        </button>
                      )}
                      {/* Admin Direct Delete Button */}
                      {userRole === 'admin' && !invoice.is_deleted && !invoice.deletion_request && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForDelete(invoice);
                            setShowDirectDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Permanently Delete (Admin)"
                        >
                          <FaTrash />
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

      {/* Deletion Request Review Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Review Deletion Request</h3>
              <button
                onClick={() => { setShowRequestModal(false); setSelectedRequest(null); setReviewNotes(''); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <FaInfoCircle /> Request Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Invoice:</span> {selectedRequest.invoice_number || 'N/A'}</p>
                  <p><span className="font-medium">Patient:</span> {
                    selectedRequest.patient_id
                      ? `${selectedRequest.patient_id.first_name} ${selectedRequest.patient_id.last_name}`
                      : selectedRequest.customer_name || 'Unknown'
                  }</p>
                  <p><span className="font-medium">Amount:</span> {formatCurrency(selectedRequest.total)}</p>
                  <p><span className="font-medium">Reason:</span> {selectedRequest.deletion_request?.reason || 'No reason provided'}</p>
                  <p><span className="font-medium">Requested On:</span> {
                    selectedRequest.deletion_request?.requested_at
                      ? new Date(selectedRequest.deletion_request.requested_at).toLocaleString()
                      : 'N/A'
                  }</p>
                </div>
              </div>

              {selectedRequest.deletion_request?.status === 'pending' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes {selectedRequest.deletion_request?.status === 'reject' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your decision (required for rejection)..."
                      rows="3"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => handleReviewDeletion(selectedRequest._id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <FaBan /> Reject
                    </button>
                    <button
                      onClick={() => handleReviewDeletion(selectedRequest._id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaCheck /> Approve
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Review Result</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> {getDeletionStatusBadge(selectedRequest.deletion_request?.status)}</p>
                    <p><span className="font-medium">Review Notes:</span> {selectedRequest.deletion_request?.review_notes || 'No notes'}</p>
                    <p><span className="font-medium">Reviewed By:</span> {selectedRequest.deletion_request?.reviewed_by?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Reviewed On:</span> {
                      selectedRequest.deletion_request?.reviewed_at
                        ? new Date(selectedRequest.deletion_request.reviewed_at).toLocaleString()
                        : 'N/A'
                    }</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => { setShowRequestModal(false); setSelectedRequest(null); setReviewNotes(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

export default InvoiceListPage;