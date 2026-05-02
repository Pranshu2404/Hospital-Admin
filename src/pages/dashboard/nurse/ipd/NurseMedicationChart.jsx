import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft, FaPrescriptionBottleAlt, FaCheckCircle, FaTimesCircle,
  FaClock, FaPause, FaUser, FaBed, FaCalendarAlt, FaExclamationTriangle,
  FaSyringe, FaPills, FaStopCircle, FaHistory, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const NurseMedicationChart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [admission, setAdmission] = useState(null);
  const [medications, setMedications] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('Active');
  const [remarkModal, setRemarkModal] = useState(null);
  const [remark, setRemark] = useState('');
  const [expandedMedId, setExpandedMedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [admissionRes, medsRes] = await Promise.all([
        axios.get(`${API_URL}/ipd/admissions/${id}`),
        axios.get(`${API_URL}/ipd/medications/admission/${id}`)
      ]);
      setAdmission(admissionRes.data.admission);
      setMedications(medsRes.data.medications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const administerMedication = async (medId, timingId) => {
    setProcessingId(`${medId}-${timingId}`);
    try {
      await axios.patch(`${API_URL}/ipd/medications/${medId}/administer`, {
        timingId,
        remarks: remark || 'Administered on time'
      });
      toast.success('Medication administered successfully');
      setRemarkModal(null);
      setRemark('');
      fetchData();
    } catch (error) {
      console.error('Error administering medication:', error);
      toast.error(error.response?.data?.error || 'Failed to administer medication');
    } finally {
      setProcessingId(null);
    }
  };

  const skipMedication = async (medId, timingId) => {
    if (!remark.trim()) {
      toast.error('Please provide a reason for skipping');
      return;
    }
    setProcessingId(`${medId}-${timingId}`);
    try {
      await axios.patch(`${API_URL}/ipd/medications/${medId}/skip`, {
        timingId,
        remarks: remark
      });
      toast.success('Medication skipped');
      setRemarkModal(null);
      setRemark('');
      fetchData();
    } catch (error) {
      console.error('Error skipping medication:', error);
      toast.error('Failed to skip medication');
    } finally {
      setProcessingId(null);
    }
  };

  const holdMedication = async (medId, timingId) => {
    if (!remark.trim()) {
      toast.error('Please provide a reason for holding');
      return;
    }
    setProcessingId(`${medId}-${timingId}`);
    try {
      await axios.patch(`${API_URL}/ipd/medications/${medId}/hold`, {
        timingId,
        remarks: remark
      });
      toast.success('Medication held');
      setRemarkModal(null);
      setRemark('');
      fetchData();
    } catch (error) {
      console.error('Error holding medication:', error);
      toast.error('Failed to hold medication');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Completed: 'bg-blue-100 text-blue-700',
      Stopped: 'bg-red-100 text-red-700',
      Requested: 'bg-purple-100 text-purple-700'
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const getTimingStatusStyle = (status) => {
    switch (status) {
      case 'Administered': return 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100';
      case 'Skipped': return 'bg-red-50 border-red-200 ring-1 ring-red-100';
      case 'Held': return 'bg-orange-50 border-orange-200 ring-1 ring-orange-100';
      case 'Missed': return 'bg-gray-100 border-gray-300';
      default: return 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm';
    }
  };

  const getTimingIcon = (status) => {
    switch (status) {
      case 'Administered': return <FaCheckCircle className="text-emerald-500" size={14} />;
      case 'Skipped': return <FaTimesCircle className="text-red-500" size={14} />;
      case 'Held': return <FaPause className="text-orange-500" size={14} />;
      case 'Missed': return <FaClock className="text-gray-400" size={14} />;
      default: return <FaClock className="text-teal-500" size={14} />;
    }
  };

  const getRouteIcon = (route) => {
    if (['Intravenous', 'Intramuscular', 'Subcutaneous'].includes(route)) return <FaSyringe className="text-blue-500" />;
    return <FaPills className="text-purple-500" />;
  };

  const formatTime = (timeStr) => {
    if (timeStr === 'now') return 'STAT';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const filteredMeds = medications.filter(m => filter === 'All' ? true : m.status === filter);

  const stats = {
    active: medications.filter(m => m.status === 'Active').length,
    pending: medications.filter(m => m.status === 'Pending' || m.status === 'Requested').length,
    stopped: medications.filter(m => m.status === 'Stopped').length,
    completed: medications.filter(m => m.status === 'Completed').length
  };

  if (loading) {
    return (
      <Layout sidebarItems={nurseSidebar} section="Nurse">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </Layout>
    );
  }

  const patient = admission?.patientId;

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/nurse/ipd/patients')} className="p-2.5 bg-white shadow-sm rounded-xl hover:bg-slate-50 transition-colors">
            <FaArrowLeft className="text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                <FaPrescriptionBottleAlt className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Medication Chart</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">{patient?.first_name} {patient?.last_name} • Bed {admission?.bedId?.bedNumber}</p>
          </div>
        </div>

        {/* Patient Info & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl"><FaCheckCircle className="text-emerald-500" size={18} /></div>
            <div><p className="text-2xl font-bold text-slate-800">{stats.active}</p><p className="text-xs text-slate-400 font-medium">Active</p></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl"><FaClock className="text-amber-500" size={18} /></div>
            <div><p className="text-2xl font-bold text-slate-800">{stats.pending}</p><p className="text-xs text-slate-400 font-medium">Pending</p></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><FaHistory className="text-blue-500" size={18} /></div>
            <div><p className="text-2xl font-bold text-slate-800">{stats.completed}</p><p className="text-xs text-slate-400 font-medium">Completed</p></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><FaStopCircle className="text-red-500" size={18} /></div>
            <div><p className="text-2xl font-bold text-slate-800">{stats.stopped}</p><p className="text-xs text-slate-400 font-medium">Stopped</p></div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6 flex gap-2 overflow-x-auto">
          {['Active', 'Pending', 'Completed', 'Stopped', 'All'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === tab ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Medications List */}
        {filteredMeds.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <FaPrescriptionBottleAlt className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No {filter !== 'All' ? filter.toLowerCase() : ''} medications found</p>
            <p className="text-slate-300 text-sm mt-1">Medications prescribed during doctor rounds will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeds.map(med => {
              const isExpanded = expandedMedId === med._id;
              const pendingTimings = (med.timing || []).filter(t => t.status === 'Pending');
              const administeredTimings = (med.timing || []).filter(t => t.status === 'Administered');

              return (
                <div key={med._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${med.isHighRisk ? 'border-red-200' : 'border-slate-100'}`}>
                  {/* Medication Header */}
                  <div
                    className={`p-5 cursor-pointer ${med.isHighRisk ? 'bg-red-50/50' : 'bg-slate-50/50'}`}
                    onClick={() => setExpandedMedId(isExpanded ? null : med._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl mt-0.5 ${med.isHighRisk ? 'bg-red-100' : 'bg-teal-50'}`}>
                          {getRouteIcon(med.route)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800 text-lg">{med.medicineName}</h3>
                            {med.isHighRisk && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-semibold flex items-center gap-1">
                                <FaExclamationTriangle size={10} /> High Risk
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {med.dosage} • {med.route} • {med.frequency}
                            {med.duration && ` • ${med.duration} ${med.durationUnit || 'Days'}`}
                          </p>
                          {med.specialInstructions && (
                            <p className="text-xs text-amber-600 mt-1 italic">⚠ {med.specialInstructions}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Prescribed by: Dr. {med.prescribedBy?.firstName} {med.prescribedBy?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(med.status)}
                          <p className="text-xs text-slate-400 mt-1">
                            {pendingTimings.length} pending • {administeredTimings.length} given
                          </p>
                        </div>
                        {isExpanded ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Timing Slots */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Today's Schedule</h4>
                      {(!med.timing || med.timing.length === 0) ? (
                        <p className="text-sm text-slate-400 italic">No timing slots generated. This medication may be SOS/PRN.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {med.timing.map((timing, idx) => (
                            <div key={timing._id || idx} className={`p-3 rounded-xl border transition-all ${getTimingStatusStyle(timing.status)}`}>
                              <div className="flex justify-between items-center mb-2">
                                {getTimingIcon(timing.status)}
                                <span className="text-sm font-bold text-slate-700">{formatTime(timing.time)}</span>
                              </div>

                              {timing.status === 'Pending' && med.status === 'Active' ? (
                                <div className="space-y-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); administerMedication(med._id, timing._id); }}
                                    disabled={!!processingId}
                                    className="w-full py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                                  >
                                    <FaCheckCircle size={10} /> Give
                                  </button>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setRemarkModal({ medId: med._id, timingId: timing._id, action: 'skip' }); }}
                                      disabled={!!processingId}
                                      className="flex-1 py-1 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 font-medium transition-colors"
                                    >
                                      Skip
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setRemarkModal({ medId: med._id, timingId: timing._id, action: 'hold' }); }}
                                      disabled={!!processingId}
                                      className="flex-1 py-1 bg-orange-50 text-orange-600 text-xs rounded-lg hover:bg-orange-100 font-medium transition-colors"
                                    >
                                      Hold
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className={`text-xs font-medium ${
                                    timing.status === 'Administered' ? 'text-emerald-600' :
                                    timing.status === 'Skipped' ? 'text-red-600' :
                                    timing.status === 'Held' ? 'text-orange-600' : 'text-gray-500'
                                  }`}>
                                    {timing.status}
                                  </p>
                                  {timing.administeredAt && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {new Date(timing.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                  {timing.remarks && (
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={timing.remarks}>{timing.remarks}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Remark Modal for Skip/Hold */}
      {remarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {remarkModal.action === 'skip' ? 'Skip Medication' : 'Hold Medication'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Please provide a reason</p>
            </div>
            <div className="p-6">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={remarkModal.action === 'skip' ? 'Reason for skipping...' : 'Reason for holding...'}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                rows="3"
                required
                autoFocus
              />
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={() => { setRemarkModal(null); setRemark(''); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (remarkModal.action === 'skip') skipMedication(remarkModal.medId, remarkModal.timingId);
                  else holdMedication(remarkModal.medId, remarkModal.timingId);
                }}
                disabled={!remark.trim()}
                className={`px-6 py-2 text-white rounded-xl font-medium disabled:opacity-50 ${
                  remarkModal.action === 'skip' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirm {remarkModal.action === 'skip' ? 'Skip' : 'Hold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NurseMedicationChart;