import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaExclamationTriangle, 
  FaBox, 
  FaRupeeSign,
  FaShoppingCart,
  FaChartLine,
  FaChevronRight,
  FaDownload,
  FaFilter,
  FaSortAmountDown,
  FaClipboardCheck,
  FaBell,
  FaTruck,
  FaRedo,
  FaPercentage,
  FaHistory
} from 'react-icons/fa';
import {
  AlertTriangle,
  AlertCircle,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Download,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  Zap
} from 'lucide-react';

const LowStockAlert = () => {
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('urgency');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchLowStockMedicines = async () => {
      try {
        const response = await apiClient.get('/medicines/low-stock');
        setLowStockMedicines(response.data);
      } catch (err) {
        setError('Failed to fetch low stock medicines. Please try again later.');
        console.error('Error fetching low stock medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockMedicines();
  }, []);

  const getUrgencyLevel = (quantity, minStock) => {
    const min = minStock || 10;
    const percentage = (quantity / min) * 100;
    
    if (quantity === 0) return { 
      level: 'Critical', 
      color: 'text-red-600', 
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      icon: AlertTriangle,
      priority: 1
    };
    if (percentage < 25) return { 
      level: 'High', 
      color: 'text-red-600', 
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      icon: AlertCircle,
      priority: 2
    };
    if (percentage < 50) return { 
      level: 'Medium', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      icon: Clock,
      priority: 3
    };
    return { 
      level: 'Low', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
      icon: CheckCircle,
      priority: 4
    };
  };

  const calculateNeededQuantity = (medicine) => {
    const minStock = medicine.min_stock_level || 10;
    return Math.max(0, minStock - medicine.stock_quantity);
  };

  const calculateTotalValueAtRisk = () => {
    return lowStockMedicines.reduce((sum, med) => 
      sum + ((med.price_per_unit || 0) * calculateNeededQuantity(med)), 0);
  };

  const calculateRestockingCost = () => {
    return lowStockMedicines.reduce((sum, med) => {
      const needed = calculateNeededQuantity(med);
      const costPrice = med.purchase_price || med.price_per_unit * 0.7; // Estimate 70% of selling price
      return sum + (costPrice * needed);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categories = [...new Set(lowStockMedicines.map(m => m.category).filter(Boolean))].sort();

  const filteredAndSortedMedicines = lowStockMedicines
    .filter(med => !selectedCategory || med.category === selectedCategory)
    .sort((a, b) => {
      const urgencyA = getUrgencyLevel(a.stock_quantity, a.min_stock_level);
      const urgencyB = getUrgencyLevel(b.stock_quantity, b.min_stock_level);
      const neededA = calculateNeededQuantity(a);
      const neededB = calculateNeededQuantity(b);
      
      let comparison = 0;
      
      if (sortBy === 'urgency') {
        comparison = urgencyA.priority - urgencyB.priority;
      } else if (sortBy === 'quantity') {
        comparison = a.stock_quantity - b.stock_quantity;
      } else if (sortBy === 'needed') {
        comparison = neededA - neededB;
      } else if (sortBy === 'value') {
        const valueA = a.price_per_unit * neededA;
        const valueB = b.price_per_unit * neededB;
        comparison = valueA - valueB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const criticalItems = lowStockMedicines.filter(m => m.stock_quantity === 0).length;
  const highUrgencyItems = lowStockMedicines.filter(m => {
    const urgency = getUrgencyLevel(m.stock_quantity, m.min_stock_level);
    return urgency.level === 'High';
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading low stock alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-sm">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Low Stock Alerts</h1>
            <p className="text-slate-500 text-sm mt-1">Medicines that need restocking attention</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <FaDownload /> Export List
          </button>
          <Link 
            to="/dashboard/pharmacy/create-order"
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <FaShoppingCart /> Create Purchase Order
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-lg">Restocking Required</h3>
              <p className="text-red-600 text-sm">
                {lowStockMedicines.length} items need attention • {criticalItems} critical items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-red-600 font-medium">Value at Risk</p>
              <p className="text-xl font-bold text-red-800">{formatCurrency(calculateTotalValueAtRisk())}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-600 font-medium">Restocking Cost</p>
              <p className="text-xl font-bold text-red-800">{formatCurrency(calculateRestockingCost())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Alerts</p>
              <h3 className="text-3xl font-bold text-red-700">{lowStockMedicines.length}</h3>
              <p className="text-xs text-slate-500 mt-2">Items needing attention</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <AlertTriangle className="text-red-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Critical Items</p>
              <h3 className="text-3xl font-bold text-amber-700">{criticalItems}</h3>
              <p className="text-xs text-slate-500 mt-2">Out of stock</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <XCircle className="text-amber-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">High Urgency</p>
              <h3 className="text-3xl font-bold text-orange-700">{highUrgencyItems}</h3>
              <p className="text-xs text-slate-500 mt-2">Less than 25% stock</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <AlertCircle className="text-orange-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Needed</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {lowStockMedicines.reduce((sum, med) => sum + calculateNeededQuantity(med), 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Units to order</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <Package className="text-slate-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              >
                <option value="urgency">Sort by Urgency</option>
                <option value="quantity">Sort by Current Stock</option>
                <option value="needed">Sort by Quantity Needed</option>
                <option value="value">Sort by Value</option>
              </select>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors">
              <FaClipboardCheck /> Generate Order List
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 border border-teal-200 text-teal-700 font-semibold rounded-xl hover:bg-teal-100 transition-colors">
              <FaTruck /> Quick Reorder
            </button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filteredAndSortedMedicines.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{lowStockMedicines.length}</span> low stock items
          </span>
        </div>
      </div>

      {/* Low Stock Medicines */}
      <div className="space-y-4 mb-8">
        {filteredAndSortedMedicines.map((medicine) => {
          const urgency = getUrgencyLevel(medicine.stock_quantity, medicine.min_stock_level);
          const needed = calculateNeededQuantity(medicine);
          const UrgencyIcon = urgency.icon;
          const stockPercentage = ((medicine.stock_quantity / (medicine.min_stock_level || 10)) * 100).toFixed(0);
          
          return (
            <div key={medicine._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Medicine Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">{medicine.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ring-1 ring-inset ${urgency.bg}`}>
                          <UrgencyIcon className="w-3 h-3" />
                          {urgency.level}
                        </span>
                      </div>
                      {medicine.generic_name && (
                        <p className="text-sm text-slate-500 mt-1">Generic: {medicine.generic_name}</p>
                      )}
                      {medicine.category && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                          {medicine.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Progress */}
                <div className="w-full lg:w-48">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Stock Level</span>
                      <span className="font-semibold">{medicine.stock_quantity} / {medicine.min_stock_level || 10}</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          stockPercentage <= 0 ? 'bg-red-500' :
                          stockPercentage <= 25 ? 'bg-red-400' :
                          stockPercentage <= 50 ? 'bg-amber-400' :
                          'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, stockPercentage)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{stockPercentage}% of minimum</span>
                      <span className="font-semibold">Need {needed} units</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <FaRupeeSign className="text-slate-400 text-sm" />
                      <span className="text-lg font-bold text-slate-800">{medicine.price_per_unit?.toFixed(2)}</span>
                      <span className="text-xs text-slate-500">/unit</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Total: {formatCurrency(medicine.price_per_unit * needed)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/pharmacy/create-order?medicine=${medicine._id}&quantity=${needed}`}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold text-sm rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" /> Order
                    </Link>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedMedicines.length === 0 && (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All medicines are well stocked!</h3>
          <p className="text-slate-500 mt-1">No low stock alerts at the moment</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link 
              to="/dashboard/pharmacy/medicines"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              View All Medicines
            </Link>
            <Link 
              to="/dashboard/pharmacy/inventory"
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
            >
              <FaTruck /> Proactive Order
            </Link>
          </div>
        </div>
      )}

      {/* Summary & Recommendations */}
      {filteredAndSortedMedicines.length > 0 && (
        <div className="space-y-6">
          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FaPercentage className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg. Stock Level</p>
                  <p className="text-lg font-bold text-slate-800">
                    {lowStockMedicines.length > 0 
                      ? Math.round(lowStockMedicines.reduce((sum, med) => 
                          sum + ((med.stock_quantity / (med.min_stock_level || 10)) * 100), 0) / lowStockMedicines.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FaHistory className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Last Restocked</p>
                  <p className="text-lg font-bold text-slate-800">
                    {lowStockMedicines.length > 0 ? '2 days ago' : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Turnover Rate</p>
                  <p className="text-lg font-bold text-slate-800">2.8x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-xl mb-2">Ready to restock?</h3>
                <p className="opacity-90">
                  Create a purchase order for all {filteredAndSortedMedicines.length} low stock items with one click
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors">
                  Estimate Cost
                </button>
                <Link 
                  to="/dashboard/pharmacy/create-order"
                  className="px-4 py-2.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Create Bulk Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;