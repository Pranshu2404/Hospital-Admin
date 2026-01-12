import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaClock,
  FaUser,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      // Use the generic endpoint to ensure we get full details including vitals
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`);
      const allAppointments = response.data.appointments || response.data || [];

      // Filter by current doctor
      const myAppointments = allAppointments.filter(appt => {
        const dId = appt.doctor_id?._id || appt.doctor_id;
        return dId === doctorId;
      });

      setAppointments(myAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;

    // Only show appointments where vitals have been recorded
    // Checks if vitals object exists and has at least one property (e.g. bp, weight)
    const hasVitals = appt.vitals &&
      (appt.vitals.bp || appt.vitals.weight || appt.vitals.pulse ||
        appt.vitals.response || Object.keys(appt.vitals).length > 0);

    return matchesSearch && matchesStatus && hasVitals;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleViewDetails = (appointment) => {
    navigate(`/doctor/appointments/${appointment._id}`, {
      state: { appointment }
    });
  };

  const handleStartAppointment = async (appointment) => {
    const appointmentId = appointment._id || appointment;
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        status: 'In Progress'
      });
      const updatedAppointment = { ...appointment, status: 'In Progress' };
      navigate(`/doctor/appointments/${appointmentId}`, {
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
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <FaClock className="text-teal-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
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

                    return (
                      <tr key={appt._id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                              {patientName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patientName}</div>
                              <div className="text-xs text-gray-500">
                                {appt.patient_id?.gender || 'N/A'}, {appt.patient_id?.dob ?
                                  `${new Date().getFullYear() - new Date(appt.patient_id.dob).getFullYear()} yrs` : 'Age N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 h-3 w-3" />
                            {apptDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-5">
                            {appt.time_slot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 capitalize bg-gray-100 px-2 py-1 rounded text-xs">
                            {appt.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {appt.status === 'Scheduled' && (
                              <button
                                onClick={() => handleStartAppointment(appt)}
                                className="flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm text-xs font-semibold tracking-wide"
                              >
                                <FaPlay className="mr-1.5 h-2.5 w-2.5" /> START
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(appt)}
                              className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all tooltip"
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
                        <p className="text-sm">Try adjusting your search or filters</p>
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