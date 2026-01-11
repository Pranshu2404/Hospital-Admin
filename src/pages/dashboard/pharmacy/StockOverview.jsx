import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronRight,
  FaPlus,
  FaWarehouse,
  FaRupeeSign,
  FaHistory,
  FaClipboardList,
  FaTruck,
  FaExchangeAlt,
  FaPercentage,
  FaChartPie
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
  Eye
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';
import dayjs from 'dayjs';

const StockOverview = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalValue: 0,
    outOfStockCount: 0,
    categoryDistribution: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [
          medicinesRes,
          lowStockRes,
          expiringRes,
          expiredRes,
          activityRes
        ] = await Promise.all([
          apiClient.get('/medicines?limit=1000'),
          apiClient.get('/medicines/low-stock'),
          apiClient.get('/batches/expiring-soon'),
          apiClient.get('/medicines/expired'),
          apiClient.get('/stock-adjustments?limit=10')
        ]);

        const medicines = medicinesRes.data.medicines || medicinesRes.data;
        const totalMedicines = medicines.length;
        const lowStockCount = lowStockRes.data.length;
        const expiringSoonCount = expiringRes.data.length;
        const expiredCount = expiredRes.data.length;

        // Calculate out of stock
        const outOfStockCount = medicines.filter(m => (m.stock_quantity || 0) <= 0).length;

        // Calculate total inventory value
        const totalValue = medicines.reduce((sum, med) =>
          sum + ((med.price_per_unit || 0) * (med.stock_quantity || 0)), 0);

        // Calculate category distribution
        const categoryMap = {};
        medicines.forEach(med => {
          const category = med.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        const categoryDistribution = Object.entries(categoryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalMedicines,
          lowStockCount,
          expiringSoonCount,
          expiredCount,
          totalValue,
          outOfStockCount,
          categoryDistribution
        });

        setRecentActivity(activityRes.data.adjustments || activityRes.data || []);

      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAdjustmentColor = (type) => {
    const colors = {
      'Addition': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
      'Deduction': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/30',
      'Transfer': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
      'Return': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      'Damage': 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
      'Expired': 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/30'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${colors[type] || 'bg-slate-50 text-slate-600'}`;
  };

  if (loading) {
    return (
      <Layout sidebarItems={pharmacySidebar}>
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading inventory data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={pharmacySidebar}>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventory Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Comprehensive view of pharmacy stock and activity</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-3">
            <div className="relative flex-1 lg:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Search medicines, batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full lg:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Medicines</p>
                <h3 className="text-3xl font-bold text-slate-800">{stats.totalMedicines}</h3>
                <p className="text-xs text-slate-500 mt-2">Active inventory items</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <FaBox className="text-blue-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/medicine-list" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-4 block flex items-center gap-1">
              View all <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Low Stock</p>
                <h3 className="text-3xl font-bold text-amber-700">{stats.lowStockCount}</h3>
                <p className="text-xs text-slate-500 mt-2">Need restocking</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <FaExclamationTriangle className="text-amber-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/low-stock" className="text-sm font-semibold text-amber-600 hover:text-amber-700 mt-4 block flex items-center gap-1">
              View details <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-2xl border border-rose-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Expiring Soon</p>
                <h3 className="text-3xl font-bold text-rose-700">{stats.expiringSoonCount}</h3>
                <p className="text-xs text-slate-500 mt-2">Within next 30 days</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50">
                <FaCalendarTimes className="text-rose-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/expired" className="text-sm font-semibold text-rose-600 hover:text-rose-700 mt-4 block flex items-center gap-1">
              Check items <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value</p>
                <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalValue)}</h3>
                <p className="text-xs text-slate-500 mt-2">Inventory worth</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <FaChartLine className="text-slate-600" size={22} />
              </div>
            </div>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-700 mt-4 block flex items-center gap-1">
              Generate Report <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Expired Stock</p>
                <h3 className="text-3xl font-bold text-red-700">{stats.expiredCount}</h3>
                <p className="text-xs text-slate-500 mt-2">Needs disposal</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertCircle className="text-red-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/expired" className="text-sm font-semibold text-red-600 hover:text-red-700 mt-4 block flex items-center gap-1">
              Manage <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Out of Stock</p>
                <h3 className="text-3xl font-bold text-emerald-700">{stats.outOfStockCount}</h3>
                <p className="text-xs text-slate-500 mt-2">Zero inventory items</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <Package className="text-emerald-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/low-stock" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 mt-4 block flex items-center gap-1">
              Reorder <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Categories</p>
                <h3 className="text-3xl font-bold text-purple-700">{stats.categoryDistribution.length}</h3>
                <p className="text-xs text-slate-500 mt-2">Medicine categories</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <FaChartPie className="text-purple-600" size={22} />
              </div>
            </div>
            <Link to="/dashboard/pharmacy/categories" className="text-sm font-semibold text-purple-600 hover:text-purple-700 mt-4 block flex items-center gap-1">
              View Categories <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Stock Activity</h2>
                <p className="text-slate-500 text-sm">Latest inventory adjustments and movements</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Link to="/dashboard/pharmacy/adjustments" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                  View All <FaChevronRight className="inline ml-1" size={10} />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${activity.adjustment_type === 'Addition' ? 'bg-emerald-100 text-emerald-600' :
                        activity.adjustment_type === 'Deduction' ? 'bg-rose-100 text-rose-600' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                      {activity.adjustment_type === 'Addition' ?
                        <TrendingUp className="w-4 h-4" /> :
                        activity.adjustment_type === 'Deduction' ?
                          <TrendingDown className="w-4 h-4" /> :
                          <RefreshCw className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{activity.medicine_id?.name || 'Unknown Medicine'}</p>
                      <p className="text-xs text-slate-500">{activity.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {activity.adjustment_type === 'Addition' ? '+' : '-'}{activity.quantity}
                        </span>
                        <span className={getAdjustmentColor(activity.adjustment_type)}>
                          {activity.adjustment_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {dayjs(activity.createdAt).format('MMM DD, hh:mm A')}
                      </p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <FaHistory className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No recent activity</h3>
                  <p className="text-slate-500 text-sm mt-1">Stock adjustments will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Category Distribution */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/dashboard/pharmacy/add-medicine" className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FaPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Add New Medicine</p>
                      <p className="text-xs text-blue-600">Add to inventory</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                </Link>

                <Link to="/dashboard/pharmacy/create-order" className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FaTruck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Create Purchase Order</p>
                      <p className="text-xs text-emerald-600">Order from suppliers</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                </Link>

                <Link to="/dashboard/pharmacy/adjustments" className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FaExchangeAlt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Stock Adjustment</p>
                      <p className="text-xs text-amber-600">Make corrections</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600" />
                </Link>

                <Link to="/dashboard/pharmacy/reports/inventory" className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Generate Report</p>
                      <p className="text-xs text-purple-600">Inventory analysis</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                </Link>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Top Categories</h3>
              <div className="space-y-3">
                {stats.categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {category.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{category.name}</p>
                        <p className="text-xs text-slate-500">{category.count} medicines</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800">
                        {Math.round((category.count / stats.totalMedicines) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaWarehouse className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Stock Turnover</p>
                <p className="text-lg font-bold text-slate-800">2.4x</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaRupeeSign className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Avg. Medicine Price</p>
                <p className="text-lg font-bold text-slate-800">₹245</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-2xl border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaPercentage className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Stock Accuracy</p>
                <p className="text-lg font-bold text-slate-800">98.2%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FaClipboardList className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Last Audit</p>
                <p className="text-lg font-bold text-slate-800">7 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockOverview;