


import { useState } from 'react';
import { StatsGrid } from '../common/StatCards';
import { useNavigate } from 'react-router-dom';
import { PatientIcon, AppointmentIcon, DoctorsIcon, FinanceIcon, PlusIcon } from '../common/Icons';

const Dashboard = () => {
  const navigate = useNavigate();

const handleStatClick = (title) => {
  if (title === 'Active Staff') {
    navigate('/dashboard/admin/staff-list');
  }
};

  const [stats] = useState([
    {
      title: "Total Patients",
      value: "2,847",
      change: "12% from last month",
      icon: <PatientIcon />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Today's Appointments", 
      value: "146",
      change: "32 completed",
      icon: <AppointmentIcon />,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    {
      title: 'Active Staff',
      value: '87',
      change: 'All present today',
      icon: <DoctorsIcon />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      clickable: true,
    },
    {
      title: "Monthly Revenue",
      value: "$847K",
      change: "8.2% increase", 
      icon: <FinanceIcon />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    }
  ]);

  const [recentAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      service: "General Checkup", 
      time: "10:30 AM",
      doctor: "Dr. Sarah Wilson",
      status: "Pending",
      initials: "JD"
    },
    {
      id: 2,
      patientName: "Maria Santos",
      service: "Cardiology",
      time: "11:15 AM", 
      doctor: "Dr. Michael Chen",
      status: "Confirmed",
      initials: "MS"
    },
    {
      id: 3,
      patientName: "Robert Taylor", 
      service: "Orthopedic",
      time: "2:00 PM",
      doctor: "Dr. Lisa Anderson", 
      status: "In Progress",
      initials: "RT"
    }
  ]);

  const [recentActivities] = useState([
    {
      id: 1,
      user: "Dr. Sarah Wilson",
      action: "added a new patient",
      target: "Maria Santos",
      time: "2h ago",
      type: "create"
    },
    {
      id: 2, 
      action: "Appointment completed for",
      target: "John Doe",
      time: "4h ago",
      type: "complete"
    },
    {
      id: 3,
      action: "Invoice #INV-2024-001 generated for",
      target: "Robert Taylor", 
      time: "6h ago",
      type: "invoice"
    }
  ]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Confirmed": "bg-green-100 text-green-800", 
      "In Progress": "bg-blue-100 text-blue-800",
      "Completed": "bg-gray-100 text-gray-800"
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
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





return (
  <div className="p-6">
    {/* Stats Grid */}
    {/* <StatsGrid stats={stats} onStatClick={handleStatClick} /> */}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors group">
            <div className="p-2 bg-teal-600 rounded-lg">
              <PlusIcon />
            </div>
            <div className="ml-4 text-left">
              <p className="font-medium text-gray-900 group-hover:text-teal-700">Add New Patient</p>
              <p className="text-sm text-gray-500">Register a new patient</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AppointmentIcon />
            </div>
            <div className="ml-4 text-left">
              <p className="font-medium text-gray-900">Schedule Appointment</p>
              <p className="text-sm text-gray-500">Book new appointment</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className="p-2 bg-green-600 rounded-lg">
              <DoctorsIcon />
            </div>
            <div className="ml-4 text-left">
              <p className="font-medium text-gray-900">Add Staff Member</p>
              <p className="text-sm text-gray-500">Register new staff</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className="p-2 bg-purple-600 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <p className="font-medium text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-500">Create system reports</p>
            </div>
          </button>
        </div>
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

