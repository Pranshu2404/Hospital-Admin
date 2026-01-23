import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Helper function to format stored UTC time to local display
const formatStoredTime = (utcTimeString) => {
    if (!utcTimeString) return 'N/A';
    
    try {
        // Parse the ISO string
        const date = new Date(utcTimeString);
        
        // Get the UTC hours/minutes
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        
        // Create a new date with these hours/minutes in local timezone
        const displayDate = new Date();
        displayDate.setHours(hours, minutes, 0, 0);
        
        return displayDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

// Helper function to format date
const formatStoredDate = (utcDateString) => {
    if (!utcDateString) return 'N/A';
    
    try {
        const date = new Date(utcDateString);
        // Use UTC components to avoid timezone conversion
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth(); // 0-indexed
        const day = date.getUTCDate();
        
        // Create a local date with UTC components
        const localDate = new Date(year, month, day);
        
        return localDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

const AppointmentCompletionSlipModal = ({ isOpen, onClose, appointmentData, hospitalInfo }) => {
    const [prescription, setPrescription] = useState(null);
    const [vitals, setVitals] = useState(null);

    useEffect(() => {
        if (isOpen && appointmentData) {
            const fetchData = async () => {
                try {
                    // 1. Fetch Full Appointment Details to get Vitals
                    try {
                        const apptResp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentData._id}`);
                        if (apptResp.data && apptResp.data.vitals) {
                            setVitals(apptResp.data.vitals);
                        } else {
                            setVitals(null);
                        }
                    } catch (e) {
                        console.error("Error fetching appointment details for vitals:", e);
                        // Fallback: see if vitals are already in appointmentData passed props
                        if (appointmentData.vitals) {
                            setVitals(appointmentData.vitals);
                        }
                    }

                    // 2. Fetch Prescription
                    let presData = null;
                    try {
                        // Try fetching by appointment ID first
                        const presResp = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/prescriptions/appointment/${appointmentData._id}`
                        );
                        if (presResp.data && (presResp.data.prescription || presResp.data)) {
                            presData = presResp.data.prescription || presResp.data;
                        }
                    } catch (e) {
                        console.log("No direct prescription found for appointment, trying fallback...", e);
                    }

                    if (!presData) {
                        // Fallback: Fetch all and filter
                        try {
                            const allPres = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prescriptions`);
                            const list = Array.isArray(allPres.data) ? allPres.data : (allPres.data.prescriptions || allPres.data.data || []);
                            presData = list.find(p =>
                                (p.appointment_id && (p.appointment_id._id === appointmentData._id || p.appointment_id === appointmentData._id))
                            );
                        } catch (e) {
                            console.error("Error fetching prescriptions list", e);
                        }
                    }
                    setPrescription(presData);

                } catch (error) {
                    console.error('Error fetching completion details:', error);
                }
            };

            fetchData();
        }
    }, [isOpen, appointmentData]);

    if (!isOpen || !appointmentData) return null;

    // -- Helpers --
    const getPatientName = () => {
        const p = appointmentData.patient_id || {};
        return appointmentData.patientName ||
            `${p.firstName || p.first_name || ''} ${p.lastName || p.last_name || ''}`.trim() || 'N/A';
    };

    const getDoctorName = () => {
        const d = appointmentData.doctor_id || {};
        return appointmentData.doctorName ||
            `Dr. ${d.firstName || d.first_name || ''} ${d.lastName || d.last_name || ''}`.trim() || 'N/A';
    };

    // Get formatted appointment date
    const getAppointmentDate = () => {
        if (appointmentData.date) return appointmentData.date;
        
        // Try from appointment_date field
        if (appointmentData.appointment_date) {
            return formatStoredDate(appointmentData.appointment_date);
        }
        
        // Fallback to current date
        return new Date().toLocaleDateString();
    };

    // Get formatted appointment time
    const getAppointmentTime = () => {
        if (appointmentData.time) return appointmentData.time;
        
        // Try from start_time field
        if (appointmentData.start_time) {
            return formatStoredTime(appointmentData.start_time);
        }
        
        return 'N/A';
    };

    const handlePrint = () => {
        window.print();
    };

    return (
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
              width: 210mm; 
              min-height: 297mm; 
              margin: 0 auto;
              padding: 10mm; /* Reduced padding */
              background: white;
              font-size: 11pt;
              box-sizing: border-box;
              box-shadow: none;
              position: relative;
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

            .no-print { 
              display: none !important; 
            }
            .slip-section {
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px dashed #bbb;
            }
          }
  
          /* Screen styles */
          @media screen {
            .printable-slip-container {
              position: absolute;
              inset: 0;
              z-index: 50;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.5);
              padding: 20px;
              z-index: 100;
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
              z-index: 101;
              padding: 24px;
            }
          }
        .label { color: #666; font-size: 0.85em; font-weight: 600; text-transform: uppercase; }
        .value { color: #111; font-weight: 500; }
        .section-title { font-size: 1.1em; font-weight: 700; color: #333; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px; }
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
                    <div className="slip-header ">
                        <div className="header-flex flex items-center justify-between">
                            {/* Left: Logo */}
                            <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center">
                                {hospitalInfo?.logo ? (
                                    <img src={hospitalInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg p-2 w-full h-full">
                                        <span className="text-xs font-medium">LOGO</span>
                                    </div>
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
                                        {hospitalInfo?.email && <span className="mx-2"></span>}
                                        {hospitalInfo?.email && <span> <br /> Email: {hospitalInfo.email}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                                <div className="py-2 px-1 mb-2">
                                    <h2 className="text-xl text-center font-bold text-gray-900 leading-none uppercase">
                                        Doctor's Prescription
                                    </h2>
                                </div>

                    {/* 1. Doctor Details & Slip Date (Top Row) */}
                    
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="label">Consultant Doctor</p>
                                <p className="value text-lg font-bold text-slate-800">{getDoctorName()}</p>
                                <p className="text-sm text-slate-500">{appointmentData.departmentName || appointmentData.department_id?.name || 'General Code'}</p>
                            </div>
                            <div className="text-right">
                                <p className="label">Slip Date</p>
                                <p className="value">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                   

                    {/* 2. Patient & Appointment Details */}
                   
                        <h4 className="section-title mt-0">PATIENT & APPOINTMENT DETAILS</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                            <div>
                                <p className="label">Patient Name</p>
                                <p className="value text-sm">{getPatientName()}</p>
                            </div>
                            <div>
                                <p className="label">Appointment ID</p>
                                <p className="value font-mono text-sm">#{appointmentData._id?.slice(-6).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="label">Patient ID</p>
                                <p className="value font-mono text-sm">{appointmentData.patientId || appointmentData.patient_id?.patientId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="label">Appointment Date</p>
                                <p className="value text-sm">{getAppointmentDate()}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="label">Appointment Time</p>
                                <p className="value text-sm">{getAppointmentTime()}</p>
                            </div>
                        </div>
                   

                    {/* 3. Vitals Details */}
                    {vitals && (vitals.bp || vitals.pulse || vitals.weight || vitals.temperature || vitals.spo2) && (
                        <div className="">
                            <h4 className="section-title mt-0">PATIENT VITALS</h4>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <p className="label text-xs">BP</p>
                                    <p className="value font-bold">{vitals.bp || '-'}</p>
                                </div>
                                <div>
                                    <p className="label text-xs">Pulse</p>
                                    <p className="value font-bold">{vitals.pulse || '-'} <span className="text-[10px] font-normal text-slate-500">bpm</span></p>
                                </div>
                                <div>
                                    <p className="label text-xs">Weight</p>
                                    <p className="value font-bold">{vitals.weight || '-'} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
                                </div>
                                <div>
                                    <p className="label text-xs">Temp</p>
                                    <p className="value font-bold">{vitals.temperature || '-'} <span className="text-[10px] font-normal text-slate-500">°F</span></p>
                                </div>
                                <div>
                                    <p className="label text-xs">SPO2</p>
                                    <p className="value font-bold">{vitals.spo2 || '-'} <span className="text-[10px] font-normal text-slate-500">%</span></p>
                                </div>
                                {vitals.height && (
                                    <div>
                                        <p className="label text-xs">Height</p>
                                        <p className="value font-bold">{vitals.height || '-'} <span className="text-[10px] font-normal text-slate-500">cm</span></p>
                                    </div>
                                )}
                                {vitals.respiratory_rate && (
                                    <div>
                                        <p className="label text-xs">Resp. Rate</p>
                                        <p className="value font-bold">{vitals.respiratory_rate || '-'} <span className="text-[10px] font-normal text-slate-500">/min</span></p>
                                    </div>
                                )}
                                {vitals.random_blood_sugar && (
                                    <div>
                                        <p className="label text-xs">RBS</p>
                                        <p className="value font-bold">{vitals.random_blood_sugar || '-'} <span className="text-[10px] font-normal text-slate-500">mg/dL</span></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Prescription Details */}
                    {prescription ? (
                        <div className="mb-6">
                            <h4 className="section-title mt-0">PRESCRIPTION ADVICE</h4>
                            <div className="bg-white">
                                <div className="mb-3">
                                    <span className="label block mb-1">Diagnosis</span>
                                    <p className="value">{prescription.diagnosis || 'N/A'}</p>
                                </div>
                                {prescription.notes && (
                                    <div className="mb-3">
                                        <span className="label block mb-1">Notes</span>
                                        <p className="value text-sm italic">{prescription.notes}</p>
                                    </div>
                                )}

                                {prescription.investigation && (
                                    <div className="mb-3">
                                        <span className="label block mb-1">Investigation</span>
                                        <p className="value text-sm">{prescription.investigation}</p>
                                    </div>
                                )}

                                {prescription.items && prescription.items.length > 0 && (
                                    <div className="mt-4 border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100 border-b">
                                                <tr>
                                                    <th className="text-left p-2 font-bold text-slate-600">Medicine</th>
                                                    <th className="text-left p-2 font-bold text-slate-600">Dosage</th>
                                                    <th className="text-left p-2 font-bold text-slate-600">Freq</th>
                                                    <th className="text-left p-2 font-bold text-slate-600">Duration</th>
                                                    <th className="text-left p-2 font-bold text-slate-600">Instructions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {prescription.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-2 font-medium">{item.medicine_name}</td>
                                                        <td className="p-2">{item.dosage}</td>
                                                        <td className="p-2">{item.frequency}</td>
                                                        <td className="p-2">{item.duration}</td>
                                                        <td className="p-2 text-slate-500 text-sm">{item.instructions}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h4 className="section-title text-slate-400">PRESCRIPTION</h4>
                            <p className="text-sm text-slate-400 italic">No prescription data available.</p>
                        </div>
                    )}

                    {/* Stamp / Signature Section */}
                    <div className="mt-16 mb-8 flex justify-end px-8">
                        <div className="text-center">
                            <div className="h-16 w-32 border-b-2 border-slate-300 mb-2"></div>
                            <p className="text-sm font-bold text-slate-700">Doctor / Hospital Stamp</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t-2 border-slate-100 font-serif text-center italic text-slate-500 text-sm">
                        <p>This is a computer-generated slip.</p>
                        <p className="mt-1">Get Well Soon!</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="no-print mt-8 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"> Close </button>
                        <button onClick={handlePrint} className="px-5 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition flex items-center gap-2">
                            Print Slip
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default AppointmentCompletionSlipModal;