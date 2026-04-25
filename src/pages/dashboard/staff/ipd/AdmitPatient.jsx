import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaUserMd, FaBed, FaHospitalUser, FaUserPlus, 
  FaCreditCard, FaNotesMedical, FaUserFriends, FaBuilding, 
  FaDoorOpen, FaMoneyBillWave
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdmitPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    admissionType: 'Planned',
    departmentId: '',
    primaryDoctorId: '',
    secondaryDoctorIds: [],
    bedId: '',
    provisionalDiagnosis: '',
    chiefComplaints: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    attendant: { name: '', relation: '', mobile: '', address: '' },
    paymentType: 'Cash',
    insuranceDetails: { provider: '', policyNumber: '', tpaName: '', preAuthNumber: '' },
    advanceAmount: 0,
    admissionNotes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWard) {
      fetchRoomsByWard();
    }
  }, [selectedWard]);

  useEffect(() => {
    if (selectedRoom) {
      fetchAvailableBeds();
    }
  }, [selectedRoom]);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, doctorsRes, departmentsRes, wardsRes] = await Promise.all([
        axios.get(`${API_URL}/patients?limit=1000`),
        axios.get(`${API_URL}/doctors`),
        axios.get(`${API_URL}/departments`),
        axios.get(`${API_URL}/wards`)
      ]);
      
      const patientsData = Array.isArray(patientsRes.data) 
        ? patientsRes.data 
        : (patientsRes.data.patients || []);
      setPatients(patientsData);
      setDoctors(doctorsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setWards(wardsRes.data.wards || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const fetchRoomsByWard = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      const filteredRooms = (response.data || []).filter(room => room.wardId._id === selectedWard);
      setRooms(filteredRooms);
      setSelectedRoom('');
      setFormData(prev => ({ ...prev, bedId: '' }));
      setAvailableBeds([]);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchAvailableBeds = async () => {
    try {
      const response = await axios.get(`${API_URL}/ipd/beds/available`, { 
        params: { roomId: selectedRoom } 
      });
      setAvailableBeds(response.data.beds || []);
      setFormData(prev => ({ ...prev, bedId: '' }));
    } catch (error) {
      console.error('Error fetching beds:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendantChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      attendant: { ...prev.attendant, [field]: value }
    }));
  };

  const handleInsuranceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      insuranceDetails: { ...prev.insuranceDetails, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!formData.primaryDoctorId) {
      toast.error('Please select a primary doctor');
      return;
    }
    
    if (!formData.bedId) {
      toast.error('Please select a bed');
      return;
    }

    setLoading(true);
    try {
      const admissionData = {
        ...formData,
        patientId: selectedPatient._id,
        advanceAmount: parseFloat(formData.advanceAmount) || 0
      };
      
      const response = await axios.post(`${API_URL}/ipd/admissions`, admissionData);
      
      if (response.data.success) {
        toast.success(`Patient admitted successfully! Admission ID: ${response.data.admission.admissionNumber}`);
        navigate(`/dashboard/staff/ipd/patient/${response.data.admission._id}`);
      } else {
        toast.error(response.data.message || 'Failed to admit patient');
      }
    } catch (error) {
      console.error('Error creating admission:', error);
      toast.error(error.response?.data?.error || 'Failed to admit patient');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name} ${patient.patientId}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const steps = [
    { number: 1, title: 'Select Patient', icon: FaUserPlus },
    { number: 2, title: 'Admission Details', icon: FaHospitalUser },
    { number: 3, title: 'Clinical Info', icon: FaNotesMedical },
    { number: 4, title: 'Attendant & Payment', icon: FaUserFriends },
  ];

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaHospitalUser className="text-teal-600" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admit Patient</h1>
          </div>
          <p className="text-slate-500 text-sm">Register a new inpatient admission</p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div 
                  className={`flex items-center gap-3 ${currentStep >= step.number ? 'text-teal-600' : 'text-slate-400'}`}
                  onClick={() => currentStep > step.number && setCurrentStep(step.number)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step.number ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.number}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all ${
                    currentStep > step.number ? 'bg-teal-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Patient Selection */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaUserPlus className="text-teal-500" /> Select Patient
              </h2>
              
              {!selectedPatient ? (
                <>
                  <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search patient by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {filteredPatients.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">No patients found</div>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient._id}
                          onClick={() => setSelectedPatient(patient)}
                          className="p-4 hover:bg-teal-50/50 cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-slate-800">{patient.first_name} {patient.last_name}</p>
                            <p className="text-sm text-slate-400">ID: {patient.patientId} | Phone: {patient.phone}</p>
                          </div>
                          <button className="text-teal-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
                            Select
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-teal-50 rounded-xl p-4 flex justify-between items-center border border-teal-200">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    <p className="text-sm text-slate-500">ID: {selectedPatient.patientId} | Phone: {selectedPatient.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Change
                  </button>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => selectedPatient && setCurrentStep(2)}
                  disabled={!selectedPatient}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Admission Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Admission Details with Ward → Room → Bed hierarchy */}
          {currentStep === 2 && selectedPatient && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaHospitalUser className="text-teal-500" /> Admission Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admission Type *</label>
                  <select
                    value={formData.admissionType}
                    onChange={(e) => handleInputChange('admissionType', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Referral">Referral</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Doctor *</label>
                  <select
                    value={formData.primaryDoctorId}
                    onChange={(e) => handleInputChange('primaryDoctorId', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>
                        Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Ward Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <FaBuilding className="inline mr-1" size={12} /> Select Ward *
                  </label>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward._id} value={ward._id}>{ward.name}</option>
                    ))}
                  </select>
                </div>

                {/* Room Selection */}
                {selectedWard && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <FaDoorOpen className="inline mr-1" size={12} /> Select Room *
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">Select Room</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room._id}>{room.room_number} ({room.type})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bed Selection */}
                {selectedRoom && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <FaBed className="inline mr-1" size={12} /> Select Bed *
                    </label>
                    <select
                      value={formData.bedId}
                      onChange={(e) => handleInputChange('bedId', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">Select Bed</option>
                      {availableBeds.length === 0 ? (
                        <option value="" disabled>No beds available</option>
                      ) : (
                        availableBeds.map(bed => (
                          <option key={bed._id} value={bed._id}>
                            {bed.bedNumber} - {bed.bedType} (₹{bed.dailyCharge}/day)
                          </option>
                        ))
                      )}
                    </select>
                    {availableBeds.length === 0 && selectedRoom && (
                      <p className="text-xs text-amber-600 mt-1">No beds available in this room</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.bedId) {
                      toast.error('Please select a bed');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all"
                >
                  Next: Clinical Info →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Clinical Information */}
          {currentStep === 3 && selectedPatient && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaNotesMedical className="text-teal-500" /> Clinical Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provisional Diagnosis</label>
                  <textarea
                    value={formData.provisionalDiagnosis}
                    onChange={(e) => handleInputChange('provisionalDiagnosis', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    rows="3"
                    placeholder="Enter provisional diagnosis..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaints</label>
                  <textarea
                    value={formData.chiefComplaints}
                    onChange={(e) => handleInputChange('chiefComplaints', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    rows="3"
                    placeholder="Enter chief complaints..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">History of Present Illness</label>
                  <textarea
                    value={formData.historyOfPresentIllness}
                    onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    rows="2"
                    placeholder="Enter history of present illness..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Past Medical History</label>
                  <textarea
                    value={formData.pastMedicalHistory}
                    onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    rows="2"
                    placeholder="Enter past medical history..."
                  />
                </div>
              </div>
              
              <div className="flex justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all"
                >
                  Next: Attendant & Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Attendant & Payment Details */}
          {currentStep === 4 && selectedPatient && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaUserFriends className="text-teal-500" /> Attendant Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attendant Name</label>
                    <input
                      type="text"
                      value={formData.attendant.name}
                      onChange={(e) => handleAttendantChange('name', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
                    <input
                      type="text"
                      value={formData.attendant.relation}
                      onChange={(e) => handleAttendantChange('relation', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.attendant.mobile}
                      onChange={(e) => handleAttendantChange('mobile', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.attendant.address}
                      onChange={(e) => handleAttendantChange('address', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-teal-500" /> Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Government Scheme">Government Scheme</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Advance Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.advanceAmount}
                      onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Insurance Details - shown only when Insurance is selected */}
                {formData.paymentType === 'Insurance' && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-medium text-slate-700 mb-3">Insurance Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Provider</label>
                        <input
                          type="text"
                          value={formData.insuranceDetails.provider}
                          onChange={(e) => handleInsuranceChange('provider', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Policy Number</label>
                        <input
                          type="text"
                          value={formData.insuranceDetails.policyNumber}
                          onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">TPA Name</label>
                        <input
                          type="text"
                          value={formData.insuranceDetails.tpaName}
                          onChange={(e) => handleInsuranceChange('tpaName', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Pre-auth Number</label>
                        <input
                          type="text"
                          value={formData.insuranceDetails.preAuthNumber}
                          onChange={(e) => handleInsuranceChange('preAuthNumber', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaNotesMedical className="text-teal-500" /> Admission Notes
                </h2>
                <textarea
                  value={formData.admissionNotes}
                  onChange={(e) => handleInputChange('admissionNotes', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  rows="3"
                  placeholder="Any additional notes about the admission..."
                />
              </div>

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {loading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</>
                  ) : (
                    <>Confirm Admission</>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AdmitPatient;