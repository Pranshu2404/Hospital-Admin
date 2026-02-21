// pages/dashboard/pathology/prescriptions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaFilePrescription, 
  FaSearch, 
  FaEye,
  FaFlask,
  FaVial,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUserMd,
  FaMicroscope,
  FaDownload,
  FaPrint,
  FaUpload,
  FaTimes,
  FaHourglassHalf,
  FaThermometerHalf,
  FaMoneyBillWave, // Added for payment
  FaLock // Added for locked tests
} from 'react-icons/fa';

const PathologyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollectSampleModal, setShowCollectSampleModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showPaymentWarningModal, setShowPaymentWarningModal] = useState(false); // New modal for payment warning
  const [updateStatusData, setUpdateStatusData] = useState({
    notes: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reportFile, setReportFile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    collected: 0,
    processing: 0,
    completed: 0,
    unpaid: 0 // Added unpaid count
  });

  // Get current pathology staff ID from localStorage
  const pathologyStaffId = localStorage.getItem('pathologyStaffId');

  useEffect(() => {
    fetchPrescriptionsWithLabTests();
    fetchStats();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, statusFilter, dateFilter]);

  const fetchPrescriptionsWithLabTests = async () => {
    setLoading(true);
    try {
      // API: GET /prescriptions/with-lab-tests
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/with-lab-tests`,
        {
          params: {
            limit: 100
          }
        }
      );

      const labTestsData = response.data.labTests || [];
      setPrescriptions(labTestsData);

    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // API: GET /prescriptions/lab-tests/status/:status for each status
      const pendingRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Pending`);
      const scheduledRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Scheduled`);
      const collectedRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Sample%20Collected`);
      const processingRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Processing`);
      const completedRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Completed`);

      // Get unpaid tests (is_billed = false)
      const allTests = [...(pendingRes.data.labTests || []), ...(scheduledRes.data.labTests || [])];
      const unpaidTests = allTests.filter(test => !test.is_billed).length;

      setStats({
        total: pendingRes.data.count + scheduledRes.data.count + collectedRes.data.count + processingRes.data.count + completedRes.data.count,
        pending: pendingRes.data.count || 0,
        scheduled: scheduledRes.data.count || 0,
        collected: collectedRes.data.count || 0,
        processing: processingRes.data.count || 0,
        completed: completedRes.data.count || 0,
        unpaid: unpaidTests || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.patient?.first_name?.toLowerCase().includes(term) ||
        p.patient?.last_name?.toLowerCase().includes(term) ||
        p.prescription_number?.toLowerCase().includes(term) ||
        p.lab_test_name?.toLowerCase().includes(term) ||
        p.lab_test_code?.toLowerCase().includes(term) ||
        p.doctor?.firstName?.toLowerCase().includes(term) ||
        p.doctor?.lastName?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(p => 
        new Date(p.scheduled_date || p.issue_date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedPrescription || !selectedLabTest) return;

    try {
      const payload = {
        status: newStatus,
        notes: updateStatusData.notes,
        performed_by: pathologyStaffId
      };

      if (newStatus === 'Sample Collected') {
        payload.sample_collected_at = new Date();
      }
      if (newStatus === 'Completed') {
        payload.completed_date = new Date();
      }

      // API: PUT /prescriptions/:prescription_id/lab-tests/:lab_test_id/status
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/${selectedPrescription.prescription_id}/lab-tests/${selectedLabTest._id}/status`,
        payload
      );

      if (response.data.success) {
        await fetchPrescriptionsWithLabTests();
        await fetchStats();
        setShowCollectSampleModal(false);
        setShowUploadReportModal(false);
        setSelectedLabTest(null);
        setUpdateStatusData({ notes: '' });
      }
    } catch (error) {
      console.error('Error updating lab test status:', error);
    }
  };

  const handleCollectSampleClick = (item) => {
    // Check if the test is billed (payment received)
    if (!item.is_billed) {
      // Show payment warning modal
      setSelectedPrescription(item);
      setSelectedLabTest({
        _id: item._id,
        lab_test_code: item.lab_test_code,
        lab_test_name: item.lab_test_name,
        cost: item.cost
      });
      setShowPaymentWarningModal(true);
    } else {
      // Proceed with sample collection
      setSelectedPrescription(item);
      setSelectedLabTest({
        _id: item._id,
        lab_test_code: item.lab_test_code,
        lab_test_name: item.lab_test_name
      });
      setShowCollectSampleModal(true);
    }
  };

  const handleCollectSample = async () => {
    await handleUpdateStatus('Sample Collected');
  };

  const handleStartProcessing = async () => {
    await handleUpdateStatus('Processing');
  };

  const handleUploadReport = async () => {
    if (!selectedPrescription || !selectedLabTest || !reportFile) return;

    const formData = new FormData();
    formData.append('report', reportFile);
    formData.append('prescription_id', selectedPrescription.prescription_id);
    formData.append('lab_test_id', selectedLabTest._id);
    formData.append('patient_id', selectedPrescription.patient?._id);
    formData.append('doctor_id', selectedPrescription.doctor?._id);
    formData.append('lab_test_name', selectedLabTest.lab_test_name);
    formData.append('notes', updateStatusData.notes || '');

    try {
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/lab-reports/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (uploadResponse.data.success) {
        // Mark as completed with report URL
        await handleUpdateStatus('Completed');
        setShowUploadReportModal(false);
        setReportFile(null);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading report:', error);
    }
  };

  const handleMarkAsBilled = async () => {
    if (!selectedPrescription || !selectedLabTest) return;

    try {
      // You would typically get invoice_id from billing system
      const invoice_id = 'temp_invoice_id'; // Replace with actual invoice ID

      // API: PUT /prescriptions/:prescription_id/lab-tests/:lab_test_id/billed
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/${selectedPrescription.prescription_id}/lab-tests/${selectedLabTest._id}/billed`,
        {
          invoice_id,
          cost: selectedLabTest.cost
        }
      );

      if (response.data.success) {
        await fetchPrescriptionsWithLabTests();
      }
    } catch (error) {
      console.error('Error marking as billed:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
      'Scheduled': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaCalendarAlt },
      'Sample Collected': { bg: 'bg-purple-100', text: 'text-purple-800', icon: FaVial },
      'Processing': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: FaMicroscope },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes }
    };
    const { bg, text, icon: Icon } = config[status] || config.Pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="mr-1" size={10} />
        {status}
      </span>
    );
  };

  const getPaymentBadge = (isBilled) => {
    return isBilled ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
        <FaCheckCircle className="mr-1" size={8} />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-2">
        <FaMoneyBillWave className="mr-1" size={8} />
        Unpaid
      </span>
    );
  };

  const getFastingBadge = (fasting) => {
    return fasting ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
        <FaExclamationTriangle className="mr-1" size={8} />
        Fasting Required
      </span>
    ) : null;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFilePrescription className="text-teal-600" />
            Lab Test Prescriptions
          </h1>
          <p className="text-gray-500 mt-1">View and process lab tests prescribed by doctors</p>
        </div>

        {/* Stats Cards - Added Unpaid card */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
            <p className="text-xs text-yellow-700">Pending</p>
            <p className="text-xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
            <p className="text-xs text-blue-700">Scheduled</p>
            <p className="text-xl font-bold text-blue-800">{stats.scheduled}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
            <p className="text-xs text-purple-700">Collected</p>
            <p className="text-xl font-bold text-purple-800">{stats.collected}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200">
            <p className="text-xs text-indigo-700">Processing</p>
            <p className="text-xl font-bold text-indigo-800">{stats.processing}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
            <p className="text-xs text-green-700">Completed</p>
            <p className="text-xl font-bold text-green-800">{stats.completed}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
            <p className="text-xs text-red-700">Unpaid</p>
            <p className="text-xl font-bold text-red-800">{stats.unpaid}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, test, prescription..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredPrescriptions.length} of {prescriptions.length} tests
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaFilePrescription className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Lab Test Prescriptions Found</h3>
            <p className="text-gray-500">No prescriptions match your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((item, index) => (
              <div
                key={`${item.prescription_id}-${item._id}-${index}`}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  !item.is_billed && item.status === 'Pending' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
                  !item.is_billed && item.status === 'Pending' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {item.prescription_number}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.issue_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {getPaymentBadge(item.is_billed)}
                    {getFastingBadge(item.fasting_required)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaUserMd className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Patient</p>
                        <p className="font-medium text-gray-800">
                          {item.patient?.first_name} {item.patient?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {item.patient?.patientId}
                        </p>
                      </div>
                    </div>

                    {/* Test Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaFlask className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lab Test</p>
                        <p className="font-medium text-gray-800">{item.lab_test_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {item.lab_test_code}
                        </p>
                        {item.cost > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Cost: ₹{item.cost}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaUserMd className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Prescribed By</p>
                        <p className="font-medium text-gray-800">
                          Dr. {item.doctor?.firstName} {item.doctor?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.doctor?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Warning for Unpaid Tests */}
                  {!item.is_billed && item.status === 'Pending' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <FaLock className="text-lg" />
                        <p className="text-sm font-medium">
                          ⚠️ Payment pending (₹{item.cost || 0}). Sample collection is locked until payment is received.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.notes && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600 mt-1">{item.notes}</p>
                      </div>
                    )}
                    
                    {item.scheduled_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Scheduled Date:</span>
                        <p className="text-gray-600 mt-1">{formatDate(item.scheduled_date)}</p>
                      </div>
                    )}

                    {item.sample_collected_at && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Sample Collected:</span>
                        <p className="text-gray-600 mt-1">{formatDate(item.sample_collected_at)}</p>
                      </div>
                    )}

                    {item.completed_date && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Completed:</span>
                        <p className="text-gray-600 mt-1">{formatDate(item.completed_date)}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedPrescription(item);
                        setSelectedLabTest({
                          _id: item._id,
                          lab_test_code: item.lab_test_code,
                          lab_test_name: item.lab_test_name,
                          status: item.status,
                          cost: item.cost
                        });
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FaEye size={14} /> View Details
                    </button>

                    {item.status === 'Pending' && (
                      <button
                        onClick={() => handleCollectSampleClick(item)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                          item.is_billed 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!item.is_billed}
                        title={!item.is_billed ? 'Payment required before sample collection' : 'Collect Sample'}
                      >
                        <FaVial size={14} /> 
                        {item.is_billed ? 'Collect Sample' : 'Payment Required'}
                      </button>
                    )}

                    {item.status === 'Sample Collected' && (
                      <button
                        onClick={() => {
                          setSelectedPrescription(item);
                          setSelectedLabTest({
                            _id: item._id,
                            lab_test_code: item.lab_test_code,
                            lab_test_name: item.lab_test_name
                          });
                          setShowUploadReportModal(true);
                        }}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
                      >
                        <FaUpload size={14} /> Complete Test
                      </button>
                    )}

                    {item.report_url && (
                      <>
                        <a
                          href={item.report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                        >
                          <FaDownload size={14} /> Download Report
                        </a>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                        >
                          <FaPrint size={14} /> Print
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Warning Modal */}
        {showPaymentWarningModal && selectedPrescription && selectedLabTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaLock className="text-red-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Required</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This lab test requires payment before sample collection
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">Test Details:</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Test:</span> {selectedLabTest.lab_test_name}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Code:</span> {selectedLabTest.lab_test_code}</p>
                <p className="text-lg font-bold text-red-600 mt-2">Amount Due: ₹{selectedLabTest.cost || 0}</p>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-amber-800">
                  <FaExclamationTriangle className="inline mr-1" />
                  Please complete the payment at the billing counter to proceed with sample collection.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentWarningModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPrescription && selectedLabTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaFilePrescription className="text-teal-600" />
                  Lab Test Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPrescription(null);
                    setSelectedLabTest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Prescription Number</p>
                    <p className="font-medium">{selectedPrescription.prescription_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Issue Date</p>
                    <p className="font-medium">{formatDate(selectedPrescription.issue_date)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">
                        {selectedPrescription.patient?.first_name} {selectedPrescription.patient?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Patient ID</p>
                      <p className="font-medium">{selectedPrescription.patient?.patientId}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Test Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Test Name</p>
                      <p className="font-medium">{selectedPrescription.lab_test_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Test Code</p>
                      <p className="font-medium">{selectedPrescription.lab_test_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div>{getStatusBadge(selectedPrescription.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Status</p>
                      <div>{getPaymentBadge(selectedPrescription.is_billed)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fasting Required</p>
                      <p className="font-medium">{selectedPrescription.fasting_required ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedPrescription.cost > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="font-medium text-green-600">₹{selectedPrescription.cost}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Doctor Information</h3>
                  <div>
                    <p className="text-xs text-gray-500">Prescribed By</p>
                    <p className="font-medium">
                      Dr. {selectedPrescription.doctor?.firstName} {selectedPrescription.doctor?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPrescription.doctor?.specialization}</p>
                  </div>
                </div>

                {selectedPrescription.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedPrescription.notes}</p>
                  </div>
                )}

                {selectedPrescription.diagnosis && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-3">Diagnosis</h3>
                    <p className="text-sm text-gray-700">{selectedPrescription.diagnosis}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPrescription(null);
                    setSelectedLabTest(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collect Sample Modal */}
        {showCollectSampleModal && selectedPrescription && selectedLabTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaVial className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold">Collect Sample</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mark sample as collected for {selectedLabTest.lab_test_name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm"><span className="font-medium">Patient:</span> {selectedPrescription.patient?.first_name} {selectedPrescription.patient?.last_name}</p>
                <p className="text-sm"><span className="font-medium">Test:</span> {selectedLabTest.lab_test_name}</p>
                <p className="text-sm"><span className="font-medium">Code:</span> {selectedLabTest.lab_test_code}</p>
                {selectedPrescription.fasting_required && (
                  <p className="text-xs text-amber-600 mt-2">⚠️ Fasting required for this test</p>
                )}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-green-600 font-medium">✓ Payment received</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={updateStatusData.notes}
                  onChange={(e) => setUpdateStatusData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCollectSampleModal(false);
                    setSelectedLabTest(null);
                    setUpdateStatusData({ notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCollectSample}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {showUploadReportModal && selectedPrescription && selectedLabTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUpload className="text-purple-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold">Upload Test Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upload the completed test report for {selectedLabTest.lab_test_name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm"><span className="font-medium">Patient:</span> {selectedPrescription.patient?.first_name} {selectedPrescription.patient?.last_name}</p>
                <p className="text-sm"><span className="font-medium">Test:</span> {selectedLabTest.lab_test_name}</p>
              </div>

              {/* <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report File
                </label>
                <input
                  type="file"
                  onChange={(e) => setReportFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div> */}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={updateStatusData.notes}
                  onChange={(e) => setUpdateStatusData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about the report..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-teal-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadReportModal(false);
                    setSelectedLabTest(null);
                    setReportFile(null);
                    setUploadProgress(0);
                    setUpdateStatusData({ notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus('Completed')}
                  // disabled={!reportFile}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PathologyPrescriptions;