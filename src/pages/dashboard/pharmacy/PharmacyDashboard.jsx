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
  FaBoxes
} from 'react-icons/fa';
import apiClient from '../../../api/apiClient';

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
// import LowStockList from '../../../components/pharmacy/LowStockList';
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

const ExpiryAlertBar = ({ medicines }) => {
  if (!medicines || medicines.length === 0) {
    return null;
  }
  const medicineNames = medicines.slice(0, 3).map(med => med.name).join(', ');
  const remainingCount = medicines.length - 3;
  
  return (
    <div className="bg-red-50 p-4 border-l-4 border-red-400 rounded-md shadow-md mb-6">
      <div className="flex items-center gap-3">
        <FaCalendarTimes className="text-red-600 text-2xl" />
        <div>
          <h3 className="font-bold text-red-800">Expiry Alert!</h3>
          <p className="text-sm text-gray-700">
            {medicines.length} medicine(s) expiring soon: <strong>{medicineNames}</strong>
            {remainingCount > 0 && ` and ${remainingCount} more...`}
          </p>
        </div>
      </div>
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

  // Chart Data & Options
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Sales (₹)',
      data: [12000, 19000, 15000, 21000, 18000, 25000, 23000],
      borderColor: 'rgb(20, 184, 166)',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
  };

  const categoryChartData = {
    labels: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ],
      borderWidth: 1,
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
          apiClient.get('/api/medicines?limit=100'),
          apiClient.get('/api/suppliers'),
          apiClient.get('/api/medicines/expired'),
          apiClient.get('/api/orders/sale?limit=5&page=1'),
          apiClient.get('/api/prescriptions?limit=5&page=1'),
          apiClient.get('/api/invoices/stats/pharmacy-monthly'),
          apiClient.get('/api/medicines/low-stock')
        ]);

        const medicines = medicinesResponse.data.medicines || medicinesResponse.data;
        const suppliers = suppliersResponse.data;
        const expiredMedicines = expiredResponse.data;
        const recentSales = salesResponse.data.sales || salesResponse.data;
        console.log(salesResponse.data);
        const recentPrescriptions = prescriptionsResponse.data.prescriptions || prescriptionsResponse.data;
        const revenueData = revenueResponse.data;
        console.log(revenueData);
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
          categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({
            name,
            value
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
            <p className="text-gray-500 mt-1">Comprehensive overview of your pharmacy operations</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link to="/dashboard/pharmacy/add-medicine" className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-teal-700">
              <FaPlus /> Add Medicine
            </Link>
            <Link to="/dashboard/pharmacy/pos" className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
              <FaShoppingCart /> POS
            </Link>
          </div>
        </div>

        {/* Expiry Alert Bar */}
        <ExpiryAlertBar medicines={dashboardData.expiringSoon} />

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardPharmacy 
            icon={<FaBoxes className="text-2xl text-blue-600" />}
            title="Total Medicines"
            value={dashboardData.stats.totalMedicines}
            change="Inventory items"
            linkTo="/dashboard/pharmacy/inventory/medicines"
          />
          <StatCardPharmacy 
            icon={<FaTruck className="text-2xl text-green-600" />}
            title="Total Suppliers"
            value={dashboardData.stats.totalSuppliers}
            change="Active Suppliers"
            linkTo="/dashboard/pharmacy/purchasing/suppliers" 
          />
          <StatCardPharmacy 
            icon={<FaExclamationTriangle className="text-2xl text-orange-600" />}
            title="Expiring This Month"
            value={dashboardData.stats.expiringThisMonthCount}
            change="View expiring items"
            changeColor="text-orange-600"
            onClick={() => setIsModalOpen(true)}
          />
          <StatCardPharmacy 
            icon={<FaMoneyBillWave className="text-2xl text-teal-600" />}
            title="Today's Revenue"
            value={formatCurrency(dashboardData.stats.todaysRevenue)}
            change="Sales performance"
            changeColor="text-teal-600"
            linkTo="/dashboard/pharmacy/sales/history"
          />
          <StatCardPharmacy 
            icon={<FaShoppingCart className="text-2xl text-purple-600" />}
            title="Total Sales"
            value={dashboardData.stats.totalSales}
            change="Transactions today"
            linkTo="/dashboard/pharmacy/sales/history"
          />
          <StatCardPharmacy 
            icon={<FaPrescription className="text-2xl text-indigo-600" />}
            title="Prescriptions"
            value={dashboardData.stats.totalPrescriptions}
            change="Active prescriptions"
            linkTo="/dashboard/pharmacy/prescriptions/list"
          />
          <StatCardPharmacy 
            icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
            title="Low Stock"
            value={dashboardData.stats.lowStockCount}
            change="Items need restocking"
            changeColor="text-red-600"
            linkTo="/dashboard/pharmacy/inventory/low-stock"
          />
          <StatCardPharmacy 
            icon={<FaFileInvoiceDollar className="text-2xl text-gray-600" />}
            title="Expired Stock"
            value={dashboardData.stats.expiredStockCount}
            change="Needs attention"
            changeColor="text-gray-600"
            linkTo="/dashboard/pharmacy/inventory/expired"
          />
        </div>

        {/* Charts and Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-700">Sales Overview</h2>
              <Link to="/dashboard/pharmacy/reports/sales" className="text-sm text-teal-600 hover:text-teal-700">
                View Report →
              </Link>
            </div>
            <div className="h-80 relative">
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          </div>

          {/* Quick Actions and Stock Alerts */}
          <div className="space-y-6">
            <QuickActions />
            <StockAlerts 
              lowStockCount={dashboardData.stats.lowStockCount}
              expiringCount={dashboardData.stats.expiringThisMonthCount}
              expiredCount={dashboardData.stats.expiredStockCount}
            />
          </div>
        </div>

        {/* Bottom Grid - Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-700">Recent Sales</h2>
              <Link to="/dashboard/pharmacy/sales/history" className="text-sm text-teal-600 hover:text-teal-700">
                View All →
              </Link>
            </div>
            <RecentSalesTable sales={dashboardData.recentSales} />
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-700">Recent Prescriptions</h2>
              <Link to="/dashboard/pharmacy/prescriptions/list" className="text-sm text-teal-600 hover:text-teal-700">
                View All →
              </Link>
            </div>
            <RecentPrescriptions prescriptions={dashboardData.recentPrescriptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-lg text-gray-700 mb-4">Medicine Category Distribution</h2>
          <div className="h-64">
            <Doughnut 
              data={{
                labels: dashboardData.categoryDistribution.map(item => item.name),
                datasets: [{
                  data: dashboardData.categoryDistribution.map(item => item.value),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)'
                  ],
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }}
            />
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