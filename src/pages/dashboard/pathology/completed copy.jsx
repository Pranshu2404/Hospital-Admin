// pages/dashboard/pathology/completed.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaCheckCircle, 
  FaSearch, 
  FaEye, 
  FaDownload,
  FaPrint,
  FaFilePdf,
  FaFileAlt,
  FaCalendarAlt,
  FaUserMd,
  FaFlask,
  FaTimes
} from 'react-icons/fa';

const CompletedTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, dateFilter]);

  const fetchCompletedTests = async () => {
    setLoading(true);
    try {
      // API: GET /prescriptions/lab-tests/status/Completed
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Completed`
      );

      if (response.data.success) {
        const completedTests = response.data.labTests || [];
        
        // Transform data for display
        const formattedTests = completedTests.map(test => ({
          _id: test._id,
          request_id: test.prescription_number,
          patient_name: test.patient ? `${test.patient.first_name} ${test.patient.last_name}` : 'Unknown',
          patient_age: test.patient?.age || 'N/A',
          patient_gender: test.patient?.gender || 'N/A',
          test_name: test.lab_test_name,
          test_code: test.lab_test_code,
          category: test.category || 'General',
          completed_at: test.completed_date || test.updatedAt,
          completed_by: test.performed_by ? 'Lab Technician' : 'System',
          report_url: test.report_url,
          result: test.notes?.includes('abnormal') ? 'Abnormal' : 'Normal',
          notes: test.notes
        }));

        setTests(formattedTests);
      }
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    } finally {
      setLoading(false);
    }
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

    if (dateFilter) {
      filtered = filtered.filter(t => 
        new Date(t.completed_at).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredTests(filtered);
  };

  const handleDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No report file available');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getResultBadge = (result) => {
    const colors = {
      'Normal': 'bg-green-100 text-green-800',
      'Abnormal': 'bg-red-100 text-red-800',
      'Critical': 'bg-orange-100 text-orange-800',
      'Inconclusive': 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[result] || 'bg-gray-100 text-gray-800'}`}>
        {result}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-800">Completed Tests</h1>
          <p className="text-gray-500 mt-1">View and manage completed laboratory tests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredTests.length} of {tests.length} tests
            </div>
          </div>
        </div>

        {/* Tests Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaCheckCircle className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Completed Tests Found</h3>
            <p className="text-gray-500">No tests match your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                          {test.request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{test.patient_name}</div>
                        <div className="text-xs text-gray-500">{test.patient_age} yrs, {test.patient_gender}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{test.test_name}</div>
                        <div className="text-xs text-gray-500">{test.test_code} • {test.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{test.completed_by}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getResultBadge(test.result)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(test.completed_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTest(test);
                              setShowReportModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                            title="View Report"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(test.report_url)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Download"
                          >
                            <FaDownload size={16} />
                          </button>
                          <button
                            onClick={handlePrint}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Print"
                          >
                            <FaPrint size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && selectedTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Test Report</h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedTest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Request ID</p>
                    <p className="font-medium">{selectedTest.request_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed Date</p>
                    <p className="font-medium">{formatDate(selectedTest.completed_at)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  <p className="font-medium">{selectedTest.patient_name}</p>
                  <p className="text-sm text-gray-600">{selectedTest.patient_age} years, {selectedTest.patient_gender}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Test Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Test Name</p>
                      <p className="font-medium">{selectedTest.test_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Test Code</p>
                      <p className="font-medium">{selectedTest.test_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium">{selectedTest.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Result</p>
                      <div>{getResultBadge(selectedTest.result)}</div>
                    </div>
                  </div>
                </div>

                {selectedTest.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedTest.notes}</p>
                  </div>
                )}

                {selectedTest.report_url && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-3">Report File</h3>
                    <div className="flex gap-3">
                      <a
                        href={selectedTest.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                      >
                        <FaDownload /> Download Report
                      </a>
                      <button
                        onClick={handlePrint}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaPrint /> Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompletedTests;