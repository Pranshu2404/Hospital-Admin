import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUserMd,
  FaNotesMedical,
  FaCalendarCheck,
  FaUser
} from "react-icons/fa";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Inject custom styles for the calendar to override default library styles
const calendarStyles = `
  .rbc-calendar { font-family: inherit; color: #475569; }
  .rbc-header { padding: 12px; font-weight: 600; color: #0d9488; border-bottom: 2px solid #f1f5f9; }
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .rbc-off-range-bg { background: #f8fafc; }
  .rbc-today { background-color: #f0fdfa; }
  .rbc-event { border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .rbc-toolbar { margin-bottom: 20px; }
  .rbc-time-content { border-top: 1px solid #e2e8f0; }
  .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9; }
  .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
`;

const localizer = momentLocalizer(moment);

const SchedulePage = () => {
  const navigate = useNavigate();
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("day");

  const doctorId = localStorage.getItem("doctorId");

  // Custom Toolbar Component
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
      setCurrentDate(moment(currentDate).subtract(1, currentView === 'week' ? 'weeks' : currentView === 'day' ? 'days' : 'months').toDate());
    };
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
      setCurrentDate(moment(currentDate).add(1, currentView === 'week' ? 'weeks' : currentView === 'day' ? 'days' : 'months').toDate());
    };
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
      setCurrentDate(new Date());
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="text-lg font-bold text-slate-700 capitalize">
          {date.format('MMMM YYYY')}
        </span>
      );
    };

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={goToBack} className="p-2 hover:bg-white hover:text-teal-600 rounded-md transition-all text-slate-500">
              <FaChevronLeft />
            </button>
            <button onClick={goToCurrent} className="px-4 text-sm font-semibold hover:bg-white hover:text-teal-600 rounded-md transition-all text-slate-600">
              Today
            </button>
            <button onClick={goToNext} className="p-2 hover:bg-white hover:text-teal-600 rounded-md transition-all text-slate-500">
              <FaChevronRight />
            </button>
          </div>
          {label()}
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          {['month', 'week', 'day'].map(view => (
            <button
              key={view}
              onClick={() => {
                toolbar.onView(view);
                setCurrentView(view);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                currentView === view 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!doctorId) {
          setError("Doctor ID not found");
          setLoading(false);
          return;
        }

        const appointmentsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`
        );

        if (Array.isArray(appointmentsRes.data)) {
          const appts = appointmentsRes.data;

          const parseEventTimes = (appt) => {
            try {
              // ... (Keep existing complex parsing logic)
              const apptDate = appt.appointment_date 
                ? new Date(appt.appointment_date) 
                : (appt.created_at ? new Date(appt.created_at) : null);

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

              let start = appt.start_time ? new Date(appt.start_time) : (appt.startTime ? new Date(appt.startTime) : null);
              if (!start && appt.time_slot) start = parseTimeSlot(appt.time_slot, 'start');
              
              let end = appt.end_time ? new Date(appt.end_time) : (appt.endTime ? new Date(appt.endTime) : null);
              if (!end && appt.time_slot) end = parseTimeSlot(appt.time_slot, 'end');
              if (!end && start) {
                const dur = appt.duration || 30;
                end = new Date(start.getTime() + (dur * 60 * 1000));
              }

              return { start, end };
            } catch (err) {
              console.error('Error parsing event times:', err);
              return { start: null, end: null };
            }
          };

          const events = [];
          const upcoming = [];
          const today = dayjs();

          appts.forEach(appt => {
            const { start, end } = parseEventTimes(appt);
            if (!start || !end) return;

            events.push({
              title: `${appt.patient_id?.first_name || 'Patient'} - ${appt.type || 'Visit'}`,
              start,
              end,
              allDay: false,
              resource: appt,
              status: appt.status
            });

            if (dayjs(start).isAfter(today) && appt.status !== 'Cancelled') {
              upcoming.push({
                id: appt._id,
                patient: `${appt.patient_id?.first_name || 'Unknown'} ${appt.patient_id?.last_name || ''}`.trim(),
                date: dayjs(start).format('MMM D, YYYY'), // Better format
                time: dayjs(start).format('h:mm A'), // Better format
                rawDate: start,
                status: appt.status,
                type: appt.type
              });
            }
          });

          setCalendarEvents(events);
          setUpcomingAppointments(upcoming.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)));

          // Simplified Weekly Schedule Logic for Demo
          // In a real app, this should probably come from a separate 'Doctor Availability' endpoint
          const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const schedule = daysOfWeek.map(day => {
            // Check if there are appointments on this day name to simulate availability
            // Or just hardcode a standard schedule if backend data isn't specifically for "Availability settings"
            const hasAppts = appts.some(a => dayjs(a.appointment_date).format('dddd') === day);
            return {
              day,
              time: day === 'Sunday' ? 'Off' : '09:00 AM - 05:00 PM',
              isOff: day === 'Sunday'
            };
          });
          setWeeklySchedule(schedule);

        } else {
          setCalendarEvents([]);
          setUpcomingAppointments([]);
          setWeeklySchedule([]);
        }
      } catch (err) {
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchData();
    }
  }, [doctorId]);

  const eventStyleGetter = (event) => {
    const statusColors = {
      'Completed': { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      'In Progress': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
      'Pending': { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' },
      'Scheduled': { bg: '#ccfbf1', text: '#115e59', border: '#5eead4' },
      'Cancelled': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
    };
    
    const theme = statusColors[event.status] || statusColors['Scheduled'];

    return {
      style: {
        backgroundColor: theme.bg,
        color: theme.text,
        borderLeft: `4px solid ${theme.border}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '4px',
        opacity: 1,
        fontSize: '0.85rem',
        fontWeight: '500',
        padding: '2px 5px'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Syncing calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex justify-center items-start">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-lg text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <FaNotesMedical className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Schedule</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 md:p-2 font-sans">
      <style>{calendarStyles}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaCalendarCheck className="text-teal-600" /> Doctor Schedule
          </h1>
          <p className="text-slate-500 mt-1">Manage your availability and view upcoming sessions</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
          <FaClock className="text-teal-500" />
          <span className="font-medium text-sm">{moment().format('dddd, MMMM Do YYYY')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Weekly Availability Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-teal-500" /> Weekly Availability
          </h2>
          <div className="space-y-3">
            {weeklySchedule.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                <span className={`font-medium ${item.isOff ? 'text-slate-400' : 'text-slate-700'}`}>
                  {item.day}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  item.isOff 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-teal-50 text-teal-700 border border-teal-100'
                }`}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaUserMd className="text-teal-500" /> Upcoming Appointments
              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full ml-2">
                {upcomingAppointments.length}
              </span>
            </h2>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {upcomingAppointments.map((appt) => (
                <div 
                  key={appt.id} 
                  onClick={() => navigate('/dashboard/doctor/appointments')}
                  className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md hover:border-teal-200 transition-all duration-300 group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm border border-slate-100 mr-4 shrink-0 font-bold text-lg">
                    {appt.patient.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                      {appt.patient}
                    </h4>
                    <div className="flex items-center text-xs text-slate-500 mt-1 gap-3">
                      <span className="flex items-center gap-2"><FaCalendarAlt /> {appt.date}</span>
                      <span className="flex items-center gap-1"><FaClock /> {appt.time}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                    appt.status === 'Scheduled' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {appt.type || 'Visit'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FaUser className="text-slate-300 text-3xl mb-2" />
              <p className="text-slate-500 text-sm font-medium">No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Calendar Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar
          }}
          views={["month", "week", "day"]}
          date={currentDate}
          view={currentView}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(view) => setCurrentView(view)}
          onSelectEvent={(event) => navigate('/dashboard/doctor/appointments')}
        />
      </div>
    </main>
  );
};

export default SchedulePage;