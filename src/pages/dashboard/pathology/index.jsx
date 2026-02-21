// pages/dashboard/pathology/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaFlask, 
  FaVial, 
  FaMicroscope, 
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaChartLine,
  FaCalendarAlt,
  FaUserMd
} from 'react-icons/fa';

const PathologyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingTests: 0,
    inProgressTests: 0,
    completedToday: 0,
    totalTests: 0,
    recentActivities: []
  });

  const [pendingByCategory, setPendingByCategory] = useState([]);

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

      // Calculate pending by category (you might need a separate API for this)
      const categoryStats = await calculatePendingByCategory(pendingRes.data.labTests || []);

      // Create recent activities from today's tests
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
        totalTests,
        recentActivities: activities
      });

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

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sample_collected': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout sidebarItems={pathologySidebar} section="Pathology">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Pathology Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your lab overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Tests</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingTests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
            </div>
            <Link to="/dashboard/pathology/prescriptions?status=Pending" className="text-sm text-teal-600 hover:text-teal-700 mt-4 inline-block">
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inProgressTests}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaMicroscope className="text-blue-600 text-2xl" />
              </div>
            </div>
            <Link to="/dashboard/pathology/prescriptions?status=Processing" className="text-sm text-teal-600 hover:text-teal-700 mt-4 inline-block">
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed Today</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
            <Link to="/dashboard/pathology/prescriptions?status=Completed" className="text-sm text-teal-600 hover:text-teal-700 mt-4 inline-block">
              View Details →
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartLine className="text-teal-600" />
                  Recent Activities
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'pending' ? 'bg-yellow-400' :
                          activity.status === 'sample_collected' ? 'bg-blue-400' :
                          activity.status === 'processing' ? 'bg-purple-400' :
                          activity.status === 'completed' ? 'bg-green-400' :
                          'bg-teal-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{activity.action}</span> - {activity.patient}
                          </p>
                          <p className="text-xs text-gray-400">{activity.test} • {activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pending by Category */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                Pending by Category
              </h3>
              {pendingByCategory.length > 0 ? (
                <div className="space-y-4">
                  {pendingByCategory.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium text-gray-800">{item.count} tests</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(item.count / Math.max(...pendingByCategory.map(i => i.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending tests</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PathologyDashboard;