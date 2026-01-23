import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button, SearchableFormSelect } from '../common/FormElements';

const AddBirthReportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    motherName: '',
    fatherName: '',
    date: '',
    time: '',
    babyGender: '',
    weight: '',
    height: '',
    deliveryType: '',
    doctorName: '',
    complications: '',
    roomNumber: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Birth report data:', formData);
    onClose();
    // Reset form
    setFormData({
      motherName: '',
      fatherName: '',
      date: '',
      time: '',
      babyGender: '',
      weight: '',
      height: '',
      deliveryType: '',
      doctorName: '',
      complications: '',
      roomNumber: '',
      notes: ''
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const deliveryTypeOptions = [
    { value: 'normal', label: 'Normal Delivery' },
    { value: 'c_section', label: 'C-Section' },
    { value: 'assisted', label: 'Assisted Delivery' },
    { value: 'vacuum', label: 'Vacuum Delivery' },
    { value: 'forceps', label: 'Forceps Delivery' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Birth Report" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parent Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Mother's Name"
            value={formData.motherName}
            onChange={(e) => handleInputChange('motherName', e.target.value)}
            placeholder="Enter mother's full name"
            required
          />
          <FormInput
            label="Father's Name"
            value={formData.fatherName}
            onChange={(e) => handleInputChange('fatherName', e.target.value)}
            placeholder="Enter father's full name"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date of Birth"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <FormInput
            label="Time of Birth"
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            required
          />
        </div>

        {/* Baby Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchableFormSelect
            label="Baby Gender"
            value={formData.babyGender}
            onChange={(e) => handleInputChange('babyGender', e.target.value)}
            options={genderOptions}
            placeholder="Select gender"
            required
          />
          <FormInput
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="0.0"
            required
          />
          <FormInput
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder="0"
            required
          />
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableFormSelect
            label="Delivery Type"
            value={formData.deliveryType}
            onChange={(e) => handleInputChange('deliveryType', e.target.value)}
            options={deliveryTypeOptions}
            placeholder="Select delivery type"
            required
          />
          <FormInput
            label="Room Number"
            value={formData.roomNumber}
            onChange={(e) => handleInputChange('roomNumber', e.target.value)}
            placeholder="Enter room number"
            required
          />
        </div>

        {/* Medical Information */}
        <FormInput
          label="Attending Doctor"
          value={formData.doctorName}
          onChange={(e) => handleInputChange('doctorName', e.target.value)}
          placeholder="Enter doctor's name"
          required
        />

        <FormTextarea
          label="Complications (if any)"
          value={formData.complications}
          onChange={(e) => handleInputChange('complications', e.target.value)}
          placeholder="Enter any complications during delivery"
          rows={3}
        />

        <FormTextarea
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Birth Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBirthReportModal;
