import React, { useState, useRef } from 'react';
import './UserProfile.css';

function UserProfile({ user, isOpen, onClose }) {
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
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

            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
                // TODO: Implement save to backend
                console.log('Profile image updated');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setProfileImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // TODO: Implement remove from backend
        console.log('Profile image removed');
    };

    const handleChangeUsername = () => {
        setShowUsernameInput(!showUsernameInput);
        setShowPasswordInput(false);
        setNewUsername('');
    };

    const handleChangePassword = () => {
        setShowPasswordInput(!showPasswordInput);
        setShowUsernameInput(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSaveUsername = () => {
        if (newUsername.trim()) {
            console.log('Saving new username:', newUsername);
            setShowUsernameInput(false);
            setNewUsername('');
        }
    };

    const handleSavePassword = () => {
        if (newPassword && newPassword === confirmPassword) {
            console.log('Saving new password');
            setShowPasswordInput(false);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            alert('Passwords do not match!');
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            console.log('Delete account confirmed');
        }
    };

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className={`profile-modal ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="profile-close-btn" onClick={onClose}>
                    ×
                </button>
                
                <div className={`profile-content ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`}>
                    <div className="profile-left">
                        <div className={`profile-avatar ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`} onClick={handleImageClick}>
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
                                    alt="Profile" 
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                />
                            ) : (
                                <span className={`profile-user-icon ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`}>👤</span>
                            )}
                            <div className="profile-avatar-overlay">
                                <button
                                    onClick={handleImageClick}
                                    className="profile-avatar-btn"
                                    title="Change photo"
                                >
                                    📁
                                </button>
                                {profileImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="profile-avatar-btn remove"
                                        title="Remove photo"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{display: 'none'}}
                        />
                        
                        <div className={`profile-greeting ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`}>
                            Hi {user?.username}
                        </div>
                    </div>
                    
                    <div className={`profile-right ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`}>
                        <button className={`profile-btn ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`} onClick={handleChangeUsername}>
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
                                />
                                <div className="input-buttons">
                                    <button className="save-btn" onClick={handleSaveUsername}>
                                        Save
                                    </button>
                                    <button className="cancel-btn" onClick={() => setShowUsernameInput(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <button className={`profile-btn ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`} onClick={handleChangePassword}>
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
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="profile-input"
                                />
                                <div className="input-buttons">
                                    <button className="save-btn" onClick={handleSavePassword}>
                                        Save
                                    </button>
                                    <button className="cancel-btn" onClick={() => setShowPasswordInput(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <button className={`profile-btn delete ${showUsernameInput || showPasswordInput ? 'expanded' : ''}`} onClick={handleDeleteAccount}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;