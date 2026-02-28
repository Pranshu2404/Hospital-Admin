// pages/dashboard/pathology/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaFlask, 
  FaClock,
  FaMicroscope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendarCheck,
  FaVial,
  FaFileAlt
} from 'react-icons/fa';
import dayjs from 'dayjs';

// --- Custom Styles (matching other dashboards) ---
const dashboardStyles = `
  .stat-card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stat-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.02);
  }
  .pulse-dot {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
`;

const PathologyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState({
    pendingTests: 0,
    inProgressTests: 0,
    completedToday: 0,
    totalTests: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingByCategory, setPendingByCategory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital data (matching other dashboards)
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`);
        if (res.data && res.data.length > 0) {
          setHospital(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      }
    };
    fetchHospitalData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch lab tests count
      const testsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      const totalTests = testsRes.data.data?.length || 0;

      // Fetch today's lab tests
      const todayRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/todays-lab-tests`);
      
      // Fetch pending lab tests by status
      const pendingRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Pending`);
      const processingRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Processing`);
      const completedRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Completed`);

      const pendingTests = pendingRes.data.count || 0;
      const processingTests = processingRes.data.count || 0;
      const completedToday = completedRes.data.count || 0;

      // Calculate pending by category
      const categoryStats = await calculatePendingByCategory(pendingRes.data.labTests || []);

      // Create recent activities (exactly as original)
      const activities = [];
      if (todayRes.data.success) {
        todayRes.data.todaysLabTests?.forEach((test, index) => {
          if (index < 5) {
            activities.push({
              id: index,
              action: test.status === 'Pending' ? 'New test request' :
                      test.status === 'Sample Collected' ? 'Sample collected' :
                      test.status === 'Processing' ? 'Processing started' :
                      test.status === 'Completed' ? 'Report generated' : 'Test updated',
              patient: `${test.patient?.first_name} ${test.patient?.last_name}`,
              test: test.lab_test_name,
              time: formatRelativeTime(test.scheduled_date || test.issue_date),
              status: test.status.toLowerCase().replace(' ', '_')
            });
          }
        });
      }

      setStats({
        pendingTests,
        inProgressTests: processingTests,
        completedToday,
        totalTests
      });

      setRecentActivities(activities);
      setPendingByCategory(categoryStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePendingByCategory = (labTests) => {
    const categoryMap = {};
    labTests.forEach(test => {
      const category = test.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category]++;
    });

    return Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-500',
      'sample_collected': 'bg-blue-500',
      'processing': 'bg-purple-500',
      'completed': 'bg-emerald-500'
    };
    return colors[status] || 'bg-slate-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'sample_collected': 'bg-blue-50 text-blue-700 border-blue-200',
      'processing': 'bg-purple-50 text-purple-700 border-purple-200',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`;
  };

  if (loading) {
    return (
      <Layout sidebarItems={pathologySidebar} section="Pathology">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <style>{dashboardStyles}</style>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header with Hospital Info - Matching other dashboards */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">Pathology Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">Welcome back! Here's your lab overview.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
              <FaCalendarCheck className="text-teal-500" />
              <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-teal-700 font-mono text-sm tracking-wide">{currentTime.format('HH:mm:ss')}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Redesigned to match other dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Tests Card */}
          <div 
            className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
            onClick={() => navigate('/dashboard/pathology/prescriptions?status=Pending')}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Tests</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.pendingTests}</h3>
                  <p className="text-xs text-slate-500 mt-1">Awaiting processing</p>
                </div>
                {stats.pendingTests > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    <FaExclamationTriangle className="h-3 w-3" />
                    <span>Requires attention</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaClock size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* In Progress Card */}
          <div 
            className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
            onClick={() => navigate('/dashboard/pathology/prescriptions?status=Processing')}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.inProgressTests}</h3>
                  <p className="text-xs text-slate-500 mt-1">Currently being processed</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaMicroscope size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* Completed Today Card */}
          <div 
            className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
            onClick={() => navigate('/dashboard/pathology/prescriptions?status=Completed')}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed Today</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.completedToday}</h3>
                  <p className="text-xs text-slate-500 mt-1">Reports generated</p>
                </div>
                {stats.completedToday > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <FaCheckCircle className="h-3 w-3" />
                    <span>All done</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>

          {/* Total Tests Card */}
          <div 
            className="stat-card-hover relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm group"
            onClick={() => navigate('/dashboard/pathology/prescriptions')}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Tests</p>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{stats.totalTests}</h3>
                  <p className="text-xs text-slate-500 mt-1">All time</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaFlask size={22} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
          </div>
        </div>

        {/* Main Content Grid - Matching layout structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activities (span 2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-teal-600" />
                  <h3 className="text-lg font-bold text-slate-800">Recent Activities</h3>
                </div>
                <span className="text-xs text-slate-400">Live updates</span>
              </div>

              <div className="divide-y divide-slate-100">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">{activity.action}</span> - {activity.patient}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{activity.test} • {activity.time}</p>
                        </div>
                        <span className={getStatusBadge(activity.status)}>
                          {activity.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <FaFileAlt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pending by Category */}
          <div>

            {/* Quick Actions - Matching other dashboards */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'New Test', icon: FaVial, path: '/dashboard/pathology/prescriptions/new', color: 'teal' },
                  { label: 'Pending', icon: FaClock, path: '/dashboard/pathology/prescriptions?status=Pending', color: 'amber' },
                  { label: 'Processing', icon: FaMicroscope, path: '/dashboard/pathology/prescriptions?status=Processing', color: 'blue' },
                  { label: 'Reports', icon: FaFileAlt, path: '/dashboard/pathology/reports', color: 'purple' }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-teal-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className={`p-2.5 bg-white rounded-lg text-${item.color}-600 shadow-sm mb-2 group-hover:scale-110 group-hover:bg-${item.color}-500 group-hover:text-white transition-all duration-300`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-teal-700">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PathologyDashboard;