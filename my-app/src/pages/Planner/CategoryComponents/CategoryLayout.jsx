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

const CategoryLayout = ({  
  displayName, 
  locations,
  showBusyness = true,
  showSorting = true,
  showDistance = true
}) => {
  const navigate = useNavigate();
  
  const now = new Date();
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });
  
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

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

  const { addPlan, plans, deletePlan, updatePlan } = useMyPlans();

  // Function to check if a place is in MyPlans
  const isPlaceInMyPlans = (place) => {
    return plans.some(plan => plan.placeId === place.id);
  };

  // Function to get the planned time for a place
  const getPlannedTime = (place) => {
    const planItem = plans.find(plan => plan.placeId === place.id);
    return planItem ? planItem.time : null;
  };

  // Function to get the plan for a place
  const getPlanForPlace = (place) => {
    return plans.find(plan => plan.placeId === place.id);
  };
  
  // Filter locations based on showOnlySelected
  const filteredLocations = showOnlySelected 
    ? locations.filter(place => isPlaceInMyPlans(place))
    : locations;
  
  // Calculate current page cards and total pages
  const currentCards = [...filteredLocations].sort((a, b) => {
    if (sortConfig.key === 'busyness') {
      const busyMapper = {'low': 1, 'medium': 2, 'high': 3}
      const aValue = busyMapper[a.busy]
      const bValue = busyMapper[b.busy]
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = parseFloat(a.distance);
      const bValue = parseFloat(b.distance);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
  }).slice(indexOfFirstCard, indexOfLastCard);
  
  const totalPages = Math.ceil(filteredLocations.length / cardsPerPage);

  // Step 1: Choose departure location (replaces "Add to MyPlans")
  const handleChooseDepartureLocation = (place) => {
    setPlanningStep(prev => ({
      ...prev,
      [place.id]: 'departure'
    }));
  };

  // Step 2: Add to MyPlans (final step)
  const handleAddToMyPlans = (place) => {
    if (!place) {
      console.error('No place provided to add to My Plans');
      return;
    }
    
    addPlan({
      placeId: place.id,
      place: place.name,
      area: place.location,
      areaImage: place.image,
      date: cardDateTime.date.toLocaleDateString(),
      time: `${cardDateTime.time.hours}:${cardDateTime.time.minutes.toString().padStart(2, '0')} ${cardDateTime.time.period}`,
      predicted: place.busy,
      coordinates: place.coordinates,
      departureLocation: departureLocation[place.id] || (plans.length === 0 ? 'Current Location' : 'Home')
    });
    
    // Reset planning step for this place
    setPlanningStep(prev => ({
      ...prev,
      [place.id]: undefined
    }));
    
    setDepartureLocation(prev => ({
      ...prev,
      [place.id]: undefined
    }));
    
    console.log({place});
  };

  const handleRemoveFromMyPlans = (place) => {
    const planItem = getPlanForPlace(place);
    if (planItem) {
      deletePlan(planItem.id);
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

  return (
    <PlannerLayout 
      locations={currentCards} // Pass only current page cards instead of all locations
      selectedLocation={selectedMapLocation}
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
                  Near You {sortConfig.key === 'distance' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </span>
                <span 
                  className={`sort-types ${showOnlySelected ? 'active' : ''}`}
                  onClick={toggleSelectedPlaces}
                >
                  Selected Places {showOnlySelected}
                </span>
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
                  {showBusyness && (
                    <div className="busy-badge">Busyness: <span style={{ color: getBusynessColor(place.busy), fontWeight: 900 }}>{place.busy}</span></div>
                  )}
                  {showDistance && (
                    <div className="distance-badge">Distance: <span style={{ color: getDistanceColor(place.distance), fontWeight: 900 }}>{place.distance}</span></div>
                  )}
                </div>
                <div className="info">
                  <h4>{place.name}</h4>
                  <p className="location"><i className="fas fa-map-marker-alt"></i> {place.location}</p>
                  {/* Show planned time if in MyPlans */}
                  {isPlaceInMyPlans(place) && (
                    <p className="planned-time" style={{fontWeight: 500, color: '#52c41a'}}>Planned at {getPlannedTime(place)}</p>
                  )}
                  <div className="flip-button-front" onClick={() => handleCardClick(place.id)}>
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
                              {[
                                { time: '1:00 PM', busyness: 'low', timeValue: { hours: 1, minutes: 0, period: 'PM' } },
                                { time: '2:00 PM', busyness: 'high', timeValue: { hours: 2, minutes: 0, period: 'PM' } },
                                { time: '3:00 PM', busyness: 'medium', timeValue: { hours: 3, minutes: 0, period: 'PM' } }
                              ].map((item, index) => (
                                <tr key={index}>
                                  <td>{item.time}</td>
                                  <td style={{ color: getBusynessColor(item.busyness), fontWeight: "600px" }}>
                                    {item.busyness}
                                  </td>
                                  <td className="choose-column">
                                    <button className="choose-btn" onClick={() => handleCardTimeChange(item.timeValue)}>Choose</button>
                                  </td>
                                </tr>
                              ))}
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
                            <button className="add-to-plans-btn" onClick={() => {handleAddToMyPlans(place); handleCardClick(place.id)}}>
                              Add to MyPlans
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    </PlannerLayout>
  );
};

export default CategoryLayout;