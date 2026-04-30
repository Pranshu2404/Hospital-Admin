// pages/dashboard/staff/LabTestsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import apiClient from '@/api/apiClient';
import { toast } from 'react-toastify';
import {
  FaFlask, FaVial, FaMicroscope, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaCalendarAlt,
  FaUserMd, FaUserInjured, FaSearch, FaFilter,
  FaEye, FaFileMedical, FaStethoscope, FaFileAlt,
  FaCalendarCheck, FaNotesMedical, FaPrescriptionBottleAlt,
  FaClipboardCheck, FaChevronDown, FaTag,
  FaMoneyCheckAlt, FaReceipt, FaFileInvoice, FaArrowRight,
  FaPlayCircle, FaHistory,
  FaDownload, FaEnvelope, FaCheck,
  FaThermometerHalf, FaDna, FaHeartbeat,
  FaMoneyBillWave, FaTruck, FaBuilding, FaUserTie,
  FaUpload, FaFilePdf, FaImage, FaExternalLinkAlt,
  FaArrowLeft, FaUserMd as FaDoctor, FaUserInjured as FaPatient,
  FaFilter as FaFilterIcon, FaMoneyBillWave as FaPayment,
  FaClipboardList, FaDollarSign, FaChartLine, FaFilePrescription
} from 'react-icons/fa';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaClock className="text-xs" /> },
    'Approved': { color: 'bg-green-100 text-green-700 border-green-200', icon: <FaCheckCircle className="text-xs" /> },
    'Sample Collected': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FaVial className="text-xs" /> },
    'Processing': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <FaMicroscope className="text-xs" /> },
    'Completed': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle className="text-xs" /> },
    'Reported': { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: <FaFileMedical className="text-xs" /> },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: <FaTimesCircle className="text-xs" /> },
    'Referred Out': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaTruck className="text-xs" /> }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border ${config.color}`}>
      {config.icon} {status}
    </span>
  );
};

const StatCard = ({ title, value, icon, colorClass, borderClass = 'border-slate-100', subtitle }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all ${borderClass} border-l-4`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} text-2xl shadow-inner`}>
        {icon}
      </div>
    </div>
  </div>
);

const categoryIcons = {
  'Hematology': <FaHeartbeat className="text-red-500" />,
  'Biochemistry': <FaDna className="text-green-500" />,
  'Microbiology': <FaMicroscope className="text-purple-500" />,
  'Immunology': <FaFlask className="text-blue-500" />,
  'Pathology': <FaFileMedical className="text-amber-500" />,
  'Endocrinology': <FaThermometerHalf className="text-orange-500" />,
  'Cardiology': <FaHeartbeat className="text-pink-500" />,
  'Other': <FaFlask className="text-gray-500" />
};

function LabTestsManagement() {
  const [loading, setLoading] = useState(true);
  const [labRequests, setLabRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [billingFilter, setBillingFilter] = useState('all');

  // Modals
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCollectSampleModal, setShowCollectSampleModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReferToExternalModal, setShowReferToExternalModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showViewReportModal, setShowViewReportModal] = useState(false);

  // External Lab Data
  const [externalLabData, setExternalLabData] = useState({
    lab_name: '',
    lab_address: '',
    contact_person: '',
    contact_phone: '',
    reference_number: ''
  });

  const [uploadReportData, setUploadReportData] = useState({
    report_file: null,
    notes: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const [sampleData, setSampleData] = useState({
    sample_id: `SMP-${Date.now()}`,
    collection_date: new Date().toISOString(),
    collected_by: '',
    notes: ''
  });

  const [processData, setProcessData] = useState({
    notes: '',
    performed_by: ''
  });

  const [completeData, setCompleteData] = useState({
    result_value: '',
    result_interpretation: '',
    notes: '',
    report_file: null,
    auto_generate_bill: true,
    payment_method: 'Cash'
  });

  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRevenue: 0,
    todayRequests: 0,
    completedToday: 0,
    pendingBilling: 0,
    samplesCollected: 0,
    processing: 0,
    referredOut: 0
  });

  const [labStaff, setLabStaff] = useState([]);
  const [categories, setCategories] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [patientMap, setPatientMap] = useState({});

  // Group lab requests by prescription
  const groupedRequests = useMemo(() => {
    const groups = {};
    labRequests.forEach(request => {
      const prescriptionId = request.prescriptionId;
      if (!groups[prescriptionId]) {
        groups[prescriptionId] = {
          prescription_id: prescriptionId,
          prescription_number: request.prescriptionNumber || 'N/A',
          patient: request.patientId,
          doctor: request.doctorId,
          sourceType: request.sourceType,
          admissionId: request.admissionId,
          labTests: []
        };
      }
      groups[prescriptionId].labTests.push(request);
    });
    return Object.values(groups);
  }, [labRequests]);

  useEffect(() => {
    fetchLabRequests();
    fetchLabStaff();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [labRequests, searchTerm, statusFilter, categoryFilter, sourceFilter, dateFilter, billingFilter]);

  // Fetch lab requests from new API
  const fetchLabRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/lab/requests');
      console.log('Fetched lab requests:', response.data);
      
      const requests = response.data.data || response.data.requests || [];
      
      // Transform to match expected structure
      const transformed = requests.map(req => ({
        _id: req._id,
        request_id: req._id,
        requestNumber: req.requestNumber,
        lab_test_code: req.testCode,
        lab_test_name: req.testName,
        category: req.category,
        cost: req.cost,
        status: req.status,
        is_billed: req.is_billed,
        invoiceId: req.invoiceId,
        scheduled_date: req.scheduledDate,
        sample_collected_at: req.sample_collected_at,
        completed_date: req.processing_completed_at,
        reported_date: req.verifiedAt,
        notes: req.technician_notes || req.patient_notes,
        result_value: req.result_value,
        result_interpretation: req.result_interpretation,
        report_url: req.report_url,
        specimen_type: req.specimen_type || 'Blood',
        fasting_required: req.fasting_required || false,
        priority: req.priority,
        clinical_history: req.clinical_history,
        clinical_indication: req.clinical_indication,
        performed_by: req.processed_by,
        collected_by: req.sample_collected_by,
        prescriptionId: req.prescriptionId,
        patientId: req.patientId,
        doctorId: req.doctorId,
        sourceType: req.sourceType,
        admissionId: req.admissionId,
        is_referred_out: req.is_referred_out,
        external_lab_details: req.external_lab_details,
        prescriptionNumber: req.prescriptionNumber || req.requestNumber,
        created_at: req.requestedDate
      }));
      
      setLabRequests(transformed);
      calculateStats(transformed);
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      toast.error('Failed to load lab requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabStaff = async () => {
    try {
      const response = await apiClient.get('/pathology-staff');
      setLabStaff(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lab staff:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/lab/tests?limit=500');
      const tests = response.data.data || [];
      const uniqueCategories = [...new Set(tests.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateStats = (requests) => {
    const today = new Date().toISOString().split('T')[0];
    let totalPending = 0, totalApproved = 0, todayRequests = 0, completedToday = 0;
    let pendingBilling = 0, totalRevenue = 0, samplesCollected = 0, processing = 0, referredOut = 0;

    requests.forEach(req => {
      if (req.status === 'Pending') totalPending++;
      if (req.status === 'Approved') totalApproved++;
      if (req.status === 'Sample Collected') samplesCollected++;
      if (req.status === 'Processing') processing++;
      if (req.status === 'Referred Out') referredOut++;
      if (!req.is_billed && req.status !== 'Cancelled') pendingBilling++;
      
      if (req.scheduled_date && new Date(req.scheduled_date).toISOString().split('T')[0] === today) todayRequests++;
      if (req.completed_date && new Date(req.completed_date).toISOString().split('T')[0] === today) completedToday++;
      if (req.is_billed && req.cost > 0) totalRevenue += req.cost;
    });

    setStats({ totalPending, totalApproved, todayRequests, completedToday, pendingBilling, totalRevenue, samplesCollected, processing, referredOut });
  };

  const filterRequests = () => {
    let filtered = [...labRequests];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => {
        const patientName = req.patientId ? `${req.patientId.first_name || ''} ${req.patientId.last_name || ''}`.toLowerCase() : '';
        const doctorName = req.doctorId ? `${req.doctorId.firstName || ''} ${req.doctorId.lastName || ''}`.toLowerCase() : '';
        const testName = req.lab_test_name?.toLowerCase() || '';
        const testCode = req.lab_test_code?.toLowerCase() || '';
        return patientName.includes(term) || doctorName.includes(term) || testName.includes(term) || testCode.includes(term);
      });
    }
    if (statusFilter !== 'all') filtered = filtered.filter(req => req.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(req => req.category === categoryFilter);
    if (sourceFilter !== 'all') filtered = filtered.filter(req => req.sourceType === sourceFilter);
    if (billingFilter === 'pending') filtered = filtered.filter(req => !req.is_billed);
    else if (billingFilter === 'billed') filtered = filtered.filter(req => req.is_billed);
    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at).toISOString().split('T')[0];
        return (!dateFilter.start || reqDate >= dateFilter.start) && (!dateFilter.end || reqDate <= dateFilter.end);
      });
    }
    setFilteredRequests(filtered);
  };

  // ========== WORKFLOW FUNCTIONS ==========

  // Approve request (for staff)
  const handleApprove = async (request) => {
    try {
      setProcessingAction(true);
      await apiClient.patch(`/labrequests/requests/${request._id}/status`, { status: 'Approved' });
      toast.success('Request approved! Ready for sample collection.');
      fetchLabRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingAction(false);
    }
  };

  // Collect Sample
  const handleCollectSample = (request) => {
    setSelectedRequest(request);
    setSampleData({
      sample_id: `SMP-${Date.now()}`,
      collection_date: new Date().toISOString(),
      collected_by: '',
      notes: ''
    });
    setShowCollectSampleModal(true);
  };

  const collectSample = async () => {
    try {
      if (!selectedRequest) return;
      setProcessingAction(true);
      
      await apiClient.patch(`/labrequests/requests/${selectedRequest._id}/status`, {
        status: 'Sample Collected',
        notes: sampleData.notes
      });
      
      toast.success('Sample marked as collected!');
      setShowCollectSampleModal(false);
      fetchLabRequests();
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to mark sample as collected');
    } finally {
      setProcessingAction(false);
    }
  };

  // Start Processing
  const handleStartProcessing = (request) => {
    setSelectedRequest(request);
    setProcessData({ notes: '', performed_by: '' });
    setShowProcessModal(true);
  };

  const startProcessing = async () => {
    try {
      if (!selectedRequest) return;
      setProcessingAction(true);
      
      await apiClient.patch(`/labrequests/requests/${selectedRequest._id}/status`, {
        status: 'Processing',
        notes: processData.notes
      });
      
      toast.success('Test is now processing!');
      setShowProcessModal(false);
      fetchLabRequests();
    } catch (error) {
      console.error('Error starting processing:', error);
      toast.error('Failed to start processing');
    } finally {
      setProcessingAction(false);
    }
  };

  // Complete with Results
  const handleComplete = (request) => {
    setSelectedRequest(request);
    setCompleteData({
      result_value: request.result_value || '',
      result_interpretation: request.result_interpretation || '',
      notes: '',
      report_file: null,
      auto_generate_bill: true,
      payment_method: 'Cash'
    });
    setShowCompleteModal(true);
  };

  const completeTest = async () => {
    try {
      if (!selectedRequest) return;
      setProcessingAction(true);
      
      let reportUrl = null;
      
      // Upload report if provided
      if (completeData.report_file) {
        const formData = new FormData();
        formData.append('report', completeData.report_file);
        const uploadResponse = await apiClient.post('/labreports/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        reportUrl = uploadResponse.data.file_url;
      }
      
      // Add results
      await apiClient.post(`/labrequests/requests/${selectedRequest._id}/results`, {
        result_value: completeData.result_value,
        result_interpretation: completeData.result_interpretation,
        technician_notes: completeData.notes
      });
      
      // Update status to Completed
      await apiClient.patch(`/labrequests/requests/${selectedRequest._id}/status`, {
        status: 'Completed',
        notes: completeData.notes
      });
      
      // Upload report if available
      if (reportUrl) {
        // Create a separate request to add report to the lab request if needed
        // The report URL is already available from upload
      }
      
      toast.success('Test completed successfully!');
      setShowCompleteModal(false);
      
      // Auto generate bill if enabled
      if (completeData.auto_generate_bill && !selectedRequest.is_billed) {
        await generateBillForRequest(selectedRequest, completeData.payment_method);
      } else {
        fetchLabRequests();
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Failed to complete test');
    } finally {
      setProcessingAction(false);
    }
  };

  // Generate Bill for a request
  const generateBillForRequest = async (request, paymentMethod = 'Cash') => {
    try {
      const billItem = {
        description: `${request.lab_test_code} - ${request.lab_test_name}`,
        amount: request.cost || 0,
        quantity: 1,
        item_type: 'Lab Test',
        lab_test_code: request.lab_test_code,
        lab_test_id: request._id,
        prescription_id: request.prescriptionId
      };
      
      const billResponse = await apiClient.post('/billing', {
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
        notes: `Bill for lab test ${request.lab_test_name}`
      });
      
      await apiClient.patch(`/labrequests/requests/${request._id}/billed`, {
        invoiceId: billResponse.data.invoice?._id
      });
      
      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);
      setShowSuccessModal(true);
      fetchLabRequests();
      return billResponse.data;
    } catch (error) {
      console.error('Error generating bill:', error);
      throw error;
    }
  };

  // Collect Payment
  const handleCollectPayment = (request) => {
    setSelectedRequest(request);
    setPaymentData({
      amount: request.cost || 0,
      method: 'Cash',
      reference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      if (!selectedRequest) return;
      setProcessingAction(true);
      await generateBillForRequest(selectedRequest, paymentData.method);
      setShowPaymentModal(false);
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessingAction(false);
    }
  };

  // Refer to External Lab
  const handleReferToExternal = (request) => {
    setSelectedRequest(request);
    setExternalLabData({
      lab_name: '',
      lab_address: '',
      contact_person: '',
      contact_phone: '',
      reference_number: `EXT-${Date.now()}`
    });
    setShowReferToExternalModal(true);
  };

  const submitReferToExternal = async () => {
    try {
      if (!selectedRequest) return;
      setProcessingAction(true);
      
      await apiClient.patch(`/labrequests/requests/${selectedRequest._id}/status`, {
        status: 'Referred Out',
        is_referred_out: true,
        external_lab_details: externalLabData
      });
      
      toast.success('Test referred to external lab!');
      setShowReferToExternalModal(false);
      fetchLabRequests();
    } catch (error) {
      console.error('Error referring to external lab:', error);
      toast.error('Failed to refer to external lab');
    } finally {
      setProcessingAction(false);
    }
  };

  // Upload External Report
  const handleUploadReport = (request) => {
    setSelectedRequest(request);
    setUploadReportData({ report_file: null, notes: '' });
    setShowUploadReportModal(true);
  };

  const submitUploadReport = async () => {
    try {
      if (!selectedRequest || !uploadReportData.report_file) {
        toast.warning('Please select a file to upload');
        return;
      }
      setUploadingReport(true);
      
      const formData = new FormData();
      formData.append('report', uploadReportData.report_file);
      formData.append('notes', uploadReportData.notes);
      
      const response = await apiClient.post(`/labrequests/requests/${selectedRequest._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Report uploaded successfully!');
      setShowUploadReportModal(false);
      fetchLabRequests();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  };

  // View Report
  const handleViewReport = (request) => {
    setSelectedRequest(request);
    setShowViewReportModal(true);
  };

  const downloadReport = async () => {
    try {
      if (!selectedRequest) return;
      const response = await apiClient.get(`/labrequests/requests/${selectedRequest._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedRequest.lab_test_code}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const viewReport = () => {
    if (selectedRequest?.report_url) {
      window.open(selectedRequest.report_url, '_blank');
    }
  };

  // View Details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  // Render Request Card
  const renderRequestCard = (request) => {
    const needsPayment = !request.is_billed && request.status !== 'Referred Out';
    const canApprove = request.status === 'Pending';
    const canCollect = request.status === 'Approved';
    const canProcess = request.status === 'Sample Collected';
    const canComplete = request.status === 'Processing';
    const isReferredOut = request.status === 'Referred Out';
    const hasReport = request.report_url;
    
    return (
      <div key={request._id} className="bg-white rounded-xl border border-slate-200 p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FaTag className="text-purple-500 text-sm" />
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{request.requestNumber || request._id.slice(-8)}</span>
              <StatusBadge status={request.status} />
              {request.is_billed && <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full"><FaCheckCircle className="text-xs" /> Paid</span>}
              {isReferredOut && <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full"><FaTruck className="text-xs" /> External Lab</span>}
              {request.sourceType === 'IPD' && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">IPD</span>}
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">{request.lab_test_name}</h4>
            <p className="text-sm text-slate-500">{request.lab_test_code}</p>
            {request.category && (
              <div className="flex items-center gap-1 mt-1">
                {categoryIcons[request.category] || <FaFlask className="text-gray-500" />}
                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">{request.category}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">₹{request.cost || 0}</div>
            {request.is_billed ? (
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1"><FaCheckCircle /> Payment Received</div>
            ) : (
              <div className="text-xs text-amber-600 font-medium flex items-center gap-1"><FaClock /> Payment Pending</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600 mb-4">
          <div><div className="text-xs text-slate-400">Patient</div><div className="font-medium">{request.patientId?.first_name} {request.patientId?.last_name}</div></div>
          <div><div className="text-xs text-slate-400">Doctor</div><div className="font-medium">Dr. {request.doctorId?.firstName} {request.doctorId?.lastName}</div></div>
          <div><div className="text-xs text-slate-400">Specimen</div><div className="font-medium flex items-center gap-1"><FaVial className="text-purple-400" /> {request.specimen_type || 'Not specified'}</div></div>
          <div><div className="text-xs text-slate-400">Priority</div><div className="font-medium">{request.priority || 'Routine'}</div></div>
        </div>

        {request.fasting_required && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-amber-800">⚠️ Fasting Required for this test</div>
          </div>
        )}

        {request.clinical_indication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-blue-800">Clinical Indication</div>
            <p className="text-sm text-blue-700">{request.clinical_indication}</p>
          </div>
        )}

        {isReferredOut && request.external_lab_details && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-orange-700 mb-2"><FaBuilding className="text-sm" /><span className="text-sm font-semibold">External Lab: {request.external_lab_details.lab_name}</span></div>
            <div className="text-xs text-orange-600">Ref No: {request.external_lab_details.reference_number}</div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button onClick={() => handleViewDetails(request)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"><FaEye /> Details</button>

          {canApprove && (
            <button onClick={() => handleApprove(request)} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-1"><FaCheck /> Approve</button>
          )}

          {!isReferredOut && needsPayment && (
            <button onClick={() => handleCollectPayment(request)} className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-semibold border-2 border-emerald-200"><FaMoneyBillWave /> Collect Payment</button>
          )}

          {!isReferredOut && canCollect && request.is_billed && (
            <button onClick={() => handleCollectSample(request)} className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"><FaVial /> Collect Sample</button>
          )}

          {!isReferredOut && canProcess && (
            <button onClick={() => handleStartProcessing(request)} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1"><FaPlayCircle /> Start Processing</button>
          )}

          {!isReferredOut && canComplete && (
            <button onClick={() => handleComplete(request)} className="px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-lg flex items-center gap-1 shadow-md"><FaCheck /> Complete Test</button>
          )}

          {!isReferredOut && request.status === 'Completed' && !hasReport && (
            <button onClick={() => handleUploadReport(request)} className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"><FaUpload /> Upload Report</button>
          )}

          {hasReport && (
            <button onClick={() => handleViewReport(request)} className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1"><FaFilePdf /> View Report</button>
          )}

          {!isReferredOut && request.status !== 'Referred Out' && (
            <button onClick={() => handleReferToExternal(request)} className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg flex items-center gap-1"><FaTruck /> Refer to External Lab</button>
          )}
        </div>

        {/* Workflow Steps Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${request.is_billed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><FaMoneyBillWave /></div><div className={`text-xs font-medium ${request.is_billed ? 'text-emerald-600' : 'text-slate-400'}`}>Payment</div></div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${request.sample_collected_at ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}><FaVial /></div><div className={`text-xs font-medium ${request.sample_collected_at ? 'text-purple-600' : 'text-slate-400'}`}>Sample</div></div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${request.status === 'Processing' || request.status === 'Completed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}><FaMicroscope /></div><div className={`text-xs font-medium ${request.status === 'Processing' || request.status === 'Completed' ? 'text-indigo-600' : 'text-slate-400'}`}>Process</div></div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${request.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><FaCheckCircle /></div><div className={`text-xs font-medium ${request.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400'}`}>Complete</div></div>
          </div>
        </div>
      </div>
    );
  };

  const renderPrescriptionGroup = (group) => {
    const totalCost = group.labTests?.reduce((sum, test) => sum + (test.cost || 0), 0) || 0;
    const billedCost = group.labTests?.filter(t => t.is_billed).reduce((sum, test) => sum + (test.cost || 0), 0) || 0;
    const pendingBilling = group.labTests?.filter(t => !t.is_billed).length || 0;

    return (
      <div key={group.prescription_id} className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><FaFilePrescription className="text-purple-600" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Prescription #{group.prescription_number}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><FaPatient /> {group.patient?.first_name} {group.patient?.last_name}</span>
                  <span className="flex items-center gap-1"><FaDoctor /> Dr. {group.doctor?.firstName} {group.doctor?.lastName}</span>
                  {group.sourceType === 'IPD' && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">IPD Admission</span>}
                </div>
              </div>
            </div>
            <div className="text-right"><div className="text-sm text-slate-500">Total Lab Tests</div><div className="font-bold text-slate-800 text-xl">{group.labTests?.length || 0}</div></div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="text-center"><div className="text-2xl font-bold text-amber-600">{group.labTests?.filter(t => t.status === 'Pending').length || 0}</div><div className="text-sm text-slate-500">Pending</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-purple-600">{group.labTests?.filter(t => t.status === 'Sample Collected').length || 0}</div><div className="text-sm text-slate-500">Collected</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-indigo-600">{group.labTests?.filter(t => t.status === 'Processing').length || 0}</div><div className="text-sm text-slate-500">Processing</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-emerald-600">{group.labTests?.filter(t => t.status === 'Completed').length || 0}</div><div className="text-sm text-slate-500">Completed</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{group.labTests?.filter(t => t.status === 'Referred Out').length || 0}</div><div className="text-sm text-slate-500">Referred</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-purple-600">{group.labTests?.filter(t => t.is_billed).length || 0}</div><div className="text-sm text-slate-500">Billed</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-blue-600">₹{totalCost}</div><div className="text-sm text-slate-500">Total Cost</div></div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FaFlask /> Lab Test Requests</h4>
          {group.labTests && group.labTests.length > 0 ? (
            <div className="space-y-4">{group.labTests.map((test, idx) => renderRequestCard(test))}</div>
          ) : (
            <div className="text-center py-8 text-slate-400"><FaExclamationCircle className="text-4xl mx-auto mb-3 opacity-50" /><p>No lab tests in this prescription</p></div>
          )}
          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-emerald-700">Billed: ₹{billedCost}</span> |
              <span className="font-bold text-amber-700 ml-3">Pending: ₹{totalCost - billedCost}</span> |
              <span className="font-bold text-blue-700 ml-3">Awaiting Payment: {pendingBilling}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredGroupedRequests = useMemo(() => {
    if (filteredRequests.length === 0) return [];
    const groups = {};
    filteredRequests.forEach(req => {
      const pid = req.prescriptionId;
      if (!groups[pid]) {
        groups[pid] = { prescription_id: pid, prescription_number: req.prescriptionNumber || 'N/A', patient: req.patientId, doctor: req.doctorId, sourceType: req.sourceType, labTests: [] };
      }
      groups[pid].labTests.push(req);
    });
    return Object.values(groups);
  }, [filteredRequests]);

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2"><FaFlask className="text-purple-500" /> Lab Tests Management</h1>
          <p className="text-slate-600">Manage patient lab test requests, track samples, process tests, and generate reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Pending Approval" value={stats.totalPending} icon={<FaClock />} colorClass="text-amber-600 bg-amber-100" borderClass="border-amber-200" />
          <StatCard title="Approved" value={stats.totalApproved} icon={<FaCheckCircle />} colorClass="text-green-600 bg-green-100" borderClass="border-green-200" />
          <StatCard title="Awaiting Payment" value={stats.pendingBilling} icon={<FaPayment />} colorClass="text-orange-600 bg-orange-100" borderClass="border-orange-200" />
          <StatCard title="Samples Collected" value={stats.samplesCollected} icon={<FaVial />} colorClass="text-purple-600 bg-purple-100" borderClass="border-purple-200" />
          <StatCard title="Processing" value={stats.processing} icon={<FaMicroscope />} colorClass="text-indigo-600 bg-indigo-100" borderClass="border-indigo-200" />
          <StatCard title="Today's Schedule" value={stats.todayRequests} icon={<FaCalendarCheck />} colorClass="text-blue-600 bg-blue-100" borderClass="border-blue-200" />
          <StatCard title="Completed Today" value={stats.completedToday} icon={<FaCheckCircle />} colorClass="text-emerald-600 bg-emerald-100" borderClass="border-emerald-200" />
          <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<FaChartLine />} colorClass="text-rose-600 bg-rose-100" borderClass="border-rose-200" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="relative"><FaSearch className="absolute left-3 top-3 text-slate-400" /><input type="text" placeholder="Search patient, test, prescription..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg"><option value="all">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Sample Collected">Sample Collected</option><option value="Processing">Processing</option><option value="Completed">Completed</option><option value="Referred Out">Referred Out</option></select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg"><option value="all">All Categories</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg"><option value="all">All Sources</option><option value="OPD">OPD</option><option value="IPD">IPD</option></select>
            <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg"><option value="all">All Payments</option><option value="pending">Payment Pending</option><option value="billed">Billed</option></select>
            <div className="flex gap-2"><input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="p-2 border border-slate-300 rounded-lg flex-1" /><input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="p-2 border border-slate-300 rounded-lg flex-1" /></div>
          </div>
        </div>

        {/* Lab Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div><p className="text-slate-500">Loading lab requests...</p></div>
          ) : filteredGroupedRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><FaFlask className="text-5xl text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-slate-700 mb-2">No Lab Requests Found</h3><p className="text-slate-500">No lab requests match your filters</p></div>
          ) : (
            filteredGroupedRequests.map(renderPrescriptionGroup)
          )}
        </div>

        {/* ========== MODALS ========== */}

        {/* Collect Sample Modal */}
        {showCollectSampleModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaVial className="text-purple-500" /> Collect Sample</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div className="bg-purple-50 rounded-lg p-4"><div className="text-sm text-purple-700 mb-2">Test Information</div><div className="font-bold">{selectedRequest.lab_test_code} - {selectedRequest.lab_test_name}</div>{selectedRequest.specimen_type && <div className="text-sm text-purple-600 mt-1">Specimen: {selectedRequest.specimen_type}</div>}</div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Sample ID</label><input type="text" value={sampleData.sample_id} onChange={(e) => setSampleData({ ...sampleData, sample_id: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50" readOnly /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Collected By</label><select value={sampleData.collected_by} onChange={(e) => setSampleData({ ...sampleData, collected_by: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg"><option value="">Select Staff</option>{labStaff.map(staff => (<option key={staff._id} value={staff._id}>{staff.userId?.name || staff.employeeId}</option>))}</select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label><textarea value={sampleData.notes} onChange={(e) => setSampleData({ ...sampleData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Collection notes..." /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowCollectSampleModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={collectSample} disabled={processingAction} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-2">{processingAction ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaCheck /> Confirm Collection</>}</button></div>
            </div>
          </div>
        )}

        {/* Start Processing Modal */}
        {showProcessModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaPlayCircle className="text-indigo-500" /> Start Processing</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4"><div className="font-bold">{selectedRequest.lab_test_code} - {selectedRequest.lab_test_name}</div>{selectedRequest.specimen_type && <div className="text-sm text-indigo-600 mt-1">Specimen: {selectedRequest.specimen_type}</div>}</div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Processed By</label><select value={processData.performed_by} onChange={(e) => setProcessData({ ...processData, performed_by: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg"><option value="">Select Staff</option>{labStaff.map(staff => (<option key={staff._id} value={staff._id}>{staff.userId?.name || staff.employeeId}</option>))}</select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label><textarea value={processData.notes} onChange={(e) => setProcessData({ ...processData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Processing notes..." /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowProcessModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={startProcessing} disabled={processingAction} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2">{processingAction ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaPlayCircle /> Start Processing</>}</button></div>
            </div>
          </div>
        )}

        {/* Complete Test Modal */}
        {showCompleteModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Complete Lab Test</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4"><div className="font-bold">{selectedRequest.lab_test_code} - {selectedRequest.lab_test_name}</div><div className="text-lg font-bold mt-2">₹{selectedRequest.cost || 0}</div></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Result Value</label><textarea value={completeData.result_value} onChange={(e) => setCompleteData({ ...completeData, result_value: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Enter test result value..." /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Interpretation</label><textarea value={completeData.result_interpretation} onChange={(e) => setCompleteData({ ...completeData, result_interpretation: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Enter interpretation notes..." /></div>
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50"><label className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2"><FaUpload /> Upload Lab Report (PDF/Image)</label><input type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={(e) => setCompleteData({ ...completeData, report_file: e.target.files[0] })} className="w-full p-2 border border-purple-300 rounded-lg bg-white text-sm" /><p className="text-xs text-purple-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 10MB)</p></div>
                <div className="flex items-center gap-3"><input type="checkbox" id="autoGenerateBill" checked={completeData.auto_generate_bill} onChange={(e) => setCompleteData({ ...completeData, auto_generate_bill: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded" /><label htmlFor="autoGenerateBill" className="text-sm font-medium text-slate-700">Automatically generate bill and invoice</label></div>
                {completeData.auto_generate_bill && (<div><label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label><select value={completeData.payment_method} onChange={(e) => setCompleteData({ ...completeData, payment_method: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg"><option value="Cash">Cash</option><option value="Card">Card</option><option value="UPI">UPI</option><option value="Insurance">Insurance</option><option value="Pending">Payment Pending</option></select></div>)}
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label><textarea value={completeData.notes} onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Additional notes..." /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowCompleteModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={completeTest} disabled={processingAction} className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2">{processingAction ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaCheck /> Complete Test</>}</button></div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800">Collect Payment</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4"><div className="text-sm text-emerald-700 mb-2">Test Cost</div><div className="text-3xl font-bold text-emerald-800">₹{selectedRequest.cost || 0}</div></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Payment Amount</label><input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold" min="0" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label><select value={paymentData.method} onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg"><option value="Cash">Cash</option><option value="Card">Credit/Debit Card</option><option value="UPI">UPI</option><option value="Insurance">Insurance</option><option value="Net Banking">Net Banking</option></select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Reference/Transaction ID</label><input type="text" value={paymentData.reference} onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Enter reference number" /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={processPayment} disabled={processingAction} className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2">{processingAction ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaMoneyBillWave /> Process Payment</>}</button></div>
            </div>
          </div>
        )}

        {/* Refer to External Lab Modal */}
        {showReferToExternalModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaTruck className="text-orange-500" /> Refer to External Lab</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Lab Name *</label><input type="text" value={externalLabData.lab_name} onChange={(e) => setExternalLabData({ ...externalLabData, lab_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Enter external lab name" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Lab Address</label><textarea value={externalLabData.lab_address} onChange={(e) => setExternalLabData({ ...externalLabData, lab_address: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person</label><input type="text" value={externalLabData.contact_person} onChange={(e) => setExternalLabData({ ...externalLabData, contact_person: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div><div><label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label><input type="tel" value={externalLabData.contact_phone} onChange={(e) => setExternalLabData({ ...externalLabData, contact_phone: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" /></div></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Reference Number</label><input type="text" value={externalLabData.reference_number} onChange={(e) => setExternalLabData({ ...externalLabData, reference_number: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50" readOnly /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowReferToExternalModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={submitReferToExternal} disabled={processingAction || !externalLabData.lab_name} className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 flex items-center gap-2">{processingAction ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaCheck /> Confirm Referral</>}</button></div>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {showUploadReportModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaUpload className="text-purple-500" /> Upload Lab Report</h3><p className="text-slate-500 text-sm mt-1">{selectedRequest.lab_test_name}</p></div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Report File *</label><input type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={(e) => setUploadReportData({ ...uploadReportData, report_file: e.target.files[0] })} className="w-full p-2.5 border border-slate-300 rounded-lg" /><p className="text-xs text-slate-500 mt-1">Accepted formats: PDF, JPG, PNG (Max 10MB)</p></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label><textarea value={uploadReportData.notes} onChange={(e) => setUploadReportData({ ...uploadReportData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" /></div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowUploadReportModal(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg">Cancel</button><button onClick={submitUploadReport} disabled={uploadingReport || !uploadReportData.report_file} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-2">{uploadingReport ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</> : <><FaUpload /> Upload Report</>}</button></div>
            </div>
          </div>
        )}

        {/* View Report Modal */}
        {showViewReportModal && selectedRequest && selectedRequest.report_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">{selectedRequest.report_url.toLowerCase().endsWith('.pdf') ? <FaFilePdf className="text-red-500" /> : <FaImage className="text-purple-500" />} Lab Report</h3><button onClick={() => setShowViewReportModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button></div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-4"><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="font-semibold">Test Name:</span> {selectedRequest.lab_test_name}</div><div><span className="font-semibold">Test Code:</span> {selectedRequest.lab_test_code}</div></div></div>
                {selectedRequest.report_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="space-y-4"><div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-sm text-blue-700 flex items-center gap-2"><FaExclamationCircle className="text-blue-600" /> Click the button below to view or download the PDF report.</p></div><div className="flex justify-center gap-3"><button onClick={viewReport} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><FaEye /> View PDF Report</button><button onClick={downloadReport} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaDownload /> Download PDF</button></div></div>
                ) : (<><img src={selectedRequest.report_url} alt="Lab Report" className="max-w-full rounded-lg shadow-md" /><div className="mt-4 flex justify-end"><button onClick={downloadReport} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"><FaDownload /> Download Image</button></div></>)}
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showRequestDetails && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800">Lab Test Request Details</h3><button onClick={() => setShowRequestDetails(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-slate-500 uppercase">Request Number</label><p className="font-bold">{selectedRequest.requestNumber || selectedRequest._id.slice(-8)}</p></div><div><label className="text-xs text-slate-500 uppercase">Status</label><div><StatusBadge status={selectedRequest.status} /></div></div></div>
                <div><label className="text-xs text-slate-500 uppercase">Test Name</label><p className="font-bold text-lg">{selectedRequest.lab_test_name}</p></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-slate-500 uppercase">Test Code</label><p>{selectedRequest.lab_test_code}</p></div><div><label className="text-xs text-slate-500 uppercase">Category</label><p>{selectedRequest.category || 'N/A'}</p></div></div>
                <div><label className="text-xs text-slate-500 uppercase">Cost</label><p className="text-2xl font-bold text-emerald-700">₹{selectedRequest.cost || 0}</p></div>
                {selectedRequest.clinical_indication && (<div><label className="text-xs text-slate-500 uppercase">Clinical Indication</label><p className="bg-blue-50 p-3 rounded-lg">{selectedRequest.clinical_indication}</p></div>)}
                {selectedRequest.result_value && (<div><label className="text-xs text-slate-500 uppercase">Result Value</label><p className="bg-emerald-50 p-3 rounded-lg">{selectedRequest.result_value}</p></div>)}
                {selectedRequest.result_interpretation && (<div><label className="text-xs text-slate-500 uppercase">Interpretation</label><p className="bg-teal-50 p-3 rounded-lg">{selectedRequest.result_interpretation}</p></div>)}
                {selectedRequest.notes && (<div><label className="text-xs text-slate-500 uppercase">Notes</label><p className="bg-slate-50 p-3 rounded-lg">{selectedRequest.notes}</p></div>)}
                {selectedRequest.scheduled_date && (<div><label className="text-xs text-slate-500 uppercase">Scheduled Date</label><p>{new Date(selectedRequest.scheduled_date).toLocaleString()}</p></div>)}
                {selectedRequest.sample_collected_at && (<div><label className="text-xs text-slate-500 uppercase">Sample Collected</label><p>{new Date(selectedRequest.sample_collected_at).toLocaleString()}</p></div>)}
                {selectedRequest.completed_date && (<div><label className="text-xs text-slate-500 uppercase">Completed Date</label><p>{new Date(selectedRequest.completed_date).toLocaleString()}</p></div>)}
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && generatedBill && generatedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Success!</h3><p className="text-slate-500 text-sm mt-1">Bill and Invoice created successfully</p></div>
              <div className="p-6 space-y-4"><div className="bg-emerald-50 rounded-lg p-4"><div className="text-sm text-emerald-700 mb-2">Bill Created</div><div className="font-bold">Bill ID: {generatedBill._id?.slice(-8)}</div></div><div className="bg-purple-50 rounded-lg p-4"><div className="text-sm text-purple-700 mb-2">Invoice Generated</div><div className="font-bold">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div><div>Amount: ₹{generatedInvoice.total}</div></div></div>
              <div className="p-6 border-t border-slate-100 flex justify-end"><button onClick={() => setShowSuccessModal(false)} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Close</button></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LabTestsManagement;