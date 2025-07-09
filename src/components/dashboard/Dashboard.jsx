import { useState, useEffect } from 'react';
import { StatsGrid } from '../common/StatCards';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { adminSidebar } from '../../constants/sidebarItems/adminSidebar'; 

import {
  PatientIcon,
  AppointmentIcon,
  DoctorsIcon,
  FinanceIcon,
  PlusIcon,
} from '../common/Icons';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, staffRes, appointmentsRes, doctorRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/staff`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`),
        ]);

        const patients = patientsRes.data || [];
        const staff = staffRes.data || [];
        const appointments = appointmentsRes.data || [];
        const doctors = doctorRes.data || [];

        setStats([
  {
    title: 'Total Patients',
    value: patients.length.toString(),
    change: '',
    icon: <PatientIcon />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    clickable: true,
    route: '/dashboard/admin/patient-list',
  },
  {
    title: "Today's Appointments",
    value: appointments.filter(a => dayjs(a.date).isSame(dayjs(), 'day')).length.toString(),
    change: '',
    icon: <AppointmentIcon />,
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    clickable: true,
    route: '/dashboard/admin/appointments',
  },
  {
    title: 'Active Staff',
    value: staff.length.toString(),
    change: '',
    icon: <DoctorsIcon />,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    clickable: true,
    route: '/dashboard/admin/staff-list',
  },
  {
    title: 'Doctors',
    value: doctors.length.toString(),
    change: '',
    icon: <FinanceIcon />,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    clickable: true,
    route: '/dashboard/admin/doctor-list',
  },
]);


        console.log(appointments);

        const sortedAppointments = [...appointments]
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5)
          .map((a) => ({
            id: a._id,
            patientName: a.patient_id?.first_name || 'Unknown',
            service: a.type || 'Consultation',
            time: dayjs(a.appointment_date).format('hh:mm A'),
            doctor: a.doctor_id?.firstName || 'Dr. Unknown',
            status: a.status || 'Scheduled',
            initials: a.patient_id?.first_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'NA',
          }));

        setRecentAppointments(sortedAppointments);
      } catch (err) {
        console.error('❌ Failed fetching dashboard stats:', err);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients?limit=1&sort=desc`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments?limit=1&sort=desc`),
        ]);

        const patient = patientsRes.data[0];
        const appointment = appointmentsRes.data[0];
        console.log('Recent Patient:', patient);
        const activities = [];

        if (patient) {
          activities.push({
            id: patient._id,
            user: patient.created_by || 'Admin',
            action: 'added a new patient',
            target: patient.first_name,
            time: dayjs(patient.createdAt).fromNow(),
            type: 'create',
          });
        }

        if (appointment) {
          activities.push({
            id: appointment._id,
            action: 'Appointment completed for',
            target: appointment.patient_id?.first_name || 'Unknown',
            time: dayjs(appointment.updatedAt).fromNow(),
            type: 'complete',
          });
        }

        setRecentActivities(activities);
      } catch (err) {
        console.error('❌ Failed fetching recent activities:', err);
      }
    };

    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const handleStatClick = (stat) => {
  if (stat.clickable && stat.route) {
    navigate(stat.route);
  }
};

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return (
          <span className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center ring-8 ring-white">
            <PlusIcon />
          </span>
        );
      case 'complete':
        return (
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      case 'invoice':
        return (
          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center ring-8 ring-white">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-gray-100 text-gray-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="p-6">
      <StatsGrid stats={stats} onStatClick={handleStatClick} />
    {/* Main Dashboard Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Recent Appointments */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700 transition-colors">
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          {recentAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">{appointment.initials}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">{appointment.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                <p className="text-xs text-gray-500">{appointment.doctor}</p>
              </div>
              <span className={getStatusBadge(appointment.status)}>
                {appointment.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {/* Quick Links Section */}
<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
  {adminSidebar
    .filter(link => !link.submenu) // only show non-submenu items as quick links
    .map((item) => (
      <div
        key={item.label}
        onClick={() => navigate(item.path)}
        className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex items-center transition"
      >
        <div className="p-1 bg-gray-100 rounded-lg text-teal-600">
          {item.icon && <item.icon className="w-3 h-3" />}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-gray-900">{item.label}</p>
          <p className="text-sm text-gray-500">Go to {item.label}</p>
        </div>
      </div>
    ))}
</div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < recentActivities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>{getActivityIcon(activity.type)}</div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {activity.user && (
                            <span className="font-medium text-gray-900">{activity.user} </span>
                          )}
                          {activity.action}
                          {activity.target && (
                            <span className="font-medium text-gray-900"> {activity.target}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>{activity.time}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;

