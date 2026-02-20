import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaClock,
  FaUser,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaEye,
  FaCalendarAlt,
  FaHeartbeat,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaTimes
} from 'react-icons/fa';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [vitalsEnabled, setVitalsEnabled] = useState(() => {
    const stored = localStorage.getItem('vitalsEnabled');
    return stored === null ? true : stored === 'true';
  });
  const [showWithoutVitals, setShowWithoutVitals] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeDifference, setTimeDifference] = useState({ minutes: 0, isEarly: false });
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

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

  // Parse a UTC time string to Date object
  const parseStoredTime = (utcTimeString) => {
    if (!utcTimeString) return null;

    try {
      const date = new Date(utcTimeString);
      // The time is stored in UTC but represents local time
      // So we extract UTC components and create a local Date
      return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    } catch (error) {
      console.error('Error parsing time:', error);
      return null;
    }
  };

  // Check if appointment time is within 15 minutes
  const checkAppointmentTime = (appointment) => {
    const appointmentTime = parseStoredTime(appointment.start_time);
    if (!appointmentTime) return { isValid: true, minutes: 0, isEarly: false }; // If no time, allow

    const now = new Date();
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));

    return {
      isValid: Math.abs(minutesDiff) <= 15,
      minutes: Math.abs(minutesDiff),
      isEarly: minutesDiff > 0
    };
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          const v = res.data[0].vitalsEnabled !== undefined ? res.data[0].vitalsEnabled : true;
          setVitalsEnabled(v);
          localStorage.setItem('vitalsEnabled', v);
        }
      } catch (err) {
        console.error("Error fetching hospital settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      // Use the generic endpoint to ensure we get full details
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`);
      const allAppointments = response.data.appointments || response.data || [];

      // Filter by current doctor
      const myAppointments = allAppointments.filter(appt => {
        const dId = appt.doctor_id?._id || appt.doctor_id;
        return dId === doctorId;
      });

      // Sort appointments by date (most recent first)
      myAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

      setAppointments(myAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    }
  };

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

  // Calculate statistics
  const appointmentsWithVitals = appointments.filter(appt => hasVitals(appt)).length;
  const appointmentsWithoutVitals = appointments.length - appointmentsWithVitals;

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;

    // Vitals filtering logic
    const appointmentHasVitals = hasVitals(appt);

    let meetsVitalsRequirement;
    if (!vitalsEnabled) {
      // If vitals are disabled, show all
      meetsVitalsRequirement = true;
    } else if (showWithoutVitals) {
      // If showing without vitals is enabled, show all
      meetsVitalsRequirement = true;
    } else {
      // Otherwise, only show appointments with vitals
      meetsVitalsRequirement = appointmentHasVitals;
    }

    return matchesSearch && matchesStatus && meetsVitalsRequirement;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleViewDetails = (appointment) => {
    navigate(`/dashboard/doctor/appointments/${appointment._id}`, {
      state: { appointment }
    });
  };

  const handleStartClick = (appointment) => {
    // Check if vitals are required and not recorded
    const appointmentHasVitals = hasVitals(appointment);
    if (vitalsEnabled && !appointmentHasVitals) {
      alert('Please record vitals before starting the appointment.');
      return;
    }

    // Check appointment time
    const timeCheck = checkAppointmentTime(appointment);

    if (!timeCheck.isValid) {
      // Show warning modal
      setSelectedAppointment(appointment);
      setTimeDifference({
        minutes: timeCheck.minutes,
        isEarly: timeCheck.isEarly
      });
      setShowTimeWarning(true);
    } else {
      // Start appointment directly if within 15 minutes
      startAppointment(appointment);
    }
  };

  const startAppointment = async (appointment) => {
    const appointmentId = appointment._id || appointment;
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        status: 'In Progress'
      });
      const updatedAppointment = { ...appointment, status: 'In Progress' };
      navigate(`/dashboard/doctor/appointments/${appointmentId}`, {
        state: { appointment: updatedAppointment }
      });
    } catch (err) {
      console.error('Error starting appointment:', err);
      alert("Failed to start appointment. Please check console.");
    }
  };

  const handleConfirmStart = () => {
    if (selectedAppointment) {
      startAppointment(selectedAppointment);
    }
    setShowTimeWarning(false);
    setSelectedAppointment(null);
  };

  const handleCancelStart = () => {
    setShowTimeWarning(false);
    setSelectedAppointment(null);
  };

  // Custom Modal Component
  const TimeWarningModal = () => {
    if (!showTimeWarning) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancelStart}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center text-amber-600">
                <FaExclamationCircle className="mr-3 text-xl" />
                <span className="font-semibold text-lg">Time Check Required</span>
              </div>
              <button
                onClick={handleCancelStart}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                  <FaClock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {timeDifference.isEarly ? 'Starting Early' : 'Starting Late'}
                </h3>
                <p className="text-gray-600 mb-4">
                  This appointment is scheduled for{' '}
                  <span className="font-semibold">
                    {selectedAppointment && formatStoredTime(selectedAppointment.start_time)}
                  </span>
                </p>
                <div className={`text-2xl font-bold mb-4 ${timeDifference.isEarly ? 'text-blue-600' : 'text-red-600'}`}>
                  {timeDifference.isEarly
                    ? `${TimeIndicator2(selectedAppointment)} minutes early`
                    : `${TimeIndicator2(selectedAppointment)} minutes late`
                  }
                </div>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to start this appointment now?
                  <br />
                  <span className="text-amber-600 font-medium">
                    Recommended: Start within 15 minutes of scheduled time
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 space-x-3">
              <button
                onClick={handleCancelStart}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors ${timeDifference.isEarly
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Start Appointment Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- UI HELPER COMPONENTS ---

  const StatusBadge = ({ status }) => {
    const styles = {
      'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const VitalsIndicator = ({ appointment }) => {
    const hasVitalsData = hasVitals(appointment);

    if (!vitalsEnabled) {
      return null;
    }

    return (
      <div className="flex items-center mt-1">
        {hasVitalsData ? (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
            <FaHeartbeat className="mr-1 h-2 w-2" />
            Vitals Recorded
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

  const TimeIndicator2 = (appointment) => {
    const timeCheck = checkAppointmentTime(appointment);

    if (appointment.status !== 'Scheduled' || timeCheck.isValid) {
      return null;
    }

    const appointmentTime = parseStoredTime(appointment.start_time);
    if (!appointmentTime) return null;

    const now = new Date();
    const isPast = appointmentTime < now;
    const timeDiff = Math.abs(appointmentTime.getTime() - now.getTime());
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(minutesDiff / 60);
    const remainingMinutes = minutesDiff % 60;

    let timeText = '';
    if (hoursDiff > 0) {
      timeText = `${hoursDiff}h ${remainingMinutes}m`;
    } else {
      timeText = `${minutesDiff}m`;
    }

    return timeText;
  };

  const TimeIndicator = ({ appointment }) => {
    const timeCheck = checkAppointmentTime(appointment);

    if (appointment.status !== 'Scheduled' || timeCheck.isValid) {
      return null;
    }

    const appointmentTime = parseStoredTime(appointment.start_time);
    if (!appointmentTime) return null;

    const now = new Date();
    const isPast = appointmentTime < now;
    const timeDiff = Math.abs(appointmentTime.getTime() - now.getTime());
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(minutesDiff / 60);
    const remainingMinutes = minutesDiff % 60;

    let timeText = '';
    if (hoursDiff > 0) {
      timeText = `${hoursDiff}h ${remainingMinutes}m`;
    } else {
      timeText = `${minutesDiff}m`;
    }

    return (
      <div className="flex items-center mt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${isPast
            ? 'bg-red-50 text-red-600'
            : 'bg-blue-50 text-blue-600'
          }`}>
          <FaExclamationCircle className="mr-1 h-2 w-2" />
          {isPast ? `Started ${timeText} ago` : `Starts in ${timeText}`}
        </span>
      </div>
    );
  };

  const TabButton = ({ label, value, current, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`pb-3 px-4 text-sm font-medium transition-colors relative ${current === value
        ? 'text-teal-600'
        : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {label}
      {current === value && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-2 font-sans">
      {/* Custom Time Warning Modal */}
      <TimeWarningModal />

      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your patient schedule and consultations</p>
            {vitalsEnabled && (
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-gray-600">
                  Total: <span className="font-semibold">{appointments.length}</span> appointments
                </span>
                <span className="text-emerald-600">
                  With vitals: <span className="font-semibold">{appointmentsWithVitals}</span>
                </span>
                <span className="text-amber-600">
                  Without vitals: <span className="font-semibold">{appointmentsWithoutVitals}</span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {vitalsEnabled && (
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWithoutVitals}
                    onChange={(e) => setShowWithoutVitals(e.target.checked)}
                    className="mr-2 h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Show without vitals</span>
                </label>
              </div>
            )}
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <FaClock className="text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Controls Toolbar */}
          <div className="p-5 border-b border-gray-100 space-y-4">

            {/* Tabs Row */}
            <div className="flex items-center space-x-1 border-b border-gray-100 overflow-x-auto no-scrollbar">
              <TabButton label="All" value="all" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="Scheduled" value="Scheduled" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="In Progress" value="In Progress" current={filterStatus} onClick={setFilterStatus} />
              <TabButton label="Completed" value="Completed" current={filterStatus} onClick={setFilterStatus} />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <span className="hidden sm:inline">Show:</span>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10 rows</option>
                    <option value={20}>20 rows</option>
                    <option value={50}>50 rows</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appt) => {
                    const patientName = `${appt.patient_id?.first_name || 'Unknown'} ${appt.patient_id?.last_name || ''}`;
                    const apptDate = new Date(appt.appointment_date);
                    const hasVitalsData = hasVitals(appt);
                    const isScheduled = appt.status === 'Scheduled';
                    const timeCheck = checkAppointmentTime(appt);

                    return (
                      <tr
                        key={appt._id}
                        className={`hover:bg-gray-50/80 transition-colors group ${vitalsEnabled && !hasVitalsData ? 'bg-amber-50/30' : ''
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {appt.patient_id?.patient_image ? (
                              <img
                                src={appt.patient_id.patient_image}
                                alt={patientName}
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                                {patientName.charAt(0)}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patientName}</div>
                              <div className="text-xs text-gray-500">
                                {appt.patient_id?.gender || 'N/A'}, {appt.patient_id?.dob ?
                                  `${new Date().getFullYear() - new Date(appt.patient_id.dob).getFullYear()} yrs` : 'Age N/A'}
                              </div>
                              <VitalsIndicator appointment={appt} />
                              <TimeIndicator appointment={appt} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 h-3 w-3" />
                            {apptDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-5">
                            {formatStoredTime(appt.start_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700 capitalize bg-gray-100 px-2 py-1 rounded">
                              {appt.appointment_type || appt.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {appt.priority || 'Normal'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex items-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {isScheduled && (
                              <button
                                onClick={() => handleStartClick(appt)}
                                className={`flex items-center px-3 py-1.5 rounded-md transition-colors shadow-sm text-xs font-semibold tracking-wide ${vitalsEnabled && !hasVitalsData
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-not-allowed'
                                    : !timeCheck.isValid
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-teal-600 text-white hover:bg-teal-700'
                                  }`}
                                title={
                                  vitalsEnabled && !hasVitalsData ? "Vitals required before starting" :
                                    !timeCheck.isValid ? `Appointment ${timeCheck.isEarly ? 'starts' : 'started'} ${timeCheck.minutes} minutes ${timeCheck.isEarly ? 'later' : 'ago'}` :
                                      "Start appointment"
                                }
                              >
                                <FaPlay className="mr-1.5 h-2.5 w-2.5" />
                                {vitalsEnabled && !hasVitalsData ? 'NEEDS VITALS' :
                                  !timeCheck.isValid ? 'START' : 'START'}
                              </button>
                            )}
                            {(appt.status === "In Progress" || appt.status === "Completed") && (
                              <button
                                onClick={() => handleViewDetails(appt)}
                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaUser className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">No appointments found</p>
                        <p className="text-sm">
                          {vitalsEnabled && !showWithoutVitals
                            ? "Try enabling 'Show without vitals' or adjust your search"
                            : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> of <span className="font-medium">{filteredAppointments.length}</span> results
              {vitalsEnabled && (
                <span className="ml-2">
                  • <span className="text-emerald-600">{appointmentsWithVitals} with vitals</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${currentPage === i + 1
                      ? 'bg-teal-600 text-white shadow-sm font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;