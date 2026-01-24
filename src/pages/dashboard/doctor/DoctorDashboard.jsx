import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import AppointmentSlipModal from '@/components/appointments/AppointmentSlipModal';
import {
  FaUsers,
  FaCalendarCheck,
  FaTooth,
  FaUserInjured,
  FaClock,
  FaCheck,
  FaTimes,
  FaEllipsisH,
  FaChevronRight,
  FaHeartbeat,
  FaExclamationTriangle
} from 'react-icons/fa';

// --- Custom Styles for Calendar Override ---
const calendarStyles = `
  .rbc-calendar { font-family: inherit; color: #475569; border: none; }
  .rbc-header { padding: 12px; font-weight: 600; color: #0f766e; border-bottom: 2px solid #f1f5f9; background: #f0fdfa; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
  .rbc-month-view { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: white; }
  .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
  .rbc-off-range-bg { background: #f8fafc; }
  .rbc-today { background-color: #f0fdfa; }
  .rbc-event { border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 2px 5px; font-size: 0.8rem; border: none; }
  .rbc-toolbar { margin-bottom: 20px; }
  .rbc-toolbar button { border: 1px solid #e2e8f0; color: #64748b; font-weight: 500; }
  .rbc-toolbar button.rbc-active { background-color: #0d9488; color: white; border-color: #0d9488; }
  .rbc-toolbar button:hover { background-color: #f1f5f9; color: #0f172a; }
`;

const localizer = momentLocalizer(moment);
const COLORS = ['#0d9488', '#2dd4bf', '#99f6e4', '#ccfbf1']; // Teal palette

const DoctorDashboard = () => {
  const [stats, setStats] = useState({ patients: 0, consultations: 0, procedures: 0, todayAppointments: 0 });
  const [nextPatient, setNextPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedCalendarAppt, setSelectedCalendarAppt] = useState(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [hospital, setHospital] = useState(null);
  const [name, setName] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [vitalsEnabled, setVitalsEnabled] = useState(() => {
    const stored = localStorage.getItem('vitalsEnabled');
    return stored === null ? true : stored === 'true';
  });

  const doctorId = localStorage.getItem("doctorId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          setHospital(res.data[0]);
          const v = res.data[0].vitalsEnabled !== undefined ? res.data[0].vitalsEnabled : true;
          setVitalsEnabled(v);
          localStorage.setItem('vitalsEnabled', v);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to check if appointment has vitals
  const hasVitals = (appointment) => {
    if (!vitalsEnabled) return true;
    if (appointment.vitals) {
      const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature', 
                          'respiratory_rate', 'random_blood_sugar', 'height'];
      
      return vitalFields.some(field => {
        const value = appointment.vitals[field];
        return value !== undefined && value !== null && value !== '' && value.trim() !== '';
      });
    }
    
    if (appointment.vitals_id) {
      const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature', 
                          'respiratory_rate', 'random_blood_sugar', 'height'];
      
      return vitalFields.some(field => {
        const value = appointment.vitals_id?.[field];
        return value !== undefined && value !== null && value !== '' && value.trim() !== '';
      });
    }
    
    return false;
  };

  useEffect(() => {
    const calculateAge = (dob) => {
      if (!dob) return null;
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const formatApptTime = (appt) => {
      if (!appt) return null;
      if (appt.start_time) return new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (appt.time) return String(appt.time);
      if (appt.time_slot) return String(appt.time_slot).split('-')[0].trim();
      return null;
    };

    if (!doctorId) return;

    const fetchDashboardStats = async () => {
      try {
        // const [patientsRes, appointmentsRes, doctorsRes, calendarRes] = await Promise.all([
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients`),
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`),
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors`),
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/calendar/doctor/${doctorId}`)
        // ]);
        const appointmentsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`);
        const doctorsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors`);

        const currentDoctor = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`);
        console.log('Current Doctor Data:', currentDoctor.data);
        setName(currentDoctor.data.firstName);

        const today = dayjs();
        const apptsData = appointmentsRes.data || [];

        const uniquePatientsMap = new Map();
        apptsData.forEach(appt => {
          if (appt.patient_id && appt.patient_id._id) {
            uniquePatientsMap.set(appt.patient_id._id, appt.patient_id);
          }
        });
        const myPatients = Array.from(uniquePatientsMap.values());

        setAppointments(apptsData);
        setPatients(myPatients);
        setDoctors(doctorsRes.data);

        const todayAppointments = apptsData.filter(appt =>
          dayjs(appt.appointment_date).isSame(today, 'day') && appt.status !== 'Cancelled'
        ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        setStats({
          patients: myPatients.length,
          consultations: apptsData.filter(a => a.type === 'Consultation').length,
          procedures: apptsData.filter(a => a.type === 'Procedure').length,
          todayAppointments: todayAppointments.length,
        });
        if (todayAppointments.length > 0) {
          const scheduledForToday = todayAppointments.filter(a => a.status === 'Scheduled');

          if (scheduledForToday.length > 0) {
            let nextAppointment = null;
            if (vitalsEnabled) {
              const appointmentsWithVitals = scheduledForToday.filter(appt => hasVitals(appt));
              
              if (appointmentsWithVitals.length > 0) {
                nextAppointment = appointmentsWithVitals.find(a => 
                  dayjs(a.start_time || a.appointment_date).isAfter(dayjs())
                ) || appointmentsWithVitals[0];
              } else {
                nextAppointment = scheduledForToday.find(a => 
                  dayjs(a.start_time || a.appointment_date).isAfter(dayjs())
                ) || scheduledForToday[0];
              }
            } else {
              nextAppointment = scheduledForToday.find(a => 
                dayjs(a.start_time || a.appointment_date).isAfter(dayjs())
              ) || scheduledForToday[0];
            }

            if (nextAppointment) {
              const patient = nextAppointment.patient_id || {};
              const hasVitalsRecorded = hasVitals(nextAppointment);
              
              setNextPatient({
                first_name: patient.first_name || patient.firstName || '',
                last_name: patient.last_name || patient.lastName || '',
                phone: patient.phone || '',
                gender: patient.gender || '',
                age: calculateAge(patient.dob),
                patient_image: patient.patient_image || patient.patientImage || null,
                treatment: nextAppointment.type,
                date: nextAppointment.appointment_date,
                time: formatApptTime(nextAppointment),
                status: nextAppointment.status,
                hasVitals: hasVitalsRecorded,
                appointmentId: nextAppointment._id,
                appointmentData: nextAppointment
              });
            } else {
              setNextPatient(null);
            }
          } else {
            setNextPatient(null);
          }
        } else {
          setNextPatient(null);
        }

        // Calendar Events
        const events = [];
        apptsData.forEach(appt => {
          const start = appt.start_time ? new Date(appt.start_time) : new Date(appt.appointment_date);
          const end = appt.end_time ? new Date(appt.end_time) : new Date(new Date(start).setMinutes(start.getMinutes() + 30));

          if (appt.status !== 'Cancelled') {
            events.push({
              title: `${appt.patient_id?.first_name || 'Patient'} - ${appt.type}`,
              start,
              end,
              resource: appt,
              status: appt.status
            });
          }
        });
        setCalendarEvents(events);

        // Mock Approval Requests (using upcoming appointments for demo)
        setApprovalRequests(todayAppointments.slice(0, 4).map(a => ({
          id: a._id,
          name: `${a.patient_id?.first_name || ''} ${a.patient_id?.last_name || ''}`.trim(),
          treatment: a.type,
          time: formatApptTime(a),
          patient_image: a.patient_id?.patient_image || a.patient_id?.patientImage || null,
          hasVitals: hasVitals(a)
        })));

      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };

    if (doctorId) fetchDashboardStats();
  }, [doctorId, vitalsEnabled]);

  const handleStartAppointment = (appointment) => {
    if (vitalsEnabled && nextPatient && !nextPatient.hasVitals) {
      alert('Vitals need to be recorded before starting this appointment. Please ensure vitals are taken first.');
      return;
    }
    
    if (nextPatient && nextPatient.appointmentId) {
      navigate(`/dashboard/doctor/appointments/${nextPatient.appointmentId}`, {
        state: { appointment: nextPatient.appointmentData }
      });
    } else {
      navigate('/dashboard/doctor/appointments');
    }
  };

  const handleViewAppointments = () => {
    navigate('/dashboard/doctor/appointments');
  };

  // --- UI Components ---

  const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
      teal: 'bg-teal-50 text-teal-600 border-teal-100',
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
      <div className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${colors[color] || colors.teal} bg-white border-slate-100`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
            <Icon size={22} />
          </div>
        </div>
      </div>
    );
  };

  const VitalsIndicator = ({ hasVitals }) => {
    if (!vitalsEnabled) return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        {hasVitals ? (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
            <FaHeartbeat className="mr-1 h-2 w-2" />
            Vitals Ready
          </span>
        ) : (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center">
            <FaExclamationTriangle className="mr-1 h-2 w-2" />
            Needs Vitals
          </span>
        )}
      </div>
    );
  };

  const appointmentStats = [
    { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length },
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length }
  ];

  const departmentData = Object.entries(
    patients.reduce((acc, p) => {
      acc[p.department || 'General'] = (acc[p.department || 'General'] || 0) + 1;
      return acc;
    }, {})
  ).map(([key, value]) => ({ name: key, count: value }));

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.status === 'Completed' ? '#10b981' : '#0d9488',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      fontSize: '0.8rem'
    };
    return { style };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <style>{calendarStyles}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back, Dr. {name}</h1>
          <p className="text-slate-500 text-sm mt-1">Here is your daily activity digest.</p>
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
        <StatCard title="My Patients" value={stats.patients} icon={FaUsers} color="indigo" />
        <StatCard title="Today's Completed Consultations" value={stats.consultations} icon={FaUserInjured} color="blue" />
        <StatCard title="Procedures" value={stats.procedures} icon={FaTooth} color="rose" />
        <StatCard title="Today's Visits" value={stats.todayAppointments} icon={FaClock} color="teal" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

        {/* Left Column: Calendar (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Appointment Calendar</h2>
              <button onClick={() => setCurrentView(v => v === 'week' ? 'month' : 'week')} className="text-sm text-teal-600 font-semibold hover:underline">
                Switch to {currentView === 'week' ? 'Month' : 'Week'} View
              </button>
            </div>
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => {
                  setSelectedCalendarAppt(event.resource);
                  setIsApptModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Next Patient & Lists (1/3 width) */}
        <div className="space-y-8">

          {/* Next Patient Card */}
          <div className={`rounded-2xl shadow-lg p-6 text-white relative overflow-hidden ${
            nextPatient && vitalsEnabled && !nextPatient.hasVitals 
              ? 'bg-gradient-to-br from-amber-500 to-amber-700' 
              : 'bg-gradient-to-br from-teal-600 to-teal-800'
          }`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <FaUserInjured size={120} />
            </div>

            <h2 className="text-white/90 font-semibold text-sm uppercase tracking-wider mb-1">Next Upcoming Appointment</h2>
            <p className="text-white/80 mb-4 text-xs">
              {vitalsEnabled 
                ? nextPatient && !nextPatient.hasVitals 
                  ? "Vitals required before consultation"
                  : "Ready for consultation"
                : "Please wait for vitals to start."
              }
            </p>

            {nextPatient ? (
              <>
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  {nextPatient.patient_image ? (
                    <img
                      src={nextPatient.patient_image}
                      alt={`${nextPatient.first_name} ${nextPatient.last_name}`}
                      className="w-16 h-16 rounded-full object-cover backdrop-blur-sm border border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/30">
                      {nextPatient.first_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold leading-tight">
                      {nextPatient.first_name} {nextPatient.last_name}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">{nextPatient.treatment}</p>
                    <VitalsIndicator hasVitals={nextPatient.hasVitals} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm relative z-10 mb-6">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <p className="text-white/80 text-xs">Time</p>
                    <p className="font-semibold">{nextPatient.time}</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <p className="text-white/80 text-xs">Age / Gender</p>
                    <p className="font-semibold">{nextPatient.age || '--'} / {nextPatient.gender || '--'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    className={`w-full py-3 font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 ${
                      vitalsEnabled && !nextPatient.hasVitals
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-white text-teal-700 hover:bg-teal-50'
                    }`}
                    onClick={handleStartAppointment}
                    title={vitalsEnabled && !nextPatient.hasVitals ? "Vitals required before starting appointment" : "Start appointment"}
                  >
                    {vitalsEnabled && !nextPatient.hasVitals ? (
                      <>
                        <FaExclamationTriangle className="mr-1" />
                        NEEDS VITALS
                      </>
                    ) : (
                      <>
                        Start Consultation
                        <FaChevronRight size={12} />
                      </>
                    )}
                  </button>
                  
                  <button
                    className="w-full py-2 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors text-sm"
                    onClick={handleViewAppointments}
                  >
                    View All Appointments
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/80">No upcoming appointments scheduled for today.</p>
                <button
                  className="mt-4 py-2 px-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                  onClick={handleViewAppointments}
                >
                  View Appointments
                </button>
              </div>
            )}
          </div>

          {/* Recent Appointments List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Today's Appointments</h2>
              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-bold">{approvalRequests.length}</span>
            </div>

            <div className="space-y-4">
              {approvalRequests.length > 0 ? approvalRequests.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group">
                  <div className="flex items-center">
                    {req.patient_image ? (
                      <img src={req.patient_image} alt={req.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold mr-3">{req.name ? req.name.charAt(0) : '?'}</div>
                    )}
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{req.name}</p>
                      <p className="text-xs text-slate-500">{req.treatment} • {req.time}</p>
                      {vitalsEnabled && (
                        <div className="flex items-center gap-1 mt-1">
                          {req.hasVitals ? (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              Vitals ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              Needs Vitals
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                      onClick={() => navigate(`/dashboard/doctor/appointments`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-center text-sm py-4">No appointments for today</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Appointment Status Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={appointmentStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {appointmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#334155', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Patient Demographics</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Appointment Modal */}
      {isApptModalOpen && selectedCalendarAppt && (
        <AppointmentSlipModal
          isOpen={isApptModalOpen}
          onClose={() => setIsApptModalOpen(false)}
          appointmentData={selectedCalendarAppt}
          hospitalInfo={hospital}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;