import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTruck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPlus,
  FaCalendarTimes,
  FaShoppingCart,
  FaBoxes,
  FaFileInvoiceDollar,
  FaPrescription,
  FaChartLine,
  FaChevronRight,
  FaFilter,
  FaEye,
  FaCalendarCheck,
  FaClock,
  FaHeartbeat,
  FaCheckCircle
} from 'react-icons/fa';
import apiClient from '../../../api/apiClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Chart.js Imports
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import StatCardPharmacy from '../../../components/common/StatCardPharmacy';
import ExpiredStockModal from './ExpiredStockModal';
import { QuickActions } from '../../../components/pharmacy/DashboardSections';
import RecentSalesTable from '../../../components/pharmacy/RecentSalesTable';
import RecentPrescriptions from '../../../components/pharmacy/RecentPrescriptions';
import StockAlerts from '../../../components/pharmacy/StockAlerts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

dayjs.extend(relativeTime);

// --- Custom Styles ---
const dashboardStyles = `
  .stat-card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stat-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.02);
  }
  .pulse-dot {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
  .chart-container { 
    position: relative; 
    height: 100%; 
    width: 100%; 
  }
`;

// Color Palette
const COLORS = {
  primary: '#0d9488', // Teal
  secondary: '#2dd4bf',
  accent: '#f59e0b', // Amber
  danger: '#ef4444',
  success: '#10b981',
  info: '#3b82f6',
  warning: '#f97316',
  slate: '#64748b'
};

const ExpiryAlertBar = ({ medicines, onViewAll }) => {
  if (!medicines || medicines.length === 0) {
    return null;
  }

  const medicineNames = medicines.slice(0, 3).map(med => med.name).join(', ');
  const remainingCount = medicines.length - 3;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-amber-100">
          <FaCalendarTimes className="text-amber-600 text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-800 text-lg">Expiry Alert!</h3>
                <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {medicines.length} items
                </span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Expiring soon: <span className="font-semibold">{medicineNames}</span>
                {remainingCount > 0 && ` and ${remainingCount} more`}
              </p>
            </div>
            <button 
              onClick={onViewAll}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 px-4 py-2 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"></div>
    </div>
  );
};

// Custom Stat Card Component (redesigned to match other dashboards)
const StatCard = ({ title, value, icon: Icon, color, onClick, linkTo, change, changeColor = 'text-slate-500' }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (linkTo) navigate(linkTo);
    else if (onClick) onClick();
  };

  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    gray: 'bg-slate-50 text-slate-600 border-slate-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  const iconBgColors = {
    teal: 'bg-teal-600',
    blue: 'bg-blue-600',
    orange: 'bg-orange-500',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
    red: 'bg-red-500',
    gray: 'bg-slate-500',
    green: 'bg-emerald-600'
  };

  return (
    <div
      onClick={handleClick}
      className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {change && (
              <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${changeColor}`}>
                <span className="w-1 h-1 rounded-full bg-current"></span>
                {change}
              </p>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColors[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
    </div>
  );
};

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [hospital, setHospital] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalMedicines: 0,
      totalSuppliers: 0,
      expiredStockCount: 0,
      expiringThisMonthCount: 0,
      todaysRevenue: 0,
      totalSales: 0,
      totalPrescriptions: 0,
      lowStockCount: 0
    },
    lowStockMedicines: [],
    expiredMedicines: [],
    expiringThisMonth: [],
    expiringSoon: [],
    recentSales: [],
    recentPrescriptions: [],
    revenueData: [],
    categoryDistribution: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await apiClient.get('/hospitals');
        if (res.data && res.data.length > 0) {
          setHospital(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  // Enhanced Chart Data (unchanged)
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Sales (₹)',
      data: [12000, 19000, 15000, 21000, 18000, 25000, 23000],
      borderColor: COLORS.primary,
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: COLORS.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            return `₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 12 }
        }
      },
      y: {
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          callback: function (value) {
            return '₹' + (value / 1000) + 'k';
          },
          font: { size: 12 }
        }
      }
    }
  };

  const categoryColors = [
    '#0d9488', '#2dd4bf', '#f59e0b', '#ef4444', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ];

  const categoryChartData = {
    labels: dashboardData.categoryDistribution.map(item => item.name) || ['Loading...'],
    datasets: [{
      data: dashboardData.categoryDistribution.map(item => item.value) || [1],
      backgroundColor: categoryColors,
      borderColor: 'white',
      borderWidth: 2,
      borderRadius: 8,
      spacing: 2,
    }],
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          medicinesResponse,
          suppliersResponse,
          expiredResponse,
          salesResponse,
          prescriptionsResponse,
          revenueResponse,
          lowStockResponse
        ] = await Promise.all([
          apiClient.get('/medicines?limit=100'),
          apiClient.get('/suppliers'),
          apiClient.get('/medicines/expired'),
          apiClient.get('/orders/sale?limit=5&page=1'),
          apiClient.get('/prescriptions?limit=5&page=1'),
          apiClient.get('/invoices/stats/pharmacy-daily'),
          apiClient.get('/medicines/low-stock')
        ]);

        const medicines = medicinesResponse.data.medicines || medicinesResponse.data;
        const suppliers = suppliersResponse.data;
        const expiredMedicines = expiredResponse.data;
        const recentSales = salesResponse.data.sales || salesResponse.data;
        const recentPrescriptions = prescriptionsResponse.data.prescriptions || prescriptionsResponse.data;
        const revenueData = revenueResponse.data;
        const lowStockMedicines = lowStockResponse.data;

        const today = new Date();
        const expiringThisMonth = medicines.filter(med => {
          if (!med.expiry_date) return false;
          const expiryDate = new Date(med.expiry_date);
          return expiryDate.getMonth() === today.getMonth() &&
            expiryDate.getFullYear() === today.getFullYear() &&
            expiryDate >= today;
        });

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);
        const expiringSoon = medicines.filter(med => {
          if (!med.expiry_date) return false;
          const expiryDate = new Date(med.expiry_date);
          return expiryDate >= today && expiryDate <= twoDaysFromNow;
        });

        // Calculate category distribution
        const categoryDistribution = medicines.reduce((acc, med) => {
          const category = med.category || 'Other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        setDashboardData({
          stats: {
            totalMedicines: medicines.length,
            totalSuppliers: suppliers.length,
            expiredStockCount: expiredMedicines.length,
            expiringThisMonthCount: expiringThisMonth.length,
            todaysRevenue: revenueData.totalRevenue || 0,
            totalSales: recentSales.length,
            totalPrescriptions: recentPrescriptions.length,
            lowStockCount: lowStockMedicines.length
          },
          lowStockMedicines: lowStockMedicines.slice(0, 5),
          expiredMedicines,
          expiringThisMonth,
          expiringSoon: expiringSoon.slice(0, 5),
          recentSales: recentSales.slice(0, 5),
          recentPrescriptions: recentPrescriptions.slice(0, 5),
          categoryDistribution: Object.entries(categoryDistribution).map(([name, value], index) => ({
            name,
            value,
            color: categoryColors[index % categoryColors.length]
          }))
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading pharmacy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">

        {/* Header with Hospital Info - Matching other dashboards */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">Pharmacy Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">Comprehensive overview of pharmacy operations</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
              <FaCalendarCheck className="text-teal-500" />
              <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-teal-700 font-mono text-sm tracking-wide">{currentTime.format('HH:mm:ss')}</span>
            </div>
          </div>
        </div>

        {/* Expiry Alert Bar - Redesigned */}
        <ExpiryAlertBar 
          medicines={dashboardData.expiringSoon} 
          onViewAll={() => setIsModalOpen(true)}
        />

        {/* Statistics Grid - 8 Cards - Redesigned to match */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Medicines"
            value={dashboardData.stats.totalMedicines}
            icon={FaBoxes}
            color="indigo"
            linkTo="/dashboard/pharmacy/medicine-list"
            change={`${dashboardData.lowStockMedicines.length} low stock`}
          />
          <StatCard
            title="Total Suppliers"
            value={dashboardData.stats.totalSuppliers}
            icon={FaTruck}
            color="blue"
            linkTo="/dashboard/pharmacy/suppliers"
            change="Active partners"
          />
          <StatCard
            title="Expiring This Month"
            value={dashboardData.stats.expiringThisMonthCount}
            icon={FaCalendarTimes}
            color="orange"
            onClick={() => setIsModalOpen(true)}
            change="Check details"
            changeColor="text-orange-600"
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(dashboardData.stats.todaysRevenue)}
            icon={FaMoneyBillWave}
            color="teal"
            linkTo="/dashboard/pharmacy/history"
            change="Daily earnings"
            changeColor="text-teal-600"
          />
          <StatCard
            title="Total Sales"
            value={dashboardData.stats.totalSales}
            icon={FaShoppingCart}
            color="purple"
            linkTo="/dashboard/pharmacy/history"
            change="Today's transactions"
          />
          <StatCard
            title="Prescriptions"
            value={dashboardData.stats.totalPrescriptions}
            icon={FaPrescription}
            color="indigo"
            linkTo="/dashboard/pharmacy/prescriptions/list"
            change="Pending fulfillment"
          />
          <StatCard
            title="Low Stock Alert"
            value={dashboardData.stats.lowStockCount}
            icon={FaExclamationTriangle}
            color="red"
            linkTo="/dashboard/pharmacy/low-stock"
            change="Needs restocking"
            changeColor="text-red-600"
          />
          <StatCard
            title="Expired Stock"
            value={dashboardData.stats.expiredStockCount}
            icon={FaFileInvoiceDollar}
            color="gray"
            linkTo="/dashboard/pharmacy/expired"
            change="Requires disposal"
            changeColor="text-slate-600"
          />
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Sales Chart (2/3 width) */}
          <div className="xl:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-teal-600" />
                    <h2 className="text-lg font-bold text-slate-800">Sales Overview</h2>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Last 7 days performance</p>
                </div>
                <Link 
                  to="/dashboard/pharmacy/reports/sales" 
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  View Report <FaChevronRight size={10} />
                </Link>
              </div>
              <div className="h-[300px]">
                <Line data={salesChartData} options={salesChartOptions} />
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Stock Alerts */}
          <div className="space-y-8">
            {/* Quick Actions - Redesigned to match other dashboards */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Medicine', icon: FaPlus, path: '/dashboard/pharmacy/add-medicine', color: 'teal' },
                  { label: 'POS System', icon: FaShoppingCart, path: '/dashboard/pharmacy/pos', color: 'green' },
                  { label: 'New Sale', icon: FaMoneyBillWave, path: '/dashboard/pharmacy/pos', color: 'blue' },
                  { label: 'Suppliers', icon: FaTruck, path: '/dashboard/pharmacy/suppliers', color: 'purple' }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-teal-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className={`p-2.5 bg-white rounded-lg text-${item.color}-600 shadow-sm mb-2 group-hover:scale-110 group-hover:bg-${item.color}-500 group-hover:text-white transition-all duration-300`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700 text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Sales */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recent Sales</h3>
                <p className="text-xs text-slate-500 mt-1">Latest transactions</p>
              </div>
              <Link 
                to="/dashboard/pharmacy/history" 
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              <RecentSalesTable sales={dashboardData.recentSales} />
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recent Prescriptions</h3>
                <p className="text-xs text-slate-500 mt-1">Latest prescriptions issued</p>
              </div>
              <Link 
                to="/dashboard/pharmacy/prescriptions/list" 
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              <RecentPrescriptions prescriptions={dashboardData.recentPrescriptions} />
            </div>
          </div>
        </div>

        {/* Category Distribution - Redesigned */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FaBoxes className="text-teal-600" />
                <h2 className="text-lg font-bold text-slate-800">Medicine Categories</h2>
              </div>
              <p className="text-slate-500 text-sm mt-1">Inventory distribution by category</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
              <FaFilter size={12} /> Filter
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        boxWidth: 10,
                        font: { size: 12 }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'white',
                      titleColor: '#1e293b',
                      bodyColor: '#475569',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                      padding: 12,
                      usePointStyle: true,
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '65%',
                }}
              />
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {dashboardData.categoryDistribution.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || categoryColors[index % categoryColors.length] }}
                    />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.value} medicines</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      {Math.round((category.value / dashboardData.stats.totalMedicines) * 100)}%
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <FaEye size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <ExpiredStockModal
          expiringThisMonth={dashboardData.expiringThisMonth}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default PharmacyDashboard;