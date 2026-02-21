import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-toastify';
import { 
  FaFileInvoiceDollar, FaPlus, FaSearch, FaPrint, FaEye, 
  FaTrash, FaCheckCircle, FaExclamationCircle, FaMoneyBillWave,
  FaClock, FaInfoCircle
} from 'react-icons/fa';

// --- Reusable UI Components ---

// Card component for displaying key stats
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center transition-all hover:shadow-md">
    <div className={`p-4 rounded-full mr-4 ${colorClass} bg-opacity-10 text-xl`}>
      {icon}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Overdue: 'bg-red-100 text-red-700 border-red-200',
    Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    'Partially Paid': 'bg-blue-100 text-blue-700 border-blue-200',
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Generated: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Deletion Request Badge
const DeletionRequestBadge = ({ request }) => {
  if (!request) return null;
  
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  };
  
  return (
    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${statusStyles[request.status]}`}>
      <FaClock className="inline mr-1" />
      Deletion {request.status}
    </span>
  );
};

// --- Main Billing Component ---

function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Cash',
    reference: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    collectedToday: 0,
    overdueCount: 0,
    totalCollected: 0,
    totalBilled: 0
  });

  // Form State for Creating Bill
  const [appointments, setAppointments] = useState([]);
  const [newBill, setNewBill] = useState({
    appointment_id: '',
    patient_id: '',
    items: [{ description: 'Consultation Fee', amount: 0 }],
    payment_method: 'Cash',
    status: 'Pending'
  });

  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchBills();
    fetchHospitalInfo();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchAppointments();
    }
  }, [showCreateModal]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/billing');
      console.log(res.data.bills)
      const sortedData = res.data.bills.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
      setInvoices(sortedData);
      calculateStats(sortedData);
    } catch (err) {
      console.error('Error fetching bills:', err);
      toast.error('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const res = await apiClient.get('/hospitals');
      if (res.data && res.data.length > 0) {
        setHospitalInfo(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching hospital info:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const calculateStats = (data) => {
    const today = new Date().toISOString().split('T')[0];

    // Total Outstanding (Pending)
    const outstanding = data
      .filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Collected Today (Paid & Today)
    const collectedToday = data
      .filter(inv => inv.status === 'Paid' && inv.generated_at?.startsWith(today))
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Overdue Count
    const overdue = data.filter(inv => inv.status === 'Pending').length;

    // Total Collected (All Paid)
    const totalCollected = data
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Total Billed (Paid + Pending + Partially Paid)
    const totalBilled = data
      .filter(inv => ['Paid', 'Pending', 'Partially Paid'].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    setStats({
      totalOutstanding: outstanding,
      collectedToday: collectedToday,
      overdueCount: overdue,
      totalCollected: totalCollected,
      totalBilled: totalBilled
    });
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/appointments');
      const completedConfig = res.data.filter(apt => apt.status === 'Completed');
      setAppointments(completedConfig);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments.');
    }
  };

  const handleCreateBill = async () => {
    try {
      if (!newBill.appointment_id) {
        toast.warning('Please select an appointment.');
        return;
      }

      const total_amount = newBill.items.reduce((sum, item) => sum + Number(item.amount), 0);

      const payload = {
        ...newBill,
        total_amount,
        items: newBill.items
      };

      await apiClient.post('/billing', payload);
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      fetchBills();
      setNewBill({
        appointment_id: '',
        patient_id: '',
        items: [{ description: 'Consultation Fee', amount: 0 }],
        payment_method: 'Cash',
        status: 'Pending'
      });
    } catch (err) {
      console.error('Error creating bill:', err);
      toast.error(err.response?.data?.error || 'Failed to create invoice.');
    }
  };

  const updateBillStatus = async (id, status, paymentData = null) => {
    if (status === 'Paid' && !paymentData) {
      const bill = invoices.find(inv => inv._id === id);
      setSelectedInvoice(bill);
      setPaymentData({
        amount: String(bill.total_amount - (bill.paid_amount || 0)),
        method: 'Cash',
        reference: ''
      });
      setShowPaymentModal(true);
      return;
    }

    const confirmMessage = status === 'Paid' 
      ? `Mark this bill as PAID?\nAmount: ₹${paymentData?.amount || ''}`
      : `Update bill status to ${status}?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      let payload: {
        status: string;
        paid_amount?: number;
        payment_method?: string;
        notes?: string;
      } = { status };

      if (paymentData) {
        payload.paid_amount = parseFloat(paymentData.amount);
        payload.payment_method = paymentData.method;
        if (paymentData.reference) payload.notes = `Ref: ${paymentData.reference}`;
      }

      await apiClient.put(`/billing/${id}`, payload);
      toast.success(`Bill updated to ${status}`);
      setShowPaymentModal(false);
      fetchBills();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const requestDeletion = async (id) => {
    if (!deletionReason.trim()) {
      toast.warning('Please provide a reason for deletion');
      return;
    }

    try {
      await apiClient.post(`/billing/${id}/request-deletion`, { reason: deletionReason });
      toast.success('Deletion request submitted to admin');
      setShowDeletionModal(false);
      setDeletionReason('');
      fetchBills();
    } catch (err) {
      console.error('Error requesting deletion:', err);
      toast.error(err.response?.data?.error || 'Failed to request deletion');
    }
  };

  const handleAppointmentSelect = (e) => {
    const aptId = e.target.value;
    const selectedApt = appointments.find(a => a._id === aptId);
    if (selectedApt) {
      setNewBill(prev => ({
        ...prev,
        appointment_id: aptId,
        patient_id: selectedApt.patient_id?._id || selectedApt.patient_id,
      }));
    } else {
      setNewBill(prev => ({ ...prev, appointment_id: '', patient_id: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newBill.items];
    updatedItems[index][field] = value;
    setNewBill(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setNewBill(prev => ({ ...prev, items: [...prev.items, { description: '', amount: 0 }] }));
  };

  const removeItem = (index) => {
    const updatedItems = newBill.items.filter((_, i) => i !== index);
    setNewBill(prev => ({ ...prev, items: updatedItems }));
  };

  // Searching & Filtering
  const filteredInvoices = invoices.filter(invoice => {
    const patientName = invoice.patient_id ? `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}` : 'Unknown';
    const term = searchTerm.toLowerCase();

    const matchesSearch = patientName.toLowerCase().includes(term) ||
      (invoice._id && invoice._id.toLowerCase().includes(term)) ||
      (invoice.invoice_id?.invoice_number || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    let matchesDate = true;
    if (dateFilter.start && dateFilter.end) {
      const invoiceDate = new Date(invoice.generated_at).toISOString().split('T')[0];
      matchesDate = invoiceDate >= dateFilter.start && invoiceDate <= dateFilter.end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getPatientName = () => {
    if (!selectedInvoice) return 'N/A';
    if (selectedInvoice.patient_id) {
      return `${selectedInvoice.patient_id.first_name || ''} ${selectedInvoice.patient_id.last_name || ''}`.trim();
    }
    return 'Unknown';
  };

  const getDoctorName = () => {
    if (!selectedInvoice) return 'N/A';

    let doc = null;

    if (selectedInvoice.doctor_id) {
      if (typeof selectedInvoice.doctor_id === 'object') {
        doc = selectedInvoice.doctor_id;
      } else {
        doc = doctors.find(d => d._id === selectedInvoice.doctor_id);
      }
    }

    if (!doc && selectedInvoice.appointment_id && typeof selectedInvoice.appointment_id === 'object') {
      const appt = selectedInvoice.appointment_id;
      if (appt.doctor_id) {
        if (typeof appt.doctor_id === 'object') {
          doc = appt.doctor_id;
        } else {
          doc = doctors.find(d => d._id === appt.doctor_id);
        }
      }
    }

    if (doc && (doc.firstName || doc.first_name || doc.name)) {
      return `${doc.firstName || doc.first_name || doc.name || ''} ${doc.lastName || doc.last_name || ''}`.trim();
    }

    return 'N/A';
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff" resetProgress={() => {}}>
      <div className="bg-slate-50 min-h-screen p-6 font-sans">

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body, html {
              height: 100%;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            body * { 
              visibility: hidden; 
            }
            .printable-invoice-container, .printable-invoice-container * {
              visibility: visible;
            }
            .printable-invoice-container {
              position: fixed;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              z-index: 9999;
              background: white;
            }
            .printable-invoice { 
              width: 210mm;
              min-height: 297mm;
              padding: 10mm;
              background: white;
              font-size: 11pt;
              box-sizing: border-box;
            }
            .invoice-header {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              width: 100% !important;
              border-bottom: 4px double #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .logo-area {
              width: 100px;
              height: 100px;
            }
            .logo-area img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .hospital-details {
              text-align: center;
              flex: 1;
              padding: 0 20px;
            }
            .hospital-name {
              font-family: "Times New Roman", Times, serif;
              font-size: 24pt;
              font-weight: bold;
              text-transform: uppercase;
              margin: 0;
            }
            .hospital-address {
              font-size: 10pt;
              margin-top: 5px;
            }
            .invoice-title-box {
              border: 2px solid #333;
              padding: 5px 10px;
              text-align: center;
              text-transform: uppercase;
              font-weight: bold;
              font-size: 14pt;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
              font-size: 11pt;
            }
            .details-item {
              display: flex;
            }
            .details-label {
              font-weight: bold;
              width: 120px;
              color: #444;
            }
            .details-value {
              font-weight: 600;
            }
            table.invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table.invoice-table th, table.invoice-table td {
              border-bottom: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            table.invoice-table th {
              background-color: #f3f4f6 !important;
              text-transform: uppercase;
              font-size: 9pt;
              -webkit-print-color-adjust: exact;
            }
            .footer-section {
              margin-top: 40px;
              border-top: 1px dashed #aaa;
              padding-top: 10px;
              text-align: center;
              font-size: 9pt;
              color: #666;
            }
            .no-print { display: none !important; }
          }
          @media screen {
            .printable-invoice-container {
              display: none;
            }
          }
        `}</style>

        {/* Hidden Printable Invoice Structure */}
        {selectedInvoice && (
          <div className="printable-invoice-container">
            <div className="printable-invoice">
              <div className="invoice-header">
                <div className="logo-area">
                  {hospitalInfo?.logo ? (
                    <img src={hospitalInfo.logo} alt="Logo" />
                  ) : (
                    <div className="w-full h-full border border-dashed flex items-center justify-center text-xs">LOGO</div>
                  )}
                </div>
                <div className="hospital-details">
                  <h1 className="hospital-name">{hospitalInfo?.hospitalName || 'HOSPITAL NAME'}</h1>
                  <div className="hospital-address">
                    <p>{hospitalInfo?.address || 'Address Line 1, Address Line 2'}</p>
                    <p>Phone: {hospitalInfo?.contact || 'N/A'}</p>
                    {hospitalInfo?.email && <p>Email: {hospitalInfo.email}</p>}
                  </div>
                </div>
                <div>
                  <div className="invoice-title-box">INVOICE</div>
                  <div className="text-center text-xs mt-1">
                    {selectedInvoice.status === 'Paid' ? '(PAID)' : '(PENDING)'}
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="details-item">
                  <span className="details-label">Invoice No:</span>
                  <span className="details-value">#{selectedInvoice._id?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="details-item">
                  <span className="details-label">Date:</span>
                  <span className="details-value">{new Date(selectedInvoice.generated_at).toLocaleDateString()}</span>
                </div>
                <div className="details-item">
                  <span className="details-label">Patient Name:</span>
                  <span className="details-value">{getPatientName()}</span>
                </div>
                <div className="details-item">
                  <span className="details-label">Patient ID:</span>
                  <span className="details-value">{selectedInvoice.patient_id?.patientId || 'N/A'}</span>
                </div>
                <div className="details-item">
                  <span className="details-label">Doctor:</span>
                  <span className="details-value">{getDoctorName()}</span>
                </div>
                <div className="details-item">
                  <span className="details-label">Payment Mode:</span>
                  <span className="details-value">{selectedInvoice.payment_method}</span>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td style={{ textAlign: 'right' }}>{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>TOTAL:</td>
                    <td style={{ textAlign: 'right' }}>₹{selectedInvoice.total_amount?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="footer-section">
                <p>This is a computer-generated invoice and needs no signature.</p>
                <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'}.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaFileInvoiceDollar className="text-teal-500" /> Billing Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage invoices, payments and financial records.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-teal-700 transition-colors shadow-md flex items-center gap-2"
          >
            <FaPlus /> Create New Invoice
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Billed"
            value={`₹${stats.totalBilled.toLocaleString()}`}
            icon={<FaFileInvoiceDollar className="text-blue-500" />}
            colorClass="bg-blue-500 text-blue-500"
          />
          <StatCard
            title="Total Collected"
            value={`₹${stats.totalCollected.toLocaleString()}`}
            icon={<FaCheckCircle className="text-green-600" />}
            colorClass="bg-green-600 text-green-600"
          />
          <StatCard
            title="Outstanding"
            value={`₹${stats.totalOutstanding.toLocaleString()}`}
            icon={<FaExclamationCircle className="text-amber-500" />}
            colorClass="bg-amber-500 text-amber-500"
          />
          <StatCard
            title="Collected Today"
            value={`₹${stats.collectedToday.toLocaleString()}`}
            icon={<FaCheckCircle className="text-emerald-500" />}
            colorClass="bg-emerald-500 text-emerald-500"
          />
          <StatCard
            title="Overdue Invoices"
            value={stats.overdueCount}
            icon={<div className="font-bold font-mono">!</div>}
            colorClass="bg-red-500 text-red-500"
          />
        </div>

        {/* Invoice Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-700">Recent Invoices</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Refunded">Refunded</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="relative flex-1 md:flex-none">
                <FaSearch className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bill ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="text-center py-8 text-slate-500">Loading invoices...</td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td className="text-center py-8 text-slate-500">No invoices found.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-mono text-slate-600">
                            #{invoice._id.slice(-6).toUpperCase()}
                          </span>
                          {invoice.deletion_request && invoice.deletion_request.status === 'pending' && (
                            <DeletionRequestBadge request={invoice.deletion_request} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.invoice_id ? (
                          <span className="text-sm font-mono text-teal-600">
                            {invoice.invoice_id.invoice_number}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No invoice</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {invoice.patient_id ? `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}` : 'Unknown Patient'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {invoice.appointment_id ? `Appt: ${new Date(invoice.appointment_id.appointment_date).toLocaleDateString()}` : 'No Appt'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(invoice.generated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                        ₹{invoice.total_amount?.toLocaleString()}
                        {invoice.paid_amount > 0 && (
                          <div className="text-xs text-green-600 font-normal">
                            Paid: ₹{invoice.paid_amount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedInvoice(invoice); setShowViewModal(true); }}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {invoice.status !== 'Paid' && !invoice.deletion_request && (
                            <button
                              onClick={() => updateBillStatus(invoice._id, 'Paid')}
                              className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded-full"
                              title="Mark as Paid"
                            >
                              <FaMoneyBillWave />
                            </button>
                          )}

                          {!invoice.deletion_request && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowDeletionModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                              title="Request Deletion"
                            >
                              <FaTrash />
                            </button>
                          )}

                          {invoice.deletion_request && invoice.deletion_request.status === 'pending' && (
                            <span className="text-xs text-yellow-600" title="Deletion request pending">
                              <FaClock />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-slate-800">Create New Invoice</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Completed Appointment</label>
                  <select
                    value={newBill.appointment_id}
                    onChange={handleAppointmentSelect}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">-- Choose Appointment --</option>
                    {appointments.map(apt => (
                      <option key={apt._id} value={apt._id}>
                        {new Date(apt.appointment_date).toLocaleDateString()} - {apt.patient_id?.first_name} {apt.patient_id?.last_name} ({apt.doctor_id?.firstName} {apt.doctor_id?.lastName})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Only displaying completed appointments.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bill Items</label>
                  {newBill.items.map((item, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Description (e.g., Consultation)"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', Number(e.target.value))}
                        className="w-32 p-2 border border-slate-200 rounded-lg text-sm"
                      />
                      {newBill.items.length > 1 && (
                        <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><FaTrash /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addItem} className="text-sm text-teal-600 font-semibold hover:underline flex items-center gap-1">
                    <FaPlus className="text-xs" /> Add Item
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                    <select
                      value={newBill.payment_method}
                      onChange={(e) => setNewBill({ ...newBill, payment_method: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Government Scheme">Government Scheme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Status</label>
                    <select
                      value={newBill.status}
                      onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-700">Total Amount:</span>
                  <span className="text-xl font-bold text-teal-600">
                    ₹{newBill.items.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBill}
                  className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-md"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Request Modal */}
        {showDeletionModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Request Deletion</h3>
                <button onClick={() => { setShowDeletionModal(false); setDeletionReason(''); }} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <FaExclamationCircle className="inline mr-2" />
                    This will send a deletion request to admin for approval. The bill will be temporarily hidden until approved.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Deletion <span className="text-red-500">*</span></label>
                  <textarea
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for deletion..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">Bill Amount: <span className="font-bold">₹{selectedInvoice.total_amount}</span></p>
                  <p className="text-sm text-slate-600">Patient: {getPatientName()}</p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeletionModal(false); setDeletionReason(''); }}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => requestDeletion(selectedInvoice._id)}
                  disabled={!deletionReason.trim()}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Process Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Invoice Amount</p>
                  <p className="text-2xl font-bold text-slate-800">₹{selectedInvoice.total_amount?.toLocaleString()}</p>
                  {selectedInvoice.paid_amount > 0 && (
                    <>
                      <p className="text-sm text-slate-600 mt-2">Paid Amount</p>
                      <p className="text-lg font-semibold text-green-600">₹{selectedInvoice.paid_amount?.toLocaleString()}</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    max={selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Government Scheme">Government Scheme</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="Transaction ID / Cheque No"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateBillStatus(selectedInvoice._id, 'Paid', paymentData);
                  }}
                  className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-md"
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Bill Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between border-b pb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Patient</p>
                    <p className="font-bold text-slate-800 text-lg">
                      {selectedInvoice.patient_id ? `${selectedInvoice.patient_id.first_name} ${selectedInvoice.patient_id.last_name}` : 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">{selectedInvoice.patient_id?.patientId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase mb-2 mr-2">Status</p>
                    <StatusBadge status={selectedInvoice.status} />
                    {selectedInvoice.deletion_request && (
                      <div className="mt-2">
                        <DeletionRequestBadge request={selectedInvoice.deletion_request} />
                      </div>
                    )}
                  </div>
                </div>

                {selectedInvoice.invoice_id && (
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-xs text-teal-700 uppercase">Linked Invoice</p>
                    <p className="font-mono font-bold text-teal-800">{selectedInvoice.invoice_id.invoice_number}</p>
                  </div>
                )}

                {selectedInvoice.deletion_request && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-700 uppercase">Deletion Request</p>
                    <p className="text-sm"><span className="font-medium">Reason:</span> {selectedInvoice.deletion_request.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Requested on: {new Date(selectedInvoice.deletion_request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 uppercase mb-2">Bill Items</p>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700">{item.description}</span>
                        <span className="font-semibold">₹{item.amount}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span>₹{selectedInvoice.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Payment Method</p>
                    <p className="font-medium">{selectedInvoice.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium">{new Date(selectedInvoice.generated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedInvoice.paid_amount > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 uppercase">Payment History</p>
                    <p className="text-sm">Paid: ₹{selectedInvoice.paid_amount}</p>
                    <p className="text-xs text-slate-500">Balance: ₹{selectedInvoice.total_amount - selectedInvoice.paid_amount}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => window.print()} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mr-4">
                  <FaPrint /> Print
                </button>
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Billing;