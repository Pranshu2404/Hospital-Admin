import { useState, useEffect } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';
import AppointmentSlipModal from './AppointmentSlipModal';
import QRCodeModal from './QRCodeModal';

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

const AddIPDAppointment = ({ type = "ipd", fixedDoctorId, embedded = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: fixedDoctorId || '',
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

  const [formData2, setFormData2] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    age: ''
  })

  const hospitalId = localStorage.getItem('hospitalId');

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
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [existingPatients, setExistingPatients] = useState([]);
  const [doctorWorkingHours, setDoctorWorkingHours] = useState([]);
  const [slipModal, setSlipModal] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [submitDetails, setSubmitDetails] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({ imageUrl: '', orderId: '' });
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [showFields, setShowFields] = useState(false)

  // Calculate charges whenever relevant form data changes
  useEffect(() => {
  calculateCharges();
}, [formData.appointment_type, formData.doctorId, formData.duration, includeRegistrationFee, formData.roomId, type]);

const calculateCharges = () => {
  let charges = [];
  let total = 0;

  // Check if patient is new (assuming this based on includeRegistrationFee)
  const isNewPatient = includeRegistrationFee;

  // Add OPD charges if applicable
  if (type === 'opd' && hospitalCharges?.opdCharges) {
    if (isNewPatient) {
      const regFee = hospitalCharges.opdCharges.registrationFee || 0;
      charges.push({
        description: "OPD Registration Fee",
        amount: regFee
      });
      total += regFee;
    }
    
    const consultFee = hospitalCharges.opdCharges.consultationFee || 0;
    charges.push({
      description: "OPD Consultation Fee",
      amount: consultFee
    });
    total += consultFee;
    
    if (hospitalCharges.opdCharges.discountValue > 0) {
      let discount = 0;
      if (hospitalCharges.opdCharges.discountType === 'Percentage') {
        discount = (total * hospitalCharges.opdCharges.discountValue) / 100;
      } else {
        discount = hospitalCharges.opdCharges.discountValue;
      }
      charges.push({
        description: "Discount",
        amount: -discount
      });
      total -= discount;
    }
  }

  // Add IPD charges if applicable
  if (type === 'ipd' && hospitalCharges?.ipdCharges) {
    const admissionFee = hospitalCharges.ipdCharges.admissionFee || 0;
    charges.push({
      description: "Admission Fee",
      amount: admissionFee
    });
    total += admissionFee;
    
    if (isNewPatient) {
      const regFee = hospitalCharges.ipdCharges.registrationFee || 0;
      charges.push({
        description: "Registration Fee",
        amount: regFee
      });
      total += regFee;
    }
    
    // Add room charges if room is selected
    if (formData.roomId) {
      const selectedRoom = rooms.find(r => r._id === formData.roomId);
      if (selectedRoom) {
        const roomCharge = hospitalCharges.ipdCharges.roomCharges?.find(rc => rc.type === selectedRoom.type)?.chargePerDay || 0;
        charges.push({
          description: `Room Charge (${selectedRoom.type})`,
          amount: roomCharge
        });
        total += roomCharge;
      }
    }
  }

  // Add doctor fees based on employment type
  if (doctorDetails) {
    if (doctorDetails.type === "part-time" && doctorDetails.payPerHour) {
      const hours = Number(formData.duration) / 60;
      const docFee = doctorDetails.payPerHour * hours;
      charges.push({
        description: `Doctor Fee (${hours} hr)`,
        amount: docFee
      });
      total += docFee;
    } else {
      // For full-time doctors, use appointment type-based fees
      let consultationFee = 0;
      
      switch (formData.appointment_type) {
        case 'consultation':
          consultationFee = doctorDetails.consultationFee || 500;
          break;
        case 'follow-up':
          consultationFee = doctorDetails.followUpFee || 300;
          break;
        case 'checkup':
          consultationFee = doctorDetails.checkupFee || 700;
          break;
        case 'procedure':
          consultationFee = doctorDetails.procedureFee || 1500;
          break;
        case 'surgery':
          consultationFee = doctorDetails.surgeryConsultationFee || 2000;
          break;
        case 'emergency':
          consultationFee = doctorDetails.emergencyFee || 1000;
          break;
        default:
          consultationFee = 500;
      }
      
      // Adjust fee based on duration for full-time doctors too
      const durationMultiplier = parseInt(formData.duration) / 30;
      consultationFee = Math.round(consultationFee * durationMultiplier);
      
      charges.push({
        description: `${formData.appointment_type.charAt(0).toUpperCase() + formData.appointment_type.slice(1)} Fee`,
        amount: consultationFee
      });
      total += consultationFee;
    }
  }

  // Ensure total is not negative
  setChargesSummary(charges);
  setTotalAmount(total > 0 ? total : 0);
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormData2(prev => ({ ...prev, [field]: value }));
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
  // Inside the useEffect hook on line 281
useEffect(() => {
  const fetchOptions = async () => {
    try {
      const [patientRes, departmentRes, hospitalRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`)
      ]);

      // ✅ Add a check to ensure the response is an array
     const patientsData = Array.isArray(patientRes.data) 
  ? patientRes.data 
  : Array.isArray(patientRes.data.patients) 
    ? patientRes.data.patients 
    : [];

      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      setDepartments(departmentRes.data);
      setHospitalInfo(hospitalRes.data[0]);

      // ... rest of the code
      if (formData.department) {
          const doctorRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/department/${formData.department}`);
          setDoctors(doctorRes.data);
        } else {
          setDoctors([]);
        }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchOptions();
}, [formData.department]);

// Add a new useEffect hook after the existing one that fetches doctor data
// This hook will automatically set the start_time
useEffect(() => {
  if (formData.doctorId && formData.date && formData.type === 'time-based') {
    // Sort existing appointments by start time
    const sortedAppointments = [...existingAppointments].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    let proposedTime = null;
    const now = new Date();
    const today = new Date(formData.date);
    const isToday = today.toDateString() === now.toDateString();

    // Loop through the doctor's working hours
    for (const range of doctorWorkingHours) {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);
      let currentTime = new Date();
      currentTime.setHours(startH, startM, 0, 0);

      // If it's today, start searching from the current time
      if (isToday && currentTime < now) {
        // Round up to the nearest appointment duration increment
        const minutesToAdd = Math.ceil(now.getMinutes() / formData.duration) * formData.duration;
        currentTime.setMinutes(minutesToAdd, 0, 0);
        // Ensure we don't start before the doctor's actual start time
        if (currentTime.getHours() * 60 + currentTime.getMinutes() < startH * 60 + startM) {
            currentTime.setHours(startH, startM, 0, 0);
        }
      }

      // Check for available slots
      while (currentTime.getHours() * 60 + currentTime.getMinutes() < endH * 60 + endM) {
        const proposedStart = currentTime.toTimeString().slice(0, 5);
        const proposedEnd = calculateEndTime(proposedStart, formData.duration);

        const [proposedEndH, proposedEndM] = proposedEnd.split(':').map(Number);
        const proposedEndInMinutes = proposedEndH * 60 + proposedEndM;

        // Check if the proposed end time is within the working hours range
        if (proposedEndInMinutes > endH * 60 + endM) {
            break; // Stop if the slot would end after the working hours
        }

        // Check for conflicts with existing appointments
        const hasConflict = sortedAppointments.some(appt => {
          const apptStart = new Date(appt.startTime);
          const apptEnd = new Date(appt.endTime);
          const newStart = new Date(today);
          newStart.setHours(currentTime.getHours(), currentTime.getMinutes());
          const newEnd = new Date(today);
          newEnd.setHours(proposedEndH, proposedEndM);

          // Check for overlap
          return (
            (newStart >= apptStart && newStart < apptEnd) ||
            (newEnd > apptStart && newEnd <= apptEnd) ||
            (newStart <= apptStart && newEnd >= apptEnd)
          );
        });

        // If no conflict, this is our next available slot
        if (!hasConflict) {
          proposedTime = proposedStart;
          break; // Exit the while loop
        }

        // Move to the next potential slot
        currentTime.setMinutes(currentTime.getMinutes() + parseInt(formData.duration));
      }

      if (proposedTime) {
        break; // Exit the for loop once a slot is found
      }
    }

    // Update the form state with the newly found time
    setFormData(prev => ({ ...prev, start_time: proposedTime || '' }));

  } else if (formData.type !== 'time-based') {
    setFormData(prev => ({ ...prev, start_time: '' }));
  }
}, [formData.doctorId, formData.date, formData.duration, formData.type, existingAppointments, doctorWorkingHours]);

  // Fetch hospital charges
  useEffect(() => {
    if (hospitalId) {
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
  }, [hospitalId]);

  // Fetch available rooms if IPD
  useEffect(() => {
    if (type === 'ipd') {
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
  }, [type]);

  // Fetch doctor data and appointments when doctor or date changes
  useEffect(() => {
  if (formData.doctorId && hospitalId && formData.date) {
const fetchDoctorData = async () => {
  try {
    // Fetch doctor details
    const doctorRes = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/doctors/${formData.doctorId}`
    );
    const doctorData = doctorRes.data;
    setDoctorDetails(doctorData);

    let workingHours = doctorData.timeSlots || [];
    let appointments = [];
    let patients = [];

    try {
      // Try fetching doctor's schedule for the day
      const scheduleRes = await axios.get(
  `${import.meta.env.VITE_BACKEND_URL}/calendar/${hospitalId}/doctor/${formData.doctorId}/${formData.date}`
);


      const scheduleData = scheduleRes.data;
      console.log("Schedule Data:", scheduleData);

      if (scheduleData?.workingHours?.length) {
        workingHours = scheduleData.workingHours;
      }

      appointments = scheduleData.bookedAppointments || [];
      if (formData.type === "number-based") {
        patients = scheduleData.bookedPatients || [];
      }
    } catch (err) {
      // If calendar entry doesn’t exist, just use defaults
      console.warn("No schedule found for this doctor/date, falling back to default slots.");
    }

    setDoctorWorkingHours(workingHours);
    setExistingAppointments(appointments);
    setExistingPatients(patients);

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
}, [formData.doctorId, formData.date, formData.type, hospitalId]);

  // Helper function to check if time is within any working hour range
  const isWithinWorkingHours = (time) => {
    if (!time || doctorWorkingHours.length === 0) return false;
    
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
    if (!proposedStart || !proposedEnd) return false;

    // Convert proposed times to minutes for easier comparison
    const [startH, startM] = proposedStart.split(':').map(Number);
    const [endH, endM] = proposedEnd.split(':').map(Number);
    const proposedStartMin = startH * 60 + startM;
    const proposedEndMin = endH * 60 + endM;

    // Check against existing appointments
    for (const appt of existingAppointments) {
      if (!appt.start_time || !appt.end_time) continue;
      
      const apptStartTime = new Date(appt.startTime).toTimeString().slice(0, 5);
      const apptEndTime = new Date(appt.endTime).toTimeString().slice(0, 5);
      
      const [apptStartH, apptStartM] = apptStartTime.split(':').map(Number);
      const [apptEndH, apptEndM] = apptEndTime.split(':').map(Number);
      
      const apptStartMin = apptStartH * 60 + apptStartM;
      const apptEndMin = apptEndH * 60 + apptEndM;

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


  // 2. Function to stop the polling
  const stopPolling = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  };

  // 3. Function to handle QR code generation
const handleGenerateQR = async () => {
  if (!formData.patientId || totalAmount <= 0) {
    alert("Please select a patient and ensure there is an amount to pay.");
    return;
  }

  setIsLoading(true);
  setPaymentStatus('generating');

  try {
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payments/create-qr-order`, {
      amount: totalAmount,
      patientId: formData.patientId,
    });

    setQrData({ imageUrl: res.data.qrImageUrl, orderId: res.data.orderId });
    setPaymentStatus('waiting');
    setIsQrModalOpen(true); // <-- open modal only AFTER we have data
      
      // Start polling for payment status
      const intervalId = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payments/order-status/${res.data.orderId}`);
          if (statusRes.data.status === 'paid') {
            setPaymentStatus('paid');
            stopPolling(); // Stop checking once paid
            
            // Payment successful, now schedule the appointment
            alert('Payment successful! Scheduling appointment...');
            setIsQrModalOpen(false);
            
            // Pass payment details to the submit handler
            handleSubmit(null, { 
                isPaid: true, 
                method: 'QR Code', 
                transactionId: res.data.orderId 
            });
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
          stopPolling(); // Stop on error
        }
      }, 3000); // Check every 3 seconds

      setPollingIntervalId(intervalId);

    } catch (err) {
    console.error('Error generating QR code:', err);
    alert('Failed to generate QR code.');
  } finally {
    setIsLoading(false);
  }
};

const calculateDOBFromAge = (age) => {
    const today = new Date();
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    return dob.toISOString().split('T')[0];
  };

  const handleSubmit = async (e, paymentInfo = null) => {
    if (e) e.preventDefault(); // Prevent default form submission if triggered by button
    setIsLoading(true);
    let patientId;
    // If payment was made via QR, use the details passed from the polling logic
    const finalPaymentMethod = paymentInfo ? paymentInfo.method : formData.paymentMethod;
    const finalBillStatus = paymentInfo ? 'Paid' : status;
    
    try {
      
      if(showFields){
        const patientPayload = {
        first_name: formData2.firstName,
        last_name: formData2.lastName,
        email: formData2.email,
        phone: formData2.phone,
        gender: formData2.gender,
        dob: calculateDOBFromAge(formData2.age),
        blood_group: formData2.bloodGroup,
        patient_type: "opd"
      };

      const patientRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/patients`,
        patientPayload

      );
      console.log(patientRes)
      patientId = patientRes.data._id;
      }


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
        patient_id: showFields?patientId:formData.patientId,
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
          ? Math.max(...existingPatients.map(p => p.serialNumber))
          : 0;
        appointmentData.serialNumber = lastSerial + 1;
      }

      // Create Appointment
      const appointmentRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/appointments`,
        appointmentData
      );

      const appointmentId = appointmentRes.data._id;

      // ✅ Create billing with charges summary
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/billing`, {
        patient_id: showFields?patientId:formData.patientId,
        appointment_id: appointmentId,
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        status: status,
        items: chargesSummary,
        // transaction_id: paymentInfo ? paymentInfo.transactionId : null, // Store transaction ID
      });

      alert('Appointment scheduled and bill generated!');

      const appointmentDetails = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`);
      console.log("Appointment Details for Slip:", appointmentDetails.data);
      const appt = appointmentDetails.data;
      const enriched = { // Wrap the single object in an array for consistent state handling
          ...appt,
          patientName: `${appt.patient_id?.first_name || ''} ${appt.patient_id?.last_name || ''}`.trim(),
          doctorName: `Dr. ${appt.doctor_id?.firstName || ''} ${appt.doctor_id?.lastName || ''}`.trim(),
          departmentName: appt.department_id?.name || 'N/A',
          date: new Date(appt.appointment_date).toLocaleDateString(),
          time: appt.time_slot?.split(' - ')[0] || 'N/A',
          patientId: appt.patient_id?.patientId
      };
      setSubmitDetails(enriched);

      setSlipModal(true);

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
      setChargesSummary([]);
      setTotalAmount(0);
    } catch (err) {
      console.error('Error scheduling appointment or generating bill:', err);
      alert(err.response?.data?.error || 'Failed to schedule appointment or generate bill.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const innerContent = (
    <>
    <div className='bg-white p-62'>
        {type && (
          <div className="mb-2">
            <h3 className="text-2xl font-semibold text-gray-800 capitalize">{type} Appointment</h3>
            <div className="flex items-center justify-between mt-4">
              <p className="text-base text-gray-600">If the patient is not registered, you can add them below.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  type.toLowerCase() === 'ipd'
                    ? navigate('/dashboard/admin/patients/add-ipd')
                    : setShowFields(true);
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
              {!showFields&&(
              <FormSelect
  label="Select Patient"
  value={formData.patientId}
  onChange={(e) => handleInputChange('patientId', e.target.value)}
  // ✅ CORRECTED LINE:
  options={(filteredPatients || []).map(p => ({
    value: p._id,
    label: `${p.first_name} ${p.last_name} - ${p.phone || ''} (${p.patientId || ''})`
  }))}
  required
/>)}

{showFields&&(
<div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput label="First Name" value={formData2.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
              <FormInput label="Last Name" value={formData2.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
              <FormInput label="Email" type="email" value={formData2.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              <FormInput label="Phone Number" type="tel" value={formData2.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
              <FormInput label="Age" type="number" value={formData2.age} onChange={(e) => handleInputChange('age', e.target.value)} required />
              <FormSelect label="Gender" value={formData2.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={genderOptions} required />
              <FormSelect label="Blood Group" value={formData2.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} options={bloodGroupOptions} />
            </div>
          </div>)}

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

              {/* Charges Summary */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Charges Summary</h4>
                {chargesSummary.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Select a doctor and appointment type to see charges</p>
                )}
              </div>

              {/* Notes */}
              <FormTextarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Enter any special instructions or notes for this appointment"
              />
            </div>

            {/* Right Column - Doctor's Schedule */}
            <div className="lg:col-span-1 space-y-4">
              {formData.doctorId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-lg mb-3">
                    {formData.type === 'time-based' ? 
                      `Schedule for ${formatDateDisplay(formData.date)}` : 
                      "Patient Queue"
                    }
                  </h4>
                  
                  {doctorDetails && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium">
                        Dr. {doctorDetails.firstName} {doctorDetails.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {doctorDetails.isFullTime ? 'Full-time' : 'Part-time'} • 
                        {doctorDetails.specialization}
                      </p>
                    </div>
                  )}

                  {formData.type === 'time-based' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">
                        <p>Available Hours:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {doctorWorkingHours.map((range, i) => (
                            <li key={i} className="text-sm">
                              {range.start} - {range.end}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {existingAppointments.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium mb-2">Booked Appointments:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {existingAppointments.map((appt, index) => {
                              const startTime = new Date(appt.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', minute: '2-digit' 
                              });
                              const endTime = new Date(appt.endTime).toLocaleTimeString([], { 
                                hour: '2-digit', minute: '2-digit' 
                              });
                              
                              return (
                                <div key={index} className="bg-white p-2 rounded border text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {startTime} - {endTime}
                                    </span>
                                    <span className="text-gray-600">{appt.duration} mins</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {appt.patient?.first_name} {appt.patient?.last_name} • {appt.patient?.patient_type}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No appointments scheduled yet for this date.</p>
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
                                <span className="font-medium">#{patient.serialNumber}</span>
                                <span className="text-gray-600">
                                  {patient.patientDetails?.first_name} {patient.patientDetails?.last_name}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {patient.appointmentDetails?.appointment_type} - {patient.appointmentDetails?.priority}
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

          {/* CORRECTED FORM ACTIONS PLACEMENT */}
          {/* At the bottom of your form, around line 1030 */}
        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
          
          {/* ✅ ADD THIS NEW BUTTON FOR QR PAYMENTS */}
          <Button 
            variant="secondary" 
            type="button" 
            onClick={handleGenerateQR}
            disabled={isLoading || !formData.patientId || totalAmount <= 0}
          >
            {isLoading ? 'Processing...' : 'Pay with QR Code'}
          </Button>
          
          {/* This is your existing submit button, now used for non-QR payments */}
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading || 
              (formData.type === 'time-based' && 
               formData.start_time && 
               !isWithinWorkingHours(formData.start_time)) ||
              !formData.doctorId ||
              !formData.department}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </div>
        </form>
      </div>

      {/* MODALS SHOULD BE HERE, OUTSIDE THE MAIN CONTENT DIV BUT INSIDE THE FRAGMENT */}
      {isQrModalOpen && qrData.imageUrl && (
  <QRCodeModal
    isOpen={isQrModalOpen}
    onClose={() => {
      setIsQrModalOpen(false);
      if (pollingIntervalId) clearInterval(pollingIntervalId);
    }}
    qrImageUrl={qrData.imageUrl}
    amount={totalAmount}
    paymentStatus={paymentStatus}
  />
)}

      
      <AppointmentSlipModal
        isOpen={slipModal}
        onClose={() => setSlipModal(false)}
        appointmentData={submitDetails}
        hospitalInfo={hospitalInfo}
      />
    </>
  );

  if (embedded) return innerContent;

  return (
    <Layout sidebarItems={adminSidebar}>
      {innerContent}
    </Layout>
  );
};

export default AddIPDAppointment;