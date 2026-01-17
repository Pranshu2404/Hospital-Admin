import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';

const appointmentTypeOptions = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'surgery', label: 'Surgery Consultation' },
  { value: 'emergency', label: 'Emergency' }
];

const schedulingTypeOptions = [
  { value: 'time-based', label: 'Time-based' },
  { value: 'number-based', label: 'Number-based' }
];

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' }
];

const AddAppointmentModal = ({ isOpen, onClose, type = "ipd", hospitalId, fixedDoctorId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    duration: '30',
    type: 'time-based',
    appointment_type: 'consultation',
    priority: 'Normal',
    notes: '',
    paymentMethod: 'Cash',
    roomId: ''
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [includeRegistrationFee, setIncludeRegistrationFee] = useState(true);
  const [hospitalCharges, setHospitalCharges] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [chargesSummary, setChargesSummary] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [status, setStatus] = useState('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [existingPatients, setExistingPatients] = useState([]);

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

  // Fetch initial lists
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, departmentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`)
        ]);
        setPatients(patientRes.data);
        setFilteredPatients(patientRes.data);
        setDepartments(departmentRes.data);

        if (formData.department) {
          const selectedDep = departmentRes.data.find(d => d._id === formData.department);
          if (selectedDep && (selectedDep.name.startsWith('Emergency') || selectedDep.name === 'Emergency Department (ED/ER)')) {
            const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors`);
            setDoctors(doctorRes.data);
          } else {
            const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/department/${formData.department}`);
            setDoctors(doctorRes.data);
          }
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) fetchOptions();
  }, [isOpen, formData.department]);

  // Fetch hospital charges
  useEffect(() => {
    if (isOpen && hospitalId) {
      const fetchCharges = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospital-charges/${hospitalId}`);
          setHospitalCharges(res.data);
        } catch (err) {
          console.error("Failed to fetch hospital charges", err);
        }
      };
      fetchCharges();
    }
  }, [isOpen, hospitalId]);

  // Fetch available rooms if IPD
  useEffect(() => {
    if (isOpen && type === 'ipd') {
      const fetchRooms = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rooms?status=Available`);
          setRooms(res.data);
        } catch (err) {
          console.error("Failed to fetch rooms", err);
        }
      };
      fetchRooms();
    }
  }, [isOpen, type]);

  const [doctorWorkingHours, setDoctorWorkingHours] = useState([]); // Now an array of time ranges

  useEffect(() => {
    if (formData.doctorId && hospitalId) {
      const fetchDoctorData = async () => {
        try {
          // Fetch doctor details
          const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${formData.doctorId}`);
          setDoctorDetails(doctorRes.data);

          // Fetch today's schedule from calendar
          const calendarRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/calender/${hospitalId}/doctor/${formData.doctorId}/today`
          );
          const doctorData = calendarRes.data;
          let workingHours = [];
          if (doctorData.bookedAppointments.length > 0) {
            // Extract working hours from scheduled shifts
            const shifts = doctorData.bookedAppointments
              .filter(appt => !appt.appointmentId) // Filter out actual appointments
              .map(appt => ({
                start: appt.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end: appt.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));

            workingHours = shifts;
          } else if (doctorRes.data.timeSlots) {
            // For part-time doctors without shifts, use their timeSlots
            workingHours = doctorRes.data.timeSlots;
          }
          setDoctorWorkingHours(workingHours);

          // Set existing appointments
          const appointments = doctorData.bookedAppointments
            .filter(appt => appt.appointmentId) // Only actual appointments
            .map(appt => ({
              ...appt,
              start_time: new Date(appt.startTime),
              end_time: new Date(appt.endTime),
              patient_id: appt.appointmentId?.patient_id,
              appointment_type: appt.appointmentId?.appointment_type
            }));
          setExistingAppointments(appointments);

          // Set existing patients for number-based system
          if (formData.type === 'number-based') {
            const patients = doctorData.bookedPatients.map(patient => ({
              ...patient,
              patient_id: patient.patientId,
              serial_number: patient.serialNumber
            }));
            setExistingPatients(patients);
          }
        } catch (err) {
          console.error("Failed to fetch doctor data", err);
          setDoctorDetails(null);
          setDoctorWorkingHours([]);
          setExistingAppointments([]);
          setExistingPatients([]);
        }
      };
      fetchDoctorData();
    } else {
      setExistingAppointments([]);
      setExistingPatients([]);
      setDoctorWorkingHours([]);
    }
  }, [formData.doctorId, formData.type, hospitalId]);

  // Helper function to check if time is within any working hour range
  const isWithinWorkingHours = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    return doctorWorkingHours.some(range => {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);
      const startInMinutes = startH * 60 + startM;
      const endInMinutes = endH * 60 + endM;

      // Handle overnight shifts (end time is next day)
      if (endInMinutes <= startInMinutes) {
        return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
      }
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    });
  };

  // Helper to get min/max time for time input
  const getTimeConstraints = () => {
    if (doctorWorkingHours.length === 0) return {};

    // Find earliest start and latest end time
    let minTime = '23:59';
    let maxTime = '00:00';

    doctorWorkingHours.forEach(range => {
      if (range.start < minTime) minTime = range.start;
      if (range.end > maxTime) maxTime = range.end;
    });

    return { minTime, maxTime };
  };

  const { minTime, maxTime } = getTimeConstraints();

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours);
    start.setMinutes(minutes + parseInt(durationMinutes));
    return start.toTimeString().slice(0, 5);
  };

  const checkTimeSlotAvailability = (proposedStart, proposedEnd) => {
    // Convert proposed times to minutes for easier comparison
    const [startH, startM] = proposedStart.split(':').map(Number);
    const [endH, endM] = proposedEnd.split(':').map(Number);
    const proposedStartMin = startH * 60 + startM;
    const proposedEndMin = endH * 60 + endM;

    // Check against existing appointments
    for (const appt of existingAppointments) {
      const apptStart = new Date(appt.start_time);
      const apptEnd = new Date(appt.end_time);

      const apptStartMin = apptStart.getHours() * 60 + apptStart.getMinutes();
      const apptEndMin = apptEnd.getHours() * 60 + apptEnd.getMinutes();

      // Check for overlap
      if (
        (proposedStartMin >= apptStartMin && proposedStartMin < apptEndMin) ||
        (proposedEndMin > apptStartMin && proposedEndMin <= apptEndMin) ||
        (proposedStartMin <= apptStartMin && proposedEndMin >= apptEndMin)
      ) {
        return false; // Slot is not available
      }
    }

    return true; // Slot is available
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For time-based appointments, validate the selected time slot
      if (formData.type === 'time-based') {
        const proposedEnd = calculateEndTime(formData.start_time, formData.duration);
        const isAvailable = checkTimeSlotAvailability(formData.start_time, proposedEnd);

        if (!isAvailable) {
          alert('The selected time slot is not available. Please choose another time.');
          return;
        }
      }

      // Prepare appointment data
      const appointmentData = {
        patient_id: formData.patientId,
        doctor_id: fixedDoctorId || formData.doctorId,
        hospital_id: hospitalId,
        department_id: formData.department,
        appointment_date: formData.date,
        duration: parseInt(formData.duration),
        type: formData.type,
        appointment_type: formData.appointment_type,
        priority: formData.priority,
        notes: formData.notes,
        status: 'Scheduled',
        room_id: type === 'ipd' ? formData.roomId : null
      };

      // Add time-specific data if time-based appointment
      if (formData.type === 'time-based') {
        appointmentData.start_time = `${formData.date}T${formData.start_time}:00`;
        appointmentData.end_time = `${formData.date}T${calculateEndTime(formData.start_time, formData.duration)}:00`;
      } else {
        // For number-based, calculate serial number
        const lastSerial = existingPatients.length > 0
          ? Math.max(...existingPatients.map(p => p.serial_number))
          : 0;
        appointmentData.serial_number = lastSerial + 1;
      }

      // Create Appointment
      const appointmentRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/appointments`,
        appointmentData
      );

      const appointmentId = appointmentRes.data._id;

      // Create billing if needed
      if (chargesSummary.length > 0) {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/billing`, {
          patient_id: formData.patientId,
          appointment_id: appointmentId,
          payment_method: formData.paymentMethod,
          status: status,
          details: chargesSummary,
          items: chargesSummary
        });
      }

      alert('Appointment scheduled successfully!');
      onClose();
      setFormData({
        patientId: '',
        doctorId: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        duration: '30',
        type: 'time-based',
        appointment_type: 'consultation',
        priority: 'Normal',
        notes: '',
        roomId: '',
        paymentMethod: 'Cash'
      });
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      alert(err.response?.data?.error || 'Failed to schedule appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="max-w-4xl">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Patient Selection */}
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

            {/* Department and Doctor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Select Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
                required
              />

              {!fixedDoctorId && (
                <FormSelect
                  label="Select Doctor"
                  value={formData.doctorId}
                  onChange={(e) => handleInputChange('doctorId', e.target.value)}
                  options={(doctors || []).map(d => ({
                    value: d._id,
                    label: (d.isFullTime) ? `Dr. ${d.firstName} ${d.lastName} (Full Time)` : `Dr. ${d.firstName} ${d.lastName} (Part Time)`
                  }))}
                  required
                />
              )}
            </div>

            {/* Date, Type and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <FormSelect
                label="Scheduling Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                options={schedulingTypeOptions}
                required
              />

              <FormSelect
                label="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: '90', label: '1.5 hours' },
                  { value: '120', label: '2 hours' }
                ]}
                required
              />
            </div>

            {/* Appointment Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Appointment Type"
                value={formData.appointment_type}
                onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                options={appointmentTypeOptions}
                required
              />

              <FormSelect
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                options={priorityOptions}
              />
            </div>

            {/* Time Selection (for time-based appointments) */}
            {formData.type === 'time-based' && (
              <div className="space-y-2">
                <FormInput
                  label="Start Time (HH:MM)"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  required
                  min={minTime}
                  max={maxTime}
                  step="300" // 5 minute increments
                />
                <div className="text-sm text-gray-500">
                  <p>Doctor's available hours:</p>
                  <ul className="list-disc pl-5">
                    {doctorWorkingHours.map((range, i) => (
                      <li key={i}>
                        {range.start} to {range.end}
                        {doctorDetails?.isFullTime && ` (${doctorDetails.shift} shift)`}
                      </li>
                    ))}
                  </ul>
                </div>
                {formData.start_time && !isWithinWorkingHours(formData.start_time) && (
                  <p className="text-sm text-red-500">
                    Selected time is outside doctor's working hours
                  </p>
                )}
              </div>
            )}

            {/* Room Selection (for IPD) */}
            {type === 'ipd' && (
              <FormSelect
                label="Select Room"
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                options={rooms.map(r => ({
                  value: r._id,
                  label: `Room ${r.room_number} - ${r.type} (${r.ward || 'No Ward'})`
                }))}
                required
              />
            )}

            {/* Payment Method */}
            <FormSelect
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Net Banking', label: 'Net Banking' },
                { value: 'Insurance', label: 'Insurance' },
                { value: 'Government Funded Scheme', label: 'Government Funded Scheme' },
              ]}
              required
            />

            <FormSelect
              label="Bill Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Refunded', label: 'Refunded' }
              ]}
              required
            />

            {/* Registration Fee Checkbox */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="includeRegFee"
                checked={includeRegistrationFee}
                onChange={(e) => setIncludeRegistrationFee(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="includeRegFee" className="text-sm text-gray-700">
                Include Registration Fee
              </label>
            </div>

            {/* Notes */}
            <FormTextarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Enter any special instructions or notes for this appointment"
            />

            {/* Charges Summary */}
            {chargesSummary.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Charges Summary</h4>
                {chargesSummary.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{item.description}</span>
                    <span>₹{item.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 mt-2">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Doctor's Schedule */}
          <div className="lg:col-span-1 space-y-4">
            {formData.doctorId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-lg mb-3">
                  {formData.type === 'time-based' ? "Today's Schedule" : "Today's Patient Queue"}
                </h4>

                {formData.type === 'time-based' ? (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">
                      <p>Available Hours:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {doctorWorkingHours.map((range, i) => (
                          <li key={i}>
                            {range.start} - {range.end}
                            {doctorDetails?.isFullTime && ` (${doctorDetails.shift} shift)`}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {existingAppointments.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Booked Appointments:</p>
                        <div className="space-y-2">
                          {existingAppointments.map((appt, index) => (
                            <div key={index} className="bg-white p-2 rounded border">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                  {appt.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {' - '}
                                  {appt.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-gray-600">{appt.duration} mins</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {appt.patient_id?.first_name} {appt.patient_id?.last_name} - {appt.appointment_type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No appointments scheduled yet for today.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Current Queue:</p>
                    {existingPatients.length > 0 ? (
                      <div className="space-y-2">
                        {existingPatients.map((patient, index) => (
                          <div key={index} className="bg-white p-2 rounded border">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">#{patient.serial_number}</span>
                              <span className="text-gray-600">
                                {patient.patient_id?.first_name} {patient.patient_id?.last_name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {patient.appointment_type} - {patient.priority}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No patients in queue yet for today.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading ||
              (formData.type === 'time-based' &&
                formData.start_time &&
                !isWithinWorkingHours(formData.start_time))}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>

    </Modal>
  );
};

export default AddAppointmentModal;