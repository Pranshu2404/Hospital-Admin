import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPrint,
  FaMoneyBillWave,
  FaDownload,
  FaSortAmountDown,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileExport,
  FaChartLine,
  FaTags,
  FaPercent,
  FaUser,
  FaPhone,
  FaIdCard,
  FaReceipt,
  FaShoppingCart,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaShieldAlt,
  FaArrowRight,
  FaSpinner,
  FaRedo,
  FaExpand,
  FaRegCopy,
  FaChartBar,
} from 'react-icons/fa';
import {
  History,
  Search,
  Filter,
  Eye,
  Printer,
  Calendar,
  DollarSign,
  Download,
  SortAsc,
  SortDesc,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  Percent,
  User,
  Phone,
  CreditCard,
  Receipt,
  ShoppingCart,
  Smartphone,
  Building,
  Shield,
  ArrowRight,
  Loader,
  RefreshCw,
  Maximize2,
  Copy,
  BarChart3,
  TrendingDown,
  ChevronRight,
  Package,
  ExternalLink,
  FileText,
  Activity,
  Calendar as CalendarIcon,
  Bell,
  Info,
  Users
} from 'lucide-react';

const SalesHistory = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [sortBy, setSortBy] = useState('sale_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageSale: 0,
    todaySales: 0,
    pendingPayments: 0,
    topPaymentMethod: 'Cash'
  });

  useEffect(() => {
    fetchSales();
  }, [page, dateFilter, statusFilter, paymentFilter, sortBy, sortOrder]);

  const fetchSales = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);
      
      const params = { 
        page, 
        limit: 10,
        sort: sortBy,
        order: sortOrder
      };
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_method = paymentFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiClient.get('/orders/sale', { params });
      setSales(response.data.sales || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalSales(response.data.total || 0);
      
      // Calculate statistics
      const salesData = response.data.sales || [];
      calculateStats(salesData);
      
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (salesData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const todaySales = salesData.filter(sale => 
      new Date(sale.sale_date) >= today
    ).length;
    
    const paymentMethods = {};
    salesData.forEach(sale => {
      const method = sale.payment_method || 'Cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });
    
    let topPaymentMethod = 'Cash';
    let maxCount = 0;
    Object.entries(paymentMethods).forEach(([method, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topPaymentMethod = method;
      }
    });
    
    setStats({
      totalRevenue,
      totalTransactions: salesData.length,
      averageSale: salesData.length > 0 ? totalRevenue / salesData.length : 0,
      todaySales,
      pendingPayments: salesData.filter(sale => 
        sale.status === 'Pending' || sale.payment_status === 'Pending'
      ).length,
      topPaymentMethod
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPaymentBadge = (method) => {
    const methods = {
      Cash: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: DollarSign,
        bgColor: 'bg-green-500'
      },
      Card: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CreditCard,
        bgColor: 'bg-blue-500'
      },
      UPI: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Smartphone,
        bgColor: 'bg-purple-500'
      },
      'Net Banking': { 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Building,
        bgColor: 'bg-orange-500'
      },
      Insurance: { 
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: Shield,
        bgColor: 'bg-teal-500'
      },
      'Bank Transfer': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Building,
        bgColor: 'bg-indigo-500'
      }
    };
    
    const config = methods[method] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: DollarSign,
      bgColor: 'bg-gray-500'
    };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {method}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statuses = {
      Completed: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-500'
      },
      Pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        bgColor: 'bg-yellow-500'
      },
      Cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        bgColor: 'bg-red-500'
      },
      Refunded: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: RefreshCw,
        bgColor: 'bg-blue-500'
      },
      'Partially Paid': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Percent,
        bgColor: 'bg-indigo-500'
      }
    };
    
    const config = statuses[status] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Info,
      bgColor: 'bg-gray-500'
    };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const handlePrintReceipt = (sale) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Receipt #${sale.sale_number}</title>
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
            .status-completed { background-color: #d4edda; color: #155724; }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { 
              body { margin: 0; padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PHARMACY SALES RECEIPT</h1>
            <h2>Receipt #${sale.sale_number}</h2>
          </div>
          
          <div class="info">
            <div>
              <h3>Customer Information:</h3>
              <p><strong>${sale.patient_id ? 
                `${sale.patient_id.first_name} ${sale.patient_id.last_name}` : 
                sale.customer_name || 'Walk-in Customer'}</strong></p>
              ${sale.customer_phone ? `<p>Phone: ${sale.customer_phone}</p>` : ''}
              ${sale.patient_id?.patientId ? `<p>Patient ID: ${sale.patient_id.patientId}</p>` : ''}
            </div>
            <div>
              <h3>Sale Details:</h3>
              <p><strong>Date:</strong> ${new Date(sale.sale_date).toLocaleString()}</p>
              <p><strong>Receipt #:</strong> ${sale.sale_number}</p>
              <p><strong>Status:</strong> <span class="status status-${sale.status?.toLowerCase()}">${sale.status || 'Completed'}</span></p>
              <p><strong>Payment Method:</strong> ${sale.payment_method || 'Cash'}</p>
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
              ${sale.items.map(item => `
                <tr>
                  <td>${item.medicine_name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unit_price?.toFixed(2)}</td>
                  <td>₹${((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            ${sale.subtotal ? `<p>Subtotal: ₹${sale.subtotal.toFixed(2)}</p>` : ''}
            ${sale.discount > 0 ? `<p>Discount: -₹${sale.discount.toFixed(2)}</p>` : ''}
            ${sale.tax > 0 ? `<p>Tax: ₹${sale.tax.toFixed(2)}</p>` : ''}
            <p class="total">Total: ₹${sale.total_amount.toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for returns/exchanges</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadReport = async (format = 'pdf') => {
    try {
      setDownloading({ all: true });
      
      const response = await apiClient.get('/orders/sale/export', {
        params: {
          date: dateFilter,
          status: statusFilter,
          payment_method: paymentFilter,
          format: format
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setDownloading({});
    }
  };

  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('');
    setPaymentFilter('');
    setPage(1);
    setSortBy('sale_date');
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

  const filteredSales = useMemo(() => {
    let filtered = sales;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => {
        const customerName = sale.patient_id 
          ? `${sale.patient_id.first_name} ${sale.patient_id.last_name}`.toLowerCase()
          : (sale.customer_name || '').toLowerCase();
        
        const saleNumber = (sale.sale_number || '').toLowerCase();
        const customerPhone = (sale.customer_phone || '').toLowerCase();
        const items = sale.items.map(item => 
          item.medicine_name.toLowerCase()
        ).join(' ');
        
        return customerName.includes(searchLower) ||
               saleNumber.includes(searchLower) ||
               customerPhone.includes(searchLower) ||
               items.includes(searchLower);
      });
    }
    
    return filtered;
  }, [sales, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading sales history...</p>
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
            <History className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
            <p className="text-gray-600 text-sm mt-1">View and manage your pharmacy sales records</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button
            onClick={() => handleDownloadReport('excel')}
            disabled={downloading.all}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {downloading.all ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Export
          </button>
          <Link
            to="/dashboard/pharmacy/prescriptions/dispense"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> New Sale
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-xs text-gray-500 mt-2">From {stats.totalTransactions} sales</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <DollarSign className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Today's Sales</p>
              <h3 className="text-3xl font-bold text-green-700">{stats.todaySales}</h3>
              <p className="text-xs text-gray-500 mt-2">Transactions today</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <CalendarIcon className="text-green-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-2xl border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Average Sale</p>
              <h3 className="text-3xl font-bold text-yellow-700">{formatCurrency(stats.averageSale)}</h3>
              <p className="text-xs text-gray-500 mt-2">Per transaction</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <BarChart3 className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Top Payment</p>
              <h3 className="text-3xl font-bold text-purple-700">{stats.topPaymentMethod}</h3>
              <p className="text-xs text-gray-500 mt-2">Most used method</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <CreditCard className="text-purple-600" size={22} />
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
              placeholder="Search by customer name, phone, sale number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Insurance">Insurance</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="sale_date">Sort by Date</option>
              <option value="total_amount">Sort by Amount</option>
              <option value="customer_name">Sort by Customer</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() => toggleSort(sortBy)}
              className="p-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option>All Amounts</option>
                <option>High (&gt; ₹10,000)</option>
                <option>Medium (₹5,000 - ₹10,000)</option>
                <option>Low (&lt; ₹5,000)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items Count</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option>Any</option>
                <option>1-5 items</option>
                <option>6-10 items</option>
                <option>10+ items</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredSales.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalSales}</span> sales
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
              <FaFilter /> {showFilters ? 'Hide' : 'Advanced'} Filters
            </button>
            <button
              onClick={() => fetchSales(true)}
              disabled={refreshing}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              {refreshing ? (
                <Loader className="animate-spin w-3 h-3" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-16 text-center">
            <History className="mx-auto text-gray-300" size={64} />
            <h3 className="mt-4 text-lg font-bold text-gray-800">No sales found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || statusFilter || paymentFilter
                ? 'Try adjusting your filters'
                : 'No sales records available'}
            </p>
            {(searchTerm || statusFilter || paymentFilter) && (
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
                      onClick={() => toggleSort('sale_number')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Sale #
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('customer_name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Customer
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('sale_date')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Date & Time
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('total_amount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Amount
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
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
                {filteredSales.map((sale) => {
                  const isPending = sale.status === 'Pending' || sale.payment_status === 'Pending';
                  const hasDiscount = sale.discount > 0;
                  
                  return (
                    <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <Receipt className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{sale.sale_number}</div>
                            {sale.prescription_id && (
                              <div className="text-xs text-gray-500">
                                Prescription: {sale.prescription_id.slice(-6)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-800">
                            {sale.patient_id 
                              ? `${sale.patient_id.first_name} ${sale.patient_id.last_name}`
                              : sale.customer_name || 'Walk-in Customer'
                            }
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            {sale.customer_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {sale.customer_phone}
                              </span>
                            )}
                            {sale.patient_id?.patientId && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> ID: {sale.patient_id.patientId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(sale.sale_date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.sale_date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{sale.items.length}</span>
                          <span className="text-sm text-gray-500">items</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {sale.items.slice(0, 2).map(item => item.medicine_name).join(', ')}
                          {sale.items.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-lg">
                          {formatCurrency(sale.total_amount)}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-green-600">
                            -{formatCurrency(sale.discount)} discount
                          </div>
                        )}
                        {sale.subtotal && (
                          <div className="text-xs text-gray-500">
                            Subtotal: {formatCurrency(sale.subtotal)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(sale.payment_method)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(sale.status || 'Completed')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewSaleDetails(sale)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          
                          {isPending && (
                            <button
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Payment Pending"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          
                          <Link
                            to={`/dashboard/pharmacy/invoices/${sale._id}`}
                            className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold text-gray-800">{page}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2.5 rounded-xl transition-colors ${
                    page === pageNum
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Pending Payments Alert */}
      {stats.pendingPayments > 0 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-2xl border border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-yellow-800">Pending Payments</h4>
              <p className="text-yellow-700 text-sm mt-1">
                You have <span className="font-bold">{stats.pendingPayments}</span> sales with pending payments. 
                Follow up with customers to complete these transactions.
              </p>
            </div>
            <button className="px-4 py-2 bg-yellow-100 text-yellow-800 font-medium rounded-xl hover:bg-yellow-200 transition-colors">
              View Pending
            </button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Sale #{selectedSale.sale_number}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedSale.status || 'Completed')}
                    <span className="text-sm text-gray-500">
                      {new Date(selectedSale.sale_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintReceipt(selectedSale)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Print Receipt"
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
              {/* Customer & Sale Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-sm mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">
                      {selectedSale.patient_id 
                        ? `${selectedSale.patient_id.first_name} ${selectedSale.patient_id.last_name}`
                        : selectedSale.customer_name || 'Walk-in Customer'
                      }
                    </p>
                    {selectedSale.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" /> {selectedSale.customer_phone}
                      </div>
                    )}
                    {selectedSale.patient_id?.patientId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" /> Patient ID: {selectedSale.patient_id.patientId}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Sale Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Sale Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedSale.sale_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Payment Method</p>
                      <div className="mt-1">
                        {getPaymentBadge(selectedSale.payment_method)}
                      </div>
                    </div>
                    {selectedSale.prescription_id && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Prescription</p>
                        <p className="font-semibold text-gray-800">
                          #{selectedSale.prescription_id.slice(-6)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Sold By</p>
                      <p className="font-semibold text-gray-800">
                        {selectedSale.created_by?.name || 'System'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Sale Items ({selectedSale.items.length})</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedSale.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{item.medicine_name}</div>
                            {item.batch_number && (
                              <div className="text-xs text-gray-500">Batch: {item.batch_number}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">
                            {formatCurrency((item.unit_price || 0) * (item.quantity || 1))}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                              {'N/A'}
                            </span>
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
                  {selectedSale.subtotal && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Subtotal</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(selectedSale.subtotal)}
                      </p>
                    </div>
                  )}
                  {selectedSale.discount > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Discount</p>
                      <p className="text-xl font-bold text-red-600">
                        -{formatCurrency(selectedSale.discount)}
                      </p>
                    </div>
                  )}
                  {selectedSale.tax > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium">Tax</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatCurrency(selectedSale.tax)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">Total Amount</p>
                      {selectedSale.notes && (
                        <p className="text-sm text-gray-500 mt-1">{selectedSale.notes}</p>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-teal-600">
                      {formatCurrency(selectedSale.total_amount)}
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

export default SalesHistory;