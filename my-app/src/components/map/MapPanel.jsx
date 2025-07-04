// MapPanel.jsx - Updated with routing functionality
import './MapPanel.css';
import { useState, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from '../../contexts/LocationContext';
import { Navigation } from 'lucide-react';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const DefaultMarker = () => (
  <svg width="28" height="40" viewBox="0 0 28 40" fill="#4a54e1">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10 14 26 14 26s14-16 14-26C28 6.268 21.732 0 14 0zm0 20c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
    <circle cx="14" cy="14" r="3" fill="white"/>
  </svg>
);

const SelectedMarker = () => (
  <svg width="32" height="46" viewBox="0 0 32 46" fill="#FF6B6B">
    <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 30 16 30s16-18 16-30C32 7.164 24.836 0 16 0zm0 24c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
    <circle cx="16" cy="16" r="4" fill="white"/>
    {/* Pulsing ring */}
    <circle cx="16" cy="16" r="12" fill="none" stroke="#FF6B6B" strokeWidth="2" opacity="0.6">
      <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const CurrentLocationMarker = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    {/* Outer pulsing circle */}
    <circle cx="16" cy="16" r="14" fill="#FF6B6B" opacity="0.3">
      <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Inner circle */}
    <circle cx="16" cy="16" r="8" fill="#FF6B6B" />
    {/* Center dot */}
    <circle cx="16" cy="16" r="3" fill="white" />
    {/* Plus sign */}
    <path d="M16 8 L16 24 M8 16 L24 16" stroke="white" strokeWidth="2" />
  </svg>
);

const GPSButton = ({ onClick, disabled }) => (
  <div 
    className="gps-button"
    onClick={onClick}
    style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: disabled ? '#ccc' : '#fff',
      borderRadius: '50%',
      padding: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid #e0e0e0'
    }}
  >
    <Navigation 
      size={24} 
      color={disabled ? '#999' : '#4a54e1'}
      fill={disabled ? '#999' : '#4a54e1'}
    />
  </div>
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
  const [mapRef, setMapRef] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const { currentLocation } = useLocation();

  // Filter locations with valid coordinates
  const locationsWithCoordinates = locations.filter(location => 
    location.coordinates && 
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    !isNaN(location.coordinates[0]) && 
    !isNaN(location.coordinates[1])
  );

  // Fetch route from Mapbox Directions API
  const fetchRoute = async (start, end) => {
    if (!start || !end) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        });
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // Convert to km
          duration: Math.round(route.duration / 60) // Convert to minutes
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteData(null);
      setRouteInfo(null);
    }
  };

  // Handle route calculation when selected location changes
  useEffect(() => {
    if (selectedLocation && currentLocation && currentLocation.coordinates) {
      fetchRoute(currentLocation.coordinates, selectedLocation.coordinates);
    } else {
      setRouteData(null);
      setRouteInfo(null);
    }
  }, [selectedLocation, currentLocation]);

  // Handle current location marker click
  const handleCurrentLocationClick = () => {
    if (currentLocation && onMarkerClick) {
      onMarkerClick(currentLocation);
    }
  };

  // Handle GPS button click
  const handleGPSClick = () => {
    if (currentLocation && currentLocation.coordinates && mapRef) {
      mapRef.flyTo({
        center: currentLocation.coordinates,
        zoom: 16,
        duration: 1000
      });
    }
  };

  // Check if current location is already in the locations array
  const isCurrentLocationInLocations = currentLocation && locationsWithCoordinates.some(loc => 
    loc.id === currentLocation.id || 
    (loc.coordinates[0] === currentLocation.coordinates[0] && 
     loc.coordinates[1] === currentLocation.coordinates[1])
  );

  // Center map on new locations
  useEffect(() => {
    if (locationsWithCoordinates.length > 0) {
      const newLocation = locationsWithCoordinates[locationsWithCoordinates.length - 1];
      setViewport({
        longitude: newLocation.coordinates[0],
        latitude: newLocation.coordinates[1],
        zoom: 15
      });
    }
  }, [locations]);

  // Route layer style
  const routeLayer = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FF6B6B',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  return (
    <div className="map-panel" style={{ position: 'relative' }}>
      <Map
        ref={setMapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/rahulrodi/cmbtlz1q9014o01sc7rjd6axj/draft"
        style={{ width: '100%', height: '100%' }}
        projection="globe"
        {...viewport}
      >
        {/* Route line */}
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer {...routeLayer} />
          </Source>
        )}

        {/* Regular location markers */}
        {locationsWithCoordinates.map((location) => {
          const isSelected = selectedLocation && selectedLocation.id === location.id;
          const MarkerComponent = isSelected ? SelectedMarker : Icon;
          
          return (
            <Marker
              key={location.id || `${location.coordinates[0]}-${location.coordinates[1]}`}
              longitude={location.coordinates[0]}
              latitude={location.coordinates[1]}
              anchor="bottom"
              onClick={() => onMarkerClick && onMarkerClick(location)}
            >
              <MarkerComponent {...location} />
            </Marker>
          );
        })}

        {/* Current location marker - only show if it's not already in locations */}
        {currentLocation && currentLocation.coordinates && !isCurrentLocationInLocations && (
          <Marker
            key={`current-${currentLocation.id}`}
            longitude={currentLocation.coordinates[0]}
            latitude={currentLocation.coordinates[1]}
            anchor="center"
            onClick={handleCurrentLocationClick}
          >
            <CurrentLocationMarker />
          </Marker>
        )}

        {/* Show current location marker with different style if it's in locations */}
        {currentLocation && currentLocation.coordinates && isCurrentLocationInLocations && (
          <Marker
            key={`current-overlay-${currentLocation.id}`}
            longitude={currentLocation.coordinates[0]}
            latitude={currentLocation.coordinates[1]}
            anchor="center"
            onClick={handleCurrentLocationClick}
          >
            <div style={{ position: 'relative' }}>
              <CurrentLocationMarker />
            </div>
          </Marker>
        )}

        {selectedLocation && (locationsWithCoordinates.some(loc => 
          loc.id === selectedLocation.id || 
          (loc.coordinates[0] === selectedLocation.coordinates[0] && 
           loc.coordinates[1] === selectedLocation.coordinates[1])
        ) || (currentLocation && selectedLocation.id === currentLocation.id)) && (
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
                {selectedLocation.rating && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    Rating: {selectedLocation.rating} ⭐
                  </p>
                )}
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
                {routeInfo && (
                  <div className="route-info">
                    <p style={{ margin: '5px 0', color: '#FF6B6B', fontWeight: 'bold' }}>
                      🚗 {routeInfo.distance} km • {routeInfo.duration} min
                    </p>
                  </div>
                )}
                {currentLocation && selectedLocation.id === currentLocation.id && (
                  <div className="current-location-badge">
                    📍 Current Location
                  </div>
                )}
              </div>
            )}
          </Popup>
        )}
      </Map>

      {/* GPS Navigation Button */}
      <GPSButton 
        onClick={handleGPSClick}
        disabled={!currentLocation || !currentLocation.coordinates}
      />
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