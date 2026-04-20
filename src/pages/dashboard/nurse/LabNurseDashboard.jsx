// pages/dashboard/lab-nurse/LabNurseDashboard.jsx
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
  FaClipboardCheck, FaTag, FaMoneyBillWave,
  FaReceipt, FaArrowRight, FaPlayCircle,
  FaHistory, FaDownload, FaEnvelope, FaCheck, 
  FaThermometerHalf, FaDna, FaHeartbeat, FaFilePrescription,
  FaUpload, FaFilePdf, FaImage, FaExternalLinkAlt, FaHospitalUser,
  FaSyringe, FaBoxes, FaClipboardList, FaUserClock, FaChartLine
} from 'react-icons/fa';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FaClock className="text-xs" /> },
    'Sample Collected': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <FaVial className="text-xs" /> },
    'Processing': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <FaMicroscope className="text-xs" /> },
    'Completed': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle className="text-xs" /> },
    'Ready for Collection': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FaSyringe className="text-xs" /> }
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

function LabNurseDashboard() {
  const [loading, setLoading] = useState(true);
  const [labTests, setLabTests] = useState([]);
  const [filteredLabTests, setFilteredLabTests] = useState([]);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [processingLabTest, setProcessingLabTest] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  
  // Modals
  const [showLabTestDetails, setShowLabTestDetails] = useState(false);
  const [showCollectSampleModal, setShowCollectSampleModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showViewReportModal, setShowViewReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Form States
  const [sampleData, setSampleData] = useState({
    sample_id: '',
    sample_type: '',
    collection_date: new Date().toISOString(),
    collected_by: '',
    notes: ''
  });
  
  const [reportData, setReportData] = useState({
    report_file: null,
    report_file_name: '',
    notes: ''
  });
  
  // Stats
  const [stats, setStats] = useState({
    readyForCollection: 0,
    samplesCollected: 0,
    processing: 0,
    completed: 0,
    todayCollected: 0,
    totalRevenue: 0
  });
  
  const [labStaff, setLabStaff] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentNurse, setCurrentNurse] = useState(null);

  // Filter lab tests for nurse - Only show tests that are:
  // 1. Paid (is_billed = true)
  // 2. Not referred to external lab (is_referred_out !== true)
  // 3. Status is not 'Completed'
  const nurseLabTests = useMemo(() => {
    return labTests.filter(test => 
      test.is_billed === true && 
      test.is_referred_out !== true &&
      test.status !== 'Completed' &&
      test.status !== 'Referred Out' // Exclude referred out tests
    );
  }, [labTests]);

  const groupedLabTests = useMemo(() => {
    const groups = {};
    nurseLabTests.forEach(test => {
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
  }, [nurseLabTests]);

  useEffect(() => {
    fetchLabTests();
    fetchLabStaff();
    fetchHospitalInfo();
    fetchCategories();
    fetchCurrentNurse();
  }, []);

  useEffect(() => {
    filterLabTests();
  }, [nurseLabTests, searchTerm, statusFilter, categoryFilter, dateFilter]);

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

  const fetchCurrentNurse = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setCurrentNurse(response.data);
    } catch (error) {
      console.error('Error fetching nurse info:', error);
    }
  };

  const calculateStats = (testsData) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Only count tests that are paid and not referred out
    const eligibleTests = testsData.filter(test => 
      test.is_billed === true && 
      test.is_referred_out !== true
    );
    
    let readyForCollection = 0;
    let samplesCollected = 0;
    let processing = 0;
    let completed = 0;
    let todayCollected = 0;
    let totalRevenue = 0;

    eligibleTests.forEach(test => {
      if (test.status === 'Pending') readyForCollection++;
      if (test.status === 'Sample Collected') samplesCollected++;
      if (test.status === 'Processing') processing++;
      if (test.status === 'Completed') completed++;
      
      if (test.sample_collected_at && 
          new Date(test.sample_collected_at).toISOString().split('T')[0] === today) {
        todayCollected++;
      }
      
      if (test.cost > 0) totalRevenue += test.cost;
    });

    setStats({
      readyForCollection,
      samplesCollected,
      processing,
      completed,
      todayCollected,
      totalRevenue
    });
  };

  const filterLabTests = () => {
    let filtered = [...nurseLabTests];

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
        
        return patientName.includes(term) || doctorName.includes(term) ||
               prescriptionNo.includes(term) || testName.includes(term) ||
               testCode.includes(term);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(test => test.category === categoryFilter);
    }

    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(test => {
        const scheduledDate = test.scheduled_date ? 
          new Date(test.scheduled_date).toISOString().split('T')[0] : '';
        const matchesStart = !dateFilter.start || scheduledDate >= dateFilter.start;
        const matchesEnd = !dateFilter.end || scheduledDate <= dateFilter.end;
        return matchesStart && matchesEnd;
      });
    }

    setFilteredLabTests(filtered);
  };

  // Handle Collect Sample
  const handleCollectSample = (labTest) => {
    setSelectedLabTest(labTest);
    setSampleData({
      sample_id: `SMP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      sample_type: labTest.specimen_type || '',
      collection_date: new Date().toISOString(),
      collected_by: currentNurse?._id || '',
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

      if (!sampleData.collected_by) {
        toast.warning('Please select who is collecting the sample');
        return;
      }

      setProcessingLabTest(true);

      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        {
          status: 'Sample Collected',
          sample_collected_at: sampleData.collection_date,
          sample_id: sampleData.sample_id,
          performed_by: sampleData.collected_by,
          notes: sampleData.notes
        }
      );

      toast.success('Sample collected successfully! Ready for processing.');
      setShowCollectSampleModal(false);
      setShowSuccessModal(true);
      fetchLabTests();
      
      // Reset success modal after 3 seconds
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to mark sample as collected');
    } finally {
      setProcessingLabTest(false);
    }
  };

  // Handle Start Processing
  const handleStartProcessing = async (labTest) => {
    try {
      setProcessingLabTest(true);
      
      await apiClient.put(
        `/prescriptions/${labTest.prescription_id}/lab-tests/${labTest._id}/status`,
        {
          status: 'Processing',
          performed_by: currentNurse?._id,
          notes: 'Sample received and processing started'
        }
      );

      toast.success('Test is now in processing!');
      fetchLabTests();
    } catch (error) {
      console.error('Error starting processing:', error);
      toast.error('Failed to start processing');
    } finally {
      setProcessingLabTest(false);
    }
  };

  // Handle Upload Report
  const handleUploadReport = (labTest) => {
    setSelectedLabTest(labTest);
    setReportData({
      report_file: null,
      report_file_name: '',
      notes: ''
    });
    setShowUploadReportModal(true);
  };

  const uploadReport = async () => {
    try {
      if (!selectedLabTest || !reportData.report_file) {
        toast.warning('Please select a report file to upload');
        return;
      }

      setUploadingReport(true);

      const formData = new FormData();
      formData.append('report', reportData.report_file);
      formData.append('prescription_id', selectedLabTest.prescription_id);
      formData.append('lab_test_id', selectedLabTest._id);
      formData.append('notes', reportData.notes);

      const response = await apiClient.post('/lab-reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const reportUrl = response.data.file_url;

      // Mark test as completed with report URL
      await apiClient.put(
        `/prescriptions/${selectedLabTest.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        {
          status: 'Completed',
          completed_date: new Date().toISOString(),
          performed_by: currentNurse?._id,
          report_url: reportUrl,
          notes: reportData.notes || 'Report uploaded'
        }
      );

      toast.success('Report uploaded and test marked as completed!');
      setShowUploadReportModal(false);
      fetchLabTests();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error(error.response?.data?.error || 'Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  };

  // Handle View Report
  const handleViewReport = (labTest) => {
    setSelectedLabTest(labTest);
    setShowViewReportModal(true);
  };

  const handleViewLabTest = (labTest) => {
    setSelectedLabTest(labTest);
    setShowLabTestDetails(true);
  };

  // Render Lab Test Card for Nurse
  const renderLabTestCard = (test, index) => {
    const canCollectSample = test.status === 'Pending';
    const canProcess = test.status === 'Sample Collected';
    const canUploadReport = test.status === 'Processing';
    const hasReport = test.report_url;

    return (
      <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FaTag className="text-purple-500 text-sm" />
              <span className="font-bold text-slate-800">{test.lab_test_code}</span>
              <StatusBadge status={test.status} />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                <FaMoneyBillWave className="text-xs" /> Paid
              </span>
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
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <FaCheckCircle /> Payment Received
            </div>
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
            <div className="text-xs text-slate-400">Patient</div>
            <div className="font-medium">
              {test.patient?.first_name} {test.patient?.last_name}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Doctor</div>
            <div className="font-medium">
              Dr. {test.doctor?.firstName} {test.doctor?.lastName}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Prescription</div>
            <div className="font-medium text-purple-600">
              #{test.prescription_number}
            </div>
          </div>
        </div>

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
            {test.sample_id && (
              <p className="text-xs text-blue-600 mt-1">Sample ID: {test.sample_id}</p>
            )}
          </div>
        )}

        {hasReport && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-purple-800 mb-1">Report Available</div>
            <button
              onClick={() => handleViewReport(test)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <FaFilePdf /> View/Download Report
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => handleViewLabTest(test)}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"
          >
            <FaEye /> View Details
          </button>
          
          {/* Step 1: Collect Sample */}
          {canCollectSample && (
            <button
              onClick={() => handleCollectSample(test)}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1 font-semibold border-2 border-purple-200"
            >
              <FaSyringe /> Step 1: Collect Sample
            </button>
          )}
          
          {/* Step 2: Start Processing */}
          {canProcess && (
            <button
              onClick={() => handleStartProcessing(test)}
              className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
            >
              <FaPlayCircle /> Step 2: Start Processing
            </button>
          )}
          
          {/* Step 3: Upload Report */}
          {canUploadReport && (
            <button
              onClick={() => handleUploadReport(test)}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-lg flex items-center gap-1 shadow-md"
            >
              <FaUpload /> Step 3: Upload Report & Complete
            </button>
          )}
        </div>

        {/* Workflow Progress Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                <FaMoneyBillWave />
              </div>
              <div className="text-xs font-medium text-emerald-600">Paid</div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                test.sample_collected_at ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <FaSyringe />
              </div>
              <div className={`text-xs font-medium ${test.sample_collected_at ? 'text-purple-600' : 'text-slate-400'}`}>
                Collected
              </div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                test.status === 'Processing' || test.status === 'Completed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <FaMicroscope />
              </div>
              <div className={`text-xs font-medium ${test.status === 'Processing' || test.status === 'Completed' ? 'text-indigo-600' : 'text-slate-400'}`}>
                Processing
              </div>
            </div>
            <FaArrowRight className="text-slate-300" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                test.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <FaCheckCircle />
              </div>
              <div className={`text-xs font-medium ${test.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Prescription Group
  const renderPrescriptionGroup = (group) => {
    const pendingCollection = group.labTests?.filter(t => t.status === 'Pending') || [];
    const collectedTests = group.labTests?.filter(t => t.status === 'Sample Collected') || [];
    const processingTests = group.labTests?.filter(t => t.status === 'Processing') || [];
    const completedTests = group.labTests?.filter(t => t.status === 'Completed') || [];

    return (
      <div key={group.prescription_id} className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
        {/* Prescription Header */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaFilePrescription className="text-teal-600" />
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

        {/* Prescription Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pendingCollection.length}</div>
              <div className="text-sm text-slate-500">Ready for Collection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{collectedTests.length}</div>
              <div className="text-sm text-slate-500">Samples Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{processingTests.length}</div>
              <div className="text-sm text-slate-500">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{completedTests.length}</div>
              <div className="text-sm text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{group.labTests?.length || 0}</div>
              <div className="text-sm text-slate-500">Total Tests</div>
            </div>
          </div>
        </div>

        {/* Lab Tests List */}
        <div className="p-6">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaFlask /> Lab Tests to Process
          </h4>
          
          {group.labTests && group.labTests.length > 0 ? (
            <div className="space-y-4">
              {group.labTests.map((test, index) => renderLabTestCard(test, index))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FaExclamationCircle className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No lab tests in this prescription</p>
            </div>
          )}
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
            <FaHospitalUser className="text-teal-500" /> Lab Nurse Dashboard
          </h1>
          <p className="text-slate-600">Manage sample collection, processing, and report uploads for internal lab tests</p>
          {currentNurse && (
            <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
              <FaUserClock /> Welcome, {currentNurse.first_name} {currentNurse.last_name}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Ready for Collection" 
            value={stats.readyForCollection} 
            icon={<FaSyringe />} 
            colorClass="text-purple-500" 
            subtitle="Awaiting sample collection" 
          />
          <StatCard 
            title="Samples Collected" 
            value={stats.samplesCollected} 
            icon={<FaVial />} 
            colorClass="text-indigo-500" 
            subtitle="Ready for processing" 
          />
          <StatCard 
            title="Processing" 
            value={stats.processing} 
            icon={<FaMicroscope />} 
            colorClass="text-orange-500" 
            subtitle="Tests in progress" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<FaCheckCircle />} 
            colorClass="text-emerald-500" 
            subtitle="Reports uploaded" 
          />
          <StatCard 
            title="Today's Collection" 
            value={stats.todayCollected} 
            icon={<FaCalendarCheck />} 
            colorClass="text-blue-500" 
            subtitle="Samples collected today" 
          />
          <StatCard 
            title="Total Value" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={<FaChartLine />} 
            colorClass="text-teal-500" 
            subtitle="From lab tests" 
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, test, prescription..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Ready for Collection</option>
              <option value="Sample Collected">Samples Collected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)} 
              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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

        {/* Lab Tests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading lab tests...</p>
            </div>
          ) : filteredGroupedLabTests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FaFlask className="text-5xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Lab Tests Available</h3>
              <p className="text-slate-500">No paid internal lab tests are currently pending for processing</p>
            </div>
          ) : (
            filteredGroupedLabTests.map(renderPrescriptionGroup)
          )}
        </div>

        {/* ========== MODALS ========== */}

        {/* Collect Sample Modal */}
        {showCollectSampleModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaSyringe className="text-purple-500" /> Collect Sample
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
                    onChange={(e) => setSampleData({...sampleData, sample_id: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Collected By</label>
                  <select
                    value={sampleData.collected_by}
                    onChange={(e) => setSampleData({...sampleData, collected_by: e.target.value})}
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
                    onChange={(e) => setSampleData({...sampleData, notes: e.target.value})}
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
                  disabled={processingLabTest}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {processingLabTest ? (
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

        {/* Upload Report Modal */}
        {showUploadReportModal && selectedLabTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FaUpload className="text-emerald-500" /> Upload Lab Report
                </h3>
                <p className="text-slate-500 text-sm mt-1">{selectedLabTest.lab_test_name}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-2">Test Information</div>
                  <div className="font-bold">{selectedLabTest.lab_test_code} - {selectedLabTest.lab_test_name}</div>
                  <div className="text-sm text-emerald-600 mt-1">Status: Processing → Complete</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Report File *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setReportData({ 
                          ...reportData, 
                          report_file: file,
                          report_file_name: file.name 
                        });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                  {reportData.report_file_name && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Selected: {reportData.report_file_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Accepted formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={reportData.notes}
                    onChange={(e) => setReportData({...reportData, notes: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    rows="3"
                    placeholder="Enter report notes..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadReportModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadReport}
                  disabled={uploadingReport || !reportData.report_file}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 shadow-md flex items-center gap-2 disabled:opacity-70"
                >
                  {uploadingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload /> Upload & Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Report Modal */}
        {showViewReportModal && selectedLabTest && selectedLabTest.report_url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedLabTest.report_url.toLowerCase().endsWith('.pdf') ? (
                    <FaFilePdf className="text-red-500" />
                  ) : (
                    <FaImage className="text-purple-500" />
                  )}
                  Lab Report - {selectedLabTest.lab_test_name}
                </h3>
                <button onClick={() => setShowViewReportModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold">Test Name:</span> {selectedLabTest.lab_test_name}</div>
                    <div><span className="font-semibold">Test Code:</span> {selectedLabTest.lab_test_code}</div>
                    <div><span className="font-semibold">Patient:</span> {selectedLabTest.patient?.first_name} {selectedLabTest.patient?.last_name}</div>
                    <div><span className="font-semibold">Completed Date:</span> {selectedLabTest.completed_date ? new Date(selectedLabTest.completed_date).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
                
                {selectedLabTest.report_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <FaExclamationCircle className="text-yellow-600" />
                        Click the button below to view or download the PDF report.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <a
                        href={selectedLabTest.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                      >
                        <FaEye /> View PDF Report
                      </a>
                      <a
                        href={selectedLabTest.report_url}
                        download
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                      className="max-w-full rounded-lg shadow-md"
                    />
                    <div className="mt-4 flex justify-end">
                      <a 
                        href={selectedLabTest.report_url} 
                        download 
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
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

        {/* Lab Test Details Modal */}
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
                
                <div>
                  <label className="text-xs text-slate-500 uppercase">Patient</label>
                  <p className="font-medium">{selectedLabTest.patient?.first_name} {selectedLabTest.patient?.last_name}</p>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 uppercase">Doctor</label>
                  <p className="font-medium">Dr. {selectedLabTest.doctor?.firstName} {selectedLabTest.doctor?.lastName}</p>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 uppercase">Prescription</label>
                  <p className="font-medium">#{selectedLabTest.prescription_number}</p>
                </div>
                
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
                    {selectedLabTest.sample_id && (
                      <p className="text-sm text-slate-500 mt-1">Sample ID: {selectedLabTest.sample_id}</p>
                    )}
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

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-emerald-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Success!</h3>
                <p className="text-slate-500">Sample collected successfully!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LabNurseDashboard;