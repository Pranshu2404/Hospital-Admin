import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { PlusIcon } from '../../common/Icons';

const ChargesTab = ({ patient }) => {
  const [charges] = useState([
    {
      id: 1,
      date: '2024-01-15',
      service: 'General Consultation',
      department: 'General Medicine',
      doctor: 'Dr. Sarah Wilson',
      amount: 150.00,
      status: 'Pending',
      description: 'Initial consultation and examination'
    },
    {
      id: 2,
      date: '2024-01-15',
      service: 'Blood Test - Complete Blood Count',
      department: 'Laboratory',
      technician: 'Lab Tech',
      amount: 75.00,
      status: 'Paid',
      description: 'CBC with differential'
    },
    {
      id: 3,
      date: '2024-01-10',
      service: 'X-Ray - Chest',
      department: 'Radiology',
      technician: 'Radiology Tech',
      amount: 200.00,
      status: 'Paid',
      description: 'Chest X-ray examination'
    },
    {
      id: 4,
      date: '2024-01-01',
      service: 'Emergency Room Visit',
      department: 'Emergency',
      doctor: 'Dr. Michael Chen',
      amount: 500.00,
      status: 'Partially Paid',
      description: 'Emergency consultation for respiratory issues'
    }
  ]);

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const paidCharges = charges
    .filter(charge => charge.status === 'Paid')
    .reduce((sum, charge) => sum + charge.amount, 0);
  const pendingCharges = charges
    .filter(charge => charge.status === 'Pending')
    .reduce((sum, charge) => sum + charge.amount, 0);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partially Paid': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Patient Charges</h3>
        <Button variant="primary" size="sm">
          <PlusIcon />
          Add Charge
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Charges</div>
          <div className="text-2xl font-bold text-gray-900">${totalCharges.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Paid Amount</div>
          <div className="text-2xl font-bold text-green-600">${paidCharges.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Outstanding</div>
          <div className="text-2xl font-bold text-red-600">${pendingCharges.toFixed(2)}</div>
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {charge.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{charge.service}</div>
                    <div className="text-sm text-gray-500">{charge.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {charge.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {charge.doctor || charge.technician}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${charge.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(charge.status)}>
                      {charge.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {charges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No charges recorded</h3>
            <p className="mt-1 text-sm text-gray-500">Start by adding a new charge.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargesTab;
