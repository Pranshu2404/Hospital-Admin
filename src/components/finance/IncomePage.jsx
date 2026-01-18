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
      const overviewResponse = await axios.get(`${baseUrl}/revenue`, {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      });
      console.log("Overview Data:", overviewResponse.data);
      let overviewData = overviewResponse.data;

      // Fallback: If overview data is 0 and it's a single day, try using daily data
      if (overviewData.revenue.gross === 0 && filters.startDate === filters.endDate) {
        try {
          const dailyRes = await axios.get(`${baseUrl}/revenue/daily`, {
            params: { date: filters.startDate }
          });
          if (dailyRes.data && dailyRes.data.revenue.total > 0) {
            console.log("Using Daily Data as fallback for Overview");
            overviewData = {
              ...overviewData,
              revenue: {
                ...overviewData.revenue,
                gross: dailyRes.data.revenue.total,
                net: dailyRes.data.net,
                appointment: dailyRes.data.revenue.appointment,
                pharmacy: dailyRes.data.revenue.pharmacy
              },
              expenses: {
                salaries: dailyRes.data.expenses.salaries
              },
              counts: {
                ...overviewData.counts,
                appointments: dailyRes.data.counts.appointments,
                pharmacySales: dailyRes.data.counts.pharmacySales
              }
            };
          }
        } catch (err) {
          console.error("Fallback fetch failed", err);
        }
      }

      setRevenueData(overviewData);

      // Fetch daily report
      const dailyResponse = await axios.get(`${baseUrl}/revenue/daily`, {
        params: { date: filters.startDate }
      });
      setDailyRevenue(dailyResponse.data);
      console.log(dailyResponse.data)

      // Fetch monthly report
      const monthlyResponse = await axios.get(`${baseUrl}/revenue/monthly`, {
        params: {
          year: filters.year,
          month: filters.month
        }
      });
      console.log(monthlyResponse.data)
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

      {/* Unified Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* View Mode Selector */}
          <div className="w-full md:w-auto min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['overview', 'daily', 'monthly'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setActiveTab(mode);
                    handleFilterChange('period', mode);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-all duration-200 ${activeTab === mode
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Date Controls */}
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'overview' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
                  />
                </div>
              </>
            )}

            {activeTab === 'daily' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    handleFilterChange('startDate', e.target.value);
                    handleFilterChange('endDate', e.target.value); // Sync end date for daily view logic
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
                />
              </div>
            )}

            {activeTab === 'monthly' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
                    min="2020"
                    max="2030"
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <button
                onClick={fetchRevenueData}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
              >
                <FaFilter className="text-sm" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && revenueData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center justify-between">
              <span>Overview Report</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {formatDate(filters.startDate)} - {formatDate(filters.endDate)}
              </span>
            </h3>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(revenueData.revenue.gross)}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-1">Expenses</p>
                <p className="text-3xl font-bold text-red-700">{formatCurrency(revenueData.expenses.salaries)}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Net Income</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(revenueData.revenue.net)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Breakdown */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Revenue Sources</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                        <FaStethoscope />
                      </div>
                      <span className="text-gray-700">Appointments</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(revenueData.revenue.appointment)}</p>
                      <p className="text-xs text-gray-500">{revenueData.counts.appointments} visits</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-md text-purple-600">
                        <FaPills />
                      </div>
                      <span className="text-gray-700">Pharmacy</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(revenueData.revenue.pharmacy)}</p>
                      <p className="text-xs text-gray-500">{revenueData.counts.pharmacySales} orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Performance */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Financial Health</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Net Margin</span>
                    <span className="font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{revenueData.profitability.netMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Gross Margin</span>
                    <span className="font-semibold text-gray-900">{revenueData.profitability.grossMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Salary Ratio</span>
                    <span className="font-semibold text-gray-900">
                      {revenueData.revenue.gross > 0
                        ? ((revenueData.expenses.salaries / revenueData.revenue.gross) * 100).toFixed(1) + '%'
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Period Stats Grid */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
                <p className="text-xl font-semibold text-gray-800">{revenueData.counts.appointments + revenueData.counts.pharmacySales}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Salaries Paid</p>
                <p className="text-xl font-semibold text-gray-800">{revenueData.counts.salariesPaid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg. Rev/Visit</p>
                <p className="text-xl font-semibold text-gray-800">
                  {formatCurrency(
                    revenueData.counts.appointments > 0
                      ? revenueData.revenue.appointment / revenueData.counts.appointments
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Tab */}
      {activeTab === 'daily' && dailyRevenue && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center justify-between">
              <span>Daily Revenue Report</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{formatDate(dailyRevenue.date)}</span>
            </h3>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(dailyRevenue.revenue.total)}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-1">Expenses</p>
                <p className="text-3xl font-bold text-red-700">{formatCurrency(dailyRevenue.expenses.salaries)}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Net Income</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(dailyRevenue.net)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Breakdown */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Revenue Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                        <FaStethoscope />
                      </div>
                      <span className="text-gray-700">Appointments</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(dailyRevenue.revenue.appointment)}</p>
                      <p className="text-xs text-gray-500">{dailyRevenue.counts.appointments} visits</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-md text-purple-600">
                        <FaPills />
                      </div>
                      <span className="text-gray-700">Pharmacy</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(dailyRevenue.revenue.pharmacy)}</p>
                      <p className="text-xs text-gray-500">{dailyRevenue.counts.pharmacySales} orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Other Stats */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                    <p className="text-xl font-semibold text-gray-800">{dailyRevenue.counts.appointments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pharmacy Sales</p>
                    <p className="text-xl font-semibold text-gray-800">{dailyRevenue.counts.pharmacySales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Staff Paid</p>
                    <p className="text-xl font-semibold text-gray-800">{dailyRevenue.counts.salariesPaid}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report Tab */}
      {activeTab === 'monthly' && monthlyRevenue && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center justify-between">
              <span>Monthly Revenue Report</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {new Date(filters.year, filters.month - 1).toLocaleString('default', { month: 'long' })} {filters.year}
              </span>
            </h3>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(monthlyRevenue.totalRevenue)}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-1">Expenses</p>
                <p className="text-3xl font-bold text-red-700">{formatCurrency(monthlyRevenue.salaryExpenses)}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Net Income</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(monthlyRevenue.netRevenue)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Breakdown */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Revenue Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                        <FaStethoscope />
                      </div>
                      <span className="text-gray-700">Appointments</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(monthlyRevenue.appointmentRevenue)}</p>
                      <p className="text-xs text-gray-500">{monthlyRevenue.totalAppointments} visits</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-md text-purple-600">
                        <FaPills />
                      </div>
                      <span className="text-gray-700">Pharmacy</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(monthlyRevenue.pharmacyRevenue)}</p>
                      <p className="text-xs text-gray-500">{monthlyRevenue.totalPharmacySales} orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Performance */}
              <div className="border rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{monthlyRevenue.profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Avg. Daily Revenue</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(monthlyRevenue.averageDailyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">Business Days</span>
                    <span className="font-semibold text-gray-900">{monthlyRevenue.businessDays}</span>
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

export default RevenueStats;