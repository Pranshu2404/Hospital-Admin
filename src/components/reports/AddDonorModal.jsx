import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button, FormCheckbox } from '../common/FormElements';

const AddDonorModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    medications: '',
    allergies: '',
    lastDonation: '',
    isFirstTime: true,
    consentGiven: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Donor data:', formData);
    onClose();
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalHistory: '',
      medications: '',
      allergies: '',
      lastDonation: '',
      isFirstTime: true,
      consentGiven: false
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Donor" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <FormSelect
            label="Blood Type"
            value={formData.bloodType}
            onChange={(e) => handleInputChange('bloodType', e.target.value)}
            options={bloodTypeOptions}
            placeholder="Select blood type"
            required
          />
        </div>

        {/* Address Information */}
        <FormTextarea
          label="Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter full address"
          rows={2}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            required
          />
          <FormInput
            label="State"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
            required
          />
          <FormInput
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
            required
          />
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Emergency Contact Name"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="Enter emergency contact name"
            required
          />
          <FormInput
            label="Emergency Contact Phone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
            placeholder="Enter emergency contact phone"
            required
          />
        </div>

        {/* Medical Information */}
        <FormTextarea
          label="Medical History"
          value={formData.medicalHistory}
          onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
          placeholder="Enter any relevant medical history"
          rows={2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormTextarea
            label="Current Medications"
            value={formData.medications}
            onChange={(e) => handleInputChange('medications', e.target.value)}
            placeholder="Enter current medications"
            rows={2}
          />
          <FormTextarea
            label="Allergies"
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder="Enter known allergies"
            rows={2}
          />
        </div>

        {/* Donation History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCheckbox
            label="First-time donor"
            checked={formData.isFirstTime}
            onChange={(e) => handleInputChange('isFirstTime', e.target.checked)}
          />
          {!formData.isFirstTime && (
            <FormInput
              label="Last Donation Date"
              type="date"
              value={formData.lastDonation}
              onChange={(e) => handleInputChange('lastDonation', e.target.value)}
            />
          )}
        </div>

        {/* Consent */}
        <FormCheckbox
          label="I consent to donate blood and understand the risks and benefits"
          checked={formData.consentGiven}
          onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
          required
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!formData.consentGiven}>
            Add Donor
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDonorModal;
