import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, EditIcon, DeleteIcon, ViewIcon } from '../common/Icons';
import AddIPDAppointment from './AddIPDAppointment';
import { useLocation } from 'react-router-dom';
import AppointmentSlipModal from './AppointmentSlipModal';

const AppointmentList = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const patientType = params.get('type');

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    if (patientType) {
      setAppointmentType(patientType);
    }
  }, [patientType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appointmentRes, hospitalRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`)
        ]);

        // Add patientId to the enriched data
        const enriched = appointmentRes.data.map((appt) => ({
          ...appt,
          patientName: `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`.trim(),
          doctorName: `Dr. ${appt.doctor_id?.firstName || ''} ${appt.doctor_id?.lastName || ''}`.trim(),
          departmentName: appt.department_id?.name || 'N/A',
          date: new Date(appt.appointment_date).toLocaleDateString(),
          time: appt.time_slot?.split(' - ')[0] || 'N/A',
          patientId: appt.patient_id?.patientId
        }));
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

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = !filterDate || new Date(appointment.appointment_date).toISOString().slice(0, 10) === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusClasses = { 
      Scheduled: 'bg-blue-100 text-blue-800', 
      Confirmed: 'bg-green-100 text-green-800', 
      Cancelled: 'bg-red-100 text-red-800',
      Completed: 'bg-purple-100 text-purple-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPatientInitials = (name) => name?.split(' ').map((n) => n[0]).join('') || '';

  const handleViewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
              <p className="text-gray-600 mt-1">Manage patient appointments and schedules</p>
            </div>
            <Button variant="primary" onClick={() => { setChooserOpen(true); setSelectedType(null); }}>
              <PlusIcon /> New Appointment
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by patient or doctor..." className="flex-1"/>
            <div className="flex gap-2">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"/>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-medium text-sm">{getPatientInitials(appointment.patientName)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {appointment.patientId || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{appointment.type || 'Consultation'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewClick(appointment)} className="text-gray-500 hover:text-blue-600 p-1" title="View Slip">
                        <ViewIcon />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 p-1" title="Edit">
                        <EditIcon />
                      </button>
                      <button className="text-gray-500 hover:text-red-600 p-1" title="Delete">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAppointments.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterDate ? 'Try adjusting your search or filter criteria.' : 'Get started by scheduling a new appointment.'}
            </p>
          </div>
        )}
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
                  <AddIPDAppointment embedded={true} type={selectedType} onClose={() => setChooserOpen(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <AppointmentSlipModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        appointmentData={selectedAppointment}
        hospitalInfo={hospitalInfo}
      />
    </div>
  );
};

export default AppointmentList;