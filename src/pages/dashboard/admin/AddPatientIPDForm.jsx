// // import { useState } from 'react';
// // import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
// // import axios from 'axios';

// // const AddPatientIPDForm = () => {
// //   const [formData, setFormData] = useState({
// //     firstName: '',
// //     lastName: '',
// //     email: '',
// //     phone: '',
// //     dateOfBirth: '',
// //     gender: '',
// //     address: '',
// //     city: '',
// //     state: '',
// //     zipCode: '',
// //     ward: '',
// //     bed: '',
// //     admissionDate: ''
// //   });

// //   const handleInputChange = (field, value) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       [field]: value
// //     }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const payload = {
// //         first_name: formData.firstName,
// //         last_name: formData.lastName,
// //         email: formData.email,
// //         phone: formData.phone,
// //         gender: formData.gender,
// //         dob: formData.dateOfBirth,
// //         address: formData.address,
// //         city: formData.city,
// //         state: formData.state,
// //         zipCode: formData.zipCode,
// //         ward: formData.ward,
// //         bed: formData.bed,
// //         admission_date: formData.admissionDate,
// //         patient_type: 'OPD'
// //       };

// //       const response = await axios.post(
// //         `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
// //         payload
// //       );

// //       console.log('✅ OPD Patient added:', response.data);
// //       alert('OPD Patient added successfully!');
// //     } catch (err) {
// //       console.error('❌ Error adding patient:', err.response?.data || err.message);
// //       alert(err.response?.data?.error || 'Failed to add patient.');
// //     }
// //   };

// //   const genderOptions = [
// //     { value: 'male', label: 'Male' },
// //     { value: 'female', label: 'Female' },
// //     { value: 'other', label: 'Other' }
// //   ];

// //   return (
// //     <div className="p-6">
// //       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
// //         <div className="p-6 border-b border-gray-100">
// //           <h2 className="text-2xl font-bold text-gray-900">Add IPD Patient</h2>
// //           <p className="text-gray-600 mt-1">Enter OPD patient details below</p>
// //         </div>

// //         <form onSubmit={handleSubmit} className="p-6 space-y-8">
// //           {/* Personal Information */}
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
// //               <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
// //               <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
// //               <FormInput label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
// //               <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required />
// //               <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
// //             </div>
// //           </div>

// //           {/* Address */}
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <FormTextarea label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} className="md:col-span-2" />
// //               <FormInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
// //               <FormInput label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
// //               <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />
// //             </div>
// //           </div>

// //           {/* OPD Specific */}
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-900 mb-4">OPD Details</h3>
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <FormInput label="Ward" value={formData.ward} onChange={(e) => handleInputChange('ward', e.target.value)} required />
// //               <FormInput label="Bed" value={formData.bed} onChange={(e) => handleInputChange('bed', e.target.value)} required />
// //               <FormInput label="Admission Date" type="date" value={formData.admissionDate} onChange={(e) => handleInputChange('admissionDate', e.target.value)} required />
// //             </div>
// //           </div>

// //           <div className="flex justify-end space-x-4">
// //             <Button variant="secondary" type="button">Cancel</Button>
// //             <Button variant="primary" type="submit">Add Patient</Button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AddPatientIPDForm;



import { useState, useEffect } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper to get current IST date in YYYY-MM-DD
function getCurrentISTDate() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60000);
  return istTime.toISOString().slice(0, 10);
}

const AddPatientIPDForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    // ward: '',
    // bed: '',
    admissionDate: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    bloodGroup: '',
    department: '',
  });

  const [departments, setDepartments] = useState([]);

  // Set default admissionDate to IST date on mount
  useEffect(() => {
    if (!formData.admissionDate) {
      setFormData(prev => ({ ...prev, admissionDate: getCurrentISTDate() }));
    }
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        setDepartments(res.data);
      } catch (err) {
        console.error('❌ Failed to load departments:', err.message);
      }
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const payload = {
  //       first_name: formData.firstName,
  //       last_name: formData.lastName,
  //       email: formData.email,
  //       phone: formData.phone,
  //       gender: formData.gender,
  //       dob: formData.dateOfBirth,
  //       address: formData.address,
  //       city: formData.city,
  //       state: formData.state,
  //       zipCode: formData.zipCode,
  //       emergency_contact: formData.emergencyContact,
  //       emergency_phone: formData.emergencyPhone,
  //       // ward: formData.ward,
  //       // bed: formData.bed,
  //       admission_date: formData.admissionDate,
  //       medical_history: formData.medicalHistory,
  //       allergies: formData.allergies,
  //       medications: formData.medications,
  //       blood_group: formData.bloodGroup,
  //       department_id: formData.department,
  //       patient_type: 'ipd'
  //     };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dateOfBirth,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,
      admission_date: formData.admissionDate,
      medical_history: formData.medicalHistory,
      allergies: formData.allergies,
      medications: formData.medications,
      blood_group: formData.bloodGroup,
      department_id: formData.department,
      patient_type: 'ipd'
    };

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
      payload
    );

    console.log('✅ IPD Patient added:', response.data);
    alert('IPD Patient added successfully!');
    window.location.reload(); // Reload the current page after successful submission

  } catch (err) {
    console.error('❌ Error adding IPD patient:', err.response?.data || err.message);
    alert(err.response?.data?.error || 'Failed to add patient.');
  }
};

  //     const response = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
  //       payload
  //     );

  //     console.log('✅ IPD Patient added:', response.data);
  //     alert('IPD Patient added successfully!');
  //     navigate('/dashboard/admin/appointments?type=ipd');
  //   } catch (err) {
  //     console.error('❌ Error adding IPD patient:', err.response?.data || err.message);
  //     alert(err.response?.data?.error || 'Failed to add patient.');
  //   }
  // };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>
          <p className="text-gray-600 mt-1">Enter patient details for admission</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
              <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
              <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
              <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required />
              <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
              <FormSelect label="Blood Group" value={formData.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} options={bloodGroupOptions} />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} className="md:col-span-2" />
              <FormInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
              <FormInput label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
              <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} />
              <FormInput label="Contact Phone" type="tel" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)} />
            </div>
          </div>

          {/* Department + Admission Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
                required
              />
              {/* <FormInput label="Ward" value={formData.ward} onChange={(e) => handleInputChange('ward', e.target.value)} required />
              <FormInput label="Bed Number" value={formData.bed} onChange={(e) => handleInputChange('bed', e.target.value)} required /> */}
              <FormInput label="Admission Date" type="date" value={formData.admissionDate} onChange={(e) => handleInputChange('admissionDate', e.target.value)} required />
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Medical History" value={formData.medicalHistory} onChange={(e) => handleInputChange('medicalHistory', e.target.value)} />
              <FormInput label="Allergies" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} />
              <FormInput label="Medications" value={formData.medications} onChange={(e) => handleInputChange('medications', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add IPD Patient</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientIPDForm;



// import { useState, useEffect } from 'react';
// import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
// import axios from 'axios';

// // --- New Component for the Printable Slip ---
// const AppointmentSlip = ({ slipData, onClose }) => {
//   if (!slipData) return null;

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <>
//       {/* Basic CSS for printing */}
//       <style>
//         {`
//           @media print {
//             body * {
//               visibility: hidden;
//             }
//             .printable-slip, .printable-slip * {
//               visibility: visible;
//             }
//             .printable-slip {
//               position: absolute;
//               left: 0;
//               top: 0;
//               width: 100%;
//             }
//             .no-print {
//               display: none;
//             }
//           }
//         `}
//       </style>
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 printable-slip">
//           <div className="p-6 border-b border-gray-100 text-center">
//             <h2 className="text-2xl font-bold text-gray-900">IPD Admission Slip</h2>
//             <p className="text-gray-600 mt-1">Hospital Name</p>
//           </div>
//           <div className="p-6 grid grid-cols-2 gap-4">
//             <div><strong>Patient Name:</strong> {slipData.fullName}</div>
//             <div><strong>Patient ID:</strong> {slipData.patientId}</div>
//             <div><strong>IPD No:</strong> {slipData.ipdAdmissionNumber}</div>
//             <div><strong>Admission Date:</strong> {new Date(slipData.admissionDate).toLocaleDateString()}</div>
//             <div><strong>Department:</strong> {slipData.departmentName}</div>
//             <div><strong>Ward:</strong> {slipData.ward}</div>
//             <div><strong>Bed No:</strong> {slipData.bed}</div>
//           </div>
//           <div className="p-6 border-t border-gray-100 flex justify-end space-x-4 no-print">
//             <Button variant="secondary" onClick={onClose}>Close</Button>
//             <Button variant="primary" onClick={handlePrint}>Print Slip</Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };


// // --- Main Form Component ---
// const AddPatientIPDForm = () => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     dateOfBirth: '',
//     gender: '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     emergencyContact: '',
//     emergencyPhone: '',
//     ward: '',
//     bed: '',
//     admissionDate: new Date().toISOString().slice(0, 10), // Default to today
//     medicalHistory: '',
//     allergies: '',
//     medications: '',
//     bloodGroup: '',
//     department: '',
//   });

//   const [departments, setDepartments] = useState([]);
//   const [showSlip, setShowSlip] = useState(false);
//   const [slipData, setSlipData] = useState(null);

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
//         setDepartments(res.data);
//       } catch (err) {
//         console.error('❌ Failed to load departments:', err.message);
//       }
//     };
//     fetchDepartments();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };



// const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         first_name: formData.firstName,
//         last_name: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         gender: formData.gender,
//         dob: formData.dateOfBirth,
//         address: formData.address,
//         city: formData.city,
//         state: formData.state,
//         zipCode: formData.zipCode,
//         emergency_contact: formData.emergencyContact,
//         emergency_phone: formData.emergencyPhone,
//         admission_date: formData.admissionDate,
//         medical_history: formData.medicalHistory,
//         allergies: formData.allergies,
//         medications: formData.medications,
//         blood_group: formData.bloodGroup,
//         department_id: formData.department,
//         ward: formData.ward, // Make sure to send ward and bed
//         bed: formData.bed,   // Make sure to send ward and bed
//         patient_type: 'ipd'
//       };

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
//         payload
//       );
      
//       // --- FIX: Manually construct the slipData object ---
//       const newPatientData = response.data.patient; // Assuming backend returns { patient: {...} }
//       const selectedDepartment = departments.find(d => d._id === newPatientData.department_id);

//       const slipDataForDisplay = {
//         fullName: `${newPatientData.first_name} ${newPatientData.last_name}`,
//         patientId: newPatientData.patientId, // Use the correct field from your backend response
//         ipdAdmissionNumber: newPatientData.ipdAdmissionNumber, // Use the correct field
//         admissionDate: newPatientData.admission_date,
//         departmentName: selectedDepartment?.name || 'N/A',
//         ward: newPatientData.ward,
//         bed: newPatientData.bed,
//       };
      
//       setSlipData(slipDataForDisplay); 
//       setShowSlip(true);

//     } catch (err) {
//       console.error('❌ Error adding IPD patient:', err.response?.data || err.message);
//       alert(err.response?.data?.error || 'Failed to add patient.');
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     const payload = {
//   //       first_name: formData.firstName,
//   //       last_name: formData.lastName,
//   //       email: formData.email,
//   //       phone: formData.phone,
//   //       gender: formData.gender,
//   //       dob: formData.dateOfBirth,
//   //       address: formData.address,
//   //       city: formData.city,
//   //       state: formData.state,
//   //       zipCode: formData.zipCode,
//   //       emergency_contact: formData.emergencyContact,
//   //       emergency_phone: formData.emergencyPhone,
//   //       admission_date: formData.admissionDate,
//   //       medical_history: formData.medicalHistory,
//   //       allergies: formData.allergies,
//   //       medications: formData.medications,
//   //       blood_group: formData.bloodGroup,
//   //       department_id: formData.department,
//   //       patient_type: 'ipd'
//   //     };

//   //     const response = await axios.post(
//   //       `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
//   //       payload
//   //     );
      
//   //     // The backend should return data needed for the slip
//   //     setSlipData(response.data); 
//   //     setShowSlip(true); // Show the slip instead of reloading

//   //   } catch (err) {
//   //     console.error('❌ Error adding IPD patient:', err.response?.data || err.message);
//   //     alert(err.response?.data?.error || 'Failed to add patient.');
//   //   }
//   // };
  
//   const handleCloseSlip = () => {
//     setShowSlip(false);
//     setSlipData(null);
//     // Optionally reset form or reload page
//     window.location.reload();
//   };

//   const genderOptions = [
//     { value: 'male', label: 'Male' },
//     { value: 'female', label: 'Female' },
//     { value: 'other', label: 'Other' }
//   ];

//   const bloodGroupOptions = [
//     { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
//     { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
//     { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
//     { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
//   ];

//   // Conditional Rendering: Show slip or form
//   if (showSlip) {
//     return <AppointmentSlip slipData={slipData} onClose={handleCloseSlip} />;
//   }

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>
//           <p className="text-gray-600 mt-1">Enter patient details for admission</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           {/* Personal Information */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
//               <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
//               <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
//               <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
//               {/* <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.targe.value)} required /> */}
//               <FormInput 
//                 label="Date of Birth" 
//                 type="date" 
//                 value={formData.dateOfBirth} 
//                 onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} // <-- Corrected
//                 required 
//               />
//               <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
//               <FormSelect label="Blood Group" value={formData.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} options={bloodGroupOptions} />
//             </div>
//           </div>

//           {/* Address Information */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormTextarea label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} className="md:col-span-2" />
//               <FormInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
//               <FormInput label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
//               <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />
//             </div>
//           </div>

//           {/* Emergency Contact */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormInput label="Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} required/>
//               <FormInput label="Contact Phone" type="tel" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)} required/>
//             </div>
//           </div>
          
//           {/* Department + Admission Details */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormSelect
//                 label="Department"
//                 value={formData.department}
//                 onChange={(e) => handleInputChange('department', e.target.value)}
//                 options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
//                 required
//               />
//               <FormInput label="Ward" value={formData.ward} onChange={(e) => handleInputChange('ward', e.target.value)} required />
//               <FormInput label="Bed Number" value={formData.bed} onChange={(e) => handleInputChange('bed', e.target.value)} required />
//               <FormInput label="Admission Date" type="date" value={formData.admissionDate} onChange={(e) => handleInputChange('admissionDate', e.target.value)} required />
//             </div>
//           </div>

//           {/* Medical Information */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormTextarea label="Medical History" value={formData.medicalHistory} onChange={(e) => handleInputChange('medicalHistory', e.target.value)} className="md:col-span-2" rows={3}/>
//               <FormTextarea label="Allergies" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} className="md:col-span-2" rows={3}/>
//               <FormTextarea label="Medications" value={formData.medications} onChange={(e) => handleInputChange('medications', e.target.value)} className="md:col-span-2" rows={3}/>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <Button variant="secondary" type="button">Cancel</Button>
//             <Button variant="primary" type="submit">Add IPD Patient</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddPatientIPDForm;