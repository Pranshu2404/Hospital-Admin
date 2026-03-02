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
  FaWallet,
  FaPercent,
  FaHospital,
  FaUserMd,
  FaEye,
  FaPrint,
  FaEnvelope
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

const DoctorSalaryPage = () => {
  const doctorId = localStorage.getItem("doctorId");
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [commissionRecords, setCommissionRecords] = useState([]);
  const [paidSalaryIds, setPaidSalaryIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'all'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    totalCommission: 0,
    totalSalary: 0,
    appointmentCount: 0,
    commissionRate: 0
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  useEffect(() => {
    if (doctorProfile) {
      fetchAllEarnings();
    }
  }, [doctorProfile, filters, activeTab]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}`);
      setDoctorProfile(response.data);
      
      if (!response.data.isFullTime) {
        setStats(prev => ({ 
          ...prev, 
          commissionRate: response.data.revenuePercentage || 0 
        }));
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      toast.error('Failed to fetch doctor profile.');
    }
  };

  const fetchAllEarnings = async () => {
    setLoading(true);
    try {
      // First fetch paid records from salary model
      await fetchPaidSalaryRecords();
      
      // Then fetch pending commission records from invoices
      if (!doctorProfile?.isFullTime || activeTab === 'commission' || activeTab === 'all') {
        await fetchCommissionFromInvoices();
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidSalaryRecords = async () => {
    try {
      const params = { 
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: 'paid' // Only fetch paid records
      };
      const response = await apiClient.get(`/salaries/doctor/${doctorId}`, { params });
      const records = response.data.salaries || [];
      setSalaryRecords(records);
      
      // Create a set of paid salary IDs for quick lookup
      const paidIds = new Set();
      records.forEach(record => {
        paidIds.add(record._id);
        // Also add any appointment IDs that are in this paid record
        if (record.appointments && Array.isArray(record.appointments)) {
          record.appointments.forEach(apptId => {
            paidIds.add(apptId.toString());
          });
        }
      });
      setPaidSalaryIds(paidIds);
      
      // Update salary stats
      const totalSalary = records
        .filter(r => r.status === 'paid')
        .reduce((acc, curr) => acc + (curr.net_amount || 0), 0);
      
      setStats(prev => ({ 
        ...prev, 
        totalSalary,
        totalEarned: (prev.totalCommission || 0) + totalSalary
      }));
    } catch (err) {
      console.error('Error fetching salary records:', err);
    }
  };

  const fetchCommissionFromInvoices = async () => {
    try {
      // Fetch appointments for this doctor
      const appointmentsParams = {
        doctor_id: doctorId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: 1,
        limit: 100
      };
      
      const appointmentsRes = await apiClient.get('/appointments', { params: appointmentsParams });
      let appointments = [];
      if (appointmentsRes.data.appointments) {
        appointments = appointmentsRes.data.appointments;
      } else if (Array.isArray(appointmentsRes.data)) {
        appointments = appointmentsRes.data;
      }
      
      // Fetch invoices for this doctor
      const invoiceParams = {
        doctor_id: doctorId,
        invoice_type: 'Appointment',
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: 1,
        limit: 100
      };
      
      const invoicesRes = await apiClient.get('/invoices', { params: invoiceParams });
      
      let invoices = [];
      if (invoicesRes.data.invoices) {
        invoices = invoicesRes.data.invoices;
      } else if (Array.isArray(invoicesRes.data)) {
        invoices = invoicesRes.data;
      }
      
      const commissions = [];
      let totalCommission = 0;
      let totalAppointments = 0;
      let pendingCommission = 0;
      
      // Create a map of appointments for quick lookup
      const appointmentMap = {};
      appointments.forEach(appt => {
        appointmentMap[appt._id] = appt;
      });
      
      // Process each invoice
      for (const invoice of invoices) {
        const appointment = appointmentMap[invoice.appointment_id];
        if (!appointment) continue;
        
        // Check if this appointment is already paid (exists in salary model)
        const isPaid = paidSalaryIds.has(invoice._id) || 
                      paidSalaryIds.has(appointment._id) ||
                      salaryRecords.some(s => 
                        s.appointments && s.appointments.includes(appointment._id)
                      );
        
        // Calculate commission from service items
        let consultationFee = 0;
        let registrationFee = 0;
        
        (invoice.service_items || []).forEach(item => {
          const desc = (item.description || '').toLowerCase();
          if (desc.includes('consultation') || desc.includes('doctor consultation')) {
            consultationFee += item.total_price || 0;
          } else {
            registrationFee += item.total_price || 0;
          }
        });
        
        if (consultationFee === 0) {
          consultationFee = invoice.total || 0;
        }
        
        const commissionAmount = (consultationFee * (doctorProfile?.revenuePercentage || 0)) / 100;
        
        // Get patient name
        let patientName = 'Unknown';
        if (appointment.patient_name) {
          patientName = appointment.patient_name;
        } else if (appointment.patient_id) {
          if (typeof appointment.patient_id === 'object') {
            patientName = `${appointment.patient_id.first_name || ''} ${appointment.patient_id.last_name || ''}`.trim();
          }
        } else if (invoice.customer_name) {
          patientName = invoice.customer_name;
        }
        
        // Always show as pending unless it's in paidSalaryIds
        const commissionRecord = {
          _id: invoice._id,
          invoice_number: invoice.invoice_number,
          appointment_date: appointment.appointment_date || invoice.issue_date,
          patient_name: patientName || 'Unknown',
          consultation_fee: consultationFee,
          registration_fee: registrationFee,
          total_amount: invoice.total || 0,
          commission_amount: commissionAmount,
          hospital_share: consultationFee - commissionAmount,
          status: isPaid ? 'paid' : 'pending',
          payment_status: isPaid ? 'paid' : invoice.status,
          invoice: invoice
        };
        
        commissions.push(commissionRecord);
        
        totalCommission += commissionAmount;
        totalAppointments++;
        
        if (!isPaid) {
          pendingCommission += commissionAmount;
        }
      }
      
      setCommissionRecords(commissions);
      setStats(prev => ({ 
        ...prev, 
        totalCommission,
        totalEarned: (prev.totalSalary || 0) + totalCommission,
        pendingAmount: pendingCommission,
        appointmentCount: totalAppointments
      }));
      
    } catch (err) {
      console.error('Error fetching commission from invoices:', err);
      toast.error('Failed to fetch commission records');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchAllEarnings();
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'hold': 'bg-purple-100 text-purple-700 border-purple-200',
      'Issued': 'bg-amber-100 text-amber-700 border-amber-200',
      'Partial': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    
    const icons = {
      'paid': <FaCheckCircle className="mr-1" />,
      'pending': <FaClock className="mr-1" />,
      'processing': <FaClock className="mr-1" />,
      'cancelled': <FaExclamationCircle className="mr-1" />,
      'hold': <FaClock className="mr-1" />,
      'Issued': <FaClock className="mr-1" />,
      'Partial': <FaClock className="mr-1" />
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

  const CommissionBreakdownCard = () => {
    if (doctorProfile?.isFullTime) return null;
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaPercent className="text-blue-600" /> Commission Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Commission Rate</p>
            <p className="text-2xl font-bold text-blue-600">{doctorProfile?.revenuePercentage || 0}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Total Appointments</p>
            <p className="text-2xl font-bold text-slate-800">{stats.appointmentCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Total Commission</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalCommission)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Pending Payment</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.pendingAmount)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCommissionTable = () => {
    // Filter records based on selected status
    const filteredRecords = commissionRecords.filter(record => {
      if (filters.status === 'all') return true;
      return record.status === filters.status;
    });

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Invoice #</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Consultation Fee</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Commission</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hospital Share</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">
                      {format(new Date(record.appointment_date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-mono text-slate-600">
                      {record.invoice_number}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">
                      {record.patient_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {formatCurrency(record.consultation_fee)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`text-sm font-bold ${record.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatCurrency(record.commission_amount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-blue-600">
                      {formatCurrency(record.hospital_share)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(record._id)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors mr-1"
                      title="Download Invoice"
                    >
                      <FaDownload size={14} />
                    </button>
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                  No commission records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSalaryTable = () => {
    // Filter records based on selected status
    const filteredRecords = salaryRecords.filter(record => {
      if (filters.status === 'all') return true;
      return record.status === filters.status;
    });

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Base Salary</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Bonus</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Deductions</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Net Amount</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">
                      {format(new Date(record.period_start), 'dd MMM')} - {format(new Date(record.period_end), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm capitalize text-slate-600">
                      {record.period_type}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-slate-700">
                      {formatCurrency(record.base_salary || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-emerald-600">
                      +{formatCurrency(record.bonus || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-red-500">
                      -{formatCurrency(record.deductions || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-slate-800">
                      {formatCurrency(record.net_amount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                  No salary records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading && !doctorProfile) {
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

  const isCommissionDoctor = !doctorProfile.isFullTime;

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="p-6 md:p-2 bg-slate-50/50 min-h-screen font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaWallet className="text-teal-600" /> Earnings & {isCommissionDoctor ? 'Commission' : 'Salary'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-slate-500">
                Payment Model: <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{doctorProfile.paymentType}</span>
              </p>
              {isCommissionDoctor && (
                <>
                  <span className="text-slate-300">|</span>
                  <p className="text-slate-500">
                    Commission Rate: <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{doctorProfile.revenuePercentage || 0}%</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title={isCommissionDoctor ? "Total Commission" : "Total Salary"} 
            value={isCommissionDoctor ? stats.totalCommission : stats.totalSalary} 
            icon={FaMoneyBillWave} 
            color="bg-emerald-500"
            subtext={isCommissionDoctor ? "Commission earned to date" : "Salary paid to date"}
          />
          <StatCard 
            title="Pending Amount" 
            value={stats.pendingAmount} 
            icon={FaClock} 
            color="bg-amber-500"
            subtext={isCommissionDoctor ? "Commission awaiting payment" : "Salary awaiting payment"}
          />
          <StatCard 
            title={isCommissionDoctor ? "Total Appointments" : "Total Bonuses"} 
            value={isCommissionDoctor ? stats.appointmentCount : stats.totalBonus} 
            icon={isCommissionDoctor ? FaUserMd : FaChartLine} 
            color="bg-purple-500"
            subtext={isCommissionDoctor ? "Completed appointments" : "Incentives & Extras"}
          />
        </div>

        {/* Commission Breakdown Card - Only for part-time doctors */}
        <CommissionBreakdownCard />

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Period Type</label>
              <select
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
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

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleApplyFilters}
            className="w-full md:w-auto bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center gap-2 mt-4 md:mt-0 h-[42px]"
          >
            <FaFilter /> Apply Filters
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'all'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                All Transactions
              </button>
              {isCommissionDoctor && (
                <button
                  onClick={() => setActiveTab('commission')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'commission'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Commission Records
                </button>
              )}
              {!isCommissionDoctor && (
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'salary'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Salary Records
                </button>
              )}
            </nav>
          </div>

          <div className="p-4">
            {/* Commission Records Table */}
            {(activeTab === 'all' || activeTab === 'commission') && isCommissionDoctor && (
              <div className={activeTab === 'all' ? 'mb-8' : ''}>
                {activeTab === 'all' && (
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <FaPercent className="text-blue-500" /> Commission Earnings
                  </h3>
                )}
                {renderCommissionTable()}
              </div>
            )}

            {/* Salary Records Table */}
            {(activeTab === 'all' || activeTab === 'salary') && !isCommissionDoctor && (
              <div>
                {activeTab === 'all' && (
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-500" /> Salary Records
                  </h3>
                )}
                {renderSalaryTable()}
              </div>
            )}

            {/* Empty State */}
            {activeTab === 'all' && 
             ((isCommissionDoctor && commissionRecords.length === 0) || 
              (!isCommissionDoctor && salaryRecords.length === 0)) && (
              <div className="text-center py-12 text-slate-500">
                <FaFileInvoiceDollar className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="font-medium">No records found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Transaction Details</h3>
            
            <div className="space-y-4">
              {selectedRecord.invoice ? (
                // Commission details
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Invoice Number</p>
                      <p className="font-medium">{selectedRecord.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Date</p>
                      <p className="font-medium">{format(new Date(selectedRecord.appointment_date), 'dd MMM yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Patient</p>
                      <p className="font-medium">{selectedRecord.patient_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Status</p>
                      {getStatusBadge(selectedRecord.status)}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Consultation Fee:</span>
                        <span className="font-medium">{formatCurrency(selectedRecord.consultation_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Registration Fee:</span>
                        <span className="font-medium">{formatCurrency(selectedRecord.registration_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedRecord.total_amount)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 mt-2">
                        <div className={`flex justify-between font-bold ${selectedRecord.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          <span>Your Commission ({doctorProfile?.revenuePercentage || 0}%):</span>
                          <span>{formatCurrency(selectedRecord.commission_amount)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Hospital Share:</span>
                          <span>{formatCurrency(selectedRecord.hospital_share)}</span>
                        </div>
                      </div>
                      {selectedRecord.status === 'pending' && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700 flex items-center gap-2">
                            <FaClock />
                            This commission is pending payment. It will be marked as paid once the admin processes the payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // Salary details
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Period</p>
                      <p className="font-medium">
                        {format(new Date(selectedRecord.period_start), 'dd MMM')} - {format(new Date(selectedRecord.period_end), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Type</p>
                      <p className="font-medium capitalize">{selectedRecord.period_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Status</p>
                      {getStatusBadge(selectedRecord.status)}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Salary:</span>
                        <span className="font-medium">{formatCurrency(selectedRecord.base_salary || 0)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Bonus:</span>
                        <span>+{formatCurrency(selectedRecord.bonus || 0)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Deductions:</span>
                        <span>-{formatCurrency(selectedRecord.deductions || 0)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Net Amount:</span>
                          <span>{formatCurrency(selectedRecord.net_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Close
              </button>
              {selectedRecord.invoice && (
                <button
                  onClick={() => handleDownloadInvoice(selectedRecord._id)}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaDownload /> Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DoctorSalaryPage;