import React from "react";
import './InterestSelector.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeApiRequest } from "../../api/PoiApi";
import { useCurrentLocation } from '../../contexts/LocationContext';
import TimePicker from '../../components/dateTime/TimePicker'

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

  const handleGo = async () => {
    if (selectedCategory) {
      setIsLoading(true);
      
      try {
        const categoryInfo = categoryMapping[selectedCategory];
        
        // Combine date and time into a single datetime object
        // Get date value - use selectedDate if available, otherwise current date
        const dateValue = selectedDate || new Date().toISOString().split('T')[0];

        // Extract hour and minute values
        const hours = parseInt(cardDateTime.time.hours); // Fixed: was using selectedDate instead of cardDateTime.time.hours
        const minutes = parseInt(cardDateTime.time.minutes);

        // Convert to 24-hour format
        let hours24 = hours;
        if (cardDateTime.time.period === 'PM' && hours !== 12) {
            hours24 += 12;
        } else if (cardDateTime.time.period === 'AM' && hours === 12) {
            hours24 = 0;
        }

        // Parse the date string to get year, month, day
        const dateObj = new Date(dateValue);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();

        // Create local datetime
        const localDateTime = new Date(year, month, day, hours24, minutes, 0, 0);

        // Convert to UTC ISO 8601 timestamp (ends with 'Z')
        const utcTimestamp = localDateTime.toISOString();
         
        // Prepare location options for the API request
        const locationOptions = {};
        if (currentLocation?.latitude && currentLocation?.longitude) {
          locationOptions.latitude = currentLocation.latitude.toString();
          locationOptions.longitude = currentLocation.longitude.toString();
        }
        
        // Make API request with the correct POI type and current location
        const apiResponse = await makeApiRequest(categoryInfo.poiType, locationOptions, utcTimestamp, currentLocation);
        
        console.log('API Response in InterestSelector:', apiResponse);        
        // Navigate with state containing the API response INCLUDING zoneBusynessMap
        navigate(`/plan/category/${categoryInfo.url}`, {
          state: {
            apiData: apiResponse, // Pass the entire API response
            poiType: categoryInfo.poiType,
            categoryName: selectedCategory,
            zoneBusynessMap: apiResponse.zoneBusynessMap, // Explicitly pass zone busyness data
            selectedDateTime: utcTimestamp // Pass the selected date/time
          }
        });
      } catch (error) {
        console.error('Failed to fetch POIs:', error);
        // Still navigate but without API data (will use fallback data)
        const categoryInfo = categoryMapping[selectedCategory];
        const dateTime = {
          date: selectedDate || new Date().toISOString().split('T')[0],
          time: cardDateTime.time
        };
        navigate(`/plan/category/${categoryInfo.url}`, {
          state: {
            poiType: categoryInfo.poiType,
            categoryName: selectedCategory,
            selectedDateTime: dateTime,
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