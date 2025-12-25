import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// --- Icons ---
const Icons = {
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Phone: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  ShieldCheck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="flex items-center justify-center min-h-[600px] text-slate-400 font-medium">Loading Profile...</div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800">Doctor not found</h3>
            <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 hover:underline">Go Back</button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Inactive': 'bg-slate-100 text-slate-600 border-slate-200',
      'On Leave': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles['Active']}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
        {Icon && <div className="mt-0.5 text-slate-400"><Icon className="w-4 h-4" /></div>}
        <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{value || '—'}</p>
        </div>
    </div>
  );

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-4 min-h-screen bg-slate-50/50 font-sans text-slate-800">
        
        {/* --- Header --- */}
        <div className="mb-8">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors group"
            >
                <span className="group-hover:-translate-x-1 transition-transform"><Icons.ArrowLeft /></span>
                Back to List
            </button>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Profile</h1>
        </div>

        {/* --- Main Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <div className="relative z-10 -mt-12 mb-4">
                        <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-lg mt-6">
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 border border-slate-200">
                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h2>
                    <p className="text-sm text-slate-500 font-medium mb-4">{doctor.specialization}</p>
                    
                    <div className="flex justify-center gap-2 mb-6">
                        <span className={getStatusBadge(doctor.status || 'Active')}>{doctor.status || 'Active'}</span>
                    </div>

                    <div className="flex justify-center gap-3">
                        <a href={`mailto:${doctor.email}`} className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-slate-100">
                            <Icons.Mail />
                        </a>
                        <a href={`tel:${doctor.phone}`} className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100">
                            <Icons.Phone />
                        </a>
                    </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Icons.ShieldCheck /> Emergency Contact
                    </h3>
                    <div className="space-y-1">
                        <InfoRow label="Name" value={doctor.emergencyContact} />
                        <InfoRow label="Phone" value={doctor.emergencyPhone} />
                    </div>
                </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Personal & Professional Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Icons.User /> Personal & Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <InfoRow label="Full Name" value={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
                        <InfoRow label="Gender" value={doctor.gender} />
                        <InfoRow label="Date of Birth" value={formatDate(doctor.dateOfBirth)} />
                        <InfoRow label="Email Address" value={doctor.email} />
                        <InfoRow label="Phone Number" value={doctor.phone} />
                        <InfoRow label="Address" value={`${doctor.address}, ${doctor.city}, ${doctor.state} ${doctor.zipCode}`} />
                        
                        <div className="col-span-1 md:col-span-2 mt-4 mb-2"><div className="h-px bg-slate-100"></div></div>
                        
                        <InfoRow label="Department" value={doctor.department?.name} />
                        <InfoRow label="Specialization" value={doctor.specialization} />
                        <InfoRow label="License Number" value={doctor.licenseNumber} />
                        <InfoRow label="Experience" value={`${doctor.experience} Years`} />
                        <InfoRow label="Education" value={doctor.education} />
                    </div>
                </div>

                {/* Employment Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Icons.Briefcase /> Employment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <InfoRow label="Employment Type" value={doctor.isFullTime ? 'Full-Time' : 'Part-Time'} />
                        <InfoRow label="Joining Date" value={formatDate(doctor.startDate)} />
                        
                        {doctor.isFullTime ? (
                            <>
                                <InfoRow label="Shift" value={doctor.shift} />
                                <InfoRow label="Salary" value={doctor.amount ? `₹${doctor.amount}` : '—'} />
                            </>
                        ) : (
                            <>
                                <InfoRow label="Payment Model" value={doctor.paymentType} />
                                <InfoRow label="Rate / Amount" value={`₹${doctor.amount}`} />
                                <InfoRow label="Contract Period" value={`${doctor.contractStartDate || 'N/A'} to ${doctor.contractEndDate || 'N/A'}`} />
                                <InfoRow label="Visits / Week" value={doctor.visitsPerWeek} />
                            </>
                        )}
                        
                        <div className="col-span-1 md:col-span-2">
                             <InfoRow label="Additional Notes" value={doctor.notes} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfilePage;


// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '../../../components/Layout';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const DoctorProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [doctor, setDoctor] = useState(null);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
//         setDoctor(res.data);
//       } catch (error) {
//         console.error('Failed to fetch doctor data', error);
//       }
//     };

//     fetchDoctor();
//   }, [id]);

//   if (!doctor) {
//     return <div className="p-6 text-gray-600">Loading...</div>;
//   }

//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <div className="p-6 max-w-4xl mx-auto">
//         <div className="bg-white shadow rounded-xl p-6">
//           <h2 className="text-2xl font-bold mb-2 text-gray-800">Doctor Profile</h2>
//           <p className="text-sm text-gray-500 mb-6">Detailed information about this doctor</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Full Name</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.firstName} {doctor.lastName}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Email</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Phone</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.phone}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Department</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.department}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Specialization</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.specialization || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">License Number</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.licenseNumber || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Experience</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.experience ? `${doctor.experience} years` : '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Shift</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.shift}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Status</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.status}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Gender</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.gender || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Date of Birth</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.dateOfBirth || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Address</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.address || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Qualification</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.qualification || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Start Date</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.startDate || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Full Time</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.isFullTime ? 'Yes' : 'No'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Consultation Fee</p>
//               <p className="text-base font-semibold text-gray-800">₹{doctor.consultationFee || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Emergency Contact</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.emergencyContact || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Emergency Phone</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.emergencyPhone || '—'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Has Insurance</p>
//               <p className="text-base font-semibold text-gray-800">{doctor.hasInsurance ? 'Yes' : 'No'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Languages</p>
//               <p className="text-base font-semibold text-gray-800">
//                 {doctor.languages?.length ? doctor.languages.join(', ') : '—'}
//               </p>
//             </div>
//             <div className="sm:col-span-2">
//               <p className="text-sm text-gray-500">Notes</p>
//               <p className="text-base font-semibold text-gray-800 whitespace-pre-line">{doctor.notes || '—'}</p>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={() => navigate(-1)}
//               className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
//             >
//               ← Back to List
//             </button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default DoctorProfile;
