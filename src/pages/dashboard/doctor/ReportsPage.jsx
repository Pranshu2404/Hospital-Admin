import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilePdf, FaSearch, FaDownload, FaEye, FaFlask } from 'react-icons/fa';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Assuming your route is '/labreports'. Change if yours is different.
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labreports`);
        setReports(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load laboratory reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter logic for search
  const filteredReports = reports.filter(report => {
    const patientName = report.patient_id 
      ? `${report.patient_id.first_name} ${report.patient_id.last_name}`.toLowerCase() 
      : '';
    const reportType = report.report_type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return patientName.includes(search) || reportType.includes(search);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading lab reports...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFlask className="text-teal-600" /> Patient Lab Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">View and download medical test results</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by patient or test type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <FaFilePdf size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {report.report_type}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-700">Patient:</span> {report.patient_id?.first_name || 'Unknown'} {report.patient_id?.last_name || ''}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Date: {formatDate(report.report_date)}</span>
                        {report.doctor_id && (
                          <span>• Ref: Dr. {report.doctor_id.user_id?.name || 'Unknown'}</span>
                        )}
                      </div>
                      {report.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic max-w-md truncate">
                          "{report.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    {report.file_url ? (
                      <>
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-teal-600 transition-all text-sm font-medium shadow-sm"
                        >
                          <FaEye /> View
                        </a>
                        <a
                          href={report.file_url}
                          download
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm font-medium shadow-sm"
                        >
                          <FaDownload /> Download
                        </a>
                      </>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                        File Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFilePdf className="text-gray-300 text-2xl" />
              </div>
              <h3 className="text-gray-800 font-medium">No reports found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ReportsPage;