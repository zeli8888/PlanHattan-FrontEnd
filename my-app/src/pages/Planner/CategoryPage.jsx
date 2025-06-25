import { useParams } from 'react-router-dom';
import PlannerLayout from './PlannerLayout';
import './CategoryPage.css';
import { useState } from 'react';
import img1 from "../../assests/brooklyn.jpg";
import img2 from "../../assests/Pubs.jpg";
import img3 from "../../assests/statue.jpg";
import img4 from "../../assests/times.jpg";
import DateTimePicker from '../../components/dateTime/DateTimePicker';

const categoryMapping = {
  'museums-galleries': 'Museums & Galleries',
  'landmarks-attractions': 'Landmarks & Attractions',
  'cafe-restaurants': 'Cafes & Restaurants',
  'nightlife-bars': 'Nightlife & Bars',
  'shopping-boutiques': 'Shopping & Boutiques',
  'live-music': 'Live Music',
  'cruises': 'Cruises'
};

const sampleLocations = [
  {
    id: 1,
    name: "Statue of Liberty",
    image: img1,
    location: "Liberty Island, NY",
    busy: "95%",
  },
  {
    id: 2,
    name: "Empire State Building",
    image: img2,
    location: "20 W 34th St, NY",
    busy: "85%",
  },
  {
    id: 3,
    name: "Times Square",
    image: img3,
    location: "Manhattan, NY",
    busy: "90%",
  },
  {
    id: 4,
    name: "Central Park",
    image: img4,
    location: "Manhattan, NY",
    busy: "75%",
  }
];

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: 11,
      minutes: 30,
      period: 'PM'
    }
  });

  const displayName = categoryMapping[categoryName] || categoryName.replace('-', ' & ');

  return (
    <PlannerLayout>
      <div className="category-page">
        <div className="suggested-container">
          <div className="header">
            <h2>Suggested Places for <span>{displayName}</span></h2>
            <div className="time-picker-wrapper">
              <span>Predict Busyness At</span>
              <DateTimePicker 
                value={dateTime}
                onChange={setDateTime}
                compact={true}
              />
            </div>
            <div className="sub-header">
              <span className="sort-label">Sort By:</span>
              <span className='sort-types'>Busyness</span>
              <span className='sort-types'>Near You</span>
            </div>
          </div>
        </div>

        <div className="card-grid">
          {sampleLocations.map((place) => (
            <div key={place.id} className="place-card">
              <div className="image-wrapper">
                <img src={place.image} alt={place.name} />
                <div className="busy-badge">Busyness: <span>{place.busy}</span></div>
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
}