import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaHeartbeat, FaSave, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const NurseVitalsRecording = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [formData, setFormData] = useState({
    temperature: '',
    temperatureUnit: 'Celsius',
    pulse: '',
    bloodPressure: { systolic: '', diastolic: '' },
    respiratoryRate: '',
    spo2: '',
    bloodSugar: '',
    weight: '',
    height: '',
    painScore: '',
    remarks: ''
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

  const handleInputChange = (field, value) => {
    if (field === 'systolic' || field === 'diastolic') {
      setFormData(prev => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const vitalsData = {
        admissionId: id,
        patientId: admission.patientId._id,
        temperature: parseFloat(formData.temperature) || null,
        temperatureUnit: formData.temperatureUnit,
        pulse: parseInt(formData.pulse) || null,
        bloodPressure: {
          systolic: parseInt(formData.bloodPressure.systolic) || null,
          diastolic: parseInt(formData.bloodPressure.diastolic) || null
        },
        respiratoryRate: parseInt(formData.respiratoryRate) || null,
        spo2: parseInt(formData.spo2) || null,
        bloodSugar: parseFloat(formData.bloodSugar) || null,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        painScore: parseInt(formData.painScore) || null,
        remarks: formData.remarks
      };
      
      await axios.post(`${API_URL}/ipd/vitals`, vitalsData);
      toast.success('Vitals recorded successfully');
      navigate(`/dashboard/nurse/ipd/patients`);
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast.error(error.response?.data?.error || 'Failed to record vitals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={nurseSidebar} section="Nurse">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (!admission) {
    return (
      <Layout sidebarItems={nurseSidebar} section="Nurse">
        <div className="p-6 text-center">Patient not found</div>
      </Layout>
    );
  }

  const patient = admission.patientId;

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/nurse/ipd/patients')} className="p-2 hover:bg-white rounded-xl transition-colors">
            <FaArrowLeft className="text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaHeartbeat className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Record Vitals</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">{patient?.first_name} {patient?.last_name}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaUser className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Patient ID</p><p className="font-medium">{patient?.patientId}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaCalendarAlt className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Admission Date</p><p className="font-medium">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaBed className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Bed</p><p className="font-medium">{admission.bedId?.bedNumber}</p></div>
          </div>
        </div>

        {/* Vitals Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
              <div className="flex gap-2">
                <input type="number" step="0.1" value={formData.temperature} onChange={(e) => handleInputChange('temperature', e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="98.6" />
                <select value={formData.temperatureUnit} onChange={(e) => handleInputChange('temperatureUnit', e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="Celsius">°C</option>
                  <option value="Fahrenheit">°F</option>
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Pulse (bpm)</label><input type="number" value={formData.pulse} onChange={(e) => handleInputChange('pulse', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="72" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure</label><div className="flex gap-2"><input type="number" placeholder="Systolic" value={formData.bloodPressure.systolic} onChange={(e) => handleInputChange('systolic', e.target.value)} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /><input type="number" placeholder="Diastolic" value={formData.bloodPressure.diastolic} onChange={(e) => handleInputChange('diastolic', e.target.value)} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Respiratory Rate</label><input type="number" value={formData.respiratoryRate} onChange={(e) => handleInputChange('respiratoryRate', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="16" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">SpO2 (%)</label><input type="number" value={formData.spo2} onChange={(e) => handleInputChange('spo2', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="98" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar (mg/dL)</label><input type="number" value={formData.bloodSugar} onChange={(e) => handleInputChange('bloodSugar', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="100" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label><input type="number" step="0.1" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="70" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label><input type="number" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="170" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Pain Score (0-10)</label><input type="number" min="0" max="10" value={formData.painScore} onChange={(e) => handleInputChange('painScore', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="0" /></div>
            <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label><textarea value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" placeholder="Any additional notes..." /></div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => navigate('/dashboard/nurse/ipd/patients')} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2">{saving ? 'Saving...' : <><FaSave /> Save Vitals</>}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NurseVitalsRecording;