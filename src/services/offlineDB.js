import Dexie from "dexie";

// ================= DB SETUP =================
export const db = new Dexie("MobiqliqHospitalDB");

// Version 1 - Core tables
db.version(1).stores({
  patients: "++localId, serverId, first_name, phone, isSynced",
  appointments: "++localId, serverId, patientLocalId, doctor_id, appointment_date, isSynced",
  syncQueue: "++id, type, entity, status"
});

// Version 2 - Add calendar tables for offline support
db.version(2).stores({
  patients: "++localId, serverId, first_name, phone, isSynced",
  appointments: "++localId, serverId, patientLocalId, doctor_id, appointment_date, isSynced",
  syncQueue: "++id, type, entity, status",
  doctorWorkingHours: "id, doctorId, date, workingHours, updatedAt",
  doctorCharges: "id, doctorId, amount, paymentType, isFullTime, firstName, lastName, specialization, updatedAt",
  hospitalCharges: "id, hospitalId, opdCharges, ipdCharges, updatedAt",
  doctorSchedule: "id, doctorId, date, schedule, updatedAt"
}).upgrade(async tx => {
  console.log("Upgrading database to version 2 - adding calendar tables");
});

// Version 3 - Add master data tables (departments, doctors, rooms)
db.version(3).stores({
  patients: "++localId, serverId, first_name, phone, isSynced",
  appointments: "++localId, serverId, patientLocalId, doctor_id, appointment_date, isSynced",
  syncQueue: "++id, type, entity, status",
  doctorWorkingHours: "id, doctorId, date, workingHours, updatedAt",
  doctorCharges: "id, doctorId, amount, paymentType, isFullTime, firstName, lastName, specialization, updatedAt",
  hospitalCharges: "id, hospitalId, opdCharges, ipdCharges, updatedAt",
  doctorSchedule: "id, doctorId, date, schedule, updatedAt",
  departments: "id, _id, name, description",
  doctors: "id, _id, firstName, lastName, department_id, department_name, isFullTime, paymentType, amount, timeSlots, specialization, email, phone",
  rooms: "id, _id, room_number, type, status, ward, chargePerDay"
}).upgrade(async tx => {
  console.log("Upgrading database to version 3 - adding master data tables with updated schema");
});

db.open().catch(err => {
  console.error("Failed to open database:", err);
});

// ================= STORE NAMES =================
export const OFFLINE_STORES = {
  DOCTOR_WORKING_HOURS: 'doctorWorkingHours',
  DOCTOR_CHARGES: 'doctorCharges',
  HOSPITAL_CHARGES: 'hospitalCharges',
  DOCTOR_SCHEDULE: 'doctorSchedule',
  DEPARTMENTS: 'departments',
  DOCTORS: 'doctors',
  ROOMS: 'rooms'
};

// ================= HELPERS =================

const sanitize = (obj) => {
  const clean = {};
  for (const key in obj) {
    const value = obj[key];
    if (value === undefined) clean[key] = null;
    else clean[key] = value;
  }
  return clean;
};

// ================= PATIENT FUNCTIONS =================

export const addPatientToOffline = async (patientData) => {
  try {
    const cleanData = sanitize(patientData);

    const localId = await db.patients.add({
      ...cleanData,
      isSynced: false,
      createdAt: new Date().toISOString()
    });

    await db.syncQueue.add({
      type: "CREATE",
      entity: "PATIENT",
      entityLocalId: localId,
      data: JSON.stringify({ ...cleanData, localId }),
      status: "pending",
      retries: 0,
      createdAt: new Date().toISOString()
    });

    return localId;
  } catch (error) {
    console.error("Error adding patient offline:", error);
    throw error;
  }
};

export const getUnsyncedPatients = async () => {
  try {
    return await db.patients
      .filter(p => p.isSynced === false)
      .toArray();
  } catch (error) {
    console.error("Error getting unsynced patients:", error);
    return [];
  }
};

export const getAllPatients = async () => {
  try {
    return await db.patients.toArray();
  } catch (error) {
    console.error("Error getting all patients:", error);
    return [];
  }
};

export const updatePatientSyncStatus = async (localId, serverId) => {
  try {
    if (localId == null) return;
    await db.patients.update(localId, {
      isSynced: true,
      serverId
    });
  } catch (error) {
    console.error("Error updating patient sync status:", error);
  }
};

export const deletePatientFromOffline = async (localId) => {
  try {
    if (localId == null) return;
    await db.patients.delete(localId);
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
};

export const checkOfflinePatientByPhone = async (phone) => {
  try {
    if (!phone) return null;
    return await db.patients.where("phone").equals(phone).first();
  } catch (error) {
    console.error("Error checking offline patient:", error);
    return null;
  }
};

// ================= APPOINTMENT FUNCTIONS =================

export const addAppointmentToOffline = async (appointmentData, patientLocalId) => {
  try {
    const cleanData = sanitize(appointmentData);

    const localId = await db.appointments.add({
      ...cleanData,
      patientLocalId: patientLocalId ?? null,
      isSynced: false,
      createdAt: new Date().toISOString()
    });

    await db.syncQueue.add({
      type: "CREATE",
      entity: "APPOINTMENT",
      entityLocalId: localId,
      data: JSON.stringify({ ...cleanData, localId, patientLocalId }),
      status: "pending",
      retries: 0,
      createdAt: new Date().toISOString()
    });

    return localId;
  } catch (error) {
    console.error("Error adding appointment offline:", error);
    throw error;
  }
};

export const getUnsyncedAppointments = async () => {
  try {
    return await db.appointments
      .filter(a => a.isSynced === false)
      .toArray();
  } catch (error) {
    console.error("Error getting unsynced appointments:", error);
    return [];
  }
};

export const getAllAppointments = async () => {
  try {
    return await db.appointments.toArray();
  } catch (error) {
    console.error("Error getting all appointments:", error);
    return [];
  }
};

export const updateAppointmentSyncStatus = async (localId, serverId) => {
  try {
    if (localId == null) return;
    await db.appointments.update(localId, {
      isSynced: true,
      serverId
    });
  } catch (error) {
    console.error("Error updating appointment sync status:", error);
  }
};

export const deleteAppointmentFromOffline = async (localId) => {
  try {
    if (localId == null) return;
    await db.appointments.delete(localId);
  } catch (error) {
    console.error("Error deleting appointment:", error);
  }
};

// ================= SYNC QUEUE =================

export const getPendingSyncItems = async () => {
  try {
    return await db.syncQueue
      .filter(s => s.status === "pending")
      .toArray();
  } catch (error) {
    console.error("Error getting pending sync items:", error);
    return [];
  }
};

export const getFailedSyncItems = async () => {
  try {
    return await db.syncQueue
      .filter(s => s.status === "failed")
      .toArray();
  } catch (error) {
    console.error("Error getting failed sync items:", error);
    return [];
  }
};

export const updateSyncItemStatus = async (id, status, errorMessage = null) => {
  try {
    if (id == null) return;

    const updateData = { status };
    if (errorMessage) updateData.errorMessage = errorMessage;

    await db.syncQueue.update(id, updateData);
  } catch (error) {
    console.error("Error updating sync item status:", error);
  }
};

export const incrementRetryCount = async (id) => {
  try {
    if (id == null) return;

    const item = await db.syncQueue.get(id);
    if (!item) return;

    const newRetries = (item.retries || 0) + 1;
    const newStatus = newRetries >= 5 ? "failed" : "pending";

    await db.syncQueue.update(id, {
      retries: newRetries,
      status: newStatus
    });
  } catch (error) {
    console.error("Error incrementing retry count:", error);
  }
};

export const deleteSyncItem = async (id) => {
  try {
    if (id == null) return;
    await db.syncQueue.delete(id);
  } catch (error) {
    console.error("Error deleting sync item:", error);
  }
};

export const clearAllSyncedData = async () => {
  try {
    const patients = await db.patients.toArray();
    const appointments = await db.appointments.toArray();
    const syncItems = await db.syncQueue.toArray();

    await Promise.all([
      ...patients.filter(p => p.isSynced === true).map(p => db.patients.delete(p.localId)),
      ...appointments.filter(a => a.isSynced === true).map(a => db.appointments.delete(a.localId)),
      ...syncItems.filter(s => s.status === "done").map(s => db.syncQueue.delete(s.id))
    ]);
  } catch (error) {
    console.error("Error clearing synced data:", error);
  }
};

// ================= SYNC STATS =================

export const getSyncStats = async () => {
  try {
    const [patients, appointments, syncItems] = await Promise.all([
      db.patients.toArray(),
      db.appointments.toArray(),
      db.syncQueue.toArray()
    ]);

    return {
      pendingPatients: patients.filter(p => p.isSynced === false).length,
      pendingAppointments: appointments.filter(a => a.isSynced === false).length,
      pendingSync: syncItems.filter(s => s.status === "pending").length,
      failedSync: syncItems.filter(s => s.status === "failed").length
    };
  } catch (error) {
    console.error("Error getting sync stats:", error);
    return {
      pendingPatients: 0,
      pendingAppointments: 0,
      pendingSync: 0,
      failedSync: 0
    };
  }
};

// ================= CALENDAR / WORKING HOURS FUNCTIONS =================

// Save doctor's working hours for a specific date
export const saveDoctorWorkingHours = async (doctorId, date, workingHours) => {
  try {
    const id = `${doctorId}_${date}`;
    await db.doctorWorkingHours.put({
      id,
      doctorId,
      date,
      workingHours: JSON.stringify(workingHours),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving doctor working hours:", error);
  }
};

// Get doctor's working hours for a specific date from offline cache
export const getDoctorWorkingHoursOffline = async (doctorId, date) => {
  try {
    const id = `${doctorId}_${date}`;
    const data = await db.doctorWorkingHours.get(id);
    return data ? JSON.parse(data.workingHours) : null;
  } catch (error) {
    console.error("Error getting doctor working hours:", error);
    return null;
  }
};

// Save doctor charges (consultation fee)
export const saveDoctorCharges = async (doctorId, charges) => {
  try {
    await db.doctorCharges.put({
      id: doctorId,
      doctorId,
      amount: charges.amount,
      paymentType: charges.paymentType,
      isFullTime: charges.isFullTime,
      firstName: charges.firstName,
      lastName: charges.lastName,
      specialization: charges.specialization,
      qualification: charges.qualification,
      timeSlots: charges.timeSlots,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving doctor charges:", error);
  }
};

// Get doctor charges from offline cache
export const getDoctorChargesOffline = async (doctorId) => {
  try {
    const data = await db.doctorCharges.get(doctorId);
    return data || null;
  } catch (error) {
    console.error("Error getting doctor charges:", error);
    return null;
  }
};

// Save hospital charges - Store as objects, not strings
export const saveHospitalCharges = async (hospitalId, charges) => {
  try {
    const chargesToStore = {
      opdCharges: charges.opdCharges || {},
      ipdCharges: charges.ipdCharges || {}
    };

    await db.hospitalCharges.put({
      id: hospitalId,
      hospitalId,
      opdCharges: chargesToStore.opdCharges,
      ipdCharges: chargesToStore.ipdCharges,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving hospital charges:", error);
  }
};

// Get hospital charges from offline cache
export const getHospitalChargesOffline = async (hospitalId) => {
  try {
    const data = await db.hospitalCharges.get(hospitalId);
    if (!data) return null;

    return {
      opdCharges: data.opdCharges || {},
      ipdCharges: data.ipdCharges || {}
    };
  } catch (error) {
    console.error("Error getting hospital charges:", error);
    return null;
  }
};

// Save doctor's full schedule for a date
export const saveDoctorSchedule = async (doctorId, date, schedule) => {
  try {
    const id = `${doctorId}_${date}`;
    await db.doctorSchedule.put({
      id,
      doctorId,
      date,
      schedule: JSON.stringify(schedule),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving doctor schedule:", error);
  }
};

// Get doctor's schedule from offline cache
export const getDoctorScheduleOffline = async (doctorId, date) => {
  try {
    const id = `${doctorId}_${date}`;
    const data = await db.doctorSchedule.get(id);
    return data ? JSON.parse(data.schedule) : null;
  } catch (error) {
    console.error("Error getting doctor schedule:", error);
    return null;
  }
};

// Get all cached doctors
export const getAllCachedDoctors = async () => {
  try {
    return await db.doctorCharges.toArray();
  } catch (error) {
    console.error("Error getting cached doctors:", error);
    return [];
  }
};

// Clear all calendar cache
export const clearCalendarCache = async () => {
  try {
    await db.doctorWorkingHours.clear();
    await db.doctorCharges.clear();
    await db.hospitalCharges.clear();
    await db.doctorSchedule.clear();
    console.log("Calendar cache cleared");
  } catch (error) {
    console.error("Error clearing calendar cache:", error);
  }
};

// Get calendar cache stats
export const getCalendarCacheStats = async () => {
  try {
    const [workingHoursCount, doctorChargesCount, hospitalChargesCount, scheduleCount] = await Promise.all([
      db.doctorWorkingHours.count(),
      db.doctorCharges.count(),
      db.hospitalCharges.count(),
      db.doctorSchedule.count()
    ]);

    return {
      workingHoursEntries: workingHoursCount,
      doctorsCached: doctorChargesCount,
      hospitalChargesCached: hospitalChargesCount > 0,
      scheduleEntries: scheduleCount
    };
  } catch (error) {
    console.error("Error getting calendar cache stats:", error);
    return null;
  }
};

// ================= MASTER DATA FUNCTIONS (Departments, Doctors, Rooms) =================

// Save departments offline
export const saveDepartmentsOffline = async (departments) => {
  try {
    await db.departments.clear();
    await db.departments.bulkAdd(departments.map(dept => ({
      id: dept._id,
      _id: dept._id,
      name: dept.name,
      description: dept.description
    })));
    console.log(`Saved ${departments.length} departments offline`);
  } catch (error) {
    console.error("Error saving departments:", error);
  }
};

// Get departments from offline cache
export const getDepartmentsOffline = async () => {
  try {
    return await db.departments.toArray();
  } catch (error) {
    console.error("Error getting departments:", error);
    return [];
  }
};

// Save doctors offline - Updated to handle nested department object
export const saveDoctorsOffline = async (doctors) => {
  try {
    await db.doctors.clear();
    await db.doctors.bulkAdd(doctors.map(doc => ({
      id: doc._id,
      _id: doc._id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      department_id: doc.department?._id || doc.department_id, // Handle both nested and direct
      department_name: doc.department?.name || null, // Store department name for offline use
      isFullTime: doc.isFullTime,
      paymentType: doc.paymentType,
      amount: doc.amount,
      timeSlots: doc.timeSlots,
      specialization: doc.specialization,
      email: doc.email,
      phone: doc.phone
    })));
    console.log(`Saved ${doctors.length} doctors offline`);
  } catch (error) {
    console.error("Error saving doctors:", error);
  }
};

// Get doctors from offline cache
export const getDoctorsOffline = async () => {
  try {
    return await db.doctors.toArray();
  } catch (error) {
    console.error("Error getting doctors:", error);
    return [];
  }
};

// Get doctors by department from offline cache
export const getDoctorsByDepartmentOffline = async (departmentId) => {
  try {
    return await db.doctors.where('department_id').equals(departmentId).toArray();
  } catch (error) {
    console.error("Error getting doctors by department:", error);
    return [];
  }
};

// Save rooms offline
export const saveRoomsOffline = async (rooms) => {
  try {
    await db.rooms.clear();
    await db.rooms.bulkAdd(rooms.map(room => ({
      id: room._id,
      _id: room._id,
      room_number: room.room_number,
      type: room.type,
      status: room.status,
      ward: room.ward,
      chargePerDay: room.chargePerDay
    })));
    console.log(`Saved ${rooms.length} rooms offline`);
  } catch (error) {
    console.error("Error saving rooms:", error);
  }
};

// Get rooms from offline cache
export const getRoomsOffline = async () => {
  try {
    return await db.rooms.toArray();
  } catch (error) {
    console.error("Error getting rooms:", error);
    return [];
  }
};

// Clear all master data cache
export const clearMasterDataCache = async () => {
  try {
    await db.departments.clear();
    await db.doctors.clear();
    await db.rooms.clear();
    console.log("Master data cache cleared");
  } catch (error) {
    console.error("Error clearing master data cache:", error);
  }
};

// ================= DEBUG =================

export const clearDatabase = async () => {
  try {
    await db.delete();
    await db.open();
    console.log("Database cleared and reinitialized");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

export default db;