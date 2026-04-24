import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPrescriptionBottleAlt, FaCheckCircle, FaTimesCircle, FaClock, FaUserMd } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const NurseMedicationChart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [admission, setAdmission] = useState(null);
  const [medications, setMedications] = useState([]);
  const [processingId, setProcessingId] = useState(null);

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
    setProcessingId(medId);
    try {
      await axios.patch(`${API_URL}/ipd/medications/${medId}/administer`, { timingId });
      toast.success('Medication marked as administered');
      fetchData();
    } catch (error) {
      console.error('Error administering medication:', error);
      toast.error('Failed to administer medication');
    } finally {
      setProcessingId(null);
    }
  };

  const skipMedication = async (medId, timingId) => {
    if (window.confirm('Skip this medication dose?')) {
      setProcessingId(medId);
      try {
        await axios.patch(`${API_URL}/ipd/medications/${medId}/skip`, { timingId, remarks: 'Skipped by nurse' });
        toast.success('Medication skipped');
        fetchData();
      } catch (error) {
        console.error('Error skipping medication:', error);
        toast.error('Failed to skip medication');
      } finally {
        setProcessingId(null);
      }
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

  const patient = admission?.patientId;

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/nurse/ipd/patients')} className="p-2 hover:bg-white rounded-xl"><FaArrowLeft className="text-slate-500" /></button>
          <div><div className="flex items-center gap-3"><div className="p-2 bg-teal-100 rounded-xl"><FaPrescriptionBottleAlt className="text-teal-600" size={20} /></div><h1 className="text-2xl font-bold text-slate-800">Medication Chart</h1></div><p className="text-slate-500 text-sm mt-1">{patient?.first_name} {patient?.last_name}</p></div>
        </div>

        {medications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100"><FaPrescriptionBottleAlt className="text-5xl text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No medications prescribed</p></div>
        ) : (
          <div className="space-y-4">
            {medications.filter(m => m.status === 'Active').map((med) => (
              <div key={med._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center"><div><h3 className="font-bold text-slate-800">{med.medicineName}</h3><p className="text-sm text-slate-500">{med.dosage} • {med.route} • {med.frequency}</p></div>{med.isHighRisk && <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">High Risk</span>}</div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {med.timing?.filter(t => new Date(t.time) >= new Date()).map((timing, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${timing.status === 'Administered' ? 'bg-emerald-50 border-emerald-200' : timing.status === 'Skipped' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex justify-between items-center mb-2"><FaClock className="text-slate-400" size={12} /><span className="text-xs font-medium">{format(new Date(timing.time), 'hh:mm a')}</span></div>
                        {timing.status === 'Pending' ? (
                          <div className="flex gap-2"><button onClick={() => administerMedication(med._id, timing._id)} disabled={processingId === med._id} className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"><FaCheckCircle className="inline mr-1" size={10} /> Give</button><button onClick={() => skipMedication(med._id, timing._id)} disabled={processingId === med._id} className="py-1.5 px-2 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200"><FaTimesCircle size={10} /></button></div>
                        ) : timing.status === 'Administered' ? <div className="text-center text-emerald-600 text-xs"><FaCheckCircle className="inline mr-1" size={12} /> Given</div> : <div className="text-center text-red-600 text-xs"><FaTimesCircle className="inline mr-1" size={12} /> Skipped</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NurseMedicationChart;