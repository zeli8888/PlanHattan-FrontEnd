// LocationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  const updateCurrentLocation = (location) => {
    setCurrentLocation(location);
  };

  const clearCurrentLocation = () => {
    setCurrentLocation(null);
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      updateCurrentLocation,
      clearCurrentLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};