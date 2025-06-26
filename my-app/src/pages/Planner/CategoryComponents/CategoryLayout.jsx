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
                <span className='sort-types'>Busyness</span>
                <span className='sort-types'>Near You</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-grid">
          {locations.map((place) => (
            <div key={place.id} className="place-card">
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