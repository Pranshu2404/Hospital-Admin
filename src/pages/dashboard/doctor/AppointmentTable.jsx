import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaUser, FaStethoscope, FaNotesMedical, FaCheckCircle } from 'react-icons/fa';

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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`);
      setAppointments(response.data || []);
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
    
    return matchesSearch && matchesStatus;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleViewDetails = (appointment) => {
    navigate(`/doctor/appointments/${appointment._id}`, { 
      state: { appointment } 
    });
  };

  const handleStartAppointment = async (appointmentId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        status: 'In Progress'
      });
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error starting appointment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-teal-600 font-semibold">My Appointments</h2>
          <div className="flex items-center space-x-4">
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
              {filteredAppointments.filter(a => a.status === 'Scheduled' || a.status === 'In Progress').length} in queue
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select 
              className="border rounded px-3 py-2"
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="border rounded px-3 py-2 md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAppointments.map((appointment) => {
                const patientName = `${appointment.patient_id?.first_name || ''} ${appointment.patient_id?.last_name || ''}`;
                const appointmentTime = new Date(appointment.appointment_date);
                
                return (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-teal-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patientName}</div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient_id?.gender}, {appointment.patient_id?.dob ? 
                              new Date().getFullYear() - new Date(appointment.patient_id.dob).getFullYear() : 'N/A'} yrs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {appointmentTime.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time_slot}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                      {appointment.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.priority === 'High' ? 'bg-red-100 text-red-800' :
                        appointment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(appointment.status)}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {appointment.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStartAppointment(appointment._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === i + 1 ? 'bg-teal-600 text-white' : ''
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;