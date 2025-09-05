import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

const AppointmentDetails = () => {
  const { state } = useLocation();
  const { appointment } = state || {};
  const navigate = useNavigate();
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescription, setPrescription] = useState({
    diagnosis: appointment.diagnosis || '',
    notes: '',
    items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }],
    prescriptionImage: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

  const calculateAge = (dob) => {
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

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...prescription.items];
    newItems[index][name] = value;
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      items: [...prev.items, { medicine_name: '', dosage: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicine = (index) => {
    const newItems = [...prescription.items];
    newItems.splice(index, 1);
    setPrescription(prev => ({ ...prev, items: newItems }));
  };

   const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  setUploadingImage(true);
  const formData = new FormData();
  formData.append('image', file); 
  
  // Debug: Check what's in the FormData
  console.log('File selected:', file.name, file.type, file.size);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Upload response:', response.data);
    
    setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
  } catch (err) {
    console.error('Error uploading image:', err);
    if (err.response) {
      console.error('Server response:', err.response.data);
    }
    alert('Failed to upload image. Please try again.');
  } finally {
    setUploadingImage(false);
  }
};

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Correctly send the doctor's ID
      const prescriptionData = {
        patient_id: appointment.patient_id._id,
        doctor_id: appointment.doctor_id._id, // Corrected line
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        items: prescription.items,
        prescription_image: prescription.prescriptionImage
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions`, prescriptionData);

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appointment._id}`, {
        status: 'Completed'
      });

      navigate('/dashboard/doctor/appointments', { 
        state: { message: 'Prescription submitted successfully' } 
      });
    } catch (err) {
      console.error('Error submitting prescription:', err);
      if (err.response) {
        console.error('Error data:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setSubmitting(false);
    }
  };

  return (
    <Layout sidebarItems={doctorSidebar}>
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Appointment Details</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Back to Appointments
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Patient Information</h3>
            <div className="space-y-3">
              <p><span className="font-medium">Name:</span> {appointment.patient_id.first_name} {appointment.patient_id.last_name}</p>
              <p><span className="font-medium">Gender:</span> {appointment.patient_id.gender}</p>
              <p><span className="font-medium">Age:</span> {calculateAge(appointment.patient_id.dob)}</p>
              <p><span className="font-medium">Blood Group:</span> {appointment.patient_id.blood_group || 'N/A'}</p>
              <p><span className="font-medium">Phone:</span> {appointment.patient_id.phone}</p>
              <p><span className="font-medium">Email:</span> {appointment.patient_id.email}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
            <div className="space-y-3">
              <p><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {appointment.time_slot}</p>
              <p><span className="font-medium">Type:</span> {appointment.type}</p>
              <p><span className="font-medium">Priority:</span> {appointment.priority}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 ${
                  appointment.status === 'Completed' ? 'text-green-600' : 
                  appointment.status === 'Cancelled' ? 'text-red-500' : 'text-blue-600'
                }`}>
                  {appointment.status}
                </span>
              </p>
              <p><span className="font-medium">Notes:</span> {appointment.notes || 'N/A'}</p>
            </div>
          </div>
        </div>

        {appointment.status !== 'Completed' && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowPrescriptionForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Write Prescription
            </button>
          </div>
        )}

        {showPrescriptionForm && (
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Prescription Form</h3>
            <form onSubmit={handleSubmitPrescription}>
              <div className="mb-4">
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
                  <img 
                    src={prescription.prescriptionImage} 
                    alt="Prescription preview" 
                    className="mt-2 max-w-xs rounded border"
                  />
                </div>
              )}
            </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={prescription.diagnosis}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={prescription.notes}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <h4 className="font-medium mb-3">Medications</h4>
              {prescription.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded border">
                  <div>
                    <label className="block text-sm font-medium mb-1">Medicine Name</label>
                    <input
                      type="text"
                      name="medicine_name"
                      value={item.medicine_name}
                      onChange={(e) => handleMedicineChange(index, e)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dosage</label>
                    <input
                      type="text"
                      name="dosage"
                      value={item.dosage}
                      onChange={(e) => handleMedicineChange(index, e)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={item.duration}
                      onChange={(e) => handleMedicineChange(index, e)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Instructions</label>
                      <input
                        type="text"
                        name="instructions"
                        value={item.instructions}
                        onChange={(e) => handleMedicineChange(index, e)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="ml-2 bg-red-500 text-white p-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={addMedicine}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  + Add Medicine
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Prescription'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default AppointmentDetails;


















// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '@/components/Layout';
// import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
// import apiClient from '../../../api/apiClient'; // Using apiClient for consistency

// const AppointmentDetails = () => {
//   const { state } = useLocation();
//   const { appointment } = state || {};
//   const navigate = useNavigate();
//   const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

//   // --- 1. STATE TO HOLD THE MEDICINE LIST ---
//   const [allMedicines, setAllMedicines] = useState([]);
  
//   // --- 2. UPDATED PRESCRIPTION STATE TO USE medicine_id ---
//   const [prescription, setPrescription] = useState({
//     diagnosis: appointment?.diagnosis || '',
//     notes: '',
//     items: [{ medicine_id: '', dosage: '', frequency: '', duration: '', instructions: '' }],
//     prescriptionImage: null
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   // --- 3. FETCH MEDICINES FROM THE API WHEN FORM IS SHOWN ---
//   useEffect(() => {
//     // Only fetch if the form is visible and the list is empty
//     if (showPrescriptionForm && allMedicines.length === 0) {
//       const fetchMedicines = async () => {
//         try {
//           const res = await apiClient.get('/api/pharmacy/medicines');
//           setAllMedicines(res.data);
//         } catch (err) {
//           console.error('Failed to fetch medicines', err);
//           alert('Could not load the medicine list. Please try again.');
//         }
//       };
//       fetchMedicines();
//     }
//   }, [showPrescriptionForm, allMedicines.length]);

//   if (!appointment) {
//     return <div>Appointment not found</div>;
//   }

//   const calculateAge = (dob) => {
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPrescription(prev => ({ ...prev, [name]: value }));
//   };

//   const handleMedicineChange = (index, e) => {
//     const { name, value } = e.target;
//     const newItems = [...prescription.items];
//     newItems[index][name] = value;
//     setPrescription(prev => ({ ...prev, items: newItems }));
//   };

//   const addMedicine = () => {
//     setPrescription(prev => ({
//       ...prev,
//       items: [...prev.items, { medicine_id: '', dosage: '', frequency: '', duration: '', instructions: '' }]
//     }));
//   };

//   const removeMedicine = (index) => {
//     const newItems = [...prescription.items].filter((_, i) => i !== index);
//     setPrescription(prev => ({ ...prev, items: newItems }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please select an image file');
//       return;
//     }

//     setUploadingImage(true);
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await apiClient.post(`/api/prescriptions/upload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
//     } catch (err) {
//       console.error('Error uploading image:', err);
//       alert('Failed to upload image. Please try again.');
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleSubmitPrescription = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const validItems = prescription.items.filter(item => item.medicine_id && item.dosage);

//     if (validItems.length === 0) {
//       alert("Please add at least one valid medicine.");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const prescriptionData = {
//         patient_id: appointment.patient_id._id,
//         doctor_id: appointment.doctor_id._id,
//         diagnosis: prescription.diagnosis,
//         notes: prescription.notes,
//         items: validItems, // Send only valid items
//         prescription_image: prescription.prescriptionImage
//       };

//       await apiClient.post(`/api/prescriptions`, prescriptionData);

//       await apiClient.put(`/api/appointments/${appointment._id}`, {
//         status: 'Completed'
//       });

//       navigate('/dashboard/doctor/appointments', { 
//         state: { message: 'Prescription submitted successfully' } 
//       });
//     } catch (err) {
//       console.error('Error submitting prescription:', err);
//       alert("Failed to submit prescription.");
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Layout sidebarItems={doctorSidebar}>
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           {/* ... (Patient and Appointment Details sections are unchanged) ... */}
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-semibold">Appointment Details</h2>
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
//                 >
//                     Back to Appointments
//                 </button>
//             </div>
//             {/* ... Your patient/appointment info JSX ... */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Patient Information</h3>
//                 <div className="space-y-3">
//                 <p><span className="font-medium">Name:</span> {appointment.patient_id.first_name} {appointment.patient_id.last_name}</p>
//                 <p><span className="font-medium">Gender:</span> {appointment.patient_id.gender}</p>
//                 <p><span className="font-medium">Age:</span> {calculateAge(appointment.patient_id.dob)}</p>
//                 <p><span className="font-medium">Blood Group:</span> {appointment.patient_id.blood_group || 'N/A'}</p>
//                 <p><span className="font-medium">Phone:</span> {appointment.patient_id.phone}</p>
//                 <p><span className="font-medium">Email:</span> {appointment.patient_id.email}</p>
//                 </div>
//             </div>

//             <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
//                 <div className="space-y-3">
//                 <p><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
//                 <p><span className="font-medium">Time:</span> {appointment.time_slot}</p>
//                 <p><span className="font-medium">Type:</span> {appointment.type}</p>
//                 <p><span className="font-medium">Priority:</span> {appointment.priority}</p>
//                 <p><span className="font-medium">Status:</span> 
//                     <span className={`ml-2 ${
//                     appointment.status === 'Completed' ? 'text-green-600' : 
//                     appointment.status === 'Cancelled' ? 'text-red-500' : 'text-blue-600'
//                     }`}>
//                     {appointment.status}
//                     </span>
//                 </p>
//                 <p><span className="font-medium">Notes:</span> {appointment.notes || 'N/A'}</p>
//                 </div>
//             </div>
//             </div>

//           {appointment.status !== 'Completed' && (
//             <div className="flex justify-end">
//               <button
//                 onClick={() => setShowPrescriptionForm(true)}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
//               >
//                 Write Prescription
//               </button>
//             </div>
//           )}

//           {showPrescriptionForm && (
//             <div className="mt-8 bg-gray-50 p-6 rounded-lg">
//               <h3 className="text-lg font-medium mb-4">Prescription Form</h3>
//               <form onSubmit={handleSubmitPrescription}>
//                  {/* ... (Image Upload, Diagnosis, Notes sections are unchanged) ... */}
//                  <div className="mb-4">
//               <label className="block font-medium mb-2">Upload Prescription Image</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="w-full border rounded p-2"
//                 disabled={uploadingImage}
//               />
//               {uploadingImage && <p className="text-sm text-blue-600 mt-1">Uploading image...</p>}
//               {prescription.prescriptionImage && (
//                 <div className="mt-2">
//                   <p className="text-sm text-green-600">Image uploaded successfully!</p>
//                   <img 
//                     src={prescription.prescriptionImage} 
//                     alt="Prescription preview" 
//                     className="mt-2 max-w-xs rounded border"
//                   />
//                 </div>
//               )}
//             </div>
//               <div className="mb-4">
//                 <label className="block font-medium mb-1">Diagnosis</label>
//                 <input
//                   type="text"
//                   name="diagnosis"
//                   value={prescription.diagnosis}
//                   onChange={handleInputChange}
//                   className="w-full border rounded px-3 py-2"
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block font-medium mb-1">Notes</label>
//                 <textarea
//                   name="notes"
//                   value={prescription.notes}
//                   onChange={handleInputChange}
//                   className="w-full border rounded px-3 py-2"
//                   rows="3"
//                 />
//               </div>

//                 <h4 className="font-medium mb-3">Medications</h4>
//                 {prescription.items.map((item, index) => (
//                   <div key={index} className="grid grid-cols-12 gap-4 mb-4 p-3 bg-white rounded border">
                    
//                     {/* --- 4. UPDATED MEDICINE INPUT (SELECT DROPDOWN) --- */}
//                     <div className="col-span-12 sm:col-span-3">
//                       <label className="block text-sm font-medium mb-1">Medicine</label>
//                       <select
//                         name="medicine_id"
//                         value={item.medicine_id}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm"
//                         required
//                       >
//                         <option value="">-- Select Medicine --</option>
//                         {allMedicines.map(med => (
//                           <option key={med._id} value={med._id}>{med.name}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="col-span-6 sm:col-span-2">
//                       <label className="block text-sm font-medium mb-1">Dosage</label>
//                       <input
//                         type="text" name="dosage" value={item.dosage}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                       />
//                     </div>
//                      <div className="col-span-6 sm:col-span-2">
//                       <label className="block text-sm font-medium mb-1">Frequency</label>
//                       <input
//                         type="text" name="frequency" value={item.frequency}
//                         onChange={(e) => handleMedicineChange(index, e)} placeholder="e.g., 1-0-1"
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                       />
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                       <label className="block text-sm font-medium mb-1">Duration</label>
//                       <input
//                         type="text" name="duration" value={item.duration}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                       />
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                       <label className="block text-sm font-medium mb-1">Instructions</label>
//                       <input
//                         type="text" name="instructions" value={item.instructions}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm"
//                       />
//                     </div>
//                     <div className="flex items-end col-span-12 sm:col-span-1">
//                       {index > 0 && (
//                         <button type="button" onClick={() => removeMedicine(index)}
//                           className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
//                         >
//                           X
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
                
//                 {/* ... (Add Medicine, Cancel, Submit buttons are unchanged) ... */}
//                 <div className="flex justify-between mt-4">
//                 <button
//                   type="button"
//                   onClick={addMedicine}
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                 >
//                   + Add Medicine
//                 </button>
//                 <div>
//                   <button
//                     type="button"
//                     onClick={() => setShowPrescriptionForm(false)}
//                     className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submitting || uploadingImage}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
//                   >
//                     {submitting ? 'Submitting...' : 'Submit Prescription'}
//                   </button>
//                 </div>
//               </div>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AppointmentDetails;









































































// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Layout from '@/components/Layout';
// import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
// import apiClient from '../../../api/apiClient';

// const AppointmentDetails = () => {
//   const { state } = useLocation();
//   const { appointment } = state || {};
//   const navigate = useNavigate();
//   const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
//   const [allMedicines, setAllMedicines] = useState([]);
//   const [prescription, setPrescription] = useState({
//     diagnosis: '',
//     notes: '',
//     items: [{ medicine_id: '', dosage: '', frequency: '', duration: '', instructions: '' }],
//     prescriptionImage: null
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   useEffect(() => {
//     if (appointment) {
//       setPrescription(prev => ({ ...prev, diagnosis: appointment.diagnosis || '' }));
//     }
//   }, [appointment]);

//   useEffect(() => {
//     if (showPrescriptionForm && allMedicines.length === 0) {
//       const fetchMedicines = async () => {
//         try {
//           const res = await apiClient.get('/api/pharmacy/medicines');
//           setAllMedicines(res.data);
//         } catch (err) {
//           console.error('Failed to fetch medicines', err);
//           alert('Could not load the medicine list. Please try again.');
//         }
//       };
//       fetchMedicines();
//     }
//   }, [showPrescriptionForm, allMedicines.length]);

//   if (!appointment) {
//     return <div>Appointment not found</div>;
//   }

//   const calculateAge = (dob) => {
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPrescription(prev => ({ ...prev, [name]: value }));
//   };

//   const handleMedicineChange = (index, e) => {
//     const { name, value } = e.target;
//     const newItems = [...prescription.items];
//     newItems[index][name] = value;
//     setPrescription(prev => ({ ...prev, items: newItems }));
//   };

//   const addMedicine = () => {
//     setPrescription(prev => ({
//       ...prev,
//       items: [...prev.items, { medicine_id: '', dosage: '', frequency: '', duration: '', instructions: '' }]
//     }));
//   };

//   const removeMedicine = (index) => {
//     const newItems = [...prescription.items].filter((_, i) => i !== index);
//     setPrescription(prev => ({ ...prev, items: newItems }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please select an image file');
//       return;
//     }

//     setUploadingImage(true);
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await apiClient.post(`/api/prescriptions/upload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       setPrescription(prev => ({ ...prev, prescriptionImage: response.data.imageUrl }));
//     } catch (err) {
//       console.error('Error uploading image:', err);
//       alert('Failed to upload image. Please try again.');
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleSubmitPrescription = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     // --- FIX 1: MORE ROBUST VALIDATION ---
//     const validItems = prescription.items.filter(
//       item => item.medicine_id && item.dosage && item.frequency && item.duration
//     );

//     if (validItems.length === 0) {
//       alert("Please add and completely fill out at least one medicine.");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const prescriptionData = {
//         patient_id: appointment.patient_id._id,
//         doctor_id: appointment.doctor_id._id,
//         diagnosis: prescription.diagnosis,
//         notes: prescription.notes,
//         items: validItems,
//         prescription_image: prescription.prescriptionImage
//       };

//       await apiClient.post(`/api/prescriptions`, prescriptionData);

//       // --- FIX 2: CORRECTED API ROUTE FOR STATUS UPDATE ---
//       await apiClient.put(`/api/appointments/${appointment._id}/status`, {
//         status: 'Completed'
//       });

//       navigate('/dashboard/doctor/appointments', { 
//         state: { message: 'Prescription submitted successfully' } 
//       });
//     } catch (err) {
//       console.error('Error submitting prescription:', err);
//       alert("Failed to submit prescription.");
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Layout sidebarItems={doctorSidebar}>
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//             {/* The rest of your JSX remains the same */}
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-semibold">Appointment Details</h2>
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
//                 >
//                     Back to Appointments
//                 </button>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Patient Information</h3>
//                 <div className="space-y-3">
//                 <p><span className="font-medium">Name:</span> {appointment.patient_id.first_name} {appointment.patient_id.last_name}</p>
//                 <p><span className="font-medium">Gender:</span> {appointment.patient_id.gender}</p>
//                 <p><span className="font-medium">Age:</span> {calculateAge(appointment.patient_id.dob)}</p>
//                 <p><span className="font-medium">Blood Group:</span> {appointment.patient_id.blood_group || 'N/A'}</p>
//                 <p><span className="font-medium">Phone:</span> {appointment.patient_id.phone}</p>
//                 <p><span className="font-medium">Email:</span> {appointment.patient_id.email}</p>
//                 </div>
//             </div>
//             <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
//                 <div className="space-y-3">
//                 <p><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
//                 <p><span className="font-medium">Time:</span> {appointment.time_slot}</p>
//                 <p><span className="font-medium">Type:</span> {appointment.type}</p>
//                 <p><span className="font-medium">Priority:</span> {appointment.priority}</p>
//                 <p><span className="font-medium">Status:</span> 
//                     <span className={`ml-2 ${
//                     appointment.status === 'Completed' ? 'text-green-600' : 
//                     appointment.status === 'Cancelled' ? 'text-red-500' : 'text-blue-600'
//                     }`}>
//                     {appointment.status}
//                     </span>
//                 </p>
//                 <p><span className="font-medium">Notes:</span> {appointment.notes || 'N/A'}</p>
//                 </div>
//             </div>
//             </div>

//             {appointment.status !== 'Completed' && (
//             <div className="flex justify-end">
//                 <button
//                 onClick={() => setShowPrescriptionForm(true)}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
//                 >
//                 Write Prescription
//                 </button>
//             </div>
//             )}

//             {showPrescriptionForm && (
//             <div className="mt-8 bg-gray-50 p-6 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Prescription Form</h3>
//                 <form onSubmit={handleSubmitPrescription}>
//                 <div className="mb-4">
//                     <label className="block font-medium mb-2">Upload Prescription Image</label>
//                     <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="w-full border rounded p-2"
//                     disabled={uploadingImage}
//                     />
//                     {uploadingImage && <p className="text-sm text-blue-600 mt-1">Uploading image...</p>}
//                     {prescription.prescriptionImage && (
//                     <div className="mt-2">
//                         <p className="text-sm text-green-600">Image uploaded successfully!</p>
//                         <img 
//                         src={prescription.prescriptionImage} 
//                         alt="Prescription preview" 
//                         className="mt-2 max-w-xs rounded border"
//                         />
//                     </div>
//                     )}
//                 </div>
//                 <div className="mb-4">
//                     <label className="block font-medium mb-1">Diagnosis</label>
//                     <input
//                     type="text"
//                     name="diagnosis"
//                     value={prescription.diagnosis}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2"
//                     />
//                 </div>
//                 <div className="mb-6">
//                     <label className="block font-medium mb-1">Notes</label>
//                     <textarea
//                     name="notes"
//                     value={prescription.notes}
//                     onChange={handleInputChange}
//                     className="w-full border rounded px-3 py-2"
//                     rows="3"
//                     />
//                 </div>
//                 <h4 className="font-medium mb-3">Medications</h4>
//                 {prescription.items.map((item, index) => (
//                     <div key={index} className="grid grid-cols-12 gap-4 mb-4 p-3 bg-white rounded border">
//                     <div className="col-span-12 sm:col-span-3">
//                         <label className="block text-sm font-medium mb-1">Medicine</label>
//                         <select
//                         name="medicine_id"
//                         value={item.medicine_id}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm"
//                         required
//                         >
//                         <option value="">-- Select Medicine --</option>
//                         {allMedicines.map(med => (
//                             <option key={med._id} value={med._id}>{med.name}</option>
//                         ))}
//                         </select>
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                         <label className="block text-sm font-medium mb-1">Dosage</label>
//                         <input
//                         type="text" name="dosage" value={item.dosage}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                         />
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                         <label className="block text-sm font-medium mb-1">Frequency</label>
//                         <input
//                         type="text" name="frequency" value={item.frequency}
//                         onChange={(e) => handleMedicineChange(index, e)} placeholder="e.g., 1-0-1"
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                         />
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                         <label className="block text-sm font-medium mb-1">Duration</label>
//                         <input
//                         type="text" name="duration" value={item.duration}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm" required
//                         />
//                     </div>
//                     <div className="col-span-6 sm:col-span-2">
//                         <label className="block text-sm font-medium mb-1">Instructions</label>
//                         <input
//                         type="text" name="instructions" value={item.instructions}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm"
//                         />
//                     </div>
//                     <div className="flex items-end col-span-12 sm:col-span-1">
//                         {index > 0 && (
//                         <button type="button" onClick={() => removeMedicine(index)}
//                             className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
//                         >
//                             X
//                         </button>
//                         )}
//                     </div>
//                     </div>
//                 ))}
//                 <div className="flex justify-between mt-4">
//                     <button
//                     type="button"
//                     onClick={addMedicine}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                     + Add Medicine
//                     </button>
//                     <div>
//                     <button
//                         type="button"
//                         onClick={() => setShowPrescriptionForm(false)}
//                         className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting || uploadingImage}
//                         className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
//                     >
//                         {submitting ? 'Submitting...' : 'Submit Prescription'}
//                     </button>
//                     </div>
//                 </div>
//                 </form>
//             </div>
//             )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AppointmentDetails;