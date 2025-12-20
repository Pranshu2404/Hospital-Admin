import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaPlus, 
  FaDownload, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint, 
  FaFileInvoice,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPercent,
  FaMoneyBillWave,
  FaFileExcel,
  FaChartBar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaRedo,
  FaExpand,
  FaTags,
  FaShieldAlt,
  FaHistory,
  FaRegCopy,
  FaExternalLinkAlt,
  FaFilePdf,
  FaTimes
} from 'react-icons/fa';
import {
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Printer,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Percent,
  CreditCard,
  FileSpreadsheet,
  BarChart3,
  SortAsc,
  SortDesc,
  RefreshCw,
  Maximize2,
  Tag,
  Shield,
  History,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  ChevronRight,
  FileCheck,
  Bell
} from 'lucide-react';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [downloading, setDownloading] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    partial: 0,
    overdue: 0,
    cancelled: 0,
    totalAmount: 0,
    averageInvoice: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, [sortBy, sortOrder]);

  const fetchInvoices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);
      
      const response = await apiClient.get('/invoices/pharmacy', {
        params: {
          sort: sortBy,
          order: sortOrder,
          limit: 100
        }
      });
      
      const invoicesData = response.data.invoices || [];
      setInvoices(invoicesData);
      calculateStats(invoicesData);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch invoices.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (invoicesData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: invoicesData.length,
      paid: invoicesData.filter(inv => inv.status === 'Paid').length,
      unpaid: invoicesData.filter(inv => inv.status === 'Unpaid').length,
      partial: invoicesData.filter(inv => inv.status === 'Partial').length,
      overdue: invoicesData.filter(inv => inv.status === 'Overdue').length,
      cancelled: invoicesData.filter(inv => inv.status === 'Cancelled').length,
      totalAmount: invoicesData.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
      averageInvoice: invoicesData.length > 0 
        ? invoicesData.reduce((sum, invoice) => sum + (invoice.total || 0), 0) / invoicesData.length
        : 0
    };
    
    setStats(stats);
  };

  const handleDownload = async (invoiceId, format = 'pdf') => {
    setDownloading(prev => ({ ...prev, [invoiceId]: true }));
    try {
      let endpoint = `/invoices/${invoiceId}/download`;
      let mimeType = 'application/pdf';
      let fileExtension = 'pdf';
      
      if (format === 'excel') {
        endpoint = `/invoices/${invoiceId}/export`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      }
      
      const response = await apiClient.get(endpoint, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download invoice. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloading(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .totals { text-align: right; margin-top: 20px; }
            .total { font-weight: bold; font-size: 1.2em; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 15px; font-weight: bold; }
            .status-paid { background-color: #d4edda; color: #155724; }
            .status-unpaid { background-color: #fff3cd; color: #856404; }
            .status-overdue { background-color: #f8d7da; color: #721c24; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { 
              body { margin: 0; padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PHARMACY INVOICE</h1>
            <h2>Invoice #${invoice.invoice_number}</h2>
          </div>
          
          <div class="info">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${invoice.patient_id ? 
                `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}` : 
                invoice.customer_name || 'Walk-in Customer'}</strong></p>
              ${invoice.patient_id?.phone ? `<p>Phone: ${invoice.patient_id.phone}</p>` : ''}
              ${invoice.patient_id?.email ? `<p>Email: ${invoice.patient_id.email}</p>` : ''}
            </div>
            <div>
              <h3>Invoice Details:</h3>
              <p><strong>Date:</strong> ${new Date(invoice.issue_date || invoice.createdAt).toLocaleDateString()}</p>
              <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p><strong>Status:</strong> <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span></p>
              ${invoice.payment_method ? `<p><strong>Payment Method:</strong> ${invoice.payment_method}</p>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.medicine_name || item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unit_price?.toFixed(2)}</td>
                  <td>₹${((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ₹${invoice.subtotal?.toFixed(2) || '0.00'}</p>
            ${invoice.discount > 0 ? `<p>Discount: -₹${invoice.discount?.toFixed(2)}</p>` : ''}
            ${invoice.tax > 0 ? `<p>Tax: ₹${invoice.tax?.toFixed(2)}</p>` : ''}
            <p class="total">Total: ₹${invoice.total?.toFixed(2)}</p>
            ${invoice.paid_amount > 0 ? `<p>Amount Paid: ₹${invoice.paid_amount?.toFixed(2)}</p>` : ''}
            ${invoice.due_amount > 0 ? `<p>Due Amount: ₹${invoice.due_amount?.toFixed(2)}</p>` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const patientName = `${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim();
      const matchesSearch = 
        invoice._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_phone?.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
      
      // Date filter
      let matchesDate = true;
      if (dateFilter) {
        const invoiceDate = new Date(invoice.issue_date || invoice.createdAt);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            matchesDate = invoiceDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = invoiceDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = invoiceDate >= monthAgo;
            break;
        }
      }
      
      // Amount filter
      let matchesAmount = true;
      if (amountFilter) {
        const amount = invoice.total || 0;
        switch (amountFilter) {
          case 'high':
            matchesAmount = amount > 10000;
            break;
          case 'medium':
            matchesAmount = amount >= 5000 && amount <= 10000;
            break;
          case 'low':
            matchesAmount = amount < 5000;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesAmount;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'total':
          aValue = a.total || 0;
          bValue = b.total || 0;
          break;
        case 'issue_date':
          aValue = new Date(a.issue_date || a.createdAt);
          bValue = new Date(b.issue_date || b.createdAt);
          break;
        case 'patient_name':
          aValue = `${a.patient_id?.first_name || ''} ${a.patient_id?.last_name || ''}`.toLowerCase();
          bValue = `${b.patient_id?.first_name || ''} ${b.patient_id?.last_name || ''}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });

    return filtered;
  }, [invoices, searchTerm, filterStatus, dateFilter, amountFilter, sortBy, sortOrder]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Paid': { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-500'
      },
      'Unpaid': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        bgColor: 'bg-yellow-500'
      },
      'Partial': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Percent,
        bgColor: 'bg-blue-500'
      },
      'Overdue': { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        bgColor: 'bg-red-500'
      },
      'Cancelled': { 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        bgColor: 'bg-gray-500'
      }
    };
    
    const config = statusConfig[status] || statusConfig['Paid'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateFilter('');
    setAmountFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <SortAsc className="w-3 h-3" />;
    return sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />;
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl shadow-sm">
            <Receipt className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pharmacy Invoices</h1>
            <p className="text-gray-600 text-sm mt-1">Track and manage all pharmacy invoices</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button
            onClick={() => fetchInvoices(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <RefreshCw className="animate-spin w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            to="/dashboard/pharmacy/sales"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> View Sales
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Invoices</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
              <p className="text-xs text-gray-500 mt-2">All invoices</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <FileText className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Paid Invoices</p>
              <h3 className="text-3xl font-bold text-green-700">{stats.paid}</h3>
              <p className="text-xs text-gray-500 mt-2">Successfully paid</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <CheckCircle className="text-green-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-2xl border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
              <h3 className="text-3xl font-bold text-yellow-700">{formatCurrency(stats.totalAmount)}</h3>
              <p className="text-xs text-gray-500 mt-2">Total billed amount</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <DollarSign className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Overdue</p>
              <h3 className="text-3xl font-bold text-red-700">{stats.overdue}</h3>
              <p className="text-xs text-gray-500 mt-2">Pending invoices</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <Clock className="text-red-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice number, patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="total">Sort by Amount</option>
              <option value="patient_name">Sort by Patient</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() => toggleSort(sortBy)}
              className="p-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100"
            >
              {getSortIcon(sortBy)}
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">All Amounts</option>
                <option value="high">High (&gt; ₹10,000)</option>
                <option value="medium">Medium (₹5,000 - ₹10,000)</option>
                <option value="low">Low (&lt; ₹5,000)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option>All Methods</option>
                <option>Cash</option>
                <option>Card</option>
                <option>UPI</option>
                <option>Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option>All Doctors</option>
                {/* Populate with doctors */}
              </select>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredInvoices.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{stats.total}</span> invoices
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <FaTimes /> Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Filter /> {showFilters ? 'Hide' : 'Advanced'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="mx-auto text-gray-300" size={64} />
            <h3 className="mt-4 text-lg font-bold text-gray-800">No invoices found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || filterStatus !== 'all' || dateFilter
                ? 'Try adjusting your filters'
                : 'No invoices created yet'}
            </p>
            {(searchTerm || filterStatus !== 'all' || dateFilter) && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
              >
                <FaTimes /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('invoice_number')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Invoice #
                      {getSortIcon('invoice_number')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('patient_name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Customer
                      {getSortIcon('patient_name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('issue_date')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Date
                      {getSortIcon('issue_date')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('total')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Amount
                      {getSortIcon('total')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => {
                  const isOverdue = invoice.status === 'Overdue' || invoice.status === 'Unpaid';
                  const hasDueAmount = invoice.due_amount > 0;
                  
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <FileText className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">
                              {invoice.invoice_number || `...${invoice._id.slice(-6)}`}
                            </div>
                            {invoice.prescription_id && (
                              <div className="text-xs text-gray-500">
                                Prescription: {invoice.prescription_id.slice(-6)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-800">
                            {invoice.patient_id 
                              ? `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim()
                              : invoice.customer_name || 'Walk-in Customer'
                            }
                          </div>
                          {invoice.customer_phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {invoice.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(invoice.issue_date || invoice.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.issue_date || invoice.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-lg">
                          {formatCurrency(invoice.total)}
                        </div>
                        {hasDueAmount && (
                          <div className="text-xs text-red-600">
                            Due: {formatCurrency(invoice.due_amount)}
                          </div>
                        )}
                        {invoice.discount > 0 && (
                          <div className="text-xs text-green-600">
                            Discount: {formatCurrency(invoice.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewInvoiceDetails(invoice)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <div className="relative group">
                            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <button
                                onClick={() => handleDownload(invoice._id, 'pdf')}
                                disabled={downloading[invoice._id]}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                <FaFilePdf className="w-4 h-4" /> Download PDF
                              </button>
                              <button
                                onClick={() => handleDownload(invoice._id, 'excel')}
                                disabled={downloading[invoice._id]}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                <FileSpreadsheet className="w-4 h-4" /> Download Excel
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handlePrint(invoice)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          
                          {isOverdue && (
                            <button
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Send Reminder"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Invoice #{selectedInvoice.invoice_number}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedInvoice.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(selectedInvoice.issue_date || selectedInvoice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedInvoice)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Print Invoice"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer & Invoice Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-sm mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">
                      {selectedInvoice.patient_id 
                        ? `${selectedInvoice.patient_id.first_name} ${selectedInvoice.patient_id.last_name}`
                        : selectedInvoice.customer_name || 'Walk-in Customer'
                      }
                    </p>
                    {selectedInvoice.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" /> {selectedInvoice.customer_phone}
                      </div>
                    )}
                    {selectedInvoice.patient_id?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" /> {selectedInvoice.patient_id.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Invoice Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Invoice Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedInvoice.issue_date || selectedInvoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Due Date</p>
                      <p className="font-semibold text-gray-800">
                        {selectedInvoice.due_date 
                          ? new Date(selectedInvoice.due_date).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Payment Method</p>
                      <p className="font-semibold text-gray-800">{selectedInvoice.payment_method || 'Cash'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Reference</p>
                      <p className="font-semibold text-gray-800">
                        {selectedInvoice.prescription_id 
                          ? `Prescription: ${selectedInvoice.prescription_id.slice(-6)}`
                          : 'Direct Sale'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Invoice Items</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{item.medicine_name || item.name}</div>
                            {item.batch_number && (
                              <div className="text-xs text-gray-500">Batch: {item.batch_number}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">
                            {formatCurrency((item.unit_price || 0) * (item.quantity || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium">Subtotal</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(selectedInvoice.subtotal || selectedInvoice.total)}
                    </p>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Discount</p>
                      <p className="text-xl font-bold text-red-600">
                        -{formatCurrency(selectedInvoice.discount)}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Tax</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatCurrency(selectedInvoice.tax)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">Total Amount</p>
                      {selectedInvoice.paid_amount > 0 && (
                        <p className="text-sm text-green-600">
                          Paid: {formatCurrency(selectedInvoice.paid_amount)}
                        </p>
                      )}
                      {selectedInvoice.due_amount > 0 && (
                        <p className="text-sm text-red-600">
                          Due: {formatCurrency(selectedInvoice.due_amount)}
                        </p>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-teal-600">
                      {formatCurrency(selectedInvoice.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceListPage;