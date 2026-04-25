import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaUserMd, FaCalendarAlt, FaBed, FaSearch, FaFilter, FaDownload, FaPrint, FaHospitalUser, FaClipboardList } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const ActiveAdmissions = () => {
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
      'Admitted': 'bg-teal-50 text-teal-700 border-teal-200',
      'Under Treatment': 'bg-blue-50 text-blue-700 border-blue-200',
      'Discharge Initiated': 'bg-amber-50 text-amber-700 border-amber-200',
      'Discharge Summary Pending': 'bg-orange-50 text-orange-700 border-orange-200',
      'Billing Pending': 'bg-purple-50 text-purple-700 border-purple-200',
      'Ready for Discharge': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaHospitalUser className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Active Admissions</h1>
            </div>
            <p className="text-slate-500 text-sm">Manage all current inpatient admissions</p>
          </div>
          <Link 
            to="/dashboard/staff/ipd/admit" 
            className="mt-4 md:mt-0 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaHospitalUser size={16} /> New Admission
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Active</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{admissions.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Admitted</p>
            <p className="text-3xl font-bold text-teal-600 mt-1">{admissions.filter(a => a.status === 'Admitted').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Under Treatment</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{admissions.filter(a => a.status === 'Under Treatment').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Discharge Initiated</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{admissions.filter(a => a.status === 'Discharge Initiated').length}</p>
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Discharge Initiated">Discharge Initiated</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-slate-600"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admitted On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                      <p className="text-slate-400 text-sm">Loading admissions...</p>
                    </td>
                  </tr>
                ) : filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <FaClipboardList className="text-4xl text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400">No admissions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((admission) => (
                    <tr key={admission._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-slate-800">{admission.admissionNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{admission.patientId?.first_name} {admission.patientId?.last_name}</p>
                          <p className="text-xs text-slate-400">ID: {admission.patientId?.patientId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <FaUserMd className="text-teal-600" size={12} />
                          </div>
                          <span className="text-sm text-slate-600">Dr. {admission.primaryDoctorId?.firstName} {admission.primaryDoctorId?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{admission.departmentId?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaBed className="text-slate-400" size={12} />
                          <span className="text-sm text-slate-600">{admission.bedId?.bedNumber} ({admission.bedId?.bedType})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(admission.admissionDate), 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={admission.status}
                          onChange={(e) => updatePatientStatus(admission._id, e.target.value)}
                          className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(admission.status)} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                        >
                          <option value="Admitted">Admitted</option>
                          <option value="Under Treatment">Under Treatment</option>
                          <option value="Discharge Initiated">Discharge Initiated</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${admission.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{(admission.dueAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/dashboard/staff/ipd/patient/${admission._id}`} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <FaEye size={14} /> View
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

export default ActiveAdmissions;