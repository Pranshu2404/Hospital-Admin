import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, FaClock, FaStethoscope, FaNotesMedical, 
  FaCheckCircle, FaPlus, FaTimes, FaMoneyBillWave, 
  FaArrowLeft, FaFilePrescription, FaCloudUploadAlt, FaTrash 
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import { POPULAR_MEDICINES } from '@/constants/medicines';

const AppointmentDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(state?.appointment || null);
  const [loading, setLoading] = useState(!state?.appointment);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [calculatingSalary, setCalculatingSalary] = useState(false);
  const [message, setMessage] = useState('');
  const [salaryInfo, setSalaryInfo] = useState(null);
  
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    notes: '',
    items: [{ medicine_name: '', dosage: '', duration: '', frequency: '', instructions: '', quantity: '' }],
    prescriptionImage: null
  });

  useEffect(() => {
    if (!state?.appointment && id) {
      fetchAppointment();
    }
  }, [id, state]);

  const searchMedicines = (query, index) => {
    setActiveSuggestionIndex(index);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const filteredMedicines = POPULAR_MEDICINES.filter(med => 
      med.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filteredMedicines);
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setMessage('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, { medicine_name: '', dosage: '', duration: '', frequency: '', instructions: '', quantity: '' }]
    }));
  };

  const removeMedicine = (index) => {
    if (prescription.items.length <= 1) return;
    const newItems = [...prescription.items];
    newItems.splice(index, 1);
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Set the image URL for preview and submission
      setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
      setMessage('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setPrescription(prev => ({ ...prev, prescriptionImage: null }));
    setMessage('');
  };

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...prescription.items];
    newItems[index][name] = value;
    setPrescription(prev => ({ ...prev, items: newItems }));

    if (name === 'medicine_name') {
      searchMedicines(value, index);
    }
  };

  const handleSuggestionClick = (index, medicineName) => {
    const newItems = [...prescription.items];
    newItems[index].medicine_name = medicineName;
    setPrescription(prev => ({ ...prev, items: newItems }));
    setSuggestions([]);
    setActiveSuggestionIndex(null);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (!prescription.diagnosis.trim()) {
        throw new Error('Diagnosis is required');
      }

      const validItems = prescription.items.filter(item => 
        item.medicine_name.trim() && item.dosage.trim()
      );

      if (validItems.length === 0) {
        throw new Error('At least one valid medicine is required');
      }

      const prescriptionData = {
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
        appointment_id: appointment._id,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        items: validItems,
        prescription_image: prescription.prescriptionImage
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions`, prescriptionData);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointment._id}/complete`);

      setCalculatingSalary(true);
      try {
        const salaryResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/salaries/calculate-appointment/${appointment._id}`
        );
        if (salaryResponse.data) {
          setSalaryInfo(salaryResponse.data);
          setMessage('Success! Prescription saved & Salary credited.');
        } else {
          setMessage('Prescription saved successfully.');
        }
      } catch (salaryError) {
        setMessage('Prescription saved, but salary calculation failed.');
      } finally {
        setCalculatingSalary(false);
      }
      
      setTimeout(() => {
        navigate('/dashboard/doctor/appointments', { 
          state: { message: 'Appointment completed successfully.' } 
        });
      }, 2500);
      
    } catch (err) {
      console.error('Error submitting prescription:', err);
      setMessage(err.response?.data?.error || err.message || 'Error submitting prescription.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!appointment) return null;

  const patientName = appointment.patient_id 
    ? `${appointment.patient_id.first_name || ''} ${appointment.patient_id.last_name || ''}`.trim()
    : 'Unknown Patient';

  return (
    <Layout sidebarItems={doctorSidebar} section={'Doctor'}>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-2 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/dashboard/doctor/appointments')}
              className="flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium"
            >
              <FaArrowLeft className="mr-2" /> Back to Queue
            </button>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                appointment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                appointment.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Alert Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center shadow-sm animate-fade-in ${
              message.includes('Error') || message.includes('Failed') 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {message.includes('Error') ? <FaTimes className="mr-3" /> : <FaCheckCircle className="mr-3" />}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Salary Success Card */}
          {salaryInfo && (
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center mb-1">
                    <FaMoneyBillWave className="mr-2 opacity-80" /> Appointment Earnings Calculated
                  </h3>
                  <p className="text-blue-100 text-sm">Amount credited to your pending balance</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">₹{salaryInfo.amount}</div>
                  <div className="text-xs bg-white/20 px-2 py-1 rounded inline-block mt-1">
                    {salaryInfo.status ? salaryInfo.status.toUpperCase() : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Column: Patient & Appointment Info */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Patient Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 text-sm">
                    <FaUser />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-md">Patient</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                    <p className="text-slate-700 font-medium text-sm">{patientName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Gender</label>
                      <p className="text-slate-700 text-sm">{appointment.patient_id?.gender || '--'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Age</label>
                      <p className="text-slate-700 text-sm">{calculateAge(appointment.patient_id?.dob)} yrs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood</label>
                      <p className="text-slate-700 text-sm">{appointment.patient_id?.blood_group || '--'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone</label>
                      <p className="text-slate-700 text-sm truncate">{appointment.patient_id?.phone || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Context Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 text-sm">
                    <FaClock />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-md">Session</h3>
                </div>
                <div className="p-4 space-y-2">
                   <div className="flex justify-between pb-2">
                      <span className="text-slate-500 text-sm">Date</span>
                      <span className="font-medium text-slate-700 text-xs">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between pb-2">
                      <span className="text-slate-500 text-sm">Time</span>
                      <span className="font-medium text-slate-700 text-xs">
                        {appointment.time_slot 
                          ? appointment.time_slot.split('-')[0].trim()
                          : (appointment.start_time 
                              ? new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : (appointment.time 
                                  ? appointment.time 
                                  : 'N/A'))}
                      </span>
                   </div>
                   <div className="flex justify-between pb-2">
                      <span className="text-slate-500 text-sm">Type</span>
                      <span className="font-medium text-slate-700 text-xs capitalize">{appointment.type}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Priority</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        appointment.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {appointment.priority}
                      </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Prescription Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
                
                {appointment.status === 'Completed' ? (
                   <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                     <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <FaCheckCircle className="text-4xl text-green-500" />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-2">Consultation Completed</h2>
                     <p className="text-slate-500 max-w-md">The prescription has been issued and saved to the patient's record.</p>
                     
                     <button onClick={() => navigate('/dashboard/doctor/appointments')} className="mt-8 text-teal-600 font-medium hover:underline">
                        Return to Dashboard
                     </button>
                   </div>
                ) : (
                  <>
                    {!showPrescriptionForm ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                         <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                            <FaNotesMedical className="text-4xl text-slate-300" />
                         </div>
                         <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Consultation</h3>
                         <p className="text-slate-500 max-w-sm mb-8">Begin the diagnosis process to prescribe medication and complete this appointment.</p>
                         <button
                            onClick={() => setShowPrescriptionForm(true)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-teal-600/20 transition-all transform hover:-translate-y-1"
                          >
                            Create Prescription
                          </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitPrescription} className="flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 flex items-center">
                            <FaFilePrescription className="mr-2 text-teal-600" /> New Prescription
                          </h3>
                        </div>

                        <div className="p-6 space-y-6 flex-grow">
                          
                          {/* Diagnosis Section */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Diagnosis <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="diagnosis"
                              value={prescription.diagnosis}
                              onChange={handleInputChange}
                              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              placeholder="e.g. Acute Viral Fever"
                              required
                            />
                          </div>

                          {/* Image Upload Section - UPDATED UI */}
                          <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-100 transition-colors">
                            {!prescription.prescriptionImage ? (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={uploadingImage}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                  {uploadingImage ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                                  ) : (
                                    <FaCloudUploadAlt className="text-3xl text-slate-400 mb-2" />
                                  )}
                                  <span className="text-sm font-medium text-slate-600">
                                    {uploadingImage ? 'Uploading...' : 'Click to upload prescription image (Optional)'}
                                  </span>
                                  <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG</span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative group">
                                <img 
                                  src={prescription.prescriptionImage} 
                                  alt="Prescription Preview" 
                                  className="max-h-64 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                                />
                                <button 
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  <FaTimes />
                                </button>
                                <p className="text-xs text-green-600 mt-2 font-medium flex items-center justify-center">
                                  <FaCheckCircle className="mr-1" /> Image attached successfully
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Medicines Section */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-sm font-semibold text-slate-700">Prescribed Medicines</label>
                              <button
                                type="button"
                                onClick={addMedicine}
                                className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center"
                              >
                                <FaPlus className="mr-1" /> Add Medicine
                              </button>
                            </div>

                            <div className="space-y-4">
                              {prescription.items.map((item, index) => (
                                <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-4 transition-all hover:shadow-md hover:border-teal-200 group">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase">Medicine #{index + 1}</h4>
                                    {prescription.items.length > 1 && (
                                      <button onClick={() => removeMedicine(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <FaTrash size={14} />
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    {/* Medicine Name with Search */}
                                    <div className="md:col-span-4 relative">
                                      <input
                                        type="text"
                                        name="medicine_name"
                                        value={item.medicine_name}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Medicine Name"
                                        required
                                      />
                                      {/* Suggestions Dropdown */}
                                      {activeSuggestionIndex === index && suggestions.length > 0 && (
                                        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
                                          {suggestions.map((med, i) => (
                                            <li
                                              key={i}
                                              onClick={() => handleSuggestionClick(index, med)}
                                              className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 hover:text-teal-700"
                                            >
                                              {med}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                    
                                    <div className="md:col-span-3">
                                      <input
                                        type="text"
                                        name="dosage"
                                        value={item.dosage}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Dosage (500mg)"
                                        required
                                      />
                                    </div>
                                    <div className="md:col-span-3">
                                      <input
                                        type="text"
                                        name="frequency"
                                        value={item.frequency}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Freq (1-0-1)"
                                        required
                                      />
                                    </div>
                                    <div className="md:col-span-3">
                                      <input
                                        type="text"
                                        name="duration"
                                        value={item.duration}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Duration (5 days)"
                                        required
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <input
                                        type="text"
                                        name="quantity"
                                        value={item.quantity}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Qty"
                                        required
                                      />
                                    </div>
                                    <div className="md:col-span-12">
                                      <input
                                        type="text"
                                        name="instructions"
                                        value={item.instructions}
                                        onChange={(e) => handleMedicineChange(index, e)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="Special Instructions (e.g. After food)"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                             <label className="block text-sm font-semibold text-slate-700 mb-2">Clinical Notes</label>
                             <textarea
                                name="notes"
                                value={prescription.notes}
                                onChange={handleInputChange}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                rows="3"
                                placeholder="Any additional observations..."
                              />
                          </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-xl">
                          <button
                            type="button"
                            onClick={() => setShowPrescriptionForm(false)}
                            className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || calculatingSalary}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                          >
                             {submitting ? (
                               <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
                             ) : (
                               <>Complete Consultation <FaCheckCircle className="ml-2" /></>
                             )}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetails;