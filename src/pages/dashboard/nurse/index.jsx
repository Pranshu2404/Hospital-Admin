import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Layout from '../../../components/Layout';
import { nurseSidebar } from '../../../constants/sidebarItems/nurseSidebar';
import apiClient from '../../../api/apiClient';
import { 
  FaHeartbeat, 
  FaCalendarCheck, 
  FaClock,
  FaUserInjured,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaChevronRight,
  FaThermometerHalf,
  FaWeight,
  FaRuler,
  FaTachometerAlt,
  FaLungs,
  FaArrowRight,
  FaHourglassHalf
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

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
  .vital-badge {
    transition: all 0.2s ease;
  }
  .vital-badge:hover {
    transform: scale(1.05);
  }
`;

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingVitals: 0,
    todayAppointments: 0,
    completedVitals: 0,
    inProgressVitals: 0
  });
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [vitalsQueue, setVitalsQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await apiClient.get('/hospitals');
        if (res.data && res.data.length > 0) {
          setHospital(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/appointments');
        const allAppointments = response.data.appointments || response.data || [];

        // Filter relevant appointments
        const relevantAppointments = allAppointments.filter(appt =>
          appt.status !== 'Cancelled' &&
          ['Scheduled', 'Confirmed', 'In Progress', 'Checked In'].includes(appt.status)
        );

        // Calculate vitals status
        const pendingVitalsCount = relevantAppointments.filter(appt => {
          if (!appt.vitals) return true;
          const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature', 
                              'respiratory_rate', 'height'];
          return !vitalFields.some(field => 
            appt.vitals[field] !== undefined && 
            appt.vitals[field] !== null && 
            appt.vitals[field] !== ''
          );
        }).length;

        const completedVitalsCount = relevantAppointments.filter(appt => {
          if (!appt.vitals) return false;
          const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature', 
                              'respiratory_rate', 'height'];
          return vitalFields.some(field => 
            appt.vitals[field] !== undefined && 
            appt.vitals[field] !== null && 
            appt.vitals[field] !== ''
          );
        }).length;

        setStats({
          pendingVitals: pendingVitalsCount,
          todayAppointments: relevantAppointments.length,
          completedVitals: completedVitalsCount,
          inProgressVitals: relevantAppointments.length - pendingVitalsCount - completedVitalsCount
        });

        // Create vitals queue
        const today = dayjs().format('YYYY-MM-DD');
        const todaysAppointments = relevantAppointments
          .filter(appt => dayjs(appt.appointment_date).format('YYYY-MM-DD') === today)
          .sort((a, b) => new Date(a.start_time || a.appointment_date) - new Date(b.start_time || b.appointment_date))
          .slice(0, 5);

        const queue = todaysAppointments.map(appt => {
          const hasVitals = appt.vitals && Object.keys(appt.vitals).length > 0;
          const patient = appt.patient_id || {};
          
          return {
            id: appt._id,
            patientName: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient',
            patientImage: patient.patient_image || patient.patientImage,
            appointmentTime: appt.start_time ? dayjs(appt.start_time).format('hh:mm A') : 
                            appt.time_slot ? appt.time_slot.split('-')[0].trim() : '--:--',
            type: appt.type || 'Checkup',
            hasVitals,
            vitalsStatus: hasVitals ? 'completed' : 'pending',
            doctor: appt.doctor_id?.firstName ? `Dr. ${appt.doctor_id.firstName}` : 'Unassigned',
            initials: (patient.first_name || 'U').substring(0, 2).toUpperCase()
          };
        });

        setVitalsQueue(queue);

        // Recent appointments
        const recent = relevantAppointments
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5)
          .map(appt => {
            const patient = appt.patient_id || {};
            const hasVitals = appt.vitals && Object.keys(appt.vitals).length > 0;
            
            return {
              id: appt._id,
              patientName: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient',
              patientImage: patient.patient_image || patient.patientImage,
              time: appt.start_time ? dayjs(appt.start_time).format('hh:mm A') : 
                    appt.time_slot ? appt.time_slot.split('-')[0].trim() : '--:--',
              date: dayjs(appt.appointment_date).format('MMM DD'),
              type: appt.type || 'Checkup',
              doctor: appt.doctor_id?.firstName ? `Dr. ${appt.doctor_id.firstName}` : 'Unassigned',
              hasVitals,
              status: appt.status || 'Scheduled',
              initials: (patient.first_name || 'U').substring(0, 2).toUpperCase(),
              avatarColor: ['bg-blue-100 text-blue-600', 'bg-teal-100 text-teal-600', 'bg-purple-100 text-purple-600'][
                ((patient.first_name?.length || 0) % 3)
              ]
            };
          });

        setRecentAppointments(recent);
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusBadge = (hasVitals) => {
    return hasVitals 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200';
  };

  if (isLoading) {
    return (
      <Layout sidebarItems={nurseSidebar} role="nurse">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={nurseSidebar} role="nurse">
      <style>{dashboardStyles}</style>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header with Hospital Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">Nurse Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">Monitor and record patient vitals efficiently</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Vitals Card */}
          <div className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
               onClick={() => navigate('/dashboard/nurse/prescriptions')}>
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Vitals</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.pendingVitals}</h3>
                  <p className="text-xs text-slate-500 mt-1">Awaiting vital signs</p>
                </div>
                {stats.pendingVitals > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    <FaExclamationTriangle className="h-3 w-3" />
                    <span>Requires attention</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaHeartbeat size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* Completed Vitals Card */}
          <div className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
               onClick={() => navigate('/dashboard/nurse/vitals-history')}>
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed Vitals</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.completedVitals}</h3>
                  <p className="text-xs text-slate-500 mt-1">Successfully recorded</p>
                </div>
                {stats.completedVitals > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <FaCheckCircle className="h-3 w-3" />
                    <span>All done</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* Today's Appointments Card */}
          <div className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
               onClick={() => navigate('/dashboard/nurse/appointments')}>
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Appointments</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.todayAppointments}</h3>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for today</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaCalendarCheck size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Vitals Queue */}
          <div className="xl:col-span-2 space-y-8">

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
                  <p className="text-xs text-slate-500 mt-1">Latest patient appointments</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/nurse/appointments')}
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
                      <th className="px-6 py-4 text-left">Time</th>
                      <th className="px-6 py-4 text-left">Doctor</th>
                      <th className="px-6 py-4 text-right">Vitals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentAppointments.length > 0 ? (
                      recentAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/nurse/appointments/${appt.id}`)}>
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
                              {appt.type}
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
                            <span className={getStatusBadge(appt.hasVitals)}>
                              {appt.hasVitals ? 'Recorded' : 'Pending'}
                            </span>
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
            {/* Quick Vitals Entry */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FaHeartbeat size={120} />
              </div>
              
              <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider mb-1">Quick Vitals Entry</h3>
              <p className="text-white/80 mb-6 text-sm">Record patient vitals in one click</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <FaThermometerHalf className="h-4 w-4 mb-1 text-white/80" />
                  <p className="text-xs text-white/60">Temperature</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <FaHeartbeat className="h-4 w-4 mb-1 text-white/80" />
                  <p className="text-xs text-white/60">Pulse</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <FaTachometerAlt className="h-4 w-4 mb-1 text-white/80" />
                  <p className="text-xs text-white/60">BP</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <FaWeight className="h-4 w-4 mb-1 text-white/80" />
                  <p className="text-xs text-white/60">Weight</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard/nurse/prescriptions')}
                className="w-full py-3 bg-white text-teal-700 font-bold rounded-xl shadow-md hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus />
                Start Recording
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Vitals Queue', icon: FaHeartbeat, path: '/dashboard/nurse/prescriptions', color: 'amber' },
                  { label: 'Appointments', icon: FaCalendarCheck, path: '/dashboard/nurse/appointments', color: 'teal' },
                  { label: 'Patients', icon: FaUserInjured, path: '/dashboard/nurse/patients', color: 'blue' },
                  { label: 'History', icon: FaClock, path: '/dashboard/nurse/vitals-history', color: 'purple' }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-teal-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className={`p-2.5 bg-white rounded-lg text-${item.color}-600 shadow-sm mb-2 group-hover:scale-110 group-hover:bg-${item.color}-500 group-hover:text-white transition-all duration-300`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700 text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NurseDashboard;