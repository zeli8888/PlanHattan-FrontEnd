import React, { useState, useRef } from 'react';
import { updateUserProfile, deleteUserProfile, uploadUserPicture } from '../../api/UserProfileApi';
import './UserProfile.css';
import { userStorage } from '../../api/AuthApi'; // Added authAPI import
import { useUserProfile } from '../../contexts/UserProfileContext';

function UserProfile({isOpen, onClose }) {
    const { 
        user, 
        username, 
        updateUsername, 
        updateUserPicture, 
        logoutUser 
    } = useUserProfile();

    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showPictureUpload, setShowPictureUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChangePicture = () => {
        setShowPictureUpload(true);
        setShowUsernameInput(false);
        setShowPasswordInput(false);
        // Trigger file input after state is set
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 0);
    };

    const handleSavePicture = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        setIsLoading(true);
        try {
            const result = await uploadUserPicture(selectedFile, '123');
            console.log('Picture upload response:', result);
            
            // Update context with new picture
            updateUserPicture(profileImage);
            alert('Picture uploaded successfully!');
            setShowPictureUpload(false);
            setSelectedFile(null);
        } catch (error) {
            if (error.response?.status === 403) {
                alert('Authentication required. Please log in again.');
            } else if (error.message.includes('CSRF token not found')) {
                alert('Session expired. Please refresh the page and try again.');
            } else {
                alert('Failed to upload picture. Please try again.');
            }
            console.error('Picture upload failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = () => {
        // Remove the old click handler functionality since we have a separate button now
        return;
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setProfileImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        updateUserPicture(null);
        console.log('Profile image removed');
    };

    const handleChangeUsername = () => {
        setShowUsernameInput(!showUsernameInput);
        setShowPasswordInput(false);
        setShowPictureUpload(false);
        setNewUsername('');
    };

    const handleChangePassword = () => {
        setShowPasswordInput(!showPasswordInput);
        setShowUsernameInput(false);
        setShowPictureUpload(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSaveUsername = async () => {
        if (newUsername.trim()) {
            setIsLoading(true);
            try {
                const userData = {
                    userName: newUsername.trim(),
                    password: null
                };
                
                await updateUserProfile(userData);
                updateUsername(newUsername.trim()); // Update context
                alert('Username updated successfully!');
                setShowUsernameInput(false);
                setNewUsername('');
            } catch (error) {
                if (error.response?.status === 403) {
                    alert('Authentication required. Please log in again.');
                } else if (error.message.includes('CSRF token not found')) {
                    alert('Session expired. Please refresh the page and try again.');
                } else {
                    alert('Failed to update username. Please try again.');
                }
                console.error('Username update failed:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSavePassword = async () => {
        if (newPassword && newPassword === confirmPassword) {
            setIsLoading(true);
            try {
                const userData = {
                    userName: null,
                    password: newPassword
                };
                
                await updateUserProfile(userData);
                alert('Password updated successfully!');
                setShowPasswordInput(false);
                setNewPassword('');
                setConfirmPassword('');
            } catch (error) {
                if (error.response?.status === 403) {
                    alert('Authentication required. Please log in again.');
                } else if (error.message.includes('CSRF token not found')) {
                    alert('Session expired. Please refresh the page and try again.');
                } else {
                    alert('Failed to update password. Please try again.');
                }
                console.error('Password update failed:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            alert('Passwords do not match!');
        }
    };

 const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        setIsLoading(true);
        try {
            await deleteUserProfile();
            alert('Account deleted successfully!');
            logoutUser();
            // Clear user storage and update parent component
            userStorage.clearUser(); // This should clear localStorage/sessionStorage user data

            onClose(); // Close the modal
            
            // Force page refresh to update navbar state
            window.location.reload();
            
        } catch (error) {
            if (error.response?.status === 403) {
                alert('Authentication required. Please log in again.');
            } else if (error.message.includes('CSRF token not found')) {
                alert('Session expired. Please refresh the page and try again.');
            } else {
                alert('Failed to delete account. Please try again.');
            }
            console.error('Account deletion failed:', error);
        } finally {
            setIsLoading(false);
        }
    }
};

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className={`profile-modal ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="profile-close-btn" onClick={onClose}>
                    ×
                </button>
                
                <div className={`profile-content ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`}>
                    <div className="profile-left">
                        <div className={`profile-avatar ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`}>
                            {profileImage || user.userPicture ? (
                                <img 
                                    src={profileImage || user.userPicture} 
                                    alt="Profile" 
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                />
                            ) : (
                                <span className={`profile-user-icon ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`}>👤</span>
                            )}
                            {profileImage && (
                                <div className="profile-avatar-overlay">
                                    <button
                                        onClick={handleRemoveImage}
                                        className="profile-avatar-btn remove"
                                        title="Remove photo"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Change Picture Button */}
                        <button 
                            className="change-picture-btn" 
                            onClick={handleChangePicture}
                            disabled={isLoading}
                        >
                            Change Picture
                        </button>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{display: 'none'}}
                        />
                        
                        {showPictureUpload && (
                            <div className="picture-upload-section">
                                {selectedFile && (
                                    <div className="selected-file">
                                        Selected: {selectedFile.name}
                                    </div>
                                )}
                                <div className="input-buttons">
                                    <button 
                                        className="save-btn" 
                                        onClick={handleSavePicture}
                                        disabled={isLoading || !selectedFile}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => {
                                            setShowPictureUpload(false);
                                            setSelectedFile(null);
                                            setProfileImage(userPicture);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className={`profile-greeting ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`}>
                            Hi {username}
                        </div>
                    </div>
                    
                    <div className={`profile-right ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`}>
                        <button 
                            className={`profile-btn ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`} 
                            onClick={handleChangeUsername}
                            disabled={isLoading}
                        >
                            Change Username
                        </button>
                        
                        {showUsernameInput && (
                            <div className="input-section">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter new username"
                                    className="profile-input"
                                    disabled={isLoading}
                                />
                                <div className="input-buttons">
                                    <button 
                                        className="save-btn" 
                                        onClick={handleSaveUsername}
                                        disabled={isLoading || !newUsername.trim()}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => setShowUsernameInput(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <button 
                            className={`profile-btn ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`} 
                            onClick={handleChangePassword}
                            disabled={isLoading}
                        >
                            Change Password
                        </button>
                        
                        {showPasswordInput && (
                            <div className="input-section">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="profile-input"
                                    disabled={isLoading}
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="profile-input"
                                    disabled={isLoading}
                                />
                                <div className="input-buttons">
                                    <button 
                                        className="save-btn" 
                                        onClick={handleSavePassword}
                                        disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => setShowPasswordInput(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <button 
                            className={`profile-btn delete ${showUsernameInput || showPasswordInput || showPictureUpload ? 'expanded' : ''}`} 
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;