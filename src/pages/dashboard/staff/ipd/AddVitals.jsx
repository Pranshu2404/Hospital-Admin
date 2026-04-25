import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaHeartbeat, FaSave, FaUser, FaBed, FaCalendarAlt, FaThermometerHalf, FaHeart, FaLungs, FaTint, FaWeight } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AddVitals = () => {
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
      navigate(`/dashboard/staff/ipd/patient/${id}`);
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast.error(error.response?.data?.error || 'Failed to record vitals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (!admission) {
    return (
      <Layout sidebarItems={staffSidebar} section="Staff">
        <div className="p-6 text-center">Admission not found</div>
      </Layout>
    );
  }

  const patient = admission.patientId;

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate(`/dashboard/staff/ipd/patient/${id}`)} className="p-2 hover:bg-white rounded-xl transition-colors">
            <FaArrowLeft className="text-slate-500" size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaHeartbeat className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Record Vitals</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {patient?.first_name} {patient?.last_name} - {admission.admissionNumber}
            </p>
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaUser className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Patient ID</p><p className="font-medium">{patient?.patientId}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaBed className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Bed</p><p className="font-medium">{admission.bedId?.bedNumber} ({admission.bedId?.bedType})</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><FaCalendarAlt className="text-teal-500" /></div>
            <div><p className="text-xs text-slate-400">Admitted On</p><p className="font-medium">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</p></div>
          </div>
        </div>

        {/* Vitals Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FaThermometerHalf className="text-teal-500" /> Temperature
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="98.6"
                />
                <select
                  value={formData.temperatureUnit}
                  onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Celsius">°C</option>
                  <option value="Fahrenheit">°F</option>
                </select>
              </div>
            </div>

            {/* Pulse */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FaHeart className="text-teal-500" /> Pulse (bpm)
              </label>
              <input
                type="number"
                value={formData.pulse}
                onChange={(e) => handleInputChange('pulse', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="72"
              />
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FaTint className="text-teal-500" /> Blood Pressure
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Systolic"
                  value={formData.bloodPressure.systolic}
                  onChange={(e) => handleInputChange('systolic', e.target.value)}
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <input
                  type="number"
                  placeholder="Diastolic"
                  value={formData.bloodPressure.diastolic}
                  onChange={(e) => handleInputChange('diastolic', e.target.value)}
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {/* Respiratory Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FaLungs className="text-teal-500" /> Respiratory Rate
              </label>
              <input
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => handleInputChange('respiratoryRate', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="16"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={formData.spo2}
                onChange={(e) => handleInputChange('spo2', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="98"
              />
            </div>

            {/* Blood Sugar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
              <input
                type="number"
                value={formData.bloodSugar}
                onChange={(e) => handleInputChange('bloodSugar', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="100"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FaWeight className="text-teal-500" /> Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="70"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="170"
              />
            </div>

            {/* Pain Score */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pain Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.painScore}
                onChange={(e) => handleInputChange('painScore', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="0"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/staff/ipd/patient/${id}`)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2"
            >
              {saving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
              ) : (
                <><FaSave /> Save Vitals</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddVitals;