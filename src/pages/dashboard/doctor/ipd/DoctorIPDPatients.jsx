import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserInjured, FaBed, FaCalendarAlt, FaStethoscope, FaFileAlt, FaMoneyBillWave } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const DoctorIPDPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions`, {
        params: { status: 'Admitted,Under Treatment,Discharge Initiated' }
      });
      setPatients(response.data.admissions || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.patientId?.first_name} ${patient.patientId?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        <div className="mb-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-teal-100 rounded-xl"><FaUserInjured className="text-teal-600" size={20} /></div><h1 className="text-2xl font-bold text-slate-800">My IPD Patients</h1></div><p className="text-slate-500 text-sm">Manage your admitted patients</p></div>

        <div className="mb-6"><input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-96 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" /></div>

        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4"></div></div> : filteredPatients.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center"><FaUserInjured className="text-5xl text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No patients assigned</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredPatients.map((patient) => (<div key={patient._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"><div className="flex justify-between items-start mb-3"><div><h3 className="font-bold text-slate-800">{patient.patientId?.first_name} {patient.patientId?.last_name}</h3><p className="text-xs text-slate-400 font-mono">{patient.admissionNumber}</p></div><span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-700">{patient.status}</span></div><div className="space-y-2 text-sm mb-4"><div className="flex items-center gap-2"><FaBed size={14} className="text-slate-400" /> Bed: {patient.bedId?.bedNumber}</div><div className="flex items-center gap-2"><FaCalendarAlt size={14} className="text-slate-400" /> Admitted: {format(new Date(patient.admissionDate), 'dd MMM yyyy')}</div></div><div className="border-t border-slate-100 pt-4 flex gap-2"><Link to={`/dashboard/doctor/ipd/patient/${patient._id}/rounds`} className="flex-1 text-center py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium flex items-center justify-center gap-1"><FaStethoscope size={12} /> Round</Link><Link to={`/dashboard/doctor/ipd/patient/${patient._id}/discharge-summary`} className="flex-1 text-center py-2 border border-teal-600 text-teal-600 rounded-xl hover:bg-teal-50 text-sm font-medium flex items-center justify-center gap-1"><FaFileAlt size={12} /> Discharge</Link></div></div>))}</div>}
      </div>
    </Layout>
  );
};

export default DoctorIPDPatients;