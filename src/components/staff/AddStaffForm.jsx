// import { useState, useEffect } from 'react';
// import { FormInput, FormSelect, Button } from '../common/FormElements';
// import axios from 'axios';

// const AddStaffForm = () => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     role: '',
//     department: '',
//     specialization: '',
//     joiningDate: '',
//     gender: 'male',
//     status: 'Active',
//     aadharNumber: '',
//     panNumber: '',
//     password: '', // ✅ Password field added here
//   });

//   const [customRole, setCustomRole] = useState('');
//   const [departmentOptions, setDepartmentOptions] = useState([]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
//         const departments = res.data?.map(dep => ({
//           value: dep.name,
//           label: dep.name
//         })) || [];

//         setDepartmentOptions(departments);
//       } catch (err) {
//         console.error('❌ Failed to fetch departments:', err);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const finalData = {
//       ...formData,
//       role: formData.role === 'Others' ? customRole : formData.role
//     };

//     try {
//       console.log('Submitting form data:', finalData);
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/staff`,
//         finalData
//       );
//       console.log('✅ Staff added successfully:', response.data);
//       alert('Staff added successfully!');
//       window.location.reload(); // ✅ Reloads the page after adding staff
//     } catch (err) {
//       console.error('❌ Error adding staff:', err.response?.data || err.message);
//       alert(err.response?.data?.error || 'Failed to add staff.');
//     }
//   };

//   const roleOptions = [
//     { value: 'Nurse', label: 'Nurse' },
//     { value: 'Wardboy', label: 'Wardboy' },
//     { value: 'Receptionist', label: 'Receptionist' },
//     { value: 'Lab Technician', label: 'Lab Technician' },
//     { value: 'Radiologist', label: 'Radiologist' },
//     { value: 'Surgeon', label: 'Surgeon' },
//     { value: 'Anesthesiologist', label: 'Anesthesiologist' },
//     { value: 'Accountant', label: 'Accountant' },
//     { value: 'Cleaner', label: 'Cleaner' },
//     { value: 'Security', label: 'Security' },
//     { value: 'Ambulance Driver', label: 'Ambulance Driver' },
//     { value: 'HR', label: 'HR' },
//     { value: 'IT Support', label: 'IT Support' },
//     { value: 'Others', label: 'Others' }
//   ];

//   const genderOptions = [
//     { value: 'male', label: 'Male' },
//     { value: 'female', label: 'Female' },
//     { value: 'other', label: 'Other' },
//   ];

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
//           <p className="text-gray-600 mt-1">Fill the staff details to add them to the hospital system.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormInput label="Full Name" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required placeholder="Enter full name" />
//           <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="Enter email" />
//           <FormInput label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required placeholder="Enter phone number" />

//           <FormSelect label="Role" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)} options={roleOptions} required />

//           {formData.role === 'Others' && (
//             <FormInput label="Please specify role" value={customRole} onChange={(e) => setCustomRole(e.target.value)} required placeholder="Enter custom role" />
//           )}

//           <FormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} required />
//           <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="e.g., ICU, Lab Tech" />
//           <FormInput label="Joining Date" type="date" value={formData.joiningDate} onChange={(e) => handleInputChange('joiningDate', e.target.value)} required />
//           <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
//           <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value)} placeholder="Enter Aadhar number" maxLength={12} />
//           <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} placeholder="Enter PAN number" maxLength={10} />

//           {/* ✅ Password Field */}
//           {/* <FormInput label="Password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required placeholder="Set a password" /> */}

//           <div className="md:col-span-2 flex justify-end space-x-4">
//             <Button variant="secondary" type="button">Cancel</Button>
//             <Button variant="primary" type="submit">Add Staff</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddStaffForm;



import { useState, useEffect } from 'react';
import { FormInput, FormSelect, Button, FormTextarea } from '../common/FormElements'; // Ensure FormTextarea is imported
import axios from 'axios';

const AddStaffForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    joiningDate: '',
    gender: '',
    status: 'Active',
    aadharNumber: '',
    panNumber: '',
    // password: '',
    registrationNo: '',       // ✅ Added Registration No.
    qualificationDetails: '', // ✅ Added Qualification Details
  });

  const [customRole, setCustomRole] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        const departments = res.data?.map(dep => ({
          value: dep.name,
          label: dep.name
        })) || [];
        setDepartmentOptions(departments);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      role: formData.role === 'Others' ? customRole : formData.role
    };
    try {
      console.log('Submitting form data:', finalData);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/staff`,
        finalData
      );
      console.log('✅ Staff added successfully:', response.data);
      alert('Staff added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('❌ Error adding staff:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add staff.');
    }
  };

  const roleOptions = [
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Wardboy', label: 'Wardboy' },
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Lab Technician', label: 'Lab Technician' },
    { value: 'Radiologist', label: 'Radiologist' },
    { value: 'Surgeon', label: 'Surgeon' },
    { value: 'Anesthesiologist', label: 'Anesthesiologist' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Cleaner', label: 'Cleaner' },
    { value: 'Security', label: 'Security' },
    { value: 'Ambulance Driver', label: 'Ambulance Driver' },
    { value: 'HR', label: 'HR' },
    { value: 'IT Support', label: 'IT Support' },
    { value: 'Others', label: 'Others' }
  ];

  const qualificationOptionsByRole = {
  Nurse: [
    { value: 'ANM', label: 'ANM (Auxiliary Nurse Midwife)' },
    { value: 'GNM', label: 'GNM (General Nursing & Midwifery)' },
    { value: 'B.Sc Nursing', label: 'B.Sc Nursing' },
    { value: 'M.Sc Nursing', label: 'M.Sc Nursing' },
    { value: 'PhD Nursing', label: 'Ph.D. in Nursing' }
  ],
  'Lab Technician': [
    { value: 'DMLT', label: 'DMLT (Diploma in Medical Lab Technology)' },
    { value: 'BMLT', label: 'BMLT (Bachelor of Medical Lab Technology)' },
    { value: 'MMLT', label: 'MMLT (Master of Medical Lab Technology)' },
    { value: 'Certificate in Lab Technology', label: 'Certificate in Lab Technology' }
  ],
  Radiologist: [
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MD Radiology', label: 'MD Radiology' },
    { value: 'DNB Radiology', label: 'DNB Radiology' },
    { value: 'DM Neuro Radiology', label: 'DM in Neuro Radiology' }
  ],
  Surgeon: [
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MS General Surgery', label: 'MS General Surgery' },
    { value: 'MCh', label: 'MCh (Master of Chirurgiae)' },
    { value: 'Fellowship Surgery', label: 'Fellowship in Surgery' }
  ],
  Anesthesiologist: [
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MD Anesthesiology', label: 'MD Anesthesiology' },
    { value: 'DA', label: 'DA (Diploma in Anesthesia)' }
  ],
  Wardboy: [
    { value: 'Basic Training', label: 'Basic Training in Patient Care' },
    { value: 'First Aid Certification', label: 'First Aid Certification' }
  ],
  Receptionist: [
    { value: 'Diploma in Hospital Management', label: 'Diploma in Hospital Management' },
    { value: 'Graduate', label: 'Graduate in Any Stream' },
    { value: 'Computer Knowledge', label: 'Basic Computer Knowledge' }
  ],
  'Ambulance Driver': [
    { value: 'Valid Driving License', label: 'Valid Driving License' },
    { value: 'First Aid Certification', label: 'First Aid Certification' }
  ],
  Cleaner: [
    { value: 'Basic Hygiene Training', label: 'Basic Hygiene Training' }
  ],
  Accountant: [
    { value: 'B.Com', label: 'B.Com (Bachelor of Commerce)' },
    { value: 'M.Com', label: 'M.Com (Master of Commerce)' },
    { value: 'CA', label: 'CA (Chartered Accountant)' }
  ],
  'IT Support': [
    { value: 'Diploma in IT', label: 'Diploma in IT' },
    { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'MCA', label: 'MCA (Master of Computer Applications)' }
  ],
  HR: [
    { value: 'MBA HR', label: 'MBA in HR' },
    { value: 'PGDM HR', label: 'PGDM in HR' },
    { value: 'Graduate', label: 'Graduate in Any Stream' }
  ],
  Security: [
    { value: 'Security Training Certification', label: 'Security Training Certification' },
    { value: 'Ex-Army/Police', label: 'Ex-Army/Police Personnel' }
  ],
  Others: [
    { value: 'Relevant Certificate', label: 'Relevant Certificate or Diploma' }
  ]
};


  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-600 mt-1">Fill the staff details to add them to the hospital system.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Full Name" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required placeholder="Enter full name" />
          <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="Enter email" />
          {/* <FormInput label="Password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required placeholder="Set a password" /> */}
          <FormInput label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required placeholder="Enter phone number" />
          <FormSelect label="Role" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)} options={roleOptions} required />
          {formData.role === 'Others' && (
            <FormInput label="Please specify role" value={customRole} onChange={(e) => setCustomRole(e.target.value)} required placeholder="Enter custom role" />
          )}
          <FormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} required />
          <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="e.g., ICU, Lab Tech" />
          
          {/* ✅ Added Registration Number field */}
          <FormInput label="Registration No." value={formData.registrationNo} onChange={(e) => handleInputChange('registrationNo', e.target.value)} placeholder="Enter registration number if any" />
          
          <FormInput label="Joining Date" type="date" value={formData.joiningDate} onChange={(e) => handleInputChange('joiningDate', e.target.value)} required />
          <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
          <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value)} placeholder="Enter Aadhar number" maxLength={12} />
          <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} placeholder="Enter PAN number" maxLength={10} />

          {/* ✅ Added Qualification Details section */}
          <div className="md:col-span-2">
            {qualificationOptionsByRole[formData.role] ? (
  <FormSelect
    label="Qualification"
    value={formData.qualificationDetails}
    onChange={(e) => handleInputChange('qualificationDetails', e.target.value)}
    options={qualificationOptionsByRole[formData.role]}
    placeholder="Select qualification"
    required
  />
) : (
  <FormTextarea
    label="Qualification Details"
    value={formData.qualificationDetails}
    onChange={(e) => handleInputChange('qualificationDetails', e.target.value)}
    placeholder="Enter qualifications, certifications, etc."
    rows={3}
  />
)}

          </div>

          <div className="md:col-span-2 flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add Staff</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffForm;