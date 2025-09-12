import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import AppointmentSlipModal from '@/components/appointments/AppointmentSlipModal';
import {
  FaUsers,
  FaCalendarCheck,
  FaTooth,
} from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const COLORS = ['#14b8a6', '#2dd4bf', '#5eead4'];

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
  const [currentView, setCurrentView] = useState("week");
  const [name, setName] = useState("");

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const calculateAge = (dob) => {
      if (!dob) return null;
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const formatApptTime = (appt) => {
      if (!appt) return null;
      // try multiple fields
      if (appt.start_time) return new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (appt.time) return String(appt.time);
      if (appt.time_slot) {
        return String(appt.time_slot).split('-')[0].trim();
      }
      // try startTime
      if (appt.startTime) return new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return null;
    };
    const fetchDashboardStats = async () => {
      try {
        console.log(doctorId)
        const [patientsRes, appointmentsRes, doctorsRes, calendarRes] = await Promise.all([
          
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/doctor/${doctorId}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/calendar/doctor/${doctorId}`)
        ]);
        console.log("API response for patients:", patientsRes.data); // Add this line
        const currentDoctor = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/${doctorId}`);

        setName(currentDoctor.data.firstName)
        const today = dayjs();
        const patients = patientsRes.data.patients || [];
        const appointments = appointmentsRes.data || [];
        setAppointments(appointments);
        setPatients(patients);
        setDoctors(doctorsRes.data);
        const todayAppointments = appointments.filter(appt =>
          dayjs(appt.appointment_date).isSame(today, 'day')
        );

        setStats({
          patients: patients.length,
          consultations: appointments.filter(a => a.type === 'Consultation').length,
          procedures: appointments.filter(a => a.type === 'Procedure').length,
          todayAppointments: todayAppointments.length,
        });

        if (todayAppointments.length > 0) {
          const appt = todayAppointments[0];
          const patient = appt.patient_id || {};
          setNextPatient({
            first_name: patient.first_name || patient.firstName || patient.name || '',
            last_name: patient.last_name || patient.lastName || '',
            phone: patient.phone || patient.mobile || '',
            gender: patient.gender || '',
            dob: patient.dob || patient.date_of_birth || null,
            age: calculateAge(patient.dob || patient.date_of_birth),
            treatment: appt.type,
            date: appt.appointment_date,
            time: formatApptTime(appt)
          });
        }

        // Build calendar events from appointments (preferred) so events show at booked times
        const appts = appointmentsRes.data || [];
        const events = [];

        const parseEventTimes = (appt) => {
          try {
            // appointment_date may be ISO date string
            const apptDate = appt.appointment_date ? new Date(appt.appointment_date) : (appt.created_at ? new Date(appt.created_at) : null);

            // helper to parse time-slot string like 'HH:MM - HH:MM' or 'HH:MM'
            const parseTimeSlot = (slotStr, which = 'start') => {
              if (!slotStr) return null;
              const parts = slotStr.split('-').map(s => s.trim());
              const timePart = which === 'start' ? parts[0] : (parts[1] || null);
              if (!timePart) return null;
              const [h, m] = timePart.split(':').map(x => parseInt(x, 10));
              if (isNaN(h)) return null;
              const dt = apptDate ? new Date(apptDate) : new Date();
              dt.setHours(h, isNaN(m) ? 0 : m, 0, 0);
              return dt;
            };

            // start priority: start_time | startTime | time_slot start
            let start = appt.start_time ? new Date(appt.start_time) : (appt.startTime ? new Date(appt.startTime) : null);
            if (!start && appt.time_slot) start = parseTimeSlot(appt.time_slot, 'start');
            if (!start && appt.appointment_date && appt.time) {
              // legacy fields
              const [h, m] = String(appt.time).split(':').map(x => parseInt(x, 10));
              start = new Date(appt.appointment_date);
              start.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
            }

            // end priority: end_time | endTime | time_slot end | duration
            let end = appt.end_time ? new Date(appt.end_time) : (appt.endTime ? new Date(appt.endTime) : null);
            if (!end && appt.time_slot) end = parseTimeSlot(appt.time_slot, 'end');
            if (!end && start) {
              const dur = appt.duration || 30;
              end = new Date(start.getTime() + (dur * 60 * 1000));
            }

            return { start, end };
          } catch (err) {
            return { start: null, end: null };
          }
        };

        appts.forEach(appt => {
          // only include appointments for this doctor
          const apptDoctorId = appt.doctor_id && (appt.doctor_id._id || appt.doctor_id);
          if (String(apptDoctorId) !== String(doctorId)) return;
          const { start, end } = parseEventTimes(appt);
          if (!start || !end) return; // skip ill-formed
          events.push({
            title: `${appt.patient_id?.first_name || appt.patientName || 'Appointment'}`,
            start,
            end,
            allDay: false,
            resource: appt
          });
        });

        setCalendarEvents(events);

        setApprovalRequests(todayAppointments.slice(1, 5).map(a => ({
          name: a.patient_id?.first_name || 'Unknown',
          treatment: a.type,
        })));
      } catch (error) {
        console.error('Failed to load doctor dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [doctorId]);

  const appointmentStats = [
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
    { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length }
  ];

  const patientByDepartment =  Array.isArray(patients) ? patients.reduce((acc, p) => {
    acc[p.department] = (acc[p.department] || 0) + 1;
    return acc;
  }, {}): {};

  const departmentData = Object.entries(patientByDepartment).map(([key, value]) => ({
    name: key,
    count: value
  }));

  return (
    <>
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back, Dr. {name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients" value={stats.patients} icon={<FaUsers />} color="teal" />
        <StatCard title="Consultations" value={stats.consultations} icon={<FaCalendarCheck />} color="blue" />
        <StatCard title="Procedures" value={stats.procedures} icon={<FaTooth />} color="red" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={<FaCalendarCheck />} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Professional Calendar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-teal-700">My Professional Calendar</h2>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={['month', 'week', 'day']}
          date={currentDate} // controlled date
          view={currentView} // controlled view
          onNavigate={(date) => setCurrentDate(date)} // navigation handler
          onView={(view) => setCurrentView(view)} // view change handler
          onSelectEvent={(event) => {
            const appt = event.resource || event;
            setSelectedCalendarAppt(appt);
            setIsApptModalOpen(true);
          }}
        />
      </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Next Patient Details</h2>
          {nextPatient ? (
            <div>
                  <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Patient" className="w-16 h-16 rounded-full" />
                    <div>
                      <div className="font-bold">{`${nextPatient.first_name || ''} ${nextPatient.last_name || ''}`.trim()}</div>
                      <div className="text-sm text-gray-600">{nextPatient.treatment} {nextPatient.time ? `• ${nextPatient.time}` : ''}</div>
                      {nextPatient.phone && <div className="text-xs text-gray-500">{nextPatient.phone}</div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                    <div>Appointment: <span className="font-semibold">{dayjs(nextPatient.date).format('DD.MM.YYYY')} {nextPatient.time ? `• ${nextPatient.time}` : ''}</span></div>
                    <div>Gender: {nextPatient.gender}</div>
                    <div>Age: {nextPatient.age ?? 'N/A'}</div>
                    <div>Phone: {nextPatient.phone || 'N/A'}</div>
                  </div>
            </div>
          ) : <div className="text-sm text-gray-500">No upcoming patient today.</div>}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Approval Requests</h2>
          <div className="space-y-2 text-sm">
            {approvalRequests.map((req, i) => (
              <div key={i} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <div className="font-semibold">{req.name}</div>
                  <div className="text-gray-500 text-xs">{req.treatment}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-green-600">✔</button>
                  <button className="text-red-600">✖</button>
                  <button className="text-blue-600">📩</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-teal-700">Appointment Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={appointmentStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {appointmentStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-teal-700">Patients by Department</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    {isApptModalOpen && selectedCalendarAppt && (
      <AppointmentSlipModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        appointmentData={selectedCalendarAppt}
        hospitalInfo={null}
      />
    )}
    </>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const bgMap = {
    teal: 'bg-teal-100 text-teal-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  };
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center">
      <div className={`w-12 h-12 ${bgMap[color]} rounded-full flex items-center justify-center mr-4`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
