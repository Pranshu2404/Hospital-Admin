import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search, Plus, Calendar, Clock, Filter,
  Eye, Edit2, Trash2, User, Stethoscope,
  CheckCircle, AlertCircle, X, ChevronDown,
  Activity, Building, CheckSquare, Clock as ClockIcon,
  ChevronUp, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AddIPDAppointment from './AddIPDAppointment';
import AppointmentSlipModal from './AppointmentSlipModal';
import AppointmentCompletionSlipModal from './AppointmentCompletionSlipModal';
import AddIPDAppointmentStaff from './AddIPDAppointmentStaff';

const AppointmentListStaff = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const patientType = params.get('type');

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [appointmentType, setAppointmentType] = useState(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);

  // Modal States
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    if (patientType) {
      setAppointmentType(patientType);
    }
  }, [patientType]);

  // Helper function to format stored UTC time as local time (treat UTC as IST)
  const formatStoredTime = (utcTimeString) => {
    if (!utcTimeString) return 'N/A';

    try {
      const date = new Date(utcTimeString);

      // Get UTC hours and minutes directly (since the time is stored in UTC but represents IST)
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();

      // Format as 12-hour time
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';

      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  // Get time in minutes from start_time string
  const getTimeInMinutes = (startTimeString) => {
    if (!startTimeString) return 0;

    try {
      const date = new Date(startTimeString);
      const hours = date.getUTCHours(); // Using UTC hours since time is stored as UTC
      const minutes = date.getUTCMinutes();
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error getting time in minutes:', error);
      return 0;
    }
  };

  // Check if appointment is upcoming (not completed and date/time is in future)
  const isAppointmentUpcoming = (appointment) => {
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return false;
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.appointment_date);

    // Set current time to compare with appointment time
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    appointmentDate.setHours(nowHours, nowMinutes, 0, 0);

    const appointmentTime = getTimeInMinutes(appointment.start_time);
    const appointmentDateTime = new Date(appointment.appointment_date);
    appointmentDateTime.setHours(Math.floor(appointmentTime / 60), appointmentTime % 60, 0, 0);

    return appointmentDateTime > now;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appointmentRes, hospitalRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`)
        ]);

        // Add enriched data for display
        const enriched = appointmentRes.data.map((appt) => {
          const timeInMinutes = getTimeInMinutes(appt.start_time);
          const appointmentDate = new Date(appt.appointment_date);

          return {
            ...appt,
            patientName: `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`.trim(),
            patientImage: appt.patient_id?.patient_image || null,
            doctorName: `Dr. ${appt.doctor_id?.firstName || ''} ${appt.doctor_id?.lastName || ''}`.trim(),
            departmentName: appt.department_id?.name || 'N/A',
            date: appointmentDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            rawDate: appt.appointment_date,
            // Use the formatStoredTime helper for proper time display
            time: formatStoredTime(appt.start_time),
            patientId: appt.patient_id?.patientId,
            // Fallback type if not present
            type: appt.type || 'Consultation',
            // Store time in minutes for sorting
            timeInMinutes: timeInMinutes,
            // Create a proper datetime for sorting
            datetime: new Date(appointmentDate.setHours(
              Math.floor(timeInMinutes / 60),
              timeInMinutes % 60,
              0,
              0
            ))
          };
        });

        setAppointments(enriched);
        setHospitalInfo(hospitalRes.data[0]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Separate appointments into completed and upcoming
  const separateAppointments = (appts) => {
    const completed = [];
    const upcoming = [];

    appts.forEach(appt => {
      if (appt.status === 'Completed' || appt.status === 'Cancelled') {
        completed.push(appt);
      } else if (isAppointmentUpcoming(appt)) {
        upcoming.push(appt);
      } else {
        // For appointments that are not completed but also not upcoming (like past appointments with other statuses)
        completed.push(appt);
      }
    });

    return { completed, upcoming };
  };

  // Sort upcoming appointments by increasing time (earliest first)
  const sortUpcomingAppointments = (upcomingApps) => {
    return [...upcomingApps].sort((a, b) => {
      // First sort by date (earliest date first)
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;

      // If same date, sort by time (earliest time first)
      return a.timeInMinutes - b.timeInMinutes;
    });
  };

  // Sort completed appointments by decreasing time (most recent first)
  const sortCompletedAppointments = (completedApps) => {
    return [...completedApps].sort((a, b) => {
      // First sort by date (most recent date first)
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      const dateDiff = dateB.getTime() - dateA.getTime();
      if (dateDiff !== 0) return dateDiff;

      // If same date, sort by time (latest time first)
      return b.timeInMinutes - a.timeInMinutes;
    });
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = !filterDate || new Date(appointment.rawDate).toISOString().slice(0, 10) === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Separate the filtered appointments
  const { completed: filteredCompleted, upcoming: filteredUpcoming } = separateAppointments(filteredAppointments);

  // Apply sorting
  const sortedUpcoming = sortUpcomingAppointments(filteredUpcoming);
  const sortedCompleted = sortCompletedAppointments(filteredCompleted);

  // Calculate quick stats
  const stats = {
    total: appointments.length,
    today: appointments.filter(a => new Date(a.rawDate).toDateString() === new Date().toDateString()).length,
    pending: appointments.filter(a => a.status === 'Scheduled').length,
    upcoming: filteredUpcoming.length,
    completed: filteredCompleted.length
  };

  const getStatusBadge = (status) => {
    const styles = {
      Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      Confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
      Cancelled: 'bg-red-50 text-red-700 border-red-200',
      Completed: 'bg-purple-50 text-purple-700 border-purple-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '??';

  const handleViewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleAppointmentSuccess = (newAppointment) => {
    // Add to list immediately
    setAppointments([newAppointment, ...appointments]);
    // Close creation modal
    setChooserOpen(false);
    // Show slip
    setSelectedAppointment(newAppointment);
    setIsViewModalOpen(true);
  };

  const handleCompleteClick = async (appointment, e) => {
    e.stopPropagation();
    if (appointment.status !== 'Completed') {
      // if (window.confirm('Mark this appointment as Completed and generate Completion Slip?')) {
      //   try {
      //     await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointment._id}`, { status: 'Completed' });

      //     // Update local state
      //     setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'Completed' } : a));

      //     // Open completion slip
      //     setSelectedAppointment({ ...appointment, status: 'Completed' });
      //     setIsCompletionModalOpen(true);
      //   } catch (error) {
      //     console.error('Error completing appointment:', error);
      //     alert('Failed to update status. Please try again.');
      //   }
      // }
    } else {
      // Already completed, just show slip
      setSelectedAppointment(appointment);
      setIsCompletionModalOpen(true);
    }
  };

  // Updated renderAppointmentRow function to accept index parameter
  const renderAppointmentRow = (appointment, isUpcoming = false, index = 0) => (
    <tr key={appointment._id} className="hover:bg-slate-50/80 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 mr-3 overflow-hidden">
            {appointment.patientImage ? (
              <img src={appointment.patientImage} alt={appointment.patientName} className="h-full w-full object-cover" />
            ) : (
              getInitials(appointment.patientName)
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">{appointment.patientName}</div>
            <div className="text-xs text-slate-500 font-mono">ID: {appointment.patientId || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="mr-2 text-slate-400"><Stethoscope size={14} /></div>
          <span className="text-sm text-slate-700 font-medium">{appointment.doctorName}</span>
        </div>
        <div className="text-xs text-slate-400 ml-6">{appointment.departmentName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar size={12} className="text-slate-400" /> {appointment.date}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            {appointment.type === 'number-based' ? (
              <span className="font-bold text-slate-700">#{appointment.serial_number} (Queue)</span>
            ) : (
              <>
                <Clock size={12} className="text-slate-400" /> {appointment.time}
              </>
            )}
            {isUpcoming && index === 0 && (
              <span className="inline-flex items-center gap-0.5 bg-teal-50 text-teal-600 text-xs px-1.5 py-0.5 rounded border border-teal-100">
                <ArrowUp size={10} /> Next
              </span>
            )}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
          {appointment.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(appointment.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleViewClick(appointment)}
            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="View Slip"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={(e) => handleCompleteClick(appointment, e)}
            className={`p-2 rounded-lg transition-colors ${appointment.status === 'Completed'
              ? 'text-green-600 bg-green-50 hover:bg-green-100'
              : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
              }`}
            title={appointment.status === 'Completed' ? "View Doctor's Prescription" : "Doctor's Prescription"}
          >
            <CheckCircle size={20} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-2 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointment Management</h1>
            <p className="text-slate-500 mt-1">Track and manage patient visits efficiently.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Calendar size={16} /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                <p className="text-lg font-bold text-slate-800 leading-none">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="p-1.5 bg-teal-50 text-teal-600 rounded-md"><ClockIcon size={16} /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Upcoming</p>
                <p className="text-lg font-bold text-slate-800 leading-none">{stats.upcoming}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded-md"><CheckSquare size={16} /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Completed</p>
                <p className="text-lg font-bold text-slate-800 leading-none">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patient or doctor..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              />
            </div>

            <button
              onClick={() => { setChooserOpen(true); setSelectedType(null); }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus size={18} /> New Appointment
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {/* Section 1: Upcoming Appointments */}
            {sortedUpcoming.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="px-6 py-3 bg-teal-50/50 border-b border-teal-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon size={16} className="text-teal-600" />
                      <h3 className="font-bold text-teal-700 text-sm uppercase tracking-wider">Upcoming Appointments ({sortedUpcoming.length})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} /> Schedule
                          <ArrowUp size={10} className="text-teal-500" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedUpcoming.map((appointment, index) => (
                      <React.Fragment key={appointment._id}>
                        {renderAppointmentRow(appointment, true, index)}
                        {index === 0 && sortedUpcoming.length > 1 && (
                          <tr className="border-t-2 border-teal-100">
                            <td colSpan="6" className="px-6 py-1 bg-teal-25">
                              <div className="text-xs text-teal-500 font-medium">
                                ↑ Earliest appointment today
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Section 2: Completed Appointments (Collapsible) */}
            {sortedCompleted.length > 0 && (
              <div>
                <button
                  onClick={() => setCompletedCollapsed(!completedCollapsed)}
                  className="w-full px-6 py-3 bg-green-50/50 border-b border-green-100 hover:bg-green-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-green-600" />
                    <h3 className="font-bold text-green-700 text-sm uppercase tracking-wider">
                      Past Appointments ({sortedCompleted.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {completedCollapsed ? (
                      <ChevronRight size={20} className="text-green-500 group-hover:text-green-600 transition-colors ml-2" />
                    ) : (
                      <ChevronUp size={20} className="text-green-500 group-hover:text-green-600 transition-colors ml-2" />
                    )}
                  </div>
                </button>

                {!completedCollapsed && (
                  <>
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} /> Schedule
                              <ArrowDown size={10} className="text-green-500" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedCompleted.map((appointment, index) => renderAppointmentRow(appointment, false, index))}
                      </tbody>
                    </table>

                    {/* Collapse Footer */}
                    <div className="px-6 py-2 border-t border-slate-100 bg-green-25 flex justify-center">
                      <button
                        onClick={() => setCompletedCollapsed(true)}
                        className="text-xs text-green-500 hover:text-green-600 font-medium flex items-center gap-1 py-1"
                      >
                        <ChevronUp size={12} />
                        Collapse Completed Appointments
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* No Appointments Found */}
            {sortedUpcoming.length === 0 && sortedCompleted.length === 0 && (
              <div className="w-full">
                <div className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">No appointments found</h3>
                    <p className="text-slate-500 text-sm">
                      {searchTerm || filterDate ? 'Try adjusting your filters' : 'Get started by creating a new appointment'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Only Completed Section is collapsed and no upcoming appointments */}
            {sortedUpcoming.length === 0 && sortedCompleted.length > 0 && completedCollapsed && (
              <div className="px-6 py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-green-50 p-4 rounded-full mb-3">
                    <CheckSquare size={32} className="text-green-300" />
                  </div>
                  <h3 className="text-slate-800 font-medium mb-1">Completed Appointments Collapsed</h3>
                  <p className="text-slate-500 text-sm">
                    Click on the "Completed Appointments" header above to expand and view {sortedCompleted.length} completed appointments
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredAppointments.length}</span> results
              {sortedUpcoming.length > 0 && sortedCompleted.length > 0 && (
                <span className="ml-2">
                  (<span className="text-teal-600">{sortedUpcoming.length} upcoming</span>,
                  <span className="text-green-600"> {sortedCompleted.length} completed</span>)
                  {completedCollapsed && sortedCompleted.length > 0 && (
                    <span className="text-green-400 ml-2"></span>
                  )}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded cursor-not-allowed">Previous</button>
              <button disabled className="px-3 py-1 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Type Selection Modal --- */}
      {chooserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden transform transition-all ${selectedType ? "max-w-5xl" : "max-w-3xl"}`}>

            {!selectedType ? (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800">New Appointment</h3>
                  <p className="text-slate-500 mt-1">Select the type of appointment you want to schedule</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setSelectedType('opd')}
                    className="group relative p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 bg-white hover:bg-blue-50/30 transition-all duration-300 text-left"
                  >
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Stethoscope size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">OPD Appointment</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Outpatient Department consultation for general checkups and visits.</p>
                  </button>

                  <button
                    onClick={() => setSelectedType('ipd')}
                    className="group relative p-6 rounded-xl border-2 border-slate-100 hover:border-teal-500 bg-white hover:bg-teal-50/30 transition-all duration-300 text-left"
                  >
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">IPD Admission</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Inpatient Department admission for surgeries, wards, and long-term care.</p>
                  </button>
                </div>

                <button
                  onClick={() => setChooserOpen(false)}
                  className="mt-8 mx-auto block text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-[80vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedType(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <ChevronDown className="rotate-90" size={20} />
                    </button>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Schedule {selectedType.toUpperCase()}</h3>
                      <p className="text-xs text-slate-500">Fill in the details below</p>
                    </div>
                  </div>
                  <button onClick={() => setChooserOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <AddIPDAppointmentStaff
                    embedded={true}
                    type={selectedType}
                    onClose={() => setChooserOpen(false)}
                    onSuccess={handleAppointmentSuccess}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Slip Modal */}
      <AppointmentSlipModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedAppointment(null); }}
        appointmentData={selectedAppointment}
        hospitalInfo={hospitalInfo}
      />

      {/* Completion Slip Modal */}
      <AppointmentCompletionSlipModal
        isOpen={isCompletionModalOpen}
        onClose={() => { setIsCompletionModalOpen(false); setSelectedAppointment(null); }}
        appointmentData={selectedAppointment}
        hospitalInfo={hospitalInfo}
      />
    </div>
  );
};

export default AppointmentListStaff;