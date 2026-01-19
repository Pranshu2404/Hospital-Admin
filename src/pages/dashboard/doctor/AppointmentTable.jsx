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
  FaExclamationTriangle
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
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

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

  // Helper function to check if appointment has vitals
  const hasVitals = (appointment) => {
    // Check if appointment has vitals data (populated from backend)
    if (appointment.vitals) {
      // Check if vitals object has any data
      const vitalFields = ['bp', 'weight', 'pulse', 'spo2', 'temperature', 
                          'respiratory_rate', 'random_blood_sugar', 'height'];
      
      return vitalFields.some(field => {
        const value = appointment.vitals[field];
        return value !== undefined && value !== null && value !== '' && value.trim() !== '';
      });
    }
    
    // Check if appointment has a separate vitals_id field (if populated)
    if (appointment.vitals_id) {
      // If vitals_id exists and has any field with data
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

  const handleStartAppointment = async (appointment) => {
    // Check if vitals are required and not recorded
    const appointmentHasVitals = hasVitals(appointment);
    if (vitalsEnabled && !appointmentHasVitals) {
      alert('Please record vitals before starting the appointment.');
      return;
    }

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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appt) => {
                    const patientName = `${appt.patient_id?.first_name || 'Unknown'} ${appt.patient_id?.last_name || ''}`;
                    const apptDate = new Date(appt.appointment_date);
                    const hasVitalsData = hasVitals(appt);
                    const isScheduled = appt.status === 'Scheduled';

                    return (
                      <tr 
                        key={appt._id} 
                        className={`hover:bg-gray-50/80 transition-colors group ${
                          vitalsEnabled && !hasVitalsData ? 'bg-amber-50/30' : ''
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 h-3 w-3" />
                            {apptDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-5">
                            {appt.start_time ? new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time not set'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {isScheduled && (
                              <button
                                onClick={() => handleStartAppointment(appt)}
                                className={`flex items-center px-3 py-1.5 rounded-md transition-colors shadow-sm text-xs font-semibold tracking-wide ${
                                  vitalsEnabled && !hasVitalsData
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-not-allowed'
                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                                }`}
                                title={vitalsEnabled && !hasVitalsData ? "Vitals required before starting" : "Start appointment"}
                              >
                                <FaPlay className="mr-1.5 h-2.5 w-2.5" /> 
                                {vitalsEnabled && !hasVitalsData ? 'NEEDS VITALS' : 'START'}
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(appt)}
                              className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
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