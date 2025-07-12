import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchZoneBusyness } from '../api/ZoneBusynessMap';

// Create the context
const ZoneBusynessContext = createContext();

// Custom hook to use the context
export const useZoneBusyness = () => {
  const context = useContext(ZoneBusynessContext);
  if (!context) {
    throw new Error('useZoneBusyness must be used within a ZoneBusynessProvider');
  }
  return context;
};

// Provider component
export const ZoneBusynessProvider = ({ children }) => {
  const [zoneBusynessMap, setZoneBusynessMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Function to fetch zone busyness data
  const fetchZoneBusynessData = async (forceRefresh = false) => {
    // Only fetch if we don't have data or if forced refresh
    if (Object.keys(zoneBusynessMap).length > 0 && !forceRefresh) {
      return zoneBusynessMap;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const zoneBusynessData = await fetchZoneBusyness();
      
      setZoneBusynessMap(zoneBusynessData || {});
      setLastFetchTime(new Date());
      
      return zoneBusynessData || {};
    } catch (err) {
      console.error('Failed to fetch zone busyness data:', err);
      setError(err.message || 'Failed to fetch zone busyness data');
      setZoneBusynessMap({});
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get busyness for a specific zone
  const getZoneBusyness = (zoneId) => {
    return zoneBusynessMap[zoneId] || null;
  };

  // Function to check if data is stale (optional - for cache invalidation)
  const isDataStale = (maxAgeMinutes = 30) => {
    if (!lastFetchTime) return true;
    const now = new Date();
    const diffMinutes = (now - lastFetchTime) / (1000 * 60);
    return diffMinutes > maxAgeMinutes;
  };

  // Function to refresh data if stale
  const refreshIfStale = async (maxAgeMinutes = 30) => {
    if (isDataStale(maxAgeMinutes)) {
      await fetchZoneBusynessData(true);
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    fetchZoneBusynessData();
  }, []);

  // Context value
  const value = {
    zoneBusynessMap,
    isLoading,
    error,
    lastFetchTime,
    fetchZoneBusynessData,
    getZoneBusyness,
    isDataStale,
    refreshIfStale
  };

  return (
    <ZoneBusynessContext.Provider value={value}>
      {children}
    </ZoneBusynessContext.Provider>
  );
};

export default ZoneBusynessContext;