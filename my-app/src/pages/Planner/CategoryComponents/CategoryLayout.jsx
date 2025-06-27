import { useState } from 'react';
import PlannerLayout from '../PlannerLayout';
import DateTimePicker from '../../../components/dateTime/DateTimePicker';
import './CategoryLayout.css';
import ReactCardFlip from 'react-card-flip';
import { FiArrowRight } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import TimePicker from '../../../components/dateTime/TimePicker';

const CategoryLayout = ({  
  displayName, 
  locations,
  showBusyness = true,
  showSorting = true,
  showDistance = true
}) => {
  const now = new Date();
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: now.getHours() % 12 || 12,
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    }
  });

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

  // Calculate pagination values
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = [...locations].sort((a, b) => {
    if (sortConfig.key === 'busyness') {
      const aValue = parseInt(a.busy);
      const bValue = parseInt(b.busy);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = parseFloat(a.distance);
      const bValue = parseFloat(b.distance);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
  }).slice(indexOfFirstCard, indexOfLastCard);
  
  const totalPages = Math.ceil(locations.length / cardsPerPage);

  const getBusynessColor = (percentage) => {
    const value = parseInt(percentage);
    if (value >= 80) return '#ff4d4f'; 
    if (value >= 40) return '#faad14'; 
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
    setCurrentPage(1); // Reset to first page when sorting changes
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

  return (
    <PlannerLayout>
      <div className="category-page">
        <div className="suggested-container">
          <div className="header">
            <h2>Suggested Places for <span>{displayName}</span></h2>
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
              </div>
            )}
          </div>
        </div>

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
              <div className="place-card">
                <div className="image-wrapper">
                  <img src={place.image} alt={place.name} />
                  {showBusyness && (
                    <div className="busy-badge">Busyness: <span style={{ color: getBusynessColor(place.busy) }}>{place.busy}</span></div>
                  )}
                  {showDistance && (
                    <div className="distance-badge">Distance: <span style={{ color: getDistanceColor(place.distance) }}>{place.distance}</span></div>
                  )}
                </div>
                <div className="info">
                  <h4>{place.name}</h4>
                  <p className="location"><i className="fas fa-map-marker-alt"></i> {place.location}</p>
                  <div className="flip-button-front" onClick={() => handleCardClick(place.id)}><FiArrowRight size={25} color="#fff" className='arrow' /></div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="place-card back" >
                  <div className="flip-button-back" onClick={() => handleCardClick(place.id)}>
                    <FiArrowLeft size={25} color="#333" className='arrow' /></div>
                  <div className="time-prediction-container">
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
                        { time: '1:00 PM', busyness: '26%', timeValue: { hours: 1, minutes: 0, period: 'PM' } },
                        { time: '2:00 PM', busyness: '63%', timeValue: { hours: 2, minutes: 0, period: 'PM' } },
                        { time: '3:00 PM', busyness: '86%', timeValue: { hours: 3, minutes: 0, period: 'PM' } }
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
                  <button className="save-time-btn">Add to MyPlans</button>
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
      </div>
    </PlannerLayout>
  );
};

export default CategoryLayout;