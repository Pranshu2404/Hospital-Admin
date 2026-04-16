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

// Fetch all departments
export const fetchAllDepartments = async () => {
  try {
    console.log('[CalendarSync] Fetching all departments...');
    const response = await axios.get(`${API_URL}/departments`);
    console.log(`[CalendarSync] Fetched ${response.data.length} departments`);
    return response.data;
  } catch (error) {
    console.error('[CalendarSync] Error fetching departments:', error);
    return [];
  }
};

// Fetch all rooms
export const fetchAllRooms = async () => {
  try {
    console.log('[CalendarSync] Fetching all rooms...');
    const response = await axios.get(`${API_URL}/rooms`);
    console.log(`[CalendarSync] Fetched ${response.data.length} rooms`);
    return response.data;
  } catch (error) {
    console.error('[CalendarSync] Error fetching rooms:', error);
    return [];
  }
};

// Fetch all doctors - ensure department_id is extracted from nested department object
export const fetchAllDoctors = async () => {
  try {
    console.log('[CalendarSync] Fetching all doctors...');
    const response = await axios.get(`${API_URL}/doctors`);

    // Process doctors to extract department_id from nested department object
    const processedDoctors = response.data.map(doctor => ({
      ...doctor,
      department_id: doctor.department?._id || doctor.department_id,
      department_name: doctor.department?.name || null
    }));

    console.log(`[CalendarSync] Fetched ${processedDoctors.length} doctors`);
    return processedDoctors;
  } catch (error) {
    console.error('[CalendarSync] Error fetching doctors:', error);
    return [];
  }
};

// Fetch doctors by department
export const fetchDoctorsByDepartment = async (departmentId) => {
  try {
    console.log(`[CalendarSync] Fetching doctors for department ${departmentId}...`);
    const response = await axios.get(`${API_URL}/doctors/department/${departmentId}`);

    // Process doctors to extract department_id from nested department object
    const processedDoctors = response.data.map(doctor => ({
      ...doctor,
      department_id: doctor.department?._id || doctor.department_id,
      department_name: doctor.department?.name || null
    }));

    console.log(`[CalendarSync] Fetched ${processedDoctors.length} doctors for department`);
    return processedDoctors;
  } catch (error) {
    console.error('[CalendarSync] Error fetching doctors by department:', error);
    return [];
  }
};

// Fetch doctor details with charges
export const fetchDoctorDetails = async (doctorId) => {
  try {
    console.log(`[CalendarSync] Fetching doctor details for ${doctorId}...`);
    const response = await axios.get(`${API_URL}/doctors/${doctorId}`);

    // Process doctor to include department_id
    const processedDoctor = {
      ...response.data,
      department_id: response.data.department?._id || response.data.department_id,
      department_name: response.data.department?.name || null
    };

    console.log(`[CalendarSync] Doctor details fetched:`, {
      id: processedDoctor._id,
      name: `${processedDoctor.firstName} ${processedDoctor.lastName}`,
      isFullTime: processedDoctor.isFullTime,
      paymentType: processedDoctor.paymentType,
      department_id: processedDoctor.department_id
    });
    return processedDoctor;
  } catch (error) {
    console.error(`[CalendarSync] Error fetching doctor ${doctorId}:`, error);
    return null;
  }
};

// Fetch doctor's schedule for a specific date
export const fetchDoctorSchedule = async (hospitalId, doctorId, date) => {
  try {
    console.log(`[CalendarSync] Fetching schedule for doctor ${doctorId} on ${date}...`);
    const url = `${API_URL}/calendar/${hospitalId}/doctor/${doctorId}/${date}`;
    console.log(`[CalendarSync] Request URL: ${url}`);

    const response = await axios.get(url);
    console.log(`[CalendarSync] Schedule response for ${doctorId} on ${date}:`, {
      hasWorkingHours: !!response.data.workingHours,
      workingHoursLength: response.data.workingHours?.length || 0,
      workingHours: response.data.workingHours,
      hasBookedAppointments: !!response.data.bookedAppointments,
      bookedAppointmentsCount: response.data.bookedAppointments?.length || 0
    });

    return response.data;
  } catch (error) {
    console.warn(`[CalendarSync] No schedule for doctor ${doctorId} on ${date}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    return null;
  }
};

// Fetch hospital charges
export const fetchHospitalCharges = async (hospitalId) => {
  try {
    console.log(`[CalendarSync] Fetching hospital charges for ${hospitalId}...`);
    const response = await axios.get(`${API_URL}/hospital-charges/${hospitalId}`);
    console.log('[CalendarSync] Hospital charges fetched:', {
      hasOpdCharges: !!response.data.opdCharges,
      hasIpdCharges: !!response.data.ipdCharges
    });
    return response.data;
  } catch (error) {
    console.error('[CalendarSync] Error fetching hospital charges:', error);
    return null;
  }
};

// Get dates to sync (next 7 days)
export const getDatesToSync = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
    console.log(`[CalendarSync] Will sync date: ${dateString} (day ${i})`);
  }

  return dates;
};

// Sync all calendar data
export const syncAllCalendarData = async (onProgress = null) => {
  console.log('[CalendarSync] ========== STARTING CALENDAR SYNC ==========');

  if (!navigator.onLine) {
    console.log('[CalendarSync] Device is offline, skipping sync');
    return { success: false, message: 'Device is offline' };
  }

  const hospitalId = localStorage.getItem('hospitalId');
  console.log('[CalendarSync] Hospital ID:', hospitalId);

  if (!hospitalId) {
    console.error('[CalendarSync] No hospital ID found');
    return { success: false, message: 'No hospital ID found' };
  }

  const results = {
    doctorsSynced: 0,
    doctorsFailed: 0,
    schedulesSynced: 0,
    schedulesFailed: 0,
    hospitalChargesSynced: false,
    totalDoctors: 0,
    datesSynced: [],
    departmentsSynced: false,
    roomsSynced: false,
    masterDataSynced: false
  };

  try {
    // Step 1: Fetch hospital charges
    console.log('[CalendarSync] Step 1: Fetching hospital charges...');
    if (onProgress) onProgress({ step: 'Fetching hospital charges...', percent: 5 });
    const hospitalCharges = await fetchHospitalCharges(hospitalId);
    if (hospitalCharges) {
      await saveHospitalCharges(hospitalId, hospitalCharges);
      results.hospitalChargesSynced = true;
      console.log('[CalendarSync] Hospital charges saved successfully');
    }

    // Step 2: Fetch departments
    console.log('[CalendarSync] Step 2: Fetching departments...');
    if (onProgress) onProgress({ step: 'Fetching departments...', percent: 10 });
    const departments = await fetchAllDepartments();
    if (departments.length > 0) {
      await saveDepartmentsOffline(departments);
      results.departmentsSynced = true;
      console.log(`[CalendarSync] Saved ${departments.length} departments`);
    }

    // Step 3: Fetch rooms
    console.log('[CalendarSync] Step 3: Fetching rooms...');
    if (onProgress) onProgress({ step: 'Fetching rooms...', percent: 15 });
    const rooms = await fetchAllRooms();
    if (rooms.length > 0) {
      await saveRoomsOffline(rooms);
      results.roomsSynced = true;
      console.log(`[CalendarSync] Saved ${rooms.length} rooms`);
    }

    // Step 4: Fetch all doctors
    console.log('[CalendarSync] Step 4: Fetching doctors list...');
    if (onProgress) onProgress({ step: 'Fetching doctors list...', percent: 20 });
    const doctors = await fetchAllDoctors();
    results.totalDoctors = doctors.length;

    if (doctors.length > 0) {
      // Save doctors with processed department data
      await saveDoctorsOffline(doctors);
      results.masterDataSynced = true;
      console.log(`[CalendarSync] Saved ${doctors.length} doctors with department mapping`);
    }

    if (doctors.length === 0) {
      console.warn('[CalendarSync] No doctors found');
      return { ...results, success: false, message: 'No doctors found' };
    }

    const datesToSync = getDatesToSync();
    results.datesSynced = datesToSync;
    console.log(`[CalendarSync] Will sync ${datesToSync.length} dates for each doctor`);

    let currentDoctor = 0;

    // Step 5: For each doctor, fetch details and schedules
    for (const doctor of doctors) {
      currentDoctor++;
      console.log(`\n[CalendarSync] ===== Processing doctor ${currentDoctor}/${doctors.length}: Dr. ${doctor.firstName} ${doctor.lastName} (ID: ${doctor._id}) =====`);

      const doctorProgress = 20 + (currentDoctor / doctors.length) * 80;

      if (onProgress) {
        onProgress({
          step: `Syncing Dr. ${doctor.firstName} ${doctor.lastName}...`,
          percent: doctorProgress,
          currentDoctor,
          totalDoctors: doctors.length
        });
      }

      // Fetch and save doctor details with charges
      console.log(`[CalendarSync] Fetching details for Dr. ${doctor.firstName} ${doctor.lastName}...`);
      const doctorDetails = await fetchDoctorDetails(doctor._id);
      if (doctorDetails) {
        const chargesData = {
          amount: doctorDetails.amount,
          paymentType: doctorDetails.paymentType,
          isFullTime: doctorDetails.isFullTime,
          firstName: doctorDetails.firstName,
          lastName: doctorDetails.lastName,
          specialization: doctorDetails.specialization,
          qualification: doctorDetails.qualification,
          timeSlots: doctorDetails.timeSlots,
          department_id: doctorDetails.department_id,
          department_name: doctorDetails.department_name
        };
        await saveDoctorCharges(doctor._id, chargesData);
        results.doctorsSynced++;
        console.log(`[CalendarSync] Doctor charges saved with department_id: ${doctorDetails.department_id}`);
      } else {
        results.doctorsFailed++;
        console.error(`[CalendarSync] Failed to fetch details for doctor ${doctor._id}`);
      }

      // Fetch and save schedules for each date
      console.log(`[CalendarSync] Fetching schedules for ${datesToSync.length} dates...`);
      for (const date of datesToSync) {
        console.log(`[CalendarSync] Checking schedule for ${date}...`);
        const schedule = await fetchDoctorSchedule(hospitalId, doctor._id, date);

        if (schedule && schedule.workingHours && schedule.workingHours.length > 0) {
          console.log(`[CalendarSync] Saving working hours for ${date}:`, schedule.workingHours);
          await saveDoctorWorkingHours(doctor._id, date, schedule.workingHours);
          results.schedulesSynced++;
          console.log(`[CalendarSync] ✓ Working hours saved for ${date}`);
        } else if (doctorDetails?.timeSlots && doctorDetails.timeSlots.length > 0) {
          console.log(`[CalendarSync] Using timeSlots fallback for ${date}`);
          await saveDoctorWorkingHours(doctor._id, date, doctorDetails.timeSlots);
          results.schedulesSynced++;
        } else {
          console.log(`[CalendarSync] ✗ No working hours found for ${date}`);
          results.schedulesFailed++;
        }
      }
      console.log(`[CalendarSync] Completed doctor ${currentDoctor}/${doctors.length}`);
    }

    // Save last sync time
    localStorage.setItem('lastCalendarSync', new Date().toISOString());
    localStorage.setItem('lastCalendarSyncSuccess', 'true');

    console.log('[CalendarSync] ========== CALENDAR SYNC COMPLETE ==========');
    console.log('[CalendarSync] Results:', results);

    if (onProgress) {
      onProgress({
        step: 'Sync complete!',
        percent: 100,
        results
      });
    }

    return { success: true, results };
  } catch (error) {
    console.error('[CalendarSync] CRITICAL ERROR during sync:', error);
    localStorage.setItem('lastCalendarSyncSuccess', 'false');

    if (onProgress) {
      onProgress({
        step: `Sync failed: ${error.message}`,
        percent: 100,
        error: error.message
      });
    }

    return { success: false, message: error.message, results };
  }
};

// Get cached calendar data (for offline use)
export const getCachedCalendarData = async (doctorId, date) => {
  console.log(`[CalendarSync] Getting cached data for doctor ${doctorId} on ${date}`);
  const [workingHours, doctorDetails] = await Promise.all([
    getDoctorWorkingHoursOffline(doctorId, date),
    getDoctorChargesOffline(doctorId)
  ]);

  console.log(`[CalendarSync] Cached data:`, {
    hasWorkingHours: !!workingHours,
    workingHoursLength: workingHours?.length || 0,
    hasDoctorDetails: !!doctorDetails,
    doctorDepartmentId: doctorDetails?.department_id
  });

  return {
    workingHours: workingHours || [],
    doctorDetails: doctorDetails || null
  };
};

// Check if calendar data is available offline
export const isCalendarDataAvailableOffline = async (doctorId, date) => {
  const workingHours = await getDoctorWorkingHoursOffline(doctorId, date);
  const doctorDetails = await getDoctorChargesOffline(doctorId);
  const result = {
    workingHoursAvailable: !!workingHours && workingHours.length > 0,
    doctorDetailsAvailable: !!doctorDetails
  };
  console.log(`[CalendarSync] Offline availability for ${doctorId} on ${date}:`, result);
  return result;
};

// Sync specific doctor's data for a date range
export const syncDoctorCalendarData = async (doctorId, startDate, endDate, onProgress = null) => {
  console.log(`[CalendarSync] Syncing doctor ${doctorId} from ${startDate} to ${endDate}`);

  if (!navigator.onLine) {
    return { success: false, message: 'Device is offline' };
  }

  const hospitalId = localStorage.getItem('hospitalId');
  if (!hospitalId) {
    return { success: false, message: 'No hospital ID found' };
  }

  const results = {
    schedulesSynced: 0,
    schedulesFailed: 0,
    datesProcessed: []
  };

  try {
    // Fetch doctor details
    const doctorDetails = await fetchDoctorDetails(doctorId);
    if (doctorDetails) {
      await saveDoctorCharges(doctorId, {
        amount: doctorDetails.amount,
        paymentType: doctorDetails.paymentType,
        isFullTime: doctorDetails.isFullTime,
        firstName: doctorDetails.firstName,
        lastName: doctorDetails.lastName,
        specialization: doctorDetails.specialization,
        qualification: doctorDetails.qualification,
        timeSlots: doctorDetails.timeSlots,
        department_id: doctorDetails.department_id,
        department_name: doctorDetails.department_name
      });
    }

    // Generate dates between startDate and endDate
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let currentIndex = 0;
    for (const date of dates) {
      currentIndex++;
      if (onProgress) {
        onProgress({
          step: `Syncing schedule for ${date}...`,
          percent: (currentIndex / dates.length) * 100,
          currentDate: date,
          totalDates: dates.length
        });
      }

      const schedule = await fetchDoctorSchedule(hospitalId, doctorId, date);
      if (schedule && schedule.workingHours && schedule.workingHours.length > 0) {
        await saveDoctorWorkingHours(doctorId, date, schedule.workingHours);
        results.schedulesSynced++;
        results.datesProcessed.push(date);
        console.log(`[CalendarSync] Saved working hours for ${date}`);
      } else if (doctorDetails?.timeSlots && doctorDetails.timeSlots.length > 0) {
        await saveDoctorWorkingHours(doctorId, date, doctorDetails.timeSlots);
        results.schedulesSynced++;
        results.datesProcessed.push(date);
        console.log(`[CalendarSync] Used timeSlots fallback for ${date}`);
      } else {
        results.schedulesFailed++;
        console.log(`[CalendarSync] No working hours for ${date}`);
      }
    }

    console.log(`[CalendarSync] Doctor sync complete:`, results);
    return { success: true, results };
  } catch (error) {
    console.error('[CalendarSync] Doctor calendar sync failed:', error);
    return { success: false, message: error.message, results };
  }
};

// Sync specific department's doctors data
export const syncDepartmentCalendarData = async (departmentId, startDate, endDate, onProgress = null) => {
  console.log(`[CalendarSync] Syncing department ${departmentId} from ${startDate} to ${endDate}`);

  if (!navigator.onLine) {
    return { success: false, message: 'Device is offline' };
  }

  try {
    const doctors = await fetchDoctorsByDepartment(departmentId);
    const results = {
      doctorsProcessed: 0,
      totalDoctors: doctors.length,
      schedulesSynced: 0,
      schedulesFailed: 0
    };

    let currentDoctor = 0;
    for (const doctor of doctors) {
      currentDoctor++;
      if (onProgress) {
        onProgress({
          step: `Syncing Dr. ${doctor.firstName} ${doctor.lastName}...`,
          percent: (currentDoctor / doctors.length) * 100,
          currentDoctor,
          totalDoctors: doctors.length
        });
      }

      const doctorResult = await syncDoctorCalendarData(doctor._id, startDate, endDate);
      if (doctorResult.success) {
        results.doctorsProcessed++;
        results.schedulesSynced += doctorResult.results.schedulesSynced;
        results.schedulesFailed += doctorResult.results.schedulesFailed;
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[CalendarSync] Department calendar sync failed:', error);
    return { success: false, message: error.message };
  }
};