import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaUserMd,
  FaPills,
  FaStethoscope,
  FaHospital,
  FaRupeeSign,
  FaChartLine,
  FaReceipt
} from 'react-icons/fa';

const IncomePage = () => {
  const [incomeData, setIncomeData] = useState({
    pharmacyInvoices: [],
    appointmentInvoices: [],
    combined: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'Paid',
    type: 'all'
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pharmacyRevenue: 0,
    appointmentRevenue: 0,
    totalInvoices: 0
  });

  useEffect(() => {
    fetchIncomeData();
    fetchRevenueStats();
  }, [filters.period, filters.status]);

  const fetchIncomeData = async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      // Fetch pharmacy invoices
      const pharmacyResponse = await apiClient.get('/api/invoices/pharmacy', { 
        params: { ...params, invoice_type: 'Pharmacy' } 
      });

      // Fetch appointment invoices
      const appointmentResponse = await apiClient.get('/api/invoices', { 
        params: { ...params, invoice_type: 'Appointment' } 
      });

      const pharmacyInvoices = pharmacyResponse.data.invoices || [];
      const appointmentInvoices = appointmentResponse.data.invoices || [];

      // Combine and sort by date
      const combined = [...pharmacyInvoices, ...appointmentInvoices]
        .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

      setIncomeData({
        pharmacyInvoices,
        appointmentInvoices,
        combined
      });

    } catch (err) {
      console.error('Error fetching income data:', err);
      alert('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const response = await apiClient.get('/api/invoices/stats', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          type: filters.type !== 'all' ? filters.type : undefined
        }
      });

      const statsData = response.data;
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        pharmacyRevenue: statsData.revenueByType?.find(r => r._id === 'Pharmacy')?.total || 0,
        appointmentRevenue: statsData.revenueByType?.find(r => r._id === 'Appointment')?.total || 0,
        totalInvoices: statsData.totalInvoices || 0
      });

    } catch (err) {
      console.error('Error fetching revenue stats:', err);
    }
  };

  const filteredRecords = incomeData.combined.filter(record => {
    const matchesSearch = record.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.patient_id?.first_name && 
                          `${record.patient_id.first_name} ${record.patient_id.last_name || ''}`
                            .toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (record.customer_name && record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filters.type === 'all' || record.invoice_type === filters.type;
    
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeIcon = (type) => {
    if (type === 'Pharmacy') {
      return <FaPills className="text-purple-600" />;
    } else if (type === 'Appointment') {
      return <FaStethoscope className="text-blue-600" />;
    }
    return <FaReceipt className="text-gray-600" />;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Invoice Number', 'Type', 'Patient', 'Amount', 'Status', 'Payment Method'],
      ...filteredRecords.map(record => [
        formatDate(record.issue_date),
        record.invoice_number,
        record.invoice_type,
        record.patient_id ? `${record.patient_id.first_name} ${record.patient_id.last_name}` : record.customer_name,
        record.total,
        record.status,
        record.payment_method || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacy_income_report_${new Date().getTime()}.csv`;
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
            <FaMoneyBillWave className="text-teal-600" />
            Pharmacy Income & Revenue
          </h1>
          <p className="text-gray-600">Track pharmacy sales and appointment revenue</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <FaChartLine className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pharmacy Sales</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.pharmacyRevenue)}
              </p>
            </div>
            <FaPills className="text-3xl text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.appointmentRevenue)}
              </p>
            </div>
            <FaStethoscope className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-teal-600">
                {stats.totalInvoices}
              </p>
            </div>
            <FaReceipt className="text-3xl text-teal-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices, patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="all">All Status</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Appointment">Appointment</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { fetchIncomeData(); fetchRevenueStats(); }}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Income Records</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredRecords.length} records from {formatDate(filters.startDate)} to {formatDate(filters.endDate)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient/Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(record.issue_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{record.invoice_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(record.invoice_type)}
                      <span className="text-sm text-gray-900">{record.invoice_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.patient_id ? (
                      <div className="text-sm font-medium text-gray-900">
                        <FaUser className="inline mr-1 text-gray-400" />
                        {record.patient_id.first_name} {record.patient_id.last_name}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        <FaUser className="inline mr-1 text-gray-400" />
                        {record.customer_name}
                      </div>
                    )}
                    {record.patient_id?.patientId && (
                      <div className="text-xs text-gray-500">ID: {record.patient_id.patientId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(record.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.payment_method || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-teal-600 hover:text-teal-800 p-1"
                        title="View Details"
                        onClick={() => window.open(`/api/invoices/${record._id}/download`, '_blank')}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Download Invoice"
                        onClick={() => window.open(`/api/invoices/${record._id}/download`, '_blank')}
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FaReceipt className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No income records found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'No records for selected date range'}
            </p>
          </div>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">By Type</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaPills className="text-purple-600" />
                  <span className="text-gray-600">Pharmacy Sales:</span>
                </div>
                <span className="font-medium">{formatCurrency(stats.pharmacyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaStethoscope className="text-blue-600" />
                  <span className="text-gray-600">Appointments:</span>
                </div>
                <span className="font-medium">{formatCurrency(stats.appointmentRevenue)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Revenue:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoices:</span>
                <span className="font-medium">{stats.totalInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Invoice Value:</span>
                <span className="font-medium">
                  {formatCurrency(stats.totalInvoices > 0 ? stats.totalRevenue / stats.totalInvoices : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Rate:</span>
                <span className="font-medium text-green-600">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomePage;