import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaExclamationTriangle, 
  FaCalendarTimes, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSearch
} from 'react-icons/fa';
import apiClient from '../../../api/apiClient';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

const StockOverview = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalValue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [
          medicinesRes,
          lowStockRes,
          expiringRes,
          expiredRes,
          activityRes
        ] = await Promise.all([
          apiClient.get('/medicines?limit=1'),
          apiClient.get('/medicines/low-stock'),
          apiClient.get('/batches/expiring-soon'),
          apiClient.get('/medicines/expired'),
          apiClient.get('/stock-adjustments?limit=5')
        ]);

        const totalMedicines = medicinesRes.data.total || medicinesRes.data.length;
        const lowStockCount = lowStockRes.data.length;
        const expiringSoonCount = expiringRes.data.length;
        const expiredCount = expiredRes.data.length;

        // Calculate total inventory value (simplified)
        const totalValue = medicinesRes.data.medicines?.reduce((sum, med) => 
          sum + (med.price_per_unit * (med.stock_quantity || 0)), 0) || 0;

        setStats({
          totalMedicines,
          lowStockCount,
          expiringSoonCount,
          expiredCount,
          totalValue
        });

        setRecentActivity(activityRes.data.adjustments || activityRes.data);

      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout sidebarItems={pharmacySidebar}>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Overview</h1>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMedicines}</p>
            </div>
            <FaBox className="text-3xl text-blue-600" />
          </div>
          <Link to="/dashboard/pharmacy/medicines" className="text-sm text-blue-600 hover:text-blue-700 mt-2 block">
            View all →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</p>
            </div>
            <FaExclamationTriangle className="text-3xl text-orange-600" />
          </div>
          <Link to="/dashboard/pharmacy/low-stock" className="text-sm text-orange-600 hover:text-orange-700 mt-2 block">
            View details →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">{stats.expiringSoonCount}</p>
            </div>
            <FaCalendarTimes className="text-3xl text-red-600" />
          </div>
          <Link to="/dashboard/pharmacy/expiring" className="text-sm text-red-600 hover:text-red-700 mt-2 block">
            Check items →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-600">{stats.expiredCount}</p>
            </div>
            <FaCalendarTimes className="text-3xl text-gray-600" />
          </div>
          <Link to="/dashboard/pharmacy/expired" className="text-sm text-gray-600 hover:text-gray-700 mt-2 block">
            Manage →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <FaChartLine className="text-3xl text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Inventory worth</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Stock Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Medicine</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{activity.medicine_id?.name || 'N/A'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.adjustment_type === 'Addition' ? 'bg-green-100 text-green-800' :
                      activity.adjustment_type === 'Deduction' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.adjustment_type}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      {activity.adjustment_type === 'Addition' ? (
                        <FaArrowUp className="text-green-600 mr-1" />
                      ) : (
                        <FaArrowDown className="text-red-600 mr-1" />
                      )}
                      {activity.quantity}
                    </div>
                  </td>
                  <td className="py-2">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">{activity.reason}</td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Link to="/dashboard/pharmacy/inventory/adjustments" className="text-sm text-blue-600 hover:text-blue-700 mt-4 block">
          View all adjustments →
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/dashboard/pharmacy/inventory/add-medicine" className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition-colors">
          <div className="text-center">
            <FaBox className="text-3xl mx-auto mb-2" />
            <h3 className="font-semibold">Add New Medicine</h3>
            <p className="text-sm opacity-90">Add a new medicine to inventory</p>
          </div>
        </Link>

        <Link to="/dashboard/pharmacy/purchasing/create-order" className="bg-green-600 text-white p-6 rounded-xl shadow hover:bg-green-700 transition-colors">
          <div className="text-center">
            <FaArrowUp className="text-3xl mx-auto mb-2" />
            <h3 className="font-semibold">Create Purchase Order</h3>
            <p className="text-sm opacity-90">Order new stock from suppliers</p>
          </div>
        </Link>

        <Link to="/dashboard/pharmacy/inventory/adjustments" className="bg-orange-600 text-white p-6 rounded-xl shadow hover:bg-orange-700 transition-colors">
          <div className="text-center">
            <FaExclamationTriangle className="text-3xl mx-auto mb-2" />
            <h3 className="font-semibold">Stock Adjustment</h3>
            <p className="text-sm opacity-90">Make inventory corrections</p>
          </div>
        </Link>
      </div>
    </div>
    </Layout>
  );
};

export default StockOverview;