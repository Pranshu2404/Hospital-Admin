import { useState, useEffect, useCallback } from 'react';
import { 
  getSyncStats, 
  clearAllSyncedData
} from '../services/offlineDB';
import { 
  performFullSync, 
  isOnline, 
  setupNetworkListeners, 
  getAllOfflineData 
} from '../services/offlineSyncService';

export const useOfflineSync = () => {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncStats, setSyncStats] = useState({
    pendingPatients: 0,
    pendingAppointments: 0,
    pendingSync: 0,
    failedSync: 0
  });
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const stats = await getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading sync stats:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!online) {
      console.log('Cannot sync: offline');
      return { success: false, message: 'No internet connection' };
    }
    
    if (syncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }
    
    setSyncing(true);
    setSyncProgress({ step: 'Starting sync...', percent: 0 });
    
    try {
      const results = await performFullSync(
        (progress) => setSyncProgress(progress),
        (results) => {
          setLastSyncResult(results);
          setSyncProgress(null);
          setSyncing(false);
          loadStats();
        }
      );
      
      return { success: true, results };
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncProgress(null);
      setSyncing(false);
      return { success: false, error: error.message };
    }
  }, [online, syncing, loadStats]);

  const clearSyncedData = useCallback(async () => {
    try {
      await clearAllSyncedData();
      await loadStats();
    } catch (error) {
      console.error('Error clearing synced data:', error);
    }
  }, [loadStats]);

  const getOfflineData = useCallback(async () => {
    try {
      return await getAllOfflineData();
    } catch (error) {
      console.error('Error getting offline data:', error);
      return { patients: [], appointments: [], syncQueue: [] };
    }
  }, []);

  // Initialize and load stats
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadStats();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing offline sync:', error);
        setIsInitialized(true);
      }
    };
    
    initialize();
  }, [loadStats]);

  // Setup network listeners
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleOnline = () => {
      console.log('Network online detected');
      setOnline(true);
      setTimeout(() => {
        triggerSync();
      }, 3000);
    };
    
    const handleOffline = () => {
      console.log('Network offline detected');
      setOnline(false);
    };
    
    const cleanup = setupNetworkListeners(handleOnline, handleOffline);
    
    return cleanup;
  }, [isInitialized, triggerSync]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isInitialized, loadStats]);

  return {
    online,
    syncing,
    syncProgress,
    syncStats,
    lastSyncResult,
    triggerSync,
    clearSyncedData,
    getOfflineData,
    loadStats,
    isInitialized
  };
};