import { WifiIcon, WifiOffIcon } from 'lucide-react';
import React from 'react';
import { FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const OfflineStatusBanner = ({ 
  online, 
  syncing, 
  syncStats, 
  syncProgress, 
  onSyncClick 
}) => {
  const hasPendingData = syncStats.pendingPatients > 0 || syncStats.pendingAppointments > 0;
  
  if (online && !hasPendingData && !syncing) {
    return null;
  }

  return (
    <div className={`sticky top-0 z-50 px-4 py-2 shadow-md ${
      online ? 'bg-teal-600' : 'bg-amber-600'
    } text-white transition-all duration-300`}>
      <div className="container mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {online ? (
            <>
              <WifiIcon className="text-white" />
              <span className="font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOffIcon className="text-white" />
              <span className="font-medium">Offline Mode</span>
            </>
          )}
          
          {hasPendingData && online && (
            <span className="bg-white text-teal-700 px-2 py-1 rounded-full text-xs font-semibold">
              {syncStats.pendingPatients + syncStats.pendingAppointments} pending
            </span>
          )}
          
          {syncStats.failedSync > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaExclamationTriangle size={10} />
              {syncStats.failedSync} failed
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!online && (
            <span className="text-sm">
              ⚡ Working offline. Data will sync automatically when connection returns.
            </span>
          )}
          
          {online && hasPendingData && !syncing && (
            <button
              onClick={onSyncClick}
              className="bg-white text-teal-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <FaSync />
              Sync Now ({syncStats.pendingPatients + syncStats.pendingAppointments})
            </button>
          )}
          
          {online && syncing && (
            <div className="flex items-center gap-2">
              <FaSync className="animate-spin" />
              <span className="text-sm">
                {syncProgress?.step || 'Syncing...'} 
                {syncProgress?.percent && ` (${syncProgress.percent}%)`}
              </span>
            </div>
          )}
          
          {online && !hasPendingData && !syncing && (
            <div className="flex items-center gap-2 text-green-200">
              <FaCheckCircle />
              <span className="text-sm">All data synced</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineStatusBanner;