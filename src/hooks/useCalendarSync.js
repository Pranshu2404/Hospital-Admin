import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  syncAllCalendarData,
  getCachedCalendarData,
  isCalendarDataAvailableOffline,
  syncDoctorCalendarData
} from '../services/calendarSyncService';
import {
  getDoctorWorkingHoursOffline,
  getDoctorChargesOffline,
  getHospitalChargesOffline,
  saveDoctorWorkingHours,
  saveDoctorCharges,
  getDepartmentsOffline,
  getDoctorsOffline,
  getDoctorsByDepartmentOffline,
  getRoomsOffline
} from '../services/offlineDB';
import { useOfflineSync } from './useOfflineSync';

export const useCalendarSync = () => {
  const { online } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncProgress, setSyncProgress] = useState({ step: '', percent: 0 });
  const [lastSyncSuccess, setLastSyncSuccess] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  // Load last sync info on mount
  useEffect(() => {
    const savedLastSync = localStorage.getItem('lastCalendarSync');
    const savedSuccess = localStorage.getItem('lastCalendarSyncSuccess');

    if (savedLastSync) {
      setLastSyncTime(new Date(savedLastSync));
    }
    if (savedSuccess === 'true') {
      setLastSyncSuccess(true);
    } else if (savedSuccess === 'false') {
      setLastSyncSuccess(false);
    }
  }, []);

  const syncCalendar = useCallback(async () => {
    if (!online) {
      console.log('Cannot sync: offline');
      return false;
    }

    if (isSyncing) {
      console.log('Sync already in progress');
      return false;
    }

    setIsSyncing(true);
    setSyncProgress({ step: 'Starting sync...', percent: 0 });

    try {
      const result = await syncAllCalendarData((progress) => {
        setSyncProgress(progress);
      });

      if (result.success) {
        setLastSyncTime(new Date());
        setLastSyncSuccess(true);
        localStorage.setItem('lastCalendarSync', new Date().toISOString());
        localStorage.setItem('lastCalendarSyncSuccess', 'true');

        // Update cache stats
        const { getCalendarCacheStats } = await import('../services/offlineDB');
        const stats = await getCalendarCacheStats();
        setCacheStats(stats);
      } else {
        setLastSyncSuccess(false);
        localStorage.setItem('lastCalendarSyncSuccess', 'false');
      }

      return result.success;
    } catch (error) {
      console.error('Calendar sync failed:', error);
      setLastSyncSuccess(false);
      localStorage.setItem('lastCalendarSyncSuccess', 'false');
      return false;
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress({ step: '', percent: 0 }), 3000);
    }
  }, [online, isSyncing]);

  // Sync single doctor's calendar
  const syncDoctorCalendar = useCallback(async (doctorId, startDate, endDate) => {
    if (!online) {
      console.log('Cannot sync: offline');
      return false;
    }

    setIsSyncing(true);
    try {
      const result = await syncDoctorCalendarData(doctorId, startDate, endDate, (progress) => {
        setSyncProgress(progress);
      });
      return result.success;
    } catch (error) {
      console.error('Doctor calendar sync failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress({ step: '', percent: 0 }), 3000);
    }
  }, [online]);

  // Get working hours (prioritize cache)
  const getWorkingHours = useCallback(async (doctorId, date) => {
    const offlineHours = await getDoctorWorkingHoursOffline(doctorId, date);
    if (offlineHours && offlineHours.length > 0) return offlineHours;

    // If online and no cache, fetch and cache
    if (online) {
      try {
        const hospitalId = localStorage.getItem('hospitalId');
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/calendar/${hospitalId}/doctor/${doctorId}/${date}`
        );
        const workingHours = response.data.workingHours || [];

        // Cache for future use
        if (workingHours.length > 0) {
          await saveDoctorWorkingHours(doctorId, date, workingHours);
        }

        return workingHours;
      } catch (error) {
        console.error('Error fetching working hours:', error);
        return [];
      }
    }

    return [];
  }, [online]);

  const getDoctorChargesCached = useCallback(async (doctorId) => {
    const offlineCharges = await getDoctorChargesOffline(doctorId);
    if (offlineCharges) return offlineCharges;

    if (online) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`);
        const doctorData = response.data;

        // Cache for future use
        await saveDoctorCharges(doctorId, {
          amount: doctorData.amount,
          paymentType: doctorData.paymentType,
          isFullTime: doctorData.isFullTime,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          specialization: doctorData.specialization,
          qualification: doctorData.qualification,
          timeSlots: doctorData.timeSlots
        });

        return doctorData;
      } catch (error) {
        console.error('Error fetching doctor charges:', error);
        return null;
      }
    }
    return null;
  }, [online]);

  const getHospitalChargesCached = useCallback(async (hospitalId) => {
    const offlineCharges = await getHospitalChargesOffline(hospitalId);
    if (offlineCharges) return offlineCharges;

    if (online) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hospital-charges/${hospitalId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching hospital charges:', error);
        return null;
      }
    }
    return null;
  }, [online]);

  // Get departments from cache
  const getDepartmentsCached = useCallback(async () => {
    return await getDepartmentsOffline();
  }, []);

  // Get doctors from cache
  const getDoctorsCached = useCallback(async () => {
    return await getDoctorsOffline();
  }, []);

  // Get doctors by department from cache
  const getDoctorsByDepartmentCached = useCallback(async (departmentId) => {
    return await getDoctorsByDepartmentOffline(departmentId);
  }, []);

  // Get rooms from cache
  const getRoomsCached = useCallback(async () => {
    return await getRoomsOffline();
  }, []);

  // Check if data is available offline
  const checkOfflineAvailability = useCallback(async (doctorId, date) => {
    return await isCalendarDataAvailableOffline(doctorId, date);
  }, []);

  // Get cache stats
  const refreshCacheStats = useCallback(async () => {
    const { getCalendarCacheStats } = await import('../services/offlineDB');
    const stats = await getCalendarCacheStats();
    setCacheStats(stats);
    return stats;
  }, []);

  // Auto sync every hour
  useEffect(() => {
    if (!online) return;

    const lastSync = localStorage.getItem('lastCalendarSync');
    const shouldSync = !lastSync || (new Date() - new Date(lastSync)) > 60 * 60 * 1000;

    if (shouldSync) {
      const timeoutId = setTimeout(() => {
        syncCalendar();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }

    const interval = setInterval(() => {
      syncCalendar();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [online, syncCalendar]);

  // Refresh stats on mount
  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

  return {
    syncCalendar,
    syncDoctorCalendar,
    getWorkingHours,
    getDoctorCharges: getDoctorChargesCached,
    getHospitalCharges: getHospitalChargesCached,
    getDepartmentsCached,
    getDoctorsCached,
    getDoctorsByDepartmentCached,
    getRoomsCached,
    checkOfflineAvailability,
    refreshCacheStats,
    isSyncing,
    lastSyncTime,
    lastSyncSuccess,
    syncProgress,
    cacheStats
  };
};