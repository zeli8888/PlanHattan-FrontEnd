import { useState } from 'react';
import PlannerLayout from '../PlannerLayout';
import DateTimePicker from '../../../components/dateTime/DateTimePicker';
import './CategoryLayout.css';

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
  
  const [sortConfig, setSortConfig] = useState({
    key: 'busyness',
    direction: 'asc'
  });
  const [isSorting, setIsSorting] = useState(false);

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

  const sortedLocations = [...locations].sort((a, b) => {
    if (sortConfig.key === 'busyness') {
      const aValue = parseInt(a.busy);
      const bValue = parseInt(b.busy);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = parseFloat(a.distance);
      const bValue = parseFloat(b.distance);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const requestSort = (key) => {
    setIsSorting(true);
    setTimeout(() => setIsSorting(false), 500);
    
    let direction = 'asc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
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
          {sortedLocations.map((place) => (
            <div 
              key={place.id} 
              className="place-card"
              style={{
                transition: isSorting ? 'all 0.5s ease-in-out' : 'none'
              }}
            >
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlannerLayout>
  );
};

export default CategoryLayout;