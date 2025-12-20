import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaCalendarAlt, 
  FaRupeeSign,
  FaHashtag,
  FaBuilding,
  FaExclamationTriangle,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaDownload,
  FaSortAmountDown,
  FaClipboardList,
  FaPercentage,
  FaWarehouse,
  FaHistory
} from 'react-icons/fa';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  RefreshCw,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronRight,
  Filter,
  SortAsc,
  MoreVertical,
  Pill,
  Package2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('expiry');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await apiClient.get('/batches');
        setBatches(response.data.batches || []);
      } catch (err) {
        setError('Failed to fetch batches. Please try again later.');
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const categories = [...new Set(batches.map(batch => batch.medicine_id?.category).filter(Boolean))].sort();

  const getBatchStatus = (expiryDate, quantity) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (quantity === 0) return { 
      status: 'Sold Out', 
      color: 'text-slate-600', 
      bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/30',
      icon: XCircle,
      priority: 0
    };
    if (expiry < today) return { 
      status: 'Expired', 
      color: 'text-red-600', 
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      icon: AlertTriangle,
      priority: 1
    };
    if (expiry < sevenDaysFromNow) return { 
      status: 'Critical', 
      color: 'text-red-600', 
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      icon: AlertCircle,
      priority: 2
    };
    if (expiry < thirtyDaysFromNow) return { 
      status: 'Expiring Soon', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      icon: Clock,
      priority: 3
    };
    return { 
      status: 'Active', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
      icon: CheckCircle,
      priority: 4
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalValue = () => {
    return batches.reduce((sum, batch) => 
      sum + ((batch.purchase_price || 0) * (batch.quantity || 0)), 0);
  };

  const calculateAtRiskValue = () => {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return batches
      .filter(batch => {
        const expiry = new Date(batch.expiry_date);
        return expiry < thirtyDaysFromNow && batch.quantity > 0;
      })
      .reduce((sum, batch) => 
        sum + ((batch.purchase_price || 0) * (batch.quantity || 0)), 0);
  };

  const filteredAndSortedBatches = batches
    .filter(batch => {
      const matchesSearch = batch.medicine_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter ? 
        (statusFilter === 'expiring' ? new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) :
         statusFilter === 'expired' ? new Date(batch.expiry_date) < new Date() :
         statusFilter === 'active' ? batch.quantity > 0 : true) : true;
      
      const matchesCategory = categoryFilter ? batch.medicine_id?.category === categoryFilter : true;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'expiry':
          aVal = new Date(a.expiry_date);
          bVal = new Date(b.expiry_date);
          break;
        case 'quantity':
          aVal = a.quantity || 0;
          bVal = b.quantity || 0;
          break;
        case 'name':
          aVal = a.medicine_id?.name || '';
          bVal = b.medicine_id?.name || '';
          break;
        case 'value':
          aVal = (a.purchase_price || 0) * (a.quantity || 0);
          bVal = (b.purchase_price || 0) * (b.quantity || 0);
          break;
        default:
          aVal = new Date(a.expiry_date);
          bVal = new Date(b.expiry_date);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading batch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Batch Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track medicine batches, expiry dates, and stock levels</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <FaDownload /> Export
          </button>
          <Link 
            to="/dashboard/pharmacy/create-order"
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> Receive New Batch
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Batches</p>
              <h3 className="text-3xl font-bold text-slate-800">{batches.length}</h3>
              <p className="text-xs text-slate-500 mt-2">Active batches</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Package className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Stock</p>
              <h3 className="text-3xl font-bold text-emerald-700">
                {batches.filter(b => b.quantity > 0 && new Date(b.expiry_date) > new Date()).length}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Non-expired batches</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle className="text-emerald-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Expiring Soon</p>
              <h3 className="text-3xl font-bold text-amber-700">
                {batches.filter(b => {
                  const expiry = new Date(b.expiry_date);
                  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return expiry < thirtyDaysFromNow && expiry > new Date() && b.quantity > 0;
                }).length}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Within 30 days</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <Clock className="text-amber-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value</p>
              <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(calculateTotalValue())}</h3>
              <p className="text-xs text-slate-500 mt-2">Inventory worth</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <DollarSign className="text-slate-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* At Risk Value */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">At Risk Inventory</h3>
              <p className="text-red-600 text-sm">Batches expiring within 30 days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-800">{formatCurrency(calculateAtRiskValue())}</p>
            <p className="text-sm text-red-600">
              {batches.filter(b => {
                const expiry = new Date(b.expiry_date);
                const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return expiry < thirtyDaysFromNow && expiry > new Date() && b.quantity > 0;
              }).length} batches
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by medicine or batch number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon (≤30 days)</option>
            <option value="expired">Expired</option>
            <option value="critical">Critical (≤7 days)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="expiry">Sort by Expiry</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="name">Sort by Medicine</option>
              <option value="value">Sort by Value</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filteredAndSortedBatches.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{batches.length}</span> batches
          </span>
          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
            <FaFilter className="inline mr-1" /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedBatches.map((batch) => {
          const status = getBatchStatus(batch.expiry_date, batch.quantity);
          const daysLeft = calculateDaysLeft(batch.expiry_date);
          const StatusIcon = status.icon;
          const batchValue = (batch.purchase_price || 0) * (batch.quantity || 0);
          
          return (
            <div key={batch._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{batch.medicine_id?.name}</h3>
                      <p className="text-xs text-slate-500">Batch: {batch.batch_number}</p>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ring-1 ring-inset ${status.bg}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium mb-1">Quantity</p>
                    <p className="text-lg font-bold text-slate-800">{batch.quantity || 0} units</p>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium mb-1">Days Left</p>
                    <p className={`text-lg font-bold ${
                      daysLeft < 0 ? 'text-red-600' : 
                      daysLeft < 7 ? 'text-red-600' :
                      daysLeft < 30 ? 'text-amber-600' : 
                      'text-emerald-600'
                    }`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Expiry Date</span>
                    <span className="font-medium text-sm">
                      {new Date(batch.expiry_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Purchase Price</span>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign className="text-slate-400 text-xs" />
                      <span className="font-medium">{batch.purchase_price?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Selling Price</span>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign className="text-slate-400 text-xs" />
                      <span className="font-medium">{batch.selling_price?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Batch Value</span>
                    <span className="font-bold text-slate-800">{formatCurrency(batchValue)}</span>
                  </div>

                  {batch.supplier_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Supplier</span>
                      <span className="font-medium text-sm">{batch.supplier_id?.name}</span>
                    </div>
                  )}

                  {batch.medicine_id?.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Category</span>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {batch.medicine_id.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Warnings */}
              <div className="space-y-3">
                {(daysLeft < 30 || daysLeft < 0) && batch.quantity > 0 && (
                  <div className={`p-3 rounded-xl ${
                    daysLeft < 0 ? 'bg-red-50 border border-red-200' :
                    daysLeft < 7 ? 'bg-red-50 border border-red-200' :
                    'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        daysLeft < 0 || daysLeft < 7 ? 'text-red-600' : 'text-amber-600'
                      }`} />
                      <div>
                        <p className="text-sm font-semibold">
                          {daysLeft < 0 ? 'Expired Batch' : 
                           daysLeft < 7 ? 'Critical: Expiring Soon' : 
                           'Expiring Soon'}
                        </p>
                        <p className="text-xs opacity-80 mt-1">
                          {daysLeft < 0 ? 'This batch has expired and should be disposed' : 
                           daysLeft < 7 ? `Expiring in ${daysLeft} days - Urgent action required` :
                           `Expiring in ${daysLeft} days - Consider using first`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Added: {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedBatches.length === 0 && (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Package2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No batches found</h3>
          <p className="text-slate-500 mt-1">
            {searchTerm || statusFilter || categoryFilter 
              ? 'Try adjusting your filters' 
              : 'Start by receiving your first batch'}
          </p>
          {!(searchTerm || statusFilter || categoryFilter) && (
            <Link 
              to="/dashboard/pharmacy/create-order"
              className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
            >
              <FaPlus /> Receive First Batch
            </Link>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {filteredAndSortedBatches.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaWarehouse className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Quantity</p>
                <p className="text-lg font-bold text-slate-800">
                  {filteredAndSortedBatches.reduce((sum, b) => sum + (b.quantity || 0), 0)} units
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaRupeeSign className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Filtered Value</p>
                <p className="text-lg font-bold text-slate-800">
                  {formatCurrency(filteredAndSortedBatches.reduce((sum, b) => 
                    sum + ((b.purchase_price || 0) * (b.quantity || 0)), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaHistory className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Avg. Days Left</p>
                <p className="text-lg font-bold text-slate-800">
                  {Math.round(filteredAndSortedBatches.reduce((sum, b) => 
                    sum + calculateDaysLeft(b.expiry_date), 0) / filteredAndSortedBatches.length)} days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;