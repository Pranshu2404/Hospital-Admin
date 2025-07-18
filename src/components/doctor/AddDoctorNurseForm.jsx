


import { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, FormCheckbox, Button } from '../common/FormElements';
import { Link } from 'react-router-dom';

const AddDoctorNurseForm = () => {
  const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  department: '',
  specialization: '',
  licenseNumber: '',
  experience: '',
  education: '',
  shift: '', // Only if Full-time
  emergencyContact: '',
  emergencyPhone: '',
  startDate: '',
  isFullTime: true, // Toggle
  paymentType: 'Salary', // Default if full-time
  amount: '', // Replaces salary, feePerVisit, ratePerHour
  contractStartDate: '',
  contractEndDate: '',
  visitsPerWeek: '',
  workingDaysPerWeek: '',
  timeSlots: [{ start: '', end: '' }], // For part-time availability
  aadharNumber: '',
  panNumber: '',
  notes: ''
});

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotData, setForgotData] = useState({ username: '', phone: '' });

  const educationOptions = [
  { value: 'MBBS', label: 'MBBS' }, // Bachelor of Medicine, Bachelor of Surgery
  { value: 'BDS', label: 'BDS' }, // Bachelor of Dental Surgery
  { value: 'MD', label: 'MD' }, // Doctor of Medicine
  { value: 'MS', label: 'MS' }, // Master of Surgery
  { value: 'DNB', label: 'DNB' }, // Diplomate of National Board
  { value: 'DM', label: 'DM' }, // Doctorate of Medicine (super specialty)
  { value: 'MCh', label: 'MCh' }, // Master of Chirurgiae (super specialty)
  { value: 'PhD', label: 'PhD' }, // Doctor of Philosophy
  { value: 'Fellowship', label: 'Fellowship' }, // Sub-specialty training
  { value: 'Diploma', label: 'Diploma' }, // Short-term specialization
  { value: 'Resident Doctor', label: 'Resident Doctor' },
  { value: 'Intern', label: 'Intern' },
  { value: 'Trainee', label: 'Trainee' }
];


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        const departments = res.data?.map(dep => ({
          value: dep._id,
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

  const handleForgotChange = (field, value) => {
    setForgotData(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    alert(`Reset link sent for user: ${forgotData.username} and phone: ${forgotData.phone}`);
    setShowForgotModal(false);
    setForgotData({ username: '', phone: '' });
  };

  const handleTimeSlotChange = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.timeSlots];
      updated[idx][field] = value;
      return { ...prev, timeSlots: updated };
    });
  };

  const handleAddTimeSlot = () => {
    setFormData(prev => ({ ...prev, timeSlots: [...prev.timeSlots, { start: '', end: '' }] }));
  };

  const handleRemoveTimeSlot = (idx) => {
    setFormData(prev => ({ ...prev, timeSlots: prev.timeSlots.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctors`,
        formData
      );
      console.log('✅ Doctor added successfully:', response.data);
      alert('Doctor added successfully!');
    } catch (err) {
      console.error('❌ Error adding doctor:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add doctor.');
    }
  };

  const shiftOptions = [
    { value: 'Morning', label: 'Morning (7 AM - 3 PM)' },
    { value: 'Evening', label: 'Evening (3 PM - 11 PM)' },
    { value: 'Night', label: 'Night (11 PM - 7 AM)' },
    { value: 'Rotating', label: 'Rotating Shifts' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Doctor</h2>
          <p className="text-gray-600 mt-1">Enter staff information to create a new record</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} placeholder="Enter first name" required />
              <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} placeholder="Enter last name" required />
              <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter email address" required />
              <FormInput label="Password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Create password" required />
              <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Enter phone number" required />
              <FormInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required />
              <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} placeholder="Select gender" required />
              <FormInput label="Aadhar Number" value={formData.aadharNumber} onChange={(e) => handleInputChange('aadharNumber', e.target.value)} placeholder="Enter Aadhar number" maxLength={12} />
              <FormInput label="PAN Number" value={formData.panNumber} onChange={(e) => handleInputChange('panNumber', e.target.value)} placeholder="Enter PAN number" maxLength={10} />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Enter full address" rows={3} className="md:col-span-2" />
              <FormInput label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Enter city" />
              <FormInput label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="Enter state" />
              <FormInput label="ZIP Code" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} placeholder="Enter ZIP code" />
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} options={departmentOptions} placeholder="Select department" required />
              <FormInput label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="Enter specialization" />
              <FormInput label="Registration Number" value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} placeholder="Enter Registration number" required />
              <FormInput label="Years of Experience" type="number" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} placeholder="Enter years of experience" />
              
              {/* --- THIS SECTION WAS CHANGED --- */}
              {/* <FormSelect
                label="Shift"
                value={formData.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                options={shiftOptions}
                placeholder="Select shift"
                required
              /> */}
              <FormSelect
                label="Education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                options={educationOptions}
                placeholder="Select highest qualification"
                required
              />
              {/* --- END OF CHANGED SECTION --- */}
            </div>
          </div>

          {/* Employment Information */}
<div className="mb-8">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormInput label="Start Date" type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} required />
    
    {/* Full-time / Part-time toggle */}
    <FormSelect
      label="Employment Type"
      value={formData.isFullTime ? 'Full-time' : 'Part-time'}
      onChange={(e) => handleInputChange('isFullTime', e.target.value === 'Full-time')}
      options={[
        { value: 'Full-time', label: 'Full-time' },
        { value: 'Part-time', label: 'Part-time' }
      ]}
    />

    {formData.isFullTime ? (
      <>
        <FormSelect
          label="Shift"
          value={formData.shift}
          onChange={(e) => handleInputChange('shift', e.target.value)}
          options={shiftOptions}
          placeholder="Select shift"
          required
        />
        <FormInput
          label="Salary"
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          placeholder="Enter salary"
          required
        />
      </>
    ) : (
      <>
        <FormSelect
          label="Payment Type"
          value={formData.paymentType}
          onChange={(e) => handleInputChange('paymentType', e.target.value)}
          options={[
            { value: 'Fee per Visit', label: 'Fee per Visit' },
            { value: 'Per Hour', label: 'Per Hour' },
            { value: 'Contractual Salary', label: 'Contractual Salary' }
          ]}
          required
        />
        <FormInput
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          placeholder="Enter amount"
          required
        />
        <FormInput label="Contract Start Date" type="date" value={formData.contractStartDate} onChange={(e) => handleInputChange('contractStartDate', e.target.value)} />
        <FormInput label="Contract End Date" type="date" value={formData.contractEndDate} onChange={(e) => handleInputChange('contractEndDate', e.target.value)} />
        <FormInput label="Visits per Week" type="number" value={formData.visitsPerWeek} onChange={(e) => handleInputChange('visitsPerWeek', e.target.value)} />
        <FormInput label="Working Days per Week" type="number" value={formData.workingDaysPerWeek} onChange={(e) => handleInputChange('workingDaysPerWeek', e.target.value)} />
        
        {/* Time Slots */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
          {formData.timeSlots.map((slot, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="time" value={slot.start} onChange={(e) => handleTimeSlotChange(idx, 'start', e.target.value)} className="border px-2 py-1 rounded" />
              <span>to</span>
              <input type="time" value={slot.end} onChange={(e) => handleTimeSlotChange(idx, 'end', e.target.value)} className="border px-2 py-1 rounded" />
              <button type="button" className="text-red-500" onClick={() => handleRemoveTimeSlot(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={handleAddTimeSlot} className="text-blue-500 mt-2">+ Add Time Slot</button>
        </div>
      </>
    )}
  </div>
</div>


          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Contact Name" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} placeholder="Enter emergency contact name" />
              <FormInput label="Contact Phone" type="tel" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)} placeholder="Enter emergency contact phone" />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <FormTextarea label="Additional Notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Enter any additional notes or comments" rows={3} />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add Doctor</Button>
            <button type="button" onClick={() => setShowForgotModal(true)} className="text-blue-600 hover:underline hover:text-blue-800 transition">Forgot Password?</button>
          </div>
        </form>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Forgot Password</h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={forgotData.username} onChange={(e) => handleForgotChange('username', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={forgotData.phone} onChange={(e) => handleForgotChange('phone', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDoctorNurseForm;