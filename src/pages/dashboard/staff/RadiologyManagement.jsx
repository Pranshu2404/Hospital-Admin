import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import {
  FaXRay, FaClock, FaCheckCircle, FaTimesCircle, FaSearch,
  FaCalendarAlt, FaUserMd, FaUserInjured, FaEye, FaFilePdf,
  FaMoneyBillWave, FaTachometerAlt, FaBrain, FaHeartbeat,
  FaProcedures, FaDownload, FaUpload, FaCheck, FaTimes,
  FaArrowRight, FaExclamationTriangle, FaFilter, FaPlus,
  FaReceipt, FaFileInvoice, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const BASE = import.meta.env.VITE_BACKEND_URL;

const StatusBadge = ({ status }) => {
  const cfg = {
    'Pending':     'bg-amber-100 text-amber-700',
    'Approved':    'bg-green-100 text-green-700',
    'Scheduled':   'bg-blue-100 text-blue-700',
    'In Progress': 'bg-indigo-100 text-indigo-700',
    'Completed':   'bg-emerald-100 text-emerald-700',
    'Reported':    'bg-purple-100 text-purple-700',
    'Cancelled':   'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const cfg = { 'Routine': 'bg-slate-100 text-slate-600', 'Urgent': 'bg-orange-100 text-orange-700', 'Emergency': 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg[priority] || cfg.Routine}`}>{priority}</span>;
};

export default function RadiologyManagement() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [sourceF, setSourceF] = useState('all');
  const [dateF, setDateF] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, reported: 0, revenue: 0 });
  const [detailModal, setDetailModal] = useState({ show: false, req: null });
  const [statusModal, setStatusModal] = useState({ show: false, req: null, status: '', notes: '' });
  const [uploadModal, setUploadModal] = useState({ show: false, req: null, file: null, findings: '', impression: '' });
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  // Payment/Billing States
  const [paymentModal, setPaymentModal] = useState({ show: false, req: null, amount: 0, method: 'Cash', reference: '' });
  const [generatedBill, setGeneratedBill] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Create order state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [imagingTests, setImagingTests] = useState([]);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', imagingTestId: '', sourceType: 'OPD',
    clinical_indication: '', clinical_history: '', priority: 'Routine',
    scheduledDate: '', patient_notes: ''
  });

  useEffect(() => { fetchRequests(); fetchDoctors(); fetchPatients(); fetchTests(); }, []);
  useEffect(() => { filterRequests(); }, [requests, search, statusF, sourceF, dateF]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/radiology/requests?limit=200`);
      const data = res.data.data || [];
      setRequests(data);
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'Pending').length,
        completed: data.filter(r => r.status === 'Completed').length,
        reported: data.filter(r => r.status === 'Reported').length,
        revenue: data.filter(r => r.is_billed).reduce((s, r) => s + (r.cost || 0), 0),
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try { const res = await axios.get(`${BASE}/doctors`); setDoctors(Array.isArray(res.data) ? res.data : res.data?.data || []); } catch (e) { console.error(e); }
  };
  const fetchPatients = async () => {
    try { const res = await axios.get(`${BASE}/patients`); setPatients(Array.isArray(res.data) ? res.data : (res.data?.patients || res.data?.data || [])); } catch (e) { console.error(e); }
  };
  const fetchTests = async () => {
    try { const res = await axios.get(`${BASE}/radiology/tests?active_only=true`); setImagingTests(res.data.data || []); } catch (e) { console.error(e); }
  };

  const createRequest = async () => {
    if (!form.patientId || !form.doctorId || !form.imagingTestId) { alert('Patient, Doctor, and Imaging Test are required'); return; }
    setCreating(true);
    try {
      const response = await axios.post(`${BASE}/radiology/requests`, form);
      setMsg('Radiology request created successfully!');
      setShowCreate(false);
      setForm({ patientId: '', doctorId: '', imagingTestId: '', sourceType: 'OPD', clinical_indication: '', clinical_history: '', priority: 'Routine', scheduledDate: '', patient_notes: '' });
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); alert(e.response?.data?.error || 'Failed to create request'); } finally { setCreating(false); }
  };

  const filterRequests = () => {
    let f = [...requests];
    if (search) { const t = search.toLowerCase(); f = f.filter(r => r.requestNumber?.toLowerCase().includes(t) || r.testName?.toLowerCase().includes(t) || r.patientId?.first_name?.toLowerCase().includes(t) || r.patientId?.last_name?.toLowerCase().includes(t)); }
    if (statusF !== 'all') f = f.filter(r => r.status === statusF);
    if (sourceF !== 'all') f = f.filter(r => r.sourceType === sourceF);
    if (dateF.start || dateF.end) f = f.filter(r => { const d = new Date(r.requestedDate).toISOString().split('T')[0]; return (!dateF.start || d >= dateF.start) && (!dateF.end || d <= dateF.end); });
    setFiltered(f);
  };

  const updateStatus = async () => {
    if (!statusModal.req) return;
    setProcessing(true);
    try {
      await axios.patch(`${BASE}/radiology/requests/${statusModal.req._id}/status`, { status: statusModal.status, notes: statusModal.notes });
      setMsg(`Status updated to ${statusModal.status}`);
      setStatusModal({ show: false, req: null, status: '', notes: '' });
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); alert('Failed to update status'); } finally { setProcessing(false); }
  };

  const uploadReport = async () => {
    if (!uploadModal.req || !uploadModal.file) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append('report', uploadModal.file);
      fd.append('findings', uploadModal.findings);
      fd.append('impression', uploadModal.impression);
      await axios.post(`${BASE}/radiology/requests/${uploadModal.req._id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Report uploaded successfully!');
      setUploadModal({ show: false, req: null, file: null, findings: '', impression: '' });
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); alert('Failed to upload report'); } finally { setProcessing(false); }
  };

  // ========== PAYMENT / BILLING FUNCTIONS ==========
  
  // Generate bill for radiology request
  const generateBillForRequest = async (request, paymentMethod = 'Cash') => {
    try {
      const billItem = {
        description: `${request.testCode} - ${request.testName}`,
        amount: request.cost || 0,
        quantity: 1,
        item_type: 'Radiology',
        radiology_test_code: request.testCode,
        radiology_test_id: request._id,
        prescription_id: request.prescriptionId
      };
      
      const billResponse = await axios.post(`${BASE}/billing`, {
        patient_id: request.patientId?._id || request.patientId,
        appointment_id: request.appointmentId,
        prescription_id: request.prescriptionId,
        admission_id: request.admissionId,
        items: [billItem],
        total_amount: request.cost || 0,
        subtotal: request.cost || 0,
        discount: 0,
        tax_amount: 0,
        payment_method: paymentMethod,
        status: paymentMethod !== 'Pending' ? 'Paid' : 'Generated',
        notes: `Bill for radiology test ${request.testName}`
      });
      
      // Mark request as billed
      await axios.patch(`${BASE}/radiology/requests/${request._id}/billed`, {
        invoiceId: billResponse.data.invoice?._id
      });
      
      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);
      setShowSuccessModal(true);
      fetchRequests();
      return billResponse.data;
    } catch (error) {
      console.error('Error generating bill:', error);
      throw error;
    }
  };

  // Collect Payment for radiology request
  const handleCollectPayment = (request) => {
    setPaymentModal({
      show: true,
      req: request,
      amount: request.cost || 0,
      method: 'Cash',
      reference: ''
    });
  };

  const processPayment = async () => {
    if (!paymentModal.req) return;
    setProcessing(true);
    try {
      await generateBillForRequest(paymentModal.req, paymentModal.method);
      setPaymentModal({ show: false, req: null, amount: 0, method: 'Cash', reference: '' });
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const markBilled = async (req) => {
    try {
      await axios.patch(`${BASE}/radiology/requests/${req._id}/billed`, {});
      setMsg('Marked as billed');
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  // Helper to check if payment button should be shown
  const needsPayment = (req) => {
    return !req.is_billed && req.status !== 'Cancelled' && req.status !== 'Pending';
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  const getNextStatuses = (current) => {
    const flow = { 'Pending': ['Approved', 'Cancelled'], 'Approved': ['Scheduled', 'In Progress', 'Cancelled'], 'Scheduled': ['In Progress', 'Cancelled'], 'In Progress': ['Completed', 'Cancelled'], 'Completed': ['Reported'] };
    return flow[current] || [];
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FaXRay className="text-emerald-600" /> Radiology Management</h1>
            <p className="text-slate-500 mt-1">Manage radiology requests, track workflow, upload reports, and process payments</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-colors">
            <FaPlus /> New Radiology Request
          </button>
        </div>

        {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium flex items-center gap-2"><FaCheckCircle /> {msg}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', val: stats.total, icon: <FaXRay />, bg: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending', val: stats.pending, icon: <FaClock />, bg: 'bg-amber-100 text-amber-600' },
            { label: 'Completed', val: stats.completed, icon: <FaCheckCircle />, bg: 'bg-blue-100 text-blue-600' },
            { label: 'Reported', val: stats.reported, icon: <FaFilePdf />, bg: 'bg-purple-100 text-purple-600' },
            { label: 'Revenue', val: `₹${stats.revenue.toLocaleString()}`, icon: <FaMoneyBillWave />, bg: 'bg-teal-100 text-teal-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.val}</p></div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search request, patient, test..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <select value={statusF} onChange={e => setStatusF(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="all">All Status</option>
              {['Pending','Approved','Scheduled','In Progress','Completed','Reported','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sourceF} onChange={e => setSourceF(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="all">All Sources</option>
              <option value="OPD">OPD</option><option value="IPD">IPD</option><option value="Emergency">Emergency</option>
            </select>
            <input type="date" value={dateF.start} onChange={e => setDateF({...dateF, start: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg" />
            <input type="date" value={dateF.end} onChange={e => setDateF({...dateF, end: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
        </div>

        <div className="mb-3 text-sm text-slate-500">Showing {filtered.length} of {requests.length} requests</div>

        {/* Request Cards */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <FaXRay className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Requests Found</h3>
            <p className="text-slate-500">No radiology requests match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => (
              <div key={req._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">{req.requestNumber}</span>
                      <StatusBadge status={req.status} />
                      <PriorityBadge priority={req.priority} />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${req.sourceType === 'IPD' ? 'bg-purple-100 text-purple-700' : req.sourceType === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{req.sourceType}</span>
                      {req.is_billed && <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">💰 Billed</span>}
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">{req.testName}</h4>
                    <p className="text-sm text-slate-500">{req.testCode} • {req.category}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-slate-600">
                      <div><span className="text-xs text-slate-400 block">Patient</span><span className="font-medium">{req.patientId?.first_name} {req.patientId?.last_name}</span></div>
                      <div><span className="text-xs text-slate-400 block">Doctor</span><span className="font-medium">Dr. {req.doctorId?.firstName} {req.doctorId?.lastName}</span></div>
                      <div><span className="text-xs text-slate-400 block">Requested</span><span className="font-medium">{fmtDate(req.requestedDate)}</span></div>
                      <div><span className="text-xs text-slate-400 block">Cost</span><span className="font-bold text-emerald-700">₹{req.cost || 0}</span></div>
                    </div>
                    {req.clinical_indication && <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700"><strong>Indication:</strong> {req.clinical_indication}</div>}
                  </div>
                </div>

                {/* Workflow Progress */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    {['Pending','Approved','In Progress','Completed','Reported'].map((step, i) => {
                      const steps = ['Pending','Approved','In Progress','Completed','Reported'];
                      const currentIdx = steps.indexOf(req.status);
                      const done = i <= currentIdx;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {done ? <FaCheckCircle size={12} /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                            </div>
                            <span className={done ? 'text-emerald-600 font-medium' : 'text-slate-400'}>{step}</span>
                          </div>
                          {i < 4 && <FaArrowRight className="text-slate-300 mt-[-12px]" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => setDetailModal({ show: true, req })} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"><FaEye /> Details</button>
                  
                  {getNextStatuses(req.status).map(ns => (
                    <button key={ns} onClick={() => setStatusModal({ show: true, req, status: ns, notes: '' })}
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${ns === 'Cancelled' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                      {ns === 'Cancelled' ? <FaTimes /> : <FaCheck />} {ns}
                    </button>
                  ))}
                  
                  {(req.status === 'Completed' || req.status === 'In Progress') && !req.report_url && (
                    <button onClick={() => setUploadModal({ show: true, req, file: null, findings: '', impression: '' })} className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"><FaUpload /> Upload Report</button>
                  )}
                  
                  {req.report_url && (
                    <a href={req.report_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"><FaFilePdf /> View Report</a>
                  )}

                  {/* PAYMENT BUTTON - Shows when payment is needed */}
                  {needsPayment(req) && (
                    <button onClick={() => handleCollectPayment(req)} className="px-3 py-1.5 text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg flex items-center gap-1 font-semibold border border-teal-200">
                      <FaMoneyBillWave /> Collect Payment
                    </button>
                  )}
                  
                  {!req.is_billed && req.status !== 'Cancelled' && req.status !== 'Pending' && (
                    <button onClick={() => markBilled(req)} className="px-3 py-1.5 text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1">
                      <FaCheck /> Mark Billed (Manual)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== PAYMENT MODAL ========== */}
        {paymentModal.show && paymentModal.req && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaMoneyBillWave className="text-teal-600" /> Collect Payment</h3>
                <p className="text-slate-500 text-sm mt-1">{paymentModal.req.testName} - Radiology Test</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-teal-50 rounded-lg p-4">
                  <div className="text-sm text-teal-700 mb-2">Test Cost</div>
                  <div className="text-3xl font-bold text-teal-800">₹{paymentModal.req.cost || 0}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Amount</label>
                  <input type="number" value={paymentModal.amount} onChange={e => setPaymentModal({...paymentModal, amount: Number(e.target.value)})} className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold" min="0" max={paymentModal.req.cost} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <select value={paymentModal.method} onChange={e => setPaymentModal({...paymentModal, method: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg">
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reference/Transaction ID</label>
                  <input type="text" value={paymentModal.reference} onChange={e => setPaymentModal({...paymentModal, reference: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Enter reference number" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setPaymentModal({ show: false, req: null, amount: 0, method: 'Cash', reference: '' })} className="px-4 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100">Cancel</button>
                <button onClick={processPayment} disabled={processing} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 flex items-center gap-2">
                  {processing ? <><FaSpinner className="animate-spin" /> Processing...</> : <><FaMoneyBillWave /> Process Payment</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== SUCCESS MODAL ========== */}
        {showSuccessModal && generatedBill && generatedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Success!</h3>
                <p className="text-slate-500 text-sm mt-1">Bill and Invoice created successfully</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Bill Created</div>
                  <div className="font-bold">Bill ID: {generatedBill._id?.slice(-8)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-700 mb-2">Invoice Generated</div>
                  <div className="font-bold">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div>
                  <div>Amount: ₹{generatedInvoice.total}</div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowSuccessModal(false)} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== OTHER MODALS (Detail, Status, Upload, Create) ========== */}
        {/* Detail Modal */}
        {detailModal.show && detailModal.req && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FaXRay className="text-emerald-600" /> Request Details</h2>
                <button onClick={() => setDetailModal({ show: false, req: null })} className="p-2 hover:bg-slate-100 rounded-lg"><FaTimes className="text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded font-bold">{detailModal.req.requestNumber}</span>
                  <StatusBadge status={detailModal.req.status} />
                  <PriorityBadge priority={detailModal.req.priority} />
                  {detailModal.req.is_billed && <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">💰 Paid</span>}
                </div>
                <h3 className="text-2xl font-bold">{detailModal.req.testName}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Test Code', detailModal.req.testCode],
                    ['Category', detailModal.req.category],
                    ['Source', detailModal.req.sourceType],
                    ['Cost', `₹${detailModal.req.cost || 0}`],
                    ['Patient', `${detailModal.req.patientId?.first_name || ''} ${detailModal.req.patientId?.last_name || ''}`],
                    ['Doctor', `Dr. ${detailModal.req.doctorId?.firstName || ''} ${detailModal.req.doctorId?.lastName || ''}`],
                    ['Requested', fmtDate(detailModal.req.requestedDate)],
                    ['Scheduled', fmtDate(detailModal.req.scheduledDate)],
                    ['Billed', detailModal.req.is_billed ? 'Yes' : 'No'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-xs text-slate-400 uppercase font-semibold">{label}</span>
                      <p className="font-medium text-slate-800">{val}</p>
                    </div>
                  ))}
                </div>
                {detailModal.req.clinical_indication && <div className="bg-blue-50 p-3 rounded-lg"><span className="text-xs font-semibold text-blue-700">CLINICAL INDICATION</span><p className="text-blue-800 mt-1">{detailModal.req.clinical_indication}</p></div>}
                {detailModal.req.findings && <div className="bg-green-50 p-3 rounded-lg"><span className="text-xs font-semibold text-green-700">FINDINGS</span><p className="text-green-800 mt-1">{detailModal.req.findings}</p></div>}
                {detailModal.req.impression && <div className="bg-purple-50 p-3 rounded-lg"><span className="text-xs font-semibold text-purple-700">IMPRESSION</span><p className="text-purple-800 mt-1">{detailModal.req.impression}</p></div>}
                {detailModal.req.technician_notes && <div className="bg-amber-50 p-3 rounded-lg"><span className="text-xs font-semibold text-amber-700">TECHNICIAN NOTES</span><p className="text-amber-800 mt-1">{detailModal.req.technician_notes}</p></div>}
              </div>
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setDetailModal({ show: false, req: null })} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Close</button>
                {needsPayment(detailModal.req) && (
                  <button onClick={() => { setDetailModal({ show: false, req: null }); handleCollectPayment(detailModal.req); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
                    <FaMoneyBillWave /> Collect Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {statusModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4">Update Status to: <span className="text-emerald-600">{statusModal.status}</span></h3>
              <textarea rows={3} placeholder="Add notes (optional)..." value={statusModal.notes} onChange={e => setStatusModal({...statusModal, notes: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <div className="flex gap-3">
                <button onClick={() => setStatusModal({ show: false, req: null, status: '', notes: '' })} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={updateStatus} disabled={processing} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">{processing ? 'Updating...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {uploadModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaUpload className="text-purple-600" /> Upload Radiology Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Report File (PDF/Image)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadModal({...uploadModal, file: e.target.files[0]})} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Findings</label>
                  <textarea rows={3} value={uploadModal.findings} onChange={e => setUploadModal({...uploadModal, findings: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Enter findings..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Impression</label>
                  <textarea rows={2} value={uploadModal.impression} onChange={e => setUploadModal({...uploadModal, impression: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Enter impression..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setUploadModal({ show: false, req: null, file: null, findings: '', impression: '' })} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={uploadReport} disabled={processing || !uploadModal.file} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{processing ? 'Uploading...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><FaXRay className="text-emerald-600" /> New Radiology Request</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FaTimes /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Patient *</label>
                    <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg">
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.first_name} {p.last_name} ({p.patientId || p.phone})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Doctor *</label>
                    <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg">
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Imaging Test *</label>
                    <select value={form.imagingTestId} onChange={e => setForm({...form, imagingTestId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg">
                      <option value="">Select Test</option>
                      {imagingTests.map(t => <option key={t._id} value={t._id}>{t.name} ({t.code}) - ₹{t.base_price}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Source Type</label>
                    <select value={form.sourceType} onChange={e => setForm({...form, sourceType: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg">
                      <option value="OPD">OPD</option><option value="IPD">IPD</option><option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg">
                      <option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Scheduled Date</label>
                    <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Clinical Indication</label>
                  <textarea rows={2} value={form.clinical_indication} onChange={e => setForm({...form, clinical_indication: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Clinical reason for the test..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Clinical History</label>
                  <textarea rows={2} value={form.clinical_history} onChange={e => setForm({...form, clinical_history: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Relevant clinical history..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Notes for Patient</label>
                  <textarea rows={2} value={form.patient_notes} onChange={e => setForm({...form, patient_notes: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Instructions for patient (e.g. fasting, preparation)..." />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={createRequest} disabled={creating} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{creating ? 'Creating...' : 'Create Request'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}