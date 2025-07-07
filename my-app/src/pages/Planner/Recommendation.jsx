import PlannerLayout from './PlannerLayout';
import { useState, useEffect } from 'react';
import './Recommendation.css';
import TimePicker from '../../components/dateTime/TimePicker'

import {
  Landmark,
  Binoculars,
  Utensils,
  Glasses,
  Coffee,
  TreeDeciduous,
  X,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  Info,
  ArrowLeft
} from "lucide-react";

const interests = [
  { label: "Attractions", icon: Binoculars },
  { label: "Cafe", icon: Coffee },
  { label: "Museums", icon: Landmark },
  { label: "Parks", icon: TreeDeciduous },
  { label: "Nightlife Pubs", icon: Glasses },
  { label: "Restaurants", icon: Utensils },
];

function Recommendation() {
  const [searchType, setSearchType] = useState('custom');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customTitleQuery, setCustomTitleQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [plans, setPlans] = useState([]);
  const [notification, setNotification] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  const handleCustomSearch = () => {
    setSearchType('custom');
    setSelectedCategory('');
  };

  const handleCategorySearch = () => {
    setSearchType('category');
    setCustomSearchQuery('');
    setCustomTitleQuery('');
  };

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

  const handleDateChange = (newDate) => {
    // If there are existing plans and the date is different, clear all plans
    if (plans.length > 0 && selectedDate && newDate !== selectedDate) {
      setPlans([]);
      showNotification('info', 'Plans Cleared', 'All plans have been cleared due to date change.');
    }
    setSelectedDate(newDate);
    setDateError(false);
  };

  const now = new Date();
    const [cardDateTime, setCardDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });

    const handleCardTimeChange = (time) => {
    setCardDateTime(prev => ({
      ...prev,
      time
    }));
  };

  const formatTimeString = (hour, minute, ampm) => {
    const paddedHour = hour.toString().padStart(2, '0');
    const paddedMinute = minute.toString().padStart(2, '0');
    return `${paddedHour}:${paddedMinute} ${ampm}`;
  };

  const handleAddPlan = () => {
    // Reset error states
    setDateError(false);
    setTimeError(false);

    // Validate date
    if (!selectedDate) {
      setDateError(true);
      const datePicker = document.querySelector('.date-picker');
      datePicker?.classList.add('shake');
      setTimeout(() => datePicker?.classList.remove('shake'), 500);
      showNotification('error', 'Missing Information', 'Please select a date for your plan.');
      return;
    }

    const timeString = formatTimeString(cardDateTime.time.hours, cardDateTime.time.minutes, cardDateTime.time.period);

    // Check if time is already taken for the same date
    const timeExists = plans.some(plan => 
      plan.date === selectedDate && plan.time === timeString
    );
    
    if (timeExists) {
      showNotification('error', 'Time Conflict', 'This time slot is already taken for the selected date. Please choose a different time.');
      return;
    }

    if (searchType === 'custom' && (customSearchQuery.trim() || customTitleQuery.trim())) {
      const newPlan = {
        id: Date.now(),
        type: 'custom',
        title: customTitleQuery.trim() || 'Custom Search',
        location: customSearchQuery.trim() || 'Custom Location',
        date: selectedDate,
        time: timeString,
        category: 'Custom'
      };
      
      setPlans([...plans, newPlan].sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      }));
      
      setCustomSearchQuery('');
      setCustomTitleQuery('');
      showNotification('success', 'Plan Added', 'Your plan has been successfully added!');
      
    } else if (searchType === 'category' && selectedCategory) {
      const newPlan = {
        id: Date.now(),
        type: 'category',
        title: selectedCategory,
        location: `${selectedCategory} Location`,
        date: selectedDate,
        time: timeString,
        category: selectedCategory
      };
      
      setPlans([...plans, newPlan].sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      }));
      
      setSelectedCategory(null);
      showNotification('success', 'Plan Added', 'Your plan has been successfully added!');
    } else {
      showNotification('error', 'Missing Selection', 'Please make a selection before adding a plan.');
    }
  };

  const handleDeletePlan = (planId) => {
    setPlans(plans.filter(plan => plan.id !== planId));
    showNotification('info', 'Plan Removed', 'Your plan has been removed from the list.');
  };

  const handleRequestRecommendation = () => {
    if (plans.length < 3) {
      showNotification('warning', 'More Plans Needed', 'You need at least 3 plans to request recommendations.');
      return;
    }
    
    console.log('Requesting recommendations for plans:', plans);
    setShowRecommendations(true);
    showNotification('success', 'Recommendation Requested', 'Your recommendation request has been sent successfully!');
  };

  const handleBackToPlans = () => {
    setShowRecommendations(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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

  const isAddButtonDisabled = plans.length >= 5;

  return (
    <PlannerLayout>
      <div className="recommendation-container">
        {notification && (
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
              onClick={() => setNotification(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {showRecommendations ? (
          <div className="recommendations-view">
            <div className="recommendations-header">
              <button 
                className="back-btn"
                onClick={handleBackToPlans}
                aria-label="Go back to plans"
              >
                <ArrowLeft size={20} />
              </button>
              <p className="recommendations-title">
                Recommended day plans on {formatDate(selectedDate)}
              </p>
            </div>
            
            <div className="recommendations-content">
              <p className="recommendations-description">
                Based on your selected plans, here are our personalized recommendations for your day.
              </p>
              
              {/* Placeholder for recommendation content */}
              <div className="recommendations-placeholder">
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                  <p>Generating personalized recommendations...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2>Discover Amazing Places</h2>
            <p className="recommendation-description">
              Find the perfect spots for your next adventure. Search by your preferences or browse by category.
            </p>
            
            <div className="planning-section">
              <div className="date-time-section">
                <div className="date-input-group">
                  <div className="planning-text">
                    Planning on 
                    <input 
                      type="date" 
                      className={`date-picker ${dateError ? 'error' : ''}`}
                      placeholder="Select date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                  </div>
                  {dateError && (
                    <div className="inline-error">
                      <Calendar size={14} className="inline-error-icon" />
                      Please select a date
                    </div>
                  )}
                </div>
                
                <div className="time-input-group">
                  <div className="time-picker-section">
                    <label htmlFor="time-picker">Time:</label>
                    <TimePicker 
                      value={cardDateTime.time}  
                      onChange={handleCardTimeChange}
                      showAllColumns={true} 
                    />
                  </div>
                  {timeError && (
                    <div className="inline-error">
                      <Clock size={14} className="inline-error-icon" />
                      Please select a valid time
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="search-section">
              <div className="search-buttons">
                <button 
                  className={`search-btn ${searchType === 'custom' ? 'active' : ''}`}
                  onClick={handleCustomSearch}
                >
                  Custom search
                </button>
                <button 
                  className={`search-btn ${searchType === 'category' ? 'active' : ''}`}
                  onClick={handleCategorySearch}
                >
                  Search by category
                </button>
              </div>
            </div>
            
            <div className="pick-section">
              {searchType === 'custom' && (
                <div className="custom-search-container">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={customSearchQuery}
                    onChange={(e) => setCustomSearchQuery(e.target.value)}
                    className="custom-search-input"
                  />
                  <input
                    type="text"
                    placeholder="Add Title"
                    value={customTitleQuery}
                    onChange={(e) => setCustomTitleQuery(e.target.value)}
                    className="custom-title-input"
                  />
                </div>
              )}

              {searchType === 'category' && (
                <div className="category-container">
                  <div className="icon-grid-rec">
                    {interests.map(({ label, icon: Icon }, idx) => (
                      <div 
                        className={`icon-card-rec ${selectedCategory === label ? "selected" : ""}`}
                        key={idx} 
                        onClick={() => handleSelect(label)}
                      >
                        <div className="icon-rec"><Icon size={28} /></div>
                        <span className="icon-label-rec">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(searchType === 'custom' || searchType === 'category') && (
                <button 
                  className="add-btn-rec" 
                  onClick={handleAddPlan}
                  disabled={isAddButtonDisabled}
                >
                  Add
                </button>
              )}
            </div>

            {plans.length > 0 && (
              <div className="plans-section">
                <div className="plans-header">
                  <h3 className="plans-title">Your Plans ({plans.length}/5)</h3>
                  {plans.length >= 3 && (
                    <button 
                      className="request-recommendation-btn"
                      onClick={handleRequestRecommendation}
                    >
                      Request Recommendation
                    </button>
                  )}
                </div>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <div key={plan.id} className="plan-card">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeletePlan(plan.id)}
                        aria-label="Delete plan"
                      >
                        <X size={16} />
                      </button>
                      <div className="plan-content">
                        <h4 className="plan-title">{plan.title}</h4>
                        <p className="plan-location">{plan.location}</p>
                        <div className="plan-datetime">
                          <span className="plan-date">{formatDate(plan.date)}</span>
                          <span className="plan-time">{plan.time}</span>
                        </div>
                        <span className="plan-category">{plan.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PlannerLayout>
  );
}

export default Recommendation;