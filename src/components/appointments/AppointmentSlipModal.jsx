import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; // Added ReactDOM import
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
    items: [{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    prescriptionImage: null
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPrescription, setSubmittingPrescription] = useState(false);
  const [mounted, setMounted] = useState(false); // Added for portal
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // helper to load prescription from server (cache-busted)
  const loadPrescription = async () => {
    if (!appointmentData || !appointmentData._id) return;
    // Only attempt appointment-specific endpoint if it's known to exist or unknown yet
    if (appointmentEndpointAvailable !== false) {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/prescriptions/appointment/${appointmentData._id}?_=${Date.now()}`
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
      const respAll = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions?_=${Date.now()}`);
      const list = Array.isArray(respAll.data) ? respAll.data : (respAll.data.prescriptions || respAll.data.data || []);
      if (!list || !list.length) {
        setPrescription(null);
        setCandidatePrescriptions([]);
        return;
      }

      const appointmentId = appointmentData._id;
      const appointmentPatientId = appointmentData.patient_id && (appointmentData.patient_id._id || appointmentData.patient_id);
      const patientIdStr = appointmentPatientId ? String(appointmentPatientId) : null;
      const appointmentIdStr = appointmentId ? String(appointmentId) : null;

      // Find prescription linked to this appointment
      let found = list.find(p => {
        const pAppt = p.appointment_id && (p.appointment_id._id || p.appointment_id);
        return pAppt && String(pAppt) === appointmentIdStr;
      });

      if (!found && patientIdStr) {
        // find prescriptions whose patient_id exactly matches appointment patient
        const byPatient = list.filter(p => {
          const pid = p.patient_id && (p.patient_id._id || p.patient_id);
          return pid && String(pid) === patientIdStr;
        });
        if (byPatient.length) {
          // pick most recent by created_at or createdAt
          byPatient.sort((a, b) => {
            const ta = a.created_at ? new Date(a.created_at).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const tb = b.created_at ? new Date(b.created_at).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return tb - ta;
          });
          found = byPatient[0];
        }
        // keep full patient-matching list for attach UI
        setCandidatePrescriptions(byPatient);
      } else {
        setCandidatePrescriptions([]);
      }

      setPrescription(found || null);
    } catch (errAll) {
      console.debug('Generic prescriptions list fetch failed:', errAll?.response?.status || errAll.message);
      setPrescription(null);
      setCandidatePrescriptions([]);
    }
  };

  useEffect(() => {
    if (isOpen && appointmentData) {
      // reset upload form visibility and form when modal opens
      setShowUploadForm(false);
      setPrescriptionForm({
        diagnosis: '',
        notes: '',
        items: [{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        prescriptionImage: null
      });
      loadPrescription();
      const fetchBillingDetails = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/billing/appointment/${appointmentData._id}`
          );
          console.log(response.data);
          setBillingDetails(response.data.bill);
        } catch (error) {
          console.error('Error fetching billing details:', error);
          setBillingDetails(null);
        }
      };

      if (appointmentData.doctor_id && typeof appointmentData.doctor_id === 'object') {
        setDoctorDetails(appointmentData.doctor_id);
      } else if (appointmentData.doctor_id) {
        // If doctor_id is just an ID string, we might want to fetch details (optional, 
        // but good practice if education not included in appointment lookups)
        // For now, assume appointmentData often has populated doctor_id 
        // or we rely on what's available.
      } else {
        // Try fetching appointment details again if needed, similar to CompletionSlip
        // But here we might just rely on props or existing fetches.
        // Let's add a small fetch if we really need it, or rely on what we have.
        // The user provided snippets show we can fetch appt details.
        const fetchApptDetails = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentData._id}`);
            if (res.data && res.data.doctor_id && typeof res.data.doctor_id === 'object') {
              setDoctorDetails(res.data.doctor_id);
            }
          } catch (e) { console.error(e); }
        };
        fetchApptDetails();
      }

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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/upload`, formData, {
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
    setPrescriptionForm(prev => ({ ...prev, items: [...prev.items, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }] }));
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

      const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prescriptions`, payload);
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
      const resp = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/prescriptions/${prescriptionId}`, {
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

  // Don't render anything if not mounted, not open, or no appointment data
  if (!mounted || !isOpen || !appointmentData) return null;

  // derive display values for patient, doctor and department with fallbacks
  const patientObj = appointmentData.patient_id || {};
  const billingPatient = billingDetails && billingDetails.patient_id ? billingDetails.patient_id : null;
  const patientNameDisplay = appointmentData.patientName ||
    (patientObj && (patientObj.first_name || patientObj.firstName || patientObj.name)
      ? `${patientObj.first_name || patientObj.firstName || patientObj.name} ${patientObj.last_name || patientObj.lastName || ''}`.trim()
      : (billingPatient ? `${billingPatient.first_name || billingPatient.firstName || billingPatient.name || ''} ${billingPatient.last_name || billingPatient.lastName || ''}`.trim() : 'N/A'));

  const patientIdDisplay = appointmentData.patientId ||
    (patientObj && (patientObj.patientID || patientObj.patientId || patientObj._id) ? (patientObj.patientID || patientObj.patientId || (typeof patientObj._id === 'string' ? patientObj._id : (patientObj._id && patientObj._id._id) || '')) : (billingPatient ? (billingPatient.patientID || billingPatient.patientId || billingPatient._id || '') : '')) || 'N/A';

  const doctorObj = appointmentData.doctor_id || {};
  const billingDoctor = billingDetails && billingDetails.doctor_id ? billingDetails.doctor_id : null;
  const doctorNameDisplay = appointmentData.doctorName ||
    (doctorObj && (doctorObj.firstName || doctorObj.first_name || doctorObj.name)
      ? `${doctorObj.firstName || doctorObj.first_name || doctorObj.name} ${doctorObj.lastName || doctorObj.last_name || ''}`.trim()
      : (billingDoctor ? `${billingDoctor.firstName || billingDoctor.first_name || billingDoctor.name || ''} ${billingDoctor.lastName || billingDoctor.last_name || ''}`.trim() : 'N/A'));

  const deptObj = appointmentData.department_id || {};
  const billingDept = billingDetails && billingDetails.department_id ? billingDetails.department_id : null;
  const departmentNameDisplay = appointmentData.departmentName || deptObj.name || deptObj.department || (billingDept ? (billingDept.name || billingDept.department) : 'N/A') || 'N/A';

  const getDoctorEducation = () => {
    return doctorDetails?.education || '';
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive a user-friendly appointment date & time display from multiple possible fields
  const getAppointmentDateTimeDisplay = () => {
    if (!appointmentData) return 'N/A';

    // Prefer explicit ISO start_time / startTime / start (calendar resource)
    const possibleStarts = [appointmentData.start_time, appointmentData.startTime, appointmentData.start];
    for (const s of possibleStarts) {
      if (!s) continue;
      const d = new Date(s);
      // FIX: Added timeZone: 'UTC' to prevent conversion to local time (IST)
      if (!isNaN(d)) {
        return d.toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC'
        });
      }
    }

    // If we have an appointment_date (YYYY-MM-DD or ISO) and a time string
    const apptDateRaw = appointmentData.appointment_date || appointmentData.date;
    const timeRaw = appointmentData.time || appointmentData.start_time_local || appointmentData.time_slot;

    if (apptDateRaw) {
      // parse as local date (avoid timezone shift)
      let dateObj;
      try {
        if (typeof apptDateRaw === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(apptDateRaw)) {
          dateObj = new Date(apptDateRaw + 'T00:00:00');
        } else {
          dateObj = new Date(apptDateRaw);
        }
      } catch (e) {
        dateObj = null;
      }

      // FIX: Ensure date string uses UTC logic if dateObj was created from UTC string, 
      // but usually the manual parsing above handles local time correctly. 
      // We keep the existing logic here but ensure locale is consistent.
      const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString('en-IN', { dateStyle: 'medium' }) : String(apptDateRaw);

      // Normalize time: handle "HH:MM - HH:MM" strings, or object shapes
      let timeStr = '';
      if (timeRaw) {
        if (typeof timeRaw === 'string') {
          // if a range like '08:30 - 09:00'
          if (timeRaw.includes('-')) {
            timeStr = timeRaw.split('-')[0].trim();
          } else {
            timeStr = timeRaw;
          }
        } else if (typeof timeRaw === 'object') {
          timeStr = timeRaw.start_time || timeRaw.start || '';
        }

        // If timeStr looks like HH:MM, convert to localized short time
        if (/^\d{1,2}:\d{2}/.test(timeStr)) {
          const [hh, mm] = timeStr.split(':');
          const tmp = new Date();
          tmp.setHours(parseInt(hh, 10));
          tmp.setMinutes(parseInt(mm, 10));
          timeStr = tmp.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
        }
      }

      return timeStr ? `${dateStr}, ${timeStr}` : `${dateStr}`;
    }

    // Fallback to billing appointment date if present
    if (billingDetails?.appointment_id?.appointment_date) {
      const d = new Date(billingDetails.appointment_id.appointment_date);
      // FIX: Added timeZone: 'UTC' here as well just in case
      if (!isNaN(d)) return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
      return String(billingDetails.appointment_id.appointment_date);
    }

    return 'N/A';
  };

  // Use React Portal to render directly to document body
  return ReactDOM.createPortal(
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          /* hide everything first, reveal only printable slip */
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

          /* keep header in normal flow so content flows below it */
          .slip-header {
            position: static;
            display: block;
            background: white;
            z-index: 10000;
            padding: 0;
            margin: 0 0 6mm 0;
           
          }

          .header-flex {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }

          /* Make the printable area A4 width and reduce overall font-size slightly */
          .printable-slip { 
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            margin: 0 auto;
            padding: 10mm; /* Reduced padding */
            background: white;
            font-size: 11pt;
            box-sizing: border-box;
            box-shadow: none;
          }
           
          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Limit images so they don't push content to next page (smaller for print) */
          .printable-slip img { max-height: 60mm; width: auto; max-width: 100%; object-fit: contain; display: block; }
          
          /* Hide instructions in print */
          .printable-slip .important-instructions { display: none !important; }

          .no-print { 
            display: none !important; 
          }

          .slip-section {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #bbb;
          }
          .slip-footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #999;
            font-size: 10pt;
          }
          /* Custom Table Styles for Print */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 4px 6px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f3f4f6 !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10pt;
          }
           td {
            font-size: 11pt;
          }
        }

        /* Screen styles - UPDATED for portal */
        @media screen {
          .printable-slip-container {
            position: fixed; /* Changed from absolute to fixed */
            inset: 0;
            z-index: 9999; /* Very high z-index to be on top of everything */
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            padding: 20px;
            overflow-y: auto;
          }
          .printable-slip {
            position: relative; /* Enabled for absolute close button */
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 800px; /* Increased max-width for better preview */
            max-height: 90vh;
            overflow-y: auto;
            z-index: 10000;
            padding: 24px;
            margin: 40px;
          }
        }
      `}</style>

      <div className="printable-slip-container">
        <div className="printable-slip">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 no-print p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="slip-header mb-2 pb-4 border-b-4 border-double border-gray-800 ">
            <div className="header-flex flex items-center justify-between">
              {/* Left: Logo */}
              <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center">
                {hospitalInfo?.logo ? (
                  <img src={hospitalInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <img src="/hospital-icon.jpg" alt="Logo" className="max-w-full max-h-full object-contain" />
                )}
              </div>

              {/* Center: Hospital Details */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  {hospitalInfo?.hospitalName || 'HOSPITAL NAME HERE'}
                </h1>
                <div className="mt-1 text-sm text-gray-700 font-medium">
                  <p>{hospitalInfo?.address || '123 Medical Lane, Health City, State, 123456'}</p>
                  <p className="mt-0.5">
                    <span className="font-bold">Phone:</span> {hospitalInfo?.contact || '9876543210'}
                    {hospitalInfo?.email && <span> <br /> Email: {hospitalInfo.email}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-gray-800 uppercase">Registration Cum Appointment Slip</h2>
          </div>

          {/* Appointment Details */}
          <div className="slip-section">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-5">APPOINTMENT DETAILS</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Slip No:</span>{' '}
                <span className="font-semibold">
                  #{appointmentData._id?.slice(-8).toUpperCase() || billingDetails?.bill_id?.slice(-8).toUpperCase() || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Date:</span>{' '}
                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
              </div>

              {/* Patient Name - Checks appointmentData first, then billingDetails */}
              <div>
                <span className="text-gray-600 font-medium">Patient Name:</span>{' '}
                <strong className="text-blue-800">{patientNameDisplay}</strong>
              </div>

              {/* Patient ID */}
              <div>
                <span className="text-gray-600 font-medium">Patient ID:</span>{' '}
                <strong>{patientIdDisplay}</strong>
              </div>

              {/* Appointment Type */}
              <div>
                <span className="text-gray-600 font-medium">Appointment Type:</span>{' '}
                <strong>
                  {appointmentData.type || billingDetails?.appointment_id?.appointment_type || 'Consultation'}
                </strong>
              </div>

              {/* Department */}
              <div>
                <span className="text-gray-600 font-medium">Department:</span>{' '}
                <strong>{departmentNameDisplay}</strong>
              </div>

              {/* Doctor Name */}
              <div>
                <span className="text-gray-600 font-medium">Doctor:</span>{' '}
                <strong className="text-green-700">{doctorNameDisplay}</strong>
                {getDoctorEducation() && <span className="text-sm text-green-700 font-semibold ml-1">{getDoctorEducation()}</span>}
              </div>

              <div>
                <span className="text-gray-600 font-medium">Status:</span>{' '}
                <span className="font-semibold">
                  {appointmentData.status || billingDetails?.status || 'Scheduled'}
                </span>
              </div>

              {/* Date & Time Logic - Falls back to formatting the ISO string from billingDetails if appointmentData is empty */}
              <div className="col-span-2">
                <span className="text-gray-600 font-medium">Appointment Date & Time:</span>{' '}
                <strong className="text-red-600">{getAppointmentDateTimeDisplay()}</strong>
              </div>
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
              <h4 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1 mt-5">BILLING DETAILS</h4>
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
                <div className="grid grid-cols-5 gap-2 font-bold pt-2 mt-2">
                  <div className="col-span-4 text-right">Total Amount:</div>
                  <div>₹{billingDetails.total_amount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Method:</div>
                  <div className="font-medium">{billingDetails.payment_method || 'Cash'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Status:</div>
                  <div className={`font-medium ${billingDetails.status === 'Paid' ? 'text-green-600' :
                    billingDetails.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {billingDetails.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Section (commented out) */}
          {/* <div className="slip-section mt-4">
            ... prescription content ...
          </div> */}

          {/* Instructions */}
          <div className="slip-section mt-6 important-instructions">
            <h4 className="text-md font-semibold text-gray-800 mb-2">IMPORTANT INSTRUCTIONS</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>Please arrive 15 minutes before your appointment time — कृपया अपनी अपॉइंटमेंट के समय से 15 मिनट पहले पहुँचें।</li>
              <li>Bring this slip and your ID proof for verification — सत्यापन के लिए यह स्लिप और अपना पहचान पत्र साथ लाएँ।</li>
              <li>Carry all previous medical reports and prescriptions — अपनी सभी पिछली मेडिकल रिपोर्ट्स और प्रिस्क्रिप्शन साथ लाएँ।</li>
              <li>In case of cancellation, please inform 24 hours in advance — रद्द करने की स्थिति में कृपया 24 घंटे पहले सूचित करें।</li>
              <li>Late arrivals may need to reschedule — देर से आने पर आपको अपॉइंटमेंट पुनः निर्धारित करनी पड़ सकती है।</li>
            </ul>
          </div>


          {/* Footer */}
          <div className="slip-footer text-center">
            <p className="text-xs text-gray-400 mt-4">
              {hospitalInfo?.website ? `Website: ${hospitalInfo.website} • ` : ''}
              Emergency: {hospitalInfo?.contact || 'XXXX-XXXXXX'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you for choosing {hospitalInfo?.hospitalName || 'our hospital'}. We wish you good health!
            </p>
            <p className="text-xs text-gray-500 mt-2">** This is computer generated slip - no signature required **</p>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex justify-end space-x-3 no-print mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            >
              Print Slip
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body // Render directly to body, outside any parent modals
  );
};

export default AppointmentSlipModal;