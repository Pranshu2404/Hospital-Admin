import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, FaCalendarAlt, FaBed, FaStethoscope, FaNotesMedical,
  FaHeartbeat, FaPrescriptionBottleAlt, FaFlask, FaProcedures,
  FaMoneyBillWave, FaFileAlt, FaHistory, FaArrowLeft, FaPlus,
  FaCheckCircle, FaTimesCircle, FaPrint, FaDownload, FaHospitalUser,
  FaPhone, FaVenusMars, FaIdCard
} from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const IPDPatientFile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [nursingNotes, setNursingNotes] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [charges, setCharges] = useState([]);
  const [dischargeSummary, setDischargeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions/${id}`);
      setAdmission(response.data.admission);
      setRounds(response.data.rounds || []);
      setNursingNotes(response.data.nursingNotes || []);
      setVitals(response.data.vitals || []);
      setCharges(response.data.charges || []);
      setDischargeSummary(response.data.dischargeSummary || null);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const initiateDischarge = async () => {
    try {
      await axios.post(`${API_URL}/ipd/discharge/${id}/initiate`);
      toast.success('Discharge initiated successfully');
      fetchPatientData();
    } catch (error) {
      console.error('Error initiating discharge:', error);
      toast.error(error.response?.data?.error || 'Failed to initiate discharge');
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading patient data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!admission) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <FaHospitalUser className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Admission not found</p>
            <button 
              onClick={() => navigate('/dashboard/staff/ipd/admissions')}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              ← Back to Admissions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const patient = admission.patientId;
  const doctor = admission.primaryDoctorId;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'vitals', label: 'Vitals', icon: FaHeartbeat },
    { id: 'rounds', label: 'Doctor Rounds', icon: FaStethoscope },
    { id: 'nursing', label: 'Nursing Notes', icon: FaNotesMedical },
    { id: 'billing', label: 'Billing', icon: FaMoneyBillWave },
    { id: 'discharge', label: 'Discharge Summary', icon: FaFileAlt },
  ];

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/staff/ipd/admissions')} 
              className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-teal-600"
            >
              <FaArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold shadow-sm">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{patient?.first_name} {patient?.last_name}</h1>
                <p className="text-slate-500 text-sm">Admission #{admission.admissionNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {admission.status !== 'Discharged' && admission.status !== 'Billing Pending' && admission.status !== 'Ready for Discharge' && (
              <button
                onClick={initiateDischarge}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 shadow-sm font-medium"
              >
                <FaFileAlt size={14} /> Initiate Discharge
              </button>
            )}
            {admission.status === 'Ready for Discharge' && (
              <Link 
                to={`/dashboard/staff/ipd/discharge/${admission._id}`} 
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm font-medium"
              >
                <FaCheckCircle size={14} /> Process Discharge
              </Link>
            )}
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all flex items-center gap-2 font-medium"
            >
              <FaPrint size={14} /> Print
            </button>
          </div>
        </div>

        {/* Patient Info Cards - matching StaffDashboard style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaIdCard className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Patient ID</p>
                <p className="font-bold text-slate-800">{patient?.patientId || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaVenusMars className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Age / Gender</p>
                <p className="font-bold text-slate-800">{patient?.age || 'N/A'} yrs / {patient?.gender || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaPhone className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Phone</p>
                <p className="font-bold text-slate-800">{patient?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaCalendarAlt className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Admission Date</p>
                <p className="font-bold text-slate-800">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - matching StaffDashboard tab style */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100">
            <nav className="flex space-x-1 px-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive 
                        ? 'border-b-2 border-teal-600 text-teal-600' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaHospitalUser className="text-teal-500" size={16} /> Admission Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Admission Type:</span>
                        <span className="font-medium text-slate-700">{admission.admissionType}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-700">{admission.departmentId?.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Primary Doctor:</span>
                        <span className="font-medium text-slate-700">Dr. {doctor?.firstName} {doctor?.lastName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Bed:</span>
                        <span className="font-medium text-slate-700">{admission.bedId?.bedNumber} ({admission.bedId?.bedType})</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-500">Payment Type:</span>
                        <span className="font-medium text-slate-700">{admission.paymentType}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500">Advance Amount:</span>
                        <span className="font-bold text-emerald-600">₹{admission.advanceAmount?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaNotesMedical className="text-teal-500" size={16} /> Clinical Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-500">Provisional Diagnosis:</span>
                        <p className="mt-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {admission.provisionalDiagnosis || 'Not recorded'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Chief Complaints:</span>
                        <p className="mt-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {admission.chiefComplaints || 'Not recorded'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {admission.attendant?.name && (
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaUser className="text-teal-500" size={16} /> Attendant Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-xs uppercase">Name</span>
                        <p className="font-medium text-slate-700">{admission.attendant.name}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-xs uppercase">Relation</span>
                        <p className="font-medium text-slate-700">{admission.attendant.relation}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-xs uppercase">Mobile</span>
                        <p className="font-medium text-slate-700">{admission.attendant.mobile}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-xs uppercase">Address</span>
                        <p className="font-medium text-slate-700">{admission.attendant.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-slate-800">Vitals Records</h3>
                  <Link 
                    to={`/dashboard/staff/ipd/patient/${admission._id}/vitals/add`} 
                    className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Vitals
                  </Link>
                </div>
                {vitals.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <FaHeartbeat className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">No vitals recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitals.map((v, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-slate-700">{format(new Date(v.recordedAt), 'dd MMM yyyy, hh:mm a')}</span>
                          <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-full">By: {v.recordedBy?.first_name} {v.recordedBy?.last_name}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">BP</p>
                            <p className="font-semibold text-slate-700">{v.bloodPressureString || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Pulse</p>
                            <p className="font-semibold text-slate-700">{v.pulse || '-'} bpm</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Temperature</p>
                            <p className="font-semibold text-slate-700">{v.temperature || '-'}°{v.temperatureUnit}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">SPO2</p>
                            <p className="font-semibold text-slate-700">{v.spo2 || '-'}%</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Respiratory Rate</p>
                            <p className="font-semibold text-slate-700">{v.respiratoryRate || '-'}/min</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Blood Sugar</p>
                            <p className="font-semibold text-slate-700">{v.bloodSugar || '-'} mg/dL</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Weight</p>
                            <p className="font-semibold text-slate-700">{v.weight || '-'} kg</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl text-center">
                            <p className="text-xs text-slate-400">Pain Score</p>
                            <p className="font-semibold text-slate-700">{v.painScore || '-'}/10</p>
                          </div>
                        </div>
                        {v.remarks && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-400">Remarks</p>
                            <p className="text-sm text-slate-600">{v.remarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Rounds Tab */}
            {activeTab === 'rounds' && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-slate-800">Doctor Round Notes</h3>
                  <Link 
                    to={`/dashboard/staff/ipd/patient/${admission._id}/rounds/add`} 
                    className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Round
                  </Link>
                </div>
                {rounds.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <FaStethoscope className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">No doctor rounds recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rounds.map((round, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-slate-700">{format(new Date(round.roundDateTime), 'dd MMM yyyy, hh:mm a')}</span>
                          <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-full">Dr. {round.doctorId?.firstName} {round.doctorId?.lastName}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs text-slate-400">Condition</p>
                            <p className="font-medium text-slate-700">{round.patientCondition || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs text-slate-400">Complaints</p>
                            <p className="font-medium text-slate-700">{round.complaints || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl md:col-span-2">
                            <p className="text-xs text-slate-400">Examination Findings</p>
                            <p className="font-medium text-slate-700">{round.examinationFindings || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs text-slate-400">Diagnosis</p>
                            <p className="font-medium text-slate-700">{round.diagnosis || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs text-slate-400">Treatment Plan</p>
                            <p className="font-medium text-slate-700">{round.treatmentPlan || '-'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl md:col-span-2">
                            <p className="text-xs text-slate-400">Advice</p>
                            <p className="font-medium text-slate-700">{round.advice || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-slate-800">Running Bill</h3>
                  <Link 
                    to={`/dashboard/staff/ipd/patient/${admission._id}/billing`} 
                    className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1"
                  >
                    View Full Bill →
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 mb-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Total Bill</p>
                      <p className="text-xl font-bold text-slate-800">₹{(admission.totalBillAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid Amount</p>
                      <p className="text-xl font-bold text-emerald-600">₹{(admission.paidAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Due Amount</p>
                      <p className={`text-xl font-bold ${admission.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{(admission.dueAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Advance</p>
                      <p className="text-xl font-bold text-teal-600">₹{(admission.advanceAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.slice(0, 5).map((charge, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(charge.chargeDate), 'dd MMM')}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{charge.description}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-slate-700">₹{charge.netAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                      {charges.length > 5 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-center text-sm text-slate-400">
                            + {charges.length - 5} more items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discharge Tab */}
            {activeTab === 'discharge' && (
              <div>
                {dischargeSummary ? (
                  <div className="space-y-5">
                    <div className="flex justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dischargeSummary.status === 'Finalized' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {dischargeSummary.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <label className="text-xs text-slate-400 uppercase">Final Diagnosis</label>
                        <p className="font-medium text-slate-700 mt-1">{dischargeSummary.finalDiagnosis || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <label className="text-xs text-slate-400 uppercase">Condition on Discharge</label>
                        <p className="font-medium text-slate-700 mt-1">{dischargeSummary.conditionOnDischarge || '-'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs text-slate-400 uppercase">Treatment Given</label>
                      <p className="text-slate-700 mt-1">{dischargeSummary.treatmentGiven || '-'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs text-slate-400 uppercase">Follow-up Advice</label>
                      <p className="text-slate-700 mt-1">{dischargeSummary.followUpAdvice || '-'}</p>
                    </div>
                    {dischargeSummary.dischargeMedications?.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <label className="text-xs text-slate-400 uppercase">Discharge Medications</label>
                        <ul className="mt-2 space-y-1">
                          {dischargeSummary.dischargeMedications.map((m, i) => (
                            <li key={i} className="text-sm text-slate-700">• {m.medicineName} - {m.dosage} ({m.frequency})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <FaFileAlt className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">No discharge summary prepared yet</p>
                    <Link 
                      to={`/dashboard/staff/ipd/patient/${admission._id}/discharge-summary`} 
                      className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Create Discharge Summary →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IPDPatientFile;