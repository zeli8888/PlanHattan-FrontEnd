import './MapPanel.css';
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initialPlans } from '../../pages/planner/plansData';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function MapPanel() {
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 12
  });
  const [selectedPlace, setSelectedPlace] = useState(null);

  const plansWithCoordinates = initialPlans.filter(plan => 
    plan.coordinates && 
    plan.coordinates.length === 2
  );

  return (
    <div className="map-panel">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/rahulrodi/cmbtlz1q9014o01sc7rjd6axj/draft"
        style={{ width: '100%', height: '100%' }}
        projection="globe" // Ensures proper geographic projection
      >
        {plansWithCoordinates.map((plan, index) => (
          <Marker
            key={`marker-${plan.place}-${index}`}
            longitude={plan.coordinates[0]}
            latitude={plan.coordinates[1]}
            anchor="bottom" // Critical for proper pin placement
            pitchAlignment="map" // Sticks to map plane
            rotationAlignment="map" // Prevents marker rotation
          >
            {/* Precise location pin SVG */}
            <svg
              width="28"
              height="40"
              viewBox="0 0 28 40"
              fill="#5c5cff"
              style={{
                transform: 'translate(-50%, -100%)', // Centers the pin point
                pointerEvents: 'none' // Prevents SVG from blocking map interactions
              }}
            >
              <path d="M14 0C6.268 0 0 6.268 0 14c0 10 14 26 14 26s14-16 14-26C28 6.268 21.732 0 14 0zm0 20c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
            </svg>
          </Marker>
        ))}

        {selectedPlace && (
          <Popup
            longitude={selectedPlace.coordinates[0]}
            latitude={selectedPlace.coordinates[1]}
            anchor="bottom" // Aligns with marker anchor
            closeOnClick={false}
            onClose={() => setSelectedPlace(null)}
          >
            <div className="popup-content">
              <h3>{selectedPlace.place}</h3>
              <p>{selectedPlace.area}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default MapPanel;