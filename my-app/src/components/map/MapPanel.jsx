// MapPanel.jsx - Enhanced with zone busyness coloring
import './MapPanel.css';
import { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCurrentLocation } from '../../contexts/LocationContext';
import { Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

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
    <circle cx="16" cy="16" r="12" fill="none" stroke="#FF6B6B" strokeWidth="2" opacity="0.6">
      <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const CurrentLocationMarker = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#3B3B98" opacity="0.3">
      <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="16" r="8" fill="#3B3B98" />
    <circle cx="16" cy="16" r="3" fill="white" />
    <path d="M16 8 L16 24 M8 16 L24 16" stroke="white" strokeWidth="2" />
  </svg>
);

const BusynessHeader = ({ isVisible }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (!isVisible) return null;

  return (
    <div 
      className="busyness-header"
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        padding: '12px 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0',
        fontSize: '16px',
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        maxWidth: '90%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      Predicted Busyness on {formattedDate}
    </div>
  );
};

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

const ZoneBusynessToggle = ({ isEnabled, onToggle }) => (
  <div 
    className="zone-busyness-toggle"
    style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      zIndex: 1000,
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      border: '2px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }}
  >
    <span>Zone Busyness Map</span>
    <div 
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: isEnabled ? '#4a54e1' : '#ccc',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: '#fff',
          position: 'absolute',
          top: '2px',
          left: isEnabled ? '22px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  </div>
);

// Helper function to calculate centroid of a polygon
function calculateCentroid(coordinates) {
  let x = 0;
  let y = 0;
  let count = 0;
  
  if (coordinates && coordinates.length > 0) {
    const coords = Array.isArray(coordinates[0][0]) ? coordinates[0] : coordinates;
    
    coords.forEach(coord => {
      if (coord && coord.length >= 2) {
        x += coord[0];
        y += coord[1];
        count++;
      }
    });
    
    if (count > 0) {
      return [x / count, y / count];
    }
  }
  
  return null;
}

// Helper function to get color based on busyness level
function getBusynessColor(busynessLevel) {
  const colors = {
    low: '#52c41a',      // Green
    medium: '#faad14',   // Orange
    high: '#ff4d4f'      // Red
  };
  
  return colors[busynessLevel?.toLowerCase()] || '#088F8F'; // Fixed: added default fallback
}

// Helper function to get opacity based on busyness level
function getBusynessOpacity(busynessLevel) {
  const opacities = {
    low: 0.3,
    medium: 0.5,
    high: 0.7
  };
  
  return opacities[busynessLevel?.toLowerCase()] || 0.3;
}

// Create a Mapbox GL expression for zone coloring
function createZoneColorExpression(zoneBusynessMap) {  
  if (!zoneBusynessMap || Object.keys(zoneBusynessMap).length === 0) {
    return '#088F8F'; // Default color
  }

  const expression = ['case'];
  
  // Add conditions for each zone
  Object.keys(zoneBusynessMap).forEach((zoneId) => {
  const busynessLevel = zoneBusynessMap[zoneId];
  const color = getBusynessColor(busynessLevel);
    
  // Convert locationID to string for comparison
  expression.push(['==', ['to-string', ['get', 'LocationID']], zoneId]);
  expression.push(color);
});
  
  expression.push('#088F8F'); // Default color
  
  return expression;
}

// Create a Mapbox GL expression for zone opacity
function createZoneOpacityExpression(zoneBusynessMap) {
  if (!zoneBusynessMap || Object.keys(zoneBusynessMap).length === 0) {
    return 0.3; // Default opacity
  }

  const expression = ['case'];
    
  Object.keys(zoneBusynessMap).forEach((zoneId) => {
    const busynessLevel = zoneBusynessMap[zoneId];
    const opacity = getBusynessOpacity(busynessLevel);
    
    expression.push(['==', ['to-string', ['get', 'LocationID']], zoneId]);
    expression.push(opacity);
  });
  
  expression.push(0.3); // Default opacity
  return expression;
}

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
  onPopupClose,
  geojsonFile,
  onZoneClick,
  zoneBusynessMap = {} // New prop for zone busyness data
}) {
  const [viewport, setViewport] = useState(defaultViewport);
  const [mapRef, setMapRef] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneCoords, setSelectedZoneCoords] = useState(null);
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const [error, setError] = useState(null);
  const { currentLocation } = useCurrentLocation();
  const hoveredZoneId = useRef(null);
  const [showZoneBusyness, setShowZoneBusyness] = useState(true);


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
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60)
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteData(null);
      setRouteInfo(null);
    }
  };

  const loadManhattanZones = async () => {
    if (!mapRef || zonesLoaded) return;

    try {
      let geojsonData;
      
      if (geojsonFile) {
        const text = await geojsonFile.text();
        geojsonData = JSON.parse(text);
      } else {
        const response = await fetch('/zones_with_busyness.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        geojsonData = await response.json();
      }

      const map = mapRef.getMap();

      if (map.getSource('manhattan-zones')) {
        map.getSource('manhattan-zones').setData(geojsonData);
        return;
      }

      geojsonData.features.forEach((feature, index) => {
        if (feature.id === undefined) {
          feature.id = index;
        }
      });

      map.addSource('manhattan-zones', {
        type: 'geojson',
        data: geojsonData
      });

      // Add fill layer with dynamic coloring based on busyness
    map.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'manhattan-zones',
      paint: {
        'fill-color': (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
          ? createZoneColorExpression(zoneBusynessMap) 
          : '#088F8F',
        'fill-opacity': (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
          ? createZoneOpacityExpression(zoneBusynessMap) 
          : 0.3
      }
    });

      // Add stroke layer
      map.addLayer({
        id: 'zones-stroke',
        type: 'line',
        source: 'manhattan-zones',
        paint: {
          'line-color': '#fff',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add labels for zones
      map.addLayer({
        id: 'zones-labels',
        type: 'symbol',
        source: 'manhattan-zones',
        layout: {
          'text-field': ['get', 'zone'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });
// Force refresh with a more aggressive approach
    setTimeout(() => {
      if (map.getLayer('zones-fill') && showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) {
        
        // Remove and re-add the layer
        map.removeLayer('zones-fill');
        
        map.addLayer({
          id: 'zones-fill',
          type: 'fill',
          source: 'manhattan-zones',
          paint: {
            'fill-color': createZoneColorExpression(zoneBusynessMap),
            'fill-opacity': createZoneOpacityExpression(zoneBusynessMap)
          }
        }, 'zones-stroke'); // Insert before stroke layer
        
      }
    }, 100);
      // Add hover effects
      map.on('mouseenter', 'zones-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (feature.id !== undefined) {
            if (hoveredZoneId.current !== null) {
              map.setFeatureState(
                { source: 'manhattan-zones', id: hoveredZoneId.current },
                { hover: false }
              );
            }
            
            hoveredZoneId.current = feature.id;
            map.setFeatureState(
              { source: 'manhattan-zones', id: hoveredZoneId.current },
              { hover: true }
            );
          }
        }
      });

      map.on('mouseleave', 'zones-fill', () => {
        map.getCanvas().style.cursor = '';
        
        if (hoveredZoneId.current !== null) {
          map.setFeatureState(
            { source: 'manhattan-zones', id: hoveredZoneId.current },
            { hover: false }
          );
          hoveredZoneId.current = null;
        }
      });

      // Click event handler
      map.on('click', 'zones-fill', (e) => {
        if (e.features.length > 0) {
          const clickedZone = e.features[0];
          
          // Get busyness level for this zone
          const zoneLocationID = clickedZone.properties.locationID;
          const busynessLevel = zoneBusynessMap[zoneLocationID] || 'unknown';
          
          // Calculate centroid for popup positioning
          let centroid = null;
          if (clickedZone.geometry) {
            if (clickedZone.geometry.type === 'Polygon') {
              centroid = calculateCentroid(clickedZone.geometry.coordinates);
            } else if (clickedZone.geometry.type === 'MultiPolygon') {
              if (clickedZone.geometry.coordinates.length > 0) {
                centroid = calculateCentroid(clickedZone.geometry.coordinates[0]);
              }
            }
          }
          
          if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) {
            centroid = [e.lngLat.lng, e.lngLat.lat];
          }
          
          // Add busyness level to zone properties for popup display
          const zoneWithBusyness = {
            ...clickedZone.properties,
            busynessLevel: busynessLevel,
            busynessColor: getBusynessColor(busynessLevel)
          };
          
          setSelectedZone(zoneWithBusyness);
          setSelectedZoneCoords(centroid);
          
          if (onZoneClick) {
            onZoneClick({ ...clickedZone, busynessLevel });
          }
          
          // Fit map to selected zone
          const coordinates = [];
          
          if (clickedZone.geometry.type === 'Polygon') {
            coordinates.push(...clickedZone.geometry.coordinates[0]);
          } else if (clickedZone.geometry.type === 'MultiPolygon') {
            clickedZone.geometry.coordinates.forEach(polygon => {
              coordinates.push(...polygon[0]);
            });
          }
          
          if (coordinates.length > 0) {
            const bounds = coordinates.reduce((bounds, coord) => {
              return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            
            map.fitBounds(bounds, { padding: 50 });
          }
        }
      });

      setZonesLoaded(true);
      setError(null);

    } catch (error) {
      console.error('Error loading Manhattan zones:', error);
      setError('Failed to load zone data. Please check your GeoJSON file or network connection.');
    }
  };

useEffect(() => {
  if (mapRef && zonesLoaded) {
    const map = mapRef.getMap();
    if (map.getLayer('zones-fill')) {
      
      // Remove and recreate the layer
      map.removeLayer('zones-fill');
      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'manhattan-zones',
        paint: {
          'fill-color': (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
            ? createZoneColorExpression(zoneBusynessMap) 
            : '#088F8F',
          'fill-opacity': (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
            ? createZoneOpacityExpression(zoneBusynessMap) 
            : 0.3
        }
      }, 'zones-stroke');
    }
  }
}, [zoneBusynessMap, mapRef, zonesLoaded, showZoneBusyness]);

  useEffect(() => {
    if (mapRef && !zonesLoaded) {
      const map = mapRef.getMap();
      
      if (map.isStyleLoaded()) {
        loadManhattanZones();
      } else {
        map.on('style.load', loadManhattanZones);
      }
    }
  }, [mapRef, geojsonFile, zonesLoaded]);

  useEffect(() => {
  if (mapRef && zonesLoaded) {
    const map = mapRef.getMap();
    if (map.getLayer('zones-fill')) {
      map.setPaintProperty('zones-fill', 'fill-color', 
        (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
          ? createZoneColorExpression(zoneBusynessMap) 
          : '#088F8F'
      );
      map.setPaintProperty('zones-fill', 'fill-opacity', 
        (showZoneBusyness && Object.keys(zoneBusynessMap).length > 0) 
          ? createZoneOpacityExpression(zoneBusynessMap) 
          : 0.3
      );
    }
  }
}, [showZoneBusyness]);

  useEffect(() => {
  if (mapRef && Object.keys(zoneBusynessMap).length > 0) {
    // Force reload zones with new busyness data
    setZonesLoaded(false);
    loadManhattanZones();
  }
}, [zoneBusynessMap]);

  useEffect(() => {
    if (selectedLocation && currentLocation && currentLocation.coordinates) {
      fetchRoute(currentLocation.coordinates, selectedLocation.coordinates);
    } else {
      setRouteData(null);
      setRouteInfo(null);
    }
  }, [selectedLocation, currentLocation]);

  const handleCurrentLocationClick = () => {
    if (currentLocation && onMarkerClick) {
      onMarkerClick(currentLocation);
    }
  };

  const handleGPSClick = () => {
    if (currentLocation && currentLocation.coordinates && mapRef) {
      mapRef.flyTo({
        center: currentLocation.coordinates,
        zoom: 16,
        duration: 1000
      });
    }
  };

  const isCurrentLocationInLocations = currentLocation && locationsWithCoordinates.some(loc => 
    loc.id === currentLocation.id || 
    (loc.coordinates[0] === currentLocation.coordinates[0] && 
     loc.coordinates[1] === currentLocation.coordinates[1])
  );

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
      {error && (
        <div className="error-message" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      <BusynessHeader isVisible={showZoneBusyness} />
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
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer {...routeLayer} />
          </Source>
        )}

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

      <GPSButton 
        onClick={handleGPSClick}
        disabled={!currentLocation || !currentLocation.coordinates}
      />
      <ZoneBusynessToggle 
        isEnabled={showZoneBusyness}
        onToggle={() => setShowZoneBusyness(!showZoneBusyness)}
      />
    </div>
  );
}



export default MapPanel;