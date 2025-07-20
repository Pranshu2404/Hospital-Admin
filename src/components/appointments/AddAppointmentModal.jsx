// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Modal } from '../common/Modals';
// import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
// import { useNavigate } from 'react-router-dom';

// const typeOptions = [
//   { value: 'consultation', label: 'Consultation' },
//   { value: 'follow-up', label: 'Follow-up' },
//   { value: 'checkup', label: 'Checkup' },
//   { value: 'procedure', label: 'Procedure' },
//   { value: 'surgery', label: 'Surgery Consultation' },
//   { value: 'emergency', label: 'Emergency' }
// ];

// const priorityOptions = [
//   { value: 'Low', label: 'Low' },
//   { value: 'Normal', label: 'Normal' },
//   { value: 'High', label: 'High' },
//   { value: 'Urgent', label: 'Urgent' }
// ];

// const AddAppointmentModal = ({ isOpen, onClose, type }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     patientId: '',
//     doctorId: '',
//     department: '',
//     date: '',
//     time: '',
//     duration: '30',
//     type: '',
//     priority: 'Normal',
//     notes: ''
//   });

//   const [patients, setPatients] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [filteredPatients, setFilteredPatients] = useState([]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));

//     if (field === 'patientIdSearch') {
//   const keyword = value.toLowerCase();
//   const filtered = patients.filter(p =>
//     `${p.first_name} ${p.last_name}`.toLowerCase().includes(keyword) ||
//     (p.phone && p.phone.includes(keyword)) ||
//     (p.patientId && p.patientId.toLowerCase().includes(keyword))
//   );
//   setFilteredPatients(filtered);
// }
//   };

//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         const [patientRes, doctorRes, departmentRes] = await Promise.all([
//           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
//           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors`),
//           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`)
//         ]);

//         setPatients(patientRes.data);
//         setFilteredPatients(patientRes.data);
//         setDoctors(doctorRes.data);
//         setDepartments(departmentRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     if (isOpen) fetchOptions();
//   }, [isOpen]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       patient_id: formData.patientId,
//       doctor_id: formData.doctorId,
//       department_id: formData.department,
//       appointment_date: formData.date,
//       time_slot: `${formData.time} - ${calculateEndTime(formData.time, formData.duration)}`,
//       type: formData.type,
//       priority: formData.priority,
//       notes: formData.notes,
//       status: 'Scheduled'
//     };

//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, payload);
//       onClose();
//       setFormData({
//         patientId: '',
//         doctorId: '',
//         department: '',
//         date: '',
//         time: '',
//         duration: '30',
//         type: '',
//         priority: 'Normal',
//         notes: ''
//       });
//     } catch (err) {
//       console.error('Error posting appointment:', err);
//     }
//   };

//   const calculateEndTime = (startTime, durationMinutes) => {
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const start = new Date();
//     start.setHours(hours);
//     start.setMinutes(minutes + parseInt(durationMinutes));
//     return start.toTimeString().slice(0, 5);
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="max-w-3xl">
//       {type && (
//         <div className="mb-4">
//           <h3 className="text-xl font-semibold text-gray-800 capitalize">{type} Appointment</h3>
//           <div className="flex items-center justify-between mt-1">
//             <p className="text-sm text-gray-600">If the patient is not registered, you can add them below.</p>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 const path = type.toLowerCase() === 'ipd'
//                   ? '/dashboard/admin/patients/add-ipd'
//                   : '/dashboard/admin/patients/add-opd';
//                 navigate(path);
//               }}
//             >
//               + Add Patient
//             </Button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">

//         {/* Searchable Patient Selector */}
//         <FormInput
//           label="Search Patient (Name / Phone / Patient ID)"
//           value={formData.patientIdSearch || ''}
//           onChange={(e) => handleInputChange('patientIdSearch', e.target.value)}
//         />

//         <FormSelect
//           label="Select Patient"
//           value={formData.patientId}
//           onChange={(e) => handleInputChange('patientId', e.target.value)}
//           options={filteredPatients.map(p => ({
//             value: p._id,
//             label: `${p.first_name} ${p.last_name} - ${p.phone || ''} (${p.patientId || ''})`
//           }))}
//           required
//         />

//         {/* Doctor and Department */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormSelect
//             label="Select Department"
//             value={formData.department}
//             onChange={(e) => handleInputChange('department', e.target.value)}
//             options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
//             required
//           />
//           <FormSelect
//             label="Select Doctor"
//             value={formData.doctorId}
//             onChange={(e) => handleInputChange('doctorId', e.target.value)}
//             options={doctors.map(d => ({
//               value: d._id,
//               label: `Dr. ${d.firstName} ${d.lastName}`
//             }))}
//             required
//           />
//         </div>

//         {/* Date and Time */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <FormInput
//             label="Date"
//             type="date"
//             value={formData.date}
//             onChange={(e) => handleInputChange('date', e.target.value)}
//             required
//           />
//           <FormInput
//             label="Start Time"
//             type="time"
//             value={formData.time}
//             onChange={(e) => handleInputChange('time', e.target.value)}
//             required
//           />
//           <FormSelect
//             label="Duration"
//             value={formData.duration}
//             onChange={(e) => handleInputChange('duration', e.target.value)}
//             options={[
//               { value: '15', label: '15 minutes' },
//               { value: '30', label: '30 minutes' },
//               { value: '45', label: '45 minutes' },
//               { value: '60', label: '1 hour' }
//             ]}
//             required
//           />
//         </div>

//         {/* Type + Priority */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormSelect
//             label="Appointment Type"
//             value={formData.type}
//             onChange={(e) => handleInputChange('type', e.target.value)}
//             options={typeOptions}
//             required
//           />
//           <FormSelect
//             label="Priority"
//             value={formData.priority}
//             onChange={(e) => handleInputChange('priority', e.target.value)}
//             options={priorityOptions}
//           />
//         </div>

//         <FormTextarea
//           label="Notes"
//           value={formData.notes}
//           onChange={(e) => handleInputChange('notes', e.target.value)}
//           rows={3}
//         />

//         <div className="flex justify-end space-x-3 pt-4">
//           <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
//           <Button variant="primary" type="submit">Schedule Appointment</Button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default AddAppointmentModal;

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

const AddAppointmentModal = ({ isOpen, onClose, type, hospitalId }) => {
  const navigate = useNavigate();
  // console.log(hospitalId)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '30',
    type: '',
    priority: 'Normal',
    notes: '',
    paymentMethod: 'Cash',
    roomId: '' // For IPD
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]); // For IPD
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [includeRegistrationFee, setIncludeRegistrationFee] = useState(true);
  const [hospitalCharges, setHospitalCharges] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [chargesSummary, setChargesSummary] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [status, setStatus] = useState('Pending');
  // const [paymentMethod, setPaymentMethod] = useState('Cash');
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

  // ✅ Fetch initial lists
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, departmentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`)
        ]);
        // const doctorRes = axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/department/${formData.department}`);
        setPatients(patientRes.data);
        setFilteredPatients(patientRes.data);
        setDepartments(departmentRes.data);

        if (formData.department) {
        const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/department/${formData.department}`);
        setDoctors(doctorRes.data);
        // console.log(doctorRes.data)
      } else {
        setDoctors([]); // Prevent undefined
      }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) fetchOptions();
  }, [isOpen, formData]);

  // ✅ Fetch hospital charges
  useEffect(() => {
    if (isOpen && hospitalId) {
      const fetchCharges = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hospital-charges/${hospitalId}`);
          setHospitalCharges(res.data);
        } catch (err) {
          console.error("Failed to fetch hospital charges", err);
        }
      };
      fetchCharges();
    }
  }, [isOpen, hospitalId]);

  // ✅ Fetch available rooms if IPD
  useEffect(() => {
    if (isOpen && type === 'ipd') {
      const fetchRooms = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rooms?status=Available`);
          setRooms(res.data);
        } catch (err) {
          console.error("Failed to fetch rooms", err);
        }
      };
      fetchRooms();
    }
  }, [isOpen, type]);

  // ✅ Fetch doctor details when selected
  useEffect(() => {
    if (formData.doctorId) {
      const fetchDoctorDetails = async () => {
        try {
          const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/${formData.doctorId}`);
          setDoctorDetails(doctorRes.data);
        } catch (err) {
          console.error("Failed to fetch doctor details", err);
        }
      };
      fetchDoctorDetails();
    }
  }, [formData.doctorId]);
  let isNewPatient=includeRegistrationFee;
  useEffect(() => {
    if (!hospitalCharges) return;

    let details = [];
    let total = 0;
    console.log(hospitalCharges.opdCharges)
    if (type === 'opd' && hospitalCharges.opdCharges) {
    if (isNewPatient) {
      const regFee = hospitalCharges.opdCharges.registrationFee || 0;
      details.push({ description: "OPD Registration Fee", amount: regFee });
      total += regFee;
    }
    const consultFee = hospitalCharges.opdCharges.consultationFee || 0;
    details.push({ description: "OPD Consultation Fee", amount: consultFee });
    total += consultFee;

    if (hospitalCharges.opdCharges.discountValue > 0) {
      let discount = 0;
      if (hospitalCharges.opdCharges.discountType === 'Percentage') {
        discount = (total * hospitalCharges.opdCharges.discountValue) / 100;
      } else {
        discount = hospitalCharges.opdCharges.discountValue;
      }
      details.push({ description: "Discount", amount: -discount });
      total -= discount;
    }
  }

  if (type === 'ipd' && hospitalCharges.ipdCharges) {
    const admissionFee = hospitalCharges.ipdCharges.admissionFee || 0;
    details.push({ description: "Admission Fee", amount: admissionFee });
    total += admissionFee;

    if (isNewPatient) {
      const regFee = hospitalCharges.ipdCharges.registrationFee || 0;
      details.push({ description: "Registration Fee", amount: regFee });
      total += regFee;
    }

    const selectedRoom = rooms.find(r => r._id === formData.roomId);
    if (selectedRoom) {
      const roomCharge = hospitalCharges.ipdCharges.roomCharges.find(rc => rc.type === selectedRoom.type)?.chargePerDay || 0;
      details.push({ description: `Room Charge (${selectedRoom.type})`, amount: roomCharge });
      total += roomCharge;
    }
  }

    if (doctorDetails) {
      if (doctorDetails.type === "part-time" && doctorDetails.payPerHour) {
        const hours = Number(formData.duration) / 60;
        const docFee = doctorDetails.payPerHour * hours;
        details.push({ description: `Doctor Fee (${hours} hr)`, amount: docFee });
        total += docFee;
      } else {
        const docFee = doctorDetails.consultationFee || 0;
        details.push({ description: "Doctor Consultation Fee", amount: docFee });
        total += docFee;
      }
    }

    setChargesSummary(details);
    setTotalAmount(total > 0 ? total : 0);
  }, [hospitalCharges, doctorDetails, formData.duration, formData.type, formData.roomId, rooms]);

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours);
    start.setMinutes(minutes + parseInt(durationMinutes));
    return start.toTimeString().slice(0, 5);
  };

  // ✅ Submit: Create Appointment + Bill
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create Appointment
      console.log(formData)
      const appointmentRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        department_id: formData.department,
        appointment_date: formData.date,
        time_slot: `${formData.time} - ${calculateEndTime(formData.time, formData.duration)}`,
        type: formData.type,
        priority: formData.priority,
        notes: formData.notes,
        status: 'Scheduled',
        room_id: type === 'ipd' ? formData.roomId : null
      });

      const appointmentId = appointmentRes.data._id;
       console.log(totalAmount, chargesSummary, appointmentId)

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/billing`, {
        patient_id: formData.patientId,
        appointment_id: appointmentId,
        // total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        status: status,
        details: chargesSummary,
        items: chargesSummary // ✅ Correct key
      });

      alert('Appointment scheduled and bill generated!');
      onClose();
      setFormData({
        patientId: '',
        doctorId: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: '30',
        type: '',
        priority: 'Normal',
        notes: '',
        roomId: '',
        paymentMethod: 'Cash'
      });
    } catch (err) {
      console.error('Error scheduling appointment or generating bill:', err);
      alert('Failed to schedule appointment or generate bill.');
    }
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
        {/* <FormInput
          label="Search Patient (Name / Phone / Patient ID)"
          value={formData.patientIdSearch || ''}
          onChange={(e) => handleInputChange('patientIdSearch', e.target.value)}
        /> */}

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
            options={(doctors || []).map(d => ({
              value: d._id,
              label: (d.isFullTime) ? `Dr. ${d.firstName} ${d.lastName} (Full Time)` : `Dr. ${d.firstName} ${d.lastName} (Part Time)`
            }))}
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={formData.date || new Date().toISOString().split('T')[0]}
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

        {/* IPD Room Selection */}
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
        <FormSelect
  label="Payment Method"
  value={formData.paymentMethod || 'Cash'}
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
      // { value: 'Cancelled', label: 'Cancelled' }
    ]}
    required
  />
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

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Schedule Appointment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;

