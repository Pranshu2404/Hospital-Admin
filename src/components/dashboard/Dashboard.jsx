import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { adminSidebar } from '../../constants/sidebarItems/adminSidebar';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  FaUsers,
  FaCalendarCheck,
  FaUserMd,
  FaUserNurse,
  FaDollarSign,
  FaClock,
  FaFileInvoice,
  FaPlus,
  FaCheck,
  FaTimes,
  FaEllipsisH,
  FaChevronRight,
  FaHeartbeat,
  FaExclamationTriangle,
  FaChartLine,
  FaHospital,
  FaSyringe,
  FaAmbulance,
  FaPills,
  FaWallet,
  FaCreditCard
} from 'react-icons/fa';

dayjs.extend(relativeTime);

// --- Custom Styles ---
const dashboardStyles = `
  .stat-card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stat-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.02);
  }
  .pulse-dot {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
  .glass-card {
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.8);
  }
`;

const COLORS = {
  primary: '#0d9488',
  secondary: '#2dd4bf',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  }
};

// Chart colors
const CHART_COLORS = ['#0d9488', '#2dd4bf', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const Dashboard = () => {
  const navigate = useNavigate();
  const didFetch = useRef(false);

  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [hospital, setHospital] = useState(null);

  // Finance data
  const [financeStats, setFinanceStats] = useState({
    dailyIncome: 0,
    pendingPayments: 0,
    weeklyRevenue: [],
    monthlyRevenue: 0,
    paymentMethods: []
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          setHospital(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  // Fetch finance data with enhanced metrics
  const fetchFinanceData = async () => {
    setLoadingFinance(true);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const today = dayjs();
      const last7Days = Array.from({ length: 7 }, (_, i) => 
        today.subtract(6 - i, 'day').format('YYYY-MM-DD')
      );

      // Fetch daily revenue for last 7 days
      const weeklyPromises = last7Days.map(date => 
        axios.get(`${baseUrl}/revenue/daily`, { params: { date } })
          .catch(() => ({ data: { summary: { totalRevenue: 0 } } }))
      );

      const [dailyRes, invoicesRes, ...weeklyRes] = await Promise.all([
        axios.get(`${baseUrl}/revenue/daily`, { params: { date: today.format('YYYY-MM-DD') } }),
        axios.get(`${baseUrl}/invoices`, { params: { limit: 100, page: 1 } }),
        ...weeklyPromises
      ]);

      const dailyIncome = toNumber(dailyRes.data?.summary?.totalRevenue);

      // Process weekly revenue
      const weeklyRevenue = weeklyRes.map((res, index) => ({
        day: today.subtract(6 - index, 'day').format('ddd'),
        revenue: toNumber(res.data?.summary?.totalRevenue),
        fullDate: last7Days[index]
      }));

      // Calculate monthly revenue
      const monthlyRevenue = weeklyRevenue.reduce((sum, day) => sum + day.revenue, 0);

      // Process invoices
      const invoicePayload = invoicesRes.data;
      const invoiceList = invoicePayload?.invoices || [];

      const pendingTotal = invoiceList
        .filter(inv => inv.status === 'Pending' || inv.status === 'pending')
        .reduce((sum, inv) => sum + toNumber(inv.total || inv.total_amount || inv.amount || 0), 0);

      // Mock payment methods distribution (replace with actual data)
      const paymentMethods = [
        { name: 'Cash', value: 45 },
        { name: 'Card', value: 30 },
        { name: 'Insurance', value: 20 },
        { name: 'Online', value: 5 }
      ];

      const invoices = invoiceList.slice(0, 5).map((inv) => ({
        id: inv._id,
        invoiceNumber: inv.invoice_number || inv.number || `#${String(inv._id || '').slice(-4)}`,
        patientName: inv.patient_id?.first_name || inv.patientName || 'Unknown',
        amount: inv.total || inv.total_amount || inv.amount || 0,
        status: inv.status || 'Pending',
        date: dayjs(inv.created_at || inv.createdAt || inv.issue_date).format('MMM DD, YYYY'),
        dueDate: inv.due_date ? dayjs(inv.due_date).format('MMM DD, YYYY') : 'N/A'
      }));

      setRevenueData(weeklyRevenue);
      setFinanceStats({
        dailyIncome,
        pendingPayments: pendingTotal,
        weeklyRevenue,
        monthlyRevenue,
        paymentMethods
      });
      setRecentInvoices(invoices);
    } catch (err) {
      console.error('Finance data fetch error:', err);
      setFinanceStats(prev => ({
        ...prev,
        dailyIncome: 0,
        pendingPayments: 0,
        weeklyRevenue: [],
        monthlyRevenue: 0
      }));
      setRecentInvoices([]);
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        const [patientsRes, staffRes, appointmentsRes, doctorRes] = await Promise.all([
          axios.get(`${baseUrl}/patients`),
          axios.get(`${baseUrl}/staff`),
          axios.get(`${baseUrl}/appointments`),
          axios.get(`${baseUrl}/doctors`)
        ]);

        const patients = patientsRes.data?.patients || [];
        const staff = Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data?.staff || []);
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (appointmentsRes.data?.appointments || []);
        const doctors = Array.isArray(doctorRes.data) ? doctorRes.data : (doctorRes.data?.doctors || doctorRes.data || []);

        // Calculate additional metrics
        const todayAppointments = appointments.filter(a => dayjs(a.appointment_date).isSame(dayjs(), 'day')).length;
        const completedToday = appointments.filter(a => 
          dayjs(a.appointment_date).isSame(dayjs(), 'day') && a.status === 'Completed'
        ).length;
        const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;

        setStats([
          {
            title: "Total Patients",
            value: patients.length,
            icon: FaUsers,
            change: "+12%",
            changeType: "increase",
            bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-600',
            textColor: 'text-blue-900',
            route: '/dashboard/admin/patient-list',
          },
          {
            title: "Today's Visits",
            value: todayAppointments,
            subValue: `${completedToday} completed`,
            icon: FaCalendarCheck,
            change: todayAppointments > 0 ? "+" + todayAppointments : "0",
            changeType: todayAppointments > 0 ? "increase" : "neutral",
            bgGradient: 'bg-gradient-to-br from-teal-50 to-emerald-50',
            iconBg: 'bg-teal-600',
            textColor: 'text-teal-900',
            route: '/dashboard/admin/appointments',
          },
          {
            title: 'Active Doctors',
            value: doctors.length,
            icon: FaUserMd,
            change: `+${doctors.filter(d => d.status === 'active').length} active`,
            changeType: "increase",
            bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
            iconBg: 'bg-violet-600',
            textColor: 'text-violet-900',
            route: '/dashboard/admin/doctor-list',
          },
          {
            title: 'Hospital Staff',
            value: staff.length,
            icon: FaUserNurse,
            change: `${staff.filter(s => s.department === 'nursing').length} nurses`,
            changeType: "neutral",
            bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
            iconBg: 'bg-amber-500',
            textColor: 'text-amber-900',
            route: '/dashboard/admin/staff-list',
          }
        ]);

        // Enhanced appointments with better formatting
        const sortedAppointments = [...appointments]
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5)
          .map((a) => ({
            id: a._id,
            patientName: a.patient_id?.first_name || 'Unknown Patient',
            patientImage: a.patient_id?.patient_image || a.patient_id?.patientImage,
            service: a.type || 'General Checkup',
            time: dayjs(a.appointment_date).format('hh:mm A'),
            date: dayjs(a.appointment_date).format('MMM DD'),
            doctor: a.doctor_id?.firstName ? `Dr. ${a.doctor_id.firstName}` : 'Unassigned',
            status: a.status || 'Scheduled',
            initials: (a.patient_id?.first_name || 'U').substring(0, 2).toUpperCase(),
            avatarColor: ['bg-blue-100 text-blue-600', 'bg-teal-100 text-teal-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600'][
              ((a.patient_id?.first_name?.length || 0) % 4)
            ]
          }));
        setRecentAppointments(sortedAppointments);

        // Enhanced activity feed
        const activities = [];
        if (patients.length > 0) {
          patients.slice(-3).reverse().forEach((p) =>
            activities.push({
              id: `p-${p._id}`,
              type: 'create',
              user: 'Admin',
              action: 'registered new patient',
              target: p.first_name,
              targetId: p._id,
              time: dayjs(p.createdAt).fromNow(),
              icon: FaUsers
            })
          );
        }
        if (appointments.length > 0) {
          appointments.slice(-3).reverse().forEach((a) =>
            activities.push({
              id: `a-${a._id}`,
              type: a.status === 'Completed' ? 'complete' : 'update',
              user: 'System',
              action: a.status === 'Completed' ? 'completed appointment for' : 'updated appointment for',
              target: a.patient_id?.first_name || 'Patient',
              targetId: a._id,
              time: dayjs(a.updatedAt).fromNow(),
              icon: a.status === 'Completed' ? FaCheck : FaCalendarCheck
            })
          );
        }
        setRecentActivities(activities.slice(0, 5));

        await fetchFinanceData();
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Scheduled: 'bg-teal-50 text-teal-700 border-teal-200',
      Confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Completed}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Stat Card Component
  const StatCard = ({ stat, index }) => (
    <div
      onClick={() => navigate(stat.route)}
      className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {stat.title}
          </p>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            {stat.subValue && (
              <p className="text-xs text-slate-500 mt-1">{stat.subValue}</p>
            )}
          </div>
          {stat.change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              stat.changeType === 'increase' ? 'text-emerald-600' : 
              stat.changeType === 'decrease' ? 'text-rose-600' : 'text-slate-500'
            }`}>
              <span>{stat.change}</span>
              <span className="text-slate-400">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${stat.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon size={22} />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
    </div>
  );

  // Financial Card Component
  const FinancialCard = ({ title, value, icon: Icon, color, subtitle, onClick, trend }) => (
    <div
      onClick={onClick}
      className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <style>{dashboardStyles}</style>

      {/* Header with Hospital Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          </div>
          <p className="text-slate-500 text-sm">Welcome back, Admin. Here's your hospital overview.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
            <FaCalendarCheck className="text-teal-500" />
            <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
          </div>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-teal-700 font-mono text-sm tracking-wide">{currentTime.format('HH:mm:ss')}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} index={idx} />
        ))}
      </div>

      {/* Financial Overview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Financial Overview</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time revenue and payment insights</p>
          </div>
          <button
            onClick={fetchFinanceData}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaClock className={`h-3 w-3 ${loadingFinance ? 'animate-spin' : ''}`} />
            {loadingFinance ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <FinancialCard
            title="Today's Income"
            value={formatCurrency(financeStats.dailyIncome)}
            icon={FaDollarSign}
            color="bg-emerald-600"
            subtitle={`${revenueData[6]?.revenue ? '↑' : ''} vs yesterday`}
            trend={revenueData[6]?.revenue && revenueData[5]?.revenue ? 
              ((revenueData[6].revenue - revenueData[5].revenue) / revenueData[5].revenue * 100).toFixed(1) : 0}
            onClick={() => navigate('/dashboard/admin/income')}
          />
          
          <FinancialCard
            title="Pending Payments"
            value={formatCurrency(financeStats.pendingPayments)}
            icon={FaWallet}
            color="bg-amber-600"
            subtitle={`${recentInvoices.length} outstanding invoices`}
            onClick={() => navigate('/dashboard/admin/invoices', { state: { status: 'Pending' } })}
          />
          
          <FinancialCard
            title="Monthly Revenue"
            value={formatCurrency(financeStats.monthlyRevenue)}
            icon={FaChartLine}
            color="bg-blue-600"
            subtitle="Last 7 days"
            onClick={() => navigate('/dashboard/admin/reports')}
          />
          
          <FinancialCard
            title="Collection Rate"
            value="94%"
            icon={FaCreditCard}
            color="bg-purple-600"
            subtitle="↑ 2% from last month"
            onClick={() => navigate('/dashboard/admin/reports')}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Appointments Table */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
                <p className="text-xs text-slate-500 mt-1">Latest patient appointments</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/admin/appointments')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Patient</th>
                    <th className="px-6 py-4 text-left">Service</th>
                    <th className="px-6 py-4 text-left">Schedule</th>
                    <th className="px-6 py-4 text-left">Doctor</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/admin/appointments/${appt.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {appt.patientImage ? (
                              <img src={appt.patientImage} alt={appt.patientName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${appt.avatarColor}`}>
                                {appt.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800">{appt.patientName}</p>
                              <p className="text-xs text-slate-400">ID: #{appt.id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                            {appt.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{appt.time}</span>
                            <span className="text-xs text-slate-400">{appt.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{appt.doctor}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={getStatusBadge(appt.status)}>{appt.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recent Invoices</h3>
                <p className="text-xs text-slate-500 mt-1">Latest payment activity</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/admin/invoices')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/admin/invoices/${invoice.id}`)}>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{invoice.patientName}</p>
                    <p className="text-xs text-slate-500">{invoice.invoiceNumber} • {invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{formatCurrency(invoice.amount)}</p>
                    <span className={getStatusBadge(invoice.status)}>{invoice.status}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic text-center py-4">No recent invoices</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {adminSidebar
                .filter((link) => !link.submenu && link.label !== 'Dashboard')
                .slice(0, 6)
                .map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-teal-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-2.5 bg-white rounded-lg text-teal-600 shadow-sm mb-2 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                      {item.icon && <item.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700 text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Live Activity</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, idx) => (
                  <li key={activity.id + idx}>
                    <div className="relative pb-8">
                      {idx !== recentActivities.length - 1 && (
                        <span className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div className={`relative h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                          activity.type === 'create' ? 'bg-teal-100' : 'bg-blue-100'
                        }`}>
                          {activity.type === 'create' ? (
                            <FaPlus className="h-4 w-4 text-teal-600" />
                          ) : (
                            <FaCheck className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-sm text-slate-600">
                            <span className="font-bold text-slate-900">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-semibold text-slate-800">{activity.target}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {recentActivities.length === 0 && (
                  <li className="text-sm text-slate-400 italic text-center py-4">
                    No recent activity
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;