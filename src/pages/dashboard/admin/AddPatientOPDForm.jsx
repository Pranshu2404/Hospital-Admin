import { useState, useEffect } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPatientOPDForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    age: '',
    doctorId: '',
    department: '',
    date: '',
    time: '',
    duration: '30',
    type: '',
    priority: 'Normal',
    notes: '',
    patientType: 'OPD'
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDoctorsAndDepartments = async () => {
      try {
        const [doctorRes, deptRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`)
        ]);
        setDoctors(doctorRes.data);
        setDepartments(deptRes.data);
      } catch (error) {
        console.error('Error fetching doctors or departments:', error);
      }
    };
    fetchDoctorsAndDepartments();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours);
    start.setMinutes(minutes + parseInt(durationMinutes));
    return start.toTimeString().slice(0, 5);
  };

  const calculateDOBFromAge = (age) => {
    const today = new Date();
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    return dob.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const patientPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: calculateDOBFromAge(formData.age),
        blood_group: formData.bloodGroup,
        patient_type: "opd"
      };

      const patientRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients`,
        patientPayload
      );
      const patientId = patientRes.data._id;

      const appointmentPayload = {
        patient_id: patientId,
        doctor_id: formData.doctorId,
        department_id: formData.department,
        appointment_date: formData.date,
        time_slot: `${formData.time} - ${calculateEndTime(formData.time, formData.duration)}`,
        type: formData.type,
        priority: formData.priority,
        notes: formData.notes,
        status: 'Scheduled'
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, appointmentPayload);

      alert('Patient and appointment added successfully!');
      navigate('/dashboard/admin/appointments?type=opd');

    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add patient or appointment.');
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
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

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Patient & Schedule Appointment</h2>
          <p className="text-gray-600 mt-1">Fill in basic patient info and appointment details.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
              <FormInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
              <FormInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
              <FormInput label="Age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} required />
              <FormSelect label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
              <FormSelect label="Blood Group" value={formData.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} options={bloodGroupOptions} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departments.map(d => ({
                  value: d._id,
                  label: d.name
                }))}
                required
              />
              <FormSelect
                label="Doctor"
                value={formData.doctorId}
                onChange={(e) => handleInputChange('doctorId', e.target.value)}
                options={doctors.map(d => ({
                  value: d._id,
                  label: `Dr. ${d.firstName} ${d.lastName}`
                }))}
                required
              />
              <FormInput label="Date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} required />
              <FormInput label="Start Time" type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} required />
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
              <FormSelect label="Appointment Type" value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} options={typeOptions} required />
              <FormSelect label="Priority" value={formData.priority} onChange={(e) => handleInputChange('priority', e.target.value)} options={priorityOptions} />
            </div>
            <FormTextarea label="Notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add Patient & Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientOPDForm;
