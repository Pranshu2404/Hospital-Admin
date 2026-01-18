import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-toastify';
import { FaFileInvoiceDollar, FaPlus, FaSearch, FaPrint, FaEye, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

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
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
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

  // Stats
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    collectedToday: 0,
    overdueCount: 0,
    totalCollected: 0,
    totalBilled: 0
  });

  // Form State for Creating Bill
  const [appointments, setAppointments] = useState([]); // To select appointment
  const [newBill, setNewBill] = useState({
    appointment_id: '',
    patient_id: '', // Will be set automatically when appointment is selected
    items: [{ description: 'Consultation Fee', amount: 0 }],
    payment_method: 'Cash',
    status: 'Pending'
  });

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchBills();
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
      // Sort by latest date first
      const sortedData = res.data.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
      setInvoices(sortedData);
      calculateStats(sortedData);
    } catch (err) {
      console.error('Error fetching bills:', err);
      toast.error('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const today = new Date().toISOString().split('T')[0];

    // Total Outstanding (Pending)
    const outstanding = data
      .filter(inv => inv.status === 'Pending')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Collected Today (Paid & Today)
    const collectedToday = data
      .filter(inv => inv.status === 'Paid' && inv.generated_at?.startsWith(today))
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Overdue Count
    const overdue = data.filter(inv => inv.status === 'Pending' && new Date(inv.generated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

    // Total Collected (All Paid)
    const totalCollected = data
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Total Billed (Paid + Pending)
    // Note: If you have other statuses like 'Refunded', decide if they should be included. 
    // Usually Total Billed implies everything generated.
    // Spec says 'Paid + Pending' specifically.
    const totalBilled = data
      .filter(inv => ['Paid', 'Pending'].includes(inv.status))
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
      // Fetch appointments suitable for billing (e.g., Completed ones)
      // Ideally backend should support filtering by 'not billed', but for now fetching all completed
      const res = await apiClient.get('/appointments');
      // Filter locally for simplicity (optimize in real app)
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
        items: newBill.items // Controller expects 'items' which maps to 'details'
      };

      await apiClient.post('/billing', payload);
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      fetchBills();
      // Reset form
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

  const updateBillStatus = async (id, status) => {
    if (status === 'Paid' && !window.confirm("Are you sure you want to mark this invoice as Paid?")) {
      return;
    }
    try {
      await apiClient.put(`/billing/${id}`, { status });
      toast.success(`Bill marked as ${status}`);
      fetchBills();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status.');
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await apiClient.delete(`/billing/${id}`);
      toast.success('Invoice deleted.');
      fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
      toast.error('Failed to delete invoice.');
    }
  };

  const handleAppointmentSelect = (e) => {
    const aptId = e.target.value;
    const selectedApt = appointments.find(a => a._id === aptId);
    if (selectedApt) {
      setNewBill(prev => ({
        ...prev,
        appointment_id: aptId,
        patient_id: selectedApt.patient_id?._id || selectedApt.patient_id, // Handle populated or unpopulated
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

    // Search match
    const matchesSearch = patientName.toLowerCase().includes(term) ||
      (invoice._id && invoice._id.toLowerCase().includes(term));

    // Status match
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    // Date match
    let matchesDate = true;
    if (dateFilter.start && dateFilter.end) {
      const invoiceDate = new Date(invoice.generated_at).toISOString().split('T')[0];
      matchesDate = invoiceDate >= dateFilter.start && invoiceDate <= dateFilter.end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="bg-slate-50 min-h-screen p-6 font-sans">

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
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* Date Filter */}
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

              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <FaSearch className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or invoice ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice ID</th>
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
                    <td colSpan="6" className="text-center py-8 text-slate-500">Loading invoices...</td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">No invoices found.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        #{invoice._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex bg-white items-center">
                          <div className="ml-0">
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
                          {invoice.status === 'Pending' && (
                            <button
                              onClick={() => updateBillStatus(invoice._id, 'Paid')}
                              className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded-full"
                              title="Mark as Paid"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          <button
                            onClick={() => deleteBill(invoice._id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
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

                {/* Appointment Selection */}
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

                {/* Items */}
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

                {/* Payment Method */}
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
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                      value={newBill.status}
                      onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Total */}
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

        {/* View Details Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Invoice Details</h3>
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
                    <p className="text-xs text-slate-500 uppercase">Status</p>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase mb-2">Bill Items</p>
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    {/* The backend stores items in 'details' usually */}
                    {selectedInvoice.details && selectedInvoice.details.map((item, idx) => (
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