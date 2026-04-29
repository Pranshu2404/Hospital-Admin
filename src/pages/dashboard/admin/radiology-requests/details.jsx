import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaXRay,
  FaArrowLeft,
  FaClock,
  FaCalendarAlt,
  FaUserMd,
  FaUserInjured,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaDownload,
  FaFilePdf,
  FaImage,
  FaEye,
  FaInfoCircle,
  FaNotesMedical,
  FaStethoscope,
  FaTachometerAlt,
  FaBrain,
  FaHeartbeat,
  FaProcedures
} from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const config = {
    'Pending': { color: 'bg-amber-100 text-amber-700', icon: <FaClock className="text-xs" /> },
    'Approved': { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="text-xs" /> },
    'Scheduled': { color: 'bg-blue-100 text-blue-700', icon: <FaCalendarAlt className="text-xs" /> },
    'In Progress': { color: 'bg-indigo-100 text-indigo-700', icon: <FaTachometerAlt className="text-xs" /> },
    'Completed': { color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle className="text-xs" /> },
    'Reported': { color: 'bg-purple-100 text-purple-700', icon: <FaFilePdf className="text-xs" /> },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="text-xs" /> }
  };
  const { color, icon } = config[status] || config.Pending;
  return <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{icon} {status}</span>;
};

const RadiologyRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/radiology/requests/${id}`);
      setRequest(response.data.data);
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!request?.report_url) return;
    setDownloading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/radiology/requests/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${request.requestNumber}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setDownloading(false);
    }
  };

  const viewReport = () => {
    if (request?.report_url) {
      window.open(request.report_url, '_blank');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'X-Ray': <FaProcedures className="text-blue-500 text-2xl" />,
      'CT Scan': <FaBrain className="text-purple-500 text-2xl" />,
      'MRI': <FaBrain className="text-indigo-500 text-2xl" />,
      'Ultrasound': <FaHeartbeat className="text-pink-500 text-2xl" />,
      'ECG': <FaHeartbeat className="text-red-500 text-2xl" />
    };
    return icons[category] || <FaXRay className="text-gray-500 text-2xl" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout sidebarItems={adminSidebar} section="Admin">
        <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div></div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout sidebarItems={adminSidebar} section="Admin">
        <div className="p-6 text-center"><h2 className="text-xl font-bold text-red-600">Request not found</h2></div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        <button onClick={() => navigate('/dashboard/admin/radiology-requests')} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4">
          <FaArrowLeft /> Back to Requests
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {getCategoryIcon(request.category)}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{request.testName}</h1>
                  <p className="text-slate-500">{request.testCode} • {request.category}</p>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="p-6">
            {/* Request Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Request Details</h3>
                <div><label className="text-xs text-slate-400 uppercase">Request Number</label><p className="font-mono text-emerald-600">{request.requestNumber}</p></div>
                <div><label className="text-xs text-slate-400 uppercase">Requested Date</label><p>{formatDate(request.requestedDate)}</p></div>
                <div><label className="text-xs text-slate-400 uppercase">Priority</label><p className={`font-semibold ${request.priority === 'Emergency' ? 'text-red-600' : request.priority === 'Urgent' ? 'text-orange-600' : 'text-green-600'}`}>{request.priority || 'Routine'}</p></div>
                <div><label className="text-xs text-slate-400 uppercase">Source</label><p className="flex items-center gap-2"><span className={`px-2 py-1 text-xs rounded-full ${request.sourceType === 'IPD' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{request.sourceType}</span>{request.admissionId && <span className="text-sm">Admission: {request.admissionId}</span>}</p></div>
                <div><label className="text-xs text-slate-400 uppercase">Cost</label><p className="text-2xl font-bold text-emerald-600">₹{request.cost || 0}</p></div>
                {request.is_billed && <div><label className="text-xs text-slate-400 uppercase">Billing Status</label><p className="text-green-600 font-semibold">Billed</p></div>}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Patient & Doctor</h3>
                <div><label className="text-xs text-slate-400 uppercase">Patient</label><p className="flex items-center gap-2"><FaUserInjured className="text-slate-400" />{request.patientId?.first_name} {request.patientId?.last_name}</p></div>
                <div><label className="text-xs text-slate-400 uppercase">Doctor</label><p className="flex items-center gap-2"><FaUserMd className="text-slate-400" />Dr. {request.doctorId?.firstName} {request.doctorId?.lastName}</p></div>
              </div>
            </div>

            {/* Clinical Information */}
            {(request.clinical_indication || request.clinical_history) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><FaStethoscope /> Clinical Information</h3>
                {request.clinical_indication && <div className="mb-3"><label className="text-xs text-blue-600 uppercase">Clinical Indication</label><p className="text-blue-800">{request.clinical_indication}</p></div>}
                {request.clinical_history && <div><label className="text-xs text-blue-600 uppercase">Clinical History</label><p className="text-blue-800">{request.clinical_history}</p></div>}
              </div>
            )}

            {/* Workflow Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">Workflow Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><FaCalendarAlt className="text-blue-600" /></div><div><div className="font-medium">Requested</div><div className="text-sm text-slate-500">{formatDate(request.requestedDate)}</div></div></div>
                {request.approvedAt && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><FaCheckCircle className="text-green-600" /></div><div><div className="font-medium">Approved</div><div className="text-sm text-slate-500">{formatDate(request.approvedAt)} by {request.approvedBy?.employeeId}</div></div></div>}
                {request.performedAt && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><FaTachometerAlt className="text-indigo-600" /></div><div><div className="font-medium">Performed</div><div className="text-sm text-slate-500">{formatDate(request.performedAt)} by {request.performedBy?.employeeId}</div></div></div>}
                {request.reportedAt && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><FaFilePdf className="text-purple-600" /></div><div><div className="font-medium">Reported</div><div className="text-sm text-slate-500">{formatDate(request.reportedAt)} by {request.reportedBy?.employeeId}</div></div></div>}
              </div>
            </div>

            {/* Findings & Impression */}
            {(request.findings || request.impression) && (
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2"><FaNotesMedical /> Radiological Findings</h3>
                {request.findings && <div className="mb-3"><label className="text-xs text-emerald-600 uppercase">Findings</label><p className="text-emerald-800">{request.findings}</p></div>}
                {request.impression && <div><label className="text-xs text-emerald-600 uppercase">Impression</label><p className="text-emerald-800">{request.impression}</p></div>}
              </div>
            )}

            {/* Report Section */}
            {request.report_url && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">{request.report_url.toLowerCase().endsWith('.pdf') ? <FaFilePdf /> : <FaImage />} Radiology Report</h3>
                <div className="flex gap-3">
                  <button onClick={viewReport} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><FaEye /> View Report</button>
                  <button onClick={downloadReport} disabled={downloading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">{downloading ? 'Downloading...' : <><FaDownload /> Download Report</>}</button>
                </div>
              </div>
            )}

            {/* Notes */}
            {(request.technician_notes || request.radiologist_notes) && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><FaInfoCircle /> Notes</h3>
                {request.technician_notes && <div className="mb-3"><label className="text-xs text-amber-600 uppercase">Technician Notes</label><p className="text-amber-800">{request.technician_notes}</p></div>}
                {request.radiologist_notes && <div><label className="text-xs text-amber-600 uppercase">Radiologist Notes</label><p className="text-amber-800">{request.radiologist_notes}</p></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RadiologyRequestDetails;