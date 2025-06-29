// PlannerLayout.jsx
import MapPanel from '../../components/map/MapPanel';
import Navbar from '../../components/nav/Navbar';
import './PlannerLayout.css';
import { useState } from 'react';

export default function PlannerLayout({ children, locations = [] }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const handlePopupClose = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="planner-page">
      <Navbar />
      <div className="planner-layout">
        <div className="planner-left-map">
          <MapPanel 
            locations={locations}
            selectedLocation={selectedLocation}
            onMarkerClick={handleMarkerClick}
            onPopupClose={handlePopupClose}
          />
        </div>
        <div className="planner-right">
          {children}
        </div>
      </div>
    </div>
  );
}