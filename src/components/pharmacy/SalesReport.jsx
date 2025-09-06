import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaFilter,
  FaDownload,
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaReceipt
} from 'react-icons/fa';

const SalesReports = () => {
  const [reports, setReports] = useState({
    daily: null,
    monthly: null,
    yearly: null,
    comparison: null
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'daily',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    compareTo: 'previous'
  });

  useEffect(() => {
    fetchReports();
  }, [filters.period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = {};

      switch (filters.period) {
        case 'daily':
          endpoint = '/api/orders/sale/daily';
          params = { date: filters.date };
          break;
        case 'monthly':
          endpoint = '/api/orders/sale/monthly';
          params = { 
            year: filters.year,
            month: filters.month 
          };
          break;
        case 'yearly':
          endpoint = '/api/orders/sale/yearly';
          params = { year: filters.year };
          break;
        case 'comparison':
          endpoint = '/api/orders/sale/comparison';
          params = { 
            period: 'month',
            compareTo: filters.compareTo 
          };
          break;
        default:
          endpoint = '/api/orders/sale/daily';
      }

      const response = await apiClient.get(endpoint, { params });
      setReports(prev => ({ ...prev, [filters.period]: response.data }));
    } catch (err) {
      console.error('Error fetching sales reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    // Simple CSV export implementation
    let csvContent = "data:text/csv;charset=utf-8,";
    
    switch (filters.period) {
      case 'daily':
        csvContent += "Date,Sales Count,Total Revenue,Average Sale\n";
        csvContent += `${filters.date},${reports.daily?.summary?.totalSales || 0},${reports.daily?.summary?.totalRevenue || 0},${reports.daily?.summary?.averageSale || 0}\n`;
        break;
      case 'monthly':
        csvContent += "Month,Total Sales,Total Revenue,Average Daily Revenue\n";
        csvContent += `${filters.month}/${filters.year},${reports.monthly?.summary?.totalSales || 0},${reports.monthly?.summary?.totalRevenue || 0},${reports.monthly?.summary?.averageDailyRevenue || 0}\n`;
        break;
      case 'yearly':
        csvContent += "Year,Total Sales,Total Revenue,Average Monthly Revenue\n";
        csvContent += `${filters.year},${reports.yearly?.summary?.totalSales || 0},${reports.yearly?.summary?.totalRevenue || 0},${reports.yearly?.summary?.averageMonthlyRevenue || 0}\n`;
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${filters.period}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-teal-600" />
            Sales Reports
          </h1>
          <p className="text-gray-600">Analyze pharmacy sales performance</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaDownload /> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="comparison">Comparison Report</option>
            </select>
          </div>

          {filters.period === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {(filters.period === 'monthly' || filters.period === 'yearly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filters.period === 'monthly' ? 'Month' : 'Year'}
              </label>
              {filters.period === 'monthly' ? (
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              )}
            </div>
          )}

          {filters.period === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          )}

          {filters.period === 'comparison' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compare To</label>
              <select
                value={filters.compareTo}
                onChange={(e) => handleFilterChange('compareTo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="previous">Previous Period</option>
                <option value="lastYear">Same Period Last Year</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Report */}
          {filters.period === 'daily' && reports.daily && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-800">{reports.daily.summary?.totalSales || 0}</p>
                  </div>
                  <FaShoppingCart className="text-3xl text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reports.daily.summary?.totalRevenue || 0)}
                    </p>
                  </div>
                  <FaMoneyBillWave className="text-3xl text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Sale</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reports.daily.summary?.averageSale || 0)}
                    </p>
                  </div>
                  <FaReceipt className="text-3xl text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {new Date(filters.date).toLocaleDateString()}
                    </p>
                  </div>
                  <FaCalendarAlt className="text-3xl text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Report */}
          {filters.period === 'monthly' && reports.monthly && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-800">{reports.monthly.summary?.totalSales || 0}</p>
                    </div>
                    <FaShoppingCart className="text-3xl text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(reports.monthly.summary?.totalRevenue || 0)}
                      </p>
                    </div>
                    <FaMoneyBillWave className="text-3xl text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Daily Revenue</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(reports.monthly.summary?.averageDailyRevenue || 0)}
                      </p>
                    </div>
                    <FaChartLine className="text-3xl text-purple-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Month</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {new Date(filters.year, filters.month - 1).toLocaleString('default', { month: 'long' })} {filters.year}
                      </p>
                    </div>
                    <FaCalendarAlt className="text-3xl text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Top Medicines */}
              {reports.monthly.topMedicines && reports.monthly.topMedicines.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Medicines</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reports.monthly.topMedicines.map((medicine, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <div className="font-medium">{medicine.medicine?.name || 'Unknown Medicine'}</div>
                            </td>
                            <td className="px-6 py-4">{medicine.totalQuantity}</td>
                            <td className="px-6 py-4">{formatCurrency(medicine.totalRevenue)}</td>
                            <td className="px-6 py-4">{formatCurrency(medicine.averagePrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comparison Report */}
          {filters.period === 'comparison' && reports.comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Period</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reports.comparison.currentPeriod.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sales Count</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reports.comparison.currentPeriod.salesCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-medium text-gray-800">
                      {reports.comparison.currentPeriod.period}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparison Period</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reports.comparison.previousPeriod.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sales Count</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reports.comparison.previousPeriod.salesCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-medium text-gray-800">
                      {reports.comparison.previousPeriod.period}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${
                    reports.comparison.growth.revenue > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">Revenue Growth</p>
                    <p className="text-2xl font-bold">
                      {reports.comparison.growth.revenue > 0 ? '+' : ''}
                      {reports.comparison.growth.revenue.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    reports.comparison.growth.sales > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">Sales Growth</p>
                    <p className="text-2xl font-bold">
                      {reports.comparison.growth.sales > 0 ? '+' : ''}
                      {reports.comparison.growth.sales.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesReports;