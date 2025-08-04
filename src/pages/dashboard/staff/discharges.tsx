import React, { useState, useMemo } from 'react';
import Layout from '../../../components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'

// --- Reusable UI Components ---

// Using a similar StatusBadge component for consistency
const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Pending Bill Clearance': 'bg-orange-100 text-orange-800',
    'Awaiting Summary': 'bg-blue-100 text-blue-800',
    'Ready for Discharge': 'bg-green-100 text-green-800',
    'Discharged': 'bg-gray-200 text-gray-800',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// --- Mock Data (replace with API calls) ---
const mockPatients = [
  { id: 'P001', name: 'John Doe', admittedOn: '2025-06-15', bedNo: 'B101', ward: 'General', doctor: 'Dr. Smith', billStatus: 'Cleared', dischargeStatus: 'Awaiting Summary', totalBill: 12000, paid: 12000 },
  { id: 'P002', name: 'Jane Smith', admittedOn: '2025-06-18', bedNo: 'B102', ward: 'ICU', doctor: 'Dr. Adams', billStatus: 'Pending', dischargeStatus: 'Pending Bill Clearance', totalBill: 25000, paid: 15000 },
  { id: 'P003', name: 'Peter Jones', admittedOn: '2025-06-12', bedNo: 'B103', ward: 'Private', doctor: 'Dr. Lee', billStatus: 'Cleared', dischargeStatus: 'Ready for Discharge', totalBill: 18000, paid: 18000 },
  { id: 'P004', name: 'Mary Johnson', admittedOn: '2025-06-20', bedNo: 'B104', ward: 'General', doctor: 'Dr. Smith', billStatus: 'Pending', dischargeStatus: 'Pending Bill Clearance', totalBill: 9000, paid: 4000 },
  { id: 'P005', name: 'David Williams', admittedOn: '2025-06-10', bedNo: 'B105', ward: 'ICU', doctor: 'Dr. Adams', billStatus: 'Cleared', dischargeStatus: 'Discharged', totalBill: 30000, paid: 30000 },
  { id: 'P006', name: 'Emily Brown', admittedOn: '2025-06-19', bedNo: 'B106', ward: 'Private', doctor: 'Dr. Lee', billStatus: 'Cleared', dischargeStatus: 'Ready for Discharge', totalBill: 22000, paid: 22000 },
];

// --- Main Discharges Component ---

function Discharges() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('InProgress'); // InProgress, Ready, Completed

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(patient => {
      if (activeTab === 'InProgress') return patient.dischargeStatus === 'Pending Bill Clearance' || patient.dischargeStatus === 'Awaiting Summary';
      if (activeTab === 'Ready') return patient.dischargeStatus === 'Ready for Discharge';
      if (activeTab === 'Completed') return patient.dischargeStatus === 'Discharged';
      return true;
    });
  }, [patients, searchTerm, activeTab]);

  const ActionButton = ({ patient }) => {
    switch (patient.dischargeStatus) {
      case 'Pending Bill Clearance':
        return <button className="bg-orange-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-orange-600">Clear Bills</button>;
      case 'Awaiting Summary':
        return <button className="bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-blue-600">Generate Summary</button>;
      case 'Ready for Discharge':
        return <button className="bg-green-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-green-600">Process Discharge</button>;
      case 'Discharged':
        return <button className="text-gray-500 hover:text-gray-700 text-xs font-medium">View History</button>;
      default:
        return null;
    }
  };

  const Tab = ({ title, count, tabKey }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
        activeTab === tabKey
          ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {title} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tabKey ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
    </button>
  );

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="bg-gray-50 min-h-full p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Patient Discharges</h1>
          <p className="text-gray-500 mt-1">Manage and track the patient discharge process.</p>
        </div>

        {/* Patient Table Section */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs and Search */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
             <div className="flex border-b -mb-px">
                <Tab title="In Progress" tabKey="InProgress" count={patients.filter(p => p.dischargeStatus === 'Pending Bill Clearance' || p.dischargeStatus === 'Awaiting Summary').length} />
                <Tab title="Ready for Discharge" tabKey="Ready" count={patients.filter(p => p.dischargeStatus === 'Ready for Discharge').length} />
                <Tab title="Completed" tabKey="Completed" count={patients.filter(p => p.dischargeStatus === 'Discharged').length} />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Patient</th>
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Admitted On</th>
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Bed No.</th>
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Ward</th>
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Doctor</th>
                  <th className="text-left py-3 px-6 uppercase font-semibold text-sm text-gray-600">Bill Status</th>
                  <th className="text-center py-3 px-6 uppercase font-semibold text-sm text-gray-600">Discharge Status</th>
                  <th className="text-center py-3 px-6 uppercase font-semibold text-sm text-gray-600">Total Bill</th>
                  <th className="text-center py-3 px-6 uppercase font-semibold text-sm text-gray-600">Paid</th>
                  <th className="text-center py-3 px-6 uppercase font-semibold text-sm text-gray-600">Next Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-gray-500">ID: {patient.id}</div>
                    </td>
                    <td className="py-4 px-6">{patient.admittedOn}</td>
                    <td className="py-4 px-6">{patient.bedNo}</td>
                    <td className="py-4 px-6">{patient.ward}</td>
                    <td className="py-4 px-6">{patient.doctor}</td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${patient.billStatus === 'Cleared' ? 'text-green-600' : 'text-orange-600'}`}>{patient.billStatus}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={patient.dischargeStatus} />
                    </td>
                    <td className="py-4 px-6 text-center">₹{patient.totalBill.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">₹{patient.paid.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <ActionButton patient={patient} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No patients found in this category.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Discharges;