import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaCalendarTimes, FaBox } from 'react-icons/fa';

const StockAlerts = ({ lowStockCount, expiringCount, expiredCount }) => {
  const alerts = [
    {
      icon: <FaExclamationTriangle className="text-red-600" />,
      title: 'Low Stock',
      count: lowStockCount,
      link: '/dashboard/pharmacy/inventory/low-stock',
      color: 'red'
    },
    {
      icon: <FaCalendarTimes className="text-orange-600" />,
      title: 'Expiring Soon',
      count: expiringCount,
      link: '/dashboard/pharmacy/inventory/expiring',
      color: 'orange'
    },
    {
      icon: <FaBox className="text-gray-600" />,
      title: 'Expired',
      count: expiredCount,
      link: '/dashboard/pharmacy/inventory/expired',
      color: 'gray'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="font-bold text-lg text-gray-700 mb-4">Stock Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Link
            key={index}
            to={alert.link}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`text-${alert.color}-600`}>
                {alert.icon}
              </div>
              <span className="text-gray-700">{alert.title}</span>
            </div>
            <span className={`bg-${alert.color}-100 text-${alert.color}-800 px-2 py-1 rounded-full text-sm font-medium`}>
              {alert.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StockAlerts;