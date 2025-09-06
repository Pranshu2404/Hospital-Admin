import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const RecentSalesTable = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const response = await apiClient.get('/api/invoices/pharmacy');
        const recentInvoices = response.data.invoices.slice(0, 3); // Get top 3

        // UPDATED: Format the data to include patient name instead of item list
        const formattedSales = recentInvoices.map(invoice => ({
          id: `...${invoice._id.slice(-6)}`,
          patientName: `${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || 'N/A'}`.trim(),
          amount: `$${invoice.total_amount.toFixed(2)}`,
          status: invoice.status,
        }));
        
        setSales(formattedSales);
      } catch (err) {
        setError("Failed to fetch recent sales.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="font-bold text-lg text-gray-700 mb-4">Recent Sales</h2>
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading sales...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Invoice ID</th>
                {/* CHANGED: Column header is now 'Patient' */}
                <th scope="col" className="px-6 py-3">Patient</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{sale.id}</td>
                    {/* CHANGED: Cell now displays patient's name */}
                    <td className="px-6 py-4">{sale.patientName}</td>
                    <td className="px-6 py-4">{sale.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sale.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{sale.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">No recent sales found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentSalesTable;