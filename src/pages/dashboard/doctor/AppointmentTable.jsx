import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIPDAppointment from '@/components/appointments/AddIPDAppointment';


const AppointmentTable = ({ }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // 'ipd' or 'opd'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/doctor/${doctorId}`);
        setAppointments(response.data || []);
        setLoading(false);
        console.log(response.data)
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const handleSave = async (data) => {
    try {
      const response = await axios.post('/api/appointments', data);
      setAppointments(prev => [...prev, response.data]);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating appointment:', err);
    }
  };

  const handleViewDetails = (appointment) => {
    navigate(`/doctor/appointments/${appointment._id}`, { 
      state: { appointment } 
    });
  };

  const filteredAppointments = Array.isArray(appointments) 
  ? appointments.filter(appt => {
      const patientName = `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`.toLowerCase();
      return patientName.includes(searchTerm.toLowerCase()) || 
             appt.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    })
  : [];

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-teal-600 font-semibold">Appointments</h2>
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg"
            onClick={() => { setChooserOpen(true); setSelectedType(null); }}
          >
            + Add Appointment
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <label>
            Show
            <select 
              className="ml-2 border rounded px-2 py-1"
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </label>
          <input 
            type="text" 
            placeholder="Search..." 
            className="border rounded px-3 py-1" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Patient Name</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Age</th>
                <th className="px-4 py-2">Date & Time</th>
                <th className="px-4 py-2">Diagnosis</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment) => {
                const dob = new Date(appointment.patient_id?.dob);
                const age = new Date().getFullYear() - dob.getFullYear();
                
                return (
                  <tr key={appointment._id}>
                    <td className="px-4 py-2">
                      {appointment.patient_id?.first_name} {appointment.patient_id?.last_name}
                    </td>
                    <td className="px-4 py-2 capitalize">{appointment.patient_id?.gender}</td>
                    <td className="px-4 py-2">{age}</td>
                    <td className="px-4 py-2">
                      {new Date(appointment.appointment_date).toLocaleDateString()} {appointment.time_slot}
                    </td>
                    <td className="px-4 py-2">{appointment.diagnosis || 'N/A'}</td>
                    <td className={`px-4 py-2 ${
                      appointment.status === 'Completed' ? 'text-green-600' : 
                      appointment.status === 'Cancelled' ? 'text-red-500' : 'text-teal-600'
                    }`}>
                      {appointment.status}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <p>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} entries</p>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-teal-600 text-white' : 'bg-white border'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {chooserOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
            {!selectedType ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">New Appointment</h3>
                <p className="text-sm text-gray-600 mb-4">Choose appointment type to schedule</p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded"
                    onClick={() => setSelectedType('ipd')}
                  >
                    IPD
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
                    onClick={() => setSelectedType('opd')}
                  >
                    OPD
                  </button>
                  <button
                    className="px-4 py-3 bg-gray-200 rounded text-sm"
                    onClick={() => setChooserOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Schedule {selectedType?.toUpperCase()} Appointment</h3>
                  <button className="text-sm text-gray-600" onClick={() => { setSelectedType(null); }}>
                    Back
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-auto -mx-6 px-6">
                  <AddIPDAppointment embedded={true} type={selectedType} fixedDoctorId={doctorId} onClose={() => setChooserOpen(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTable;