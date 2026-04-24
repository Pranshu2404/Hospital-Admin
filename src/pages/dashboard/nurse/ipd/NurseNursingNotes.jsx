import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { nurseSidebar } from '@/constants/sidebarItems/nurseSidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaNotesMedical, FaPlus, FaSave, FaEdit, FaTrash, FaEye,
  FaUser, FaBed, FaCalendarAlt, FaClock, FaExclamationTriangle,
  FaStethoscope, FaPrescriptionBottleAlt, FaFilter, FaSearch
} from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const NurseNursingNotes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [nursingNotes, setNursingNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    patientId: '',
    noteType: 'General',
    note: '',
    priority: 'Normal',
    shift: 'Morning'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchNursingNotes();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/admissions`, {
        params: { status: 'Admitted,Under Treatment,Discharge Initiated' }
      });
      setPatients(response.data.admissions || []);
      if (response.data.admissions?.length > 0) {
        setSelectedPatient(response.data.admissions[0]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchNursingNotes = async () => {
    if (!selectedPatient) return;
    try {
      const response = await axios.get(`${API_URL}/ipd/nursing-notes/admission/${selectedPatient._id}`);
      setNursingNotes(response.data.nursingNotes || []);
    } catch (error) {
      console.error('Error fetching nursing notes:', error);
      toast.error('Failed to load nursing notes');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!formData.note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/ipd/nursing-notes`, {
        admissionId: selectedPatient._id,
        patientId: selectedPatient.patientId._id,
        noteType: formData.noteType,
        note: formData.note,
        priority: formData.priority,
        shift: formData.shift
      });
      
      toast.success('Nursing note added successfully');
      setShowAddModal(false);
      setFormData({
        patientId: '',
        noteType: 'General',
        note: '',
        priority: 'Normal',
        shift: 'Morning'
      });
      fetchNursingNotes();
    } catch (error) {
      console.error('Error adding nursing note:', error);
      toast.error('Failed to add nursing note');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`${API_URL}/ipd/nursing-notes/${noteId}`);
      toast.success('Note deleted successfully');
      fetchNursingNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'Important': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getNoteTypeIcon = (type) => {
    switch(type) {
      case 'Critical Alert': return <FaExclamationTriangle className="text-red-500" />;
      case 'Medication': return <FaPrescriptionBottleAlt className="text-blue-500" />;
      case 'Procedure': return <FaStethoscope className="text-purple-500" />;
      default: return <FaNotesMedical className="text-teal-500" />;
    }
  };

  const filteredNotes = nursingNotes.filter(note => {
    const matchesType = filterType === 'all' || note.noteType === filterType;
    const matchesSearch = note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.nurseId?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

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
                <FaNotesMedical className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Nursing Notes</h1>
            </div>
            <p className="text-slate-500 text-sm">Document patient observations and nursing interventions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm font-medium"
          >
            <FaPlus size={14} /> Add Nursing Note
          </button>
        </div>

        {/* Patient Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Patient</label>
          <select
            value={selectedPatient?._id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p._id === e.target.value);
              setSelectedPatient(patient);
            }}
            className="w-full md:w-96 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.patientId?.first_name} {patient.patientId?.last_name} - Bed {patient.bedId?.bedNumber}
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <>
            {/* Patient Info Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-xl"><FaUser className="text-teal-500" size={16} /></div>
                <div><p className="text-xs text-slate-400">Patient</p><p className="font-medium">{selectedPatient.patientId?.first_name} {selectedPatient.patientId?.last_name}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-xl"><FaBed className="text-teal-500" size={16} /></div>
                <div><p className="text-xs text-slate-400">Bed</p><p className="font-medium">{selectedPatient.bedId?.bedNumber} ({selectedPatient.bedId?.bedType})</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-xl"><FaCalendarAlt className="text-teal-500" size={16} /></div>
                <div><p className="text-xs text-slate-400">Admitted On</p><p className="font-medium">{format(new Date(selectedPatient.admissionDate), 'dd MMM yyyy')}</p></div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div className="w-full md:w-64">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="all">All Note Types</option>
                    <option value="General">General</option>
                    <option value="Shift Note">Shift Note</option>
                    <option value="Critical Alert">Critical Alert</option>
                    <option value="Medication">Medication</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nursing Notes List */}
            <div className="space-y-4">
              {filteredNotes.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                  <FaNotesMedical className="text-5xl text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400">No nursing notes found</p>
                  <button onClick={() => setShowAddModal(true)} className="mt-4 text-teal-600 hover:text-teal-700 font-medium">Add your first note →</button>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div key={note._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100">
                            {getNoteTypeIcon(note.noteType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(note.priority)}`}>
                                {note.priority}
                              </span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {note.noteType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {format(new Date(note.noteDateTime), 'dd MMM yyyy, hh:mm a')} • Shift: {note.shift}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.note}</p>
                      {note.nurseId && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-400">Recorded by: {note.nurseId?.first_name} {note.nurseId?.last_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl"><FaPlus className="text-teal-600" size={18} /></div>
                <h3 className="text-xl font-bold text-slate-800">Add Nursing Note</h3>
              </div>
              <p className="text-slate-500 text-sm mt-1">{selectedPatient?.patientId?.first_name} {selectedPatient?.patientId?.last_name}</p>
            </div>
            <form onSubmit={handleAddNote} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Note Type</label>
                  <select
                    value={formData.noteType}
                    onChange={(e) => setFormData({...formData, noteType: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="General">General</option>
                    <option value="Shift Note">Shift Note</option>
                    <option value="Critical Alert">Critical Alert</option>
                    <option value="Medication">Medication</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Morning">Morning (7am - 3pm)</option>
                    <option value="Evening">Evening (3pm - 11pm)</option>
                    <option value="Night">Night (11pm - 7am)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nursing Note *</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="5"
                  placeholder="Document your observations, interventions, and patient response..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-70 font-medium">
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NurseNursingNotes;