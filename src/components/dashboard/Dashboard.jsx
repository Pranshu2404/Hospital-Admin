import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { adminSidebar } from '../../constants/sidebarItems/adminSidebar';

dayjs.extend(relativeTime);

// --- 1. Custom Beautiful Icons ---
const Icons = {
  Patient: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Doctor: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Staff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.5 2-2 2h-1m6-2c0 .884.5 2 2 2h1M5 21h14" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  ActivityCreate: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  ActivityCheck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  DollarSign: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const Dashboard = () => {
  const navigate = useNavigate();
  const didFetch = useRef(false); // ✅ prevents double-fetch in React StrictMode dev

  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // ✅ Finance computed from revenue responses
  const [financeStats, setFinanceStats] = useState({
    dailyIncome: 0,
    pendingPayments: 0
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch finance data with pending payments
  const fetchFinanceData = async () => {
    setLoadingFinance(true);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const today = dayjs();

      const [dailyRes, invoicesRes] = await Promise.all([
        axios.get(`${baseUrl}/revenue/daily`, { params: { date: today.format('YYYY-MM-DD') } }),
        axios.get(`${baseUrl}/invoices`, { params: { limit: 100, page: 1 } })
      ]);
      console.log('Finance data responses:', dailyRes, invoicesRes);
      const dailyData = dailyRes.data;
      const dailyIncome = toNumber(dailyData?.summary?.totalRevenue);

      // Calculate pending payments from invoices
      const invoicePayload = invoicesRes.data;
      const invoiceList = invoicePayload?.invoices || [];
      
      // Sum up pending/unpaid invoices
      const pendingTotal = invoiceList
        .filter(inv => inv.status === 'Pending' || inv.status === 'pending')
        .reduce((sum, inv) => sum + toNumber(inv.total || inv.total_amount || inv.amount || 0), 0);

      const invoices = invoiceList.slice(0, 5).map((inv) => ({
        id: inv._id,
        invoiceNumber: inv.invoice_number || inv.number || `#${String(inv._id || '').slice(-4)}`,
        patientName: inv.patient_id?.first_name || inv.patientName || 'Unknown',
        amount: inv.total || inv.total_amount || inv.amount || 0,
        status: inv.status || 'Pending',
        date: dayjs(inv.created_at || inv.createdAt || inv.issue_date).format('MMM DD, YYYY'),
        dueDate: inv.due_date
          ? dayjs(inv.due_date).format('MMM DD, YYYY')
          : 'N/A'
      }));

      setFinanceStats({ 
        dailyIncome, 
        pendingPayments: pendingTotal 
      });
      setRecentInvoices(invoices);
    } catch (err) {
      console.error('Finance data fetch error:', err);
      setFinanceStats({ dailyIncome: 0, pendingPayments: 0 });
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

        setStats([
          {
            title: 'Total Patients',
            value: patients.length,
            icon: Icons.Patient,
            bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconBg: 'bg-blue-600',
            textColor: 'text-blue-900',
            route: '/dashboard/admin/patient-list'
          },
          {
            title: "Today's Visits",
            value: appointments.filter((a) => dayjs(a.appointment_date).isSame(dayjs(), 'day')).length,
            icon: Icons.Calendar,
            bgGradient: 'bg-gradient-to-br from-teal-50 to-teal-100',
            iconBg: 'bg-teal-600',
            textColor: 'text-teal-900',
            route: '/dashboard/admin/appointments'
          },
          {
            title: 'Active Doctors',
            value: doctors.length,
            icon: Icons.Doctor,
            bgGradient: 'bg-gradient-to-br from-violet-50 to-violet-100',
            iconBg: 'bg-violet-600',
            textColor: 'text-violet-900',
            route: '/dashboard/admin/doctor-list'
          },
          {
            title: 'Hospital Staff',
            value: staff.length,
            icon: Icons.Staff,
            bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100',
            iconBg: 'bg-amber-500',
            textColor: 'text-amber-900',
            route: '/dashboard/admin/staff-list'
          }
        ]);

        const sortedAppointments = [...appointments]
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5)
          .map((a) => ({
            id: a._id,
            patientName: a.patient_id?.first_name || 'Unknown Patient',
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

        // Simple activity feed
        const activities = [];
        if (patients.length > 0) {
          patients.slice(-2).reverse().forEach((p) =>
            activities.push({
              id: `p-${p._id}`,
              type: 'create',
              user: 'Admin',
              action: 'registered new patient',
              target: p.first_name,
              time: dayjs(p.createdAt).fromNow()
            })
          );
        }
        if (appointments.length > 0) {
          appointments.slice(-3).reverse().forEach((a) =>
            activities.push({
              id: `a-${a._id}`,
              type: 'complete',
              user: 'System',
              action: 'updated appointment for',
              target: a.patient_id?.first_name || 'Patient',
              time: dayjs(a.updatedAt).fromNow()
            })
          );
        }
        setRecentActivities(activities);

        await fetchFinanceData();
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
      Confirmed: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/30',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
      Completed: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/30',
      Cancelled: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${
      styles[status] || styles.Completed
    }`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 font-medium">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50/50 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
              <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-teal-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-teal-700 font-mono text-sm tracking-wide">{currentTime.format('HH:mm:ss')}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/admin/appointments')}
          className="mt-4 md:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Icons.Plus />
          New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(stat.route)}
            className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${stat.bgGradient} border border-white/50 shadow-sm group`}
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className={`text-sm font-bold opacity-70 mb-1 ${stat.textColor}`}>{stat.title}</p>
                <h3 className={`text-3xl font-extrabold ${stat.textColor}`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.iconBg} text-white shadow-md bg-opacity-90 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>
        ))}
      </div>

      {/* Financial Overview Cards - Only 2 Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Financial Overview</h2>
          <button
            onClick={fetchFinanceData}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors"
          >
            {loadingFinance ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Income Card */}
          <div
            onClick={() => navigate('/dashboard/admin/income')}
            className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100 border border-white/50 shadow-sm group"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-bold opacity-70 mb-1 text-green-900">Today's Income</p>
                <h3 className="text-3xl font-extrabold text-green-900">
                  {formatCurrency(financeStats.dailyIncome)}
                </h3>
                <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                  <Icons.Calendar />
                  {dayjs().format('MMM DD, YYYY')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-green-600 text-white shadow-md bg-opacity-90 group-hover:scale-110 transition-transform duration-300">
                <Icons.DollarSign />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* Today's Pending Payments Card */}
          <div
            onClick={() => navigate('/dashboard/admin/invoices?status=pending')}
            className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-white/50 shadow-sm group"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-bold opacity-70 mb-1 text-amber-900">Pending Payments</p>
                <h3 className="text-3xl font-extrabold text-amber-900">
                  {formatCurrency(financeStats.pendingPayments)}
                </h3>
                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                  <Icons.Clock />
                  Outstanding amount
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-600 text-white shadow-md bg-opacity-90 group-hover:scale-110 transition-transform duration-300">
                <Icons.FileText />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
              <button
                onClick={() => navigate('/dashboard/admin/appointments')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-4">Patient</th>
                    <th className="px-4 py-4">Service</th>
                    <th className="px-4 py-4">Schedule</th>
                    <th className="px-4 py-4">Doctor</th>
                    <th className="px-4 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${appt.avatarColor}`}>
                              {appt.initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{appt.patientName}</p>
                              <p className="text-xs text-slate-400">ID: #{appt.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">{appt.service}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{appt.time}</span>
                            <span className="text-xs text-slate-400 font-medium">{appt.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-600">{appt.doctor}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={getStatusBadge(appt.status)}>{appt.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic">
                        No appointments found.
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
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5 px-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {adminSidebar
                .filter((link) => !link.submenu && link.label !== 'Dashboard')
                .slice(0, 6)
                .map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
                  >
                    <div className="p-2.5 bg-white rounded-xl text-teal-600 shadow-sm mb-3 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                      {item.icon && <item.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-teal-700">{item.label}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 px-2">Live Activity</h3>
            <div className="flow-root px-2">
              <ul className="-mb-8">
                {recentActivities.map((activity, idx) => (
                  <li key={activity.id + idx}>
                    <div className="relative pb-8">
                      {idx !== recentActivities.length - 1 && (
                        <span className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-4">
                        <div className={`relative h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${activity.type === 'create' ? 'bg-teal-100' : 'bg-blue-100'}`}>
                          {activity.type === 'create' ? <Icons.ActivityCreate className="text-teal-600" /> : <Icons.ActivityCheck className="text-blue-600" />}
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-sm text-slate-600 leading-snug">
                            <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}{' '}
                            <span className="font-semibold text-slate-800">{activity.target}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-medium">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {recentActivities.length === 0 && (
                  <li className="text-sm text-slate-400 italic px-2">No recent activity.</li>
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