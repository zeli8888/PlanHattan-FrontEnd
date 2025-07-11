import PlannerLayout from './PlannerLayout';
import { useState, useEffect, useRef } from 'react';
import './Recommendation.css';
import TimePicker from '../../components/dateTime/TimePicker'
import RequestRecommendation from '../../api/RecommendationApi'
import postMultipleUserPlans from '../../api/userplans/AddMultipleUserPlans'; 

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
  ArrowLeft,
  MapPin
} from "lucide-react";

const interests = [
  { label: "Attractions", icon: Binoculars },
  { label: "Cafe", icon: Coffee },
  { label: "Museums", icon: Landmark },
  { label: "Parks", icon: TreeDeciduous },
  { label: "Nightlife Pubs", icon: Glasses },
  { label: "Restaurants", icon: Utensils },
];

const categoryMapping = {
  "Museums": {
    poiType: "museum"
  },
  "Attractions": {
    poiType: "attraction"
  },
  "Cafe": {
    poiType: "cafe"
  },
  "Parks": {
    poiType: "park"
  },
  "Nightlife Pubs": {
    poiType: "pub"
  },
  "Restaurants": {
    poiType: "restaurant"
  },
};

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
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Google Places API state
  const [searchPredictions, setSearchPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoadingPlaceDetails, setIsLoadingPlaceDetails] = useState(false);
  
  // Refs for Google Places services
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize Google Places services
  useEffect(() => {
    // Load Google Places API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.onload = () => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
      };
      document.head.appendChild(script);
    } else {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  // Handle search input changes for Google Places autocomplete
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setCustomSearchQuery(value);
    
    if (value.length > 2 && autocompleteService.current) {
      const request = {
        input: value,
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(40.7009, -74.0186), // Southwest corner of Manhattan
          new window.google.maps.LatLng(40.7831, -73.9712)  // Northeast corner of Manhattan
        ),
        strictBounds: true, // Only return results within bounds
        types: ['establishment'], // Only return businesses/places
        componentRestrictions: { country: 'us' }
      };
      
      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSearchPredictions(predictions || []);
          setShowPredictions(true);
        } else {
          setSearchPredictions([]);
          setShowPredictions(false);
        }
      });
    } else {
      setSearchPredictions([]);
      setShowPredictions(false);
    }
  };

  // Handle place selection from predictions
  const handlePlaceSelect = (prediction) => {
    setIsLoadingPlaceDetails(true);
    setShowPredictions(false);
    setCustomSearchQuery(prediction.description);
    
    // Get detailed place information
    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'types', 'place_id']
    };
    
    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSelectedPlace({
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          placeId: place.place_id,
          types: place.types
        });
        
        // Auto-fill title if empty
        if (!customTitleQuery) {
          setCustomTitleQuery(place.name);
        }
      } else {
        console.error('Place details request failed:', status);
        showNotification('error', 'Place Details Error', 'Failed to get place details. Please try again.');
      }
      setIsLoadingPlaceDetails(false);
    });
  };

  // Hide predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    setSelectedPlace(null);
    setSearchPredictions([]);
    setShowPredictions(false);
  };

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

const uniqueId = crypto.randomUUID();
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

  const formatTimeString = (hour, minute, period, dateObj) => {
    let hrs = parseInt(hour, 10);
    const mins = parseInt(minute, 10);

    // Convert to 24-hour format
    if (period === 'PM' && hrs !== 12) {
      hrs += 12;
    } else if (period === 'AM' && hrs === 12) {
      hrs = 0;
    }

    const date = new Date(dateObj); 
    date.setHours(hrs);
    date.setMinutes(mins);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date.toISOString(); 
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

    const timeString = formatTimeString(
      cardDateTime.time.hours, 
      cardDateTime.time.minutes, 
      cardDateTime.time.period, 
      new Date(selectedDate)
    );
  
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
        id: uniqueId, // Add unique ID
        poiName: customTitleQuery ? customTitleQuery : (customSearchQuery || selectedPlace.name),
        zoneId: 0,
        latitude: selectedPlace ? selectedPlace.latitude : null,
        longitude: selectedPlace ? selectedPlace.longitude : null,
        time: timeString,
        poiTypeName: null,
        date: selectedDate,
        type: 'custom',
        category: 'Custom',
        title: customTitleQuery.trim() || (selectedPlace ? selectedPlace.name : 'Custom Search'),
        location: selectedPlace ? selectedPlace.address : (customSearchQuery.trim() || 'Custom Location'),
        placeId: selectedPlace ? selectedPlace.placeId : null,
      };
      
      setPlans([...plans, newPlan].sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      }));
      
      // Reset form
      setCustomSearchQuery('');
      setCustomTitleQuery('');
      setSelectedPlace(null);
      setSearchPredictions([]);
      setShowPredictions(false);
      showNotification('success', 'Plan Added', 'Your plan has been successfully added!');
      
    } else if (searchType === 'category' && selectedCategory) {
      
      const newPlan = {
        id: uniqueId, 
        poiName: null,
        zoneId: null,
        latitude: null,
        longitude: null,
        time: timeString,
        poiTypeName: categoryMapping[selectedCategory].poiType,
        location: `${selectedCategory} Location`,
        date: selectedDate,
        category: selectedCategory,
        title: selectedCategory,
        type: 'category'
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

  const handleRequestRecommendation = async () => {
    if (plans.length < 3) {
      showNotification('warning', 'More Plans Needed', 'You need at least 3 plans to request recommendations.');
      return;
    }
    
    setIsLoadingRecommendations(true);
    console.log('Requesting recommendations for plans:', plans);
    
    try {
      const response = await RequestRecommendation(plans);
      console.log('Recommendations received:', response);
      
      // Set the recommendations data
      setRecommendations(response || []);
      setShowRecommendations(true);
      showNotification('success', 'Recommendations Loaded', 'Your personalized recommendations are ready!');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showNotification('error', 'Recommendation Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleBackToPlans = () => {
    setShowRecommendations(false);
  };

  const handleAddRecommendationsToPlans = async () => {
  try {
    const transformedRecommendations = recommendations.map(recommendation => ({
      userPlanId: null, // or generate/assign appropriate IDs
      place: recommendation.poiName || 'Unknown Place',
      time: recommendation.time,
      predicted: recommendation.busyness || 'unknown',
      coordinates: recommendation.latitude && recommendation.longitude 
        ? { lat: recommendation.latitude, lng: recommendation.longitude }
        : null
    }));

    const response = await postMultipleUserPlans(transformedRecommendations);
    console.log('Recommendations added successfully:', response);
    showNotification('success', 'Plans Added', 'All recommendations have been added to your plans!');
  } catch (error) {
    console.error('Error adding recommendations to plans:', error);
    showNotification('error', 'Error', 'Failed to add recommendations to plans. Please try again.');
  }
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

  const formatTimeForDisplay = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const convertPlansToLocations = (plans) => {
  return plans
    .filter(plan => plan.latitude && plan.longitude) // Only include plans with coordinates
    .map(plan => ({
      id: plan.id,
      name: plan.title,
      place: plan.title,
      area: plan.location,
      address: plan.location,
      coordinates: [plan.longitude, plan.latitude], // Note: MapBox expects [lng, lat]
      category: plan.category,
      time: plan.time,
      date: plan.date,
      type: plan.type,
      placeId: plan.placeId
    }));
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

  const getBusynessColor = (busyness) => {
    switch (busyness?.toLowerCase()) {
      case 'low':
        return '#4ade80'; // green
      case 'medium':
        return '#facc15'; // yellow
      case 'high':
        return '#ef4444'; // red
      default:
        return '#94a3b8'; // gray
    }
  };

  const getBusynessLabel = (busyness) => {
    return busyness ? busyness.charAt(0).toUpperCase() + busyness.slice(1) : 'Unknown';
  };

  const isAddButtonDisabled = plans.length >= 5;

  return (
    <PlannerLayout locations={showRecommendations ? convertPlansToLocations(recommendations) : convertPlansToLocations(plans)}>
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
              
              {isLoadingRecommendations ? (
                <div className="recommendations-placeholder">
                  <div className="loading-message">
                    <div className="loading-spinner"></div>
                    <p>Generating personalized recommendations...</p>
                  </div>
                </div>
              ) : (
                <div className="recommendations-list">
                  {recommendations.length > 0 ? (
                    <>
                      <div className="recommendations-table-header">
                        <div className="table-header-row">
                          <div className="header-cell">PLACE</div>
                          <div className="header-cell">PLANNED ON</div>
                          <div className="header-cell">PLANNED AT</div>
                          <div className="header-cell">PREDICTED</div>
                        </div>
                      </div>
                      <div className="recommendations-table-body">
                        {recommendations.map((recommendation, index) => (
                          <div key={index} className="recommendation-row">
                            <div className="recommendation-cell place-cell">
                              <div className="place-info">
                                <div className="place-name">
                                  {recommendation.poiName || 'Unknown Place'}
                                </div>
                              </div>
                            </div>
                            <div className="recommendation-cell date-cell">
                              {new Date(selectedDate).toLocaleDateString('en-US')}
                            </div>
                            <div className="recommendation-cell time-cell">
                              {formatTimeForDisplay(recommendation.time)}
                            </div>
                            <div className="recommendation-cell predicted-cell">
                              <span 
                                className="busyness-badge"
                                style={{
                                  backgroundColor: getBusynessColor(recommendation.busyness),
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}
                              >
                                {getBusynessLabel(recommendation.busyness)}
                              </span>
                            </div>
                            
                          </div>
                        ))}
                      </div>
                      <button className="add-my-plans-rec" onClick={handleAddRecommendationsToPlans}>Add All to My Plans</button>
                    </>
                  ) : (
                    <div className="no-recommendations">
                      <p>No recommendations available at this time.</p>
                    </div>
                  )}
                </div>
              )}
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
                
                <div className="rec-time-input-group">
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
                <div className="custom-search-container" ref={searchInputRef}>
                  
                    <input
                      type="text"
                      placeholder="Search places in Manhattan..."
                      value={customSearchQuery}
                      onChange={handleSearchInputChange}
                      className="custom-search-input"
                      disabled={isLoadingPlaceDetails}
                    />
                    {isLoadingPlaceDetails && (
                      <div className="search-loading">
                        <div className="loading-spinner-small"></div>
                      </div>
                    )}
                    
                    {/* Search predictions dropdown */}
                    {showPredictions && searchPredictions.length > 0 && (
                      <div className="search-predictions">
                        {searchPredictions.map((prediction) => (
                          <div
                            key={prediction.place_id}
                            className="prediction-item"
                            onClick={() => handlePlaceSelect(prediction)}
                          >
                            <MapPin size={16} className="prediction-icon" />
                            <div className="prediction-text">
                              <div className="prediction-main">{prediction.structured_formatting.main_text}</div>
                              <div className="prediction-secondary">{prediction.structured_formatting.secondary_text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 
                  
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
                  disabled={isAddButtonDisabled || isLoadingPlaceDetails}
                >
                  {isLoadingPlaceDetails ? 'Loading...' : 'Add'}
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
                      disabled={isLoadingRecommendations}
                    >
                      {isLoadingRecommendations ? 'Loading...' : 'Request Recommendation'}
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
                          <span className="plan-time">{formatTimeForDisplay(plan.time)}</span>
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