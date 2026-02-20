// pages/dashboard/pathology/reports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaFileAlt, 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaDownload,
  FaPrint,
  FaTrash,
  FaCalendarAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Note: You'll need to create a LabReports model and controller
  // This is a placeholder until those are implemented

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, typeFilter, dateFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // API: GET /lab-reports (you need to create this endpoint)
      // For now, fetch from completed lab tests
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prescriptions/lab-tests/status/Completed`
      );

      if (response.data.success) {
        const completedTests = response.data.labTests || [];
        
        // Filter only tests with report_url
        const reportsWithFiles = completedTests
          .filter(test => test.report_url)
          .map(test => ({
            _id: test._id,
            report_number: `RPT-${test.prescription_number}`,
            patient_name: test.patient ? `${test.patient.first_name} ${test.patient.last_name}` : 'Unknown',
            patient_id: test.patient?.patientId || 'N/A',
            report_type: 'Lab Report',
            test_name: test.lab_test_name,
            date: test.completed_date || test.updatedAt,
            file_url: test.report_url,
            file_type: test.report_url?.split('.').pop() || 'pdf',
            size: 'N/A',
            uploaded_by: test.performed_by || 'System',
            status: 'verified'
          }));

        setReports(reportsWithFiles);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.patient_name?.toLowerCase().includes(term) ||
        r.report_number?.toLowerCase().includes(term) ||
        r.test_name?.toLowerCase().includes(term) ||
        r.report_type?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.report_type === typeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(r => 
        new Date(r.date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredReports(filtered);
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    
    // Note: You'll need to implement DELETE /lab-reports/:id
    setShowDeleteModal(false);
    setSelectedReport(null);
  };

  const handleDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'docx':
      case 'doc': return <FaFileWord className="text-blue-500" />;
      case 'xlsx':
      case 'xls': return <FaFileExcel className="text-green-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'verified': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFileAlt className="text-teal-600" />
              Lab Reports
            </h1>
            <p className="text-gray-500 mt-1">View and download completed test reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Pathology Report">Pathology Report</option>
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
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Found</h3>
            <p className="text-gray-500">No reports match your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                          {report.report_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{report.patient_name}</div>
                        <div className="text-xs text-gray-500">ID: {report.patient_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{report.report_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{report.test_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getFileIcon(report.file_type)}
                          <span className="text-sm text-gray-600">{report.size}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(report.date)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              // Open report viewer
                              window.open(report.file_url, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                            title="View"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(report.file_url)}
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
      </div>
    </Layout>
  );
};

export default LabReports;