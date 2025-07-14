import React from "react";
import './InterestSelector.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeApiRequest } from "../../../api/PoiApi";
import { useCurrentLocation } from '../../../contexts/LocationContext';
import TimePicker from '../../../components/dateTime/TimePicker'

import {
  Landmark,
  Binoculars,
  Utensils,
  Glasses,
  Coffee,
  TreeDeciduous,
  ArrowLeft
} from "lucide-react";

const categoryMapping = {
  "Museums": {
    url: "museum",
    poiType: "museum"
  },
  "Attractions": {
    url: "attractions", 
    poiType: "attraction"
  },
  "Cafe": {
    url: "cafe",
    poiType: "cafe"
  },
  "Parks": {
    url: "park",
    poiType: "park"
  },
  "Nightlife Pubs": {
    url: "pub",
    poiType: "pub"
  },
    "Restaurants": {
    url: "restaurant",
    poiType: "restaurant"
  },
};

const interests = [
  { label: "Attractions", icon: Binoculars },
  { label: "Cafe", icon: Coffee },
  { label: "Museums", icon: Landmark },
  { label: "Parks", icon: TreeDeciduous },
  { label: "Nightlife Pubs", icon: Glasses },
  { label: "Restaurants", icon: Utensils },
];

const InterestSelector = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Attractions');
  const [isLoading, setIsLoading] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const { currentLocation } = useCurrentLocation();
  const [dateError, setDateError] = useState(false);
  
  // Initialize selectedDate with today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  
  const now = new Date();

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setDateError(false);
  };

  const [cardDateTime, setCardDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: 0,
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });

  const handleCardTimeChange = (time) => {
    setCardDateTime(prev => ({
      ...prev,
      time
    }));
  };  

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

  const handleSelectTime = () => {
    setShowDateTimePicker(true);
  };

  const handleBackToInterests = () => {
    setShowDateTimePicker(false);
  };

  // Format date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return "today";
    const selected = new Date(selectedDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (selected.toDateString() === today.toDateString()) {
      return "today";
    } else if (selected.toDateString() === tomorrow.toDateString()) {
      return "tomorrow";
    } else {
      return selected.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Format time for display
  const formatSelectedTime = () => {
    const { hours, minutes, period } = cardDateTime.time;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${formattedMinutes} ${period}`;
  };

// In InterestSelector.jsx, update the handleGo function to pass the selected date/time

const handleGo = async () => {
  if (selectedCategory) {
    setIsLoading(true);
    
    try {
      const categoryInfo = categoryMapping[selectedCategory];
      
      // Combine date and time into a single datetime object
      const dateValue = selectedDate || new Date().toISOString().split('T')[0];
      const hours = parseInt(cardDateTime.time.hours);
      const minutes = parseInt(cardDateTime.time.minutes);

      // Convert to 24-hour format
      let hours24 = hours;
      if (cardDateTime.time.period === 'PM' && hours !== 12) {
          hours24 += 12;
      } else if (cardDateTime.time.period === 'AM' && hours === 12) {
          hours24 = 0;
      }

      const dateObj = new Date(dateValue);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();

      const localDateTime = new Date(year, month, day, hours24, minutes, 0, 0);
      const utcTimestamp = localDateTime.toISOString();
       
      const locationOptions = {};
      if (currentLocation?.latitude && currentLocation?.longitude) {
        locationOptions.latitude = currentLocation.latitude.toString();
        locationOptions.longitude = currentLocation.longitude.toString();
      }
      
      const apiResponse = await makeApiRequest(categoryInfo.poiType, locationOptions, utcTimestamp, currentLocation);
      
      console.log('API Response in InterestSelector:', apiResponse);        
      
      // Navigate with state containing the API response AND the selected date/time
      navigate(`/plan/category/${categoryInfo.url}`, {
        state: {
          apiData: apiResponse,
          poiType: categoryInfo.poiType,
          categoryName: selectedCategory,
          zoneBusynessMap: apiResponse.zoneBusynessMap,
          selectedDateTime: utcTimestamp,
          // ADD THESE NEW FIELDS:
          selectedDate: dateValue, // Pass the selected date
          selectedTime: cardDateTime.time // Pass the selected time object
        }
      });
    } catch (error) {
      console.error('Failed to fetch POIs:', error);
      const categoryInfo = categoryMapping[selectedCategory];
      navigate(`/plan/category/${categoryInfo.url}`, {
        state: {
          poiType: categoryInfo.poiType,
          categoryName: selectedCategory,
          selectedDateTime: utcTimestamp,
          // ADD THESE NEW FIELDS EVEN IN ERROR CASE:
          selectedDate: selectedDate || new Date().toISOString().split('T')[0],
          selectedTime: cardDateTime.time,
          error: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  }
};

  return (
    <div className="interest-container">
      <h2 className="title">Discover by Interest</h2>
      <p className="subtitle">
        Activities recommended based on your time, preferences, and the city's current pace.
      </p>

      <div className="slider-container">
        {/* Interest Selection Panel */}
        <div className={`interest-panel ${showDateTimePicker ? 'slide-left' : ''}`}>
          <div className="icon-grid">
            {interests.map(({ label, icon: Icon }, idx) => (
              <div 
                className={`icon-card ${selectedCategory === label ? "selected" : ""}`}
                key={idx} 
                onClick={() => handleSelect(label)}
              >
                <div className="icon"><Icon size={28} /></div>
                <span className="icon-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Date Time Picker Panel */}
        <div className={`datetime-panel ${showDateTimePicker ? 'slide-in' : ''}`}>
              <div className="datetime-header">
                <button className="back-btn" onClick={handleBackToInterests}>
                  <ArrowLeft size={20} />
                </button>
                <h3>Select Date & Time</h3>
              </div>
  <div className="datetime-content"> 
  <div className="datetime-input-wrapper">
    <div className="planning-text">
      <span>Planning on</span>
      <input 
        id="date-picker"
        type="date" 
        className={`date-picker ${dateError ? 'error' : ''}`}
        placeholder="Select date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
      />
    </div>
    <div className="time-input-group">
      <div className="time-picker-section">
        <TimePicker 
          id="time-picker"
          value={cardDateTime.time}  
          onChange={handleCardTimeChange}
          showAllColumns={true} 
        />
      </div>
    </div>
  </div>
</div>
</div>
            </div>

      <div className="cta">
        <p className="search-label">
          <strong>
            {!showDateTimePicker 
              ? (selectedCategory 
                  ? `Search By ${selectedCategory}` 
                  : "Select a category to search")
              : `Search ${selectedCategory} on ${formatSelectedDate()} at ${formatSelectedTime()}`
            }
          </strong>
        </p>
        <button 
          className={`go-btn ${!selectedCategory ? "disabled" : ""}`}
          onClick={showDateTimePicker ? handleGo : handleSelectTime}
          disabled={!selectedCategory || isLoading}
        >
          {isLoading ? "Loading..." : (showDateTimePicker ? "Go" : "Select Time")}
        </button>
      </div>
    </div>
  );
};

export default InterestSelector;