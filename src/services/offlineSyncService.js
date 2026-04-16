import axios from 'axios';
import { 
  db,
  getUnsyncedPatients,
  getUnsyncedAppointments,
  updatePatientSyncStatus,
  updateAppointmentSyncStatus,
  updateSyncItemStatus,
  incrementRetryCount,
  getPendingSyncItems
} from './offlineDB';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Sync patients to backend using bulk endpoint
export const syncPatientsToServer = async () => {
  const unsyncedPatients = await getUnsyncedPatients();
  
  if (unsyncedPatients.length === 0) {
    return { synced: 0, failed: 0, conflicts: 0 };
  }
  
  const results = {
    synced: 0,
    failed: 0,
    conflicts: 0,
    conflictDetails: []
  };
  
  const bulkPayload = unsyncedPatients.map(patient => ({
    localId: patient.localId,
    salutation: patient.salutation,
    first_name: patient.first_name,
    middle_name: patient.middle_name,
    last_name: patient.last_name,
    email: patient.email,
    phone: patient.phone,
    gender: patient.gender,
    dob: patient.dob,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    zipCode: patient.zipCode,
    blood_group: patient.blood_group,
    aadhaar_number: patient.aadhaar_number,
    patient_image: patient.patient_image,
    emergency_contact: patient.emergency_contact,
    emergency_phone: patient.emergency_phone,
    medical_history: patient.medical_history,
    allergies: patient.allergies,
    medications: patient.medications,
    patient_type: patient.patient_type || "opd"
  }));
  
  try {
    const response = await axios.post(`${API_URL}/patients/bulk-add`, bulkPayload);
    
    if (response.data.successful && response.data.successful.length > 0) {
      for (const success of response.data.successful) {
        await updatePatientSyncStatus(success.localId, success.serverId);
        results.synced++;
      }
    }
    
    if (response.data.failed && response.data.failed.length > 0) {
      for (const failure of response.data.failed) {
        if (failure.reason && (failure.reason.includes('Duplicate') || failure.reason.includes('already exists'))) {
          results.conflicts++;
          results.conflictDetails.push(failure);
        } else {
          results.failed++;
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Bulk patient sync failed:', error);
    return { synced: 0, failed: unsyncedPatients.length, conflicts: 0, error: error.message };
  }
};

// Sync appointments to backend - Updated to handle manual Patient IDs (UHIDs)
export const syncAppointmentsToServer = async () => {
  const unsyncedAppointments = await getUnsyncedAppointments();
  
  if (unsyncedAppointments.length === 0) {
    return { synced: 0, failed: 0, conflicts: 0 };
  }
  
  // Get all patients for mapping (including those that might be synced or not)
  const allPatients = await db.patients.toArray();
  
  // Create comprehensive patient mapping
  const patientMapping = {};
  for (const patient of allPatients) {
    // Map by localId
    if (patient.localId) {
      patientMapping[patient.localId] = patient.serverId || patient.localId;
    }
    // Map by serverId
    if (patient.serverId) {
      patientMapping[patient.serverId] = patient.serverId;
    }
    // Map by patientId (UHID)
    if (patient.patientId) {
      patientMapping[patient.patientId] = patient.serverId || patient.localId;
    }
    // Map by uhid
    if (patient.uhid) {
      patientMapping[patient.uhid] = patient.serverId || patient.localId;
    }
    // Map by phone
    if (patient.phone) {
      patientMapping[patient.phone] = patient.serverId || patient.localId;
    }
  }
  
  // Prepare bulk payload - Send the original patient identifier
  const bulkPayload = [];
  const skippedAppointments = [];
  
  for (const appointment of unsyncedAppointments) {
    // Try to find patient server ID using multiple strategies
    let patientServerId = null;
    let foundIdentifier = null;
    
    // Strategy 1: Check if patientLocalId exists in mapping
    if (appointment.patientLocalId && patientMapping[appointment.patientLocalId]) {
      patientServerId = patientMapping[appointment.patientLocalId];
      foundIdentifier = `patientLocalId: ${appointment.patientLocalId}`;
    }
    
    // Strategy 2: Check if patient_id (original manual ID) exists in mapping
    if (!patientServerId && appointment.patient_id && patientMapping[appointment.patient_id]) {
      patientServerId = patientMapping[appointment.patient_id];
      foundIdentifier = `patient_id: ${appointment.patient_id}`;
    }
    
    // Strategy 3: Check if phone exists in mapping
    if (!patientServerId && appointment.phone && patientMapping[appointment.phone]) {
      patientServerId = patientMapping[appointment.phone];
      foundIdentifier = `phone: ${appointment.phone}`;
    }
    
    // Strategy 4: Check if uhid exists in mapping
    if (!patientServerId && appointment.uhid && patientMapping[appointment.uhid]) {
      patientServerId = patientMapping[appointment.uhid];
      foundIdentifier = `uhid: ${appointment.uhid}`;
    }
    
    // If still no patient found, check if there's a patient with matching patientId in the database
    if (!patientServerId) {
      // Try to find if any patient in the mapping has matching patientId
      for (const [key, value] of Object.entries(patientMapping)) {
        if (key === appointment.patient_id || key === appointment.uhid || key === appointment.phone) {
          patientServerId = value;
          foundIdentifier = `matched key: ${key}`;
          break;
        }
      }
    }
    
    if (!patientServerId) {
      // If no patient found, we can still try to sync by sending the manual ID
      // The backend will try to find the patient by patientId/uhid
      console.log(`No patient mapping found for appointment ${appointment.localId}, will send manual ID: ${appointment.patient_id || appointment.uhid}`);
      patientServerId = appointment.patient_id || appointment.uhid || appointment.patientLocalId;
      foundIdentifier = `using manual ID: ${patientServerId}`;
    }
    
    console.log(`Appointment ${appointment.localId}: Using patient ID: ${patientServerId} (found via ${foundIdentifier})`);
    
    bulkPayload.push({
      localId: appointment.localId,
      patientLocalId: appointment.patientLocalId,
      patient_id: patientServerId, // This can be either MongoDB ID or manual UHID
      doctor_id: appointment.doctor_id,
      hospital_id: appointment.hospital_id,
      department_id: appointment.department_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      duration: appointment.duration,
      type: appointment.type || 'time-based',
      appointment_type: appointment.appointment_type || 'consultation',
      priority: appointment.priority || 'Normal',
      notes: appointment.notes || '',
      status: appointment.status || 'Scheduled',
      room_id: appointment.room_id,
      // Include additional fields for backend lookup
      phone: appointment.phone || appointment.patient_id,
      uhid: appointment.uhid || appointment.patient_id
    });
  }
  
  if (bulkPayload.length === 0) {
    return { synced: 0, failed: 0, conflicts: 0, skipped: skippedAppointments.length };
  }
  
  try {
    console.log(`Syncing ${bulkPayload.length} appointments to server...`);
    const response = await axios.post(`${API_URL}/appointments/bulk-add`, bulkPayload);
    
    const results = { 
      synced: 0, 
      failed: 0, 
      conflicts: 0,
      details: {
        successful: response.data.successful || [],
        failed: response.data.failed || []
      }
    };
    
    if (response.data.successful && response.data.successful.length > 0) {
      for (const success of response.data.successful) {
        await updateAppointmentSyncStatus(success.localId, success.serverId);
        results.synced++;
        console.log(`Appointment ${success.localId} synced successfully with server ID: ${success.serverId}`);
      }
    }
    
    if (response.data.failed && response.data.failed.length > 0) {
      for (const failure of response.data.failed) {
        if (failure.reason && (failure.reason.includes('conflict') || failure.reason.includes('slot'))) {
          results.conflicts++;
        } else {
          results.failed++;
        }
        console.warn(`Appointment ${failure.localId} failed to sync: ${failure.reason}`);
      }
    }
    
    console.log(`Sync completed: ${results.synced} synced, ${results.failed} failed, ${results.conflicts} conflicts`);
    return results;
  } catch (error) {
    console.error('Bulk appointment sync failed:', error);
    return { 
      synced: 0, 
      failed: bulkPayload.length, 
      conflicts: 0, 
      error: error.message,
      details: { error: error.response?.data || error.message }
    };
  }
};

// Sync specific appointment by ID (for retry)
export const syncSingleAppointment = async (appointmentLocalId) => {
  try {
    const appointment = await db.appointments.get(appointmentLocalId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }
    
    if (appointment.isSynced) {
      return { success: true, message: 'Already synced' };
    }
    
    // Get patient mapping
    const patient = await db.patients.get(appointment.patientLocalId);
    let patientServerId = patient?.serverId || appointment.patient_id;
    
    const payload = {
      localId: appointment.localId,
      patientLocalId: appointment.patientLocalId,
      patient_id: patientServerId,
      doctor_id: appointment.doctor_id,
      hospital_id: appointment.hospital_id,
      department_id: appointment.department_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      duration: appointment.duration,
      type: appointment.type || 'time-based',
      appointment_type: appointment.appointment_type || 'consultation',
      priority: appointment.priority || 'Normal',
      notes: appointment.notes || '',
      status: appointment.status || 'Scheduled',
      room_id: appointment.room_id,
      phone: appointment.phone || appointment.patient_id,
      uhid: appointment.uhid || appointment.patient_id
    };
    
    const response = await axios.post(`${API_URL}/appointments/bulk-add`, [payload]);
    
    if (response.data.successful && response.data.successful.length > 0) {
      const success = response.data.successful[0];
      await updateAppointmentSyncStatus(success.localId, success.serverId);
      return { success: true, serverId: success.serverId };
    }
    
    return { success: false, error: response.data.failed?.[0]?.reason || 'Unknown error' };
  } catch (error) {
    console.error('Error syncing single appointment:', error);
    return { success: false, error: error.message };
  }
};

// Full sync process
export const performFullSync = async (onProgress, onComplete) => {
  console.log('Starting full sync...');
  
  if (onProgress) onProgress({ step: 'Syncing patients...', percent: 25 });
  const patientResults = await syncPatientsToServer();
  
  if (onProgress) onProgress({ step: 'Syncing appointments...', percent: 50 });
  const appointmentResults = await syncAppointmentsToServer();
  
  if (onProgress) onProgress({ step: 'Cleaning up...', percent: 75 });
  const pendingItems = await getPendingSyncItems();
  for (const item of pendingItems) {
    if (item.retries >= 5) {
      await updateSyncItemStatus(item.id, 'failed', 'Max retries exceeded');
    } else if (item.retries > 0) {
      await incrementRetryCount(item.id);
    }
  }
  
  const results = {
    patients: patientResults,
    appointments: appointmentResults,
    timestamp: new Date().toISOString()
  };
  
  if (onProgress) onProgress({ step: 'Sync complete!', percent: 100 });
  if (onComplete) onComplete(results);
  
  return results;
};

// Check internet status
export const isOnline = () => {
  return navigator.onLine;
};

// Setup network listeners
export const setupNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', () => {
    console.log('Network online, triggering sync...');
    onOnline && onOnline();
  });
  
  window.addEventListener('offline', () => {
    console.log('Network offline');
    onOffline && onOffline();
  });
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Get all offline data for debugging
export const getAllOfflineData = async () => {
  const patients = await db.patients.toArray();
  const appointments = await db.appointments.toArray();
  const syncQueue = await db.syncQueue.toArray();
  
  return { patients, appointments, syncQueue };
};

// Get sync status
export const getSyncStatus = async () => {
  const unsyncedPatients = await getUnsyncedPatients();
  const unsyncedAppointments = await getUnsyncedAppointments();
  const pendingItems = await getPendingSyncItems();
  const failedItems = await getPendingSyncItems(); // You might want a separate getFailedSyncItems function
  
  return {
    hasPendingSync: unsyncedPatients.length > 0 || unsyncedAppointments.length > 0,
    pendingPatients: unsyncedPatients.length,
    pendingAppointments: unsyncedAppointments.length,
    pendingSyncItems: pendingItems.length,
    isOnline: navigator.onLine
  };
};