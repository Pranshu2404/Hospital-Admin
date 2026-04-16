import axios from 'axios';
import {
  saveDoctorWorkingHours,
  saveDoctorCharges,
  saveHospitalCharges,
  saveDepartmentsOffline,
  saveDoctorsOffline,
  saveRoomsOffline,
  getDoctorWorkingHoursOffline,
  getDoctorChargesOffline,
  getHospitalChargesOffline
} from './offlineDB';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Store names for offline calendar
const OFFLINE_STORES = {
  DOCTOR_WORKING_HOURS: 'doctorWorkingHours',
  DOCTOR_CHARGES: 'doctorCharges',
  HOSPITAL_CHARGES: 'hospitalCharges',
  DOCTOR_SCHEDULE: 'doctorSchedule'
};

// Save doctor's working hours for a specific date
export const saveDoctorWorkingHoursOffline = async (doctorId, date, workingHours) => {
  try {
    const key = `${doctorId}_${date}`;
    await saveDoctorWorkingHours(doctorId, date, workingHours);
  } catch (error) {
    console.error('Error saving doctor working hours:', error);
  }
};

// Get doctor's working hours for a specific date from offline cache
export const getDoctorWorkingHoursOfflineCache = async (doctorId, date) => {
  try {
    return await getDoctorWorkingHoursOffline(doctorId, date);
  } catch (error) {
    console.error('Error getting doctor working hours:', error);
    return null;
  }
};

// Save doctor charges (consultation fee)
export const saveDoctorChargesOffline = async (doctorId, charges) => {
  try {
    await saveDoctorCharges(doctorId, charges);
  } catch (error) {
    console.error('Error saving doctor charges:', error);
  }
};

// Get doctor charges from offline cache
export const getDoctorChargesOfflineCache = async (doctorId) => {
  try {
    return await getDoctorChargesOffline(doctorId);
  } catch (error) {
    console.error('Error getting doctor charges:', error);
    return null;
  }
};

// Save hospital charges
export const saveHospitalChargesOffline = async (hospitalId, charges) => {
  try {
    await saveHospitalCharges(hospitalId, charges);
  } catch (error) {
    console.error('Error saving hospital charges:', error);
  }
};

// Get hospital charges from offline cache
export const getHospitalChargesOfflineCache = async (hospitalId) => {
  try {
    return await getHospitalChargesOffline(hospitalId);
  } catch (error) {
    console.error('Error getting hospital charges:', error);
    return null;
  }
};

// Sync all calendar data for next 7 days with master data
export const syncCalendarData = async () => {
  if (!navigator.onLine) {
    console.log('Offline, skipping calendar sync');
    return false;
  }

  try {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) return false;

    // Fetch and save departments
    console.log('Fetching departments...');
    const departmentsRes = await axios.get(`${API_URL}/departments`);
    if (departmentsRes.data.length > 0) {
      await saveDepartmentsOffline(departmentsRes.data);
    }

    // Fetch and save rooms
    console.log('Fetching rooms...');
    const roomsRes = await axios.get(`${API_URL}/rooms`);
    if (roomsRes.data.length > 0) {
      await saveRoomsOffline(roomsRes.data);
    }

    // Fetch doctors list
    const doctorsRes = await axios.get(`${API_URL}/doctors`);
    const doctors = doctorsRes.data;

    // Save doctors offline
    await saveDoctorsOffline(doctors);

    for (const doctor of doctors) {
      // Fetch doctor details (charges)
      const doctorRes = await axios.get(`${API_URL}/doctors/${doctor._id}`);
      await saveDoctorCharges(doctor._id, {
        amount: doctorRes.data.amount,
        paymentType: doctorRes.data.paymentType,
        isFullTime: doctorRes.data.isFullTime,
        firstName: doctorRes.data.firstName,
        lastName: doctorRes.data.lastName,
        specialization: doctorRes.data.specialization,
        timeSlots: doctorRes.data.timeSlots
      });

      // Fetch schedule for each date
      for (const date of dates) {
        try {
          const scheduleRes = await axios.get(
            `${API_URL}/calendar/${hospitalId}/doctor/${doctor._id}/${date}`
          );
          if (scheduleRes.data && scheduleRes.data.workingHours) {
            await saveDoctorWorkingHours(doctor._id, date, scheduleRes.data.workingHours);
          } else if (doctorRes.data.timeSlots && doctorRes.data.timeSlots.length > 0) {
            // Use doctor's timeSlots as fallback
            await saveDoctorWorkingHours(doctor._id, date, doctorRes.data.timeSlots);
          }
        } catch (err) {
          console.warn(`No schedule for doctor ${doctor._id} on ${date}`);
        }
      }
    }

    // Fetch hospital charges
    const chargesRes = await axios.get(`${API_URL}/hospital-charges/${hospitalId}`);
    await saveHospitalCharges(hospitalId, chargesRes.data);

    console.log('Calendar data synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing calendar data:', error);
    return false;
  }
};

// Initialize offline stores
export const initOfflineCalendarStores = async () => {
  const stores = [
    OFFLINE_STORES.DOCTOR_WORKING_HOURS,
    OFFLINE_STORES.DOCTOR_CHARGES,
    OFFLINE_STORES.HOSPITAL_CHARGES,
    OFFLINE_STORES.DOCTOR_SCHEDULE
  ];

  for (const store of stores) {
    if (!db.tables.some(t => t.name === store)) {
      console.log(`Table ${store} not found, will be created on next version`);
    }
  }
};