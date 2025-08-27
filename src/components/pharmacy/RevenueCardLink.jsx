import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Adjust path as needed
import { FaMoneyBillWave } from 'react-icons/fa';

/**
 * A clickable card component that displays this month's revenue information.
 */
const RevenueCardLink = () => {
  const invoicesPath = "/dashboard/pharmacy/invoices";
  
  // ADDED: State for loading and revenue data
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // ADDED: useEffect to fetch data from the backend
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const response = await apiClient.get('/api/pharmacy-invoices/stats/monthly-revenue');
        setRevenue(response.data.totalRevenue);
      } catch (error) {
        console.error("Failed to fetch monthly revenue:", error);
        setRevenue(0); // Default to 0 on error
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyRevenue();
  }, []);

  return (
    <Link to={invoicesPath} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="bg-white rounded-xl shadow-md p-5 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
            <FaMoneyBillWave className="text-2xl" />
          </div>
          <div>
            {/* UPDATED: Title of the card */}
            <div className="text-sm text-gray-500">This Month's Revenue</div>
            {/* UPDATED: Display dynamic data */}
            <div className="text-2xl font-bold text-gray-800">
              {loading ? '...' : `₹${revenue.toLocaleString()}`}
            </div>
          </div>
        </div>
        {/* UPDATED: Sub-text is now more relevant */}
        <div className="text-xs text-gray-500 mt-2">
          Total sales for the current month
        </div>
      </div>
    </Link>
  );
};

export default RevenueCardLink;