import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStorage } from '../api/AuthApi';

// Create the context
const UserProfileContext = createContext();

// Custom hook to use the context
export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};

// Provider component
export const UserProfileProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [userPicture, setUserPicture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize user data on mount
    useEffect(() => {
        const initializeUser = () => {
            const currentUser = userStorage.getUser();
            if (currentUser) {
                setUser(currentUser);
                setUsername(currentUser.username || currentUser.userName || '');
                setUserPicture(currentUser.profileImage || currentUser.profilePicture || currentUser.photo || null);
            }
            setIsLoading(false);
        };

        initializeUser();
    }, []);

    // Set user profile data from API response - Enhanced version
    const setUserProfileFromAPI = (profileData) => {
        
        if (!profileData) {
            console.warn('No profile data provided to setUserProfileFromAPI');
            return;
        }

        // Extract username from various possible field names
        const extractedUsername = profileData.username || 
                                 profileData.userName || 
                                 profileData.user_name || 
                                 username;

        // Extract profile image from various possible field names
        const extractedProfileImage = profileData.profileImage || 
                                     profileData.profilePicture || 
                                     profileData.profile_picture ||
                                     profileData.photo || 
                                     profileData.avatar ||
                                     profileData.image ||
                                     null;

        // Create updated user object with all available data
        const updatedUser = {
            ...user, // Preserve existing user data
            ...profileData, // Add all new profile data
            username: extractedUsername,
            profileImage: extractedProfileImage,
            // Standardize common field names
            firstName: profileData.firstName || profileData.first_name || profileData.fname,
            lastName: profileData.lastName || profileData.last_name || profileData.lname,
            email: profileData.email || profileData.emailAddress,
            phone: profileData.phone || profileData.phoneNumber || profileData.mobile,
            // Add timestamp for when profile was last updated
            profileUpdatedAt: new Date().toISOString()
        };
        
        
        // Update all state variables
        setUser(updatedUser);
        setUsername(extractedUsername);
        setUserPicture(extractedProfileImage);
        
        // Update in storage
        try {
            userStorage.setUser(updatedUser);
        } catch (error) {
            console.error('Failed to save user profile to storage:', error);
        }
    };

    // Update username
    const updateUsername = (newUsername) => {
        setUsername(newUsername);
        
        // Update user object
        const updatedUser = { ...user, username: newUsername };
        setUser(updatedUser);
        
        // Update in storage
        userStorage.setUser(updatedUser);
    };

    // Update user picture
    const updateUserPicture = (newPicture) => {
        setUserPicture(newPicture);
        
        // Update user object
        const updatedUser = { ...user, profileImage: newPicture };
        setUser(updatedUser);
        
        // Update in storage
        userStorage.setUser(updatedUser);
    };

    // Update both username and picture
    const updateUserProfile = (newUsername, newPicture) => {
        const updatedUser = {
            ...user,
            username: newUsername || username,
            profileImage: newPicture !== undefined ? newPicture : userPicture
        };
                
        setUser(updatedUser);
        setUsername(newUsername || username);
        setUserPicture(newPicture !== undefined ? newPicture : userPicture);
        
        // Update in storage
        userStorage.setUser(updatedUser);
    };

    // Login user - Enhanced version
    const loginUser = (userData) => {
        
        const extractedUsername = userData.username || userData.userName || userData.user_name || '';
        const extractedProfileImage = userData.profileImage || userData.profilePicture || userData.photo || null;
        
        setUser(userData);
        setUsername(extractedUsername);
        setUserPicture(extractedProfileImage);
        
        // Save to storage
        userStorage.setUser(userData);
    };

    // Logout user
    const logoutUser = () => {
        setUser(null);
        setUsername('');
        setUserPicture(null);
        
        // Clear storage
        userStorage.clearUser();
    };

    // Check if user is logged in
    const isLoggedIn = () => {
        return user !== null;
    };

    // Get user data by field name (utility function)
    const getUserData = (fieldName) => {
        if (!user) return null;
        
        // Handle common field name variations
        const fieldMappings = {
            'username': ['username', 'userName', 'user_name'],
            'email': ['email', 'emailAddress', 'email_address'],
            'firstName': ['firstName', 'first_name', 'fname'],
            'lastName': ['lastName', 'last_name', 'lname'],
            'profileImage': ['profileImage', 'profilePicture', 'profile_picture', 'photo', 'avatar', 'image'],
            'phone': ['phone', 'phoneNumber', 'phone_number', 'mobile']
        };
        
        const possibleFields = fieldMappings[fieldName] || [fieldName];
        
        for (const field of possibleFields) {
            if (user[field] !== undefined && user[field] !== null) {
                return user[field];
            }
        }
        
        return null;
    };

    const contextValue = {
        // State
        user,
        username,
        userPicture,
        isLoading,
        
        // Actions
        updateUsername,
        updateUserPicture,
        updateUserProfile,
        loginUser,
        logoutUser,
        isLoggedIn,
        setUserProfileFromAPI, // Enhanced method to set profile from API
        getUserData, // New utility method
        
        // Direct setters (if needed)
        setUser,
        setUsername,
        setUserPicture
    };

    return (
        <UserProfileContext.Provider value={contextValue}>
            {children}
        </UserProfileContext.Provider>
    );
};

export default UserProfileContext;