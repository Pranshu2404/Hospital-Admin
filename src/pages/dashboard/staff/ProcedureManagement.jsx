import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import apiClient from '@/api/apiClient';
import { toast } from 'react-toastify';
import {
  FaProcedures, FaFileInvoiceDollar, FaMoneyBillWave, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaCalendarAlt,
  FaUserMd, FaUserInjured, FaSearch, FaFilter, FaPrint,
  FaEye, FaFileMedical, FaStethoscope, FaHospital, FaFileAlt,
  FaCreditCard, FaCashRegister, FaShoppingCart, FaBell,
  FaCalendarCheck, FaNotesMedical, FaPrescriptionBottleAlt,
  FaClipboardCheck, FaChevronRight, FaChevronDown, FaTag,
  FaMoneyCheckAlt, FaReceipt, FaFileInvoice, FaArrowRight,
  FaPlayCircle, FaPauseCircle, FaStopCircle, FaHistory,
  FaDownload, FaShare, FaEnvelope, FaCheck, FaTasks,
  FaExclamationTriangle, FaArrowLeft
} from 'react-icons/fa';

// --- Helper Functions ---
const formatDateForAPI = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateTimeForAPI = (dateTime) => {
  if (!dateTime) return null;
  const d = new Date(dateTime);
  return d.toISOString();
};

// --- UI Components ---
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaClock className="text-xs" /> },
    Approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: <FaCheckCircle className="text-xs" /> },
    Scheduled: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaCalendarAlt className="text-xs" /> },
    'In Progress': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <FaPlayCircle className="text-xs" /> },
    Completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle className="text-xs" /> },
    Cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: <FaTimesCircle className="text-xs" /> },
    Postponed: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaPauseCircle className="text-xs" /> },
    'Payment Pending': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaMoneyBillWave className="text-xs" /> },
    'Ready for Procedure': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: <FaStethoscope className="text-xs" /> },
    'Draft': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FaFileAlt className="text-xs" /> },
    'Generated': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FaReceipt className="text-xs" /> },
    'Paid': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle className="text-xs" /> },
    'Issued': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaFileInvoice className="text-xs" /> }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border ${config.color}`}>
      {config.icon} {status}
    </span>
  );
};

const PaymentBadge = ({ status, amount }) => {
  const paymentConfig = {
    Paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle /> },
    Pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaClock /> },
    Partial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaMoneyCheckAlt /> },
    Overdue: { color: 'bg-red-100 text-red-700 border-red-200', icon: <FaExclamationCircle /> }
  };

  const config = paymentConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color}`}>
      {config.icon}
      <div>
        <div className="font-bold">{status}</div>
        {amount && <div className="text-xs">₹{amount}</div>}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

// --- Main Component ---
function ProcedureManagement() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [procedures, setProcedures] = useState([]);
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [completingProcedure, setCompletingProcedure] = useState(false);
  const [billingInProgress, setBillingInProgress] = useState(false);
  const [billedProcedureIds, setBilledProcedureIds] = useState(new Set());

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // NEW: source filter
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modals
  const [showProcedureDetails, setShowProcedureDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcedureInitiation, setShowProcedureInitiation] = useState(false);
  const [showCompleteProcedureModal, setShowCompleteProcedureModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAutoBillModal, setShowAutoBillModal] = useState(false);
  const [showDuplicateBillWarning, setShowDuplicateBillWarning] = useState(false);
  const [duplicateProcedures, setDuplicateProcedures] = useState([]);

  // Form States
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const [procedureData, setProcedureData] = useState({
    scheduled_date: '',
    notes: '',
    performed_by: '',
    equipment_required: [],
    consumables: []
  });

  const [completeProcedureData, setCompleteProcedureData] = useState({
    notes: '',
    performed_by: '',
    findings: '',
    complications: '',
    post_procedure_instructions: '',
    completed_date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
    auto_generate_bill: true,
    payment_method: 'Cash'
  });

  const [billData, setBillData] = useState({
    items: [],
    discount: 0,
    tax: 0,
    notes: '',
    payment_method: 'Cash',
    status: 'Generated'
  });

  // Stats
  const [stats, setStats] = useState({
    totalPending: 0,
    totalRevenue: 0,
    todayProcedures: 0,
    completedToday: 0,
    pendingPayments: 0
  });

  const [doctors, setDoctors] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctorMap, setDoctorMap] = useState({});

  // Group procedures by prescription ID for better display
  const groupedProcedures = useMemo(() => {
    const groups = {};

    procedures.forEach(procedure => {
      const prescriptionId = procedure.prescription_id;
      if (!groups[prescriptionId]) {
        groups[prescriptionId] = {
          prescription_id: prescriptionId,
          prescription_number: procedure.prescription_number,
          patient: procedure.patient,
          doctor: procedure.doctor,
          appointment: procedure.appointment,
          diagnosis: procedure.diagnosis,
          sourceType: procedure.sourceType,
          admissionId: procedure.admissionId,
          procedures: []
        };
      }
      groups[prescriptionId].procedures.push(procedure);
    });

    return Object.values(groups);
  }, [procedures]);

  // Fetch Data on Mount
  useEffect(() => {
    fetchProcedures();
    fetchDoctors();
    fetchHospitalInfo();
  }, []);

  useEffect(() => {
    filterProcedures();
  }, [procedures, searchTerm, statusFilter, sourceFilter, dateFilter, paymentFilter]);

  // Sync billedProcedureIds with procedures data
  useEffect(() => {
    const billedIds = new Set(
      procedures
        .filter(p => p.is_billed)
        .map(p => p._id)
    );
    setBilledProcedureIds(billedIds);
  }, [procedures]);

  // Create doctor map for quick lookup
  useEffect(() => {
    const map = {};
    doctors.forEach(doctor => {
      map[doctor._id] = doctor;
    });
    setDoctorMap(map);
  }, [doctors]);

  // UPDATED: Fetch from new procedure requests API
  const fetchProcedures = async () => {
    try {
      setLoading(true);
      // Fetch procedure requests from the new endpoint
      const response = await apiClient.get('/procedurerequests/requests');
      console.log('Fetched procedure requests:', response.data);

      const requests = response.data.data || response.data.requests || [];

      // Transform to match existing procedure structure
      const transformedProcedures = requests.map(req => ({
        _id: req._id,
        request_id: req._id,
        procedure_code: req.procedureCode,
        procedure_name: req.procedureName,
        category: req.category,
        cost: req.cost,
        status: req.status,
        is_billed: req.is_billed,
        invoice_id: req.invoiceId,
        scheduled_date: req.scheduledDate,
        completed_date: req.completedAt,
        notes: req.surgeon_notes || req.notes,
        findings: req.findings,
        complications: req.complications,
        post_procedure_instructions: req.post_procedure_instructions,
        performed_by: req.performedBy,
        prescription_id: req.prescriptionId,
        patient: req.patientId,
        doctor: req.doctorId,
        appointment: req.appointmentId,
        sourceType: req.sourceType,
        admissionId: req.admissionId,
        prescription_number: req.prescriptionNumber || 'N/A',
        diagnosis: req.diagnosis || 'Not specified',
        duration_minutes: req.estimated_duration_minutes || 30,
        clinical_indication: req.clinical_indication,
        clinical_history: req.clinical_history,
        priority: req.priority,
        anesthesia_type: req.anesthesia_type,
        pre_procedure_instructions: req.pre_procedure_instructions
      }));

      setProcedures(transformedProcedures);
      calculateStats(transformedProcedures);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast.error('Failed to load procedures');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const response = await apiClient.get('/hospitals');
      if (response.data && response.data.length > 0) {
        setHospitalInfo(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching hospital info:', error);
    }
  };

  const calculateStats = (proceduresData) => {
    const today = new Date().toISOString().split('T')[0];
    let totalPending = 0;
    let todayProcedures = 0;
    let completedToday = 0;
    let pendingPayments = 0;
    let totalRevenue = 0;

    proceduresData.forEach(procedure => {
      if (procedure.status === 'Pending') {
        totalPending++;
      }

      if (procedure.scheduled_date &&
        new Date(procedure.scheduled_date).toISOString().split('T')[0] === today) {
        todayProcedures++;
      }

      if (procedure.status === 'Completed' &&
        procedure.completed_date &&
        new Date(procedure.completed_date).toISOString().split('T')[0] === today) {
        completedToday++;
      }

      if (procedure.status === 'Completed' && procedure.cost > 0) {
        totalRevenue += procedure.cost;
      }

      if (procedure.status === 'Completed' && !procedure.is_billed) {
        pendingPayments++;
      }
    });

    setStats({
      totalPending,
      totalRevenue,
      todayProcedures,
      completedToday,
      pendingPayments
    });
  };

  const filterProcedures = () => {
    let filtered = [...procedures];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(procedure => {
        const patientName = procedure.patient ?
          `${procedure.patient.first_name || ''} ${procedure.patient.last_name || ''}`.toLowerCase() : '';
        const doctorName = procedure.doctor ?
          `${procedure.doctor.firstName || ''} ${procedure.doctor.lastName || ''}`.toLowerCase() : '';
        const prescriptionNo = procedure.prescription_number?.toLowerCase() || '';
        const procedureName = procedure.procedure_name?.toLowerCase() || '';
        const procedureCode = procedure.procedure_code?.toLowerCase() || '';
        const diagnosis = procedure.diagnosis?.toLowerCase() || '';

        return patientName.includes(term) ||
          doctorName.includes(term) ||
          prescriptionNo.includes(term) ||
          procedureName.includes(term) ||
          procedureCode.includes(term) ||
          diagnosis.includes(term);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(procedure => procedure.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(procedure => procedure.sourceType === sourceFilter);
    }

    if (paymentFilter === 'pending') {
      filtered = filtered.filter(procedure =>
        procedure.status === 'Completed' && !procedure.is_billed
      );
    } else if (paymentFilter === 'billed') {
      filtered = filtered.filter(procedure => procedure.is_billed);
    }

    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(procedure => {
        const issueDate = new Date(procedure.issue_date || procedure.created_at).toISOString().split('T')[0];
        const matchesStart = !dateFilter.start || issueDate >= dateFilter.start;
        const matchesEnd = !dateFilter.end || issueDate <= dateFilter.end;
        return matchesStart && matchesEnd;
      });
    }

    setFilteredProcedures(filtered);
  };

  // UPDATED: Handle Complete Procedure with findings
  const handleCompleteProcedure = (procedure) => {
    setSelectedProcedure(procedure);
    const now = new Date();
    const localDateTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    const performedById = procedure.performed_by?._id || procedure.performed_by || '';

    setCompleteProcedureData({
      notes: procedure.notes || '',
      performed_by: performedById,
      findings: procedure.findings || '',
      complications: procedure.complications || '',
      post_procedure_instructions: procedure.post_procedure_instructions || '',
      completed_date: localDateTime,
      auto_generate_bill: true,
      payment_method: 'Cash'
    });
    setShowCompleteProcedureModal(true);
  };

  // UPDATED: Complete procedure using new API
  const completeProcedureAndBill = async () => {
    try {
      if (!selectedProcedure) {
        toast.error('No procedure selected');
        return;
      }

      if (!completeProcedureData.performed_by) {
        toast.error('Please select who performed the procedure');
        return;
      }

      if (billedProcedureIds.has(selectedProcedure._id)) {
        toast.error('This procedure is already billed');
        setShowCompleteProcedureModal(false);
        return;
      }

      setCompletingProcedure(true);

      const completedDate = new Date(completeProcedureData.completed_date);

      // 1. Add findings first (using new API)
      await apiClient.post(`/procedurerequests/requests/${selectedProcedure.request_id || selectedProcedure._id}/findings`, {
        findings: completeProcedureData.findings,
        complications: completeProcedureData.complications,
        post_procedure_instructions: completeProcedureData.post_procedure_instructions,
        notes: completeProcedureData.notes
      });

      // 2. Update status to Completed
      await apiClient.patch(`/procedurerequests/requests/${selectedProcedure.request_id || selectedProcedure._id}/status`, {
        status: 'Completed',
        notes: completeProcedureData.notes
      });

      toast.success('Procedure marked as completed!');

      // 3. If auto generate bill is enabled, create bill and invoice
      if (completeProcedureData.auto_generate_bill) {
        const billItem = {
          description: `${selectedProcedure.procedure_code} - ${selectedProcedure.procedure_name}`,
          amount: selectedProcedure.cost || 0,
          quantity: 1,
          item_type: 'Procedure',
          procedure_code: selectedProcedure.procedure_code,
          prescription_id: selectedProcedure.prescription_id,
          radiology_test_id: selectedProcedure.request_id || selectedProcedure._id
        };

        const totalAmount = selectedProcedure.cost || 0;

        try {
          const billResponse = await apiClient.post('/billing', {
            patient_id: selectedProcedure.patient?._id || selectedProcedure.patient,
            appointment_id: selectedProcedure.appointment?._id || selectedProcedure.appointment,
            admission_id: selectedProcedure.admissionId,
            prescription_id: selectedProcedure.prescription_id,
            items: [billItem],
            total_amount: totalAmount,
            subtotal: totalAmount,
            discount: 0,
            tax_amount: 0,
            payment_method: completeProcedureData.payment_method,
            status: completeProcedureData.payment_method !== 'Pending' ? 'Paid' : 'Generated',
            notes: `Bill for procedure ${selectedProcedure.procedure_name}. ${completeProcedureData.notes}`
          });

          setGeneratedBill(billResponse.data.bill);
          setGeneratedInvoice(billResponse.data.invoice);

          // Mark as billed in procedure request
          await apiClient.patch(`/procedurerequests/requests/${selectedProcedure.request_id || selectedProcedure._id}/billed`, {
            invoiceId: billResponse.data.invoice?._id
          });

          setBilledProcedureIds(prev => new Set([...prev, selectedProcedure._id]));

          toast.success('Bill and invoice generated successfully!');
          setShowCompleteProcedureModal(false);
          setShowAutoBillModal(true);
        } catch (billError) {
          if (billError.response?.status === 409) {
            setDuplicateProcedures([selectedProcedure._id]);
            setShowDuplicateBillWarning(true);
            toast.warning('This procedure is already billed');
          } else {
            throw billError;
          }
        }
      } else {
        setShowCompleteProcedureModal(false);
      }

      fetchProcedures();
    } catch (error) {
      console.error('Error completing procedure:', error);
      toast.error('Failed to complete procedure');
    } finally {
      setCompletingProcedure(false);
    }
  };

  // UPDATED: Handle Initiate Procedure (Schedule/Start)
  const handleInitiateProcedure = (procedure) => {
    setSelectedProcedure(procedure);
    const now = new Date();
    const localDateTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    const performedById = procedure.performed_by?._id || procedure.performed_by || '';

    setProcedureData({
      scheduled_date: procedure.scheduled_date ?
        new Date(procedure.scheduled_date).toISOString().slice(0, 16) : localDateTime,
      notes: procedure.notes || '',
      performed_by: performedById,
      equipment_required: [],
      consumables: []
    });
    setShowProcedureInitiation(true);
  };

  // UPDATED: Update procedure status (Schedule/Start)
  const updateProcedureStatus = async (procedureId, status, data = {}) => {
    try {
      if (!selectedProcedure) return;

      if (status === 'Scheduled' && !data.performed_by) {
        toast.error('Please select who will perform the procedure');
        return;
      }

      let apiData = { status };
      if (data.scheduled_date) {
        const scheduledDate = new Date(data.scheduled_date);
        apiData.scheduled_date = scheduledDate.toISOString();
      }
      if (data.notes) {
        apiData.notes = data.notes;
      }

      await apiClient.patch(
        `/procedurerequests/requests/${selectedProcedure.request_id || selectedProcedure._id}/status`,
        apiData
      );

      toast.success(`Procedure ${status === 'Scheduled' ? 'scheduled' : 'started'} successfully`);
      fetchProcedures();
      setShowProcedureInitiation(false);
    } catch (error) {
      console.error('Error updating procedure:', error);
      toast.error('Failed to update procedure status');
    }
  };

  // UPDATED: Start procedure directly
  const handleStartProcedure = async (procedure) => {
    try {
      await apiClient.patch(`/procedurerequests/requests/${procedure.request_id || procedure._id}/status`, {
        status: 'In Progress'
      });
      toast.success('Procedure started');
      fetchProcedures();
    } catch (error) {
      console.error('Error starting procedure:', error);
      toast.error('Failed to start procedure');
    }
  };

  const handleViewProcedure = (procedure) => {
    setSelectedProcedure(procedure);
    setShowProcedureDetails(true);
  };

  const handleCollectPayment = (procedure) => {
    setSelectedProcedure(procedure);
    setPaymentData({
      amount: procedure.cost || 0,
      method: 'Cash',
      reference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  // UPDATED: Process payment using billing API
  const processPayment = async () => {
    try {
      if (!selectedProcedure || !paymentData.amount || paymentData.amount <= 0) {
        toast.warning('Please enter a valid payment amount');
        return;
      }

      if (billedProcedureIds.has(selectedProcedure._id)) {
        toast.error('This procedure is already billed');
        setShowPaymentModal(false);
        return;
      }

      const billItem = {
        description: `${selectedProcedure.procedure_code} - ${selectedProcedure.procedure_name}`,
        amount: paymentData.amount,
        quantity: 1,
        item_type: 'Procedure',
        procedure_code: selectedProcedure.procedure_code,
        prescription_id: selectedProcedure.prescription_id,
        radiology_test_id: selectedProcedure.request_id || selectedProcedure._id
      };

      const billResponse = await apiClient.post('/billing', {
        patient_id: selectedProcedure.patient?._id || selectedProcedure.patient,
        appointment_id: selectedProcedure.appointment?._id || selectedProcedure.appointment,
        admission_id: selectedProcedure.admissionId,
        prescription_id: selectedProcedure.prescription_id,
        items: [billItem],
        total_amount: paymentData.amount,
        subtotal: paymentData.amount,
        discount: 0,
        tax_amount: 0,
        payment_method: paymentData.method,
        status: 'Paid',
        notes: paymentData.notes || `Payment for procedure ${selectedProcedure.procedure_name}`
      });

      await apiClient.patch(`/procedurerequests/requests/${selectedProcedure.request_id || selectedProcedure._id}/billed`, {
        invoiceId: billResponse.data.invoice?._id
      });

      setBilledProcedureIds(prev => new Set([...prev, selectedProcedure._id]));
      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);

      toast.success('Payment processed successfully');
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      fetchProcedures();
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error.response?.status === 409) {
        setDuplicateProcedures([selectedProcedure._id]);
        setShowDuplicateBillWarning(true);
        setShowPaymentModal(false);
      } else {
        toast.error('Failed to process payment');
      }
    }
  };

  const handleGenerateBill = (proceduresList, prescriptionData) => {
    const procedureIds = proceduresList.map(p => p._id);
    const alreadyBilled = procedureIds.some(id => billedProcedureIds.has(id));

    if (alreadyBilled) {
      const billedProcs = proceduresList.filter(p => billedProcedureIds.has(p._id));
      setDuplicateProcedures(billedProcs.map(p => p._id));
      setShowDuplicateBillWarning(true);
      return;
    }

    setSelectedPrescription(prescriptionData);

    const billItems = proceduresList
      .filter(proc => proc.status === 'Completed' && !proc.is_billed)
      .map(proc => ({
        description: `${proc.procedure_code} - ${proc.procedure_name}`,
        amount: proc.cost || 0,
        quantity: 1,
        item_type: 'Procedure',
        procedure_code: proc.procedure_code,
        prescription_id: proc.prescription_id,
        procedure_id: proc.request_id || proc._id
      }));

    if (billItems.length === 0) {
      toast.warning('No completed procedures available for billing');
      return;
    }

    setBillData({
      items: billItems,
      discount: 0,
      tax: 0,
      notes: `Bill for procedures from prescription ${prescriptionData.prescription_number}`,
      payment_method: 'Cash',
      status: 'Generated'
    });

    setShowBillModal(true);
  };

  // UPDATED: Generate bulk bill
  const generateBill = async () => {
    try {
      if (billingInProgress) {
        toast.warning('Billing already in progress');
        return;
      }

      if (billData.items.length === 0 || !selectedPrescription) {
        toast.warning('No items to bill');
        return;
      }

      const procedureIds = billData.items.map(item => item.procedure_id);
      const alreadyBilled = procedureIds.some(id => billedProcedureIds.has(id));

      if (alreadyBilled) {
        const billedProcs = billData.items.filter(item => billedProcedureIds.has(item.procedure_id));
        setDuplicateProcedures(billedProcs.map(item => item.procedure_id));
        setShowDuplicateBillWarning(true);
        setShowBillModal(false);
        return;
      }

      setBillingInProgress(true);

      const totalAmount = billData.items.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
      const finalAmount = totalAmount - billData.discount + billData.tax;

      const billResponse = await apiClient.post('/billing', {
        patient_id: selectedPrescription.patient?._id || selectedPrescription.patient,
        appointment_id: selectedPrescription.appointment?._id || selectedPrescription.appointment,
        admission_id: selectedPrescription.admissionId,
        prescription_id: selectedPrescription.prescription_id,
        items: billData.items,
        total_amount: finalAmount,
        subtotal: totalAmount,
        discount: billData.discount,
        tax_amount: billData.tax,
        payment_method: billData.payment_method,
        status: billData.status,
        notes: billData.notes
      });

      const newBilledIds = new Set([...billedProcedureIds, ...procedureIds]);
      setBilledProcedureIds(newBilledIds);

      // Mark each procedure as billed
      for (const procId of procedureIds) {
        await apiClient.patch(`/procedurerequests/requests/${procId}/billed`, {
          invoiceId: billResponse.data.invoice?._id
        }).catch(e => console.error(`Failed to mark ${procId} as billed:`, e));
      }

      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);

      toast.success(`Bill and Invoice created successfully!`);
      setShowBillModal(false);
      setShowSuccessModal(true);
      fetchProcedures();
    } catch (error) {
      console.error('Error generating bill:', error);
      if (error.response?.status === 409 && error.response?.data?.duplicateProcedures) {
        setDuplicateProcedures(error.response.data.duplicateProcedures);
        setShowDuplicateBillWarning(true);
        const newBilledIds = new Set([...billedProcedureIds, ...error.response.data.duplicateProcedures]);
        setBilledProcedureIds(newBilledIds);
      } else {
        toast.error('Failed to generate bill');
      }
    } finally {
      setBillingInProgress(false);
    }
  };

  const handleViewHistory = (procedure) => {
    setSelectedProcedure(procedure);
    setShowHistoryModal(true);
  };

  const downloadInvoice = async () => {
    try {
      if (!generatedInvoice?._id) {
        toast.warning('No invoice available to download');
        return;
      }

      const response = await apiClient.get(`/invoices/${generatedInvoice._id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${generatedInvoice.invoice_number || generatedInvoice._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const sendInvoiceEmail = async () => {
    try {
      if (!generatedInvoice?._id || !selectedPrescription?.patient?.email) {
        toast.warning('No email available for the patient');
        return;
      }

      await apiClient.post(`/invoices/${generatedInvoice._id}/send-email`, {
        patient_email: selectedPrescription.patient.email
      });

      toast.success('Invoice sent to patient email successfully!');
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast.error('Failed to send invoice email');
    }
  };

  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Unknown';
    const doctor = doctorMap[doctorId];
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown';
  };

  // UI Rendering Functions (keep all your original rendering)
  const renderProcedureCard = (procedure, index) => {
    const canCollectPayment = procedure.status === 'Completed' && !procedure.is_billed;
    const canInitiate = procedure.status === 'Pending';
    const canViewHistory = procedure.status === 'Completed';
    const canComplete = procedure.status === 'Scheduled' || procedure.status === 'In Progress';
    const canStart = procedure.status === 'Scheduled';
    const isBilled = procedure.is_billed || billedProcedureIds.has(procedure._id);

    return (
      <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaTag className="text-blue-500 text-sm" />
              <span className="font-bold text-slate-800">{procedure.procedure_code}</span>
              <StatusBadge status={procedure.status} />
              {procedure.sourceType === 'IPD' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  IPD
                </span>
              )}
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">{procedure.procedure_name}</h4>
            {procedure.category && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                {procedure.category}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">₹{procedure.cost || 0}</div>
            {isBilled ? (
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <FaCheckCircle /> Billed
              </div>
            ) : (
              <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <FaClock /> Payment Pending
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600 mb-4">
          <div>
            <div className="text-xs text-slate-400">Duration</div>
            <div className="font-medium">{procedure.duration_minutes || 30} min</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Scheduled</div>
            <div className="font-medium">
              {procedure.scheduled_date ? new Date(procedure.scheduled_date).toLocaleString() : 'Not scheduled'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Performed By</div>
            <div className="font-medium">
              {procedure.performed_by ?
                (typeof procedure.performed_by === 'object' ?
                  `Dr. ${procedure.performed_by.firstName || ''} ${procedure.performed_by.lastName || ''}`.trim() :
                  getDoctorName(procedure.performed_by))
                : 'Not assigned'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Priority</div>
            <div className="font-medium">{procedure.priority || 'Routine'}</div>
          </div>
        </div>

        {procedure.clinical_indication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-blue-800 mb-1">Clinical Indication</div>
            <p className="text-sm text-blue-700">{procedure.clinical_indication}</p>
          </div>
        )}

        {procedure.findings && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-green-800 mb-1">Findings</div>
            <p className="text-sm text-green-700">{procedure.findings}</p>
          </div>
        )}

        {procedure.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-amber-800 mb-1">Notes</div>
            <p className="text-sm text-amber-700">{procedure.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => handleViewProcedure(procedure)}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"
          >
            <FaEye /> View Details
          </button>

          {canInitiate && (
            <button
              onClick={() => handleInitiateProcedure(procedure)}
              className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
            >
              <FaPlayCircle /> Initiate Procedure
            </button>
          )}

          {canStart && (
            <button
              onClick={() => handleStartProcedure(procedure)}
              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-1"
            >
              <FaPlayCircle /> Start Procedure
            </button>
          )}

          {canComplete && !isBilled && (
            <button
              onClick={() => handleCompleteProcedure(procedure)}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-lg flex items-center gap-1 shadow-md"
            >
              <FaCheck /> Complete & Bill
            </button>
          )}

          {canCollectPayment && !isBilled && (
            <button
              onClick={() => handleCollectPayment(procedure)}
              className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
            >
              <FaMoneyBillWave /> Collect Payment
            </button>
          )}

          {canViewHistory && (
            <button
              onClick={() => handleViewHistory(procedure)}
              className="px-3 py-1.5 text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1"
            >
              <FaHistory /> View History
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPrescriptionGroup = (group) => {
    const pendingProcedures = group.procedures?.filter(p => p.status === 'Pending') || [];
    const scheduledProcedures = group.procedures?.filter(p => p.status === 'Scheduled' || p.status === 'In Progress') || [];
    const completedProcedures = group.procedures?.filter(p => p.status === 'Completed') || [];
    const billedProcedures = group.procedures?.filter(p => p.is_billed || billedProcedureIds.has(p._id)) || [];
    const totalCost = group.procedures?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;
    const billedCost = billedProcedures.reduce((sum, proc) => sum + (proc.cost || 0), 0);
    const pendingBillingProcedures = completedProcedures.filter(p => !p.is_billed && !billedProcedureIds.has(p._id));

    return (
      <div key={group.prescription_id} className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaPrescriptionBottleAlt className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Prescription #{group.prescription_number}
                  {group.sourceType === 'IPD' && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      IPD Admission
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <FaUserInjured /> {group.patient?.first_name} {group.patient?.last_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUserMd /> {group.doctor?.firstName ? `Dr. ${group.doctor.firstName} ${group.doctor.lastName}` : 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {group.appointment?.appointment_date ? new Date(group.appointment.appointment_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Diagnosis</div>
              <div className="font-bold text-slate-800">{group.diagnosis || 'Not specified'}</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{group.procedures?.length || 0}</div>
              <div className="text-sm text-slate-500">Total Procedures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{pendingProcedures.length}</div>
              <div className="text-sm text-slate-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scheduledProcedures.length}</div>
              <div className="text-sm text-slate-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{completedProcedures.length}</div>
              <div className="text-sm text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{billedProcedures.length}</div>
              <div className="text-sm text-slate-500">Billed</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaProcedures /> Recommended Procedures
          </h4>

          {group.procedures && group.procedures.length > 0 ? (
            <div className="space-y-4">
              {group.procedures.map((proc, index) => renderProcedureCard(proc, index))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FaExclamationCircle className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No procedures recommended for this prescription</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-emerald-700">Billed: ₹{billedCost}</span> |
              <span className="font-bold text-amber-700 ml-3">Pending: ₹{totalCost - billedCost}</span> |
              <span className="font-bold text-blue-700 ml-3">Awaiting Billing: {pendingBillingProcedures.length}</span>
            </div>
            <div className="flex gap-2">
              {pendingBillingProcedures.length > 0 && (
                <button
                  onClick={() => handleGenerateBill(group.procedures, group)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaReceipt /> Generate Bill & Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredGroupedProcedures = useMemo(() => {
    if (filteredProcedures.length === 0) return [];

    const groups = {};
    filteredProcedures.forEach(procedure => {
      const prescriptionId = procedure.prescription_id;
      if (!groups[prescriptionId]) {
        groups[prescriptionId] = {
          prescription_id: prescriptionId,
          prescription_number: procedure.prescription_number,
          patient: procedure.patient,
          doctor: procedure.doctor,
          appointment: procedure.appointment,
          diagnosis: procedure.diagnosis,
          sourceType: procedure.sourceType,
          admissionId: procedure.admissionId,
          procedures: []
        };
      }
      groups[prescriptionId].procedures.push(procedure);
    });
    return Object.values(groups);
  }, [filteredProcedures]);

  // Main Render - Keep all your original JSX with updated filter section
  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        {/* Header - Keep Original */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <FaProcedures className="text-blue-500" /> Procedure Management
          </h1>
          <p className="text-slate-600">Manage patient procedures, track status, collect payments, and generate bills</p>
        </div>

        {/* Stats Cards - Keep Original */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Pending Procedures"
            value={stats.totalPending}
            icon={<FaClock />}
            colorClass="text-amber-500"
            subtitle="Awaiting initiation"
          />
          <StatCard
            title="Scheduled Today"
            value={stats.todayProcedures}
            icon={<FaCalendarCheck />}
            colorClass="text-blue-500"
            subtitle="Procedures scheduled"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={<FaCheckCircle />}
            colorClass="text-emerald-500"
            subtitle="Procedures done"
          />
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<FaMoneyBillWave />}
            colorClass="text-purple-500"
            subtitle="From procedures"
          />
          <StatCard
            title="Payment Pending"
            value={stats.pendingPayments}
            icon={<FaExclamationCircle />}
            colorClass="text-orange-500"
            subtitle="Awaiting payment"
          />
        </div>

        {/* Filters - Updated with Source Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, prescription, or procedure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="Emergency">Emergency</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="billed">Billed</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg flex-1"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg flex-1"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Procedures List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading procedures...</p>
            </div>
          ) : filteredGroupedProcedures.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FaProcedures className="text-5xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Procedures Found</h3>
              <p className="text-slate-500">No procedures match your filters</p>
            </div>
          ) : (
            filteredGroupedProcedures.map(renderPrescriptionGroup)
          )}
        </div>

        {/* ALL YOUR MODALS - Keep all original modals (Duplicate Bill Warning, Complete Procedure, Auto Bill Success, 
            Procedure Details, Payment, Procedure Initiation, Bill Generation, Success, History) */}
        {/* I'm keeping them exactly as you had them, just updating the state bindings */}

        {/* Duplicate Bill Warning Modal */}
        {showDuplicateBillWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 text-amber-600">
                  <FaExclamationTriangle /> Duplicate Billing Detected
                </h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  The following procedures have already been billed and cannot be billed again:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  {duplicateProcedures.map((procId, idx) => {
                    const proc = procedures.find(p => p._id === procId);
                    return (
                      <li key={idx} className="text-sm text-slate-700">
                        {proc?.procedure_code} - {proc?.procedure_name}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm text-slate-500">
                  Please refresh the page to see updated billing status.
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setShowDuplicateBillWarning(false);
                    setDuplicateProcedures([]);
                    fetchProcedures();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  OK, Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Procedure Modal - Updated with findings fields */}
        {showCompleteProcedureModal && selectedProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> Complete Procedure
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedProcedure.procedure_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Performed By <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={completeProcedureData.performed_by}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, performed_by: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Doctor/Staff</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Findings</label>
                  <textarea
                    value={completeProcedureData.findings}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, findings: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Enter procedure findings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Complications (if any)</label>
                  <textarea
                    value={completeProcedureData.complications}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, complications: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="2"
                    placeholder="Enter any complications..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Post Procedure Instructions</label>
                  <textarea
                    value={completeProcedureData.post_procedure_instructions}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, post_procedure_instructions: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="2"
                    placeholder="Enter post-procedure instructions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Completion Notes</label>
                  <textarea
                    value={completeProcedureData.notes}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="2"
                    placeholder="Enter completion notes..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoGenerateBill"
                    checked={completeProcedureData.auto_generate_bill}
                    onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, auto_generate_bill: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="autoGenerateBill" className="text-sm font-medium text-slate-700">
                    Automatically generate bill and invoice
                  </label>
                </div>

                {completeProcedureData.auto_generate_bill && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                    <select
                      value={completeProcedureData.payment_method}
                      onChange={(e) => setCompleteProcedureData({ ...completeProcedureData, payment_method: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Pending">Payment Pending</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCompleteProcedureModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                  disabled={completingProcedure}
                >
                  Cancel
                </button>
                <button
                  onClick={completeProcedureAndBill}
                  disabled={completingProcedure}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {completingProcedure ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Complete Procedure
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto Bill Success Modal */}
        {showAutoBillModal && generatedBill && generatedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> Success!
                </h3>
                <p className="text-slate-500 text-sm mt-1">Procedure completed and billed successfully</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Procedure Completed</div>
                  <div className="font-bold">{selectedProcedure?.procedure_name}</div>
                  <div className="text-sm text-emerald-600 mt-1">Status: <StatusBadge status="Completed" /></div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-700 mb-2">Invoice Generated</div>
                  <div className="font-bold text-lg">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div>
                  <div className="text-sm text-blue-600">Amount: ₹{generatedInvoice.total}</div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => {
                    setShowAutoBillModal(false);
                    fetchProcedures();
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={downloadInvoice}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
                  >
                    <FaDownload /> Print Invoice
                  </button>
                  {selectedProcedure?.patient?.email && (
                    <button
                      onClick={sendInvoiceEmail}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2"
                    >
                      <FaEnvelope /> Email Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Procedure Details Modal - Keep Original */}
        {showProcedureDetails && selectedProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Procedure Details</h3>
                <button onClick={() => setShowProcedureDetails(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Procedure Code</label>
                    <p className="font-bold text-lg">{selectedProcedure.procedure_code}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Status</label>
                    <div className="mt-1"><StatusBadge status={selectedProcedure.status} /></div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase">Procedure Name</label>
                  <p className="font-bold text-lg">{selectedProcedure.procedure_name}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase">Cost</label>
                  <p className="text-2xl font-bold text-emerald-700">₹{selectedProcedure.cost || 0}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase">Priority</label>
                  <p className="font-medium">{selectedProcedure.priority || 'Routine'}</p>
                </div>

                {selectedProcedure.clinical_indication && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Clinical Indication</label>
                    <p className="bg-blue-50 p-3 rounded-lg">{selectedProcedure.clinical_indication}</p>
                  </div>
                )}

                {selectedProcedure.findings && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Findings</label>
                    <p className="bg-green-50 p-3 rounded-lg text-green-800">{selectedProcedure.findings}</p>
                  </div>
                )}

                {selectedProcedure.complications && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Complications</label>
                    <p className="bg-amber-50 p-3 rounded-lg text-amber-800">{selectedProcedure.complications}</p>
                  </div>
                )}

                {selectedProcedure.post_procedure_instructions && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Post Procedure Instructions</label>
                    <p className="bg-blue-50 p-3 rounded-lg text-blue-800">{selectedProcedure.post_procedure_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal - Keep Original */}
        {showPaymentModal && selectedProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Collect Payment</h3>
                <p className="text-slate-500 text-sm mt-1">{selectedProcedure.procedure_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Procedure Cost</div>
                  <div className="text-3xl font-bold text-emerald-800">₹{selectedProcedure.cost || 0}</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reference/Transaction ID</label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    placeholder="Enter reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="2"
                    placeholder="Additional notes..."
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
                  onClick={processPayment}
                  className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md"
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Procedure Initiation Modal - Keep Original */}
        {showProcedureInitiation && selectedProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedProcedure.status === 'Scheduled' || selectedProcedure.status === 'In Progress'
                    ? 'Update Procedure'
                    : 'Initiate Procedure'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedProcedure.procedure_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-700 mb-2">Patient Information</div>
                  <div className="font-bold">{selectedProcedure.patient?.first_name} {selectedProcedure.patient?.last_name}</div>
                  <div className="text-sm text-blue-600">Prescription: {selectedProcedure.prescription_number}</div>
                  {selectedProcedure.status !== 'Pending' && (
                    <div className="mt-2 text-sm text-blue-600">
                      Current Status: <StatusBadge status={selectedProcedure.status} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={procedureData.scheduled_date}
                    onChange={(e) => setProcedureData({ ...procedureData, scheduled_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Performed By <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={procedureData.performed_by}
                    onChange={(e) => setProcedureData({ ...procedureData, performed_by: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Doctor/Staff</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Procedure Notes</label>
                  <textarea
                    value={procedureData.notes}
                    onChange={(e) => setProcedureData({ ...procedureData, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Enter procedure notes..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowProcedureInitiation(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                {selectedProcedure.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => updateProcedureStatus(selectedProcedure._id, 'Scheduled', procedureData)}
                      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
                    >
                      Schedule Procedure
                    </button>
                    <button
                      onClick={() => updateProcedureStatus(selectedProcedure._id, 'In Progress', procedureData)}
                      className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
                    >
                      Start Procedure
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateProcedureStatus(selectedProcedure._id, selectedProcedure.status, procedureData)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
                  >
                    Update Procedure
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bill Generation Modal - Keep Original */}
        {showBillModal && selectedPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Generate Bill & Invoice</h3>
                <p className="text-slate-500 text-sm mt-1">For prescription #{selectedPrescription.prescription_number}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 mb-2">Important Note</h4>
                  <p className="text-sm text-blue-700">
                    Creating a bill with status 'Generated' will automatically create an invoice for the patient.
                    The invoice will include all procedures listed below.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 mb-3">Bill Items</h4>
                  <div className="space-y-3">
                    {billData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                        <div>
                          <div className="font-medium text-slate-800">{item.description}</div>
                          <div className="text-sm text-slate-500">Procedure Code: {item.procedure_code}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">₹{item.amount}</div>
                          <div className="text-sm text-slate-500">Qty: {item.quantity || 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount (₹)</label>
                    <input
                      type="number"
                      value={billData.discount}
                      onChange={(e) => setBillData({ ...billData, discount: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tax (₹)</label>
                    <input
                      type="number"
                      value={billData.tax}
                      onChange={(e) => setBillData({ ...billData, tax: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bill Status</label>
                  <select
                    value={billData.status}
                    onChange={(e) => setBillData({ ...billData, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Draft">Draft (No Invoice)</option>
                    <option value="Generated">Generated (Creates Invoice)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Select 'Generated' to automatically create an invoice along with the bill
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={billData.payment_method}
                    onChange={(e) => setBillData({ ...billData, payment_method: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={billData.notes}
                    onChange={(e) => setBillData({ ...billData, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Additional notes for the bill..."
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-emerald-800">Total Amount</div>
                      <div className="text-sm text-emerald-600">Bill will create invoice automatically</div>
                    </div>
                    <div className="text-3xl font-bold text-emerald-800">
                      ₹{billData.items.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0) - billData.discount + billData.tax}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={generateBill}
                  disabled={billingInProgress}
                  className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {billingInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaReceipt /> Generate Bill & Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal - After Bill Creation */}
        {showSuccessModal && generatedBill && generatedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> Success!
                </h3>
                <p className="text-slate-500 text-sm mt-1">Bill and Invoice created successfully</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Bill Created</div>
                  <div className="font-bold text-lg">Bill ID: {generatedBill._id?.slice(-8) || 'N/A'}</div>
                  <div className="text-sm text-emerald-600">Status: <StatusBadge status={generatedBill.status} /></div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-700 mb-2">Invoice Generated</div>
                  <div className="font-bold text-lg">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div>
                  <div className="text-sm text-blue-600">Status: <StatusBadge status={generatedInvoice.status} /></div>
                  {generatedInvoice.total && (
                    <div className="text-sm text-blue-600 mt-1">Amount: ₹{generatedInvoice.total}</div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="text-sm text-slate-700 mb-2">Patient Information</div>
                  <div className="font-medium">{selectedPrescription?.patient?.first_name} {selectedPrescription?.patient?.last_name}</div>
                  <div className="text-sm text-slate-600">Prescription: {selectedPrescription?.prescription_number}</div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={downloadInvoice}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
                  >
                    <FaDownload /> Print Invoice
                  </button>
                  {selectedPrescription?.patient?.email && (
                    <button
                      onClick={sendInvoiceEmail}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2"
                    >
                      <FaEnvelope /> Email Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && selectedProcedure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Procedure History</h3>
                  <p className="text-slate-500 text-sm mt-1">{selectedProcedure.procedure_name}</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-bold text-slate-700 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaCalendarAlt className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Prescribed</div>
                          <div className="text-sm text-slate-500">
                            Prescription #{selectedProcedure.prescription_number}
                          </div>
                        </div>
                      </div>

                      {selectedProcedure.scheduled_date && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <FaCalendarCheck className="text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">Scheduled</div>
                            <div className="text-sm text-slate-500">
                              {new Date(selectedProcedure.scheduled_date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProcedure.completed_date && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-100 rounded-full">
                            <FaCheckCircle className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">Completed</div>
                            <div className="text-sm text-slate-500">
                              {new Date(selectedProcedure.completed_date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedProcedure.is_billed || billedProcedureIds.has(selectedProcedure._id)) && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <FaReceipt className="text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">Billed</div>
                            <div className="text-sm text-slate-500">
                              Amount: ₹{selectedProcedure.cost || 0}
                            </div>
                            {selectedProcedure.invoice_id && (
                              <div className="text-sm text-slate-500">
                                Invoice: {selectedProcedure.invoice_id}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProcedureManagement;