import React, { useState, useEffect } from 'react';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaHospitalUser, FaBed, FaMoneyBillWave, FaExclamationTriangle, 
  FaUserInjured, FaCalendarCheck, FaChartLine, FaBuilding,
  FaDoorOpen, FaPlusCircle, FaClipboardList, FaFileInvoiceDollar
} from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const StatCard = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminIPDDashboard = () => {
  const [stats, setStats] = useState({
    totalAdmitted: 0,
    dischargeInitiated: 0,
    dischargedToday: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalBeds: 0,
    totalRooms: 0,
    totalWards: 0,
    criticalPatients: 0,
    pendingLabReports: 0,
    pendingPayments: 0,
    todayRevenue: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchWards();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsRes = await axios.get(`${API_URL}/ipd/admissions/dashboard/stats`);
      if (statsRes.data.success) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
      }
      
      // Fetch recent admissions
      const admissionsRes = await axios.get(`${API_URL}/ipd/admissions`, { params: { limit: 10 } });
      setRecentAdmissions(admissionsRes.data.admissions || []);
      
      // Fetch facility counts
      const [bedsRes, roomsRes, wardsRes] = await Promise.all([
        axios.get(`${API_URL}/ipd/beds`),
        axios.get(`${API_URL}/rooms`),
        axios.get(`${API_URL}/wards`)
      ]);
      
      const beds = bedsRes.data.beds || [];
      setStats(prev => ({
        ...prev,
        totalBeds: beds.length,
        occupiedBeds: beds.filter(b => b.status === 'Occupied').length,
        availableBeds: beds.filter(b => b.status === 'Available').length,
        totalRooms: (roomsRes.data || []).length,
        totalWards: (wardsRes.data.wards || []).length
      }));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await axios.get(`${API_URL}/wards`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const getOccupancyRate = () => {
    if (stats.totalBeds === 0) return 0;
    return Math.round((stats.occupiedBeds / stats.totalBeds) * 100);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 rounded-xl">
            <FaHospitalUser className="text-teal-600" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">IPD Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm">Complete overview of Inpatient Department</p>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard 
          title="Active Admissions" 
          value={stats.totalAdmitted} 
          icon={<FaHospitalUser size={22} />} 
          color="teal"
        />
        <StatCard 
          title="Bed Occupancy" 
          value={`${stats.occupiedBeds}/${stats.totalBeds}`} 
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
          title="Today's Revenue" 
          value={`₹${(stats.todayRevenue || 0).toLocaleString()}`} 
          icon={<FaMoneyBillWave size={22} />} 
          color="emerald"
        />
      </div>

      {/* Stats Grid - Row 2 - Facility Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Total Wards</p><p className="text-2xl font-bold text-slate-800">{stats.totalWards}</p></div>
          <div className="p-3 bg-purple-50 rounded-xl"><FaBuilding className="text-purple-600" size={20} /></div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Total Rooms</p><p className="text-2xl font-bold text-slate-800">{stats.totalRooms}</p></div>
          <div className="p-3 bg-blue-50 rounded-xl"><FaDoorOpen className="text-blue-600" size={20} /></div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Total Beds</p><p className="text-2xl font-bold text-slate-800">{stats.totalBeds}</p></div>
          <div className="p-3 bg-teal-50 rounded-xl"><FaBed className="text-teal-600" size={20} /></div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Occupancy Rate</p><p className="text-2xl font-bold text-teal-600">{getOccupancyRate()}%</p></div>
          <div className="w-12 h-12"><div className="w-full h-2 bg-slate-200 rounded-full mt-2"><div className="h-2 bg-teal-600 rounded-full" style={{ width: `${getOccupancyRate()}%` }} /></div></div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaPlusCircle className="text-teal-500" size={18} /> Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/dashboard/admin/ipd/admit" className="block w-full text-center bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition-all font-medium">
              + New Admission
            </Link>
            <Link to="/dashboard/admin/beds" className="block w-full text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium">
              Manage Beds
            </Link>
            <Link to="/dashboard/admin/rooms" className="block w-full text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium">
              Manage Rooms
            </Link>
            <Link to="/dashboard/admin/wards" className="block w-full text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium">
              Manage Wards
            </Link>
          </div>
        </div>

        {/* Ward-wise Bed Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaBuilding className="text-teal-500" size={18} /> Ward-wise Beds
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {wards.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No wards configured</p>
            ) : (
              wards.map(ward => (
                <div key={ward._id} className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">{ward.name}</span>
                  <span className="font-medium text-slate-800">0 beds</span>
                </div>
              ))
            )}
          </div>
          <Link to="/dashboard/admin/wards" className="mt-4 block text-center text-teal-600 text-sm hover:text-teal-700">
            Manage Wards →
          </Link>
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
              <span className="text-slate-600">Discharge Initiated</span>
              <span className="font-bold text-amber-600">{stats.dischargeInitiated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pending Lab Reports</span>
              <span className="font-bold text-purple-600">{stats.pendingLabReports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pending Payments</span>
              <span className="font-bold text-red-600">₹{stats.pendingPayments.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admissions Table */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Recent Admissions</h2>
          <Link to="/dashboard/admin/ipd/admissions" className="text-teal-600 text-sm hover:text-teal-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Admission Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Due Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div></td></tr>
              ) : recentAdmissions.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">No admissions found</td></tr>
              ) : (
                recentAdmissions.map((admission) => (
                  <tr key={admission._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">{admission.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{admission.patientId?.first_name} {admission.patientId?.last_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Dr. {admission.primaryDoctorId?.firstName} {admission.primaryDoctorId?.lastName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{admission.bedId?.bedNumber} ({admission.bedId?.bedType})</td>
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
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">₹{(admission.dueAmount || 0).toLocaleString()}</td>
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

export default AdminIPDDashboard;