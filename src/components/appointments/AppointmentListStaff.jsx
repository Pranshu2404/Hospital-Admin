import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search, Plus, Calendar, Clock, Filter,
  Eye, Edit2, Trash2, User, Stethoscope,
  CheckCircle, AlertCircle, X, ChevronDown,
  Activity, Building
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AddIPDAppointment from './AddIPDAppointment';
import AppointmentSlipModal from './AppointmentSlipModal';
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

  // Modal States
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
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

        // Add enriched data for display
        const enriched = appointmentRes.data.map((appt) => ({
          ...appt,
          patientName: `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`.trim(),
          doctorName: `Dr. ${appt.doctor_id?.firstName || ''} ${appt.doctor_id?.lastName || ''}`.trim(),
          departmentName: appt.department_id?.name || 'N/A',
          date: new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: appt.appointment_date,
          time: appt.start_time
            ? new Date(appt.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : (typeof appt.time_slot === 'string'
              ? appt.time_slot.split(' - ')[0]
              : (appt.time_slot && appt.time_slot.start_time
                ? new Date(appt.time_slot.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : (appt.time || 'N/A'))),
          patientId: appt.patient_id?.patientId,
          // Fallback type if not present
          type: appt.type || 'Consultation'
        }));

        // Sort by date descending
        enriched.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

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
    const matchesDate = !filterDate || new Date(appointment.rawDate).toISOString().slice(0, 10) === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate quick stats
  const stats = {
    total: appointments.length,
    today: appointments.filter(a => new Date(a.rawDate).toDateString() === new Date().toDateString()).length,
    pending: appointments.filter(a => a.status === 'Scheduled').length
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

  return (
    <div className="p-2 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointment Management</h1>
            <p className="text-slate-500 mt-1">Track and manage patient visits efficiently.</p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Calendar size={16} /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                <p className="text-lg font-bold text-slate-800 leading-none">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="p-1.5 bg-teal-50 text-teal-600 rounded-md"><Clock size={16} /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Today</p>
                <p className="text-lg font-bold text-slate-800 leading-none">{stats.today}</p>
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
                  {/* <option value="Confirmed">Confirmed</option> */}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 mr-3">
                            {getInitials(appointment.patientName)}
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
                            <Clock size={12} className="text-slate-400" /> {appointment.time}
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
                          {/* <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                          <Calendar size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-800 font-medium mb-1">No appointments found</h3>
                        <p className="text-slate-500 text-sm">
                          {searchTerm || filterDate ? 'Try adjusting your filters' : 'Get started by creating a new appointment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Static for now) */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-700">{filteredAppointments.length}</span> results</p>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all">

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
    </div>
  );
};

export default AppointmentListStaff;