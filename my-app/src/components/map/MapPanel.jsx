// MapPanel.jsx
import './MapPanel.css';
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const DefaultMarker = () => (
  <svg width="28" height="40" viewBox="0 0 28 40" fill="#4a54e1">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10 14 26 14 26s14-16 14-26C28 6.268 21.732 0 14 0zm0 20c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
    <circle cx="14" cy="14" r="3" fill="white"/>
  </svg>
);

function MapPanel({ 
  locations = [],
  icon: Icon = DefaultMarker,
  popupContent,
  defaultViewport = {
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 12
  },
  selectedLocation,
  onMarkerClick,
  onPopupClose
}) {
  const [viewport, setViewport] = useState(defaultViewport);

  // Fixed the filtering logic - was checking locations.coordinates instead of location.coordinates
  const locationsWithCoordinates = locations.filter(location => 
    location.coordinates && 
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    !isNaN(location.coordinates[0]) && 
    !isNaN(location.coordinates[1])
  );

  return (
    <div className="map-panel">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/rahulrodi/cmbtlz1q9014o01sc7rjd6axj/draft"
        style={{ width: '100%', height: '100%' }}
        projection="globe"
      >
        {locationsWithCoordinates.map((location) => (
          <Marker
            key={location.id || `${location.coordinates[0]}-${location.coordinates[1]}`}
            longitude={location.coordinates[0]}
            latitude={location.coordinates[1]}
            anchor="bottom"
            onClick={() => onMarkerClick(location)}
          >
            <Icon {...location} />
          </Marker>
        ))}

        {selectedLocation && locationsWithCoordinates.some(loc => 
          loc.id === selectedLocation.id || 
          (loc.coordinates[0] === selectedLocation.coordinates[0] && 
           loc.coordinates[1] === selectedLocation.coordinates[1])
        ) && (
          <Popup
            longitude={selectedLocation.coordinates[0]}
            latitude={selectedLocation.coordinates[1]}
            anchor="bottom"
            closeOnClick={false}
            onClose={onPopupClose}
          >
            {popupContent ? (
              popupContent(selectedLocation) 
            ) : (
              <div className="popup-content">
                <h3>{selectedLocation.name || selectedLocation.place}</h3>
                <p>{selectedLocation.area || selectedLocation.address}</p>
                {selectedLocation.busy && (
                  <div className="busyness-meter">
                    <div 
                      className="busyness-level" 
                      style={{ 
                        width: `${selectedLocation.busy}%`,
                        backgroundColor: getBusynessColor(selectedLocation.busy)
                      }} 
                    />
                  </div>
                )}
              </div>
            )}
          </Popup>
        )}
      </Map>
    </div>
  );
}

// Helper function (can be moved to utils)
function getBusynessColor(percentage) {
  const value = parseInt(percentage);
  if (value >= 80) return '#ff4d4f'; 
  if (value >= 40) return '#faad14'; 
  return '#52c41a'; 
}

export default MapPanel;