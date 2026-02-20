// pages/dashboard/pathology/in-progress.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaMicroscope, 
  FaSearch, 
  FaPlay, 
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFlask,
  FaUserMd,
  FaTimes,
  FaSave
} from 'react-icons/fa';

const InProgressTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const pathologyStaffId = localStorage.getItem('pathologyStaffId');

  useEffect(() => {
    fetchInProgressTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm]);

  const fetchInProgressTests = async () => {
    setLoading(true);
    try {
      // API: GET /prescriptions/lab-tests/status/Processing
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Processing`
      );

      if (response.data.success) {
        const processingTests = response.data.labTests || [];
        
        // API: GET /prescriptions/lab-tests/status/Sample%20Collected
        const collectedResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Sample%20Collected`
        );

        const allTests = [
          ...processingTests,
          ...(collectedResponse.data.labTests || [])
        ];

        // Transform data for display
        const formattedTests = allTests.map(test => ({
          _id: test._id,
          prescription_id: test.prescription_id,
          request_id: test.prescription_number,
          patient_name: test.patient ? `${test.patient.first_name} ${test.patient.last_name}` : 'Unknown',
          patient_age: test.patient?.age || 'N/A',
          patient_gender: test.patient?.gender || 'N/A',
          test_name: test.lab_test_name,
          test_code: test.lab_test_code,
          category: test.category || 'General',
          status: test.status,
          started_at: test.sample_collected_at || test.updatedAt,
          estimated_completion: calculateEstimatedCompletion(test.sample_collected_at, test.turnaround_time),
          technician: 'Current User',
          notes: test.notes
        }));

        setTests(formattedTests);
      }
    } catch (error) {
      console.error('Error fetching in-progress tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCompletion = (startTime, turnaroundHours = 24) => {
    if (!startTime) return new Date(Date.now() + 2 * 60 * 60 * 1000); // Default 2 hours
    const start = new Date(startTime);
    return new Date(start.getTime() + (turnaroundHours * 60 * 60 * 1000));
  };

  const filterTests = () => {
    let filtered = [...tests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.patient_name?.toLowerCase().includes(term) ||
        t.test_name?.toLowerCase().includes(term) ||
        t.test_code?.toLowerCase().includes(term) ||
        t.request_id?.toLowerCase().includes(term)
      );
    }

    setFilteredTests(filtered);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTest) return;

    setUpdating(true);
    try {
      // API: PUT /prescriptions/:prescription_id/lab-tests/:lab_test_id/status
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/${selectedTest.prescription_id}/lab-tests/${selectedTest._id}/status`,
        {
          status: newStatus,
          notes: updateNotes || selectedTest.notes,
          performed_by: pathologyStaffId,
          ...(newStatus === 'Completed' && { completed_date: new Date() })
        }
      );

      if (response.data.success) {
        await fetchInProgressTests();
        setShowUpdateModal(false);
        setSelectedTest(null);
        setUpdateNotes('');
      }
    } catch (error) {
      console.error('Error updating test status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateProgress = (started, estimated) => {
    const start = new Date(started).getTime();
    const end = new Date(estimated).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getTimeRemaining = (estimated) => {
    const end = new Date(estimated).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">In Progress Tests</h1>
          <p className="text-gray-500 mt-1">Tests currently being processed</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaMicroscope className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tests In Progress</h3>
            <p className="text-gray-500">All tests are completed or pending</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTests.map((test) => {
              const progress = calculateProgress(test.started_at, test.estimated_completion);
              const timeRemaining = getTimeRemaining(test.estimated_completion);
              const isOverdue = progress >= 100;
              
              return (
                <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {test.request_id}
                    </span>
                    <span className="text-xs text-gray-500">
                      Started: {formatDate(test.started_at)}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{test.patient_name}</h3>
                        <p className="text-sm text-gray-500">{test.patient_age} yrs, {test.patient_gender}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{test.test_name}</p>
                        <p className="text-xs text-gray-500">{test.test_code} • {test.category}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-teal-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress >= 100 ? 'bg-green-500' : 'bg-teal-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <FaClock className={`${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                      <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
                        {timeRemaining}
                      </span>
                    </div>

                    {/* Technician */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <FaUserMd className="text-gray-400" />
                      <span>Technician: {test.technician}</span>
                    </div>

                    {/* Notes */}
                    {test.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                        <span className="font-medium">Notes:</span> {test.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {test.status === 'Sample Collected' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setShowUpdateModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                        >
                          <FaPlay size={14} /> Start Processing
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus('Completed')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle size={14} /> Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InProgressTests;