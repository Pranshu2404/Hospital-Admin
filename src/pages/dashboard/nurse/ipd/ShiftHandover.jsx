import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, FaUserInjured, FaHeartbeat, FaPrescriptionBottleAlt,
  FaNotesMedical, FaExclamationTriangle, FaClock, FaUserMd,
  FaBed, FaArrowRight, FaSave, FaPlus, FaCheckCircle
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const ShiftHandover = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState([]);
  const [handoverData, setHandoverData] = useState({});
  const [currentShift, setCurrentShift] = useState('Morning');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isHandoverComplete, setIsHandoverComplete] = useState(false);

  useEffect(() => {
    fetchData();
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 14) setCurrentShift('Morning');
    else if (currentHour >= 14 && currentHour < 22) setCurrentShift('Evening');
    else setCurrentShift('Night');
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active patients
      const patientsRes = await axios.get(`${API_URL}/ipd/admissions`, {
        params: { status: 'Admitted,Under Treatment' }
      });
      const patientList = patientsRes.data.admissions || [];
      setPatients(patientList);
      
      // Initialize handover data for each patient
      const initialData = {};
      patientList.forEach(patient => {
        initialData[patient._id] = {
          status: 'Stable',
          pendingTasks: '',
          alerts: '',
          medicationsGiven: true,
          vitalsRecorded: false,
          notes: ''
        };
      });
      setHandoverData(initialData);

      // Load existing handover if any
      const existingHandover = localStorage.getItem(`handover_${format(new Date(), 'yyyy-MM-dd')}_${currentShift}`);
      if (existingHandover) {
        const parsed = JSON.parse(existingHandover);
        setHandoverData(parsed.handoverData || initialData);
        setHandoverNotes(parsed.handoverNotes || '');
        setIsHandoverComplete(parsed.completed || false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const updatePatientHandover = (patientId, field, value) => {
    setHandoverData(prev => ({
      ...prev,
      [patientId]: { ...prev[patientId], [field]: value }
    }));
  };

  const addPendingTask = (task) => {
    if (task.trim()) {
      setPendingTasks(prev => [...prev, { id: Date.now(), text: task, completed: false }]);
    }
  };

  const togglePendingTask = (taskId) => {
    setPendingTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const removePendingTask = (taskId) => {
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const completeHandover = async () => {
    if (!window.confirm('Complete shift handover? This will save the handover report for the next shift.')) return;
    
    setSaving(true);
    try {
      const handoverReport = {
        shift: currentShift,
        handoverDate: new Date(),
        handoverData,
        handoverNotes,
        pendingTasks,
        completedBy: 'Current Nurse',
        completedAt: new Date()
      };
      
      // Save to localStorage (in real app, save to backend)
      localStorage.setItem(`handover_${format(new Date(), 'yyyy-MM-dd')}_${currentShift}`, JSON.stringify({
        ...handoverReport,
        completed: true
      }));
      
      setIsHandoverComplete(true);
      toast.success('Shift handover completed successfully!');
    } catch (error) {
      console.error('Error completing handover:', error);
      toast.error('Failed to complete handover');
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = () => {
    localStorage.setItem(`handover_${format(new Date(), 'yyyy-MM-dd')}_${currentShift}`, JSON.stringify({
      handoverData,
      handoverNotes,
      pendingTasks,
      completed: false
    }));
    toast.success('Handover draft saved');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Stable': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const nextShift = currentShift === 'Morning' ? 'Evening' : currentShift === 'Evening' ? 'Night' : 'Morning';

  if (loading) {
    return (
      <Layout sidebarItems={nurseSidebar} section="Nurse">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaCalendarAlt className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Shift Handover</h1>
            </div>
            <p className="text-slate-500 text-sm">
              {currentShift} Shift → {nextShift} Shift • {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={saveDraft} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all font-medium">Save Draft</button>
            <button onClick={completeHandover} disabled={saving || isHandoverComplete} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm font-medium disabled:opacity-70">
              {saving ? 'Processing...' : <><FaCheckCircle /> Complete Handover</>}
            </button>
          </div>
        </div>

        {/* Handover Status Banner */}
        {isHandoverComplete && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <FaCheckCircle className="text-emerald-600" size={20} />
            <p className="text-emerald-700">Handover completed for {currentShift} shift. The report has been sent to the {nextShift} shift nurse.</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-teal-600">{patients.length}</p>
            <p className="text-xs text-slate-500 font-medium">Active Patients</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{patients.filter(p => p.status === 'Critical').length}</p>
            <p className="text-xs text-slate-500 font-medium">Critical Patients</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingTasks.length}</p>
            <p className="text-xs text-slate-500 font-medium">Pending Tasks</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-purple-600">{Object.values(handoverData).filter(d => d.vitalsRecorded).length}</p>
            <p className="text-xs text-slate-500 font-medium">Vitals Recorded</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Handover Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-slate-800 mb-3">Patient Handover Details</h2>
            {patients.map((patient) => {
              const handover = handoverData[patient._id] || {};
              return (
                <div key={patient._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800">{patient.patientId?.first_name} {patient.patientId?.last_name}</h3>
                        <p className="text-xs text-slate-400">Bed {patient.bedId?.bedNumber} | Dr. {patient.primaryDoctorId?.firstName}</p>
                      </div>
                      <select
                        value={handover.status || 'Stable'}
                        onChange={(e) => updatePatientHandover(patient._id, 'status', e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(handover.status)} border-0 focus:ring-1`}
                      >
                        <option value="Stable">Stable</option>
                        <option value="Improving">Improving</option>
                        <option value="Critical">Critical</option>
                        <option value="Deteriorating">Deteriorating</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Pending Tasks / Instructions</label>
                      <textarea
                        value={handover.pendingTasks || ''}
                        onChange={(e) => updatePatientHandover(patient._id, 'pendingTasks', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        rows="2"
                        placeholder="Tasks for next shift..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Alerts / Special Notes</label>
                      <textarea
                        value={handover.alerts || ''}
                        onChange={(e) => updatePatientHandover(patient._id, 'alerts', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        rows="2"
                        placeholder="Critical alerts, allergies, special care..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={handover.medicationsGiven || false}
                          onChange={(e) => updatePatientHandover(patient._id, 'medicationsGiven', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-slate-600">Medications Given</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={handover.vitalsRecorded || false}
                          onChange={(e) => updatePatientHandover(patient._id, 'vitalsRecorded', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-slate-600">Vitals Recorded</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - General Handover Info */}
          <div className="space-y-6">
            {/* General Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaNotesMedical className="text-teal-500" /> General Handover Notes
              </h2>
              <textarea
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                rows="6"
                placeholder="General instructions, ward updates, equipment status, staffing notes..."
              />
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaClock className="text-amber-500" /> Handover Tasks
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add task for next shift..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPendingTask(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button onClick={() => {
                  const input = document.querySelector('#task-input');
                  if (input.value) {
                    addPendingTask(input.value);
                    input.value = '';
                  }
                }} className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
                  <FaPlus size={14} />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingTasks.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No pending tasks</p>
                ) : (
                  pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => togglePendingTask(task.id)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {task.text}
                        </span>
                      </label>
                      <button onClick={() => removePendingTask(task.id)} className="text-red-400 hover:text-red-600">×</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Shift Summary */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
              <h2 className="font-bold text-slate-800 mb-2">Shift Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Current Shift:</span><span className="font-medium">{currentShift}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Next Shift:</span><span className="font-medium">{nextShift}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Patients Handed Over:</span><span className="font-medium">{patients.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Critical Patients:</span><span className="font-medium text-red-600">{patients.filter(p => handoverData[p._id]?.status === 'Critical').length}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Pending Tasks:</span><span className="font-medium text-amber-600">{pendingTasks.length}</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-teal-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Last updated: {format(new Date(), 'hh:mm a')}</span>
                  <FaArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShiftHandover;