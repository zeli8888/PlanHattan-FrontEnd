import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlannerLayout from '../PlannerLayout';
import DateTimePicker from '../../../components/dateTime/DateTimePicker';
import './CategoryLayout.css';
import ReactCardFlip from 'react-card-flip';
import { FiArrowRight } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import TimePicker from '../../../components/dateTime/TimePicker';
import CardTilt from '../../../components/features/CardTilt';
import { useMyPlans } from '../../../contexts/MyPlansProvider';
import postUserPlans from '../../../api/userplans/AddUserPlansApi';
import { useLocation } from 'react-router-dom';
import getUpcomingBusynessWithFallback from '../../../api/UpcomingBusynessApi';
import useNotification from '../../../components/features/useNotification';
import Notification from '../../../components/features/Notification';

const CategoryLayout = ({  
  displayName, 
  locations,
  showBusyness = true,
  showSorting = true,
  showDistance = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const zoneBusynessMap = location.state?.zoneBusynessMap || {};
  const now = new Date();
  const { notification, showNotification, hideNotification } = useNotification();
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });
  
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedMapLocation) {
      setFlippedCards(prev => ({
        ...prev,
        [selectedMapLocation.id]: true
      }));
    }
  }, [selectedMapLocation]);

  const [cardDateTime, setCardDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;
  
  const [isSorting, setIsSorting] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'busyness',
    direction: 'asc'
  });
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  
  // New state for tracking the step in the planning process
  const [planningStep, setPlanningStep] = useState({}); // { [placeId]: 'time' | 'departure' }
  const [departureLocation, setDepartureLocation] = useState({});

  // Calculate pagination values
  const [currentPageGroup, setCurrentPageGroup] = useState(1);
  const pagesPerGroup = 5;
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;

  const getBusynessColor = (busyness) => {
    if (busyness === 'high') return '#ff4d4f'; 
    if (busyness === 'medium') return '#faad14'; 
    return '#52c41a'; 
  };

  const getDistanceColor = (percentage) => {
    const value = parseInt(percentage);
    if (value >= 10) return '#ff4d4f'; 
    if (value >= 3.5) return '#faad14'; 
    return '#52c41a'; 
  };

  const getRecommendationColor = (recommendation) => {
    if (typeof recommendation === 'number') {
      if (recommendation >= 8) return '#52c41a'; // Green for high recommendation
      if (recommendation >= 5) return '#faad14'; // Yellow for medium recommendation
      return '#ff4d4f'; // Red for low recommendation
    }
    return '#faad14'; // Default to yellow if not a number
  };

  
  const getRatingColor = (rating) => {
    if (typeof rating === 'number') {
      if (rating >= 4) return '#52c41a'; // Green for high 
      if (rating >= 3 && rating < 4) return '#faad14'; // Yellow for medium 
      return '#ff4d4f'; // Red for low recommendation
    }
    return '#fff'; // Default to yellow if not a number
  };

  const requestSort = (key) => {
    setIsSorting(true);
    setTimeout(() => setIsSorting(false), 500);
    
    let direction = 'asc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const toggleSelectedPlaces = () => {
    setShowOnlySelected(!showOnlySelected);
    setCurrentPage(1);
  };

  const handleCardClick = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCardTimeChange = (time) => {
    setCardDateTime(prev => ({
      ...prev,
      time
    }));
  };

  const [upcomingBusyness, setUpcomingBusyness] = useState({});
  const [busynessLoading, setBusynessLoading] = useState({});
const handleGetUpcomingBusyness = async (place) => {
  if (!place || upcomingBusyness[place.id]) {
    // Skip if no place or data already fetched
    console.log('Skipping busyness fetch for place:', place?.name || 'undefined place');
    return;
  }

  console.log('Fetching busyness data for place:', place.name);
  console.log('Using date:', dateTime.date.toISOString());
  
  setBusynessLoading(prev => ({ ...prev, [place.id]: true }));

  try {
    // Fetch busyness data using the API service
    const busynessData = await getUpcomingBusynessWithFallback(
      1, // zoneId - adjust based on your zone system
      3, // predictedHours
      dateTime.date.toISOString() // Use the selected date/time from the component
    );
    
    setUpcomingBusyness(prev => ({
      ...prev,
      [place.id]: busynessData
    }));
    
  } catch (error) {
    console.error('❌ Error details:', error.message);    
    // This shouldn't happen with the fallback API, but just in case
    setUpcomingBusyness(prev => ({
      ...prev,
      [place.id]: []
    }));
  } finally {
    setBusynessLoading(prev => ({ ...prev, [place.id]: false }));
    console.log('✅ Busyness loading completed for place:', place.name);
  }
};

  const { addPlan, plans, deletePlan, updatePlan } = useMyPlans();
  const isPlaceInMyPlans = (place) => {
  return plans.some(plan => 
    plan.place === place.name || // Match by place name (most reliable)
    plan.placeId === place.id    // Match by original placeId
  );
};

// Updated getPlannedTime function
const getPlannedTime = (place) => {
  const planItem = plans.find(plan => 
    plan.place === place.name || 
    plan.placeId === place.id
  );
  return planItem ? planItem.time : null;
};  

  const getVisiblePageNumbers = () => {
    const startPage = (currentPageGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Add this helper function to handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Calculate which page group this page belongs to
    const newPageGroup = Math.ceil(pageNumber / pagesPerGroup);
    setCurrentPageGroup(newPageGroup);
  };
const filteredAndSortedLocations = showOnlySelected 
  ? locations.filter(place => isPlaceInMyPlans(place))
  : locations;

// Filter out places without rating data when sorting by rating
const finalFilteredLocations = sortConfig.key === 'rating' 
  ? filteredAndSortedLocations.filter(place => place.rating !== undefined && place.rating !== null)
  : filteredAndSortedLocations;

  // Calculate current page cards and total pages
const currentCards = [...finalFilteredLocations].sort((a, b) => {
  if (sortConfig.key === 'busyness') {
    const busyMapper = {'low': 1, 'medium': 2, 'high': 3}
    const aValue = busyMapper[a.busy]
    const bValue = busyMapper[b.busy]
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  } else if (sortConfig.key === 'recommendation') {
    const aValue = parseFloat(a.recommendation) || 0;
    const bValue = parseFloat(b.recommendation) || 0;
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  } else if (sortConfig.key === 'rating') {
    const aValue = parseFloat(a.rating) || 0;
    const bValue = parseFloat(b.rating) || 0;
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  } else {
    const aValue = parseFloat(a.distance);
    const bValue = parseFloat(b.distance);
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  }
}).slice(indexOfFirstCard, indexOfLastCard);
  
  const totalPages = Math.ceil(finalFilteredLocations.length / cardsPerPage);

  // Step 1: Choose departure location (replaces "Add to MyPlans")
  const handleChooseDepartureLocation = (place) => {
    setPlanningStep(prev => ({
      ...prev,
      [place.id]: 'departure'
    }));
  };

  const [isLoading, setIsLoading] = useState(false);
  // Step 2: Add to MyPlans (final step)
const handleAddToMyPlans = async (place) => {
  if (!place) {
    console.error('No place provided to add to My Plans');
    return;
  }
  
  try {
    setIsLoading(true);
    
    // Convert local time to UTC ISO 8601 timestamp
    const localTime = `${cardDateTime.time.hours}:${cardDateTime.time.minutes.toString().padStart(2, '0')} ${cardDateTime.time.period}`;
    
    // Parse the 12-hour time format
    let hours = parseInt(cardDateTime.time.hours);
    const minutes = parseInt(cardDateTime.time.minutes);
    
    // Convert to 24-hour format
    if (cardDateTime.time.period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (cardDateTime.time.period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Create a proper local datetime by combining date and time
    const year = cardDateTime.date.getFullYear();
    const month = cardDateTime.date.getMonth();
    const day = cardDateTime.date.getDate();
    
    // Create local datetime
    const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);
    
    // Convert to UTC ISO 8601 timestamp (ends with 'Z')
    const utcTimestamp = localDateTime.toISOString();
    
    // Prepare plan data for API
    const planData = {
      userPlanId: null,
      place: place.name,
      time: utcTimestamp,
      predicted: place.busy,
      coordinates: place.coordinates
    };

    console.log(planData)
    // Post to server first
    const response = await postUserPlans(planData);
    // IMPORTANT: Use the server's userPlanId as the main ID
    const serverPlanId = response.userPlanId;
    
    // Add to local state with server ID as the main ID
    addPlan({
      id: serverPlanId, // Use server ID as main ID
      placeId: place.id, // Keep original place ID for reference
      place: place.name,
      area: place.location,
      areaImage: place.image,
      date: cardDateTime.date.toLocaleDateString(),
      time: localTime,
      predicted: place.busy,
      coordinates: place.coordinates,
      departureLocation: departureLocation[place.id] || (plans.length === 0 ? 'Current Location' : 'Home'),
      serverPlanId: serverPlanId // Also keep as serverPlanId for consistency
    });
        
    showNotification(
        'success',
        'Plan Added',
        `${place.name} has been successfully added to your plans.`
      );
  } catch (error) {
    console.error('Failed to add plan:', error);
    // Show error notification
      showNotification(
        'error',
        'Failed to Add Plan',
        'Unable to add the plan. Please try again.'
      );
    return;
  } finally {
    setIsLoading(false);
  }
  
  // Reset planning step for this place
  setPlanningStep(prev => ({
    ...prev,
    [place.id]: undefined
  }));
  
  setDepartureLocation(prev => ({
    ...prev,
    [place.id]: undefined
  }));
};

// Updated getPlanForPlace function to better handle server IDs
const getPlanForPlace = (place) => {
  
  const planItem = plans.find(plan => {
    
    // Match by place name first (most reliable)
    // Then by original placeId
    const matches = plan.place === place.name || 
                   plan.placeId === place.id;
    return matches;
  });
  
  return planItem;
};

const handleRemoveFromMyPlans = async (place) => {
  try {
    const planItem = getPlanForPlace(place);
    if (!planItem) {
      console.error('Plan not found for removal');
      return;
    }

    await deletePlan(planItem.id);
    
    console.log('Plan removed successfully');
  } catch (error) {
    console.error('Failed to remove plan:', error);
    // Show user-friendly error message
    alert('Failed to remove plan. Please try again.');
  }
};

  const handleUpdatePlan = (place) => {
    const planItem = getPlanForPlace(place);
    if (planItem) {
      updatePlan(planItem.id, {
        ...planItem,
        time: `${cardDateTime.time.hours}:${cardDateTime.time.minutes.toString().padStart(2, '0')} ${cardDateTime.time.period}`,
        date: cardDateTime.date.toLocaleDateString(),
      });
    }
  };

  const handleDepartureLocationChange = (placeId, location) => {
    setDepartureLocation(prev => ({
      ...prev,
      [placeId]: location
    }));
  };

  // Dynamic departure options based on myPlans
  const getDepartureOptions = () => {
    if (plans.length === 0) {
      return ['Current Location'];
    } else {
      const plannedPlaces = plans.map(plan => ({
        id: plan.placeId,
        name: plan.place
      }));
      
      const plannedPlaceNames = plannedPlaces.map(p => p.name);
      const allOptions = ['Current Location', ...plannedPlaceNames];
      return [...new Set(allOptions)];
    }
  };

  const getDefaultDepartureLocation = () => {
    return plans.length === 0 ? 'Current Location' : 'Home';
  };

  // Navigation handler
  const handleBackToDiscover = () => {
    navigate('/plan'); // Adjust this path to match your actual discover route
  };

  // Helper function to check if locations have recommendation values
  const hasRecommendationData = locations.some(place => place.recommendation !== undefined);
  const hasRatingData = locations.some(place => place.rating !== undefined && place.rating !== null);

  return (
    <PlannerLayout 
      locations={currentCards} 
      selectedLocation={selectedMapLocation}
      zoneBusynessMap={zoneBusynessMap} 
      onMarkerClick={(location) => {
        setSelectedMapLocation(location);
      }}
      onPopupClose={() => {
        setSelectedMapLocation(null);
      }}
    >
      <div className="category-page">
        <div className="suggested-container">
          <div className="header">
            <div className="header-title-container">
              <button 
                className="back-to-discover-btn" 
                onClick={handleBackToDiscover}
                title="Back to Discover"
              >
                <FiArrowLeft size={24} />
              </button>
              <h2>Suggested Places for <span>{displayName}</span></h2>
            </div>
            {showBusyness && (
              <div className="time-picker-wrapper">
                <span>Predict Busyness At</span>
                <DateTimePicker 
                  value={dateTime}
                  onChange={setDateTime}
                  compact={true}
                />
              </div>
            )}

{showSorting && (
  <div className="sub-header">
    <span className="sort-label">Sort By:</span>
    
    {/* Desktop Sort Types */}
    <div className="desktop-sort-types">
      <span 
        className={`sort-types ${sortConfig.key === 'busyness' ? 'active' : ''}`}
        onClick={() => requestSort('busyness')}
      >
        Busyness {sortConfig.key === 'busyness' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
      </span>
      <span 
        className={`sort-types ${sortConfig.key === 'distance' ? 'active' : ''}`}
        onClick={() => requestSort('distance')}
      >
        Distance {sortConfig.key === 'distance' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
      </span>
      {hasRatingData && ( 
        <span 
          className={`sort-types ${sortConfig.key === 'rating' ? 'active' : ''}`}
          onClick={() => requestSort('rating')}
        >
          Rating {sortConfig.key === 'rating' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
        </span>
      )}  
      {hasRecommendationData && (
        <span 
          className={`sort-types ${sortConfig.key === 'recommendation' ? 'active' : ''}`}
          onClick={() => requestSort('recommendation')}
        >
          Recommended {sortConfig.key === 'recommendation' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
        </span>
      )}
      <span 
        className={`sort-types ${showOnlySelected ? 'active' : ''}`}
        onClick={toggleSelectedPlaces}
      >
        Selected Places {showOnlySelected}
      </span>
    </div>

    {/* Mobile Sort Dropdown */}
    <div className="sort-dropdown">
      <button 
        className={`sort-dropdown-button ${sortDropdownOpen ? 'active' : ''}`}
        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
      >
        <span>
          {sortConfig.key === 'busyness' && `Busyness ${sortConfig.direction === 'asc' ? '↑' : '↓'}`}
          {sortConfig.key === 'distance' && `Distance ${sortConfig.direction === 'asc' ? '↑' : '↓'}`}
          {sortConfig.key === 'rating' && `Rating ${sortConfig.direction === 'asc' ? '↑' : '↓'}`}
          {sortConfig.key === 'recommendation' && `Recommended ${sortConfig.direction === 'asc' ? '↑' : '↓'}`}
        </span>
        <span className="sort-arrow">{sortDropdownOpen ? '▲' : '▼'}</span>
      </button>
      
      {sortDropdownOpen && (
        <div className="sort-dropdown-content">
          <div 
            className={`sort-dropdown-item ${sortConfig.key === 'busyness' ? 'active' : ''}`}
            onClick={() => {
              requestSort('busyness');
              setSortDropdownOpen(false);
            }}
          >
            <span>Busyness</span>
            {sortConfig.key === 'busyness' && (
              <span className="sort-arrow">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div 
            className={`sort-dropdown-item ${sortConfig.key === 'distance' ? 'active' : ''}`}
            onClick={() => {
              requestSort('distance');
              setSortDropdownOpen(false);
            }}
          >
            <span>Distance</span>
            {sortConfig.key === 'distance' && (
              <span className="sort-arrow">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          {hasRatingData && (
            <div 
              className={`sort-dropdown-item ${sortConfig.key === 'rating' ? 'active' : ''}`}
              onClick={() => {
                requestSort('rating');
                setSortDropdownOpen(false);
              }}
            >
              <span>Rating</span>
              {sortConfig.key === 'rating' && (
                <span className="sort-arrow">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
          )}
          {hasRecommendationData && (
            <div 
              className={`sort-dropdown-item ${sortConfig.key === 'recommendation' ? 'active' : ''}`}
              onClick={() => {
                requestSort('recommendation');
                setSortDropdownOpen(false);
              }}
            >
              <span>Recommended</span>
              {sortConfig.key === 'recommendation' && (
                <span className="sort-arrow">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
          )}
          <div 
            className={`sort-dropdown-item ${showOnlySelected ? 'active' : ''}`}
            onClick={() => {
              toggleSelectedPlaces();
              setSortDropdownOpen(false);
            }}
          >
            <span>Selected Places</span>
          </div>
        </div>
      )}
    </div>
  </div>
)}
          </div>
        </div>

          {showOnlySelected && plans.length === 0 ? (
          <div className="empty-state">
            <p>No places selected yet</p>
            <button onClick={toggleSelectedPlaces}> Select Places</button>
          </div>
      ) : (
        <>
        <div className={`card-grid ${isSorting ? 'sorting-active' : ''}`}>
          {currentCards.map((place) => (
            <ReactCardFlip 
              key={place.id}
              isFlipped={flippedCards[place.id] || false}
              flipDirection="horizontal"
              containerStyle={{
                width: '100%',
                height: '100%',
                minHeight: '330px' 
              }}
            >
              {/* Front of Card */}
              <CardTilt id={place.id} className={`place-card ${isPlaceInMyPlans(place) ? 'added-to-plans' : ''}`}>
                <div className="image-wrapper">
                  <img src={place.image} alt={place.name} />
                  {/* Checkmark for added to plans */}
                  {isPlaceInMyPlans(place) && (
                    <div className="checkmark-badge">
                      <FiCheck size={20} color="#fff" />
                    </div>
                  )}
                  {/* Conditional badge rendering based on current sort */}
                  {showBusyness && sortConfig.key === 'busyness' && (
                    <div className="busy-badge">Busyness: <span style={{ color: getBusynessColor(place.busy), fontWeight: 900 }}>{place.busy}</span></div>
                  )}
                  {showDistance && sortConfig.key === 'distance' && (
                    <div className="distance-badge">Distance: <span style={{ color: getDistanceColor(place.distance), fontWeight: 900 }}>{place.distance}</span></div>
                  )}
                  {sortConfig.key === 'recommendation' && place.recommendation !== undefined && (
                    <div className="recommendation-badge">Recommended: <span style={{ color: getRecommendationColor(Math.floor(place.recommendation * 10) /10), fontWeight: 900 }}>{Math.floor(place.recommendation * 10) /10}</span></div>
                  )}
                  {sortConfig.key === 'rating' && place.rating !== undefined && (
                    <div className="rating-badge">Rating: <span style={{ color: getRatingColor(place.rating), fontWeight: 900 }}>{place.rating}</span></div>
                  )}
                </div>
                <div className="info">
                  <h4>{place.name}</h4>
                  <p className="location"><i className="fas fa-map-marker-alt"></i> {place.location}</p>
                  {/* Show planned time if in MyPlans */}
                  {isPlaceInMyPlans(place) && (
                    <p className="planned-time" style={{fontWeight: 500, color: '#52c41a'}}>Planned at {getPlannedTime(place)}</p>
                  )}
                  <div className="flip-button-front" onClick={() => {handleCardClick(place.id); handleGetUpcomingBusyness(place);}}>

                    <FiArrowRight size={25} color="#fff" className='arrow' />
                  </div>
                </div>
              </CardTilt>

              {/* Back of Card */}
              <div className={`place-card back ${isPlaceInMyPlans(place) ? 'added-to-plans' : ''}`}>
                <div className="flip-button-back" onClick={() => handleCardClick(place.id)}>
                  <FiArrowLeft size={25} color="#333" className='arrow' />
                </div>
                <div className="time-prediction-container">
                  {isPlaceInMyPlans(place) ? (
                    <>
                      <h4>Edit Time</h4>
                      <div className="time-box-edit">
                        <TimePicker 
                          value={cardDateTime.time}  
                          onChange={handleCardTimeChange}
                          showAllColumns={true} 
                        />
                      </div>
                      <button className="save-time-btn" onClick={() => {handleUpdatePlan(place); handleCardClick(place.id)}}>
                        Update Plan
                      </button>
                      <button className="remove-from-plans-btn" onClick={() => {handleRemoveFromMyPlans(place); handleCardClick(place.id)}}>
                        Remove from MyPlans
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Step 1: Choose visit time */}
                      {planningStep[place.id] !== 'departure' && (
                        <>
                          <h4>Busyness in Upcoming hours</h4>
                          <table className="busyness-table">
                            <thead>
                              <tr>
                                <th>Time</th>
                                <th>Busyness</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                            {busynessLoading[place.id] ? (
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                    Loading busyness data...
                                  </td>
                                </tr>
                          ) : upcomingBusyness[place.id] && upcomingBusyness[place.id].length > 0 ? (
                              upcomingBusyness[place.id].map((item, index) => (
                                <tr key={index}>
                                  <td>{item.time}</td>
                                    <td style={{ color: getBusynessColor(item.busyness), fontWeight: "600" }}>
                                      {item.busyness}
                                    </td>
                                  <td className="choose-column">
                                    <button 
                                      className="choose-btn" 
                                      onClick={() => handleCardTimeChange(item.timeValue || {
                                        hours: parseInt(item.time.split(':')[0]) || 12,
                                        minutes: parseInt(item.time.split(':')[1]) || 0,
                                        period: item.time.includes('PM') ? 'PM' : 'AM'
                                      })}
                                    >
                                      Choose
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              [
                                { time: '1:00 PM', busyness: 'low', timeValue: { hours: 1, minutes: 0, period: 'PM' } },
                                { time: '2:00 PM', busyness: 'high', timeValue: { hours: 2, minutes: 0, period: 'PM' } },
                                { time: '3:00 PM', busyness: 'medium', timeValue: { hours: 3, minutes: 0, period: 'PM' } }
                              ].map((item, index) => (
                                <tr key={index}>
                                  <td>{item.time}</td>
                                  <td style={{ color: getBusynessColor(item.busyness), fontWeight: "600" }}>
                                    {item.busyness}
                                  </td>
                                  <td className="choose-column">
                                    <button className="choose-btn" onClick={() => handleCardTimeChange(item.timeValue)}>
                                      Choose
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                          
                          <div className="time-box">
                            <h4>Visit At</h4>
                            <TimePicker 
                              value={cardDateTime.time}  
                              onChange={handleCardTimeChange}
                              showAllColumns={true} 
                            />
                          </div>
                          <button className="save-time-btn" onClick={() => handleChooseDepartureLocation(place)}>
                            Choose Departure Location
                          </button>
                        </>
                      )}

                      {/* Step 2: Choose departure location */}
                      {planningStep[place.id] === 'departure' && (
                        <>
                            <h4 className='visiting-time-display'>Visiting At {cardDateTime.time.hours}:{cardDateTime.time.minutes.toString().padStart(2, '0')} {cardDateTime.time.period}</h4>
                          <div className="departure-box">
                            <h4>Depart From</h4>
                            <select 
                              className="departure-select"
                              value={departureLocation[place.id] || getDefaultDepartureLocation()}
                              onChange={(e) => handleDepartureLocationChange(place.id, e.target.value)}
                            >
                              {getDepartureOptions().map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="departure-buttons">
                            <button className="add-to-plans-btn" onClick={() => {handleAddToMyPlans(place); handleCardClick(place.id)}} disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add to MyPlans'}
                            </button>
                            <button 
                              className="back-to-time-btn" 
                              onClick={() => setPlanningStep(prev => ({...prev, [place.id]: undefined}))}
                            >
                              Back to Time Selection
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </ReactCardFlip>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              onClick={() => {
                const newPage = Math.max(currentPage - 1, 1);
                handlePageChange(newPage);
              }}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {getVisiblePageNumbers().map(number => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => {
                const newPage = Math.min(currentPage + 1, totalPages);
                handlePageChange(newPage);
              }}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
      </div>
      <Notification 
        notification={notification} 
        onClose={hideNotification} 
      />
    </PlannerLayout>
  );
};

export default CategoryLayout;