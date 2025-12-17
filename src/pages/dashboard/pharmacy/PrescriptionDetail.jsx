import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaArrowLeft, 
  FaPrint, 
  FaFileInvoiceDollar, 
  FaUser, 
  FaUserMd, 
  FaBuilding, 
  FaExpand, 
  FaTimes,
  FaCalendarAlt,
  FaStethoscope,
  FaClipboardList
} from 'react-icons/fa';
import Layout from '@/components/Layout';
import { doctorSidebar } from '@/constants/sidebarItems/doctorSidebar';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

// Helper component for data fields
const Field = ({ icon: Icon, label, children, className = "" }) => (
  <div className={`mb-3 ${className}`}>
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {Icon && <Icon className="text-slate-400" />}
      {label}
    </div>
    <div className="text-sm font-medium text-slate-900 break-words">{children || 'N/A'}</div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Expired: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const currentStyle = styles[status] || styles.Active; 

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStyle}`}>
      {status || 'Active'}
    </span>
  );
};

// Image Modal Component
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
      >
        <FaTimes />
      </button>
      <img src={src} alt="Full View" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
    </div>
  );
};

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState(null);
  const [billing, setBilling] = useState(null);
  const [error, setError] = useState(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiClient.get(`/prescriptions/${id}`);
        const pres = resp?.data?.prescription || resp?.data || null;
        setPrescription(pres);

        // Fetch linked billing
        const apptId = pres?.appointment_id && (pres.appointment_id._id || pres.appointment_id);
        if (apptId) {
          try {
            const billResp = await apiClient.get(`/billing/appointment/${apptId}`);
            setBilling(billResp.data.bill || billResp.data || null);
          } catch (bErr) {
            setBilling(null);
          }
        }
      } catch (err) {
        console.error('Failed to load prescription', err);
        setError(err.message || 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-4">
        Error: {error}
      </div>
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">Go Back</button>
    </div>
  );

  if (!prescription) return <div className="p-6">No prescription found.</div>;
  console.log('Prescription Data:', prescription);
  const patient = prescription.patient_id || prescription.patient || {};
  const doctor = prescription.doctor_id || prescription.doctor || {};
  
  // Revised Department Logic to handle objects or strings
  const rawDept = prescription.department_id || prescription.department;
  const departmentName = rawDept 
    ? (rawDept.name || rawDept.department || (typeof rawDept === 'string' ? rawDept : 'N/A'))
    : 'N/A';

  const items = prescription.items || prescription.medicines || [];

  return (
    <>
      <Layout sidebarItems={pharmacySidebar}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; grid-template-columns: 1fr !important; }
          body { background: white; }
          .card { box-shadow: none; border: 1px solid #eee; break-inside: avoid; }
        }
      `}</style>

      {/* Image Lightbox */}
      {isImageOpen && (
        <ImageModal src={prescription.prescription_image} onClose={() => setIsImageOpen(false)} />
      )}

      <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              <FaArrowLeft size={14} /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                Prescription Details
                <StatusBadge status={prescription.status} />
              </h1>
              <p className="text-sm text-slate-500">ID: {String(prescription._id).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Content Grid: 2 Columns now (2/3 Left, 1/3 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Combined Summary & Participants (Span 2) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 card">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FaClipboardList className="text-indigo-500"/> General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sub-section: Clinical Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Details</h4>
                <Field icon={FaCalendarAlt} label="Date Issued">
                  {new Date(prescription.created_at || prescription.createdAt || Date.now()).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </Field>
                <Field icon={FaStethoscope} label="Diagnosis">
                  <span className="font-semibold text-indigo-900">{prescription.diagnosis || 'Not specified'}</span>
                </Field>
                <Field icon={null} label="Notes">
                  <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
                    {prescription.notes || 'No additional notes provided.'}
                  </p>
                </Field>
              </div>

              {/* Sub-section: Participants */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-4 md:pt-0">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">People Involved</h4>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0"><FaUser /></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Patient</div>
                    <div className="text-base font-medium text-slate-900">
                      {patient.first_name || patient.firstName || patient.name || 'Unknown'} {patient.last_name || patient.lastName || ''}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">ID: {patient.patientID || patient._id || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 bg-green-50 p-2 rounded-lg text-green-600 shrink-0"><FaUserMd /></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Doctor</div>
                    <div className="text-base font-medium text-slate-900">
                      {doctor.firstName || doctor.first_name || doctor.name || 'Unknown'} {doctor.lastName || doctor.last_name || ''}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Image (Span 1) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 card h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Scanned Copy</h3>
            {prescription.prescription_image ? (
              <div className="relative group cursor-pointer border rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={prescription.prescription_image} 
                  alt="Prescription" 
                  className="w-full h-64 object-cover object-top group-hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageOpen(true)}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"
                  onClick={() => setIsImageOpen(true)}
                >
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-slate-800 px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <FaExpand /> View Full
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                <FaClipboardList size={24} className="mb-2 opacity-50"/>
                <span className="text-sm">No digital copy available</span>
              </div>
            )}
            <div className="mt-4 text-xs text-slate-400 text-center">
              Click image to expand view
            </div>
          </div>
        </div>

        {/* Full Width: Medications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6 card">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             Prescribed Medications
             <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{items.length} Items</span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Medicine Name</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Dosage</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Frequency</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Duration</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items && items.length > 0 ? (
                  items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {(it.medicine_id && it.medicine_id.name) || it.medicine_name || it.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {it.dosage || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{it.frequency || '-'}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{it.duration || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 italic min-w-[200px]">{it.instructions || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No medications have been listed for this prescription.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
};

export default PrescriptionDetail;