import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import {
  FaMoneyBillWave,
  FaCalendarCheck,
  FaHourglassHalf,
  FaRupeeSign,
  FaUserMd,
  FaDownload,
  FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

const DoctorSalaryPage = () => {
  const doctorId = localStorage.getItem("doctorId"); // Get the doctor's ID from the URL
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [filters, setFilters] = useState({
    period: '', // Will be set based on doctor's paymentType
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  useEffect(() => {
    if (doctorProfile) {
      // Set default period based on payment type
      let defaultPeriod = 'monthly';
      if (doctorProfile.paymentType === 'Fee per Visit' || doctorProfile.paymentType === 'Per Hour') {
        defaultPeriod = 'daily';
      }
      setFilters(prev => ({ ...prev, period: defaultPeriod }));
      fetchSalaryData(defaultPeriod, filters.startDate, filters.endDate);
    }
  }, [doctorProfile]);

  const fetchDoctorProfile = async () => {
    try {
      // Assuming a valid endpoint to get a single doctor's profile
      const response = await apiClient.get(`/api/doctors/${doctorId}`);
      setDoctorProfile(response.data);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      toast.error('Failed to fetch doctor profile.');
      setLoading(false);
    }
  };

  const fetchSalaryData = async (period, startDate, endDate) => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const params = {
        period: period,
        startDate: startDate,
        endDate: endDate
      };

      const response = await apiClient.get(`/api/salaries/doctor/${doctorId}`, { params });
      setSalaryRecords(response.data.salaries);
    } catch (err) {
      console.error('Error fetching salary data:', err);
      toast.error('Failed to fetch salary data.');
      setSalaryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchSalaryData(filters.period, filters.startDate, filters.endDate);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full capitalize ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPaymentTypeIcon = (paymentType) => {
    switch (paymentType) {
      case 'Salary':
      case 'Contractual Salary':
        return <FaCalendarCheck className="text-blue-600" />;
      case 'Fee per Visit':
        return <FaRupeeSign className="text-green-600" />;
      case 'Per Hour':
        return <FaHourglassHalf className="text-purple-600" />;
      default:
        return <FaMoneyBillWave className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500">Doctor Profile Not Found.</h2>
        <p className="text-gray-500">Please ensure the correct doctor ID is provided.</p>
      </div>
    );
  }

  return (
    <Layout sidebarItems={doctorSidebar}>
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-4 border-b pb-4">
        <FaUserMd className="text-4xl text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {doctorProfile.firstName} {doctorProfile.lastName}'s Salary
          </h1>
          <p className="text-gray-600">
            Payment Type: <span className="font-semibold">{doctorProfile.paymentType}</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaHistory /> Salary History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All</option>
              {doctorProfile.paymentType === 'Salary' || doctorProfile.paymentType === 'Contractual Salary' ? (
                <>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </>
              ) : (
                <>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {doctorProfile.paymentType !== 'Salary' && doctorProfile.paymentType !== 'Contractual Salary' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaryRecords.map(record => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">{record.period_type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(record.net_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.paid_date ? new Date(record.paid_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  {doctorProfile.paymentType !== 'Salary' && doctorProfile.paymentType !== 'Contractual Salary' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.appointment_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600">{formatCurrency(record.deductions || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600">{formatCurrency(record.bonus || 0)}</div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{record.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {salaryRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaHistory className="text-5xl mx-auto mb-4" />
            <p>No salary records found for the selected period.</p>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default DoctorSalaryPage;