import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStethoscope, FaSave, FaUser, FaBed, FaCalendarAlt, FaNotesMedical, FaPrescriptionBottleAlt, FaFlask, FaProcedures } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AddDoctorRound = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    roundDateTime: new Date().toISOString().slice(0, 16),
    patientCondition: 'Stable',
    complaints: '',
    symptoms: '',
    examinationFindings: '',
    diagnosis: '',
    treatmentPlan: '',
    advice: '',
    dischargeSuggested: false,
    nextReviewDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [admissionRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/ipd/admissions/${id}`),
        axios.get(`${API_URL}/doctors`)
      ]);
      setAdmission(admissionRes.data.admission);
      setDoctors(doctorsRes.data || []);
      // Set default doctor as the primary doctor
      if (admissionRes.data.admission?.primaryDoctorId?._id) {
        setFormData(prev => ({
          ...prev,
          doctorId: admissionRes.data.admission.primaryDoctorId._id
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return;
    }

    setSaving(true);
    try {
      const roundData = {
        admissionId: id,
        patientId: admission.patientId._id,
        doctorId: formData.doctorId,
        roundDateTime: formData.roundDateTime,
        patientCondition: formData.patientCondition,
        complaints: formData.complaints,
        symptoms: formData.symptoms,
        examinationFindings: formData.examinationFindings,
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        advice: formData.advice,
        dischargeSuggested: formData.dischargeSuggested,
        nextReviewDate: formData.nextReviewDate || null,
        notes: formData.notes
      };
      
      await axios.post(`${API_URL}/ipd/rounds`, roundData);
      toast.success('Doctor round added successfully');
      navigate(`/dashboard/staff/ipd/patient/${id}`);
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error(error.response?.data?.error || 'Failed to add round');
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
                <FaStethoscope className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Add Doctor Round</h1>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaStethoscope className="text-teal-500" /> Round Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => handleInputChange('doctorId', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Round Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.roundDateTime}
                  onChange={(e) => handleInputChange('roundDateTime', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition</label>
                <select
                  value={formData.patientCondition}
                  onChange={(e) => handleInputChange('patientCondition', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Stable">Stable</option>
                  <option value="Improving">Improving</option>
                  <option value="Critical">Critical</option>
                  <option value="Deteriorating">Deteriorating</option>
                  <option value="Serious">Serious</option>
                  <option value="Recovering">Recovering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Review Date</label>
                <input
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => handleInputChange('nextReviewDate', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaNotesMedical className="text-teal-500" /> Clinical Findings
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Complaints / Symptoms</label>
                <textarea
                  value={formData.complaints}
                  onChange={(e) => handleInputChange('complaints', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="3"
                  placeholder="Enter patient complaints or symptoms..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Examination Findings</label>
                <textarea
                  value={formData.examinationFindings}
                  onChange={(e) => handleInputChange('examinationFindings', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="3"
                  placeholder="Enter physical examination findings..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="2"
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Plan</label>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="3"
                  placeholder="Enter treatment plan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Advice / Instructions</label>
                <textarea
                  value={formData.advice}
                  onChange={(e) => handleInputChange('advice', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="2"
                  placeholder="Enter advice or instructions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="2"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dischargeSuggested"
                  checked={formData.dischargeSuggested}
                  onChange={(e) => handleInputChange('dischargeSuggested', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="dischargeSuggested" className="text-sm text-slate-700">Suggest Discharge</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
                <><FaSave /> Save Round Note</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddDoctorRound;