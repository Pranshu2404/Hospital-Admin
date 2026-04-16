import React, { useState, useEffect } from 'react';
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaClock, FaDatabase, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import { useCalendarSync } from '../../hooks/useCalendarSync';

const CalendarSyncStatus = ({ showDetails = false, compact = false }) => {
  const { 
    isSyncing, 
    lastSyncTime, 
    lastSyncSuccess, 
    syncProgress, 
    cacheStats,
    refreshCacheStats,
    syncCalendar 
  } = useCalendarSync();
  
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (showDetails) {
      refreshCacheStats();
    }
  }, [showDetails, refreshCacheStats]);

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleManualSync = async () => {
    await syncCalendar();
    await refreshCacheStats();
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-xs">
        {isSyncing ? (
          <>
            <FaSync className="animate-spin text-blue-500" />
            <span className="text-blue-600">Syncing...</span>
          </>
        ) : lastSyncSuccess === false ? (
          <>
            <FaExclamationTriangle className="text-red-500" />
            <button onClick={handleManualSync} className="text-red-600 hover:underline">
              Sync failed - Retry
            </button>
          </>
        ) : (
          <>
            <FaCheckCircle className="text-green-500" />
            <span className="text-green-600">
              {lastSyncTime ? `Updated ${formatTimeAgo(lastSyncTime)}` : 'Ready'}
            </span>
          </>
        )}
      </div>
    );
  }

  if (!showDetails && !isSyncing && lastSyncSuccess !== false) {
    return null;
  }

  return (
    <div className={`text-sm ${isSyncing ? 'bg-blue-50' : lastSyncSuccess === false ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-3 border ${isSyncing ? 'border-blue-200' : lastSyncSuccess === false ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <FaSync className="animate-spin text-blue-500" />
              <span className="text-blue-700 font-medium">Syncing calendar data...</span>
            </>
          ) : lastSyncSuccess === false ? (
            <>
              <FaExclamationTriangle className="text-red-500" />
              <span className="text-red-700 font-medium">Last sync failed</span>
            </>
          ) : (
            <>
              <FaCheckCircle className="text-green-500" />
              <span className="text-green-700 font-medium">Calendar data available offline</span>
            </>
          )}
        </div>
        
        {lastSyncTime && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FaClock size={10} />
            <span>Last synced: {formatTimeAgo(lastSyncTime)}</span>
          </div>
        )}
        
        {!isSyncing && lastSyncSuccess === false && (
          <button 
            onClick={handleManualSync}
            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded transition-colors"
          >
            Retry Sync
          </button>
        )}
      </div>
      
      {showDetails && isSyncing && syncProgress.percent > 0 && (
        <div className="mt-3">
          <div className="text-xs text-blue-600 mb-1">{syncProgress.step}</div>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percent}%` }}
            />
          </div>
          {syncProgress.currentDoctor && syncProgress.totalDoctors && (
            <div className="text-xs text-blue-500 mt-1">
              Doctor {syncProgress.currentDoctor} of {syncProgress.totalDoctors}
            </div>
          )}
        </div>
      )}
      
      {showDetails && cacheStats && !isSyncing && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <FaDatabase size={10} />
            {showStats ? 'Hide cache stats' : 'Show cache stats'}
          </button>
          
          {showStats && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <FaUserMd size={10} />
                <span>Doctors cached: {cacheStats?.doctorsCached || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <FaCalendarAlt size={10} />
                <span>Schedule entries: {cacheStats?.scheduleEntries || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 col-span-2">
                <FaClock size={10} />
                <span>Working hours entries: {cacheStats?.workingHoursEntries || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 col-span-2">
                <FaCheckCircle size={10} className="text-green-500" />
                <span>Hospital charges: {cacheStats?.hospitalChargesCached ? 'Cached' : 'Not cached'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarSyncStatus;