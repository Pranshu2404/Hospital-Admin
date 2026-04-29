import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaXRay,
  FaSearch,
  FaEye,
  FaFilter,
  FaCalendarAlt,
  FaUserMd,
  FaUserInjured,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaBrain,
  FaHeartbeat,
  FaProcedures,
  FaDownload,
  FaFilePdf,
  FaInfoCircle
} from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const config = {
    'Pending': { color: 'bg-amber-100 text-amber-700', icon: <FaClock className="text-xs" /> },
    'Approved': { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="text-xs" /> },
    'Scheduled': { color: 'bg-blue-100 text-blue-700', icon: <FaCalendarAlt className="text-xs" /> },
    'In Progress': { color: 'bg-indigo-100 text-indigo-700', icon: <FaTachometerAlt className="text-xs" /> },
    'Completed': { color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle className="text-xs" /> },
    'Reported': { color: 'bg-purple-100 text-purple-700', icon: <FaFilePdf className="text-xs" /> },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="text-xs" /> }
  };
  const { color, icon } = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
      {icon} {status}
    </span>
  );
};

const RadiologyRequestsList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    reported: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, sourceFilter, dateFilter, requests]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/radiology/requests?limit=100`);
      const requestsData = response.data.data || [];
      setRequests(requestsData);
      
      // Calculate stats
      const total = requestsData.length;
      const pending = requestsData.filter(r => r.status === 'Pending').length;
      const completed = requestsData.filter(r => r.status === 'Completed').length;
      const reported = requestsData.filter(r => r.status === 'Reported').length;
      const totalRevenue = requestsData.reduce((sum, r) => sum + (r.cost || 0), 0);
      
      setStats({ total, pending, completed, reported, totalRevenue });
    } catch (error) {
      console.error('Error fetching radiology requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.requestNumber?.toLowerCase().includes(term) ||
        r.testName?.toLowerCase().includes(term) ||
        r.testCode?.toLowerCase().includes(term) ||
        r.patientId?.first_name?.toLowerCase().includes(term) ||
        r.patientId?.last_name?.toLowerCase().includes(term) ||
        r.doctorId?.firstName?.toLowerCase().includes(term) ||
        r.doctorId?.lastName?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(r => r.sourceType === sourceFilter);
    }
    
    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(r => {
        const reqDate = new Date(r.requestedDate).toISOString().split('T')[0];
        return (!dateFilter.start || reqDate >= dateFilter.start) && (!dateFilter.end || reqDate <= dateFilter.end);
      });
    }
    
    setFilteredRequests(filtered);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'X-Ray': <FaProcedures className="text-blue-500" />,
      'CT Scan': <FaBrain className="text-purple-500" />,
      'MRI': <FaBrain className="text-indigo-500" />,
      'Ultrasound': <FaHeartbeat className="text-pink-500" />,
      'ECG': <FaHeartbeat className="text-red-500" />
    };
    return icons[category] || <FaXRay className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaXRay className="text-emerald-600" />
            Radiology Requests
          </h1>
          <p className="text-slate-500 mt-1">View and manage all patient radiology/imaging requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Total Requests</p><p className="text-2xl font-bold">{stats.total}</p></div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><FaXRay /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></div>
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600"><FaClock /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold text-emerald-600">{stats.completed}</p></div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><FaCheckCircle /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Reported</p><p className="text-2xl font-bold text-purple-600">{stats.reported}</p></div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><FaFilePdf /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Total Revenue</p><p className="text-2xl font-bold text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</p></div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><FaMoneyBillWave /></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by request number, patient, doctor, test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Reported">Reported</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="all">All Sources</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="Emergency">Emergency</option>
            </select>
            <div className="flex gap-2">
              <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="px-4 py-2 border border-slate-200 rounded-lg flex-1" />
              <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="px-4 py-2 border border-slate-200 rounded-lg flex-1" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-500">Showing {filteredRequests.length} of {requests.length} requests</div>

        {/* Requests Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div></div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaXRay className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Requests Found</h3>
            <p className="text-slate-500">No radiology requests match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Request #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-emerald-600">{req.requestNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaUserInjured className="text-slate-400" />
                          <span>{req.patientId?.first_name} {req.patientId?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(req.category)}
                          <div><div className="font-medium">{req.testName}</div><div className="text-xs text-slate-500">{req.testCode}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm">{req.category}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${req.sourceType === 'IPD' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {req.sourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(req.requestedDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">₹{req.cost || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => navigate(`/dashboard/admin/radiology-requests/${req._id}`)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="View Details"><FaEye size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RadiologyRequestsList;