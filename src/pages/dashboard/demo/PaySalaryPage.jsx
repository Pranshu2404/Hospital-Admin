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
  FaFileAlt,
  FaMoneyBillWave,
  FaArrowLeft // ADD THIS ICON
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // ADD THIS
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

  // NEW: Navigation hook
  const navigate = useNavigate();

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
      setDoctors(response.data || []); // Adjusted based on your API response
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

  // Calculate selected amount with revenue distribution display
  const calculateSelectedAmount = () => {
    return salaries
      .filter(s => selectedSalaries.includes(s._id))
      .reduce((sum, salary) => {
        // Calculate based on doctor's revenue percentage
        const doctor = salary.doctor_id || {};
        const baseAmount = salary.net_amount || salary.amount || 0;
        
        // For part-time doctors with revenue percentage < 100%
        if (doctor.revenuePercentage && doctor.revenuePercentage < 100) {
          const percentage = doctor.revenuePercentage;
          return sum + (baseAmount * percentage / 100);
        }
        
        return sum + baseAmount;
      }, 0);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Back to Expense Page Button */}
          <button
            onClick={() => navigate('/dashboard/admin/expense')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft /> Back to Expenses
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyCheckAlt className="text-teal-600" />
              Pay Salaries
            </h1>
            <p className="text-gray-600">Review and process pending salary payments for doctors.</p>
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              {formatCurrency(calculateSelectedAmount())}
            </p>
          </div>
          <FaCheckCircle className="text-3xl text-blue-400" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Selected Records</p>
            <p className="text-2xl font-bold text-green-600">{selectedSalaries.length}</p>
          </div>
          <FaUsers className="text-3xl text-green-400" />
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
              <option value="weekly">Weekly</option>
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
                  {doctor.revenuePercentage && doctor.revenuePercentage < 100 && 
                    ` - ${doctor.revenuePercentage}% share`}
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Pending Salaries
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {salaries.length} records found
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {selectedSalaries.length === salaries.length && salaries.length > 0 ? 
                'Deselect All' : 'Select All'}
            </button>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salaries.map(salary => {
                const doctor = salary.doctor_id || {};
                const revenuePercentage = doctor.revenuePercentage || 100;
                const doctorAmount = revenuePercentage < 100 ? 
                  ((salary.net_amount || salary.amount || 0) * revenuePercentage / 100) : 
                  (salary.net_amount || salary.amount || 0);
                
                return (
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
                        {doctor.firstName} {doctor.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doctor.email || doctor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.paymentType}</div>
                      <div className="text-xs text-gray-500">
                        {doctor.isFullTime ? 'Full-time' : 'Part-time'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 capitalize">{salary.period_type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(salary.period_start).toLocaleDateString()} - {new Date(salary.period_end).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(salary.net_amount || salary.amount || 0)}
                      </div>
                      {revenuePercentage < 100 && (
                        <div className="text-xs text-blue-600">
                          Doctor: {formatCurrency(doctorAmount)} ({revenuePercentage}%)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{salary.appointment_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {revenuePercentage < 100 ? (
                        <div className="text-sm font-medium text-blue-600">
                          {revenuePercentage}%
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">100%</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {salary.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
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

      {/* Information Panel about Revenue Distribution */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
          <FaMoneyBillWave /> About Revenue Distribution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-700">
            <p className="mb-1"><span className="font-semibold">Full-time Doctors:</span> Get 100% of their fixed salary</p>
            <p className="mb-1"><span className="font-semibold">Part-time Doctors:</span> Revenue percentage applies to appointment fees</p>
            <p><span className="font-semibold">Example:</span> ₹500 fees × 80% = ₹400 to doctor, ₹100 to hospital</p>
          </div>
          <div className="text-sm text-blue-700">
            <p className="mb-1">The system automatically calculates doctor's share based on their revenue percentage.</p>
            <p>You're paying only the doctor's calculated share, not the full appointment fees.</p>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default PaySalaryPage;