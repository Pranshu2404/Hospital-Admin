import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

const AddAppointmentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    time: '',
    duration: '30',
    type: '',
    priority: 'Normal',
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
    console.log('Appointment data:', formData);
    onClose();
    // Reset form
    setFormData({
      patientId: '',
      doctorId: '',
      department: '',
      date: '',
      time: '',
      duration: '30',
      type: '',
      priority: 'Normal',
      notes: ''
    });
  };

  const departmentOptions = [
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const doctorOptions = [
    { value: 'dr-wilson', label: 'Dr. Sarah Wilson' },
    { value: 'dr-chen', label: 'Dr. Michael Chen' },
    { value: 'dr-anderson', label: 'Dr. Lisa Anderson' },
    { value: 'dr-brown', label: 'Dr. James Brown' },
    { value: 'dr-davis', label: 'Dr. Emily Davis' }
  ];

  const typeOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'checkup', label: 'Checkup' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'surgery', label: 'Surgery Consultation' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient and Doctor Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Patient ID"
            value={formData.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            placeholder="Enter patient ID or search"
            required
          />
          <FormSelect
            label="Department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={departmentOptions}
            placeholder="Select department"
            required
          />
        </div>

        <FormSelect
          label="Doctor"
          value={formData.doctorId}
          onChange={(e) => handleInputChange('doctorId', e.target.value)}
          options={doctorOptions}
          placeholder="Select doctor"
          required
        />

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <FormInput
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            required
          />
          <FormSelect
            label="Duration"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            options={durationOptions}
            required
          />
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Appointment Type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            options={typeOptions}
            placeholder="Select type"
            required
          />
          <FormSelect
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            options={priorityOptions}
          />
        </div>

        <FormTextarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes or special instructions"
          rows={3}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Schedule Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;
