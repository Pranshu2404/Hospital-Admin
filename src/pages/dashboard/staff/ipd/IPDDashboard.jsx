import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHospitalUser, FaBed, FaMoneyBillWave, FaExclamationTriangle, FaCalendarCheck, FaClipboardList, FaPlusCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ title, value, icon, color, onClick }) => {
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
    <div 
      onClick={onClick}
      className="stat-card-hover bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${selected.iconBg} shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const IPDDashboard = () => {
  const [stats, setStats] = useState({
    totalAdmitted: 0,
    dischargeInitiated: 0,
    dischargedToday: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    criticalPatients: 0,
    pendingLabReports: 0,
    pendingPayments: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get(`${API_URL}/ipd/admissions/dashboard/stats`);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      const admissionsRes = await axios.get(`${API_URL}/ipd/admissions`, { params: { limit: 10 } });
      setRecentAdmissions(admissionsRes.data.admissions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaHospitalUser className="text-teal-600" size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">IPD Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm">Inpatient Department Overview & Analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            title="Active Admissions" 
            value={stats.totalAdmitted} 
            icon={<FaHospitalUser size={22} />} 
            color="teal"
          />
          <StatCard 
            title={`${stats.occupiedBeds} / ${stats.availableBeds}`} 
            value="Bed Status" 
            icon={<FaBed size={22} />} 
            color="blue"
          />
          <StatCard 
            title="Critical Patients" 
            value={stats.criticalPatients} 
            icon={<FaExclamationTriangle size={22} />} 
            color="red"
          />
          <StatCard 
            title="Pending Payments" 
            value={`₹${stats.pendingPayments.toLocaleString()}`} 
            icon={<FaMoneyBillWave size={22} />} 
            color="amber"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaPlusCircle className="text-teal-500" size={18} /> Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/dashboard/staff/ipd/admit" className="block w-full text-center bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition-all font-medium">
                + New Admission
              </Link>
              <Link to="/dashboard/staff/ipd/beds" className="block w-full text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium">
                View Bed Board
              </Link>
              <Link to="/dashboard/staff/ipd/admissions" className="block w-full text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium">
                View Active Admissions
              </Link>
            </div>
          </div>

          {/* Pending Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-teal-500" size={18} /> Pending Items
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Discharge Initiated</span>
                <span className="font-bold text-amber-600">{stats.dischargeInitiated}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Pending Lab Reports</span>
                <span className="font-bold text-purple-600">{stats.pendingLabReports}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Discharged Today</span>
                <span className="font-bold text-emerald-600">{stats.dischargedToday}</span>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl shadow-sm p-6 border border-teal-100">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaCalendarCheck className="text-teal-600" size={18} /> Today's Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Discharges Today</span>
                <span className="font-bold text-emerald-600 text-lg">{stats.dischargedToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Bed Occupancy Rate</span>
                <span className="font-bold text-teal-600 text-lg">
                  {stats.occupiedBeds + stats.availableBeds > 0 
                    ? Math.round((stats.occupiedBeds / (stats.occupiedBeds + stats.availableBeds)) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.occupiedBeds + stats.availableBeds > 0 
                      ? (stats.occupiedBeds / (stats.occupiedBeds + stats.availableBeds)) * 100 
                      : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Admissions Table */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Recent Admissions</h2>
            <Link to="/dashboard/staff/ipd/admissions" className="text-teal-600 text-sm hover:text-teal-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div></td></tr>
                ) : recentAdmissions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">No admissions found</td></tr>
                ) : (
                  recentAdmissions.map((admission) => (
                    <tr key={admission._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">{admission.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{admission.patientId?.first_name} {admission.patientId?.last_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">Dr. {admission.primaryDoctorId?.firstName} {admission.primaryDoctorId?.lastName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          admission.status === 'Admitted' ? 'bg-teal-100 text-teal-700' :
                          admission.status === 'Under Treatment' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {admission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/dashboard/staff/ipd/patient/${admission._id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IPDDashboard;