// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'admin',
//     hospitalID: '',
//     fireNOC: '',
//     registryNo: '',
//     address: '',
//     contact: '',
//     policyDetails: '',
//     healthBima: '',
//     additionalInfo: '',
//     companyName: '', // Added
//     companyNumber: '', // Added
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, form);
//       console.log('✅ Registration success:', response.data);
//       setSuccess('Registration successful! Redirecting...');
//       setTimeout(() => navigate('/'), 1500);
//     } catch (err: any) {
//       console.error('🔴 Registration error response:', err);
//       setError(err.response?.data?.message || 'Registration failed.');
//     }
//   };


//   return (
//     <div className="flex items-center justify-center min-h-screen md:p-10 bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
//         <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Hospital Registration</h2>

//         {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
//         {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

//         <div className="grid grid-cols-1 gap-8">
//           {/* Section 1: Hospital Details */}
//           <div>
//             <h3 className="text-lg font-semibold mb-2 text-teal-700">Hospital Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input type="text" name="name" placeholder="Hospital Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
//               <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="p-2 border rounded" />
//               <input type="text" name="companyNumber" placeholder="Company Number/license" value={form.companyNumber} onChange={handleChange} className="p-2 border rounded" />
//               <input
//                 type="text"
//                 name="hospitalID"
//                 placeholder="Hospital/Clinic ID (e.g. AB1234)"
//                 value={form.hospitalID}
//                 onChange={handleChange}
//                 required
//                 pattern="^[A-Za-z]{2}\d{4}$"
//                 title="Hospital ID must be 2 letters followed by 4 numbers (e.g. AB1234)"
//                 className="p-2 border rounded"
//               />

//               <input type="text" name="fireNOC" placeholder="Fire NOC" value={form.fireNOC} onChange={handleChange} required className="p-2 border rounded" />
//               <input type="text" name="registryNo" placeholder="Registry Number" value={form.registryNo} onChange={handleChange} required className="p-2 border rounded" />
//             </div>
//           </div>

//           {/* Section 2: Personal Details */}
//           <div>
//             <h3 className="text-lg font-semibold mb-2 text-teal-700">Contact Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-2 border rounded" />
//               <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 border rounded" />

//               <input type="tel" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="p-2 border rounded" />
//               <select name="role" value={form.role} onChange={handleChange} className="p-2 border rounded">
//                 <option value="admin">Admin</option>
//                 <option value="doctor">Doctor</option>
//                 <option value="staff">Staff</option>
//                 <option value="pharmacy">Pharmacy</option>
//               </select>
//               <input
//                 type="text"
//                 name="address"
//                 placeholder="Enter Full Address"
//                 value={form.address}
//                 onChange={handleChange}
//                 required
//                 className="p-2 border rounded col-span-1 md:col-span-2"
//               />
//             </div>
//           </div>

//           {/* Section 3: Other Details */}
//           <div>
//             <h3 className="text-lg font-semibold mb-2 text-teal-700">Additional Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <textarea name="policyDetails" placeholder="Policy Details" value={form.policyDetails} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
//               <textarea name="healthBima" placeholder="Health Insurance (Bima) Details" value={form.healthBima} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
//               <textarea name="additionalInfo" placeholder="Additional Information" value={form.additionalInfo} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
//             </div>
//           </div>
//         </div>

//         <button type="submit" className="w-full mt-6 bg-teal-600 text-white py-2 rounded hover:bg-teal-700">
//           Register Hospital
//         </button>
//       </form>
//     </div>
//   );
// }



// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// // --- Helper Modal Component with TypeScript Props ---
// interface AdditionalDetailsModalProps {
//   isOpen: boolean;
//   onSave: (details: { policyDetails: string; healthBima: string; additionalInfo: string; }, hospitalId: string | null) => Promise<void>;
//   onSkip: () => void;
//   hospitalId: string | null;
// }

// const AdditionalDetailsModal: React.FC<AdditionalDetailsModalProps> = ({ isOpen, onSave, onSkip, hospitalId }) => {
//   if (!isOpen) return null;

//   const [details, setDetails] = useState({
//     policyDetails: '',
//     healthBima: '',
//     additionalInfo: '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setDetails(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSaveClick = async () => {
//     setIsSubmitting(true);
//     await onSave(details, hospitalId);
//     setIsSubmitting(false);
//   };

//   return (
//     // Backdrop
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//       {/* Modal Content */}
//       <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
//         <h2 className="text-2xl font-bold mb-4 text-center text-teal-700">Additional Details (Optional)</h2>
//         <p className="text-center text-gray-600 mb-6">You can add these details now or skip and do it later.</p>

//         <div className="space-y-4">
//           <textarea name="policyDetails" placeholder="Policy Details" value={details.policyDetails} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
//           <textarea name="healthBima" placeholder="Health Insurance (Bima) Details" value={details.healthBima} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
//           <textarea name="additionalInfo" placeholder="Any other Additional Information" value={details.additionalInfo} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
//         </div>

//         <div className="flex items-center justify-between mt-6">
//           <button type="button" onClick={onSkip} className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300 transition">
//             Skip for Now
//           </button>
//           <button type="button" onClick={handleSaveClick} disabled={isSubmitting} className="px-6 py-2 rounded text-white bg-teal-600 hover:bg-teal-700 transition disabled:bg-teal-400">
//             {isSubmitting ? 'Saving...' : 'Save & Continue'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // --- Main Register Component ---
// export default function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '', email: '', password: '', role: 'admin', hospitalID: '',
//     fireNOC: '', registryNo: '', address: '', contact: '',
//     companyName: '', companyNumber: '',
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State to control the modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newHospitalId, setNewHospitalId] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   // Main form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setIsSubmitting(true);

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, form);
//       const { hospitalId } = response.data; // Get the ID from the backend

//       setNewHospitalId(hospitalId); // Save the ID
//       setIsModalOpen(true); // Open the modal
//       setSuccess('Primary registration successful! Please add optional details.');

//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Registration failed.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Function called when saving details from the modal
//   const handleSaveDetails = async (detailsData, hospitalId) => {
//     try {
//       await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/${hospitalId}/details`, detailsData);
//     } catch (err) {
//       console.error("Could not save additional details:", err);
//     } finally {
//       setIsModalOpen(false);
//       navigate('/'); // Or your login route
//     }
//   };

//   // Function called when skipping details
//   const handleSkipDetails = () => {
//     setIsModalOpen(false);
//     navigate('/'); // Or your login route
//   };

//   return (
//     <>
//       <div className="flex items-center justify-center min-h-screen md:p-10 bg-gray-100">
//         <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
//           <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Hospital Registration</h2>

//           {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
//           {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

//           {/* FIX: Restored the missing form fields here */}
//           <div className="grid grid-cols-1 gap-8">
//             {/* Section 1: Hospital Details */}
//             <div>
//               <h3 className="text-lg font-semibold mb-2 text-teal-700">Hospital Details</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input type="text" name="name" placeholder="Hospital Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
//                 <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="p-2 border rounded" />
//                 <input type="text" name="companyNumber" placeholder="Company Number/license" value={form.companyNumber} onChange={handleChange} className="p-2 border rounded" />
//                 <input
//                   type="text"
//                   name="hospitalID"
//                   placeholder="Hospital/Clinic ID (e.g. AB1234)"
//                   value={form.hospitalID}
//                   onChange={handleChange}
//                   required
//                   pattern="^[A-Za-z]{2}\d{4}$"
//                   title="Hospital ID must be 2 letters followed by 4 numbers (e.g. AB1234)"
//                   className="p-2 border rounded"
//                 />
//                 <input type="text" name="fireNOC" placeholder="Fire NOC" value={form.fireNOC} onChange={handleChange} required className="p-2 border rounded" />
//                 <input type="text" name="registryNo" placeholder="Registry Number" value={form.registryNo} onChange={handleChange} required className="p-2 border rounded" />
//               </div>
//             </div>

//             {/* Section 2: Personal Details */}
//             <div>
//               <h3 className="text-lg font-semibold mb-2 text-teal-700">Contact Details</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-2 border rounded" />
//                 <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 border rounded" />
//                 <input type="tel" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="p-2 border rounded" />
//                 <select name="role" value={form.role} onChange={handleChange} className="p-2 border rounded">
//                   <option value="admin">Admin</option>
//                   <option value="doctor">Doctor</option>
//                   <option value="staff">Staff</option>
//                   <option value="pharmacy">Pharmacy</option>
//                 </select>
//                 <input
//                   type="text"
//                   name="address"
//                   placeholder="Enter Full Address"
//                   value={form.address}
//                   onChange={handleChange}
//                   required
//                   className="p-2 border rounded col-span-1 md:col-span-2"
//                 />
//               </div>
//             </div>
//           </div>
          
//           <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition disabled:bg-teal-400">
//             {isSubmitting ? 'Registering...' : 'Register Hospital'}
//           </button>
//         </form>
//       </div>

//       <AdditionalDetailsModal
//         isOpen={isModalOpen}
//         onSave={handleSaveDetails}
//         onSkip={handleSkipDetails}
//         hospitalId={newHospitalId}
//       />
//     </>
//   );
// }






import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Helper Modal Component (with Fire NOC added) ---
interface AdditionalDetailsModalProps {
  isOpen: boolean;
  onSave: (details: { policyDetails: string; healthBima: string; additionalInfo: string; fireNOC: string; }, hospitalId: string | null) => Promise<void>;
  onSkip: () => void;
  hospitalId: string | null;
}

const AdditionalDetailsModal: React.FC<AdditionalDetailsModalProps> = ({ isOpen, onSave, onSkip, hospitalId }) => {
  if (!isOpen) return null;

  const [details, setDetails] = useState({
    policyDetails: '',
    healthBima: '',
    additionalInfo: '',
    fireNOC: '', // Added Fire NOC field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    setIsSubmitting(true);
    await onSave(details, hospitalId);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-teal-700">Additional Details (Optional)</h2>
        <div className="space-y-4">
          {/* Added input for Fire NOC */}
          <input type="text" name="fireNOC" placeholder="Fire NOC" value={details.fireNOC} onChange={handleChange} required className="w-full p-2 border rounded" />
          {/* <textarea name="policyDetails" placeholder="Policy Details" value={details.policyDetails} onChange={handleChange} rows={3} className="w-full p-2 border rounded" /> */}
          <textarea name="healthBima" placeholder="Health Insurance (Bima) Details" value={details.healthBima} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
          {/* <textarea name="additionalInfo" placeholder="Any other Additional Information" value={details.additionalInfo} onChange={handleChange} rows={3} className="w-full p-2 border rounded" /> */}
        </div>
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={onSkip} className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300 transition">Skip for Now</button>
          <button type="button" onClick={handleSaveClick} disabled={isSubmitting} className="px-6 py-2 rounded text-white bg-teal-600 hover:bg-teal-700 transition disabled:bg-teal-400">
            {isSubmitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Register Component (with restructured form) ---
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalName: '', // Changed from 'name'
    hospitalID: '',
    registryNo: '',
    address: '',
    companyName: '',
    companyNumber: '',
    // Fields for the authorised person
    name: '', // This is now for the authorised person
    email: '',
    password: '',
    contact: '',
    role: 'admin',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHospitalId, setNewHospitalId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, form);
      const { hospitalId } = response.data;
      setNewHospitalId(hospitalId);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDetails = async (detailsData, hospitalId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/${hospitalId}/details`, detailsData);
    } catch (err) {
      console.error("Could not save additional details:", err);
    } finally {
      setIsModalOpen(false);
      navigate('/');
    }
  };

  const handleSkipDetails = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen md:p-10 bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Hospital Registration</h2>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="grid grid-cols-1 gap-8">
            {/* Section 1: Hospital Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-teal-700">Hospital Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="hospitalName" placeholder="Hospital Name" value={form.hospitalName} onChange={handleChange} required className="p-2 border rounded" />
                <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="p-2 border rounded" />
                <input type="text" name="companyNumber" placeholder="Company Number/License" value={form.companyNumber} onChange={handleChange} className="p-2 border rounded" />
                <input type="text" name="hospitalID" placeholder="Hospital/Clinic ID (e.g. AB1234)" value={form.hospitalID} onChange={handleChange} required pattern="^[A-Za-z]{2}\d{4}$" title="ID must be 2 letters and 4 numbers" className="p-2 border rounded" />
                <input type="text" name="registryNo" placeholder="Registry Number" value={form.registryNo} onChange={handleChange} required className="p-2 border rounded" />
                <input type="text" name="address" placeholder="Full Hospital Address" value={form.address} onChange={handleChange} required className="p-2 border rounded md:col-span-2" />
              </div>
            </div>

            {/* Section 2: Authorised Person Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-teal-700">Authorised Person Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
                <input type="tel" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="p-2 border rounded" />
                <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="p-2 border rounded" />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 border rounded" />
                 <select name="role" value={form.role} onChange={handleChange} className="p-2 border rounded">
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition disabled:bg-teal-400">
            {isSubmitting ? 'Registering...' : 'Register Hospital'}
          </button>
        </form>
      </div>
      <AdditionalDetailsModal isOpen={isModalOpen} onSave={handleSaveDetails} onSkip={handleSkipDetails} hospitalId={newHospitalId} />
    </>
  );
}