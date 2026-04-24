import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStethoscope, FaSave, FaUser, FaBed, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const DoctorWardRounds = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [formData, setFormData] = useState({
    patientCondition: 'Stable',
    complaints: '',
    examinationFindings: '',
    diagnosis: '',
    treatmentPlan: '',
    advice: '',
    dischargeSuggested: false,
    nextReviewDate: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions/${id}`);
      setAdmission(response.data.admission);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_URL}/ipd/rounds`, {
        admissionId: id,
        patientId: admission.patientId._id,
        doctorId: admission.primaryDoctorId._id,
        ...formData,
        nextReviewDate: formData.nextReviewDate ? new Date(formData.nextReviewDate) : null
      });
      toast.success('Round note added successfully');
      navigate('/dashboard/doctor/ipd/patients');
    } catch (error) {
      console.error('Error saving round:', error);
      toast.error('Failed to save round note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout sidebarItems={doctorSidebar} section="Doctor"><div className="min-h-screen bg-slate-50/50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div></div></Layout>;

  const patient = admission?.patientId;

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        <div className="mb-6 flex items-center gap-4"><button onClick={() => navigate('/dashboard/doctor/ipd/patients')} className="p-2 hover:bg-white rounded-xl"><FaArrowLeft className="text-slate-500" /></button><div><div className="flex items-center gap-3"><div className="p-2 bg-teal-100 rounded-xl"><FaStethoscope className="text-teal-600" size={20} /></div><h1 className="text-2xl font-bold text-slate-800">Ward Round</h1></div><p className="text-slate-500 text-sm mt-1">{patient?.first_name} {patient?.last_name}</p></div></div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 flex flex-wrap gap-6"><div className="flex items-center gap-3"><div className="p-2 bg-teal-50 rounded-xl"><FaUser className="text-teal-500" /></div><div><p className="text-xs text-slate-400">Patient ID</p><p className="font-medium">{patient?.patientId}</p></div></div><div className="flex items-center gap-3"><div className="p-2 bg-teal-50 rounded-xl"><FaBed className="text-teal-500" /></div><div><p className="text-xs text-slate-400">Bed</p><p className="font-medium">{admission?.bedId?.bedNumber}</p></div></div></div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition</label><select value={formData.patientCondition} onChange={(e) => setFormData({...formData, patientCondition: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="Stable">Stable</option><option value="Improving">Improving</option><option value="Critical">Critical</option><option value="Deteriorating">Deteriorating</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Complaints / Symptoms</label><textarea value={formData.complaints} onChange={(e) => setFormData({...formData, complaints: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Examination Findings</label><textarea value={formData.examinationFindings} onChange={(e) => setFormData({...formData, examinationFindings: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label><textarea value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Treatment Plan</label><textarea value={formData.treatmentPlan} onChange={(e) => setFormData({...formData, treatmentPlan: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Advice / Instructions</label><textarea value={formData.advice} onChange={(e) => setFormData({...formData, advice: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.dischargeSuggested} onChange={(e) => setFormData({...formData, dischargeSuggested: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" /> <span className="text-sm text-slate-700">Suggest Discharge</span></label></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Next Review Date</label><input type="date" value={formData.nextReviewDate} onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => navigate('/dashboard/doctor/ipd/patients')} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600">Cancel</button><button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2">{saving ? 'Saving...' : <><FaSave /> Save Round Note</>}</button></div>
        </form>
      </div>
    </Layout>
  );
};

export default DoctorWardRounds;