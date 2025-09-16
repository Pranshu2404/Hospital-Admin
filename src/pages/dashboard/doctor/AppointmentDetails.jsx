import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaClock, FaStethoscope, FaNotesMedical, FaCheckCircle, FaPlus, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import { POPULAR_MEDICINES } from '@/constants/medicines';

const AppointmentDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(state?.appointment || null);
  const [loading, setLoading] = useState(!state?.appointment);
  const [suggestions, setSuggestions] = useState([])
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

  console.log(POPULAR_MEDICINES)

  useEffect(() => {
    // If appointment wasn't passed via state, fetch it from the API
    if (!state?.appointment && id) {
      fetchAppointment();
    }
  }, [id, state]);

  const searchMedicines = (query) => {
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setMessage('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl text-red-600 mb-4">Appointment not found</h2>
          <button
            onClick={() => navigate('/dashboard/doctor/appointments')}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
      setMessage('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMedicineChange = (index, e) => {
  const { name, value } = e.target;
  const newItems = [...prescription.items];
  newItems[index][name] = value;
  setPrescription(prev => ({ ...prev, items: newItems }));

  if (name === 'medicine_name') {
    searchMedicines(value); // Call local search function
  }
};

const handleSuggestionClick = (index, medicineName) => {
  const newItems = [...prescription.items];
  newItems[index].medicine_name = medicineName;
  setPrescription(prev => ({ ...prev, items: newItems }));
  setSuggestions([]); // Clear suggestions after selection
};

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Validate required fields
      if (!prescription.diagnosis.trim()) {
        throw new Error('Diagnosis is required');
      }

      // Validate medicine items
      const validItems = prescription.items.filter(item => 
        item.medicine_name.trim() && 
        item.dosage.trim() && 
        item.duration.trim() && 
        item.frequency.trim() && 
        item.quantity.trim()
      );

      if (validItems.length === 0) {
        throw new Error('At least one valid medicine is required');
      }

      // Create prescription
      const prescriptionData = {
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
        appointment_id: appointment._id,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        items: validItems,
        prescription_image: prescription.prescriptionImage
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions`, prescriptionData);

      // Update appointment status to completed
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appointment._id}/complete`);

      // Calculate salary for part-time doctors
      setCalculatingSalary(true);
      try {
        const salaryResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/salaries/calculate-appointment/${appointment._id}`
        );
        console.log('Salary calculation response:', salaryResponse.data);
        if (salaryResponse.data) {
          setSalaryInfo(salaryResponse.data);
          setMessage('Prescription submitted, appointment completed, and salary calculated!');
        } else {
          setMessage('Prescription submitted and appointment marked as completed!');
        }
      } catch (salaryError) {
        console.error('Error calculating salary:', salaryError);
        setMessage('Prescription submitted and appointment completed, but there was an issue with salary calculation.');
      } finally {
        setCalculatingSalary(false);
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard/doctor/appointments', { 
          state: { 
            message: 'Prescription submitted successfully' + (salaryInfo ? ' and salary calculated' : '') 
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting prescription:', err);
      setMessage(err.response?.data?.error || err.message || 'Error submitting prescription. Please try again.');
      setSubmitting(false);
    }
  };

  const patientName = appointment.patient_id 
    ? `${appointment.patient_id.first_name || ''} ${appointment.patient_id.last_name || ''}`.trim()
    : 'Patient information not available';

  const appointmentDate = new Date(appointment.appointment_date);

  return (
    <Layout sidebarItems={doctorSidebar} section={'Doctor'}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Appointment Details</h2>
              <p className="text-gray-600">Manage patient appointment and prescription</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/doctor/appointments')}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Back to Appointments
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {/* Salary Information Display */}
          {salaryInfo && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2 text-blue-600" /> Salary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><span className="font-medium">Amount:</span> ₹{salaryInfo.amount}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    salaryInfo.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    salaryInfo.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {salaryInfo.status}
                  </span>
                </p>
                <p><span className="font-medium">Period:</span> {new Date(salaryInfo.period_start).toLocaleDateString()} to {new Date(salaryInfo.period_end).toLocaleDateString()}</p>
                <p><span className="font-medium">Appointments:</span> {salaryInfo.appointment_count}</p>
              </div>
              {salaryInfo.notes && (
                <p className="mt-2 text-sm"><span className="font-medium">Notes:</span> {salaryInfo.notes}</p>
              )}
            </div>
          )}

          {/* Patient and Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" /> Patient Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {patientName}</p>
                <p><span className="font-medium">Gender:</span> {appointment.patient_id?.gender || 'N/A'}</p>
                <p><span className="font-medium">Age:</span> {calculateAge(appointment.patient_id?.dob)} years</p>
                <p><span className="font-medium">Blood Group:</span> {appointment.patient_id?.blood_group || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {appointment.patient_id?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FaClock className="mr-2 text-green-600" /> Appointment Details
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {appointmentDate.toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {appointment.time_slot}</p>
                <p><span className="font-medium">Type:</span> {appointment.type}</p>
                <p><span className="font-medium">Priority:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    appointment.priority === 'High' ? 'bg-red-100 text-red-800' :
                    appointment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {appointment.priority}
                  </span>
                </p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status}
                  </span>
                </p>
                {appointment.duration && (
                  <p><span className="font-medium">Duration:</span> {appointment.duration} minutes</p>
                )}
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          {appointment.status !== 'Completed' ? (
            !showPrescriptionForm ? (
              <div className="text-center py-8">
                <FaStethoscope className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Ready to write prescription?</h3>
                <p className="text-gray-600 mb-6">Create a prescription for this patient and complete the appointment</p>
                <button
                  onClick={() => setShowPrescriptionForm(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  Write Prescription
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FaNotesMedical className="mr-2 text-teal-600" /> Prescription Form
                </h3>
                
                <form onSubmit={handleSubmitPrescription}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block font-medium mb-2">Diagnosis *</label>
                      <input
                        type="text"
                        name="diagnosis"
                        value={prescription.diagnosis}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2">Upload Prescription Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border rounded p-2"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <p className="text-sm text-blue-600 mt-1">Uploading image...</p>}
                      {prescription.prescriptionImage && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600">Image uploaded successfully!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium mb-2">Clinical Notes</label>
                    <textarea
                      name="notes"
                      value={prescription.notes}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                      placeholder="Additional notes about the patient's condition..."
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Medications *</h4>
                      <button
                        type="button"
                        onClick={addMedicine}
                        className="flex items-center text-teal-600 hover:text-teal-800"
                      >
                        <FaPlus className="mr-1" /> Add Medicine
                      </button>
                    </div>

                    {prescription.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 p-4 bg-white rounded border">
                        <div className="md:col-span-3 relative">
                          <label className="block text-sm font-medium mb-1">Medicine Name *</label>
                          <input
                            type="text"
                            name="medicine_name"
                            value={item.medicine_name}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            required
                          />
                          {item.medicine_name.length > 1 && suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                              {suggestions.map((med, suggestionIndex) => (
                                  <li
                                  key={suggestionIndex} // Use index as key since names are strings
                                  onClick={() => handleSuggestionClick(index, med)}
                                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  >
                                   {med}
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Dosage *</label>
                          <input
                            type="text"
                            name="dosage"
                            value={item.dosage}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            required
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Duration *</label>
                          <input
                            type="text"
                            name="duration"
                            value={item.duration}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            required
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Frequency *</label>
                          <input
                            type="text"
                            name="frequency"
                            value={item.frequency}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            required
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium mb-1">Quantity *</label>
                          <input
                            type="text"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            required
                            placeholder="e.g., 1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Instructions</label>
                          <input
                            type="text"
                            name="instructions"
                            value={item.instructions}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="e.g., After meals"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          {prescription.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicine(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || calculatingSalary}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center"
                    >
                      {submitting ? 'Submitting...' : calculatingSalary ? 'Calculating Salary...' : (
                        <>
                          <FaCheckCircle className="mr-2" /> Complete Appointment & Save Prescription
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-green-800 mb-2">Appointment Completed</h3>
              <p className="text-green-600">This appointment has been completed and prescription was issued.</p>
              {salaryInfo && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700">Salary Information</h4>
                  <p className="text-sm">Amount: ₹{salaryInfo.amount} | Status: {salaryInfo.status}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetails;