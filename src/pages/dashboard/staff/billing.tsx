import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar';

// --- Reusable UI Components (can be moved to a separate components folder) ---

// Card component for displaying key stats
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// Status badge component for the table
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// --- Mock Data (replace with API calls in a real application) ---
const mockInvoices = [
  { id: 'INV-1234', patientName: 'John Doe', patientId: 'P001', date: '2024-07-20', amount: 350.00, status: 'Paid' },
  { id: 'INV-1235', patientName: 'Jane Smith', patientId: 'P002', date: '2024-07-19', amount: 850.50, status: 'Pending' },
  { id: 'INV-1236', patientName: 'Peter Jones', patientId: 'P003', date: '2024-06-15', amount: 1200.00, status: 'Overdue' },
  { id: 'INV-1237', patientName: 'Mary Johnson', patientId: 'P004', date: '2024-07-21', amount: 50.00, status: 'Paid' },
  { id: 'INV-1238', patientName: 'David Williams', patientId: 'P005', date: '2024-07-22', amount: 620.00, status: 'Pending' },
];

// --- Main Billing Component ---

function Billing() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, you'd calculate these from the fetched data
  const totalOutstanding = invoices
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paymentsToday = invoices
    .filter(inv => inv.status === 'Paid' && inv.date === '2024-07-20') // Example date
    .reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="bg-gray-50 min-h-full p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Billing Dashboard</h1>
          <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Invoice
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Outstanding" value={`$${totalOutstanding.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
          <StatCard title="Payments Collected (Today)" value={`$${paymentsToday.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
          <StatCard title="Overdue Invoices" value={invoices.filter(i => i.status === 'Overdue').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        </div>

        {/* Invoice Table Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">All Invoices</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, patient ID, or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute top-0 left-0 pl-3 pt-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Invoice ID</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Patient</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Amount</th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{invoice.id}</td>
                    <td className="py-3 px-4">
                        <div className="font-medium">{invoice.patientName}</div>
                        <div className="text-xs text-gray-500">ID: {invoice.patientId}</div>
                    </td>
                    <td className="py-3 px-4">{invoice.date}</td>
                    <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">View</button>
                      <button className="text-gray-500 hover:text-gray-700 font-medium">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No invoices found for "{searchTerm}".</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Billing;