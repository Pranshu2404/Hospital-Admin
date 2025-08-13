// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '@/components/Layout';
// import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';

// const AppointmentDetails = () => {
//   const { state } = useLocation();
//   const { appointment } = state || {};
//   const navigate = useNavigate();
//   const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
//   const [prescription, setPrescription] = useState({
//     diagnosis: appointment.diagnosis || '',
//     notes: '',
//     items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }]
//   });
//   const [submitting, setSubmitting] = useState(false);

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
//       items: [...prev.items, { medicine_name: '', dosage: '', duration: '', instructions: '' }]
//     }));
//   };

//   const removeMedicine = (index) => {
//     const newItems = [...prescription.items];
//     newItems.splice(index, 1);
//     setPrescription(prev => ({ ...prev, items: newItems }));
//   };

//   const handleSubmitPrescription = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
    
//     try {
//       // Create prescription
//       const prescriptionData = {
//         patient_id: appointment.patient_id._id,
//         doctor_id: appointment.doctor_id,
//         diagnosis: prescription.diagnosis,
//         notes: prescription.notes,
//         items: prescription.items
//       };

//       await axios.post('/api/prescriptions', prescriptionData);
      
//       // Update appointment status to completed
//       await axios.patch(`/api/appointments/${appointment._id}`, {
//         status: 'Completed'
//       });

//       navigate('/doctor/appointments', { 
//         state: { message: 'Prescription submitted successfully' } 
//       });
//     } catch (err) {
//       console.error('Error submitting prescription:', err);
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Layout sidebarItems={doctorSidebar}>
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white p-6 rounded-xl shadow-md">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-semibold">Appointment Details</h2>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
//           >
//             Back to Appointments
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-medium mb-4">Patient Information</h3>
//             <div className="space-y-3">
//               <p><span className="font-medium">Name:</span> {appointment.patient_id.first_name} {appointment.patient_id.last_name}</p>
//               <p><span className="font-medium">Gender:</span> {appointment.patient_id.gender}</p>
//               <p><span className="font-medium">Age:</span> {calculateAge(appointment.patient_id.dob)}</p>
//               <p><span className="font-medium">Blood Group:</span> {appointment.patient_id.blood_group || 'N/A'}</p>
//               <p><span className="font-medium">Phone:</span> {appointment.patient_id.phone}</p>
//               <p><span className="font-medium">Email:</span> {appointment.patient_id.email}</p>
//             </div>
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
//             <div className="space-y-3">
//               <p><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
//               <p><span className="font-medium">Time:</span> {appointment.time_slot}</p>
//               <p><span className="font-medium">Type:</span> {appointment.type}</p>
//               <p><span className="font-medium">Priority:</span> {appointment.priority}</p>
//               <p><span className="font-medium">Status:</span> 
//                 <span className={`ml-2 ${
//                   appointment.status === 'Completed' ? 'text-green-600' : 
//                   appointment.status === 'Cancelled' ? 'text-red-500' : 'text-blue-600'
//                 }`}>
//                   {appointment.status}
//                 </span>
//               </p>
//               <p><span className="font-medium">Notes:</span> {appointment.notes || 'N/A'}</p>
//             </div>
//           </div>
//         </div>

//         {appointment.status !== 'Completed' && (
//           <div className="flex justify-end">
//             <button
//               onClick={() => setShowPrescriptionForm(true)}
//               className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
//             >
//               Write Prescription
//             </button>
//           </div>
//         )}

//         {showPrescriptionForm && (
//           <div className="mt-8 bg-gray-50 p-6 rounded-lg">
//             <h3 className="text-lg font-medium mb-4">Prescription Form</h3>
//             <form onSubmit={handleSubmitPrescription}>
//               <div className="mb-4">
//                 <label className="block font-medium mb-1">Diagnosis</label>
//                 <input
//                   type="text"
//                   name="diagnosis"
//                   value={prescription.diagnosis}
//                   onChange={handleInputChange}
//                   className="w-full border rounded px-3 py-2"
//                   required
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

//               <h4 className="font-medium mb-3">Medications</h4>
//               {prescription.items.map((item, index) => (
//                 <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded border">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Medicine Name</label>
//                     <input
//                       type="text"
//                       name="medicine_name"
//                       value={item.medicine_name}
//                       onChange={(e) => handleMedicineChange(index, e)}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Dosage</label>
//                     <input
//                       type="text"
//                       name="dosage"
//                       value={item.dosage}
//                       onChange={(e) => handleMedicineChange(index, e)}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Duration</label>
//                     <input
//                       type="text"
//                       name="duration"
//                       value={item.duration}
//                       onChange={(e) => handleMedicineChange(index, e)}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                       required
//                     />
//                   </div>
//                   <div className="flex items-end">
//                     <div className="flex-1">
//                       <label className="block text-sm font-medium mb-1">Instructions</label>
//                       <input
//                         type="text"
//                         name="instructions"
//                         value={item.instructions}
//                         onChange={(e) => handleMedicineChange(index, e)}
//                         className="w-full border rounded px-2 py-1 text-sm"
//                       />
//                     </div>
//                     {index > 0 && (
//                       <button
//                         type="button"
//                         onClick={() => removeMedicine(index)}
//                         className="ml-2 bg-red-500 text-white p-1 rounded text-sm"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               <div className="flex justify-between mt-4">
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
//                     disabled={submitting}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
//                   >
//                     {submitting ? 'Submitting...' : 'Submit Prescription'}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//     </Layout>
//   );
// };

// export default AppointmentDetails;































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
    items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }]
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const backendUrl = 'http://localhost:5000';

    try {
      // Correctly send the doctor's ID
      const prescriptionData = {
        patient_id: appointment.patient_id._id,
        doctor_id: appointment.doctor_id._id, // Corrected line
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        items: prescription.items
      };

      await axios.post(`${backendUrl}/api/prescriptions`, prescriptionData);
      
      await axios.patch(`${backendUrl}/api/appointments/${appointment._id}`, {
        status: 'Completed'
      });

      navigate('/doctor/appointments', { 
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
                <label className="block font-medium mb-1">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={prescription.diagnosis}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
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
                      required
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
                      required
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
                      required
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