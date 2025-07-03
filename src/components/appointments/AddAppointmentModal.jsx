import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';

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

const AddAppointmentModal = ({ isOpen, onClose, type }) => {
  const navigate = useNavigate();

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
  const [departments, setDepartments] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'patientIdSearch') {
  const keyword = value.toLowerCase();
  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(keyword) ||
    (p.phone && p.phone.includes(keyword)) ||
    (p.patientId && p.patientId.toLowerCase().includes(keyword))
  );
  setFilteredPatients(filtered);
}
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, doctorRes, departmentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`)
        ]);

        setPatients(patientRes.data);
        setFilteredPatients(patientRes.data);
        setDoctors(doctorRes.data);
        setDepartments(departmentRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) fetchOptions();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="max-w-3xl">
      {type && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 capitalize">{type} Appointment</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600">If the patient is not registered, you can add them below.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const path = type.toLowerCase() === 'ipd'
                  ? '/dashboard/admin/patients/add-ipd'
                  : '/dashboard/admin/patients/add-opd';
                navigate(path);
              }}
            >
              + Add Patient
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Searchable Patient Selector */}
        <FormInput
          label="Search Patient (Name / Phone / Patient ID)"
          value={formData.patientIdSearch || ''}
          onChange={(e) => handleInputChange('patientIdSearch', e.target.value)}
        />

        <FormSelect
          label="Select Patient"
          value={formData.patientId}
          onChange={(e) => handleInputChange('patientId', e.target.value)}
          options={filteredPatients.map(p => ({
            value: p._id,
            label: `${p.first_name} ${p.last_name} - ${p.phone || ''} (${p.patientId || ''})`
          }))}
          required
        />

        {/* Doctor and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Select Department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
            required
          />
          <FormSelect
            label="Select Doctor"
            value={formData.doctorId}
            onChange={(e) => handleInputChange('doctorId', e.target.value)}
            options={doctors.map(d => ({
              value: d._id,
              label: `Dr. ${d.firstName} ${d.lastName}`
            }))}
            required
          />
        </div>

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

        {/* Type + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Appointment Type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            options={typeOptions}
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
