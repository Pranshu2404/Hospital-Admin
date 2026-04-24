import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaHeartbeat, FaPrescriptionBottleAlt, FaNotesMedical, FaBed, FaUserMd, FaCalendarAlt, FaUserInjured } from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const NurseAssignedPatients = () => {
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
    `${patient.patientId?.first_name} ${patient.patientId?.last_name} ${patient.admissionNumber}`.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'Admitted': 'bg-teal-100 text-teal-700',
      'Under Treatment': 'bg-blue-100 text-blue-700',
      'Discharge Initiated': 'bg-amber-100 text-amber-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Layout sidebarItems={nurseSidebar} section="Nurse">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaUserInjured className="text-teal-600" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Assigned Patients</h1>
          </div>
          <p className="text-slate-500 text-sm">Manage your ward patients and their care</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by patient name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <FaUserInjured className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {patient.patientId?.first_name} {patient.patientId?.last_name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{patient.admissionNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaBed size={14} className="text-slate-400" />
                      <span>Bed: {patient.bedId?.bedNumber} ({patient.bedId?.bedType})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaUserMd size={14} className="text-slate-400" />
                      <span>Dr. {patient.primaryDoctorId?.firstName} {patient.primaryDoctorId?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaCalendarAlt size={14} className="text-slate-400" />
                      <span>Admitted: {format(new Date(patient.admissionDate), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 flex gap-2">
                    <Link 
                      to={`/dashboard/nurse/ipd/patient/${patient._id}/vitals`}
                      className="flex-1 text-center py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaHeartbeat size={12} /> Vitals
                    </Link>
                    <Link 
                      to={`/dashboard/nurse/ipd/patient/${patient._id}/medications`}
                      className="flex-1 text-center py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaPrescriptionBottleAlt size={12} /> Meds
                    </Link>
                    <Link 
                      to={`/dashboard/nurse/ipd/patient/${patient._id}/notes`}
                      className="flex-1 text-center py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaNotesMedical size={12} /> Notes
                    </Link>
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

export default NurseAssignedPatients;