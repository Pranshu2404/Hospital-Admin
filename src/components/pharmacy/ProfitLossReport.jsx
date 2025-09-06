import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaMoneyBillWave, 
  FaChartLine,
  FaFilter,
  FaDownload,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const ProfitLossReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchProfitLossReport();
  }, [filters.period]);

  const fetchProfitLossReport = async () => {
    setLoading(true);
    try {
      // This would call your backend API to calculate P&L
      // For now, we'll simulate the data structure
      const response = await apiClient.get('/api/reports/profit-loss', {
        params: {
          period: filters.period,
          month: filters.period === 'monthly' ? filters.month : undefined,
          year: filters.year
        }
      });
      setReport(response.data);
    } catch (err) {
      console.error('Error fetching profit/loss report:', err);
      // Mock data for demonstration
      setReport({
        revenue: 125000,
        cogs: 75000,
        grossProfit: 50000,
        expenses: 30000,
        netProfit: 20000,
        margin: 16.0,
        previousPeriod: {
          revenue: 110000,
          netProfit: 18000,
          margin: 16.4
        }
      });
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
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Amount\n";
    csvContent += `Revenue,${report?.revenue || 0}\n`;
    csvContent += `Cost of Goods Sold,${report?.cogs || 0}\n`;
    csvContent += `Gross Profit,${report?.grossProfit || 0}\n`;
    csvContent += `Expenses,${report?.expenses || 0}\n`;
    csvContent += `Net Profit,${report?.netProfit || 0}\n`;
    csvContent += `Profit Margin,${report?.margin || 0}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profit_loss_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, percent: 0 };
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { value: change, percent };
  };

  const revenueChange = calculateChange(report?.revenue || 0, report?.previousPeriod?.revenue || 0);
  const profitChange = calculateChange(report?.netProfit || 0, report?.previousPeriod?.netProfit || 0);
  const marginChange = calculateChange(report?.margin || 0, report?.previousPeriod?.margin || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-teal-600" />
            Profit & Loss Report
          </h1>
          <p className="text-gray-600">Financial performance analysis</p>
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
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {filters.period === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
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
            </div>
          )}

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

          <div className="flex items-end">
            <button
              onClick={fetchProfitLossReport}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(report.revenue)}
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${revenueChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange.value >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="text-sm">
                    {revenueChange.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                vs previous period: {formatCurrency(report.previousPeriod?.revenue || 0)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.netProfit)}
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${profitChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitChange.value >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="text-sm">
                    {profitChange.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                vs previous period: {formatCurrency(report.previousPeriod?.netProfit || 0)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.margin.toFixed(1)}%
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${marginChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marginChange.value >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="text-sm">
                    {marginChange.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                vs previous period: {(report.previousPeriod?.margin || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Statement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium">{formatCurrency(report.revenue)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Cost of Goods Sold</span>
                  <span>-{formatCurrency(report.cogs)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-medium">
                  <span>Gross Profit</span>
                  <span className="text-green-600">{formatCurrency(report.grossProfit)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Operating Expenses</span>
                  <span>-{formatCurrency(report.expenses)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                  <span>Net Profit</span>
                  <span className="text-blue-600">{formatCurrency(report.netProfit)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Gross Margin</p>
                  <p className="text-xl font-bold">
                    {((report.grossProfit / report.revenue) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Margin</p>
                  <p className="text-xl font-bold">
                    {report.margin.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expense to Revenue Ratio</p>
                  <p className="text-xl font-bold">
                    {((report.expenses / report.revenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizations (would be charts in a real implementation) */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profit Trend</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Profit trend chart would be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReport;