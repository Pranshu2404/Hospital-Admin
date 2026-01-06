import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import {
  FaMoneyCheckAlt,
  FaSearch,
  FaFilter,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaDollarSign,
  FaNotesMedical,
  FaTrashAlt,
  FaFileAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const PaySalaryPage = () => {
  const [salaries, setSalaries] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedSalaries, setSelectedSalaries] = useState([]);
  const [filters, setFilters] = useState({
    periodType: 'monthly',
    status: 'pending',
    doctorId: 'all',
    startDate: '',
    endDate: ''
  });
  const [totals, setTotals] = useState({ totalAmount: 0, totalRecords: 0 });
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    fetchDoctors();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.doctorId === 'all') delete params.doctorId;

      const response = await apiClient.get('/salaries/pending', { params });
      setSalaries(response.data.salaries);
      setTotals(response.data.totals);
      setSelectedSalaries([]); // Clear selection on new data load
    } catch (err) {
      console.error('Error fetching salary data:', err);
      toast.error('Failed to fetch salary data.');
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Assuming there's an API endpoint to get a list of doctors
      const response = await apiClient.get('/doctors');
      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]); // Ensure doctors is always an array
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = salaries.map(s => s._id);
      setSelectedSalaries(allIds);
    } else {
      setSelectedSalaries([]);
    }
  };

  const handleSelectSalary = (id) => {
    setSelectedSalaries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePaySalaries = async () => {
    if (selectedSalaries.length === 0) {
      return toast.warn('Please select at least one salary to pay.');
    }

    setIsPaying(true);
    try {
      const response = await apiClient.post('/salaries/bulk-pay', {
        salaryIds: selectedSalaries,
        payment_method: paymentDetails.paymentMethod,
        notes: paymentDetails.notes
      });

      if (response.data.success) {
        toast.success(`Successfully paid ${response.data.summary.successCount} salaries.`);
        fetchData(); // Refresh the list
      } else {
        toast.error('Payment failed. Some salaries may not have been processed.');
      }
    } catch (err) {
      console.error('Error paying salaries:', err);
      toast.error('An error occurred during payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMoneyCheckAlt className="text-teal-600" />
            Pay Salaries
          </h1>
          <p className="text-gray-600">Review and process pending salary payments for doctors.</p>
        </div>
        <button
          onClick={handlePaySalaries}
          disabled={selectedSalaries.length === 0 || isPaying}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
            selectedSalaries.length > 0 && !isPaying
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPaying ? 'Processing...' : `Pay Selected (${selectedSalaries.length})`}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Records</p>
            <p className="text-2xl font-bold text-yellow-600">{totals.totalRecords}</p>
          </div>
          <FaClock className="text-3xl text-yellow-400" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Pending Amount</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalAmount)}</p>
          </div>
          <FaDollarSign className="text-3xl text-red-400" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Selected Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(salaries.filter(s => selectedSalaries.includes(s._id)).reduce((sum, s) => sum + s.net_amount, 0))}
            </p>
          </div>
          <FaCheckCircle className="text-3xl text-blue-400" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFilter /> Filters & Payment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
            <select
              name="periodType"
              value={filters.periodType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              name="doctorId"
              value={filters.doctorId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.firstName} {doctor.lastName} ({doctor.paymentType})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={paymentDetails.paymentMethod}
              onChange={handlePaymentDetailChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              name="notes"
              value={paymentDetails.notes}
              onChange={handlePaymentDetailChange}
              placeholder="Add payment notes..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Pending Salaries
          </h3>
          <span className="text-sm text-gray-500">
            {salaries.length} records found
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedSalaries.length === salaries.length && salaries.length > 0}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaries.map(salary => (
                <tr key={salary._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSalaries.includes(salary._id)}
                      onChange={() => handleSelectSalary(salary._id)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {salary.doctor_id?.firstName} {salary.doctor_id?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{salary.doctor_id?.paymentType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 capitalize">{salary.period_type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(salary.period_start).toLocaleDateString()} - {new Date(salary.period_end).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(salary.net_amount)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{salary.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {salaries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaFileAlt className="text-5xl mx-auto mb-4" />
            <p>No pending salaries found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default PaySalaryPage;