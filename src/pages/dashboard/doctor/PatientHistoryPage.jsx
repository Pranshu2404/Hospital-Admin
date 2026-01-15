import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaUser, FaArrowLeft, FaPhone, FaMars, FaVenus,
    FaPrescriptionBottleAlt, FaHistory, FaFileAlt, FaStethoscope,
    FaChevronDown, FaChevronUp, FaCapsules, FaFlask, FaCalendarAlt,
    FaEnvelope, FaMapMarkerAlt, FaAllergies, FaHeartbeat, FaNotesMedical,
    FaWeight, FaThermometerHalf, FaTint, FaMagic, FaTimesCircle, FaFilter, FaTimes
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import { summarizePatientHistory } from '@/utils/geminiService';

const PatientHistoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('appointments');
    const [expandedPrescription, setExpandedPrescription] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    // Summary State
    const [summary, setSummary] = useState('');
    const [summarizing, setSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Patient Details
                let patientData = null;
                try {
                    const pRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients/${id}`);
                    patientData = pRes.data;
                } catch (e) {
                    console.warn("Could not fetch patient directly, trying via appointments...");
                }

                // 2. Fetch Appointments
                const apptsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/patient/${id}`);
                const appts = apptsRes.data.appointments || apptsRes.data || [];
                setAppointments(appts);

                // Fallback for patient data
                if (!patientData && appts.length > 0) {
                    patientData = appts[0].patient_id;
                }
                setPatient(patientData);

                // 3. Fetch Prescriptions
                const rxRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/patient/${id}`);
                setPrescriptions(rxRes.data.prescriptions || rxRes.data || []);

            } catch (err) {
                console.error("Error fetching patient history:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const handleSummarizeHistory = async () => {
        if (!prescriptions || prescriptions.length === 0) {
            return;
        }
        setSummarizing(true);
        setShowSummary(true);
        setSummary('');
        try {
            const patientDetails = {
                name: patient ? `${patient.first_name} ${patient.last_name || ''}` : 'Patient',
                age: calculateAge(patient?.dob),
                gender: patient?.gender || 'Unknown'
            };
            const result = await summarizePatientHistory(prescriptions, patientDetails);
            let cleanResult = result.replace(/\*\*/g, '');
            const lines = cleanResult.split('\n');
            if (lines.length > 0 && lines[0].toLowerCase().includes('patient summary')) {
                cleanResult = lines.slice(1).join('\n').trim();
            } else {
                cleanResult = cleanResult.trim();
            }
            setSummary(cleanResult);
        } catch (error) {
            console.error('Summarization failed:', error);
            setSummary('Failed to generate summary.');
        } finally {
            setSummarizing(false);
        }
    };

    const handleAppointmentClick = (apptId) => {
        setSelectedAppointmentId(apptId);
        setActiveTab('prescriptions');
    };

    const clearFilter = () => {
        setSelectedAppointmentId(null);
    };

    // Filter prescriptions based on selection
    const displayedPrescriptions = selectedAppointmentId
        ? prescriptions.filter(p => p.appointment_id === selectedAppointmentId || p.appointment_id?._id === selectedAppointmentId)
        : prescriptions;


    if (loading) {
        return (
            <Layout sidebarItems={doctorSidebar} section="Doctor">
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading history...</p>
                </div>
            </Layout>
        );
    }

    if (!patient) {
        return (
            <Layout sidebarItems={doctorSidebar} section="Doctor">
                <div className="p-6">
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center">
                        <FaUser className="text-4xl mb-2 opacity-50" />
                        <h3 className="font-bold text-lg">Patient Not Found</h3>
                        <p className="text-sm opacity-80">Could not retrieve patient data.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Attempt to get latest vitals from the most recent appointment
    const latestAppointmentWithVitals = appointments.find(a => a.vitals && (a.vitals.bp || a.vitals.weight || a.vitals.pulse));
    const latestVitals = latestAppointmentWithVitals?.vitals;

    return (
        <Layout sidebarItems={doctorSidebar} section="Doctor">
            <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 font-sans">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard/doctor/patients')}
                    className="flex items-center text-slate-500 hover:text-teal-600 transition-colors mb-6 font-medium text-sm group w-fit"
                >
                    <div className="p-1.5 rounded-full bg-white border border-slate-200 group-hover:border-teal-200 group-hover:bg-teal-50 mr-2 transition-all shadow-sm">
                        <FaArrowLeft className="text-xs" />
                    </div>
                    Back to Patient List
                </button>

                {/* Main Grid Layout to match AppointmentDetails */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Left Column: Patient & Vitals Info */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Patient Card - Matches AppointmentDetails style */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
                                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                                    <FaUser />
                                </div>
                                <h3 className="font-semibold text-slate-800 text-md">Patient</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                                    <p className="text-slate-700 font-medium text-sm">{patient.first_name} {patient.last_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Gender</label>
                                        <p className="text-slate-700 text-sm">{patient.gender || '--'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Age</label>
                                        <p className="text-slate-700 text-sm">{calculateAge(patient.dob)} yrs</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood</label>
                                        <p className="text-slate-700 text-sm">{patient.blood_group || '--'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</label>
                                        <p className="text-slate-700 text-sm truncate">{patient.phone || '--'}</p>
                                    </div>
                                </div>

                                {/* Extra details if available */}
                                {patient.allergies && patient.allergies.length > 0 && (
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Allergies</label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {patient.allergies.map((alg, i) => (
                                                <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">{alg}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Vitals Card */}
                        {latestVitals && (
                            <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
                                <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                                        <FaHeartbeat />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-md">Recent Vitals</h3>
                                    <span className="text-xs text-slate-500 ml-auto font-normal">
                                        {formatDate(latestAppointmentWithVitals.appointment_date)}
                                    </span>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">BP</span>
                                        <span className="text-md font-bold text-slate-800">{latestVitals.blood_pressure || latestVitals.bp || '--'}</span>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Pulse</span>
                                        <span className="text-md font-bold text-slate-800">{latestVitals.pulse_rate || latestVitals.pulse || '--'} <span className="text-[10px] text-slate-400">bpm</span></span>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Weight</span>
                                        <span className="text-md font-bold text-slate-800">{latestVitals.weight || '--'} <span className="text-[10px] text-slate-400">kg</span></span>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="block text-xs text-slate-500 uppercase font-bold mb-1">SPO2</span>
                                        <span className="text-md font-bold text-slate-800">{latestVitals.spO2 || latestVitals.spo2 || '--'} <span className="text-[10px] text-slate-400">%</span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Summary Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 flex justify-between text-center divide-x divide-slate-100">
                                <div className="flex-1 px-2">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Visits</div>
                                    <div className="text-xl font-bold text-teal-600">{appointments.length}</div>
                                </div>
                                <div className="flex-1 px-2">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Prescriptions</div>
                                    <div className="text-xl font-bold text-violet-600">{prescriptions.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Tabs */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Tabs Container */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                            {/* New Pill Style Tabs Header */}
                            <div className="p-4 border-b border-slate-100 bg-white">
                                <div className="bg-slate-100 p-1 rounded-xl flex items-center font-medium text-sm">
                                    <button
                                        onClick={() => { setActiveTab('appointments'); setSelectedAppointmentId(null); }}
                                        className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'appointments'
                                                ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/50 font-bold'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                            }`}
                                    >
                                        <FaHistory className={activeTab === 'appointments' ? 'text-teal-600' : 'opacity-70'} />
                                        Past Appointments
                                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'appointments' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {appointments.length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('prescriptions')}
                                        className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'prescriptions'
                                                ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/50 font-bold'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                            }`}
                                    >
                                        <FaPrescriptionBottleAlt className={activeTab === 'prescriptions' ? 'text-violet-600' : 'opacity-70'} />
                                        Past Prescriptions
                                        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'prescriptions' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {prescriptions.length}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Content */}
                            <div className="p-6 bg-slate-50/30 flex-grow">
                                {activeTab === 'appointments' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Click an appointment to view its prescription</h3>
                                        </div>

                                        {appointments.length > 0 ? AppointmentsList({
                                            appointments: appointments,
                                            onItemClick: handleAppointmentClick,
                                            formatDate: formatDate
                                        }) : (
                                            <div className="text-center py-20 text-slate-400">
                                                <p>No appointment history found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <div className="space-y-4">

                                        {/* Filter Banner */}
                                        {selectedAppointmentId && (
                                            <div className="mb-6 bg-teal-50 border border-teal-200 rounded-lg p-3 flex justify-between items-center animate-fade-in-down">
                                                <div className="flex items-center text-teal-800 text-sm">
                                                    <FaFilter className="mr-2" />
                                                    <span>Showing prescription for selected appointment.</span>
                                                </div>
                                                <button
                                                    onClick={clearFilter}
                                                    className="text-xs font-bold bg-white text-teal-700 px-3 py-1.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center"
                                                >
                                                    <FaTimes className="mr-1" /> View All
                                                </button>
                                            </div>
                                        )}

                                        {/* Gemini Summary Button - Only show when viewing all */}
                                        {/* {!selectedAppointmentId && prescriptions.length > 0 && (
                                            <div className="mb-6">
                                                {!showSummary ? (
                                                    <button
                                                        onClick={handleSummarizeHistory}
                                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        <FaMagic className="group-hover:animate-pulse" /> Summarize Patient History
                                                    </button>
                                                ) : (
                                                    <div className="bg-white rounded-xl border border-violet-100 overflow-hidden shadow-lg animate-fade-in ring-1 ring-violet-50">
                                                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-white/20 rounded-lg">
                                                                    <FaMagic className="text-white" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg leading-tight">Clinical Summary</h3>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowSummary(false)}
                                                                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                                                            >
                                                                <FaTimesCircle size={20} />
                                                            </button>
                                                        </div>
                                                        <div className="p-6 bg-gradient-to-b from-violet-50/50 to-white">
                                                            {summarizing ? (
                                                                <div className="flex flex-col items-center justify-center py-8">
                                                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-100 border-t-violet-600 mb-4"></div>
                                                                    <p className="text-violet-800 font-semibold text-sm tracking-wide animate-pulse">GENERATING CLINICAL INSIGHTS...</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3 prose prose-sm max-w-none text-slate-700">
                                                                    <pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )} */}

                                        {displayedPrescriptions.length > 0 ? displayedPrescriptions.map((rx) => (
                                            <div key={rx._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                                {/* Prescription Header */}
                                                <div className="bg-slate-50 px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                                                    onClick={() => setExpandedPrescription(expandedPrescription === rx._id ? null : rx._id)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                                            <FaFileAlt />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800">{formatDate(rx.issue_date)}</div>
                                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{rx.prescription_number || 'No ID'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rx.status === 'Active' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                                                            }`}>{rx.status}</span>
                                                        {expandedPrescription === rx._id ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {expandedPrescription === rx._id && (
                                                    <div className="p-5 border-t border-slate-200 bg-white animate-fade-in-down">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            {rx.diagnosis && (
                                                                <div className="bg-white p-3 border border-slate-100 rounded-lg">
                                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosis</h4>
                                                                    <p className="text-sm font-medium text-slate-700">{rx.diagnosis}</p>
                                                                </div>
                                                            )}
                                                            {rx.investigation && (
                                                                <div className="bg-white p-3 border border-slate-100 rounded-lg">
                                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Investigation</h4>
                                                                    <p className="text-sm font-medium text-slate-700">{rx.investigation}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {rx.items && rx.items.length > 0 && (
                                                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                    <FaCapsules /> Medicines
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    {rx.items.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                                                                            <div className="font-medium text-slate-700">{item.medicine_name}</div>
                                                                            <div className="text-slate-500 text-xs">
                                                                                {item.dosage}mg • {item.frequency} • {item.duration}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(rx.notes || rx.advice) && (
                                                            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                                                                <span className="font-bold mr-1">Note:</span> {rx.notes} {rx.advice}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 text-slate-400">
                                                <p>{selectedAppointmentId ? "No prescription found for this appointment." : "No prescriptions found."}</p>
                                                {selectedAppointmentId && (
                                                    <button
                                                        onClick={clearFilter}
                                                        className="mt-2 text-teal-600 font-medium hover:underline"
                                                    >
                                                        View All
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Helper component for Appointments list to keep main clean
const AppointmentsList = ({ appointments, onItemClick, formatDate }) => {
    return (
        <>
            {appointments.map((appt) => (
                <div
                    key={appt._id}
                    onClick={() => onItemClick(appt._id)}
                    className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:ring-1 hover:ring-teal-400 hover:shadow-md transition-all cursor-pointer relative"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                                <FaCalendarAlt size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-base">
                                    {formatDate(appt.appointment_date)}
                                </div>
                                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{appt.time_slot}</span>
                                    <span>•</span>
                                    <span>{appt.type}</span>
                                </div>
                                {appt.diagnosis && (
                                    <div className="mt-3 flex items-start gap-2">
                                        <FaStethoscope className="text-teal-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-slate-700"><span className="font-semibold">Diagnosis:</span> {appt.diagnosis}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            {appt.status}
                        </span>
                    </div>

                    <div className="absolute top-3/4 right-6 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded border border-teal-100">View Rx &rarr;</span>
                    </div>

                    {/* Inline Vitals for History (Commented out as per previous preference, or keep if needed) */}
                    {/* {appt.vitals && (...)} */}
                </div>
            ))}
        </>
    )
}

export default PatientHistoryPage;
