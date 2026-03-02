// src/pages/dashboard/admin/DoctorCommissionPayment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Printer,
  Mail,
  FileText,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { format } from 'date-fns';

const DoctorCommissionPayment = () => {
  const [activeTab, setActiveTab] = useState('pending'); // pending, paid, all
  const [periodType, setPeriodType] = useState('daily');
  const [startDate, setStartDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCommission: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    pendingCount: 0,
    paidCount: 0
  });
  const [selectedCommissions, setSelectedCommissions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processingBulk, setProcessingBulk] = useState(false);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [activeTab, periodType, startDate, endDate, selectedDoctor, page]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors`);
      // Filter only part-time doctors (commission-based)
      const partTimeDoctors = response.data.filter(doc => !doc.isFullTime);
      setDoctors(partTimeDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/salaries?`;
      
      if (activeTab === 'pending') {
        url += 'status=pending';
      } else if (activeTab === 'paid') {
        url += 'status=paid';
      }
      
      url += `&periodType=${periodType}&startDate=${startDate}&endDate=${endDate}&earningType=commission&page=${page}&limit=20`;
      
      if (selectedDoctor !== 'all') {
        url += `&doctorId=${selectedDoctor}`;
      }

      const response = await axios.get(url);
      
      // Filter out any full-time doctors just in case
      const filteredCommissions = response.data.salaries.filter(
        comm => !comm.doctor_id?.isFullTime
      );
      
      setCommissions(filteredCommissions);
      setTotalPages(response.data.totalPages || 1);
      
      // Calculate stats
      const total = filteredCommissions.reduce((sum, comm) => sum + (comm.net_amount || 0), 0);
      const appointments = filteredCommissions.reduce((sum, comm) => sum + (comm.appointment_count || 0), 0);
      const doctors = new Set(filteredCommissions.map(c => c.doctor_id?._id)).size;
      const pending = filteredCommissions.filter(c => c.status === 'pending').length;
      const paid = filteredCommissions.filter(c => c.status === 'paid').length;
      
      setStats({
        totalCommission: total,
        totalAppointments: appointments,
        totalDoctors: doctors,
        pendingCount: pending,
        paidCount: paid
      });
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPay = async () => {
    if (selectedCommissions.length === 0) {
      alert('Please select at least one commission to pay');
      return;
    }

    setProcessingBulk(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/salaries/bulk-pay`, {
        salaryIds: selectedCommissions,
        payment_method: paymentMethod,
        notes: paymentNote
      });

      if (response.data.success) {
        alert(`Successfully paid ${response.data.summary.successCount} commissions. Total amount: ₹${response.data.summary.totalAmount}`);
        setSelectedCommissions([]);
        setPaymentNote('');
        setShowPaymentModal(false);
        fetchCommissions();
      }
    } catch (error) {
      console.error('Error paying commissions:', error);
      alert('Failed to process payments: ' + error.response?.data?.error);
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleCalculateAll = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/salaries/bulk-calculate`, {
        periodType,
        startDate,
        endDate,
        payment_method: paymentMethod
      });

      alert(`Calculated commissions for ${response.data.processedDoctors} doctors. Total: ₹${response.data.totalDoctorAmount}`);
      fetchCommissions();
    } catch (error) {
      console.error('Error calculating commissions:', error);
      alert('Failed to calculate commissions: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCommissions.length === filteredCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(filteredCommissions.map(c => c._id));
    }
  };

  const toggleSelectCommission = (id) => {
    if (selectedCommissions.includes(id)) {
      setSelectedCommissions(selectedCommissions.filter(c => c !== id));
    } else {
      setSelectedCommissions([...selectedCommissions, id]);
    }
  };

  // Filter commissions by search term
  const filteredCommissions = commissions.filter(comm => {
    if (!searchTerm) return true;
    const doctorName = comm.doctor_id ? 
      `${comm.doctor_id.firstName} ${comm.doctor_id.lastName}`.toLowerCase() : '';
    return doctorName.includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      hold: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-2 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Doctor Commission Payment</h1>
              <p className="text-slate-500 mt-1">Manage and pay commissions for part-time doctors</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCalculateAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <TrendingUp size={18} />
                Calculate All
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={selectedCommissions.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign size={18} />
                Pay Selected ({selectedCommissions.length})
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Total Commission</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalCommission)}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Appointments</p>
                  <p className="text-xl font-bold text-slate-800">{stats.totalAppointments}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Doctors</p>
                  <p className="text-xl font-bold text-slate-800">{stats.totalDoctors}</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users size={20} className="text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Pending</p>
                  <p className="text-xl font-bold text-amber-600">{stats.pendingCount}</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock size={20} className="text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Paid</p>
                  <p className="text-xl font-bold text-emerald-600">{stats.paidCount}</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Period Type</label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Doctors</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.firstName} {doc.lastName} ({doc.revenuePercentage || 0}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      activeTab === 'pending' 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveTab('paid')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      activeTab === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      activeTab === 'all' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search doctor..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.length === filteredCommissions.length && filteredCommissions.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Period</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Appointments</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Gross Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Commission %</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doctor Share</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hospital Share</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2">Loading commissions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                        No commissions found for the selected period
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => {
                      const doctor = comm.doctor_id;
                      if (!doctor || doctor.isFullTime) return null;
                      
                      return (
                        <tr key={comm._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCommissions.includes(comm._id)}
                              onChange={() => toggleSelectCommission(comm._id)}
                              disabled={comm.status === 'paid'}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-800">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{doctor.specialization || 'General'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p>{format(new Date(comm.period_start), 'dd MMM yyyy')}</p>
                              <p className="text-xs text-slate-400">to {format(new Date(comm.period_end), 'dd MMM yyyy')}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{comm.appointment_count || 0}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(comm.gross_amount || 0)}</td>
                          <td className="px-4 py-3 text-right font-medium">{comm.revenue_percentage || doctor.revenuePercentage || 0}%</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(comm.doctor_share || comm.amount || 0)}</td>
                          <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(comm.hospital_share || 0)}</td>
                          <td className="px-4 py-3 text-center">{getStatusBadge(comm.status)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setExpandedDoctor(expandedDoctor === comm._id ? null : comm._id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              {expandedDoctor === comm._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Expanded Details */}
              {expandedDoctor && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="font-medium text-slate-800 mb-3">Appointment Details</h4>
                  <div className="space-y-2">
                    {commissions
                      .find(c => c._id === expandedDoctor)
                      ?.appointments?.map((appt, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-sm">
                          Appointment ID: {appt}
                        </div>
                      )) || (
                      <p className="text-sm text-slate-500">No appointment details available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing {filteredCommissions.length} of {stats.totalDoctors} doctors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs font-medium text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Process Payment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online Payment</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Payment Note (Optional)
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Add any notes about this payment..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-2">Payment Summary</p>
                <div className="flex justify-between font-medium">
                  <span>Selected Commissions:</span>
                  <span>{selectedCommissions.length}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 mt-2">
                  <span>Total Amount:</span>
                  <span>
                    {formatCurrency(
                      commissions
                        .filter(c => selectedCommissions.includes(c._id))
                        .reduce((sum, c) => sum + (c.doctor_share || c.amount || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPay}
                disabled={processingBulk}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingBulk ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DoctorCommissionPayment;