import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    const formattedDate = new Date().toLocaleDateString();

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body, html { height: 100%; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          body * { visibility: hidden; }
          .printable-slip-container {
            position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
            display: flex; align-items: start; justify-content: center;
            z-index: 9999; background: white;
          }
          .printable-slip, .printable-slip * { visibility: visible; }
          .printable-slip {
            width: 210mm; min-height: 297mm; padding: 10mm;
            box-sizing: border-box; font-size: 11pt;
          }
          .no-print { display: none !important; }
          .slip-section { border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
          .slip-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        }
        @media screen {
          .printable-slip-container {
            position: fixed; inset: 0; z-index: 100;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0, 0, 0, 0.5); padding: 20px;
          }
          .printable-slip {
            background: white; border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 100%; max-width: 700px; max-height: 90vh;
            overflow-y: auto; padding: 30px;
          }
        }
        .label { color: #666; font-size: 0.85em; font-weight: 600; text-transform: uppercase; }
        .value { color: #111; font-weight: 500; }
        .section-title { font-size: 1.1em; font-weight: 700; color: #333; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px; }
      `}</style>

            <div className="printable-slip-container">
                <div className="printable-slip">

                    {/* Header */}
                    <div className="slip-header text-center mb-6 ">
                        {hospitalInfo && (
                            <>
                                <h3 className="text-xl font-semibold text-teal-700 mt-1">{hospitalInfo.hospitalName} Hospital</h3>
                                <p className="text-sm text-slate-600 max-w-md mx-auto">{hospitalInfo.address}</p>
                                <div className="flex justify-center gap-4 mt-1 text-sm text-slate-500">
                                    {hospitalInfo.contact && <span>Ph: {hospitalInfo.contact}</span>}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 1. Doctor Details & Slip Date (Top Row) */}
                    <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="label">Consultant Doctor</p>
                                <p className="value text-lg font-bold text-slate-800">{getDoctorName()}</p>
                                <p className="text-sm text-slate-500">{appointmentData.departmentName || appointmentData.department_id?.name || 'General Code'}</p>
                            </div>
                            <div className="text-right">
                                <p className="label">Slip Date</p>
                                <p className="value">{formattedDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Patient & Appointment Details */}
                    <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
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
                                <p className="label">Appt Date/Time</p>
                                <p className="value text-sm">
                                    {appointmentData.date || new Date(appointmentData.appointment_date).toLocaleDateString()}
                                    {appointmentData.time ? `, ${appointmentData.time}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Vitals Details */}
                    {vitals && (vitals.bp || vitals.pulse || vitals.weight || vitals.temperature || vitals.spo2) && (
                        <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
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
