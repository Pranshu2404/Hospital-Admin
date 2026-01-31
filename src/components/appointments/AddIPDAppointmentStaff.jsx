import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea, Button, SearchableFormSelect } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';
import AppointmentSlipModal from './AppointmentSlipModal';
import QRCodeModal from './QRCodeModal';
import PaymentPendingModal from './PaymentPendingModal';
import SuccessModal from './SuccessModal';
import { FaUser, FaCloudUploadAlt, FaTimes, FaIdCard, FaCalendarAlt, FaClock, FaUserPlus, FaCheckCircle, FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';

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

const salutationOptions = [
  { value: '', label: 'Select Salutation' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Baby', label: 'Baby' },
  { value: 'Master', label: 'Master' }
];

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const bloodGroupOptions = [
  { value: '', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

// Helper to add days to date
const addDaysToDate = (dateString, days) => {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Check if all available hours have passed for today - FIXED VERSION
const checkIfAllHoursPassed = (doctorWorkingHours, currentTime) => {
  if (!doctorWorkingHours || doctorWorkingHours.length === 0) return true;
  
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  return doctorWorkingHours.every(range => {
    const [startH, startM] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;
    
    if (endInMinutes <= startInMinutes) { // Overnight shift (e.g., 23:00 to 07:00)
      // For overnight shift, check if current time is after the end time AND after the start time
      // This means we've passed both parts of the overnight shift
      return currentMinutes >= endInMinutes && currentMinutes >= startInMinutes;
    } else { // Normal shift (e.g., 09:00 to 17:00)
      return currentMinutes >= endInMinutes;
    }
  });
};

// Helper to check if there are any future time slots available today
const hasFutureTimeSlotsToday = (doctorWorkingHours, currentTime, duration) => {
  if (!doctorWorkingHours || doctorWorkingHours.length === 0) return false;
  
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  for (const range of doctorWorkingHours) {
    const [startH, startM] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;
    
    if (endInMinutes <= startInMinutes) { // Overnight shift
      // Check if we're before the overnight shift starts
      if (currentMinutes < startInMinutes) {
        return true; // Overnight shift hasn't started yet
      }
      // Check if we're during the overnight shift (before the end time on next day)
      if (currentMinutes >= startInMinutes && currentMinutes < endInMinutes) {
        return true; // Still within overnight shift (night portion)
      }
      // If we're between end time and start time of next day's overnight shift
      // (e.g., 07:00 to 23:00 for a 23:00-07:00 shift), no slots available
    } else { // Normal shift
      // Check if we're before the end of the shift
      if (currentMinutes < endInMinutes) {
        // Check if there's enough time for at least one appointment
        const timeRemaining = endInMinutes - Math.max(currentMinutes, startInMinutes);
        if (timeRemaining >= duration) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Check if a date is today
const isToday = (dateString) => {
  const today = new Date();
  const checkDate = new Date(dateString);
  return today.toDateString() === checkDate.toDateString();
};

const AddIPDAppointmentStaff = ({ type = "ipd", fixedDoctorId, embedded = false, onClose = () => { }, onSuccess }) => {
  const navigate = useNavigate();
  const formContainerRef = useRef(null); // Ref for scrolling to top
  
  // Helper to get local YYYY-MM-DD date string (avoids timezone-shift issues)
  const getLocalDateString = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Initial form data
  const initialFormData = {
    patientId: '',
    doctorId: fixedDoctorId || '',
    department: '',
    date: getLocalDateString(),
    start_time: '',
    duration: '30',
    type: 'time-based',
    appointment_type: 'consultation',
    priority: 'Normal',
    notes: '',
    paymentMethod: 'Cash',
    roomId: ''
  };

  const initialFormData2 = {
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    age: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    village: '',
    district: '',
    tehsil: '',
    patient_image: '',
    aadhaarNumber: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formData2, setFormData2] = useState(initialFormData2);

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
  const [autoAssignedTime, setAutoAssignedTime] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [submitDetails, setSubmitDetails] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({ imageUrl: '', orderId: '' });
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [showFields, setShowFields] = useState(false);
  const [showPaymentPendingModal, setShowPaymentPendingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newPatientData, setNewPatientData] = useState(null);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState('');
  const [previousDoctorId, setPreviousDoctorId] = useState('');

  // New States for CSC API and Image Upload
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const config = {
    headers: {
      "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
    },
  };

  // Function to scroll to top
  const scrollToTop = () => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Function to reset form for next appointment
  const resetFormForNextAppointment = () => {
    setFormData({
      ...initialFormData,
      doctorId: fixedDoctorId || '',
      date: getLocalDateString(),
    });
    setFormData2(initialFormData2);
    setShowFields(false);
    setIncludeRegistrationFee(true);
    setStatus('Pending');
    setTotalAmount(0);
    setChargesSummary([]);
    setShowErrors(false);
    setAutoAssignedTime(null);
    setAutoSwitchMessage('');
    setNewPatientData(null);
    
    // Scroll to top after reset
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  // Function to reset after new patient added
  const resetAfterNewPatient = () => {
    setFormData(prev => ({
      ...prev,
      patientId: newPatientData?._id || ''
    }));
    setFormData2(initialFormData2);
    setShowFields(false);
    setNewPatientData(null);
    
    // Scroll to top
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/patients/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData2(prev => ({ ...prev, patient_image: response.data.imageUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData2(prev => ({ ...prev, patient_image: '' }));
  };

  // Fetch Cities when state changes
  const fetchCities = async (stateIso) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states/${stateIso}/cities`,
        config
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  // Add this helper function near the top (after other helper functions):
  const convertUTCTimeToLocalForDate = (utcTimeString, targetDateString) => {
    if (!utcTimeString) return null;
    
    // Create a date object in UTC
    const utcDate = new Date(utcTimeString);
    
    // Get the target date in local timezone
    const targetDate = new Date(targetDateString + 'T00:00:00');
    
    // Combine target date with UTC time components
    const localDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      utcDate.getUTCHours(),
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds()
    );
    
    return localDate;
  };

  // Fetch States on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states`,
          config
        );
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Calculate charges whenever relevant form data changes
  useEffect(() => {
    calculateCharges();
  }, [formData.appointment_type, formData.doctorId, formData.duration, includeRegistrationFee, formData.roomId, type, doctorDetails]);

  // Helper function to get doctor fee description
  const getDoctorFeeDescription = (doctorDetails) => {
    if (!doctorDetails) return "Consultation Fee";
    
    const doctorName = `Dr. ${doctorDetails.firstName} ${doctorDetails.lastName}`;
    
    if (doctorDetails.paymentType === 'Per Hour') {
      const hours = Number(formData.duration) / 60;
      return `Doctor Fee (${hours.toFixed(1)} hr @ ₹${doctorDetails.amount || 0}/hr)`;
    } else if (doctorDetails.paymentType === 'Fee per Visit') {
      return `Doctor Consultation Fee (${doctorName})`;
    } else {
      return `Consultation Fee (${doctorName})`;
    }
  };

  // UPDATED: Calculate charges based on doctor type
  const calculateCharges = () => {
    let charges = [];
    let total = 0;

    // Check if patient is new (based on includeRegistrationFee checkbox)
    const isNewPatient = includeRegistrationFee;

    // For OPD appointments
    if (type === 'opd') {
      // First add OPD registration fee if it's a new patient
      if (isNewPatient && hospitalCharges?.opdCharges?.registrationFee) {
        const regFee = hospitalCharges.opdCharges.registrationFee;
        charges.push({
          description: "OPD Registration Fee",
          amount: regFee
        });
        total += regFee;
      }

      // Determine consultation fee based on doctor type
      let consultationFee = 0;
      
      if (doctorDetails) {
        // Check if doctor is part-time or fee-per-visit
        const isPartTimeDoctor = !doctorDetails.isFullTime || 
                                doctorDetails.paymentType === 'Fee per Visit' || 
                                doctorDetails.paymentType === 'Per Hour';
        
        if (isPartTimeDoctor) {
          // For part-time or fee-per-visit doctors, use doctor.amount field (consultation fee)
          consultationFee = doctorDetails.amount || 0;
          
          // For per-hour doctors, calculate based on duration
          if (doctorDetails.paymentType === 'Per Hour') {
            const hours = Number(formData.duration) / 60;
            consultationFee = consultationFee * hours;
          }
          
          // Add doctor consultation fee
          charges.push({
            description: getDoctorFeeDescription(doctorDetails),
            amount: consultationFee
          });
          total += consultationFee;
          
          // Add hospital service charge for OPD (from hospital charges)
          // const opdServiceFee = hospitalCharges?.opdCharges?.serviceCharge || 
          //                      hospitalCharges?.opdCharges?.consultationFee || 
          //                      0;
          // if (opdServiceFee > 0) {
          //   charges.push({
          //     description: "Hospital Service Charge",
          //     amount: opdServiceFee
          //   });
          //   total += opdServiceFee;
          // }
        } else {
          // For full-time doctors, use hospital's consultation fee
          consultationFee = hospitalCharges?.opdCharges?.consultationFee || 0;
          charges.push({
            description: `Consultation Fee (Dr. ${doctorDetails.firstName} ${doctorDetails.lastName})`,
            amount: consultationFee
          });
          total += consultationFee;
        }
      } else {
        // If no doctor details yet, use default hospital consultation fee
        consultationFee = hospitalCharges?.opdCharges?.consultationFee || 0;
        charges.push({
          description: "OPD Consultation Fee",
          amount: consultationFee
        });
        total += consultationFee;
      }

      // Apply discount if available
      if (hospitalCharges?.opdCharges?.discountValue > 0) {
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

      // For IPD, include doctor's visit fee if part-time
      if (doctorDetails && !doctorDetails.isFullTime && doctorDetails.paymentType === 'Fee per Visit') {
        const doctorVisitFee = doctorDetails.amount || 0;
        charges.push({
          description: `Doctor Visit Fee (Dr. ${doctorDetails.firstName} ${doctorDetails.lastName})`,
          amount: doctorVisitFee
        });
        total += doctorVisitFee;
      }
    }

    // Ensure total is not negative
    setChargesSummary(charges);
    setTotalAmount(total > 0 ? total : 0);
  };

  const handleInputChange = (field, value) => {
    if (field === 'doctorId') {
      // Store previous doctor ID before changing
      setPreviousDoctorId(formData.doctorId);
      
      // Check if we're switching doctors
      if (formData.doctorId && value && formData.doctorId !== value) {
        // Reset to today if the selected date is not today
        // This ensures when switching doctors, we always check availability for today first
        const today = getLocalDateString();
        if (formData.date !== today) {
          setFormData(prev => ({ 
            ...prev, 
            [field]: value,
            date: today, // Reset to today when switching doctors
            start_time: '' // Clear start time
          }));
          setAutoSwitchMessage('Date reset to today for new doctor selection');
          setTimeout(() => setAutoSwitchMessage(''), 3000);
          return;
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientInputChange = (field, value) => {
    setFormData2(prev => ({ ...prev, [field]: value }));

    if (field === 'state') {
      fetchCities(value);
      setFormData2(prev => ({ ...prev, city: '' }));
    }
  };

  // Format Aadhaar number with spaces (XXXX XXXX XXXX)
  const formatAadhaarNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  };

  const handleAadhaarChange = (value) => {
    const formatted = formatAadhaarNumber(value);
    setFormData2(prev => ({ ...prev, aadhaarNumber: formatted }));
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, departmentRes, hospitalRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients?limit=1000`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospitals`)
        ]);

        const patientsData = Array.isArray(patientRes.data)
          ? patientRes.data
          : Array.isArray(patientRes.data.patients)
            ? patientRes.data.patients
            : [];

        setPatients(patientsData);
        setFilteredPatients(patientsData);
        setDepartments(departmentRes.data);
        setHospitalInfo(hospitalRes.data[0]);

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

    fetchOptions();
  }, [formData.department]);

  // Monitor time and auto-switch date when needed
  useEffect(() => {
    if (!formData.doctorId || !formData.date || formData.type !== 'time-based') return;

    const checkAndSwitchDate = () => {
      const now = new Date();
      const today = new Date(formData.date);
      const isToday = today.toDateString() === now.toDateString();
      const duration = parseInt(formData.duration);

      // Only check for auto-switch if it's today
      if (isToday && doctorWorkingHours.length > 0) {
        const allHoursPassed = checkIfAllHoursPassed(doctorWorkingHours, now);
        const hasFutureSlots = hasFutureTimeSlotsToday(doctorWorkingHours, now, duration);
        
        // Only switch date if ALL hours have passed AND no future slots available
        if (allHoursPassed && !hasFutureSlots) {
          // Switch to next date
          const nextDate = addDaysToDate(formData.date, 1);
          handleInputChange('date', nextDate);

          // Set proposed time to first available slot on next date
          if (doctorWorkingHours.length > 0) {
            const firstSlot = doctorWorkingHours[0];
            handleInputChange('start_time', firstSlot.start);
            setAutoAssignedTime(firstSlot.start);

            // Clear message after 5 seconds
            setTimeout(() => setAutoSwitchMessage(''), 5000);
          }
        }
      }
    };

    // Check immediately
    checkAndSwitchDate();

    // Check every minute
    const interval = setInterval(checkAndSwitchDate, 60000);

    return () => clearInterval(interval);
  }, [formData.doctorId, formData.date, formData.type, doctorWorkingHours, formData.duration]);

  // Reset date to today when doctor changes - FIX FOR THE ISSUE
  useEffect(() => {
    if (formData.doctorId && previousDoctorId && formData.doctorId !== previousDoctorId) {
      // Check if current date is not today and doctor has working hours
      const today = getLocalDateString();
      const isDateToday = isToday(formData.date);
      
      if (!isDateToday && doctorWorkingHours.length > 0) {
        const now = new Date();
        const duration = parseInt(formData.duration);
        const hasSlotsToday = hasFutureTimeSlotsToday(doctorWorkingHours, now, duration);
        
        // Only reset to today if new doctor has slots available today
        if (hasSlotsToday) {
          setFormData(prev => ({ 
            ...prev, 
            date: today,
            start_time: '' // Clear start time
          }));
          setAutoSwitchMessage('Date reset to today for new doctor selection');
          setTimeout(() => setAutoSwitchMessage(''), 3000);
        }
      }
    }
  }, [formData.doctorId, previousDoctorId, doctorWorkingHours, formData.duration]);

  // Main effect for finding time slots
  useEffect(() => {
    if (formData.doctorId && formData.date && formData.type === 'time-based') {
      const sortedAppointments = [...existingAppointments].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      let proposedTime = null;
      const now = new Date();
      const today = new Date(formData.date);
      const isToday = today.toDateString() === now.toDateString();
      const duration = parseInt(formData.duration);

      // Check if we should switch date (only if it's today)
      if (isToday && doctorWorkingHours.length > 0) {
        const allHoursPassed = checkIfAllHoursPassed(doctorWorkingHours, now);
        const hasFutureSlots = hasFutureTimeSlotsToday(doctorWorkingHours, now, duration);
        
        // Only switch date if ALL hours have passed AND no future slots available
        if (allHoursPassed && !hasFutureSlots) {
          // Switch to next date
          const nextDate = addDaysToDate(formData.date, 1);
          handleInputChange('date', nextDate);

          // Set proposed time to first available slot on next date
          if (doctorWorkingHours.length > 0) {
            const firstSlot = doctorWorkingHours[0];
            handleInputChange('start_time', firstSlot.start);
            setAutoAssignedTime(firstSlot.start);

            // Clear message after 5 seconds
            setTimeout(() => setAutoSwitchMessage(''), 5000);
          }
          return; // Exit early since date changed
        }
      }

      // Find available time slot
      for (const range of doctorWorkingHours) {
        const [startH, startM] = range.start.split(':').map(Number);
        const [endH, endM] = range.end.split(':').map(Number);
        const isOvernightShift = (startH * 60 + startM) > (endH * 60 + endM);

        let currentTime = new Date();
        currentTime.setHours(startH, startM, 0, 0);

        if (isToday) {
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const nextSlotMinutes = Math.ceil(currentMinutes / duration) * duration;
          const nextHours = Math.floor(nextSlotMinutes / 60);
          const nextMins = nextSlotMinutes % 60;
          const rangeStartMinutes = startH * 60 + startM;
          const rangeEndMinutes = endH * 60 + endM;
          const nextSlotMinutesValue = nextHours * 60 + nextMins;

          if (isOvernightShift) {
            // For overnight shift (e.g., 23:00 to 07:00)
            // If current time is before shift starts OR during overnight portion
            if (nextSlotMinutesValue >= rangeStartMinutes || nextSlotMinutesValue < rangeEndMinutes) {
              currentTime.setHours(nextHours, nextMins, 0, 0);
            } else {
              currentTime.setHours(startH, startM, 0, 0);
            }
          } else {
            // For normal shift
            if (nextSlotMinutesValue < rangeStartMinutes) {
              currentTime.setHours(startH, startM, 0, 0);
            } else if (nextSlotMinutesValue >= rangeStartMinutes && nextSlotMinutesValue < rangeEndMinutes) {
              currentTime.setHours(nextHours, nextMins, 0, 0);
            } else {
              continue;
            }
          }
        }

        while (true) {
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();
          const currentTotalMinutes = currentHour * 60 + currentMinute;
          
          const [endHour, endMinute] = [endH, endM];
          const endTotalMinutes = endHour * 60 + endMinute;
          
          // Check if we're still within the shift
          if (isOvernightShift) {
            // For overnight shift, we need special handling
            if (currentTotalMinutes >= startH * 60 + startM) {
              // We're in the overnight portion (after start time)
              if (currentTotalMinutes >= 1440) {
                // We've wrapped past midnight
                break;
              }
            } else {
              // We're before the shift starts
              if (currentTotalMinutes >= endTotalMinutes && currentTotalMinutes < startH * 60 + startM) {
                // We're after the morning end time but before the evening start time
                break;
              }
            }
          } else {
            // For normal shift
            if (currentTotalMinutes >= endTotalMinutes) {
              break;
            }
          }

          const proposedStart = currentTime.toTimeString().slice(0, 5);
          const proposedEnd = calculateEndTime(proposedStart, formData.duration);
          const [proposedEndH, proposedEndM] = proposedEnd.split(':').map(Number);
          const proposedEndInMinutes = proposedEndH * 60 + proposedEndM;

          // Check if appointment would end outside working hours
          let wouldEndOutside = false;
          if (isOvernightShift) {
            // For overnight shift, ending time needs special handling
            if (proposedEndInMinutes > endTotalMinutes && proposedEndInMinutes <= startH * 60 + startM) {
              // Would end after morning end time but before evening start time - this is OK
            } else if (proposedEndInMinutes > 1440) {
              // Would end after midnight (next day) - not allowed
              wouldEndOutside = true;
            }
          } else {
            if (proposedEndInMinutes > endTotalMinutes) {
              wouldEndOutside = true;
            }
          }

          if (wouldEndOutside) {
            break;
          }

          if (isToday) {
            const proposedStartMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (proposedStartMinutes < currentMinutes) {
              currentTime.setMinutes(currentTime.getMinutes() + duration);
              continue;
            }
          }

          const hasConflict = sortedAppointments.some(appt => {
            // Convert UTC appointment times to local time for the selected date
            const apptStartLocal = convertUTCTimeToLocalForDate(appt.startTime, formData.date);
            const apptEndLocal = convertUTCTimeToLocalForDate(appt.endTime, formData.date);
            
            if (!apptStartLocal || !apptEndLocal) return false;
            
            // Create local time for proposed appointment
            const newStart = new Date(today);
            newStart.setHours(currentTime.getHours(), currentTime.getMinutes());
            const newEnd = new Date(today);
            newEnd.setHours(proposedEndH, proposedEndM);

            return (
              (newStart >= apptStartLocal && newStart < apptEndLocal) ||
              (newEnd > apptStartLocal && newEnd <= apptEndLocal) ||
              (newStart <= apptStartLocal && newEnd >= apptEndLocal)
            );
          });

          if (!hasConflict) {
            proposedTime = proposedStart;
            break;
          }

          currentTime.setMinutes(currentTime.getMinutes() + duration);
        }

        if (proposedTime) {
          break;
        }
      }

      if (!proposedTime && doctorWorkingHours.length > 0) {
        // If no slot found, suggest the first available start time
        proposedTime = doctorWorkingHours[0].start;
      }

      setFormData(prev => ({ ...prev, start_time: proposedTime || '' }));
      setAutoAssignedTime(proposedTime || null);

    } else if (formData.type !== 'time-based') {
      setFormData(prev => ({ ...prev, start_time: '' }));
      setAutoAssignedTime(null);
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

  // Fetch doctor data and appointments
  useEffect(() => {
    if (formData.doctorId && hospitalId && formData.date) {
      const fetchDoctorData = async () => {
        try {
          const doctorRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/doctors/${formData.doctorId}`
          );
          const doctorData = doctorRes.data;
          setDoctorDetails(doctorData);

          let workingHours = doctorData.timeSlots || [];
          let appointments = [];
          let patients = [];

          try {
            const scheduleRes = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/calendar/${hospitalId}/doctor/${formData.doctorId}/${formData.date}`
            );
            const scheduleData = scheduleRes.data;

            if (scheduleData?.workingHours?.length) {
              workingHours = scheduleData.workingHours;
            }
            console.log("Schedule Data:", scheduleData);
            appointments = scheduleData.bookedAppointments || [];
            if (formData.type === "number-based") {
              patients = scheduleData.bookedPatients || [];
            }
          } catch (err) {
            console.warn("No schedule found for this doctor/date");
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

  const isWithinWorkingHours = (time) => {
    if (!time || doctorWorkingHours.length === 0) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    return doctorWorkingHours.some(range => {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);
      const startInMinutes = startH * 60 + startM;
      const endInMinutes = endH * 60 + endM;

      if (endInMinutes <= startInMinutes) {
        return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
      }
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    });
  };

  const getTimeConstraints = () => {
    if (doctorWorkingHours.length === 0) return {};

    let minTime = '00:00';
    let maxTime = '23:59';

    if (doctorWorkingHours.length > 0) {
      const starts = doctorWorkingHours.map(r => r.start).sort();
      const ends = doctorWorkingHours.map(r => r.end).sort();
      minTime = starts[0];
      maxTime = ends[ends.length - 1];
    }

    const today = new Date();
    const selectedDate = new Date(formData.date);

    // Only apply time restrictions if it's today's date
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      const duration = parseInt(formData.duration) || 30;
      const nextSlotMinutes = Math.ceil(currentMinutes / duration) * duration;
      const nextHours = Math.floor(nextSlotMinutes / 60);
      const nextMins = nextSlotMinutes % 60;
      const nextSlotTimeStr = `${nextHours.toString().padStart(2, '0')}:${nextMins.toString().padStart(2, '0')}`;

      if (nextSlotTimeStr > minTime) {
        minTime = nextSlotTimeStr;
      }
    }

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

  // Form validation
  const errors = {};
  if (!formData.department) errors.department = 'Please select a department';
  if (!formData.doctorId) errors.doctorId = 'Please select a doctor';
  if (!showFields && !formData.patientId) errors.patientId = 'Please select a patient';
  if (formData.type === 'time-based') {
    if (!formData.start_time) {
      errors.start_time = 'Please pick a start time';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();

      // Check if it's today and time is in past
      if (selectedDate.toDateString() === today.toDateString()) {
        const [startH, startM] = formData.start_time.split(':').map(Number);
        const selectedMinutes = startH * 60 + startM;
        const currentMinutes = today.getHours() * 60 + today.getMinutes();

        if (selectedMinutes < currentMinutes) {
          errors.start_time = 'Cannot select a time in the past';
        }
      }

      // Check working hours
      if (!isWithinWorkingHours(formData.start_time)) {
        errors.start_time = 'Selected time is outside doctor working hours';
      } else {
        const endTime = calculateEndTime(formData.start_time, formData.duration);
        if (!isWithinWorkingHours(endTime)) {
          errors.start_time = 'Appointment would end outside doctor working hours.';
        }
      }
    }
  }

  const displayEndTime = formData.start_time ? calculateEndTime(formData.start_time, formData.duration) : null;
  const isFormValid = Object.keys(errors).length === 0;

  const checkTimeSlotAvailability = (proposedStart, proposedEnd) => {
    if (!proposedStart || !proposedEnd) return false;

    const [startH, startM] = proposedStart.split(':').map(Number);
    const [endH, endM] = proposedEnd.split(':').map(Number);
    const proposedStartMin = startH * 60 + startM;
    const proposedEndMin = endH * 60 + endM;

    for (const appt of existingAppointments) {
      if (!appt.startTime || !appt.endTime) continue;

      // Convert UTC appointment times to local time for comparison
      const apptStartLocal = convertUTCTimeToLocalForDate(appt.startTime, formData.date);
      const apptEndLocal = convertUTCTimeToLocalForDate(appt.endTime, formData.date);
      
      if (!apptStartLocal || !apptEndLocal) continue;
      
      const apptStartHour = apptStartLocal.getHours();
      const apptStartMinute = apptStartLocal.getMinutes();
      const apptEndHour = apptEndLocal.getHours();
      const apptEndMinute = apptEndLocal.getMinutes();
      
      const apptStartMin = apptStartHour * 60 + apptStartMinute;
      const apptEndMin = apptEndHour * 60 + apptEndMinute;

      if (
        (proposedStartMin >= apptStartMin && proposedStartMin < apptEndMin) ||
        (proposedEndMin > apptStartMin && proposedEndMin <= apptEndMin) ||
        (proposedStartMin <= apptStartMin && proposedEndMin >= apptEndMin)
      ) {
        return false;
      }
    }

    return true;
  };

  const stopPolling = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  };

  const handleGenerateQR = async () => {
    if (!formData.patientId && !showFields) {
      alert("Please select a patient or add a new patient.");
      return;
    }
    if (totalAmount <= 0) {
      alert("Please ensure there is an amount to pay.");
      return;
    }

    setIsLoading(true);
    setPaymentStatus('generating');

    try {
      let patientIdForPayment = formData.patientId;

      if (showFields) {
        if (!formData2.salutation || !formData2.firstName || !formData2.phone) {
          alert("Please fill in all required patient information.");
          setIsLoading(false);
          return;
        }
        patientIdForPayment = "new-patient-temp";
      }

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payments/create-qr-order`, {
        amount: totalAmount,
        patientId: patientIdForPayment,
      });

      setQrData({ imageUrl: res.data.qrImageUrl, orderId: res.data.orderId });
      setPaymentStatus('waiting');
      setIsQrModalOpen(true);

      const intervalId = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payments/order-status/${res.data.orderId}`);
          if (statusRes.data.status === 'paid') {
            setPaymentStatus('paid');
            stopPolling();
            alert('Payment successful! Scheduling appointment...');
            setIsQrModalOpen(false);
            handleSubmit(null, {
              isPaid: true,
              method: 'QR Code',
              transactionId: res.data.orderId
            });
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
          stopPolling();
        }
      }, 3000);

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

  const addNewPatient = async () => {
    try {
      if (!formData2.salutation || !formData2.firstName || !formData2.phone) {
        alert("Please fill in all required patient information.");
        return;
      }

      const patientPayload = {
        salutation: formData2.salutation,
        first_name: formData2.firstName,
        last_name: formData2.lastName,
        email: formData2.email,
        phone: formData2.phone,
        gender: formData2.gender,
        dob: calculateDOBFromAge(formData2.age),
        blood_group: formData2.bloodGroup,
        address: formData2.address,
        city: formData2.city,
        state: formData2.state,
        zipCode: formData2.zipCode,
        patient_type: 'opd',
        village: formData2.village,
        district: formData2.district,
        tehsil: formData2.tehsil,
        patient_image: formData2.patient_image,
        aadhaar_number: formData2.aadhaarNumber.replace(/\s/g, '')
      };

      const patientRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/patients`,
        patientPayload
      );

      const newPatient = patientRes.data;
      setNewPatientData(newPatient);

      // Refresh patients list
      const allPatientsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients?limit=1000`);
      const patientsData = Array.isArray(allPatientsRes.data)
        ? allPatientsRes.data
        : Array.isArray(allPatientsRes.data.patients)
          ? allPatientsRes.data.patients
          : [];

      setPatients(patientsData);
      setFilteredPatients(patientsData);

      // Show success modal
      setSuccessMessage(`Patient ${formData2.firstName} ${formData2.lastName} added successfully!`);
      setShowSuccessModal(true);
      setShowFields(false);

      // Scroll to top after patient added
      setTimeout(() => {
        scrollToTop();
      }, 300);

    } catch (err) {
      console.error('Error adding patient:', err);
      alert(err.response?.data?.error || 'Failed to add patient.');
    }
  };

  const handleSelectPatientAfterSuccess = () => {
    if (newPatientData) {
      setFormData(prev => ({ ...prev, patientId: newPatientData._id }));
      setShowSuccessModal(false);
      setNewPatientData(null);

      // Reset patient form
      resetAfterNewPatient();
    }
  };

  const handleSubmit = async (e, paymentInfo = null, forcePending = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    // If adding new patient
    if (showFields) {
      await addNewPatient();
      setIsLoading(false);
      return;
    }

    // Schedule appointment
    const finalPaymentMethod = paymentInfo ? paymentInfo.method : formData.paymentMethod;
    const finalBillStatus = paymentInfo ? 'Paid' : status;

    if (finalBillStatus === 'Pending' && !forcePending && !paymentInfo) {
      setShowPaymentPendingModal(true);
      setIsLoading(false);
      return;
    }

    try {
      if (formData.type === 'time-based') {
        const proposedEnd = calculateEndTime(formData.start_time, formData.duration);
        const isAvailable = checkTimeSlotAvailability(formData.start_time, proposedEnd);

        if (!isAvailable) {
          alert('The selected time slot is not available. Please choose another time.');
          setIsLoading(false);
          return;
        }
      }

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

      if (formData.type === 'time-based') {
        // Store times as UTC without timezone conversion
        // If user selects 9 PM, store as 21:00 UTC
        appointmentData.start_time = `${formData.date}T${formData.start_time}:00+00:00`;
        
        // Calculate end time in 24-hour format
        const [hours, minutes] = formData.start_time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + parseInt(formData.duration);
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        
        appointmentData.end_time = `${formData.date}T${endTimeFormatted}:00+00:00`;
        
        console.log('Storing times as UTC:', {
          start: appointmentData.start_time,
          end: appointmentData.end_time
        });
      } else {
        const lastSerial = existingPatients.length > 0
          ? Math.max(...existingPatients.map(p => p.serialNumber))
          : 0;
        appointmentData.serialNumber = lastSerial + 1;
      }

      const appointmentRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/appointments`,
        appointmentData
      );

      const appointmentId = appointmentRes.data._id;

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/billing`, {
        patient_id: formData.patientId,
        appointment_id: appointmentId,
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        status: finalBillStatus,
        items: chargesSummary,
        transaction_id: paymentInfo ? paymentInfo.transactionId : null,
      });

      // Show appointment success modal
      const selectedPatient = filteredPatients.find(p => p._id === formData.patientId);
      const patientName = selectedPatient ?
        `${selectedPatient.salutation || ''} ${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() :
        'Unknown Patient';

      setSuccessMessage(`Appointment for ${patientName} scheduled successfully!`);
      setShowSuccessModal(true);

      const appointmentDetails = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`);
      const appt = appointmentDetails.data;
      const enriched = {
        ...appt,
        patientName: patientName,
        patientSalutation: appt.patient_id?.salutation || '',
        doctorName: `Dr. ${appt.doctor_id?.firstName || ''} ${appt.doctor_id?.lastName || ''}`.trim(),
        departmentName: appt.department_id?.name || 'N/A',
        date: new Date(appt.appointment_date).toLocaleDateString(),
        time: appt.time_slot?.split(' - ')[0] || 'N/A',
        patientId: appt.patient_id?.patientId
      };
      setSubmitDetails(enriched);
      
      // Close success modal after a delay and show slip
      setTimeout(() => {
        setShowSuccessModal(false);
        setSlipModal(true); // Show slip modal
        
        // Reset form for next appointment
        resetFormForNextAppointment();
      }, 2000);

    } catch (err) {
      console.error('Error scheduling appointment:', err);
      alert(err.response?.data?.error || 'Failed to schedule appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedPatient = formData.patientId ?
    filteredPatients.find(p => p._id === formData.patientId) : null;

  // Helper to display doctor consultation fee
  const getDoctorFeeDisplay = () => {
    if (!doctorDetails) return null;
    
    if (doctorDetails.paymentType === 'Per Hour') {
      return `₹${doctorDetails.amount || 0}/hour`;
    } else if (doctorDetails.paymentType === 'Fee per Visit') {
      return `₹${doctorDetails.amount || 0}/visit`;
    } else if (doctorDetails.isFullTime) {
      return `₹${hospitalCharges?.opdCharges?.consultationFee || 0} (Hospital Fee)`;
    }
    return `₹${doctorDetails.amount || 0}`;
  };

  return (
    <>
      <style>{`
        .fixed-calendar {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          width: 350px;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 40;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }
        
        @media (max-width: 1200px) {
          .fixed-calendar {
            position: relative;
            top: auto;
            right: auto;
            transform: none;
            width: 100%;
            margin-top: 20px;
          }
        }
        
        .patient-added-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          z-index: 100;
          max-width: 500px;
          width: 90%;
        }

        .fee-info-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }

        .fee-part-time {
          background-color: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }

        .fee-full-time {
          background-color: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .fee-per-hour {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
      `}</style>

      {/* Add ref for scrolling */}
      <div ref={formContainerRef} className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center items-center w-full justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-center text-gray-800 capitalize">{type} Appointment Booking</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {showFields ? 'Add new patient details' : 'Schedule an appointment for existing or new patient'}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Form */}
            <div className={`col-span-1 ${showFields ? 'lg:col-span-5' : 'lg:col-span-3'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {showFields ? 'Add New Patient' : 'Schedule Appointment'}
                      </h2>
                      <p className="text-gray-600 mt-1 text-sm">
                        {showFields ? 'Fill in patient details below' : 'Select patient and appointment details'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {showFields ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowFields(false);
                            scrollToTop();
                          }}
                          className="flex items-center"
                        >
                          <FaArrowLeft className="mr-2" />
                          Back to Appointment
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowFields(true);
                            scrollToTop();
                          }}
                          className="flex items-center"
                        >
                          <FaUserPlus className="mr-2" />
                          Add New Patient
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection / Registration */}
                    {!showFields ? (
                      <>
                        <div className="space-y-4">
                          <SearchableFormSelect
                            label="Select Patient"
                            value={formData.patientId}
                            onChange={(e) => handleInputChange('patientId', e.target.value)}
                            options={[
                              { value: '', label: 'Select a patient' },
                              ...(filteredPatients || []).map(p => ({
                                value: p._id,
                                label: `${p.salutation || ''} ${p.first_name || ''} ${p.last_name || ''} - ${p.phone || ''} (${p.patientId || ''})${p.aadhaar_number ? ` - Aadhaar: ${p.aadhaar_number}` : ''}`
                              }))
                            ]}
                            required
                          />
                          {selectedPatient && (
                            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                              <div className="flex items-center">
                                {selectedPatient.patient_image ? (
                                  <img
                                    src={selectedPatient.patient_image}
                                    alt="Patient"
                                    className="h-12 w-12 rounded-full object-cover mr-3"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg mr-3">
                                    {selectedPatient.first_name?.charAt(0) || 'P'}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {selectedPatient.salutation || ''} {selectedPatient.first_name || ''} {selectedPatient.last_name || ''}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Phone: {selectedPatient.phone} • Gender: {selectedPatient.gender || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SearchableFormSelect
                            label="Select Department"
                            value={formData.department}
                            onChange={(e) => handleInputChange('department', e.target.value)}
                            options={departments.map(dep => ({ value: dep._id, label: dep.name }))}
                            required
                          />
                          {!fixedDoctorId && (
                            <SearchableFormSelect
                              label="Select Doctor"
                              value={formData.doctorId}
                              onChange={(e) => handleInputChange('doctorId', e.target.value)}
                              options={(doctors || []).map(d => ({
                                value: d._id,
                                label: `${d.isFullTime ? 'Full-time' : 'Part-time'} - Dr. ${d.firstName} ${d.lastName} (${type === 'opd' ? `Fee: ₹${d.amount}` : ''})`
                              }))}
                              required
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormInput
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => {
                              handleInputChange('date', e.target.value);
                              setAutoSwitchMessage('');
                            }}
                            required
                            min={getLocalDateString()}
                          />
                          <SearchableFormSelect
                            label="Type"
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            options={schedulingTypeOptions}
                            required
                          />
                          <SearchableFormSelect
                            label="Duration (min)"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SearchableFormSelect
                            label="Appointment Type"
                            value={formData.appointment_type}
                            onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                            options={appointmentTypeOptions}
                            required
                          />
                          <SearchableFormSelect
                            label="Priority"
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            options={priorityOptions}
                          />
                        </div>

                        {formData.type === 'time-based' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormInput
                                label="Start Time (HH:MM)"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => {
                                  handleInputChange('start_time', e.target.value);
                                  setShowErrors(false);
                                  setAutoAssignedTime(null);
                                  setAutoSwitchMessage('');
                                }}
                                onBlur={() => setShowErrors(true)}
                                required
                                min={minTime}
                                max={maxTime}
                                step="300"
                              />
                              {formData.start_time && (
                                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">End Time</p>
                                    <p className="text-lg font-bold text-gray-900">{displayEndTime}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {autoSwitchMessage && (
                              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                                <p className="text-sm text-yellow-700">
                                  <span className="font-semibold">{autoSwitchMessage}</span>
                                </p>
                              </div>
                            )}
                            {autoAssignedTime && !formData.start_time && !autoSwitchMessage && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                  Suggested available slot: <span className="font-semibold">{autoAssignedTime}</span>
                                </p>
                              </div>
                            )}
                            {showErrors && errors.start_time && (
                              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <p className="text-sm text-red-700">{errors.start_time}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {type === 'ipd' && (
                          <SearchableFormSelect
                            label="Select Room"
                            value={formData.roomId}
                            onChange={(e) => handleInputChange('roomId', e.target.value)}
                            options={[
                              { value: '', label: 'Select a room' },
                              ...rooms.map(r => ({
                                value: r._id,
                                label: `Room ${r.room_number} - ${r.type} (${r.ward || 'No Ward'})`
                              }))
                            ]}
                            required
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SearchableFormSelect
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
                          <SearchableFormSelect
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
                        </div>

                        {/* Registration Fee Checkbox */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Registration Fee</p>
                              <p className="text-sm text-gray-600">
                                Include one-time registration fee for new patients
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={includeRegistrationFee}
                                  onChange={(e) => setIncludeRegistrationFee(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                              </label>
                              <span className="text-sm font-medium text-gray-700">
                                {includeRegistrationFee ? 'Included' : 'Excluded'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Charges Summary */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Charges Summary</h3>
                            {doctorDetails && type === 'opd' && (
                              <div className={`fee-info-badge ${
                                doctorDetails.paymentType === 'Per Hour' ? 'fee-per-hour' :
                                !doctorDetails.isFullTime ? 'fee-part-time' : 'fee-full-time'
                              }`}>
                                <FaMoneyBillWave className="mr-1" size={12} />
                                {doctorDetails.paymentType === 'Per Hour' ? 'Per Hour' :
                                 !doctorDetails.isFullTime ? 'Part-time Fee' : 'Hospital Fee'}
                              </div>
                            )}
                          </div>
                          {chargesSummary.length > 0 ? (
                            <div className="space-y-3">
                              {chargesSummary.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-700">{item.description}</span>
                                  <span className="font-medium text-gray-900">₹{item.amount.toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold text-teal-600">₹{totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FaClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">Select doctor and appointment type to see charges</p>
                            </div>
                          )}
                        </div>

                        <FormTextarea
                          label="Notes (Optional)"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={3}
                          placeholder="Enter any special instructions or notes for this appointment"
                        />
                      </>
                    ) : (
                      /* New Patient Form */
                      <>
                        <div className="space-y-6">
                          {/* Image Upload */}
                          <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                                {formData2.patient_image ? (
                                  <img
                                    src={formData2.patient_image}
                                    alt="Patient"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-5xl text-slate-400" />
                                )}
                                {uploadingImage && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-center mt-4 space-x-2">
                                {formData2.patient_image ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={removeImage}
                                    className="flex items-center"
                                  >
                                    <FaTimes className="mr-2" />
                                    Remove Photo
                                  </Button>
                                ) : (
                                  <div className="inline-flex">
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      className="hidden"
                                      disabled={uploadingImage}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center"
                                      disabled={uploadingImage}
                                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    >
                                      <FaCloudUploadAlt className="mr-2" />
                                      Upload Photo
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Patient Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SearchableFormSelect
                              label="Salutation"
                              value={formData2.salutation}
                              onChange={(e) => handlePatientInputChange('salutation', e.target.value)}
                              options={salutationOptions}
                            />
                            <FormInput
                              label="First Name"
                              value={formData2.firstName}
                              onChange={(e) => handlePatientInputChange('firstName', e.target.value)}
                              required
                            />
                            <FormInput
                              label="Last Name"
                              value={formData2.lastName}
                              onChange={(e) => handlePatientInputChange('lastName', e.target.value)}
                            />
                            <FormInput
                              label="Phone Number"
                              type="tel"
                              value={formData2.phone}
                              onChange={(e) => handlePatientInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                              required
                              maxLength={10}
                              inputMode="numeric"
                              pattern="^[6-9]\d{9}$"
                              title="10 digit Indian mobile number starting with 6-9"
                            />
                            <FormInput
                              label="Email"
                              type="email"
                              value={formData2.email}
                              onChange={(e) => handlePatientInputChange('email', e.target.value)}
                            />
                            <FormInput
                              label="Age"
                              type="number"
                              min="0"
                              max="120"
                              value={formData2.age}
                              onChange={(e) => handlePatientInputChange('age', e.target.value)}
                              required
                            />
                            <SearchableFormSelect
                              label="Gender"
                              value={formData2.gender}
                              onChange={(e) => handlePatientInputChange('gender', e.target.value)}
                              options={genderOptions}
                              required
                            />
                            <SearchableFormSelect
                              label="Blood Group"
                              value={formData2.bloodGroup}
                              onChange={(e) => handlePatientInputChange('bloodGroup', e.target.value)}
                              options={bloodGroupOptions}
                            />
                            <div className="">
                              <FormInput
                                label="Aadhaar Number (Optional)"
                                type="text"
                                value={formData2.aadhaarNumber}
                                onChange={(e) => handleAadhaarChange(e.target.value)}
                                maxLength="14"
                                placeholder="XXXX XXXX XXXX"
                                icon={<FaIdCard className="text-gray-400" />}
                              />
                            </div>
                          </div>

                          {/* Address */}
                          <div className="space-y-4">
                            <FormTextarea
                              label="Address"
                              value={formData2.address}
                              onChange={(e) => handlePatientInputChange('address', e.target.value)}
                              rows={3}
                              placeholder="Enter full address"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <SearchableFormSelect
                                label="State"
                                value={formData2.state}
                                onChange={(e) => handlePatientInputChange('state', e.target.value)}
                                options={states.map(state => ({ value: state.iso2, label: state.name }))}
                              />
                              <SearchableFormSelect
                                label="City"
                                value={formData2.city}
                                onChange={(e) => handlePatientInputChange('city', e.target.value)}
                                options={cities.map(city => ({ value: city.name, label: city.name }))}
                                disabled={!formData2.state}
                              />
                              <FormInput
                                label="District"
                                value={formData2.district}
                                onChange={(e) => handlePatientInputChange('district', e.target.value)}
                              />
                              <FormInput
                                label="Tehsil"
                                value={formData2.tehsil}
                                onChange={(e) => handlePatientInputChange('tehsil', e.target.value)}
                              />
                              <FormInput
                                label="Village"
                                value={formData2.village}
                                onChange={(e) => handlePatientInputChange('village', e.target.value)}
                              />
                              <FormInput
                                label="ZIP Code"
                                value={formData2.zipCode}
                                onChange={(e) => handlePatientInputChange('zipCode', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                      {showFields ? (
                        <>
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                              setShowFields(false);
                              scrollToTop();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading || (!formData2.salutation || !formData2.firstName || !formData2.phone)}
                          >
                            {isLoading ? 'Adding Patient...' : 'Add Patient'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={handleGenerateQR}
                            disabled={isLoading || totalAmount <= 0 || !formData.patientId}
                          >
                            {isLoading ? 'Processing...' : 'Pay with QR Code'}
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading || !isFormValid || !formData.patientId}
                            onClick={() => setShowErrors(true)}
                          >
                            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar (Fixed Position) */}
            {!showFields && formData.doctorId && (
              <div className="fixed-calendar hidden lg:block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      Doctor's Schedule
                    </h3>
                  </div>
                  <div className="p-4">
                    {doctorDetails && (
                      <div className="mb-4 p-3 bg-teal-50 rounded-lg">
                        <p className="font-semibold text-gray-900">
                          Dr. {doctorDetails.firstName} {doctorDetails.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {doctorDetails.specialization} • {doctorDetails.isFullTime ? 'Full-time' : 'Part-time'}
                        </p>
                        {type === 'opd' && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-900 flex items-center">
                              <FaMoneyBillWave className="mr-2" size={14} />
                              Consultation Fee: {getDoctorFeeDisplay()}
                            </p>
                            {doctorDetails.revenuePercentage && doctorDetails.revenuePercentage < 100 && (
                              <p className="text-xs text-blue-600 mt-1">
                                Doctor's revenue share: {doctorDetails.revenuePercentage}%
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Available Hours</h4>
                        <div className="space-y-2">
                          {doctorWorkingHours.map((range, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm font-medium">{range.start}</span>
                              <span className="text-gray-500">to</span>
                              <span className="text-sm font-medium">{range.end}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {formData.type === 'time-based' && existingAppointments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Booked Appointments</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {existingAppointments.map((appt, index) => {
                              // Convert UTC times to local time for display
                              const startTimeLocal = convertUTCTimeToLocalForDate(appt.startTime, formData.date);
                              const endTimeLocal = convertUTCTimeToLocalForDate(appt.endTime, formData.date);
                              
                              const startTime = startTimeLocal ? startTimeLocal.toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                              }) : 'N/A';
                              
                              const endTime = endTimeLocal ? endTimeLocal.toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                              }) : 'N/A';

                              return (
                                <div key={index} className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">
                                      {startTime} - {endTime}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      {appt.duration} min
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 truncate">
                                    {appt.patient?.first_name} {appt.patient?.last_name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {showPaymentPendingModal && (
        <PaymentPendingModal
          isOpen={showPaymentPendingModal}
          onClose={() => setShowPaymentPendingModal(false)}
          onProceed={() => {
            setShowPaymentPendingModal(false);
            handleSubmit(null, null, true);
          }}
          amount={totalAmount}
          patientName={
            selectedPatient ?
              `${selectedPatient.salutation || ''} ${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() :
              'Unknown Patient'
          }
          appointmentDetails={{
            date: formatDateDisplay(formData.date),
            time: formData.start_time || 'Queue Based',
            doctor: doctors.find(d => d._id === formData.doctorId)
              ? `Dr. ${doctors.find(d => d._id === formData.doctorId).firstName} ${doctors.find(d => d._id === formData.doctorId).lastName}`
              : 'Doctor Selected'
          }}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
          }}
          message={successMessage}
          patientName={newPatientData ?
            `${newPatientData.salutation || ''} ${newPatientData.first_name || ''} ${newPatientData.last_name || ''}`.trim() :
            (selectedPatient ?
              `${selectedPatient.salutation || ''} ${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() :
              ''
            )
          }
          isPatient={!!newPatientData}
          onContinue={() => {
            setShowSuccessModal(false);
            if (!newPatientData) {
              setSlipModal(true); // Show slip for appointments
            } else {
              handleSelectPatientAfterSuccess();
            }
          }}
          showSlipButton={!newPatientData} // Show slip button only for appointments, not new patients
        />
      )}

      {/* Appointment Slip Modal */}
      {slipModal && submitDetails && (
        <AppointmentSlipModal
          isOpen={slipModal}
          onClose={() => setSlipModal(false)}
          appointmentData={submitDetails}
          hospitalInfo={hospitalInfo}
        />
      )}
    </>
  );
};

export default AddIPDAppointmentStaff;