import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'
import apiClient from '../../../api/apiClient';

// --- Reusable UI Components ---

// Using a similar StatusBadge component for consistency
const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Pending Bill Clearance': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Awaiting Summary': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Ready for Discharge': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Discharged': 'bg-slate-100 text-slate-700 border border-slate-200',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
      {status}
    </span>
  );
};

// --- Data will be fetched from API ---

// --- Main Discharges Component ---

function Discharges() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('InProgress'); // InProgress, Ready, Completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        // Replace '/discharges' with your actual endpoint
        const res = await apiClient.get('/discharges');
        setPatients(res.data);
      } catch (err) {
        setError('No discharges found.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      (patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase()))
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
        return <button className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">Clear Bills</button>;
      case 'Awaiting Summary':
        return <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">Summary</button>;
      case 'Ready for Discharge':
        return <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">Discharge</button>;
      case 'Discharged':
        return <button className="text-teal-600 hover:text-teal-700 text-xs font-medium hover:bg-teal-50 py-2 px-3 rounded-lg transition-colors">View</button>;
      default:
        return null;
    }
  };

  const Tab = ({ title, count, tabKey }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
        activeTab === tabKey
          ? 'border-b-2 border-teal-600 text-teal-600'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {title} <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-bold ${activeTab === tabKey ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
    </button>
  );

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="bg-slate-50 min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" /></svg>
            Patient Discharges
          </h1>
          <p className="text-slate-500 mt-2">Manage and track patient discharge process</p>
        </div>

        {/* Patient Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs and Search */}
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/50">
             <div className="flex gap-1 border-b border-slate-200">
                <Tab title="In Progress" tabKey="InProgress" count={patients.filter(p => p.dischargeStatus === 'Pending Bill Clearance' || p.dischargeStatus === 'Awaiting Summary').length} />
                <Tab title="Ready for Discharge" tabKey="Ready" count={patients.filter(p => p.dischargeStatus === 'Ready for Discharge').length} />
                <Tab title="Completed" tabKey="Completed" count={patients.filter(p => p.dischargeStatus === 'Discharged').length} />
            </div>
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <div className="absolute top-0 left-0 pl-3 pt-3">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            ) : error || patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-slate-600 text-lg font-medium">No discharges are present</p>
                <p className="text-slate-400 text-sm mt-1">Discharged patients will appear here</p>
              </div>
            ) : (
              <>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Patient</th>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Admitted On</th>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Bed No.</th>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Ward</th>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Doctor</th>
                    <th className="text-left py-3 px-6 uppercase font-semibold text-xs text-slate-600">Bill Status</th>
                    <th className="text-center py-3 px-6 uppercase font-semibold text-xs text-slate-600">Discharge Status</th>
                    <th className="text-center py-3 px-6 uppercase font-semibold text-xs text-slate-600">Total Bill</th>
                    <th className="text-center py-3 px-6 uppercase font-semibold text-xs text-slate-600">Paid</th>
                    <th className="text-center py-3 px-6 uppercase font-semibold text-xs text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-teal-50/30 transition-colors duration-150">
                      <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{patient.name}</div>
                          <div className="text-xs text-slate-500">ID: {patient.id}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{patient.admittedOn}</td>
                      <td className="py-4 px-6 text-slate-700">{patient.bedNo}</td>
                      <td className="py-4 px-6 text-slate-700">{patient.ward}</td>
                      <td className="py-4 px-6 text-slate-700">{patient.doctor}</td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${patient.billStatus === 'Cleared' ? 'text-emerald-700' : 'text-amber-700'}`}>{patient.billStatus}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={patient.dischargeStatus} />
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-800">₹{patient.totalBill?.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-800">₹{patient.paid?.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <ActionButton patient={patient} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Discharges;