import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search, Plus, Calendar, Clock, Filter,
  Eye, Edit2, Trash2, User, Stethoscope,
  CheckCircle, AlertCircle, X, ChevronDown,
  Activity, Building, CheckSquare, Clock as ClockIcon,
  ChevronUp, ChevronRight, ArrowUp, ArrowDown,
  Heart, Shield, UserCog, UserPlus
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
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [appointmentType, setAppointmentType] = useState(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);

  // Vitals configuration state
  const [vitalsConfig, setVitalsConfig] = useState({
    vitalsEnabled: true,
    vitalsController: 'nurse'
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState(null);
  const [userRole, setUserRole] = useState('staff');

  // Modal States
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('opd'); // Default to OPD
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  // Default Vitals (Normal Range / Standard placeholders)
  const defaultVitals = {
    bp: '120/80',
    weight: '70',
    pulse: '72',
    spo2: '98',
    temperature: '98.6',
    respiratory_rate: '16',
    random_blood_sugar: '100',
    height: '170'
  };

  // Vitals Form State
  const [vitals, setVitals] = useState(defaultVitals);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const hospitalID = localStorage.getItem('hospitalId') || userData.hospitalID;
    
    if (hospitalID) {
      setHospitalId(hospitalID);
      fetchVitalsConfig(hospitalID);
    }
    
    // Get user role
    if (userData.role) {
      setUserRole(userData.role);
    }

    if (patientType) {
      setAppointmentType(patientType);
    }
  }, [patientType]);

  // Fetch vitals configuration
  const fetchVitalsConfig = async (hospitalId) => {
    try {
      setConfigLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalId}/vitals-config`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setVitalsConfig(response.data);
    } catch (err) {
      console.error('Error fetching vitals config:', err);
      // Default to enabled if API fails
      setVitalsConfig({
        vitalsEnabled: true,
        vitalsController: 'nurse'
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // Listen for vitals config updates
  useEffect(() => {
    const handleVitalsUpdate = () => {
      if (hospitalId) {
        fetchVitalsConfig(hospitalId);
      }
    };

    window.addEventListener('vitals-updated', handleVitalsUpdate);
    return () => window.removeEventListener('vitals-updated', handleVitalsUpdate);
  }, [hospitalId]);

  // Check if current user can access vitals
  const canAccessVitals = () => {
    if (!vitalsConfig.vitalsEnabled) return false;
    return vitalsConfig.vitalsController === userRole;
  };

  // Get vitals access message
  const getVitalsAccessMessage = () => {
    if (!vitalsConfig.vitalsEnabled) {
      return {
        message: 'Vitals collection is currently disabled',
        color: 'gray',
        icon: Shield
      };
    }

    switch(vitalsConfig.vitalsController) {
      case 'doctor':
        return {
          message: 'Vitals are managed by Doctors',
          color: 'blue',
          icon: UserCog
        };
      case 'nurse':
        return {
          message: userRole === 'nurse' ? 'You have access to manage vitals' : 'Vitals are managed by Nurses',
          color: 'green',
          icon: UserPlus
        };
      // case 'registrar':
      //   return {
      //     message: userRole === 'registrar' ? 'You have access to manage vitals' : 'Vitals are managed by Registrars',
      //     color: 'purple',
      //     icon: User
      //   };
      default:
        return {
          message: 'Vitals access information',
          color: 'gray',
          icon: Shield
        };
    }
  };

  const getDateRangeFromFilter = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return { start: new Date(today), end: new Date(today) };
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: new Date(today) };
    } else if (dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: monthStart, end: new Date(today) };
    } else if (dateFilter === 'last30days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      return { start: start, end: new Date(today) };
    } else if (dateFilter === 'custom') {
      return {
        start: customStartDate ? new Date(customStartDate) : null,
        end: customEndDate ? new Date(customEndDate) : null,
      };
    }
    return { start: null, end: null };
  };

  // Helper function to format stored UTC time as local time
  const formatStoredTime = (utcTimeString) => {
    if (!utcTimeString) return 'N/A';

    try {
      const date = new Date(utcTimeString);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
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
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error getting time in minutes:', error);
      return 0;
    }
  };

  // Check if appointment is upcoming
  const isAppointmentUpcoming = (appointment) => {
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return false;
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.appointment_date);
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
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [appointmentRes, hospitalRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`, { headers }),
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
            time: formatStoredTime(appt.start_time),
            patientId: appt.patient_id?.patientId,
            type: appt.type || 'Consultation',
            timeInMinutes: timeInMinutes,
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
        completed.push(appt);
      }
    });

    return { completed, upcoming };
  };

  // Sort upcoming appointments by increasing time
  const sortUpcomingAppointments = (upcomingApps) => {
    return [...upcomingApps].sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.timeInMinutes - b.timeInMinutes;
    });
  };

  // Sort completed appointments by decreasing time
  const sortCompletedAppointments = (completedApps) => {
    return [...completedApps].sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      const dateDiff = dateB.getTime() - dateA.getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.timeInMinutes - a.timeInMinutes;
    });
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    let matchesDateFilter = true;
    if (dateFilter !== 'all') {
      const { start, end } = getDateRangeFromFilter();
      if (appointment.rawDate) {
        const appDate = new Date(appointment.rawDate);
        appDate.setHours(0, 0, 0, 0);
        if (start && appDate < start) matchesDateFilter = false;
        if (end && appDate > end) matchesDateFilter = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDateFilter;
  });

  const { completed: filteredCompleted, upcoming: filteredUpcoming } = separateAppointments(filteredAppointments);
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

  // Vitals handlers
  const handleVitalsClick = (appointment) => {
    if (!canAccessVitals()) {
      alert('You do not have permission to manage vitals.');
      return;
    }
    setSelectedAppointment(appointment);
    setVitals({
      bp: appointment.vitals?.bp || defaultVitals.bp,
      weight: appointment.vitals?.weight || defaultVitals.weight,
      pulse: appointment.vitals?.pulse || defaultVitals.pulse,
      spo2: appointment.vitals?.spo2 || defaultVitals.spo2,
      temperature: appointment.vitals?.temperature || defaultVitals.temperature,
      respiratory_rate: appointment.vitals?.respiratory_rate || defaultVitals.respiratory_rate,
      random_blood_sugar: appointment.vitals?.random_blood_sugar || defaultVitals.random_blood_sugar,
      height: appointment.vitals?.height || defaultVitals.height
    });
    setIsVitalsModalOpen(true);
  };

  const handleVitalsChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const submitVitals = async (e) => {
    e.preventDefault();
    
    if (!canAccessVitals()) {
      alert('Vitals access has been revoked or reassigned.');
      setIsVitalsModalOpen(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/appointments/${selectedAppointment._id}/vitals`,
        { ...vitals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Vitals updated successfully!');
      setIsVitalsModalOpen(false);
      
      // Refresh appointments to show updated vitals
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments`);
      setAppointments(response.data);
    } catch (err) {
      console.error('Error updating vitals:', err);
      alert('Failed to update vitals.');
    }
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
    setAppointments([newAppointment, ...appointments]);
    setChooserOpen(false);
    setSelectedAppointment(newAppointment);
    setIsViewModalOpen(true);
  };

  const handleCompleteClick = async (appointment, e) => {
    e.stopPropagation();
    if (appointment.status !== 'Completed') {
      // Handle completion logic here
    } else {
      setSelectedAppointment(appointment);
      setIsCompletionModalOpen(true);
    }
  };

  const renderAppointmentRow = (appointment, isUpcoming = false, index = 0) => {
    const vitalsAccess = canAccessVitals();
    const vitalsInfo = getVitalsAccessMessage();
    const vitalsFilled = appointment.vitals && Object.keys(appointment.vitals).length > 0;

    return (
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
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              vitalsFilled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <Heart size={12} className="mr-1" />
              {vitalsFilled ? 'Vitals Done' : 'Vitals Pending'}
            </span>
          </div>
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
            
            {vitalsAccess && (
              <button
                onClick={() => handleVitalsClick(appointment)}
                className={`p-2 rounded-lg transition-colors ${
                  vitalsFilled
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                }`}
                title={vitalsFilled ? 'Update Vitals' : 'Add Vitals'}
              >
                <Heart size={20} />
              </button>
            )}
            
            <button
              onClick={(e) => handleCompleteClick(appointment, e)}
              className={`p-2 rounded-lg transition-colors ${
                appointment.status === 'Completed'
                  ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                  : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title={appointment.status === 'Completed' ? "View Prescription" : "Complete Appointment"}
            >
              <CheckCircle size={20} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Show loading state while fetching config
  if (configLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const vitalsInfo = getVitalsAccessMessage();
  const VitalsIcon = vitalsInfo.icon;

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

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === 'custom' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Start"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="End"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => { setChooserOpen(true); setSelectedType('opd'); }} // Default to OPD
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vitals</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedUpcoming.map((appointment, index) => (
                      renderAppointmentRow(appointment, true, index)
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
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vitals</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedCompleted.map((appointment, index) => renderAppointmentRow(appointment, false, index))}
                      </tbody>
                    </table>

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
                      {searchTerm || dateFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating a new appointment'}
                    </p>
                  </div>
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

      {/* Appointment Creation Modal - Simplified (No Type Selection) */}
      {chooserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Schedule New Appointment</h3>
                <p className="text-xs text-slate-500">Fill in the details below</p>
              </div>
              <button onClick={() => setChooserOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white" style={{ maxHeight: '80vh' }}>
              <AddIPDAppointmentStaff
                embedded={true}
                type="opd" // Always OPD
                onClose={() => setChooserOpen(false)}
                onSuccess={handleAppointmentSuccess}
              />
            </div>
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

      {/* Vitals Modal */}
      {isVitalsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Vitals</h2>
            <p className="text-sm text-gray-500 mb-6">
              Patient: {selectedAppointment.patientName}
            </p>

            <form onSubmit={submitVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
                  <input
                    type="text" name="height" value={vitals.height} onChange={handleVitalsChange}
                    placeholder="e.g. 170"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="text" name="weight" value={vitals.weight} onChange={handleVitalsChange}
                    placeholder="e.g. 70"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Pressure</label>
                  <input
                    type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange}
                    placeholder="e.g. 120/80"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pulse (bpm)</label>
                  <input
                    type="text" name="pulse" value={vitals.pulse} onChange={handleVitalsChange}
                    placeholder="e.g. 72"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SPO2 (%)</label>
                  <input
                    type="text" name="spo2" value={vitals.spo2} onChange={handleVitalsChange}
                    placeholder="e.g. 98"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temperature (°F)</label>
                  <input
                    type="text" name="temperature" value={vitals.temperature} onChange={handleVitalsChange}
                    placeholder="e.g. 98.6"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RR (breaths/min)</label>
                  <input
                    type="text" name="respiratory_rate" value={vitals.respiratory_rate} onChange={handleVitalsChange}
                    placeholder="e.g. 16"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RBS (mg/dL)</label>
                  <input
                    type="text" name="random_blood_sugar" value={vitals.random_blood_sugar} onChange={handleVitalsChange}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentListStaff;