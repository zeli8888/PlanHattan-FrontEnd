import React, { useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import './Notification.css';

const Notification = ({ notification, onClose }) => {
  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} />;
      case 'success':
        return <CheckCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-icon">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
      </div>
      <button 
        className="notification-close"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;