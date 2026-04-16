import { useEffect } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const SyncManager = ({ children }) => {
  const { triggerSync, online, syncStats } = useOfflineSync();

  useEffect(() => {
    if (online && (syncStats.pendingPatients > 0 || syncStats.pendingAppointments > 0)) {
      console.log('Auto-syncing pending data...');
      triggerSync();
    }
  }, [online]);

  return children;
};

export default SyncManager;