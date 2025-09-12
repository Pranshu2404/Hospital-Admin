import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaHospital,
  FaUserMd,
  FaPills,
  FaStethoscope,
  FaRupeeSign,
  FaReceipt,
  FaUsers,
  FaClock
} from 'react-icons/fa';

const RevenueStats = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  useEffect(() => {
    fetchRevenueData();
  }, [filters.period]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Fetch overview data
      const overviewResponse = await axios.get(`${baseUrl}/api/revenue`, {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      });
      setRevenueData(overviewResponse.data);

      // Fetch daily report
      const dailyResponse = await axios.get(`${baseUrl}/api/revenue/daily`, {
        params: { date: filters.startDate }
      });
      setDailyRevenue(dailyResponse.data);

      // Fetch monthly report
      const monthlyResponse = await axios.get(`${baseUrl}/api/revenue/monthly`, {
        params: { 
          year: filters.year,
          month: filters.month
        }
      });
      setMonthlyRevenue(monthlyResponse.data);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
      alert('Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    // Simple CSV export implementation
    let csvContent = 'Revenue Report\n\n';
    
    if (revenueData) {
      csvContent += `Period: ${formatDate(revenueData.period.start)} - ${formatDate(revenueData.period.end)}\n`;
      csvContent += `Gross Revenue: ${formatCurrency(revenueData.revenue.gross)}\n`;
      csvContent += `Net Revenue: ${formatCurrency(revenueData.revenue.net)}\n`;
      csvContent += `Appointment Revenue: ${formatCurrency(revenueData.revenue.appointment)}\n`;
      csvContent += `Pharmacy Revenue: ${formatCurrency(revenueData.revenue.pharmacy)}\n`;
      csvContent += `Salary Expenses: ${formatCurrency(revenueData.expenses.salaries)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue_report_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-teal-600" />
            Revenue Statistics
          </h1>
          <p className="text-gray-600">Track hospital revenue and financial performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="overview">Overview</option>
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchRevenueData}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && revenueData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gross Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenueData.revenue.gross)}
                  </p>
                </div>
                <FaMoneyBillWave className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(revenueData.revenue.net)}
                  </p>
                </div>
                <FaChartLine className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Salary Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(revenueData.expenses.salaries)}
                  </p>
                </div>
                <FaUserMd className="text-3xl text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {revenueData.profitability.netMargin.toFixed(1)}%
                  </p>
                </div>
                <FaRupeeSign className="text-3xl text-teal-600" />
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Sources</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaStethoscope className="text-blue-600" />
                    <span>Appointments</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(revenueData.revenue.appointment)}</p>
                    <p className="text-sm text-gray-600">
                      {revenueData.counts.appointments} appointments
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaPills className="text-purple-600" />
                    <span>Pharmacy Sales</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(revenueData.revenue.pharmacy)}</p>
                    <p className="text-sm text-gray-600">
                      {revenueData.counts.pharmacySales} sales
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Revenue</span>
                    <span className="text-green-600">
                      {formatCurrency(revenueData.revenue.gross)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gross Margin</span>
                  <span className="font-semibold">
                    {revenueData.profitability.grossMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net Margin</span>
                  <span className="font-semibold text-green-600">
                    {revenueData.profitability.netMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue per Appointment</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      revenueData.counts.appointments > 0 
                        ? revenueData.revenue.appointment / revenueData.counts.appointments 
                        : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Salary to Revenue Ratio</span>
                  <span className="font-semibold">
                    {revenueData.revenue.gross > 0 
                      ? ((revenueData.expenses.salaries / revenueData.revenue.gross) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Period Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{formatDate(revenueData.period.start)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">{formatDate(revenueData.period.end)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="font-semibold">
                  {revenueData.counts.appointments + revenueData.counts.pharmacySales}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salaries Paid</p>
                <p className="font-semibold">{revenueData.counts.salariesPaid}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Tab */}
      {activeTab === 'daily' && dailyRevenue && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Daily Revenue Report - {formatDate(dailyRevenue.date)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Revenue Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Appointment Revenue:</span>
                  <span className="font-semibold">{formatCurrency(dailyRevenue.revenue.appointment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy Revenue:</span>
                  <span className="font-semibold">{formatCurrency(dailyRevenue.revenue.pharmacy)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(dailyRevenue.revenue.total)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Expenses & Net</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Salary Expenses:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(dailyRevenue.expenses.salaries)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Income:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(dailyRevenue.net)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-xl font-semibold">{dailyRevenue.counts.appointments}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pharmacy Sales</p>
              <p className="text-xl font-semibold">{dailyRevenue.counts.pharmacySales}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Salaries Paid</p>
              <p className="text-xl font-semibold">{dailyRevenue.counts.salariesPaid}</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report Tab */}
      {activeTab === 'monthly' && monthlyRevenue && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Revenue Report - {new Date(monthlyRevenue.year, monthlyRevenue.month - 1).toLocaleString('default', { month: 'long' })} {monthlyRevenue.year}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(monthlyRevenue.totalRevenue)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Salary Expenses</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(monthlyRevenue.salaryExpenses)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Net Revenue</p>
              <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(monthlyRevenue.netRevenue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Revenue Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Appointment Revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(monthlyRevenue.appointmentRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy Revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(monthlyRevenue.pharmacyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(monthlyRevenue.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Financial Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Daily Revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(monthlyRevenue.averageDailyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Highest Revenue Day:</span>
                  <span className="font-semibold">
                    {formatCurrency(monthlyRevenue.highestRevenueDay.amount)} on {formatDate(monthlyRevenue.highestRevenueDay.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-semibold text-green-600">
                    {monthlyRevenue.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-xl font-semibold">{monthlyRevenue.totalAppointments}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pharmacy Sales</p>
              <p className="text-xl font-semibold">{monthlyRevenue.totalPharmacySales}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Business Days</p>
              <p className="text-xl font-semibold">{monthlyRevenue.businessDays}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Salaries Paid</p>
              <p className="text-xl font-semibold">{monthlyRevenue.totalSalariesPaid}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'daily'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Daily Report
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'monthly'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Monthly Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;