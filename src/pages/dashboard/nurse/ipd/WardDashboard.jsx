import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaBed, FaUserInjured, FaHeartbeat, FaPrescriptionBottleAlt, 
  FaNotesMedical, FaCalendarAlt, FaStethoscope, FaClock,
  FaExclamationTriangle, FaCheckCircle, FaSpinner, FaUserMd
} from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', iconBg: 'bg-teal-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-600' }
  };
  const selected = colorClasses[color] || colorClasses.teal;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${selected.iconBg} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const WardDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedPatients: 0,
    pendingVitals: 0,
    pendingMedications: 0,
    criticalAlerts: 0,
    todayDischarges: 0
  });
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned patients for the nurse
      const patientsRes = await axios.get(`${API_URL}/ipd/admissions`, {
        params: { status: 'Admitted,Under Treatment', assignedNurse: 'current' }
      });
      const patients = patientsRes.data.admissions || [];
      setAssignedPatients(patients);
      
      setStats({
        assignedPatients: patients.length,
        pendingVitals: patients.filter(p => !p.lastVitalsToday).length,
        pendingMedications: patients.reduce((sum, p) => sum + (p.pendingMedications || 0), 0),
        criticalAlerts: patients.filter(p => p.criticalAlert).length,
        todayDischarges: patients.filter(p => p.dischargeInitiated).length
      });
      
      // Fetch pending tasks
      setPendingTasks([
        { id: 1, type: 'vitals', patient: 'John Doe', time: '09:00 AM', priority: 'high' },
        { id: 2, type: 'medication', patient: 'Jane Smith', time: '10:30 AM', priority: 'normal' },
        { id: 3, type: 'nursing', patient: 'Robert Johnson', time: '11:00 AM', priority: 'low' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getTaskIcon = (type) => {
    switch(type) {
      case 'vitals': return <FaHeartbeat className="text-teal-500" />;
      case 'medication': return <FaPrescriptionBottleAlt className="text-blue-500" />;
      default: return <FaNotesMedical className="text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={nurseSidebar} section="Nurse">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading ward data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaBed className="text-teal-600" size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Ward Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm">Overview of assigned patients and pending tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Assigned Patients" value={stats.assignedPatients} icon={<FaUserInjured size={22} />} color="teal" />
          <StatCard title="Pending Vitals" value={stats.pendingVitals} icon={<FaHeartbeat size={22} />} color="blue" />
          <StatCard title="Pending Medications" value={stats.pendingMedications} icon={<FaPrescriptionBottleAlt size={22} />} color="amber" />
          <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={<FaExclamationTriangle size={22} />} color="red" />
          <StatCard title="Today's Discharges" value={stats.todayDischarges} icon={<FaCalendarAlt size={22} />} color="emerald" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Patients List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Assigned Patients</h2>
              <Link to="/dashboard/nurse/ipd/patients" className="text-teal-600 text-sm hover:text-teal-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {assignedPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No assigned patients</div>
              ) : (
                assignedPatients.map((patient, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">
                          {patient.patientId?.first_name} {patient.patientId?.last_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Bed: {patient.bedId?.bedNumber} | Admitted: {format(new Date(patient.admissionDate), 'dd MMM')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Link to={`/dashboard/nurse/ipd/patient/${patient._id}/vitals`} className="text-xs text-teal-600 hover:text-teal-700">Record Vitals</Link>
                          <span className="text-slate-300">|</span>
                          <Link to={`/dashboard/nurse/ipd/patient/${patient._id}/medications`} className="text-xs text-blue-600 hover:text-blue-700">Medications</Link>
                        </div>
                      </div>
                      {patient.criticalAlert && (
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                          <FaExclamationTriangle size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Pending Tasks</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No pending tasks</div>
              ) : (
                pendingTasks.map(task => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-xl">
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 capitalize">{task.type}</p>
                        <p className="text-xs text-slate-400">{task.patient} • {task.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/nurse/ipd/vitals" className="bg-teal-600 text-white p-4 rounded-2xl text-center hover:bg-teal-700 transition-all">
            <FaHeartbeat className="mx-auto mb-2" size={24} />
            <p className="font-medium">Record Vitals</p>
          </Link>
          <Link to="/dashboard/nurse/ipd/medications" className="bg-blue-600 text-white p-4 rounded-2xl text-center hover:bg-blue-700 transition-all">
            <FaPrescriptionBottleAlt className="mx-auto mb-2" size={24} />
            <p className="font-medium">Medication Chart</p>
          </Link>
          <Link to="/dashboard/nurse/ipd/nursing-notes" className="bg-purple-600 text-white p-4 rounded-2xl text-center hover:bg-purple-700 transition-all">
            <FaNotesMedical className="mx-auto mb-2" size={24} />
            <p className="font-medium">Nursing Notes</p>
          </Link>
          <Link to="/dashboard/nurse/ipd/handover" className="bg-amber-600 text-white p-4 rounded-2xl text-center hover:bg-amber-700 transition-all">
            <FaCalendarAlt className="mx-auto mb-2" size={24} />
            <p className="font-medium">Shift Handover</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default WardDashboard;