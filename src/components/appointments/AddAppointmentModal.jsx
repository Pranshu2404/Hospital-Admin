import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

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

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`)
        ]);

        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) fetchOptions();
  }, [isOpen]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting appointment data:', formData);
  const payload = {
    patient_id: formData.patientId,
    doctor_id: formData.doctorId,
    department_id: formData.department,
    appointment_date: formData.date,
    time_slot: `${formData.time} - ${calculateEndTime(formData.time, formData.duration)}`,
    type: formData.type,
    priority: formData.priority,
    notes: formData.notes,
    status: 'Scheduled'
  };

  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, payload);
    onClose();
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
  } catch (err) {
    console.error('Error posting appointment:', err);
  }
};

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours);
    start.setMinutes(minutes + parseInt(durationMinutes));
    return start.toTimeString().slice(0, 5);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Patient and Doctor Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Select Patient"
            value={formData.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            options={patients.map(p => ({
              value: p._id,
              label: `${p.first_name} ${p.last_name}`
            }))}
            placeholder="Search by name"
            required
          />

          <FormSelect
            label="Select Department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={[
              { value: 'cardiology', label: 'Cardiology' },
              { value: 'orthopedics', label: 'Orthopedics' },
              { value: 'neurology', label: 'Neurology' },
              { value: 'general', label: 'General Medicine' }
              // Replace these with dynamic department _ids if needed
            ]}
            required
          />
        </div>

        <FormSelect
          label="Select Doctor"
          value={formData.doctorId}
          onChange={(e) => handleInputChange('doctorId', e.target.value)}
          options={doctors.map(d => ({
            value: d._id,
            label: `Dr. ${d.firstName} ${d.lastName}`
          }))}
          placeholder="Search doctor by name"
          required
        />

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <FormInput
            label="Start Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            required
          />
          <FormSelect
            label="Duration"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '1 hour' }
            ]}
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
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Schedule Appointment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;
