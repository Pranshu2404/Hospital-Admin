import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaFileInvoice,
  FaChartLine,
  FaPrint
} from 'react-icons/fa';

const DoctorSalaryDashboard = () => {
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: 'all'
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDoctorInfo();
    fetchSalaryData();
    fetchSalaryStats();
  }, [filters.period, filters.year, filters.month, filters.status]);

  const fetchDoctorInfo = async () => {
    try {
      // This would typically come from auth context or props
      const doctorId = 'current-doctor-id'; // Replace with actual doctor ID from auth
      const response = await apiClient.get(`/doctors/${doctorId}`);
      setDoctorInfo(response.data);
    } catch (err) {
      console.error('Error fetching doctor info:', err);
    }
  };

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const doctorId = 'current-doctor-id'; // Replace with actual doctor ID from auth
      
      const params = {
        period: filters.period,
        year: filters.year,
        month: filters.month,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      const response = await apiClient.get(`/salaries/doctor/${doctorId}`, { params });
      setSalaryRecords(response.data.salaries);
    } catch (err) {
      setError('Failed to fetch salary data.');
      console.error('Error fetching salary data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryStats = async () => {
    try {
      const doctorId = 'current-doctor-id'; // Replace with actual doctor ID from auth
      const response = await apiClient.get(`/salaries/stats?doctorId=${doctorId}`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching salary stats:', err);
    }
  };

  const filteredRecords = useMemo(() => {
    return salaryRecords.filter(record => {
      if (filters.status !== 'all' && record.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [salaryRecords, filters.status]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPeriodLabel = (record) => {
    if (record.period_type === 'daily') {
      return formatDate(record.period_start);
    } else if (record.period_type === 'weekly') {
      return `${formatDate(record.period_start)} - ${formatDate(record.period_end)}`;
    } else if (record.period_type === 'monthly') {
      return new Date(record.period_start).toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    return 'N/A';
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadPayslip = async (salaryId, period) => {
    try {
      const response = await apiClient.get(`/salaries/${salaryId}/payslip`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading payslip:', err);
      alert('Failed to download payslip. Please try again.');
    }
  };

  const totalEarnings = filteredRecords.reduce((sum, record) => sum + record.net_amount, 0);
  const paidEarnings = filteredRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.net_amount, 0);
  const pendingEarnings = filteredRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.net_amount, 0);

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
            Salary Dashboard
          </h1>
          <p className="text-gray-600">Track your earnings and salary payments</p>
        </div>
        {doctorInfo && (
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <FaUser className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold">Dr. {doctorInfo.firstName} {doctorInfo.lastName}</h3>
                <p className="text-sm text-gray-600">{doctorInfo.specialization}</p>
                <p className="text-xs text-gray-500 capitalize">{doctorInfo.paymentType}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(stats?.overall?.totalAmount || totalEarnings)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(paidEarnings)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(pendingEarnings)}
              </p>
            </div>
            <FaClock className="text-3xl text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredRecords.reduce((sum, record) => sum + (record.appointment_count || 0), 0)}
              </p>
            </div>
            <FaUser className="text-3xl text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="all">All Periods</option>
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

          {(filters.period === 'monthly' || filters.period === 'yearly') && (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary Records */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Salary Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getPeriodLabel(record)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                      {record.period_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.appointment_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(record.base_salary || record.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-red-600">
                      {formatCurrency(record.deductions || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-green-600">
                      {formatCurrency(record.bonus || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(record.net_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.paid_date ? formatDate(record.paid_date) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadPayslip(record._id, getPeriodLabel(record))}
                        className="text-teal-600 hover:text-teal-800"
                        title="Download Payslip"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="text-gray-600 hover:text-gray-800"
                        title="Print"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No salary records found</p>
            <p className="text-sm text-gray-400 mt-1">
              No records for selected filters
            </p>
          </div>
        )}
      </div>

      {/* Payment Statistics */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Earnings Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-medium">{formatCurrency(stats.overall?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Payment:</span>
                  <span className="font-medium">{formatCurrency(stats.overall?.averageSalary || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{stats.overall?.totalRecords || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Payment Status</h4>
              <div className="space-y-2">
                {stats.byStatus?.map((statusGroup) => (
                  <div key={statusGroup._id} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{statusGroup._id}:</span>
                    <span className="font-medium">
                      {formatCurrency(statusGroup.totalAmount)} ({statusGroup.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSalaryDashboard;