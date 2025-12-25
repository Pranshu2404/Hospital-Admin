import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTruck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPlus,
  FaCalendarTimes,
  FaShoppingCart,
  FaUsers,
  FaFileInvoiceDollar,
  FaPrescription,
  FaChartLine,
  FaBoxes,
  FaChevronRight,
  FaFilter,
  FaEye
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

// --- Custom Styles for Charts Override ---
const chartStyles = `
  .chart-container { position: relative; height: 100%; width: 100%; }
  .chart-tooltip { background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 8px 12px; }
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

const ExpiryAlertBar = ({ medicines }) => {
  if (!medicines || medicines.length === 0) {
    return null;
  }
  
  const medicineNames = medicines.slice(0, 3).map(med => med.name).join(', ');
  const remainingCount = medicines.length - 3;
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100">
          <FaCalendarTimes className="text-red-600 text-2xl" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-red-800 text-lg">Expiry Alert!</h3>
              <p className="text-sm text-red-600 mt-1">
                {medicines.length} medicine(s) expiring soon: <strong className="font-semibold">{medicineNames}</strong>
                {remainingCount > 0 && ` and ${remainingCount} more...`}
              </p>
            </div>
            <button className="text-sm font-semibold text-red-700 hover:text-red-800 px-3 py-1 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-100/50 rounded-full blur-2xl"></div>
      <div className="absolute top-0 left-0 w-16 h-16 bg-red-100/30 rounded-full blur-xl"></div>
    </div>
  );
};

const PharmacyDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Enhanced Chart Data
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
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        boxPadding: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
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
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '₹' + (value / 1000) + 'k';
          },
          font: {
            size: 12
          }
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
          apiClient.get('/invoices/stats/pharmacy-monthly'),
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

  // Custom Stat Card Component (inline for consistency)
  const StatCard = ({ title, value, icon: Icon, color, onClick, linkTo, change, changeColor = 'text-slate-500' }) => {
    const CardComponent = linkTo ? Link : 'div';
    const cardProps = linkTo ? { to: linkTo } : onClick ? { onClick } : {};
    
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

    return (
      <CardComponent
        {...cardProps}
        className={`block p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colorClasses[color] || colorClasses.teal} cursor-pointer`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {change && <p className={`text-xs font-medium mt-2 ${changeColor}`}>{change}</p>}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[0]}`}>
            <Icon size={22} />
          </div>
        </div>
      </CardComponent>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading pharmacy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{chartStyles}</style>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pharmacy Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Comprehensive overview of pharmacy operations</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
              <FaCalendarTimes className="text-teal-500" />
              <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
            </div>
            <Link 
              to="/dashboard/pharmacy/add-medicine" 
              className="flex items-center gap-2 bg-white text-slate-700 font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FaPlus /> Add Medicine
            </Link>
            <Link 
              to="/dashboard/pharmacy/pos" 
              className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
            >
              <FaShoppingCart /> POS System
            </Link>
          </div>
        </div>

        {/* Expiry Alert Bar */}
        <ExpiryAlertBar medicines={dashboardData.expiringSoon} />

        {/* Statistics Grid - 8 Cards */}
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
            change="Active suppliers"
          />
          <StatCard 
            title="Expiring Soon" 
            value={dashboardData.stats.expiringThisMonthCount} 
            icon={FaExclamationTriangle} 
            color="orange"
            onClick={() => setIsModalOpen(true)}
            change="View details"
            changeColor="text-orange-600"
          />
          <StatCard 
            title="Today's Revenue" 
            value={formatCurrency(dashboardData.stats.todaysRevenue)} 
            icon={FaMoneyBillWave} 
            color="teal"
            linkTo="/dashboard/pharmacy/history"
            change="Sales performance"
            changeColor="text-teal-600"
          />
          <StatCard 
            title="Total Sales" 
            value={dashboardData.stats.totalSales} 
            icon={FaShoppingCart} 
            color="purple"
            linkTo="/dashboard/pharmacy/history"
            change="Transactions today"
          />
          <StatCard 
            title="Prescriptions" 
            value={dashboardData.stats.totalPrescriptions} 
            icon={FaPrescription} 
            color="indigo"
            linkTo="/dashboard/pharmacy/prescriptions/list"
            change="Active prescriptions"
          />
          <StatCard 
            title="Low Stock" 
            value={dashboardData.stats.lowStockCount} 
            icon={FaExclamationTriangle} 
            color="red"
            linkTo="/dashboard/pharmacy/low-stock"
            change="Need restocking"
            changeColor="text-red-600"
          />
          <StatCard 
            title="Expired Stock" 
            value={dashboardData.stats.expiredStockCount} 
            icon={FaFileInvoiceDollar} 
            color="gray"
            linkTo="/dashboard/pharmacy/expired"
            change="Needs attention"
            changeColor="text-slate-600"
          />
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Sales Chart (2/3 width) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Sales Overview</h2>
                  <p className="text-slate-500 text-sm">Last 7 days performance</p>
                </div>
                <Link to="/dashboard/pharmacy/reports/sales" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors">
                  View Report <FaChevronRight className="inline ml-1" size={10} />
                </Link>
              </div>
              <div className="h-[300px]">
                <Line data={salesChartData} options={salesChartOptions} />
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Stock Alerts */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <QuickActions />
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Alerts</h3>
              <StockAlerts 
                lowStockCount={dashboardData.stats.lowStockCount}
                expiringCount={dashboardData.stats.expiringThisMonthCount}
                expiredCount={dashboardData.stats.expiredStockCount}
              />
            </div>
          </div>
        </div>

        {/* Bottom Grid - Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Sales</h2>
                <p className="text-slate-500 text-sm">Latest transactions</p>
              </div>
              <Link to="/dashboard/pharmacy/sales/history" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors">
                View All <FaChevronRight className="inline ml-1" size={10} />
              </Link>
            </div>
            <RecentSalesTable sales={dashboardData.recentSales} />
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Prescriptions</h2>
                <p className="text-slate-500 text-sm">Latest prescriptions issued</p>
              </div>
              <Link to="/dashboard/pharmacy/prescriptions/list" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors">
                View All <FaChevronRight className="inline ml-1" size={10} />
              </Link>
            </div>
            <RecentPrescriptions prescriptions={dashboardData.recentPrescriptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Medicine Categories</h2>
              <p className="text-slate-500 text-sm">Inventory distribution by category</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-3 py-1 rounded-lg transition-colors">
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
                        boxWidth: 12,
                        font: {
                          family: "'Inter', sans-serif",
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'white',
                      titleColor: '#1e293b',
                      bodyColor: '#475569',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                      usePointStyle: true,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '60%',
                }}
              />
            </div>
            
            {/* Category Breakdown List */}
            <div>
              <div className="space-y-4">
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
                    <div className="flex items-center gap-2">
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