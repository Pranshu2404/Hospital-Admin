import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, EditIcon, DeleteIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddAppointmentModal from './AddAppointmentModal';
import ChoosePatientTypeModal from '../patients/ChoosePatientTypeModal';
import { useLocation, useNavigate } from 'react-router-dom';
import ChoosePatientTypeModal2 from '../patients/ChoosePatientTypeModal2';

const AppointmentList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const patientType = params.get('type');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const { isOpen, openModal, closeModal } = useModal();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [appointmentType, setAppointmentType] = useState(null);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
  if (patientType) {
    setAppointmentType(patientType);
    setIsAddModalOpen(true);
  }
}, [patientType]);


  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`);
        const data = response.data;
        console.log(data)
        const enriched = data.map((appt) => ({
          ...appt,
          patientName: `${appt.patient_id.first_name} ${appt.patient_id.last_name}`,
          doctorName: `${appt.doctor_id.firstName ||""} ${appt.doctor_id.lastName||""}`,
          date: appt.appointment_date.slice(0, 10),
          time: appt.time_slot?.split(' - ')[0],
          duration: appt.time_slot?.split(' - ')[1] || 'N/A',
        }));

        setAppointments(enriched);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = !filterDate || appointment.date === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      Scheduled: 'bg-blue-100 text-blue-800',
      Confirmed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Completed: 'bg-gray-100 text-gray-800',
      Cancelled: 'bg-red-100 text-red-800',
      'No Show': 'bg-orange-100 text-orange-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPatientInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('');

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
              <p className="text-gray-600 mt-1">Manage patient appointments and schedules</p>
            </div>
            <Button variant="primary" onClick={openModal}>
              <PlusIcon />
              New Appointment
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient or doctor..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
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
                        <span className="text-teal-600 font-medium text-sm">
                          {getPatientInitials(appointment.patientName)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {appointment.patient_id._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                    <div className="text-sm text-gray-500">{appointment.department_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time} ({appointment.duration})</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.type || 'Consultation'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900 p-1 rounded">View</button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded"><EditIcon /></button>
                      <button className="text-red-400 hover:text-red-600 p-1 rounded"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by scheduling a new appointment.'}
              </p>
            </div>
          </div>
        )}
      </div>
      <ChoosePatientTypeModal2 isOpen={isOpen} onClose={closeModal} />
      <AddAppointmentModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  type={appointmentType}
/>
    </div>
  );
};

export default AppointmentList;
