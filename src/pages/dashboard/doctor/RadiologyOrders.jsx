import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import axios from 'axios';
import {
  FaXRay, FaClock, FaCheckCircle, FaSearch,
  FaFilePdf, FaEye, FaTimes, FaArrowRight
} from 'react-icons/fa';

const BASE = import.meta.env.VITE_BACKEND_URL;

const StatusBadge = ({ status }) => {
  const cfg = {
    'Pending': 'bg-amber-100 text-amber-700', 'Approved': 'bg-green-100 text-green-700',
    'Scheduled': 'bg-blue-100 text-blue-700', 'In Progress': 'bg-indigo-100 text-indigo-700',
    'Completed': 'bg-emerald-100 text-emerald-700', 'Reported': 'bg-purple-100 text-purple-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
};

export default function DoctorRadiologyOrders() {
  const doctorId = localStorage.getItem('doctorId');
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [detailReq, setDetailReq] = useState(null);

  useEffect(() => { if (doctorId) fetchRequests(); }, [doctorId]);
  useEffect(() => { filterRequests(); }, [requests, search, statusF]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/radiology/requests?doctorId=${doctorId}&limit=100`);
      setRequests(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filterRequests = () => {
    let f = [...requests];
    if (search) { const t = search.toLowerCase(); f = f.filter(r => r.requestNumber?.toLowerCase().includes(t) || r.testName?.toLowerCase().includes(t) || r.patientId?.first_name?.toLowerCase().includes(t)); }
    if (statusF !== 'all') f = f.filter(r => r.status === statusF);
    setFiltered(f);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  const statCounts = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    completed: requests.filter(r => ['Completed', 'Reported'].includes(r.status)).length,
  };

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FaXRay className="text-teal-600" /> My Radiology Orders</h1>
          <p className="text-slate-500 mt-1">View imaging test orders and results for your patients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Orders', val: statCounts.total, bg: 'bg-teal-100 text-teal-600', icon: <FaXRay /> },
            { label: 'Pending', val: statCounts.pending, bg: 'bg-amber-100 text-amber-600', icon: <FaClock /> },
            { label: 'Completed', val: statCounts.completed, bg: 'bg-emerald-100 text-emerald-600', icon: <FaCheckCircle /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">{s.label}</p><p className="text-2xl font-bold">{s.val}</p></div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by patient, test, request #..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            </div>
            <select value={statusF} onChange={e => setStatusF(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="all">All Status</option>
              {['Pending','Approved','Scheduled','In Progress','Completed','Reported','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <FaXRay className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Radiology Orders</h3>
            <p className="text-slate-500">No radiology orders found. Orders are created by the registrar/staff desk.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Request #', 'Patient', 'Test', 'Priority', 'Source', 'Status', 'Date', 'Report'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetailReq(req)}>
                      <td className="px-4 py-3 font-mono text-sm text-teal-600 font-medium">{req.requestNumber}</td>
                      <td className="px-4 py-3 text-sm">{req.patientId?.first_name} {req.patientId?.last_name}</td>
                      <td className="px-4 py-3"><div className="font-medium text-sm">{req.testName}</div><div className="text-xs text-slate-500">{req.category}</div></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${req.priority === 'Emergency' ? 'bg-red-100 text-red-700' : req.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{req.priority}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${req.sourceType === 'IPD' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{req.sourceType}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-3 text-sm">{fmtDate(req.requestedDate)}</td>
                      <td className="px-4 py-3">
                        {req.report_url ? <a href={req.report_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm" onClick={e => e.stopPropagation()}><FaFilePdf /> View</a> : <span className="text-slate-400 text-sm">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {detailReq && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FaXRay className="text-teal-600" /> Order Details</h2>
                <button onClick={() => setDetailReq(null)} className="p-2 hover:bg-slate-100 rounded-lg"><FaTimes className="text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded font-bold">{detailReq.requestNumber}</span>
                  <StatusBadge status={detailReq.status} />
                  <span className={`px-2 py-0.5 text-xs rounded-full ${detailReq.priority === 'Emergency' ? 'bg-red-100 text-red-700' : detailReq.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{detailReq.priority}</span>
                </div>
                <h3 className="text-2xl font-bold">{detailReq.testName}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Test Code', detailReq.testCode],
                    ['Category', detailReq.category],
                    ['Source', detailReq.sourceType],
                    ['Cost', `₹${detailReq.cost || 0}`],
                    ['Patient', `${detailReq.patientId?.first_name || ''} ${detailReq.patientId?.last_name || ''}`],
                    ['Requested', fmtDate(detailReq.requestedDate)],
                    ['Scheduled', fmtDate(detailReq.scheduledDate)],
                    ['Billed', detailReq.is_billed ? 'Yes' : 'No'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-xs text-slate-400 uppercase font-semibold">{label}</span>
                      <p className="font-medium text-slate-800">{val}</p>
                    </div>
                  ))}
                </div>
                {detailReq.clinical_indication && <div className="bg-blue-50 p-3 rounded-lg"><span className="text-xs font-semibold text-blue-700">CLINICAL INDICATION</span><p className="text-blue-800 mt-1">{detailReq.clinical_indication}</p></div>}
                {detailReq.findings && <div className="bg-green-50 p-3 rounded-lg"><span className="text-xs font-semibold text-green-700">FINDINGS</span><p className="text-green-800 mt-1">{detailReq.findings}</p></div>}
                {detailReq.impression && <div className="bg-purple-50 p-3 rounded-lg"><span className="text-xs font-semibold text-purple-700">IMPRESSION</span><p className="text-purple-800 mt-1">{detailReq.impression}</p></div>}
                {detailReq.report_url && (
                  <a href={detailReq.report_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <FaFilePdf /> View Full Report
                  </a>
                )}
              </div>
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                <button onClick={() => setDetailReq(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
