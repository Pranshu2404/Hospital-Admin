import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaMoneyBillWave, FaArrowLeft, FaDownload, FaPrint, 
  FaReceipt, FaPlus, FaCreditCard, FaFileInvoiceDollar, 
  FaBed, FaUserMd, FaFlask, FaPills, FaSyringe, FaHospitalUser
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const RunningBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [admission, setAdmission] = useState(null);
  const [runningBill, setRunningBill] = useState(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    reference: '',
    notes: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [newCharge, setNewCharge] = useState({
    chargeType: 'Miscellaneous',
    description: '',
    quantity: 1,
    rate: 0,
    notes: ''
  });

  useEffect(() => {
    // Check if we have an ID from params
    if (!id) {
      setError('No admission ID provided');
      setLoading(false);
      return;
    }
    fetchRunningBill();
  }, [id]);

  const fetchRunningBill = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const [billRes, chargesRes] = await Promise.all([
        axios.get(`${API_URL}/ipd/billing/admission/${id}/running-bill`),
        axios.get(`${API_URL}/ipd/billing/admission/${id}/charges`)
      ]);
      
      if (billRes.data.success === false) {
        throw new Error(billRes.data.error || 'Failed to fetch billing data');
      }
      
      setRunningBill(billRes.data);
      setAdmission(billRes.data.admission);
      setCharges(chargesRes.data.charges || []);
    } catch (error) {
      console.error('Error fetching running bill:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load billing data');
      toast.error(error.response?.data?.error || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessingPayment(true);
    try {
      await axios.post(`${API_URL}/ipd/billing/admission/${id}/payment`, {
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        notes: paymentData.notes
      });
      
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      fetchRunningBill();
      setPaymentData({ amount: '', paymentMethod: 'Cash', reference: '', notes: '' });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    
    if (!newCharge.description || newCharge.rate <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessingPayment(true);
    try {
      await axios.post(`${API_URL}/ipd/billing/charges`, {
        admissionId: id,
        patientId: admission?.patientId?._id,
        chargeType: newCharge.chargeType,
        description: newCharge.description,
        quantity: newCharge.quantity,
        rate: newCharge.rate,
        amount: newCharge.quantity * newCharge.rate,
        notes: newCharge.notes,
        sourceModule: 'Manual'
      });
      
      toast.success('Charge added successfully');
      setShowAddChargeModal(false);
      fetchRunningBill();
      setNewCharge({
        chargeType: 'Miscellaneous',
        description: '',
        quantity: 1,
        rate: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding charge:', error);
      toast.error(error.response?.data?.error || 'Failed to add charge');
    } finally {
      setProcessingPayment(false);
    }
  };

  const generateBedCharges = async () => {
    try {
      await axios.post(`${API_URL}/ipd/billing/admission/${id}/bed-charges`, {});
      toast.success('Bed charges generated for today');
      fetchRunningBill();
    } catch (error) {
      console.error('Error generating bed charges:', error);
      toast.error(error.response?.data?.error || 'Failed to generate bed charges');
    }
  };

  const finalizeBill = async () => {
    if (window.confirm('Are you sure you want to finalize this bill? This action cannot be undone.')) {
      try {
        await axios.post(`${API_URL}/ipd/billing/admission/${id}/finalize`);
        toast.success('Bill finalized successfully');
        fetchRunningBill();
      } catch (error) {
        console.error('Error finalizing bill:', error);
        toast.error('Failed to finalize bill');
      }
    }
  };

  // Show error state
  if (error && !runningBill) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMoneyBillWave className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Bill</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <p className="text-sm text-slate-400 mb-6">Please make sure you're accessing this page from a valid admission record.</p>
            <button
              onClick={() => navigate('/dashboard/staff/ipd/admissions')}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              Go to Admissions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading billing data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!runningBill || !admission) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <FaMoneyBillWave className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No billing data found</p>
            <button 
              onClick={() => navigate('/dashboard/staff/ipd/admissions')}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              ← Back to Admissions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { summary, patient } = runningBill;
  const dueAmount = (runningBill.admission?.dueAmount || 0);
  const totalBill = (runningBill.admission?.totalBillAmount || 0);
  const paidAmount = (runningBill.admission?.paidAmount || 0);
  const advanceAmount = (runningBill.admission?.advanceAmount || 0);

  const chargeIcons = {
    'Bed': FaBed,
    'Doctor Visit': FaUserMd,
    'Lab Test': FaFlask,
    'Pharmacy': FaPills,
    'Procedure': FaSyringe,
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/staff/ipd/patient/${id}`)} 
              className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-teal-600"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <FaMoneyBillWave className="text-teal-600" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Running Bill</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {patient?.first_name} {patient?.last_name} - {runningBill.admission?.admissionNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateBedCharges}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm font-medium"
            >
              <FaBed size={14} /> Generate Bed Charges
            </button>
            <button
              onClick={() => setShowAddChargeModal(true)}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm font-medium"
            >
              <FaPlus size={14} /> Add Charge
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all flex items-center gap-2 font-medium"
            >
              <FaPrint size={14} /> Print
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Bill</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">₹{totalBill.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Paid Amount</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{paidAmount.toLocaleString()}</p>
          </div>
          <div className={`bg-white rounded-2xl shadow-sm border p-5 ${dueAmount > 0 ? 'border-red-200' : 'border-slate-100'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${dueAmount > 0 ? 'text-red-500' : 'text-slate-400'}`}>Due Amount</p>
            <p className={`text-2xl font-bold mt-1 ${dueAmount > 0 ? 'text-red-600' : 'text-slate-600'}`}>
              ₹{dueAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Advance Amount</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">₹{advanceAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Bill Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaReceipt className="text-teal-500" size={18} /> Bill Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaBed className="text-slate-400" size={14} />
                  <span className="text-slate-600">Bed Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.bedCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaUserMd className="text-slate-400" size={14} />
                  <span className="text-slate-600">Doctor Visit Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.doctorVisitCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaFlask className="text-slate-400" size={14} />
                  <span className="text-slate-600">Lab Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.labCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaPills className="text-slate-400" size={14} />
                  <span className="text-slate-600">Pharmacy Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.pharmacyCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaSyringe className="text-slate-400" size={14} />
                  <span className="text-slate-600">Procedure Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.procedureCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <FaReceipt className="text-slate-400" size={14} />
                  <span className="text-slate-600">Miscellaneous Charges</span>
                </div>
                <span className="font-medium text-slate-700">₹{(summary?.miscellaneousCharges || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 bg-slate-50 rounded-xl px-4 -mx-1">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-xl font-bold text-teal-600">₹{(summary?.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaCreditCard className="text-teal-500" size={18} /> Payment Actions
            </h2>
            <div className="space-y-3">
              {dueAmount > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  <FaCreditCard size={16} /> Record Payment
                </button>
              )}
              {totalBill > 0 && dueAmount === 0 && (
                <button
                  onClick={finalizeBill}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  <FaFileInvoiceDollar size={16} /> Finalize Bill
                </button>
              )}
              <button className="w-full border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-medium">
                <FaDownload size={14} /> Download Bill
              </button>
            </div>
            {dueAmount > 0 && (
              <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm font-semibold text-amber-800">Pending Payment: ₹{dueAmount.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">Please collect payment to proceed with discharge</p>
              </div>
            )}
          </div>
        </div>

        {/* Charges Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">All Charges</h2>
            <span className="text-sm text-slate-400">{charges.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charges.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <FaReceipt className="text-3xl mx-auto mb-2 opacity-50" />
                      No charges added yet
                    </td>
                  </tr>
                ) : (
                  charges.map((charge, idx) => {
                    const Icon = chargeIcons[charge.chargeType] || FaReceipt;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(charge.chargeDate).toLocaleDateString()}
                         </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{charge.description}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                            <Icon size={10} /> {charge.chargeType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-600">{charge.quantity}</td>
                        <td className="px-6 py-4 text-sm text-right text-slate-600">₹{charge.rate}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-slate-700">₹{charge.netAmount?.toLocaleString()}</td>
                       </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right font-bold text-slate-800">Total:</td>
                  <td className="px-6 py-4 text-right font-bold text-teal-600 text-lg">
                    ₹{charges.reduce((sum, c) => sum + (c.netAmount || 0), 0).toLocaleString()}
                  </td>
                 </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-xl">
                    <FaCreditCard className="text-teal-600" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Record Payment</h3>
                    <p className="text-slate-500 text-sm">Due Amount: ₹{dueAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Enter amount"
                    required
                    max={dueAmount}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference/Transaction ID</label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    rows="2"
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={processingPayment} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-70 transition-all font-medium">
                    {processingPayment ? 'Processing...' : 'Process Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Charge Modal */}
        {showAddChargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <FaPlus className="text-emerald-600" size={18} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Add Manual Charge</h3>
                </div>
              </div>
              <form onSubmit={handleAddCharge} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Charge Type</label>
                  <select
                    value={newCharge.chargeType}
                    onChange={(e) => setNewCharge({...newCharge, chargeType: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={newCharge.description}
                    onChange={(e) => setNewCharge({...newCharge, description: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newCharge.quantity}
                      onChange={(e) => setNewCharge({...newCharge, quantity: parseInt(e.target.value) || 1})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹) *</label>
                    <input
                      type="number"
                      value={newCharge.rate}
                      onChange={(e) => setNewCharge({...newCharge, rate: parseFloat(e.target.value) || 0})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={newCharge.notes}
                    onChange={(e) => setNewCharge({...newCharge, notes: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    rows="2"
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddChargeModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={processingPayment} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-70 transition-all font-medium">
                    {processingPayment ? 'Adding...' : 'Add Charge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RunningBill;