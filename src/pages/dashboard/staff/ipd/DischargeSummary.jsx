import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSave, FaFileAlt, FaUserMd, FaCalendarAlt, 
  FaNotesMedical, FaFlask, FaPills, FaSyringe, FaUser, FaPhone,
  FaEnvelope, FaVenusMars, FaIdCard, FaCheckCircle, FaPrint,
  FaTrash, FaPlus
} from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const DischargeSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [dischargeSummary, setDischargeSummary] = useState(null);
  const [formData, setFormData] = useState({
    finalDiagnosis: '',
    chiefComplaints: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    examinationFindings: '',
    investigations: '',
    treatmentGiven: '',
    proceduresDone: '',
    surgeriesDone: '',
    conditionOnDischarge: 'Improved',
    dischargeMedications: [],
    followUpAdvice: '',
    followUpDate: '',
    emergencyInstructions: '',
    dietAdvice: '',
    activityAdvice: ''
  });
  const [newMedication, setNewMedication] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admission details
      const admissionRes = await axios.get(`${API_URL}/ipd/admissions/${id}`);
      setAdmission(admissionRes.data.admission);
      
      // Fetch existing discharge summary if any
      try {
        const summaryRes = await axios.get(`${API_URL}/ipd/discharge/${id}/summary`);
        if (summaryRes.data.success && summaryRes.data.dischargeSummary) {
          const existing = summaryRes.data.dischargeSummary;
          setDischargeSummary(existing);
          setFormData({
            finalDiagnosis: existing.finalDiagnosis || '',
            chiefComplaints: existing.chiefComplaints || '',
            historyOfPresentIllness: existing.historyOfPresentIllness || '',
            pastMedicalHistory: existing.pastMedicalHistory || '',
            examinationFindings: existing.examinationFindings || '',
            investigations: existing.investigations || '',
            treatmentGiven: existing.treatmentGiven || '',
            proceduresDone: existing.proceduresDone || '',
            surgeriesDone: existing.surgeriesDone || '',
            conditionOnDischarge: existing.conditionOnDischarge || 'Improved',
            dischargeMedications: existing.dischargeMedications || [],
            followUpAdvice: existing.followUpAdvice || '',
            followUpDate: existing.followUpDate ? format(new Date(existing.followUpDate), 'yyyy-MM-dd') : '',
            emergencyInstructions: existing.emergencyInstructions || '',
            dietAdvice: existing.dietAdvice || '',
            activityAdvice: existing.activityAdvice || ''
          });
        }
      } catch (err) {
        // No existing summary, that's fine
        console.log('No existing discharge summary');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    if (!newMedication.medicineName || !newMedication.dosage) {
      toast.error('Please enter medicine name and dosage');
      return;
    }
    setFormData(prev => ({
      ...prev,
      dischargeMedications: [...prev.dischargeMedications, { ...newMedication }]
    }));
    setNewMedication({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    toast.success('Medication added');
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      dischargeMedications: prev.dischargeMedications.filter((_, i) => i !== index)
    }));
    toast.success('Medication removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare data for API
      const submitData = {
        finalDiagnosis: formData.finalDiagnosis,
        chiefComplaints: formData.chiefComplaints,
        historyOfPresentIllness: formData.historyOfPresentIllness,
        pastMedicalHistory: formData.pastMedicalHistory,
        examinationFindings: formData.examinationFindings,
        investigations: formData.investigations,
        treatmentGiven: formData.treatmentGiven,
        proceduresDone: formData.proceduresDone,
        surgeriesDone: formData.surgeriesDone,
        conditionOnDischarge: formData.conditionOnDischarge,
        dischargeMedications: formData.dischargeMedications,
        followUpAdvice: formData.followUpAdvice,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
        emergencyInstructions: formData.emergencyInstructions,
        dietAdvice: formData.dietAdvice,
        activityAdvice: formData.activityAdvice
      };
      
      const response = await axios.post(`${API_URL}/ipd/discharge/${id}/summary`, submitData);
      
      if (response.data.success) {
        toast.success('Discharge summary saved successfully');
        navigate(`/dashboard/staff/ipd/patient/${id}`);
      } else {
        toast.error(response.data.message || 'Failed to save discharge summary');
      }
    } catch (error) {
      console.error('Error saving discharge summary:', error);
      toast.error(error.response?.data?.error || 'Failed to save discharge summary');
    } finally {
      setSaving(false);
    }
  };

  const finalizeAndProceed = async () => {
    if (!window.confirm('Finalize this discharge summary? This will mark it as ready for billing.')) {
      return;
    }
    
    setSaving(true);
    try {
      // First save the summary
      const submitData = {
        finalDiagnosis: formData.finalDiagnosis,
        chiefComplaints: formData.chiefComplaints,
        historyOfPresentIllness: formData.historyOfPresentIllness,
        pastMedicalHistory: formData.pastMedicalHistory,
        examinationFindings: formData.examinationFindings,
        investigations: formData.investigations,
        treatmentGiven: formData.treatmentGiven,
        proceduresDone: formData.proceduresDone,
        surgeriesDone: formData.surgeriesDone,
        conditionOnDischarge: formData.conditionOnDischarge,
        dischargeMedications: formData.dischargeMedications,
        followUpAdvice: formData.followUpAdvice,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
        emergencyInstructions: formData.emergencyInstructions,
        dietAdvice: formData.dietAdvice,
        activityAdvice: formData.activityAdvice
      };
      
      await axios.post(`${API_URL}/ipd/discharge/${id}/summary`, submitData);
      
      // Then finalize it
      await axios.post(`${API_URL}/ipd/discharge/${id}/summary/finalize`);
      
      toast.success('Discharge summary finalized!');
      navigate(`/dashboard/staff/ipd/patient/${id}`);
    } catch (error) {
      console.error('Error finalizing discharge summary:', error);
      toast.error(error.response?.data?.error || 'Failed to finalize discharge summary');
    } finally {
      setSaving(false);
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
            <FaFileAlt className="text-5xl text-slate-300 mx-auto mb-4" />
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

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/staff/ipd/patient/${id}`)} 
              className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-teal-600"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <FaFileAlt className="text-teal-600" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Discharge Summary</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {patient?.first_name} {patient?.last_name} - {admission.admissionNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm font-medium disabled:opacity-70"
            >
              <FaSave size={14} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={finalizeAndProceed}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm font-medium disabled:opacity-70"
            >
              <FaCheckCircle size={14} /> Finalize & Proceed
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all flex items-center gap-2 font-medium"
            >
              <FaPrint size={14} /> Print
            </button>
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaIdCard className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Patient ID</p>
                <p className="font-bold text-slate-800">{patient?.patientId || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaUser className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Patient Name</p>
                <p className="font-bold text-slate-800">{patient?.first_name} {patient?.last_name}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl">
                <FaVenusMars className="text-teal-500" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Age / Gender</p>
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
                <p className="text-xs text-slate-400 font-medium">Phone</p>
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
                <p className="text-xs text-slate-400 font-medium">Admission Date</p>
                <p className="font-bold text-slate-800">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinical Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaNotesMedical className="text-teal-500" size={18} /> Clinical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Final Diagnosis *</label>
                <textarea
                  value={formData.finalDiagnosis}
                  onChange={(e) => handleInputChange('finalDiagnosis', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="3"
                  placeholder="Enter final diagnosis..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaints</label>
                <textarea
                  value={formData.chiefComplaints}
                  onChange={(e) => handleInputChange('chiefComplaints', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter chief complaints..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">History of Present Illness</label>
                <textarea
                  value={formData.historyOfPresentIllness}
                  onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="3"
                  placeholder="Enter history of present illness..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Past Medical History</label>
                <textarea
                  value={formData.pastMedicalHistory}
                  onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter past medical history..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Examination Findings</label>
                <textarea
                  value={formData.examinationFindings}
                  onChange={(e) => handleInputChange('examinationFindings', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="3"
                  placeholder="Enter examination findings..."
                />
              </div>
            </div>
          </div>

          {/* Investigations & Treatment */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaFlask className="text-teal-500" size={18} /> Investigations & Treatment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Investigations</label>
                <textarea
                  value={formData.investigations}
                  onChange={(e) => handleInputChange('investigations', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="3"
                  placeholder="Enter investigations performed..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Given</label>
                <textarea
                  value={formData.treatmentGiven}
                  onChange={(e) => handleInputChange('treatmentGiven', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="3"
                  placeholder="Enter treatment given..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Procedures Done</label>
                <textarea
                  value={formData.proceduresDone}
                  onChange={(e) => handleInputChange('proceduresDone', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter procedures..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Surgeries Done</label>
                <textarea
                  value={formData.surgeriesDone}
                  onChange={(e) => handleInputChange('surgeriesDone', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter surgeries..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition on Discharge</label>
                <select
                  value={formData.conditionOnDischarge}
                  onChange={(e) => handleInputChange('conditionOnDischarge', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="Recovered">Recovered</option>
                  <option value="Improved">Improved</option>
                  <option value="Stabilized">Stabilized</option>
                  <option value="Referred">Referred</option>
                  <option value="LAMA">LAMA (Left Against Medical Advice)</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discharge Medications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaPills className="text-teal-500" size={18} /> Discharge Medications
            </h2>
            
            {/* Add Medication Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <input
                type="text"
                placeholder="Medicine Name *"
                value={newMedication.medicineName}
                onChange={(e) => setNewMedication({...newMedication, medicineName: e.target.value})}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Dosage *"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Frequency"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Duration"
                value={newMedication.duration}
                onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={addMedication}
                className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                <FaPlus size={14} /> Add
              </button>
            </div>
            <input
              type="text"
              placeholder="Instructions"
              value={newMedication.instructions}
              onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 mb-4"
            />

            {/* Medications List */}
            {formData.dischargeMedications.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-slate-700 mb-3">Added Medications</h3>
                <div className="space-y-2">
                  {formData.dischargeMedications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800">{med.medicineName}</p>
                        <p className="text-sm text-slate-500">
                          {med.dosage} | {med.frequency} | {med.duration}
                          {med.instructions && <span className="block text-xs text-slate-400 mt-1">Note: {med.instructions}</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up & Instructions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaUserMd className="text-teal-500" size={18} /> Follow-up & Instructions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Advice</label>
                <textarea
                  value={formData.followUpAdvice}
                  onChange={(e) => handleInputChange('followUpAdvice', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter follow-up advice..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diet Advice</label>
                <input
                  type="text"
                  value={formData.dietAdvice}
                  onChange={(e) => handleInputChange('dietAdvice', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="Dietary instructions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Activity Advice</label>
                <input
                  type="text"
                  value={formData.activityAdvice}
                  onChange={(e) => handleInputChange('activityAdvice', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="Activity restrictions"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Instructions</label>
                <textarea
                  value={formData.emergencyInstructions}
                  onChange={(e) => handleInputChange('emergencyInstructions', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows="2"
                  placeholder="Enter emergency instructions..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default DischargeSummary;