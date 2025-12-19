import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaRupeeSign,
  FaFileInvoiceDollar,
  FaFilter,
  FaSearch,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChartLine,
  FaWallet
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

const DoctorSalaryPage = () => {
  const doctorId = localStorage.getItem("doctorId");
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [filters, setFilters] = useState({
    period: '',
    startDate: '',
    endDate: ''
  });

  // Derived stats for the dashboard
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    totalBonus: 0
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  useEffect(() => {
    if (doctorProfile) {
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
      const response = await apiClient.get(`/doctors/${doctorId}`);
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
      const params = { period, startDate, endDate };
      const response = await apiClient.get(`/salaries/doctor/${doctorId}`, { params });
      const records = response.data.salaries || [];
      setSalaryRecords(records);

      // Calculate stats
      const total = records.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.net_amount : 0), 0);
      const pending = records.reduce((acc, curr) => acc + (curr.status === 'pending' || curr.status === 'processing' ? curr.net_amount : 0), 0);
      const bonus = records.reduce((acc, curr) => acc + (curr.bonus || 0), 0);
      
      setStats({ totalEarned: total, pendingAmount: pending, totalBonus: bonus });

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
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    
    const icons = {
      'paid': <FaCheckCircle className="mr-1" />,
      'pending': <FaExclamationCircle className="mr-1" />,
      'processing': <FaClock className="mr-1" />,
      'cancelled': <FaExclamationCircle className="mr-1" />
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider flex items-center w-fit border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(value)}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`text-xl ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout sidebarItems={doctorSidebar} section="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Loading financial records...</p>
        </div>
      </Layout>
    );
  }

  if (!doctorProfile) return null;

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="p-6 md:p-2 bg-slate-50/50 min-h-screen font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaWallet className="text-teal-600" /> Earnings & Salary
            </h1>
            <p className="text-slate-500 mt-1">
              Payment Model: <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{doctorProfile.paymentType}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             {/* <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
               <FaDownload /> Export Report
             </button> */}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Earned" 
            value={stats.totalEarned} 
            icon={FaMoneyBillWave} 
            color="bg-emerald-500"
            subtext="Paid out to date"
          />
          <StatCard 
            title="Pending Clearance" 
            value={stats.pendingAmount} 
            icon={FaClock} 
            color="bg-amber-500"
            subtext="Awaiting processing"
          />
          <StatCard 
            title="Total Bonuses" 
            value={stats.totalBonus} 
            icon={FaChartLine} 
            color="bg-purple-500"
            subtext="Incentives & Extras"
          />
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Period Type</label>
              <select
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Periods</option>
                {['Salary', 'Contractual Salary'].includes(doctorProfile.paymentType) ? (
                  <>
                    <option value="monthly">Monthly Salary</option>
                    <option value="yearly">Yearly Overview</option>
                  </>
                ) : (
                  <>
                    <option value="daily">Daily Settlements</option>
                    <option value="weekly">Weekly Settlements</option>
                    <option value="monthly">Monthly Overview</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          {/* <button
            onClick={handleApplyFilters}
            className="w-full md:w-auto bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center gap-2 mt-4 md:mt-0 h-[42px]"
          >
            <FaFilter /> Apply
          </button> */}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-700 flex items-center gap-2">
               <FaFileInvoiceDollar className="text-slate-400" /> Transaction History
             </h3>
             <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
               {salaryRecords.length} Records
             </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Period Details</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Earnings</th>
                  {!['Salary', 'Contractual Salary'].includes(doctorProfile.paymentType) && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Workload</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Deductions/Bonus</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Payout Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {salaryRecords.length > 0 ? (
                  salaryRecords.map(record => (
                    <tr key={record._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
                           <FaCalendarAlt className="text-slate-400 text-xs" /> {record.period_type}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-emerald-600 font-mono tracking-tight">
                          {formatCurrency(record.net_amount)}
                        </div>
                        <div className="text-xs text-slate-400">Net Payable</div>
                      </td>

                      {!['Salary', 'Contractual Salary'].includes(doctorProfile.paymentType) && (
                        <>
                           <td className="px-6 py-4">
                              <div className="text-sm text-slate-700 font-medium">{record.appointment_count || 0} Visits</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-xs">
                                <span className="text-red-500 font-medium block">-{formatCurrency(record.deductions || 0)} Ded</span>
                                <span className="text-blue-500 font-medium block">+{formatCurrency(record.bonus || 0)} Bon</span>
                              </div>
                           </td>
                        </>
                      )}

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 font-medium">
                          {record.paid_date ? new Date(record.paid_date).toLocaleDateString() : '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(record.status)}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                         <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-full hover:bg-teal-50" title="View Details">
                           <FaSearch />
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                         <FaFileInvoiceDollar className="text-4xl text-slate-300 mb-3" />
                         <p className="font-medium">No records found for this period</p>
                         <p className="text-xs text-slate-400 mt-1">Try changing the filters above</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default DoctorSalaryPage;