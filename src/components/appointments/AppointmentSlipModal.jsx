import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, EditIcon, DeleteIcon, ViewIcon } from '../common/Icons';
import ChoosePatientTypeModal2 from '../patients/ChoosePatientTypeModal2';
import { useLocation } from 'react-router-dom';

// cache whether backend supports the appointment-specific prescription endpoint
// set to false to avoid calling an endpoint that many backends don't provide (prevents 404 noise)
let appointmentEndpointAvailable = false; // null = unknown, false = not available, true = available

const AppointmentSlipModal = ({ isOpen, onClose, appointmentData, hospitalInfo }) => {
  const [billingDetails, setBillingDetails] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [candidatePrescriptions, setCandidatePrescriptions] = useState([]);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    notes: '',
    items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }],
    prescriptionImage: null
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPrescription, setSubmittingPrescription] = useState(false);
  
  // helper to load prescription from server (cache-busted)
  const loadPrescription = async () => {
    if (!appointmentData || !appointmentData._id) return;
    // Only attempt appointment-specific endpoint if it's known to exist or unknown yet
    if (appointmentEndpointAvailable !== false) {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/prescriptions/appointment/${appointmentData._id}?_=${Date.now()}`
        );
        appointmentEndpointAvailable = true;
        const pres = resp.data.prescription || resp.data || null;
        console.log('Loaded prescription from appointment-specific endpoint:', pres);
        if (pres) {
          setPrescription(pres);
          return;
        }
      } catch (err) {
        // if server responds 404, mark endpoint as unavailable to avoid future calls
        const status = err?.response?.status;
        if (status === 404) {
          appointmentEndpointAvailable = false;
          console.debug('Appointment prescription endpoint returned 404, will use fallback lookup.');
        } else {
          console.debug('Error calling appointment prescription endpoint:', status || err.message);
        }
      }
    }

    // Fallback: fetch all prescriptions and try to find one matching appointment_id or patient_id
    try {
      // const respAll = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions?_=${Date.now()}`);
      // const list = Array.isArray(respAll.data) ? respAll.data : (respAll.data.prescriptions || []);
      // if (!list || !list.length) {
      //   setPrescription(null);
      //   return;
      // }

      // const appointmentId = appointmentData._id;
      // const patientId = appointmentData.patient_id && appointmentData.patient_id._id ? appointmentData.patient_id._id : appointmentData.patient_id;

      // // Prefer exact appointment match OR exact patient match
      // const normalizeId = (x) => (x && (x._id || x)) ? String(x._id || x) : null;
      // const appointmentIdStr = String(appointmentId);
      // const appointmentPatientId = appointmentData.patient_id && (appointmentData.patient_id._id || appointmentData.patient_id);
      // const patientIdStr = appointmentPatientId ? String(appointmentPatientId) : null;

      // // Find prescription linked to this appointment
      // let found = list.find(p => {
      //   const pAppt = p.appointment_id && (p.appointment_id._id || p.appointment_id);
      //   return pAppt && String(pAppt) === appointmentIdStr;
      // });

      // if (!found && patientIdStr) {
      //   // find prescriptions whose patient_id exactly matches appointment patient
      //   const byPatient = list.filter(p => {
      //     const pid = p.patient_id && (p.patient_id._id || p.patient_id);
      //     return pid && String(pid) === patientIdStr;
      //   });
      //   if (byPatient.length) {
      //     // pick most recent by created_at
      //     byPatient.sort((a,b) => {
      //       const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      //       const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      //       return tb - ta;
      //     });
      //     found = byPatient[0];
      //   }
      //   // keep full patient-matching list for attach UI
      //   setCandidatePrescriptions(byPatient);
      // } else {
      //   setCandidatePrescriptions([]);
      // }

      // setPrescription(found || null);
      return;
    } catch (errAll) {
      console.debug('Generic prescriptions list fetch failed:', errAll?.response?.status || errAll.message);
      setPrescription(null);
    }
  };
  
  useEffect(() => {
    if (isOpen && appointmentData) {
      // reset upload form visibility and form when modal opens
      setShowUploadForm(false);
      setPrescriptionForm({
        diagnosis: '',
        notes: '',
        items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }],
        prescriptionImage: null
      });
      loadPrescription();
  const fetchBillingDetails = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/billing/appointment/${appointmentData._id}`
          );
          console.log(response.data);
          setBillingDetails(response.data.bill);
        } catch (error) {
          console.error('Error fetching billing details:', error);
          setBillingDetails(null);
        }
      };
      
  fetchBillingDetails();
    }
  }, [isOpen, appointmentData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrescriptionForm(prev => ({ ...prev, prescriptionImage: response.data.imageUrl || response.data.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePrescriptionInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...prescriptionForm.items];
    newItems[index][name] = value;
    setPrescriptionForm(prev => ({ ...prev, items: newItems }));
  };

  const addMedicine = () => {
    setPrescriptionForm(prev => ({ ...prev, items: [...prev.items, { medicine_name: '', dosage: '', duration: '', instructions: '' }] }));
  };

  const removeMedicine = (index) => {
    const newItems = [...prescriptionForm.items];
    newItems.splice(index, 1);
    setPrescriptionForm(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmittingPrescription(true);
    try {
      const patientId = appointmentData.patient_id && appointmentData.patient_id._id ? appointmentData.patient_id._id : appointmentData.patient_id;
      const doctorId = appointmentData.doctor_id && appointmentData.doctor_id._id ? appointmentData.doctor_id._id : appointmentData.doctor_id;

      const payload = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: appointmentData._id,
        diagnosis: prescriptionForm.diagnosis,
        notes: prescriptionForm.notes,
        items: prescriptionForm.items,
        prescription_image: prescriptionForm.prescriptionImage
      };

      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions`, payload);
      // set prescription immediately from response if present
      const newPrescription = resp.data.prescription || resp.data || null;
      if (newPrescription) {
        setPrescription(newPrescription);
      } else {
        // fallback: reload from server (cache-busted)
        await loadPrescription();
      }
      setShowUploadForm(false);
      // reset form
      setPrescriptionForm({
        diagnosis: '',
        notes: '',
        items: [{ medicine_name: '', dosage: '', duration: '', instructions: '' }],
        prescriptionImage: null
      });
      // Optionally you could update appointment status here if desired
    } catch (err) {
      console.error('Error submitting prescription:', err);
      alert('Failed to save prescription. Please try again.');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  const attachPrescriptionToAppointment = async (prescriptionId) => {
    if (!prescriptionId || !appointmentData || !appointmentData._id) return;
    try {
      // PATCH the prescription to include appointment_id
      const resp = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/prescriptions/${prescriptionId}`, {
        appointment_id: appointmentData._id
      });
      // reload prescription from server
      await loadPrescription();
      alert('Prescription attached to appointment');
    } catch (err) {
      console.error('Failed to attach prescription:', err);
      alert('Failed to attach prescription.');
    }
  };

  if (!isOpen || !appointmentData) return null;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body * { 
            visibility: hidden; 
          }
          .printable-slip-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            background: white;
          }
          .printable-slip, .printable-slip * { 
            visibility: visible; 
          }
          .printable-slip { 
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            margin: 0 auto;
            padding: 15mm;
            background: white;
            font-size: 12pt;
            box-shadow: none;
          }
          .no-print { 
            display: none !important; 
          }
          .slip-header {
            border-bottom: 2px dashed #ccc;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .slip-section {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #eee;
          }
          .slip-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #ccc;
            font-size: 10pt;
          }
        }

        /* Screen styles */
        @media screen {
          .printable-slip-container {
            position: fixed;
            inset: 0;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            padding: 20px;
            overflow-y: auto;
          }
          .printable-slip {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
          }
        }
      `}</style>

      <div className="printable-slip-container no-print">
        <div className="printable-slip">
          {/* Header */}
          <div className="text-center slip-header">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">APPOINTMENT SLIP</h2>
            <h3 className="text-xl font-semibold text-blue-800">{hospitalInfo?.name || 'MEDICAL CENTER'}</h3>
            <p className="text-sm text-gray-600 mt-1">{hospitalInfo?.address || 'Hospital Address'}</p>
            <p className="text-sm text-gray-600">
              {hospitalInfo?.phone ? `Tel: ${hospitalInfo.phone} • ` : ''}
              {hospitalInfo?.email || ''}
            </p>
          </div>

          {/* Appointment Details */}
          <div className="slip-section">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">APPOINTMENT DETAILS</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-600 font-medium">Slip No:</span> <span className="font-semibold">#{appointmentData._id?.slice(-8).toUpperCase() || 'N/A'}</span></div>
              <div><span className="text-gray-600 font-medium">Date:</span> <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
              
              <div><span className="text-gray-600 font-medium">Patient Name:</span> <strong className="text-blue-800">{appointmentData.patientName}</strong></div>
              <div><span className="text-gray-600 font-medium">Patient ID:</span> <strong>{appointmentData.patientId || 'N/A'}</strong></div>
              
              <div><span className="text-gray-600 font-medium">Appointment Type:</span> <strong>{appointmentData.type || 'Consultation'}</strong></div>
              <div><span className="text-gray-600 font-medium">Department:</span> <strong>{appointmentData.departmentName}</strong></div>
              
              <div><span className="text-gray-600 font-medium">Doctor:</span> <strong className="text-green-700">{appointmentData.doctorName}</strong></div>
              <div><span className="text-gray-600 font-medium">Status:</span> <span className="font-semibold">{appointmentData.status}</span></div>
              {appointmentData.type === "time-based" && (
                <div className="col-span-2">
                  <span className="text-gray-600 font-medium">Appointment Date & Time:</span>{' '}
                  <strong className="text-red-600">{appointmentData.date}, {appointmentData.time}</strong>
                </div>
              )}
              {appointmentData.type === "number-based" && (
                <div className="col-span-2">
                  <span className="text-gray-600 font-medium">Appointment Number:</span>{' '}
                  <strong className="text-red-600">{appointmentData.serial_number}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Billing Details */}
          {billingDetails && billingDetails.details && billingDetails.details.length > 0 && (
            <div className="slip-section">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">BILLING DETAILS</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-5 gap-2 font-medium text-gray-700">
                  <div className="col-span-3">Description</div>
                  <div>Qty</div>
                  <div>Amount</div>
                </div>
                {billingDetails.details.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 border-b pb-1">
                    <div className="col-span-3">{item.description || 'Consultation Fee'}</div>
                    <div>{item.quantity || 1}</div>
                    <div>₹{item.amount?.toFixed(2) || '0.00'}</div>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-2 font-bold border-t pt-2 mt-2">
                  <div className="col-span-4 text-right">Total Amount:</div>
                  <div>₹{billingDetails.total_amount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Method:</div>
                  <div className="font-medium">{billingDetails.payment_method || 'Cash'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Status:</div>
                  <div className={`font-medium ${
                    billingDetails.status === 'Paid' ? 'text-green-600' : 
                    billingDetails.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {billingDetails.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Section */}
          <div className="slip-section mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">PRESCRIPTION</h4>

            {prescription ? (
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-600 font-medium">Diagnosis:</span> <strong>{prescription.diagnosis || 'N/A'}</strong></div>
                <div><span className="text-gray-600 font-medium">Notes:</span> <span>{prescription.notes || 'N/A'}</span></div>
                <div>
                  <span className="text-gray-600 font-medium">Medications:</span>
                  <div className="mt-2 space-y-2">
                    {prescription.items && prescription.items.length > 0 ? prescription.items.map((it, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded border">
                        <div className="text-sm font-medium">{it.medicine_name || 'Medicine'}</div>
                        <div className="text-xs text-gray-600">{it.dosage} • {it.duration} • {it.instructions}</div>
                      </div>
                    )) : <div className="text-sm text-gray-500">No medication items</div>}
                  </div>
                </div>
                {prescription.prescription_image && (
                  <div>
                    <span className="text-gray-600 font-medium">Prescription Image:</span>
                    <div className="mt-2">
                      <img src={prescription.prescription_image} alt="Prescription" className="max-w-full rounded border" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>No prescription uploaded for this appointment.</p>
                {/* if we found prescriptions for the same patient, offer to attach one */}
                {candidatePrescriptions && candidatePrescriptions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700">Found {candidatePrescriptions.length} prescription(s) for this patient. Attach one to this appointment:</p>
                    <div className="mt-2 space-y-2">
                      {candidatePrescriptions.map(cp => (
                        <div key={cp._id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="text-sm">
                            <div className="font-medium">{cp.diagnosis || 'Prescription'}</div>
                            <div className="text-xs text-gray-600">{new Date(cp.created_at || cp.createdAt).toLocaleString()}</div>
                          </div>
                          <div>
                            <button onClick={() => attachPrescriptionToAppointment(cp._id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Attach</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!showUploadForm && (
                  <div className="mt-3">
                    <button onClick={() => setShowUploadForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Add Prescription</button>
                  </div>
                )}

                {showUploadForm && (
                  <form onSubmit={handleSubmitPrescription} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium">Diagnosis</label>
                      <input name="diagnosis" value={prescriptionForm.diagnosis} onChange={handlePrescriptionInputChange} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Notes</label>
                      <textarea name="notes" value={prescriptionForm.notes} onChange={handlePrescriptionInputChange} className="w-full border rounded px-2 py-1" rows={2} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Upload Image</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
                      {uploadingImage && <p className="text-xs text-blue-600">Uploading image...</p>}
                      {prescriptionForm.prescriptionImage && (
                        <img src={prescriptionForm.prescriptionImage} alt="Preview" className="mt-2 max-w-xs rounded border" />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Medications</label>
                      <div className="space-y-2 mt-2">
                        {prescriptionForm.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-white rounded border">
                            <input name="medicine_name" placeholder="Medicine" value={item.medicine_name} onChange={(e) => handleMedicineChange(idx, e)} className="border rounded px-2 py-1" />
                            <input name="dosage" placeholder="Dosage" value={item.dosage} onChange={(e) => handleMedicineChange(idx, e)} className="border rounded px-2 py-1" />
                            <input name="duration" placeholder="Duration" value={item.duration} onChange={(e) => handleMedicineChange(idx, e)} className="border rounded px-2 py-1" />
                            <div className="flex items-center">
                              <input name="instructions" placeholder="Instructions" value={item.instructions} onChange={(e) => handleMedicineChange(idx, e)} className="border rounded px-2 py-1 flex-1" />
                              {idx > 0 && <button type="button" onClick={() => removeMedicine(idx)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Remove</button>}
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={addMedicine} className="mt-2 px-3 py-1 bg-green-600 text-white rounded">+ Add Medicine</button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={() => setShowUploadForm(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                      <button type="submit" disabled={submittingPrescription} className="px-3 py-1 bg-blue-600 text-white rounded">{submittingPrescription ? 'Saving...' : 'Save Prescription'}</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="slip-section mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">IMPORTANT INSTRUCTIONS</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring this slip and your ID proof for verification</li>
              <li>Carry all previous medical reports and prescriptions</li>
              <li>In case of cancellation, please inform 24 hours in advance</li>
              <li>Late arrivals may need to reschedule</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="slip-footer text-center">
            <p className="text-xs text-gray-500 mb-2">** This is computer generated slip - no signature required **</p>
            <p className="text-xs text-gray-400">
              {hospitalInfo?.website ? `Website: ${hospitalInfo.website} • ` : ''}
              Emergency: {hospitalInfo?.emergency_phone || 'XXXX-XXXXXX'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you for choosing {hospitalInfo?.name || 'our hospital'}. We wish you good health!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t flex justify-end space-x-3 no-print mt-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
            <button 
              onClick={handlePrint} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Print Slip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentSlipModal;