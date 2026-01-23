import { useState, useEffect } from 'react';
import { FormInput, FormSelect, Button, FormTextarea, SearchableFormSelect } from '../common/FormElements';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStaffForm = () => {
  const navigate = useNavigate();
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    specialization: '',
    joiningDate: getTodayDate(),
    gender: 'male',
    status: 'Active',
    aadharNumber: '',
    panNumber: '',
    registrationNo: '',
    qualificationDetails: '',
  });

  const [customRole, setCustomRole] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
        const departments = res.data?.map(dep => ({
          value: dep._id || dep.id || dep.name,
          label: dep.name
        })) || [];
        setDepartmentOptions(departments);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
        setDepartmentOptions([
          { value: 'emergency', label: 'Emergency' },
          { value: 'cardiology', label: 'Cardiology' },
          { value: 'orthopedics', label: 'Orthopedics' },
          { value: 'neurology', label: 'Neurology' },
          { value: 'pediatrics', label: 'Pediatrics' },
          { value: 'radiology', label: 'Radiology' },
          { value: 'laboratory', label: 'Laboratory' },
          { value: 'administration', label: 'Administration' },
          { value: 'housekeeping', label: 'Housekeeping' },
          { value: 'security', label: 'Security' }
        ]);
      } finally {
        setLoading(false);
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
    
    // Validation
    if (!formData.firstName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return;
    }
    
    if (!formData.role) {
      alert('Please select a role.');
      return;
    }
    
    if (!formData.department) {
      alert('Please select a department.');
      return;
    }

    const finalData = {
      ...formData,
      role: formData.role === 'Others' ? customRole : formData.role,
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      firstName: formData.firstName,
      lastName: formData.lastName
    };
    
    try {
      console.log('Submitting form data:', finalData);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/staff`,
        finalData
      );
      
      console.log('✅ Staff added successfully:', response.data);
      alert('Staff added successfully!');
      
      // Navigate to staff list page
      navigate('/dashboard/admin/staff-list');
      
    } catch (err) {
      console.error('❌ Error adding staff:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add staff. Please try again.');
    }
  };

  const roleOptions = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Wardboy', label: 'Wardboy' },
    { value: 'Wardgirl', label: 'Wardgirl' },
    { value: 'Registrar', label: 'Registrar' },
    { value: 'Lab Technician', label: 'Lab Technician' },
    { value: 'Radiologist', label: 'Radiologist' },
    { value: 'Pharmacist', label: 'Pharmacist' },
    { value: 'Physiotherapist', label: 'Physiotherapist' },
    { value: 'Surgeon', label: 'Surgeon' },
    { value: 'Anesthesiologist', label: 'Anesthesiologist' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Cleaner', label: 'Cleaner' },
    { value: 'Security Guard', label: 'Security Guard' },
    { value: 'Ambulance Driver', label: 'Ambulance Driver' },
    { value: 'HR Manager', label: 'HR Manager' },
    { value: 'IT Support', label: 'IT Support' },
    { value: 'Dietician', label: 'Dietician' },
    { value: 'Medical Officer', label: 'Medical Officer' },
    { value: 'Staff Nurse', label: 'Staff Nurse' },
    { value: 'OT Technician', label: 'OT Technician' },
    { value: 'ICU Staff', label: 'ICU Staff' },
    { value: 'OPD Staff', label: 'OPD Staff' },
    { value: 'Store Manager', label: 'Store Manager' },
    { value: 'Others', label: 'Others' }
  ];

  const qualificationOptionsByRole = {
    Doctor: [
      { value: 'MBBS', label: 'MBBS' },
      { value: 'MD', label: 'MD' },
      { value: 'MS', label: 'MS' },
      { value: 'DM', label: 'DM' },
      { value: 'DNB', label: 'DNB' },
      { value: 'MCh', label: 'MCh' }
    ],
    Nurse: [
      { value: 'ANM', label: 'ANM (Auxiliary Nurse Midwife)' },
      { value: 'GNM', label: 'GNM (General Nursing & Midwifery)' },
      { value: 'B.Sc Nursing', label: 'B.Sc Nursing' },
      { value: 'M.Sc Nursing', label: 'M.Sc Nursing' },
      { value: 'Post Basic B.Sc Nursing', label: 'Post Basic B.Sc Nursing' }
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
    Wardgirl: [
      { value: 'Basic Training', label: 'Basic Training in Patient Care' },
      { value: 'First Aid Certification', label: 'First Aid Certification' }
    ],
    Registrar: [
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
    'HR Manager': [
      { value: 'MBA HR', label: 'MBA in HR' },
      { value: 'PGDM HR', label: 'PGDM in HR' },
      { value: 'Graduate', label: 'Graduate in Any Stream' }
    ],
    'Security Guard': [
      { value: 'Security Training Certification', label: 'Security Training Certification' },
      { value: 'Ex-Army/Police', label: 'Ex-Army/Police Personnel' }
    ],
    Pharmacist: [
      { value: 'D.Pharm', label: 'D.Pharm (Diploma in Pharmacy)' },
      { value: 'B.Pharm', label: 'B.Pharm (Bachelor of Pharmacy)' },
      { value: 'M.Pharm', label: 'M.Pharm (Master of Pharmacy)' }
    ],
    Physiotherapist: [
      { value: 'BPT', label: 'BPT (Bachelor of Physiotherapy)' },
      { value: 'MPT', label: 'MPT (Master of Physiotherapy)' }
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

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Resigned', label: 'Resigned' },
    { value: 'Terminated', label: 'Terminated' }
  ];

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-600 mt-1">Fill the staff details to add them to the hospital system.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <FormInput 
            label="First Name" 
            value={formData.firstName} 
            onChange={(e) => handleInputChange('firstName', e.target.value)} 
            required 
            placeholder="Enter first name" 
          />
          <FormInput 
            label="Last Name" 
            value={formData.lastName} 
            onChange={(e) => handleInputChange('lastName', e.target.value)} 
            placeholder="Enter last name" 
          />
          <FormInput 
            label="Email" 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleInputChange('email', e.target.value)} 
            required 
            placeholder="Enter email" 
          />
          
          {/* Phone with validation */}
          <div className="space-y-1">
            <label className="block text-xs mt-2 font-bold text-gray-700 uppercase tracking-wide ml-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 10) val = val.slice(0, 10);
                setFormData(prev => ({ ...prev, phone: val }));
              }}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="^[6-9]\d{9}$"
              title="10 digit Indian mobile number starting with 6-9"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Role with Searchable Select */}
          <SearchableFormSelect 
            label="Role" 
            value={formData.role} 
            onChange={(e) => handleInputChange('role', e.target.value)} 
            options={roleOptions} 
            required 
            placeholder="Search or select role..."
          />
          
          {formData.role === 'Others' && (
            <FormInput 
              label="Please specify role" 
              value={customRole} 
              onChange={(e) => setCustomRole(e.target.value)} 
              required 
              placeholder="Enter custom role" 
            />
          )}

          {/* Department with Searchable Select */}
          <SearchableFormSelect 
            label="Department" 
            value={formData.department} 
            onChange={(e) => handleInputChange('department', e.target.value)} 
            options={departmentOptions} 
            required 
            placeholder={loading ? "Loading departments..." : "Search or select department..."}
            disabled={loading}
          />

          {/* Specialization and Registration */}
          <FormInput 
            label="Specialization" 
            value={formData.specialization} 
            onChange={(e) => handleInputChange('specialization', e.target.value)} 
            placeholder="e.g., ICU, Cardiology, Pediatrics" 
          />
          
          <FormInput 
            label="Registration No." 
            value={formData.registrationNo} 
            onChange={(e) => handleInputChange('registrationNo', e.target.value)} 
            placeholder="Enter registration number if any" 
          />

          {/* Joining Date and Gender */}
          <FormInput 
            label="Joining Date" 
            type="date" 
            value={formData.joiningDate} 
            onChange={(e) => handleInputChange('joiningDate', e.target.value)} 
            required 
          />
          
          <SearchableFormSelect 
            label="Gender" 
            value={formData.gender} 
            onChange={(e) => handleInputChange('gender', e.target.value)} 
            options={genderOptions} 
          />

          {/* Aadhar and PAN */}
          <FormInput
            label="Aadhar Number"
            value={formData.aadharNumber}
            onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Enter 12-digit Aadhar number"
            maxLength={12}
            inputMode="numeric"
            title="12 digit Aadhar number"
          />
          
          <FormInput
            label="PAN Number"
            value={formData.panNumber}
            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            placeholder="Enter PAN number (e.g. ABCDE1234F)"
            maxLength={10}
            title="PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)"
          />

          {/* Status */}
          <SearchableFormSelect 
            label="Status" 
            value={formData.status} 
            onChange={(e) => handleInputChange('status', e.target.value)} 
            options={statusOptions} 
          />

          {/* Qualification Details */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification Details {qualificationOptionsByRole[formData.role] && <span className="text-red-500">*</span>}
            </label>
            {qualificationOptionsByRole[formData.role] ? (
              <SearchableFormSelect
                value={formData.qualificationDetails}
                onChange={(e) => handleInputChange('qualificationDetails', e.target.value)}
                options={qualificationOptionsByRole[formData.role]}
                placeholder="Select qualification"
                required
              />
            ) : (
              <FormTextarea
                value={formData.qualificationDetails}
                onChange={(e) => handleInputChange('qualificationDetails', e.target.value)}
                placeholder="Enter qualifications, certifications, training details, etc."
                rows={3}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              type="button"
              onClick={() => navigate('/dashboard/admin/staff-list')}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffForm;