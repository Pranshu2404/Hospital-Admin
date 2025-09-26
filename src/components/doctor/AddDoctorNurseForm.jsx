import { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, FormCheckbox, Button } from '../common/FormElements';
import { Link } from 'react-router-dom';

const AddDoctorNurseForm = () => {
  // Function to get today's date in YYYY-MM-DD format
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
    startDate: getTodayDate(),
    isFullTime: true, // Toggle
    paymentType: 'Salary', // Default if full-time
    amount: '', // Replaces salary, feePerVisit, ratePerHour
    contractStartDate: '',
    contractEndDate: '',
    visitsPerWeek: '',
    workingDaysPerWeek: [], // For part-time doctors - array of selected days
    timeSlots: [{ start: '', end: '' }], // For part-time availability
    aadharNumber: '',
    panNumber: '',
    notes: ''
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotData, setForgotData] = useState({ username: '', phone: '' });
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [tempTimeSlots, setTempTimeSlots] = useState([{ start: '', end: '' }]);

  const educationOptions = [
    { value: 'MBBS', label: 'MBBS' },
    { value: 'BDS', label: 'BDS' },
    { value: 'MD', label: 'MD' },
    { value: 'MS', label: 'MS' },
    { value: 'DNB', label: 'DNB' },
    { value: 'DM', label: 'DM' },
    { value: 'MCh', label: 'MCh' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Fellowship', label: 'Fellowship' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Resident Doctor', label: 'Resident Doctor' },
    { value: 'Intern', label: 'Intern' },
    { value: 'Trainee', label: 'Trainee' }
  ];

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
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

  const handleTempTimeSlotChange = (idx, field, value) => {
    setTempTimeSlots(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleAddTimeSlot = () => {
    setTempTimeSlots(prev => [...prev, { start: '', end: '' }]);
  };

  const handleRemoveTimeSlot = (idx) => {
    setTempTimeSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveTimeSlots = () => {
    // Filter out empty time slots
    const filteredSlots = tempTimeSlots.filter(slot => slot.start && slot.end);
    setFormData(prev => ({ ...prev, timeSlots: filteredSlots }));
    setShowTimeSlotModal(false);
  };

  const handleWorkingDaysChange = (e) => {
  const day = String(e.target.value); // Ensure it's a string
  const isChecked = e.target.checked;
  
  setFormData(prev => {
    const prevDays = Array.isArray(prev.workingDaysPerWeek) ? prev.workingDaysPerWeek : []; // Safeguard against non-array values

    if (isChecked) {
      // Add day only if it doesn't already exist and is a valid string
      if (day && !prevDays.includes(day)) {
        return { 
          ...prev, 
          workingDaysPerWeek: [...prevDays, day] 
        };
      }
    } else {
      // Remove the day
      return { 
        ...prev, 
        workingDaysPerWeek: prevDays.filter(d => d !== day) 
      };
    }
    
    // Return previous state if no change occurred
    return prev;
  });
};

  const handleShiftChange = (value) => {
    setFormData(prev => ({
      ...prev,
      shift: value
    }));
    
    // If rotating shift is selected, set default time slots
    if (value === 'Rotating') {
      setFormData(prev => ({
        ...prev,
        timeSlots: [
          { start: '07:00', end: '15:00' },
          { start: '15:00', end: '23:00' },
          { start: '23:00', end: '07:00' }
        ]
      }));
    } else {
      // For fixed shifts, set appropriate time slots
      let timeSlots = [];
      switch(value) {
        case 'Morning':
          timeSlots = [{ start: '07:00', end: '15:00' }];
          break;
        case 'Evening':
          timeSlots = [{ start: '15:00', end: '23:00' }];
          break;
        case 'Night':
          timeSlots = [{ start: '23:00', end: '07:00' }];
          break;
        default:
          timeSlots = [{ start: '', end: '' }];
      }
      setFormData(prev => ({ ...prev, timeSlots }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        // For full-time doctors, ensure workingDaysPerWeek is not sent
        workingDaysPerWeek: formData.isFullTime ? [] : formData.workingDaysPerWeek,
        // For part-time doctors, ensure shift is not sent
        shift: formData.isFullTime ? formData.shift : ''
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctors`,
        submissionData
      );
      console.log('✅ Doctor added successfully:', response.data);
      alert('Doctor added successfully!');
    } catch (err) {
      console.error('❌ Error adding doctor:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add doctor.');
    }
  };

  const handleEmploymentTypeChange = (isFullTime) => {
  setFormData(prev => ({
    ...prev,
    isFullTime,
    // Clear working days when switching to full-time
    workingDaysPerWeek: isFullTime ? [] : prev.workingDaysPerWeek
  }));
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
              <FormSelect
                label="Education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                options={educationOptions}
                placeholder="Select highest qualification"
                required
              />
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
                onChange={(e) => handleEmploymentTypeChange(e.target.value === 'Full-time')}
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
                    onChange={(e) => handleShiftChange(e.target.value)}
                    options={shiftOptions}
                    placeholder="Select shift"
                    required
                  />
                  
                  {/* Display time slots for full-time doctors */}
                  {formData.shift && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        {formData.shift === 'Rotating' ? (
                          <div>
                            <p className="text-sm text-gray-600">Rotating shifts cover all time periods:</p>
                            <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                              <li>Morning: 7 AM - 3 PM</li>
                              <li>Evening: 3 PM - 11 PM</li>
                              <li>Night: 11 PM - 7 AM</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {formData.timeSlots.map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="text-sm font-medium">{slot.start} to {slot.end}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {formData.shift === 'Rotating' && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setTempTimeSlots(formData.timeSlots);
                              setShowTimeSlotModal(true);
                            }}
                            className="mt-2 text-blue-600 text-sm hover:underline"
                          >
                            Customize Time Slots
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                  
                  {/* Working Days Selection for Part-time Doctors */}
                  <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Working Days per Week
  </label>
  <div className="flex flex-wrap gap-3">
    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
      <label key={day} className="inline-flex items-center">
        <input
          type="checkbox"
          value={day}
          checked={formData.workingDaysPerWeek.includes(day)}
          onChange={handleWorkingDaysChange} // Directly use the handler
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2 text-sm text-gray-700">{day}</span>
      </label>
    ))}
  </div>
</div>
                  
                  {/* Time Slots for Part-time Doctors */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
                    {formData.timeSlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input 
                          type="time" 
                          value={slot.start} 
                          onChange={(e) => handleTimeSlotChange(idx, 'start', e.target.value)} 
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <span className="text-gray-600">to</span>
                        <input 
                          type="time" 
                          value={slot.end} 
                          onChange={(e) => handleTimeSlotChange(idx, 'end', e.target.value)} 
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              timeSlots: prev.timeSlots.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          timeSlots: [...prev.timeSlots, { start: '', end: '' }]
                        }));
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Time Slot
                    </button>
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

      {/* Time Slot Modal for Rotating Shift */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Customize Time Slots</h3>
            <div className="space-y-4">
              {tempTimeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="time" 
                    value={slot.start} 
                    onChange={(e) => handleTempTimeSlotChange(idx, 'start', e.target.value)} 
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <span className="text-gray-600">to</span>
                  <input 
                    type="time" 
                    value={slot.end} 
                    onChange={(e) => handleTempTimeSlotChange(idx, 'end', e.target.value)} 
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTimeSlot(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddTimeSlot}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Another Time Slot
              </button>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                onClick={() => setShowTimeSlotModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveTimeSlots}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDoctorNurseForm;