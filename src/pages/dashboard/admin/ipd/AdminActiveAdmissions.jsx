import React, { useState, useEffect } from 'react';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaEye, FaUserMd, FaCalendarAlt, FaBed, FaSearch, 
  FaFilter, FaPrint, FaHospitalUser, FaClipboardList,
  FaMoneyBillWave, FaFileInvoiceDollar
} from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminActiveAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAdmissions();
    fetchDepartments();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions`);
      console.log('Fetched admissions:', response.data);
      setAdmissions(response.data.admissions || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const updatePatientStatus = async (admissionId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/ipd/admissions/${admissionId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchAdmissions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const matchesSearch = searchTerm === '' || 
      `${admission.patientId?.first_name} ${admission.patientId?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || admission.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || admission.departmentId?._id === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Admitted': 'bg-teal-100 text-teal-700',
      'Under Treatment': 'bg-blue-100 text-blue-700',
      'Discharge Initiated': 'bg-amber-100 text-amber-700',
      'Discharge Summary Pending': 'bg-orange-100 text-orange-700',
      'Billing Pending': 'bg-purple-100 text-purple-700',
      'Ready for Discharge': 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  // Calculate summary stats
  const totalDue = admissions.reduce((sum, a) => sum + (a.dueAmount || 0), 0);
  const totalAdmitted = admissions.filter(a => a.status === 'Admitted').length;
  const totalUnderTreatment = admissions.filter(a => a.status === 'Under Treatment').length;
  const totalDischargeInitiated = admissions.filter(a => a.status === 'Discharge Initiated').length;

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaHospitalUser className="text-teal-600" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Active Admissions</h1>
          </div>
          <p className="text-slate-500 text-sm">Manage all current inpatient admissions</p>
        </div>
        <Link to="/dashboard/admin/ipd/admit" className="mt-4 md:mt-0 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2">
          <FaHospitalUser size={16} /> New Admission
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Total Active</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{admissions.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Admitted</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{totalAdmitted}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Under Treatment</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalUnderTreatment}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Total Due Amount</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by patient or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            <option value="all">All Status</option>
            <option value="Admitted">Admitted</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Discharge Initiated">Discharge Initiated</option>
            <option value="Billing Pending">Billing Pending</option>
            <option value="Ready for Discharge">Ready for Discharge</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
          >
            <FaPrint size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Admission No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Bed</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Admitted On</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Due Amount</th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></td></tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-12"><FaClipboardList className="text-4xl text-slate-300 mx-auto mb-3" /><p className="text-slate-400">No admissions found</p></td></tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr key={admission._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">{admission.admissionNumber}</td>
                    <td className="px-6 py-4"><p className="font-medium text-slate-800">{admission.patientId?.first_name} {admission.patientId?.last_name}</p><p className="text-xs text-slate-400">ID: {admission.patientId?.patientId}</p></td>
                    <td className="px-6 py-4 text-sm text-slate-600">Dr. {admission.primaryDoctorId?.firstName} {admission.primaryDoctorId?.lastName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{admission.departmentId?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{admission.bedId?.bedNumber} ({admission.bedId?.bedType})</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(admission.admissionDate), 'dd MMM yyyy, hh:mm a')}</td>
                    <td className="px-6 py-4">
                      <select
                        value={admission.status}
                        onChange={(e) => updatePatientStatus(admission._id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(admission.status)} focus:outline-none`}
                      >
                        <option value="Admitted">Admitted</option>
                        <option value="Under Treatment">Under Treatment</option>
                        <option value="Discharge Initiated">Discharge Initiated</option>
                        <option value="Billing Pending">Billing Pending</option>
                        <option value="Ready for Discharge">Ready for Discharge</option>
                      </select>
                    </td>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${admission.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{(admission.dueAmount || 0).toLocaleString()}</span></td>
                    {/* <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link to={`/dashboard/admin/ipd/patient/${admission._id}`} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><FaEye size={16} /></Link>
                        <Link to={`/dashboard/admin/ipd/patient/${admission._id}/billing`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaMoneyBillWave size={16} /></Link>
                        <Link to={`/dashboard/admin/ipd/patient/${admission._id}/discharge-summary`} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><FaFileInvoiceDollar size={16} /></Link>
                      </div>
                    </td> */}
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

export default AdminActiveAdmissions;