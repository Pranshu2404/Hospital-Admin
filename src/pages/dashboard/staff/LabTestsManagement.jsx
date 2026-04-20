// pages/dashboard/staff/LabTestsManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import apiClient from '@/api/apiClient';
import { toast } from 'react-toastify';
import {
  FaFlask, FaVial, FaMicroscope, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaCalendarAlt,
  FaUserMd, FaUserInjured, FaSearch, FaFilter, FaPrint,
  FaEye, FaFileMedical, FaStethoscope, FaFileAlt,
  FaCreditCard, FaCashRegister, FaShoppingCart,
  FaCalendarCheck, FaNotesMedical, FaPrescriptionBottleAlt,
  FaClipboardCheck, FaChevronRight, FaChevronDown, FaTag,
  FaMoneyCheckAlt, FaReceipt, FaFileInvoice, FaArrowRight,
  FaPlayCircle, FaPauseCircle, FaStopCircle, FaHistory,
  FaDownload, FaShare, FaEnvelope, FaCheck, FaTasks,
  FaThermometerHalf, FaDna, FaHeartbeat, FaFilePrescription,
  FaMoneyBillWave, FaTruck, FaBuilding, FaUserTie, FaIdCard,
  FaUpload, FaFilePdf, FaImage, FaExternalLinkAlt
} from 'react-icons/fa';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaClock className="text-xs" /> },
    'Scheduled': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaCalendarAlt className="text-xs" /> },
    'Sample Collected': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FaVial className="text-xs" /> },
    'Processing': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <FaMicroscope className="text-xs" /> },
    'Completed': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle className="text-xs" /> },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: <FaTimesCircle className="text-xs" /> },
    'Referred Out': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaTruck className="text-xs" /> },
    'Payment Pending': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <FaMoneyCheckAlt className="text-xs" /> },
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

const categoryIcons = {
  'Hematology': <FaHeartbeat className="text-red-500" />,
  'Biochemistry': <FaDna className="text-green-500" />,
  'Microbiology': <FaMicroscope className="text-purple-500" />,
  'Immunology': <FaFlask className="text-blue-500" />,
  'Pathology': <FaFileMedical className="text-amber-500" />,
  'Radiology': <FaStethoscope className="text-indigo-500" />,
  'Endocrinology': <FaThermometerHalf className="text-orange-500" />,
  'Cardiology': <FaHeartbeat className="text-pink-500" />,
  'Other': <FaFlask className="text-gray-500" />
};

function LabTestsManagement() {
  const [loading, setLoading] = useState(true);
  const [labTests, setLabTests] = useState([]);
  const [filteredLabTests, setFilteredLabTests] = useState([]);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [completingLabTest, setCompletingLabTest] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modals
  const [showLabTestDetails, setShowLabTestDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCollectSampleModal, setShowCollectSampleModal] = useState(false);
  const [showCompleteLabTestModal, setShowCompleteLabTestModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAutoBillModal, setShowAutoBillModal] = useState(false);

  // External Lab Modals
  const [showReferToExternalModal, setShowReferToExternalModal] = useState(false);
  const [showHandoverLogModal, setShowHandoverLogModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showViewReportModal, setShowViewReportModal] = useState(false);

  // External Lab Form Data
  const [externalLabData, setExternalLabData] = useState({
    lab_name: '',
    lab_address: '',
    contact_person: '',
    contact_phone: '',
    reference_number: '',
    courier_name: '',
    tracking_number: '',
    handover_notes: ''
  });

  const [uploadReportData, setUploadReportData] = useState({
    report_file: null,
    reference_number: '',
    notes: ''
  });

  // Payment Form Data
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const [labTestData, setLabTestData] = useState({
    scheduled_date: '',
    notes: '',
    performed_by: '',
    equipment_required: [],
    consumables: []
  });

  const [completeLabTestData, setCompleteLabTestData] = useState({
    notes: '',
    performed_by: '',
    completed_date: new Date().toISOString(),
    auto_generate_bill: false,
    payment_method: 'Cash',
    report_file: null,
    report_file_name: ''
  });

  const [billData, setBillData] = useState({
    items: [],
    discount: 0,
    tax: 0,
    notes: '',
    payment_method: 'Cash',
    status: 'Generated'
  });

  const [sampleData, setSampleData] = useState({
    sample_id: '',
    sample_type: '',
    collection_date: new Date().toISOString(),
    collected_by: '',
    notes: ''
  });

  const [stats, setStats] = useState({
    totalPending: 0,
    totalRevenue: 0,
    todayLabTests: 0,
    completedToday: 0,
    pendingPayments: 0,
    samplesCollected: 0,
    processing: 0,
    referredOut: 0
  });

  const [doctors, setDoctors] = useState([]);
  const [labStaff, setLabStaff] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  const groupedLabTests = useMemo(() => {
    const groups = {};
    labTests.forEach(test => {
      const prescriptionId = test.prescription_id;
      if (!groups[prescriptionId]) {
        groups[prescriptionId] = {
          prescription_id: prescriptionId,
          prescription_number: test.prescription_number,
          patient: test.patient,
          doctor: test.doctor,
          appointment: test.appointment,
          diagnosis: test.diagnosis,
          labTests: []
        };
      }
      groups[prescriptionId].labTests.push(test);
    });
    return Object.values(groups);
  }, [labTests]);

  useEffect(() => {
    fetchLabTests();
    fetchDoctors();
    fetchLabStaff();
    fetchHospitalInfo();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterLabTests();
  }, [labTests, searchTerm, statusFilter, categoryFilter, dateFilter, paymentFilter]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/prescriptions/with-lab-tests');
      const testsData = response.data.labTests || response.data || [];
      setLabTests(testsData);
      calculateStats(testsData);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error('Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to view internal PDF reports through proxy
  const viewInternalPDFReport = async (reportId) => {
    try {
      toast.info('Loading PDF report...');

      const response = await apiClient.get(`/labreports/download/${reportId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF report. Please try downloading instead.');
    }
  };

  // Add this helper function to handle PDF viewing
  const viewPDFReport = async (reportUrl, reportId = null) => {
    try {
      toast.info('Loading PDF report...');

      let url;

      if (reportId) {
        // Use proxy endpoint if we have a report ID
        const response = await apiClient.get(`/labreports/download/${reportId}`, {
          responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
      } else {
        // Use direct URL with download attribute to avoid CORS issues
        url = reportUrl;
      }

      // Open in new tab
      const newWindow = window.open();
      if (newWindow) {
        if (url.startsWith('blob:')) {
          newWindow.location.href = url;
        } else {
          // For direct URLs, use an iframe approach
          const iframe = newWindow.document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          iframe.src = url;
          newWindow.document.body.style.margin = '0';
          newWindow.document.body.style.height = '100vh';
          newWindow.document.body.appendChild(iframe);
        }

        // Clean up blob URL after a delay
        if (url.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      } else {
        // If popup blocked, try download approach
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lab_report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info('PDF downloaded. Please check your downloads folder.');
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF report. Please try downloading instead.');

      // Fallback: try direct download
      if (reportUrl) {
        const link = document.createElement('a');
        link.href = reportUrl;
        link.download = 'lab_report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // For viewing external reports
  const viewExternalPDFReport = async (prescriptionId, labTestId) => {
    try {
      toast.info('Loading PDF report...');

      const response = await apiClient.get(`/labreports/external/${prescriptionId}/${labTestId}/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Open in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        // If popup blocked, offer download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'external_lab_report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info('PDF downloaded. Please check your downloads folder.');
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF report. Please try downloading instead.');
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

  const fetchLabStaff = async () => {
    try {
      const response = await apiClient.get('/pathology-staff');
      setLabStaff(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lab staff:', error);
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

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/labtests/all?limit=1000');
      const tests = response.data.data || [];
      const uniqueCategories = [...new Set(tests.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateStats = (testsData) => {
    const today = new Date().toISOString().split('T')[0];
    let totalPending = 0;
    let todayLabTests = 0;
    let completedToday = 0;
    let pendingPayments = 0;
    let totalRevenue = 0;
    let samplesCollected = 0;
    let processing = 0;
    let referredOut = 0;

    testsData.forEach(test => {
      if (test.status === 'Pending' && !test.is_billed) totalPending++;
      if (test.status === 'Sample Collected') samplesCollected++;
      if (test.status === 'Processing') processing++;
      if (test.status === 'Referred Out') referredOut++;

      if (test.scheduled_date &&
        new Date(test.scheduled_date).toISOString().split('T')[0] === today) {
        todayLabTests++;
      }

      if (test.status === 'Completed' &&
        test.completed_date &&
        new Date(test.completed_date).toISOString().split('T')[0] === today) {
        completedToday++;
      }

      if (test.is_billed && test.cost > 0) totalRevenue += test.cost;
      if (test.status === 'Completed' && !test.is_billed) pendingPayments++;
    });

    setStats({
      totalPending,
      totalRevenue,
      todayLabTests,
      completedToday,
      pendingPayments,
      samplesCollected,
      processing,
      referredOut
    });
  };

  const filterLabTests = () => {
    let filtered = [...labTests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test => {
        const patientName = test.patient ?
          `${test.patient.first_name || ''} ${test.patient.last_name || ''}`.toLowerCase() : '';
        const doctorName = test.doctor ?
          `${test.doctor.firstName || ''} ${test.doctor.lastName || ''}`.toLowerCase() : '';
        const prescriptionNo = test.prescription_number?.toLowerCase() || '';
        const testName = test.lab_test_name?.toLowerCase() || '';
        const testCode = test.lab_test_code?.toLowerCase() || '';
        const diagnosis = test.diagnosis?.toLowerCase() || '';

        return patientName.includes(term) || doctorName.includes(term) ||
          prescriptionNo.includes(term) || testName.includes(term) ||
          testCode.includes(term) || diagnosis.includes(term);
      });
    }

    if (statusFilter !== 'all') filtered = filtered.filter(test => test.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(test => test.category === categoryFilter);

    if (paymentFilter === 'pending') filtered = filtered.filter(test => !test.is_billed);
    else if (paymentFilter === 'billed') filtered = filtered.filter(test => test.is_billed);

    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(test => {
        const issueDate = new Date(test.issue_date || test.created_at).toISOString().split('T')[0];
        const matchesStart = !dateFilter.start || issueDate >= dateFilter.start;
        const matchesEnd = !dateFilter.end || issueDate <= dateFilter.end;
        return matchesStart && matchesEnd;
      });
    }

    setFilteredLabTests(filtered);
  };

  // ========== EXTERNAL LAB FUNCTIONS ==========

  const handleReferToExternal = (labTest) => {
    setSelectedLabTest(labTest);
    setExternalLabData({
      lab_name: '',
      lab_address: '',
      contact_person: '',
      contact_phone: '',
      reference_number: `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      courier_name: '',
      tracking_number: '',
      handover_notes: ''
    });
    setShowReferToExternalModal(true);
  };

  const submitReferToExternal = async () => {
    try {
      if (!selectedLabTest) return;

      setCompletingLabTest(true);

      await apiClient.post(
        `/external-lab/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/refer-out`,
        {
          lab_name: externalLabData.lab_name,
          lab_address: externalLabData.lab_address,
          contact_person: externalLabData.contact_person,
          contact_phone: externalLabData.contact_phone,
          reference_number: externalLabData.reference_number,
          courier_name: externalLabData.courier_name,
          tracking_number: externalLabData.tracking_number,
          handover_notes: externalLabData.handover_notes
        }
      );

      toast.success('Lab test referred to external lab successfully!');
      setShowReferToExternalModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error referring to external lab:', error);
      toast.error('Failed to refer to external lab');
    } finally {
      setCompletingLabTest(false);
    }
  };

  const handleAddHandoverLog = (labTest) => {
    setSelectedLabTest(labTest);
    setExternalLabData({
      ...externalLabData,
      courier_name: '',
      tracking_number: '',
      handover_notes: ''
    });
    setShowHandoverLogModal(true);
  };

  const submitHandoverLog = async () => {
    try {
      if (!selectedLabTest) return;

      setCompletingLabTest(true);

      await apiClient.post(
        `/external-lab/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/handover-log`,
        {
          courier_name: externalLabData.courier_name,
          tracking_number: externalLabData.tracking_number,
          notes: externalLabData.handover_notes,
          received_by_external: false
        }
      );

      toast.success('Sample handover log added successfully!');
      setShowHandoverLogModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error adding handover log:', error);
      toast.error('Failed to add handover log');
    } finally {
      setCompletingLabTest(false);
    }
  };

  const handleUploadReport = (labTest) => {
    setSelectedLabTest(labTest);
    setUploadReportData({
      report_file: null,
      reference_number: labTest.external_lab_details?.reference_number || '',
      notes: ''
    });
    setShowUploadReportModal(true);
  };

  const submitUploadReport = async () => {
    try {
      if (!selectedLabTest || !uploadReportData.report_file) {
        toast.warning('Please select a report file to upload');
        return;
      }

      setUploadingReport(true);

      const formData = new FormData();
      formData.append('report', uploadReportData.report_file);
      formData.append('reference_number', uploadReportData.reference_number);
      formData.append('notes', uploadReportData.notes);

      await apiClient.post(
        `/external-lab/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/upload-report`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('External lab report uploaded successfully!');
      setShowUploadReportModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error(error.response?.data?.error || 'Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  };

  const handleViewReport = (labTest) => {
    setSelectedLabTest(labTest);
    setShowViewReportModal(true);
  };

  // ========== PAYMENT FUNCTIONS ==========

  const handleCollectPayment = (labTest) => {
    setSelectedLabTest(labTest);
    setPaymentData({
      amount: labTest.cost || 0,
      method: 'Cash',
      reference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      if (!selectedLabTest || !paymentData.amount || paymentData.amount <= 0) {
        toast.warning('Please enter a valid payment amount');
        return;
      }

      setCompletingLabTest(true);

      const billItem = {
        description: `${selectedLabTest.lab_test_code} - ${selectedLabTest.lab_test_name}`,
        amount: paymentData.amount,
        quantity: 1,
        item_type: 'Lab Test',
        lab_test_code: selectedLabTest.lab_test_code,
        prescription_id: selectedLabTest.prescription_id,
        lab_test_id: selectedLabTest._id
      };

      const billResponse = await apiClient.post('/billing', {
        patient_id: selectedLabTest.patient?._id || selectedLabTest.patient,
        appointment_id: selectedLabTest.appointment?._id || selectedLabTest.appointment,
        prescription_id: selectedLabTest.prescription_id,
        items: [billItem],
        total_amount: paymentData.amount,
        subtotal: paymentData.amount,
        discount: 0,
        tax_amount: 0,
        payment_method: paymentData.method,
        status: 'Paid',
        notes: `Payment for lab test ${selectedLabTest.lab_test_name}. ${paymentData.notes}`
      });

      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/billed`,
        {
          invoice_id: billResponse.data.invoice?._id,
          cost: paymentData.amount,
          is_billed: true
        }
      );

      toast.success('Payment processed successfully! Sample collection can now proceed.');
      setShowPaymentModal(false);
      setShowAutoBillModal(true);
      fetchLabTests();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setCompletingLabTest(false);
    }
  };

  // ========== SAMPLE COLLECTION FUNCTIONS ==========

  const handleCollectSample = (labTest) => {
    setSelectedLabTest(labTest);
    setSampleData({
      sample_id: `SMP-${Date.now()}`,
      sample_type: labTest.specimen_type || '',
      collection_date: new Date().toISOString(),
      collected_by: '',
      notes: ''
    });
    setShowCollectSampleModal(true);
  };

  const collectSample = async () => {
    try {
      if (!selectedLabTest) {
        toast.error('No lab test selected');
        return;
      }

      setCompletingLabTest(true);

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        {
          status: 'Sample Collected',
          sample_collected_at: sampleData.collection_date,
          performed_by: sampleData.collected_by,
          notes: sampleData.notes
        }
      );

      toast.success('Sample marked as collected!');
      setShowCollectSampleModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to mark sample as collected');
    } finally {
      setCompletingLabTest(false);
    }
  };

  // ========== PROCESSING FUNCTIONS ==========

  const handleStartProcessing = (labTest) => {
    setSelectedLabTest(labTest);
    setLabTestData({
      scheduled_date: new Date().toISOString(),
      notes: '',
      performed_by: '',
      equipment_required: [],
      consumables: []
    });
    setShowCompleteLabTestModal(true);
  };

  const startProcessing = async () => {
    try {
      if (!selectedLabTest) return;

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        {
          status: 'Processing',
          performed_by: labTestData.performed_by,
          notes: labTestData.notes
        }
      );

      toast.success('Test marked as processing!');
      setShowCompleteLabTestModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error starting processing:', error);
      toast.error('Failed to start processing');
    }
  };

  // ========== COMPLETION FUNCTIONS ==========

  const handleCompleteLabTest = (labTest) => {
    setSelectedLabTest(labTest);
    setCompleteLabTestData({
      notes: '',
      performed_by: '',
      completed_date: new Date().toISOString(),
      auto_generate_bill: false,
      payment_method: 'Cash',
      report_file: null,
      report_file_name: ''
    });
    setShowCompleteLabTestModal(true);
  };

  const completeLabTestWithReport = async () => {
    try {
      if (!selectedLabTest) {
        toast.error('No lab test selected');
        return;
      }

      if (!completeLabTestData.report_file) {
        toast.warning('Please select a report file to upload');
        return;
      }

      setCompletingLabTest(true);

      const formData = new FormData();
      formData.append('report', completeLabTestData.report_file);
      formData.append('prescription_id', selectedLabTest.prescription_id);
      formData.append('lab_test_id', selectedLabTest._id);
      formData.append('notes', completeLabTestData.notes);

      const uploadResponse = await apiClient.post('/labreports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const reportUrl = uploadResponse.data.file_url;

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        {
          status: 'Completed',
          completed_date: completeLabTestData.completed_date,
          performed_by: completeLabTestData.performed_by,
          notes: completeLabTestData.notes,
          report_url: reportUrl
        }
      );

      toast.success('Lab test completed and report uploaded successfully!');
      setShowCompleteLabTestModal(false);

      setCompleteLabTestData({
        notes: '',
        performed_by: '',
        completed_date: new Date().toISOString(),
        auto_generate_bill: false,
        payment_method: 'Cash',
        report_file: null,
        report_file_name: ''
      });

      fetchLabTests();
    } catch (error) {
      console.error('Error completing lab test with report:', error);
      toast.error(error.response?.data?.error || 'Failed to complete lab test');
    } finally {
      setCompletingLabTest(false);
    }
  };

  const completeLabTest = async (reportUrl = null) => {
    try {
      if (!selectedLabTest) {
        toast.error('No lab test selected');
        return;
      }

      setCompletingLabTest(true);

      const updateData = {
        status: 'Completed',
        completed_date: completeLabTestData.completed_date,
        performed_by: completeLabTestData.performed_by,
        notes: completeLabTestData.notes
      };

      if (reportUrl) {
        updateData.report_url = reportUrl;
      }

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        updateData
      );

      toast.success('Lab test marked as completed!');
      setShowCompleteLabTestModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error completing lab test:', error);
      toast.error('Failed to complete lab test');
    } finally {
      setCompletingLabTest(false);
    }
  };

  // ========== VIEW FUNCTIONS ==========

  const handleViewLabTest = (labTest) => {
    setSelectedLabTest(labTest);
    setShowLabTestDetails(true);
  };

  const handleViewHistory = (labTest) => {
    setSelectedLabTest(labTest);
    setShowHistoryModal(true);
  };

  const handleGenerateBill = (labTests, prescriptionData) => {
    setSelectedPrescription(prescriptionData);

    const billItems = labTests
      .filter(test => !test.is_billed)
      .map(test => ({
        description: `${test.lab_test_code} - ${test.lab_test_name}`,
        amount: test.cost || 0,
        quantity: 1,
        item_type: 'Lab Test',
        lab_test_code: test.lab_test_code,
        prescription_id: test.prescription_id,
        lab_test_id: test._id
      }));

    if (billItems.length === 0) {
      toast.warning('No lab tests available for billing');
      return;
    }

    setBillData({
      items: billItems,
      discount: 0,
      tax: 0,
      notes: `Bill for lab tests from prescription ${prescriptionData.prescription_number}`,
      payment_method: 'Cash',
      status: 'Generated'
    });

    setShowBillModal(true);
  };

  const generateBill = async () => {
    try {
      if (billData.items.length === 0 || !selectedPrescription) {
        toast.warning('No items to bill');
        return;
      }

      setCompletingLabTest(true);

      const totalAmount = billData.items.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
      const finalAmount = totalAmount - billData.discount + billData.tax;

      const billResponse = await apiClient.post('/billing', {
        patient_id: selectedPrescription.patient?._id || selectedPrescription.patient,
        appointment_id: selectedPrescription.appointment?._id || selectedPrescription.appointment,
        prescription_id: selectedPrescription.prescription_id,
        items: billData.items,
        total_amount: finalAmount,
        subtotal: totalAmount,
        discount: billData.discount,
        tax_amount: billData.tax,
        payment_method: billData.payment_method,
        status: 'Paid',
        notes: billData.notes
      });

      setGeneratedBill(billResponse.data.bill);
      setGeneratedInvoice(billResponse.data.invoice);

      for (const item of billData.items) {
        await apiClient.put(
          `/prescriptions/${selectedPrescription.prescription_id}/lab-tests/${item.lab_test_id}/billed`,
          {
            invoice_id: billResponse.data.invoice?._id,
            cost: item.amount,
            is_billed: true
          }
        );
      }

      toast.success(`Bill and Invoice created successfully!`);
      setShowBillModal(false);
      setShowSuccessModal(true);
      fetchLabTests();
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error('Failed to generate bill');
    } finally {
      setCompletingLabTest(false);
    }
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

  // Render Lab Test Card (same as before - keeping it concise)
  const renderLabTestCard = (test, index) => {
    // ... (keep existing renderLabTestCard function - unchanged)
    const needsPayment = !test.is_billed && test.status !== 'Referred Out';
    const canCollectSample = test.is_billed && test.status === 'Pending';
    const canProcess = test.status === 'Sample Collected';
    const canComplete = test.status === 'Processing';
    const canViewHistory = test.status === 'Completed';
    const isReferredOut = test.status === 'Referred Out';
    const hasExternalReport = test.external_lab_details?.external_report_url;

    return (
      <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 mb-4 hover:shadow-md transition-shadow">
        {/* Card content - same as before */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FaTag className="text-purple-500 text-sm" />
              <span className="font-bold text-slate-800">{test.lab_test_code}</span>
              <StatusBadge status={test.status} />
              {test.is_billed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                  <FaCheckCircle className="text-xs" /> Paid
                </span>
              )}
              {isReferredOut && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                  <FaTruck className="text-xs" /> External Lab
                </span>
              )}
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">{test.lab_test_name}</h4>
            {test.category && (
              <div className="flex items-center gap-1 mt-1">
                {categoryIcons[test.category] || <FaFlask className="text-gray-500" />}
                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                  {test.category}
                </span>
              </div>
            )}
            {test.fasting_required && (
              <span className="inline-block mt-2 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">
                ⚠️ Fasting Required
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">₹{test.cost || 0}</div>
            {test.is_billed ? (
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <FaCheckCircle /> Payment Received
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
            <div className="text-xs text-slate-400">Specimen Type</div>
            <div className="font-medium flex items-center gap-1">
              <FaVial className="text-purple-400" /> {test.specimen_type || 'Not specified'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Scheduled</div>
            <div className="font-medium">
              {test.scheduled_date ? new Date(test.scheduled_date).toLocaleDateString() : 'Not scheduled'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Turnaround</div>
            <div className="font-medium">{test.turnaround_time || 24} hours</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Payment Status</div>
            <div className="font-medium">
              {test.is_billed ? 'Paid' : 'Pending'}
            </div>
          </div>
        </div>

        {isReferredOut && test.external_lab_details && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <FaBuilding className="text-sm" />
              <span className="text-sm font-semibold">External Lab: {test.external_lab_details.lab_name}</span>
            </div>
            <div className="text-xs text-orange-600">
              Ref No: {test.external_lab_details.reference_number}
            </div>
            {test.external_lab_details.external_report_url && (
              <div className="mt-2">
                <button
                  onClick={() => handleViewReport(test)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaFilePdf /> View Report
                </button>
              </div>
            )}
          </div>
        )}

        {test.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-amber-800 mb-1">Notes</div>
            <p className="text-sm text-amber-700">{test.notes}</p>
          </div>
        )}

        {test.sample_collected_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-blue-800 mb-1">Sample Collected</div>
            <p className="text-sm text-blue-700">{new Date(test.sample_collected_at).toLocaleString()}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => handleViewLabTest(test)}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"
          >
            <FaEye /> View Details
          </button>

          {!isReferredOut && test.status === 'Pending' && test.is_billed && (
            <button
              onClick={() => handleReferToExternal(test)}
              className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg flex items-center gap-1"
            >
              <FaTruck /> Refer to External Lab
            </button>
          )}

          {isReferredOut && (
            <>
              <button
                onClick={() => handleAddHandoverLog(test)}
                className="px-3 py-1.5 text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg flex items-center gap-1"
              >
                <FaClipboardCheck /> Add Handover Log
              </button>
              {!hasExternalReport && (
                <button
                  onClick={() => handleUploadReport(test)}
                  className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"
                >
                  <FaUpload /> Upload Report
                </button>
              )}
              {hasExternalReport && (
                <button
                  onClick={() => handleViewReport(test)}
                  className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
                >
                  <FaFilePdf /> View Report
                </button>
              )}
            </>
          )}

          {!isReferredOut && needsPayment && (
            <button
              onClick={() => handleCollectPayment(test)}
              className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-semibold border-2 border-emerald-200"
            >
              <FaMoneyBillWave /> Step 1: Collect Payment
            </button>
          )}

          {!isReferredOut && canCollectSample && (
            <button
              onClick={() => handleCollectSample(test)}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1"
            >
              <FaVial /> Step 2: Collect Sample
            </button>
          )}

          {!isReferredOut && canProcess && (
            <button
              onClick={() => handleStartProcessing(test)}
              className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
            >
              <FaPlayCircle /> Step 3: Start Processing
            </button>
          )}

          {!isReferredOut && canComplete && (
            <button
              onClick={() => handleCompleteLabTest(test)}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-lg flex items-center gap-1 shadow-md"
            >
              <FaCheck /> Step 4: Complete Test
            </button>
          )}

          {canViewHistory && (
            <button
              onClick={() => handleViewHistory(test)}
              className="px-3 py-1.5 text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1"
            >
              <FaHistory /> View History
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${test.is_billed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                <FaMoneyBillWave />
              </div>
              <div className={`text-xs font-medium ${test.is_billed ? 'text-emerald-600' : 'text-slate-400'}`}>
                Payment
              </div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${test.sample_collected_at ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
                }`}>
                <FaVial />
              </div>
              <div className={`text-xs font-medium ${test.sample_collected_at ? 'text-purple-600' : 'text-slate-400'}`}>
                Sample
              </div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${test.status === 'Processing' || test.status === 'Completed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}>
                <FaMicroscope />
              </div>
              <div className={`text-xs font-medium ${test.status === 'Processing' || test.status === 'Completed' ? 'text-indigo-600' : 'text-slate-400'}`}>
                Process
              </div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${test.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                <FaCheckCircle />
              </div>
              <div className={`text-xs font-medium ${test.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Prescription Group
  const renderPrescriptionGroup = (group) => {
    const pendingTests = group.labTests?.filter(t => t.status === 'Pending' && !t.is_billed) || [];
    const paidTests = group.labTests?.filter(t => t.is_billed && t.status === 'Pending') || [];
    const collectedTests = group.labTests?.filter(t => t.status === 'Sample Collected') || [];
    const processingTests = group.labTests?.filter(t => t.status === 'Processing') || [];
    const completedTests = group.labTests?.filter(t => t.status === 'Completed') || [];
    const referredOutTests = group.labTests?.filter(t => t.status === 'Referred Out') || [];
    const billedTests = group.labTests?.filter(t => t.is_billed) || [];
    const totalCost = group.labTests?.reduce((sum, test) => sum + (test.cost || 0), 0) || 0;
    const billedCost = billedTests.reduce((sum, test) => sum + (test.cost || 0), 0);
    const pendingBillingTests = group.labTests?.filter(t => !t.is_billed) || [];

    return (
      <div key={group.prescription_id} className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaFilePrescription className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Prescription #{group.prescription_number}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <FaUserInjured /> {group.patient?.first_name} {group.patient?.last_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUserMd /> Dr. {group.doctor?.firstName} {group.doctor?.lastName}
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
          <div className="grid grid-cols-2 md:grid-cols-9 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{group.labTests?.length || 0}</div>
              <div className="text-sm text-slate-500">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{pendingTests.length}</div>
              <div className="text-sm text-slate-500">Need Payment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{paidTests.length}</div>
              <div className="text-sm text-slate-500">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{referredOutTests.length}</div>
              <div className="text-sm text-slate-500">Referred Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{collectedTests.length}</div>
              <div className="text-sm text-slate-500">Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{processingTests.length}</div>
              <div className="text-sm text-slate-500">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{completedTests.length}</div>
              <div className="text-sm text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{billedTests.length}</div>
              <div className="text-sm text-slate-500">Billed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{totalCost}</div>
              <div className="text-sm text-slate-500">Total Cost</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaFlask /> Prescribed Lab Tests
          </h4>

          {group.labTests && group.labTests.length > 0 ? (
            <div className="space-y-4">
              {group.labTests.map((test, index) => renderLabTestCard(test, index))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FaExclamationCircle className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No lab tests prescribed in this prescription</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-emerald-700">Billed: ₹{billedCost}</span> |
              <span className="font-bold text-amber-700 ml-3">Pending: ₹{totalCost - billedCost}</span> |
              <span className="font-bold text-blue-700 ml-3">Awaiting Payment: {pendingBillingTests.length}</span>
            </div>
            <div className="flex gap-2">
              {pendingBillingTests.length > 0 && (
                <button
                  onClick={() => handleGenerateBill(group.labTests, group)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaReceipt /> Collect Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredGroupedLabTests = useMemo(() => {
    if (filteredLabTests.length === 0) return [];

    const groups = {};
    filteredLabTests.forEach(test => {
      const prescriptionId = test.prescription_id;
      if (!groups[prescriptionId]) {
        groups[prescriptionId] = {
          prescription_id: prescriptionId,
          prescription_number: test.prescription_number,
          patient: test.patient,
          doctor: test.doctor,
          appointment: test.appointment,
          diagnosis: test.diagnosis,
          labTests: []
        };
      }
      groups[prescriptionId].labTests.push(test);
    });
    return Object.values(groups);
  }, [filteredLabTests]);

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <FaFlask className="text-purple-500" /> Lab Tests Management
          </h1>
          <p className="text-slate-600">Manage patient lab tests, collect payments, collect samples, and process tests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-8">
          <StatCard title="Need Payment" value={stats.totalPending} icon={<FaClock />} colorClass="text-amber-500" subtitle="Awaiting payment" />
          <StatCard title="Paid" value={labTests.filter(t => t.is_billed && t.status === 'Pending').length} icon={<FaCheckCircle />} colorClass="text-emerald-500" subtitle="Ready for collection" />
          <StatCard title="Referred Out" value={stats.referredOut} icon={<FaTruck />} colorClass="text-orange-500" subtitle="External labs" />
          <StatCard title="Collected" value={stats.samplesCollected} icon={<FaVial />} colorClass="text-purple-500" subtitle="Samples collected" />
          <StatCard title="Processing" value={stats.processing} icon={<FaMicroscope />} colorClass="text-indigo-500" subtitle="Tests in progress" />
          <StatCard title="Today's Schedule" value={stats.todayLabTests} icon={<FaCalendarCheck />} colorClass="text-blue-500" subtitle="Tests scheduled" />
          <StatCard title="Completed Today" value={stats.completedToday} icon={<FaCheckCircle />} colorClass="text-emerald-500" subtitle="Tests done" />
          <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<FaMoneyBillWave />} colorClass="text-purple-500" subtitle="From lab tests" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, test, prescription..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Referred Out">Referred Out</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="billed">Paid</option>
            </select>
            <div className="flex gap-2">
              <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="p-2 border border-slate-300 rounded-lg flex-1" placeholder="Start Date" />
              <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="p-2 border border-slate-300 rounded-lg flex-1" placeholder="End Date" />
            </div>
          </div>
        </div>

        {/* Lab Tests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading lab tests...</p>
            </div>
          ) : filteredGroupedLabTests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FaFlask className="text-5xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Lab Tests Found</h3>
              <p className="text-slate-500">No lab tests match your filters</p>
            </div>
          ) : (
            filteredGroupedLabTests.map(renderPrescriptionGroup)
          )}
        </div>

        {/* ========== MODALS ========== */}

        {/* Refer to External Lab Modal */}
        {showReferToExternalModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaTruck className="text-orange-500" /> Refer to External Lab
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Form fields - same as before */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lab Name *</label>
                  <input type="text" value={externalLabData.lab_name} onChange={(e) => setExternalLabData({ ...externalLabData, lab_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="Enter external lab name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lab Address</label>
                  <textarea value={externalLabData.lab_address} onChange={(e) => setExternalLabData({ ...externalLabData, lab_address: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Enter lab address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person</label>
                    <input type="text" value={externalLabData.contact_person} onChange={(e) => setExternalLabData({ ...externalLabData, contact_person: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label>
                    <input type="tel" value={externalLabData.contact_phone} onChange={(e) => setExternalLabData({ ...externalLabData, contact_phone: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reference Number</label>
                  <input type="text" value={externalLabData.reference_number} onChange={(e) => setExternalLabData({ ...externalLabData, reference_number: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50" readOnly />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Courier Name</label>
                    <input type="text" value={externalLabData.courier_name} onChange={(e) => setExternalLabData({ ...externalLabData, courier_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tracking Number</label>
                    <input type="text" value={externalLabData.tracking_number} onChange={(e) => setExternalLabData({ ...externalLabData, tracking_number: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Handover Notes</label>
                  <textarea value={externalLabData.handover_notes} onChange={(e) => setExternalLabData({ ...externalLabData, handover_notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Any additional notes" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setShowReferToExternalModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg">Cancel</button>
                <button onClick={submitReferToExternal} disabled={completingLabTest || !externalLabData.lab_name} className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-md flex items-center gap-2 disabled:opacity-70">
                  {completingLabTest ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaCheck /> Confirm Referral</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handover Log Modal */}
        {showHandoverLogModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaClipboardCheck className="text-teal-500" /> Add Sample Handover Log
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Courier Name</label>
                  <input type="text" value={externalLabData.courier_name} onChange={(e) => setExternalLabData({ ...externalLabData, courier_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tracking Number</label>
                  <input type="text" value={externalLabData.tracking_number} onChange={(e) => setExternalLabData({ ...externalLabData, tracking_number: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea value={externalLabData.handover_notes} onChange={(e) => setExternalLabData({ ...externalLabData, handover_notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Handover notes" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setShowHandoverLogModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg">Cancel</button>
                <button onClick={submitHandoverLog} disabled={completingLabTest} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2">
                  {completingLabTest ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaCheck /> Add Log</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {showUploadReportModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaUpload className="text-purple-500" /> Upload External Lab Report
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Report File *</label>
                  <input type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={(e) => setUploadReportData({ ...uploadReportData, report_file: e.target.files[0] })} className="w-full p-2.5 border border-slate-300 rounded-lg" />
                  <p className="text-xs text-slate-500 mt-1">Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reference Number</label>
                  <input type="text" value={uploadReportData.reference_number} onChange={(e) => setUploadReportData({ ...uploadReportData, reference_number: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea value={uploadReportData.notes} onChange={(e) => setUploadReportData({ ...uploadReportData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg" rows="2" placeholder="Additional notes about the report" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setShowUploadReportModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg">Cancel</button>
                <button onClick={submitUploadReport} disabled={uploadingReport || !uploadReportData.report_file} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2 disabled:opacity-70">
                  {uploadingReport ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</> : <><FaUpload /> Upload Report</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Report Modal - Updated */}
        {showViewReportModal && selectedLabTest && selectedLabTest.external_lab_details?.external_report_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedLabTest.external_lab_details?.external_report_url?.toLowerCase().endsWith('.pdf') ? (
                    <FaFilePdf className="text-red-500" />
                  ) : (
                    <FaImage className="text-purple-500" />
                  )}
                  External Lab Report
                </h3>
                <button onClick={() => setShowViewReportModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold">Test Name:</span> {selectedLabTest.lab_test_name}</div>
                    <div><span className="font-semibold">Lab Name:</span> {selectedLabTest.external_lab_details?.lab_name}</div>
                    <div><span className="font-semibold">Reference Number:</span> {selectedLabTest.external_lab_details?.reference_number}</div>
                    <div><span className="font-semibold">Received Date:</span> {selectedLabTest.external_lab_details?.external_report_received_date ? new Date(selectedLabTest.external_lab_details.external_report_received_date).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>

                {selectedLabTest.external_lab_details?.external_report_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <FaExclamationCircle className="text-blue-600" />
                        Click the button below to view or download the PDF report.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => viewExternalPDFReport(selectedLabTest.prescription_id, selectedLabTest._id)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md"
                      >
                        <FaEye /> View PDF Report
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await apiClient.get(`/labreports/external/${selectedLabTest.prescription_id}/${selectedLabTest._id}/download`, {
                              responseType: 'blob'
                            });
                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `external_report_${selectedLabTest.prescription_number}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            toast.success('Download started!');
                          } catch (error) {
                            console.error('Error downloading:', error);
                            toast.error('Failed to download PDF');
                          }
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
                      >
                        <FaDownload /> Download PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={selectedLabTest.external_lab_details?.external_report_url}
                      alt="Lab Report"
                      className="max-w-full rounded-lg shadow-md"
                    />
                    <div className="mt-4 flex justify-end">
                      <a
                        href={selectedLabTest.external_lab_details?.external_report_url}
                        download
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <FaDownload /> Download Image
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Collect Payment</h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Test Cost</div>
                  <div className="text-3xl font-bold text-emerald-800">₹{selectedLabTest.cost || 0}</div>
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
                  disabled={completingLabTest}
                  className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {completingLabTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave /> Process Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collect Sample Modal */}
        {showCollectSampleModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaVial className="text-purple-500" /> Collect Sample
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-700 mb-2">Test Information</div>
                  <div className="font-bold">{selectedLabTest.lab_test_code} - {selectedLabTest.lab_test_name}</div>
                  {selectedLabTest.specimen_type && (
                    <div className="text-sm text-purple-600 mt-1">Specimen: {selectedLabTest.specimen_type}</div>
                  )}
                  {selectedLabTest.fasting_required && (
                    <div className="text-sm text-amber-600 mt-1">⚠️ Fasting Required</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sample ID</label>
                  <input
                    type="text"
                    value={sampleData.sample_id}
                    onChange={(e) => setSampleData({ ...sampleData, sample_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Collected By</label>
                  <select
                    value={sampleData.collected_by}
                    onChange={(e) => setSampleData({ ...sampleData, collected_by: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Staff</option>
                    {labStaff.map(staff => (
                      <option key={staff._id} value={staff._id}>
                        {staff.first_name} {staff.last_name} - {staff.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Collection Notes</label>
                  <textarea
                    value={sampleData.notes}
                    onChange={(e) => setSampleData({ ...sampleData, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Enter collection notes..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCollectSampleModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={collectSample}
                  disabled={completingLabTest}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {completingLabTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Confirm Collection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Lab Test Modal with Report Upload */}
        {showCompleteLabTestModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedLabTest.status === 'Sample Collected' ? (
                    <><FaPlayCircle className="text-indigo-500" /> Start Processing</>
                  ) : (
                    <><FaCheckCircle className="text-emerald-500" /> Complete Lab Test</>
                  )}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className={`rounded-lg p-4 ${selectedLabTest.status === 'Sample Collected' ? 'bg-indigo-50 border border-indigo-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <div className="text-sm mb-2">Test Information</div>
                  <div className="font-bold">{selectedLabTest.lab_test_code} - {selectedLabTest.lab_test_name}</div>
                  <div className="text-lg font-bold mt-2">₹{selectedLabTest.cost || 0}</div>
                </div>

                {/* Report Upload Section - Only show when completing test (not starting processing) */}
                {selectedLabTest.status !== 'Sample Collected' && (
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <label className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                      <FaUpload className="text-purple-600" /> Upload Lab Report (PDF/Image)
                    </label>

                    {/* Show existing report if available */}
                    {selectedLabTest.report_url && (
                      <div className="mb-3 p-3 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700">Current Report:</span>
                          <button
                            onClick={() => {
                              // Find the report ID from the URL or fetch from API
                              // For now, use the URL directly or implement report ID lookup
                              if (selectedLabTest.report_url) {
                                window.open(selectedLabTest.report_url, '_blank');
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FaExternalLinkAlt className="text-xs" /> View Current
                          </button>
                        </div>
                        {selectedLabTest.report_url.match(/\.pdf$/i) ? (
                          <div className="text-sm text-purple-600">📄 PDF Report uploaded</div>
                        ) : (
                          <img src={selectedLabTest.report_url} alt="Current Report" className="max-h-32 rounded border" />
                        )}
                      </div>
                    )}

                    <input
                      type="file"
                      accept=".pdf,.jpg,.png,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCompleteLabTestData({
                            ...completeLabTestData,
                            report_file: file,
                            report_file_name: file.name
                          });
                        }
                      }}
                      className="w-full p-2 border border-purple-300 rounded-lg bg-white text-sm"
                    />
                    {completeLabTestData.report_file && (
                      <p className="text-xs text-purple-600 mt-1">
                        Selected: {completeLabTestData.report_file_name}
                      </p>
                    )}
                    <p className="text-xs text-purple-500 mt-2">
                      Accepted formats: PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Performed By</label>
                  <select
                    value={labTestData.performed_by || completeLabTestData.performed_by}
                    onChange={(e) => {
                      setLabTestData({ ...labTestData, performed_by: e.target.value });
                      setCompleteLabTestData({ ...completeLabTestData, performed_by: e.target.value });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Lab Staff</option>
                    {labStaff.map(staff => (
                      <option key={staff._id} value={staff._id}>
                        {staff.first_name} {staff.last_name} - {staff.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={labTestData.notes || completeLabTestData.notes}
                    onChange={(e) => {
                      setLabTestData({ ...labTestData, notes: e.target.value });
                      setCompleteLabTestData({ ...completeLabTestData, notes: e.target.value });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Enter notes..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowCompleteLabTestModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedLabTest.status === 'Sample Collected') {
                      await startProcessing();
                    } else {
                      if (completeLabTestData.report_file) {
                        await completeLabTestWithReport();
                      } else {
                        await completeLabTest();
                      }
                    }
                  }}
                  disabled={completingLabTest}
                  className={`px-6 py-2 font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-70 ${selectedLabTest.status === 'Sample Collected'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600'
                    }`}
                >
                  {completingLabTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedLabTest.status === 'Sample Collected' ? <FaPlayCircle /> : <FaCheck />}
                      {selectedLabTest.status === 'Sample Collected' ? 'Start Processing' : (completeLabTestData.report_file ? 'Upload Report & Complete' : 'Complete Test')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lab Test Details Modal - Updated for internal reports */}
        {showLabTestDetails && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Lab Test Details</h3>
                <button onClick={() => setShowLabTestDetails(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Test Code</label>
                    <p className="font-bold text-lg">{selectedLabTest.lab_test_code}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Status</label>
                    <div className="mt-1"><StatusBadge status={selectedLabTest.status} /></div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase">Test Name</label>
                  <p className="font-bold text-lg">{selectedLabTest.lab_test_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Category</label>
                    <p className="font-medium">{selectedLabTest.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Specimen Type</label>
                    <p className="font-medium">{selectedLabTest.specimen_type || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase">Cost</label>
                  <p className="text-2xl font-bold text-emerald-700">₹{selectedLabTest.cost || 0}</p>
                </div>

                {selectedLabTest.fasting_required && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">⚠️ Fasting required for this test</p>
                  </div>
                )}

                {/* Internal Report Section */}
                {(selectedLabTest.status === 'Completed' || selectedLabTest.report_url) && selectedLabTest.report_url && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <FaFilePdf className="text-purple-600" /> Lab Report
                    </h4>

                    {selectedLabTest.report_url.toLowerCase().endsWith('.pdf') ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700 flex items-center gap-2">
                            <FaExclamationCircle className="text-blue-600" />
                            Click the button below to view or download the PDF report.
                          </p>
                        </div>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => viewPDFReport(selectedLabTest.report_url, selectedLabTest._id)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md"
                          >
                            <FaEye /> View PDF Report
                          </button>
                          <a
                            href={selectedLabTest.report_url}
                            download
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
                            onClick={(e) => {
                              e.preventDefault();
                              // Force download using fetch if needed
                              viewPDFReport(selectedLabTest.report_url, selectedLabTest._id);
                            }}
                          >
                            <FaDownload /> Download PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={selectedLabTest.report_url}
                          alt="Lab Report"
                          className="max-w-full rounded-lg shadow-md border border-purple-200"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <a
                            href={selectedLabTest.report_url}
                            download
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                          >
                            <FaDownload /> Download Image
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* External Lab Information for Referred Out Tests */}
                {selectedLabTest.status === 'Referred Out' && selectedLabTest.external_lab_details && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <FaTruck className="text-orange-600" /> External Lab Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-orange-700">Lab Name:</span>
                        <span className="text-orange-800">{selectedLabTest.external_lab_details.lab_name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-orange-700">Reference Number:</span>
                        <span className="text-orange-800 font-mono">{selectedLabTest.external_lab_details.reference_number}</span>
                      </div>
                      {selectedLabTest.external_lab_details.external_report_url && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <button
                            onClick={() => viewExternalPDFReport(selectedLabTest.prescription_id, selectedLabTest._id)}
                            className="text-orange-600 hover:text-orange-800 flex items-center gap-2"
                          >
                            <FaFilePdf /> View External Lab Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedLabTest.notes && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Notes</label>
                    <p className="bg-slate-50 p-3 rounded-lg">{selectedLabTest.notes}</p>
                  </div>
                )}

                {selectedLabTest.scheduled_date && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Scheduled Date</label>
                    <p className="font-medium">{new Date(selectedLabTest.scheduled_date).toLocaleString()}</p>
                  </div>
                )}

                {selectedLabTest.sample_collected_at && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Sample Collected</label>
                    <p className="font-medium">{new Date(selectedLabTest.sample_collected_at).toLocaleString()}</p>
                  </div>
                )}

                {selectedLabTest.completed_date && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Completed Date</label>
                    <p className="font-medium">{new Date(selectedLabTest.completed_date).toLocaleString()}</p>
                  </div>
                )}

                {selectedLabTest.performed_by && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Performed By</label>
                    <p className="font-medium">{selectedLabTest.performed_by}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bill Generation Modal, Success Modal, Auto Bill Modal, History Modal - Same as before */}
        {/* ... (keep these modals as they were) ... */}

        {/* Bill Generation Modal */}
        {showBillModal && selectedPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Generate Bill & Invoice</h3>
                <p className="text-slate-500 text-sm mt-1">For prescription #{selectedPrescription.prescription_number}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 mb-2">Important Note</h4>
                  <p className="text-sm text-purple-700">
                    Creating a bill with status 'Generated' will automatically create an invoice for the patient.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 mb-3">Bill Items</h4>
                  <div className="space-y-3">
                    {billData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                        <div>
                          <div className="font-medium text-slate-800">{item.description}</div>
                          <div className="text-sm text-slate-500">Test Code: {item.lab_test_code}</div>
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
                  disabled={completingLabTest}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {completingLabTest ? (
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

        {/* Success Modal */}
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

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-700 mb-2">Invoice Generated</div>
                  <div className="font-bold text-lg">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div>
                  <div className="text-sm text-purple-600">Status: <StatusBadge status={generatedInvoice.status} /></div>
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
                    className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2"
                  >
                    <FaDownload /> Download Invoice
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

        {/* Auto Bill Success Modal */}
        {showAutoBillModal && generatedBill && generatedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> Payment Successful!
                </h3>
                <p className="text-slate-500 text-sm mt-1">Payment processed and invoice generated</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Payment Received</div>
                  <div className="font-bold">₹{generatedBill?.total_amount || 0}</div>
                  <div className="text-sm text-emerald-600 mt-1">Method: {paymentData.method}</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-700 mb-2">Invoice Generated</div>
                  <div className="font-bold text-lg">Invoice #: {generatedInvoice.invoice_number || 'N/A'}</div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => {
                    setShowAutoBillModal(false);
                    fetchLabTests();
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={downloadInvoice}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2"
                >
                  <FaDownload /> Download Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Lab Test History</h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>

              <div className="p-6 space-y-6">
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
                          Prescription #{selectedLabTest.prescription_number}
                        </div>
                      </div>
                    </div>

                    {selectedLabTest.scheduled_date && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FaCalendarCheck className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Scheduled</div>
                          <div className="text-sm text-slate-500">
                            {new Date(selectedLabTest.scheduled_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLabTest.sample_collected_at && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <FaVial className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Sample Collected</div>
                          <div className="text-sm text-slate-500">
                            {new Date(selectedLabTest.sample_collected_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLabTest.completed_date && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                          <FaCheckCircle className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Completed</div>
                          <div className="text-sm text-slate-500">
                            {new Date(selectedLabTest.completed_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLabTest.is_billed && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <FaReceipt className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Billed</div>
                          <div className="text-sm text-slate-500">
                            Amount: ₹{selectedLabTest.cost || 0}
                          </div>
                        </div>
                      </div>
                    )}
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

export default LabTestsManagement;