import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStorage } from '../api/AuthApi';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check authentication status
  const checkAuthStatus = () => {
    const storedUser = userStorage.getUser();
    const csrfToken = userStorage.getCsrfToken();
    
    // User is authenticated if they have user data and a CSRF token
    const authenticated = !!(storedUser && csrfToken);
    
    setIsAuthenticated(authenticated);
    setUser(storedUser);
    setIsLoading(false);
    
    return authenticated;
  };

  // Initialize auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to login (call this after successful login)
  const login = (userData, csrfToken) => {
    userStorage.setUser(userData);
    userStorage.setCsrfToken(csrfToken);
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Function to logout
  const logout = () => {
    userStorage.clearUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Function to update CSRF token
  const updateCsrfToken = (token) => {
    userStorage.setCsrfToken(token);
    // Re-check auth status after updating CSRF token
    checkAuthStatus();
  };

  // Function to refresh auth status (useful when localStorage changes)
  const refreshAuth = () => {
    return checkAuthStatus();
  };

  // Listen for localStorage changes (useful for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser' || e.key === 'csrfToken') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateCsrfToken,
    refreshAuth,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};