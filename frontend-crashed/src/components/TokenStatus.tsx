import React, { useState, useEffect } from 'react';
import { tokenManager } from '../utils/tokenManager';
import { useAuth } from '../contexts/AuthContext';

const TokenStatus: React.FC = () => {
  const { user } = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [willExpireSoon, setWillExpireSoon] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateTokenStatus = () => {
      const timeLeft = tokenManager.getTimeUntilExpiry();
      const expired = tokenManager.isTokenExpired();
      const expiringSoon = tokenManager.willExpireSoon();

      setTimeUntilExpiry(timeLeft);
      setIsExpired(expired);
      setWillExpireSoon(expiringSoon);
    };

    // Update immediately
    updateTokenStatus();

    // Update every 30 seconds
    const interval = setInterval(updateTokenStatus, 30000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600';
    if (willExpireSoon) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    if (willExpireSoon) return 'Expiring Soon';
    return 'Active';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm">
      <div className="font-semibold text-gray-700 mb-2">Token Status</div>
      <div className={`font-medium ${getStatusColor()}`}>
        Status: {getStatusText()}
      </div>
      {timeUntilExpiry !== null && timeUntilExpiry > 0 && (
        <div className="text-gray-600">
          Expires in: {formatTime(timeUntilExpiry)}
        </div>
      )}
      <button
        onClick={() => tokenManager.forceRefresh()}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Force Refresh
      </button>
    </div>
  );
};

export default TokenStatus;
