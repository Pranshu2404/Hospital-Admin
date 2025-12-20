import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle,
  FaBoxOpen,
  FaTimes,
  FaCheck,
  FaChevronRight,
  FaDownload,
  FaSortAmountDown,
  FaClipboardList,
  FaHistory,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaRupeeSign,
  FaBarcode,
  FaList,
  FaPercentage,
  FaPhone,
  FaEnvelope,
  FaPrint,
  FaEllipsisV,
  FaExpand,
  FaFileExport,
  FaCalendar,
  FaUser,
  FaWarehouse
} from 'react-icons/fa';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  SortAsc,
  MoreVertical,
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Truck,
  FileText,
  BarChart3,
  RefreshCw,
  Plus,
  Minus,
  AlertTriangle,
  Package2,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  Printer,
  Maximize2,
  ExternalLink,
  FileDown,
  User,
  Building
} from 'lucide-react';

const PurchaseOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receivingItems, setReceivingItems] = useState({});
  const [receivingLoading, setReceivingLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    ordered: 0,
    received: 0,
    partial: 0,
    totalValue: 0
  });
  const [sortField, setSortField] = useState('order_date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, statusFilter, supplierFilter, dateFilter, sortField, sortDirection]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10,
        sort: sortField,
        order: sortDirection
      };
      if (statusFilter) params.status = statusFilter;
      if (supplierFilter) params.supplier = supplierFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiClient.get('/orders/purchase', { params });
      console.log('Fetched Orders:', response.data);
      
      // Apply search filter on client side if not handled by API
      let filteredOrders = response.data.orders || [];
      if (searchTerm && !params.search) {
        filteredOrders = filteredOrders.filter(order => 
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier_id?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setOrders(filteredOrders);
      setTotalPages(response.data.totalPages || 1);
      
      // Calculate statistics
      const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      setStats({
        total: filteredOrders.length,
        draft: filteredOrders.filter(o => o.status === 'Draft').length,
        ordered: filteredOrders.filter(o => o.status === 'Ordered').length,
        received: filteredOrders.filter(o => o.status === 'Received').length,
        partial: filteredOrders.filter(o => o.status === 'Partially Received').length,
        totalValue
      });
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/purchase/${orderId}`);
      setSelectedOrder(response.data);
      setShowModal(true);
      
      // Initialize receiving items with 0 quantities
      const initialReceiving = {};
      response.data.items.forEach(item => {
        initialReceiving[item._id] = {
          received: item.received || 0,
          toReceive: Math.max(0, (item.quantity - (item.received || 0))),
          maxAllowed: Math.max(0, (item.quantity - (item.received || 0)))
        };
      });
      setReceivingItems(initialReceiving);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error:', err);
    }
  };

  const handleReceiveItem = (itemId, value) => {
    const numericValue = parseInt(value) || 0;
    const item = selectedOrder.items.find(item => item._id === itemId);
    if (!item) return;
    
    const maxAllowed = item.quantity - (item.received || 0);
    
    setReceivingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        toReceive: Math.min(Math.max(0, numericValue), maxAllowed)
      }
    }));
  };

  const submitReceiving = async () => {
    try {
      setReceivingLoading(true);
      
      // Prepare the receive data
      const receiveData = {
        items: Object.entries(receivingItems).map(([itemId, values]) => ({
          item_id: itemId,
          quantity_received: values.toReceive
        }))
      };

      console.log('Submitting Receive Data:', receiveData.items);
      
      await apiClient.post(`/orders/purchase/${selectedOrder._id}/receive`, { 
        received_items: receiveData.items 
      });
      
      // Show success message
      setError('');
      
      // Refresh the orders list and close the modal
      fetchPurchaseOrders();
      setShowModal(false);
      setSelectedOrder(null);
      setReceivingItems({});
      
    } catch (err) {
      setError('Failed to receive items');
      console.error('Error:', err);
    } finally {
      setReceivingLoading(false);
    }
  };

  const handleFillAll = () => {
    const maxReceiving = {};
    selectedOrder.items.forEach(item => {
      const pending = item.quantity - (item.received || 0);
      maxReceiving[item._id] = {
        received: item.received || 0,
        toReceive: Math.max(0, pending),
        maxAllowed: Math.max(0, pending)
      };
    });
    setReceivingItems(maxReceiving);
  };

  const handleClearAll = () => {
    const resetReceiving = {};
    selectedOrder.items.forEach(item => {
      resetReceiving[item._id] = {
        received: item.received || 0,
        toReceive: 0,
        maxAllowed: Math.max(0, item.quantity - (item.received || 0))
      };
    });
    setReceivingItems(resetReceiving);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FileText,
        bgColor: 'bg-gray-100'
      },
      Ordered: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        bgColor: 'bg-blue-100'
      },
      Received: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-100'
      },
      'Partially Received': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        bgColor: 'bg-yellow-100'
      },
      Cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        bgColor: 'bg-red-100'
      }
    };
    
    const config = statusConfig[status] || statusConfig.Draft;
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

  const canReceiveStock = (order) => {
    return order.status === 'Ordered' || order.status === 'Partially Received';
  };

  const suppliers = [...new Set(orders.map(order => order.supplier_id?.name).filter(Boolean))].sort();

  const handlePrintOrder = (order) => {
    // Implement print functionality
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Purchase Order</h1>
            <h2>#${order.order_number}</h2>
          </div>
          <div class="section">
            <h3>Supplier Information</h3>
            <p><strong>Name:</strong> ${order.supplier_id?.name || 'N/A'}</p>
            <p><strong>Contact:</strong> ${order.supplier_id?.contactPerson || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.supplier_id?.phone || 'N/A'}</p>
          </div>
          <div class="section">
            <h3>Order Details</h3>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Expected Delivery:</strong> ${new Date(order.expected_delivery_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <div class="section">
            <h3>Items</h3>
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
                ${order.items.map(item => `
                  <tr>
                    <td>${item.medicine_id?.name || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_cost)}</td>
                    <td>${formatCurrency(item.unit_cost * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p class="total">Total Amount: ${formatCurrency(order.total_amount)}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportOrders = () => {
    // Simple CSV export
    const csvContent = [
      ['Order Number', 'Supplier', 'Order Date', 'Items', 'Total Amount', 'Status'],
      ...orders.map(order => [
        order.order_number,
        order.supplier_id?.name,
        new Date(order.order_date).toLocaleDateString(),
        order.items.length,
        order.total_amount,
        order.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your pharmacy purchase orders</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button 
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FaDownload /> Export
          </button>
          <Link
            to="/dashboard/pharmacy/create-order"
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> Create Purchase Order
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

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
              <p className="text-xs text-gray-500 mt-2">All purchase orders</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <ShoppingCart className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-2xl border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold text-yellow-700">{stats.draft + stats.ordered}</h3>
              <p className="text-xs text-gray-500 mt-2">Awaiting processing</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <Clock className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Received</p>
              <h3 className="text-3xl font-bold text-green-700">{stats.received}</h3>
              <p className="text-xs text-gray-500 mt-2">Completed orders</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <CheckCircle className="text-green-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Value</p>
              <h3 className="text-3xl font-bold text-gray-800">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-xs text-gray-500 mt-2">Orders worth</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <DollarSign className="text-gray-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by order number, supplier..."
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
            <option value="Draft">Draft</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{orders.length}</span> orders
          </span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSort('total_amount')}
              className="text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <FaSortAmountDown /> Sort
            </button>
            <button 
              onClick={() => {
                setStatusFilter('');
                setSupplierFilter('');
                setDateFilter('');
                setSearchTerm('');
                setPage(1);
              }}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No purchase orders found</h3>
          <p className="text-gray-500 mt-1">
            {statusFilter || supplierFilter || dateFilter || searchTerm
              ? 'Try adjusting your filters' 
              : 'Start by creating your first purchase order'}
          </p>
          {!(statusFilter || supplierFilter || dateFilter || searchTerm) && (
            <Link
              to="/dashboard/pharmacy/create-order"
              className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
            >
              <FaPlus /> Create First Order
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {orders.map((order) => {
            const canReceive = canReceiveStock(order);
            const receivedPercentage = order.items.length > 0 
              ? Math.round((order.items.reduce((sum, item) => sum + (item.received || 0), 0) / 
                           order.items.reduce((sum, item) => sum + item.quantity, 0)) * 100)
              : 0;
            
            return (
              <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                          {order.isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <AlertTriangle className="w-3 h-3" /> Urgent
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Supplier</p>
                            <p className="font-semibold text-gray-800">{order.supplier_id?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Order Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(order.order_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Delivery Date</p>
                            <p className={`font-semibold ${
                              new Date(order.expected_delivery_date) < new Date() && order.status !== 'Received'
                                ? 'text-red-600'
                                : 'text-gray-800'
                            }`}>
                              {new Date(order.expected_delivery_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <FaRupeeSign className="text-gray-400 text-sm" />
                        <span className="text-xl font-bold text-gray-800">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <FaList className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-500">{order.items.length} items</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar for Partial Receipts */}
                    {(order.status === 'Partially Received' || order.status === 'Received') && (
                      <div className="w-full lg:w-48">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Received</span>
                          <span>{receivedPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              receivedPercentage === 100 ? 'bg-green-500' :
                              receivedPercentage >= 50 ? 'bg-yellow-400' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${receivedPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fetchOrderDetails(order._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    
                    {order.status === 'Draft' && (
                      <Link
                        to={`/dashboard/pharmacy/purchasing/edit-order/${order._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-sm rounded-xl hover:bg-teal-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Link>
                    )}
                    
                    {canReceive && (
                      <button
                        onClick={() => fetchOrderDetails(order._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
                      >
                        <Truck className="w-4 h-4" /> Receive
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handlePrintOrder(order)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Print Order"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Order #{selectedOrder.order_number}</h3>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Print Order"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                    setReceivingItems({});
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-sm mb-3">Supplier Information</h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">{selectedOrder.supplier_id?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.supplier_id?.contactPerson || 'N/A'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" /> {selectedOrder.supplier_id?.phone || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" /> {selectedOrder.supplier_id?.email || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Order Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Order Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedOrder.order_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Expected Delivery</p>
                      <p className={`font-semibold ${
                        new Date(selectedOrder.expected_delivery_date) < new Date() && selectedOrder.status !== 'Received'
                          ? 'text-red-600'
                          : 'text-gray-800'
                      }`}>
                        {new Date(selectedOrder.expected_delivery_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Payment Terms</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.payment_terms || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                      <p className="font-bold text-gray-800 text-lg">{formatCurrency(selectedOrder.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800">Order Items</h4>
                  <span className="text-sm text-gray-500">{selectedOrder.items.length} items</span>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                        {canReceiveStock(selectedOrder) && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receive Now</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item) => {
                        const pending = item.quantity - (item.received || 0);
                        return (
                          <tr key={item._id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{item.medicine_id?.name || 'N/A'}</p>
                                {item.batch_number && (
                                  <p className="text-xs text-gray-500">Batch: {item.batch_number}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{item.quantity}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.received === item.quantity 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {item.received || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pending === 0 
                                  ? 'bg-green-100 text-green-700'
                                  : pending > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {pending}
                              </span>
                            </td>
                            {canReceiveStock(selectedOrder) && (
                              <td className="px-4 py-3">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max={pending}
                                    value={receivingItems[item._id]?.toReceive || 0}
                                    onChange={(e) => handleReceiveItem(item._id, e.target.value)}
                                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    disabled={pending === 0}
                                  />
                                  {pending > 0 && (
                                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                      max {pending}
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="px-4 py-3 font-medium">{formatCurrency(item.unit_cost)}</td>
                            <td className="px-4 py-3 font-bold text-gray-800">
                              {formatCurrency(item.unit_cost * item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receive Action */}
              {canReceiveStock(selectedOrder) && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-2xl border border-green-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold text-green-800 mb-1">Receive Stock</h4>
                      <p className="text-sm text-green-700">
                        Update quantities received for each item above
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFillAll}
                        className="px-4 py-2.5 bg-white border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors"
                        disabled={Object.values(receivingItems).every(item => item.toReceive === item.maxAllowed)}
                      >
                        Fill All
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={submitReceiving}
                        disabled={receivingLoading || Object.values(receivingItems).every(item => item.toReceive === 0)}
                        className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {receivingLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FaCheck />
                        )}
                        Receive Items
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersList;