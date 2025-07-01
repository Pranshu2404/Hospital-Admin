import { useState } from 'react';
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
    role: 'Doctor', // Set default role to Doctor
    department: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    education: '',
    shift: '',
    emergencyContact: '',
    emergencyPhone: '',
    startDate: '',
    salary: '',
    isFullTime: true,
    hasInsurance: true,
    notes: '',
    paymentType: '',
    contractualSalary: '',
    feePerVisit: '',
    ratePerHour: '',
    contractStartDate: '',
    contractEndDate: '',
    visitsPerWeek: '',
    workingDaysPerWeek: '',
    timeSlots: [{ start: '', end: '' }],
    aadharNumber: '',
    panNumber: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

const [showForgotModal, setShowForgotModal] = useState(false);
const [forgotData, setForgotData] = useState({ username: '', phone: '' });

  const handleForgotChange = (field, value) => {
    setForgotData(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    alert(`Reset link sent for user: ${forgotData.username} and phone: ${forgotData.phone}`);
    setShowForgotModal(false); // Close modal
    setForgotData({ username: '', phone: '' }); // Clear fields
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


  const roleOptions = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Technician', label: 'Technician' },
    { value: 'Administrator', label: 'Administrator' }
  ];

  const departmentOptions = [
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'ICU', label: 'ICU' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Radiology', label: 'Radiology' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Pharmacy', label: 'Pharmacy' }
  ];

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
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
              <FormInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create password"
                required
              />

              <FormInput
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                required
              />
              <FormInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
              <FormSelect
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={genderOptions}
                placeholder="Select gender"
                required
              />
              <FormInput
                label="Aadhar Number"
                value={formData.aadharNumber}
                onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                placeholder="Enter Aadhar number"
                maxLength={12}
              />
              <FormInput
                label="PAN Number"
                value={formData.panNumber}
                onChange={(e) => handleInputChange('panNumber', e.target.value)}
                placeholder="Enter PAN number"
                maxLength={10}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={3}
                className="md:col-span-2"
              />
              <FormInput
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
              <FormInput
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
              />
              <FormInput
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <FormSelect
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={roleOptions}
                placeholder="Select role"
                required
              /> */}
              <FormSelect
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departmentOptions}
                placeholder="Select department"
                required
              />
              <FormInput
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Enter specialization"
              />
              <FormInput
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />
              <FormInput
                label="Years of Experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Enter years of experience"
              />
              <FormSelect
                label="Shift"
                value={formData.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                options={shiftOptions}
                placeholder="Select shift"
                required
              />
              <FormTextarea
                label="Education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Enter educational background"
                rows={3}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
              <FormInput
                label="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Enter annual salary"
              />
              <FormCheckbox
                label="Full-time Employee"
                checked={formData.isFullTime}
                onChange={(e) => handleInputChange('isFullTime', e.target.checked)}
              />
              <FormCheckbox
                label="Has Health Insurance"
                checked={formData.hasInsurance}
                onChange={(e) => handleInputChange('hasInsurance', e.target.checked)}
              />
              {/* Show contractual fields if not full-time */}
              {!formData.isFullTime && (
                <>
                  <FormSelect
                    label="Payment Type"
                    value={formData.paymentType}
                    onChange={e => handleInputChange('paymentType', e.target.value)}
                    options={[
                      { value: 'Fee per Visit', label: 'Fee per Visit' },
                      { value: 'Per Hour', label: 'Per Hour' },
                      { value: 'Contractual Salary', label: 'Contractual Salary' }
                    ]}
                    placeholder="Select payment type"
                    required
                  />
                  {formData.paymentType === 'Fee per Visit' && (
                    <FormInput
                      label="Fee per Visit"
                      type="number"
                      value={formData.feePerVisit}
                      onChange={e => handleInputChange('feePerVisit', e.target.value)}
                      placeholder="Enter fee per visit"
                      required
                    />
                  )}
                  {formData.paymentType === 'Per Hour' && (
                    <FormInput
                      label="Rate per Hour"
                      type="number"
                      value={formData.ratePerHour}
                      onChange={e => handleInputChange('ratePerHour', e.target.value)}
                      placeholder="Enter rate per hour"
                      required
                    />
                  )}
                  {formData.paymentType === 'Contractual Salary' && (
                    <FormInput
                      label="Contractual Salary"
                      type="number"
                      value={formData.contractualSalary}
                      onChange={e => handleInputChange('contractualSalary', e.target.value)}
                      placeholder="Enter contractual salary"
                      required
                    />
                  )}
                  <FormInput
                    label="Contract Start Date"
                    type="date"
                    value={formData.contractStartDate}
                    onChange={e => handleInputChange('contractStartDate', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Contract End Date"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={e => handleInputChange('contractEndDate', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Visits per Week"
                    type="number"
                    value={formData.visitsPerWeek}
                    onChange={e => handleInputChange('visitsPerWeek', e.target.value)}
                    placeholder="Enter number of visits per week"
                  />
                  <div className="flex flex-col md:flex-row md:col-span-2 gap-4">
                    <div className="flex-1">
                      <FormInput
                        label="Working Days per Week"
                        type="number"
                        value={formData.workingDaysPerWeek}
                        onChange={e => handleInputChange('workingDaysPerWeek', e.target.value)}
                        placeholder="Enter working days per week"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots Available</label>
                      <div className="space-y-2">
                        {formData.timeSlots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="time"
                              className="border rounded px-2 py-1"
                              value={slot.start}
                              onChange={e => handleTimeSlotChange(idx, 'start', e.target.value)}
                              required
                            />
                            <span className="mx-1">to</span>
                            <input
                              type="time"
                              className="border rounded px-2 py-1"
                              value={slot.end}
                              onChange={e => handleTimeSlotChange(idx, 'end', e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="ml-2 text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded"
                              onClick={() => handleRemoveTimeSlot(idx)}
                              disabled={formData.timeSlots.length === 1}
                            >Remove</button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-2 text-teal-700 border border-teal-300 px-3 py-1 rounded hover:bg-teal-50 text-sm"
                          onClick={handleAddTimeSlot}
                        >+ Add Time Slot</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Contact Name"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Enter emergency contact name"
              />
              <FormInput
                label="Contact Phone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <FormTextarea
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes or comments"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Staff Member
            </Button>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-600 hover:underline hover:text-blue-800 transition"
            >Forgot Password?</button>
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
                <input
                  type="text"
                  value={forgotData.username}
                  onChange={(e) => handleForgotChange('username', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={forgotData.phone}
                  onChange={(e) => handleForgotChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default AddDoctorNurseForm;
