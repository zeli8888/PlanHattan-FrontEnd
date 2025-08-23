import PlannerLayout from '../PlannerLayout';
import './Discover.css'
import { Search, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import InterestSelector from './InterestSelector';
import DateTimePicker from '../../../components/dateTime/DateTimePicker';
import { useCurrentLocation } from '../../../contexts/LocationContext';
import { useMyPlans } from '../../../contexts/MyPlansProvider';
import { useZoneBusyness } from '../../../contexts/ZoneBusynessContext';
import postUserPlans from '../../../api/userplans/AddUserPlansApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useNotification from '../../../components/features/useNotification';
import Notification from '../../../components/features/Notification';

function Discover() {
  const { currentLocation, updateCurrentLocation } = useCurrentLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addPlan, plans } = useMyPlans();
  const { zoneBusynessMap, isLoading: isLoadingZoneData, error: zoneError, refreshIfStale } = useZoneBusyness();
  const { notification, showNotification, hideNotification } = useNotification();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: 11,
      minutes: 30,
      period: 'PM'
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [title, setTitle] = useState('');

  const searchInputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  const [predictionStatus, setPredictionStatus] = useState({
    isLoading: false,
    busynessLevel: null,
    error: null
  });

  const getBusynessButtonColor = (busynessLevel) => {
    const colors = {
      low: '#52c41a',      // Green
      medium: '#faad14',   // Yellow/Orange
      high: '#ff4d4f'      // Red
    };

    return colors[busynessLevel?.toLowerCase()] || '#4a54e1'; // Default blue
  };

  const getPredictionButtonText = () => {
    if (predictionStatus.isLoading) {
      return 'Predicting...';
    }

    if (predictionStatus.busynessLevel) {
      return `${predictionStatus.busynessLevel.toUpperCase()} Busyness`;
    }

    if (predictionStatus.error) {
      return 'Prediction Failed';
    }

    return 'Predict Busyness';
  };
  // Refresh zone data if stale on component mount
  useEffect(() => {
    refreshIfStale(30); // Refresh if data is older than 30 minutes
  }, [refreshIfStale]);

  // Initialize Google Places services
  useEffect(() => {
    // Load Google Places API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.onload = () => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
      };
      document.head.appendChild(script);
    } else {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear selected place and title when search is cleared
    if (value.trim() === '') {
      setSelectedPlace(null);
      setTitle('');
      setPredictionStatus({
        isLoading: false,
        busynessLevel: null,
        error: null
      });
    }

    if (value.length > 2 && autocompleteService.current) {
      const request = {
        input: value,
        types: ['establishment', 'geocode'],
        // Limit search to Manhattan only
        componentRestrictions: { country: 'us' },
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(40.7000, -74.0200), // Southwest corner of Manhattan
          new window.google.maps.LatLng(40.8200, -73.9300)  // Northeast corner of Manhattan
        ),
        strictBounds: true // Enforce bounds strictly
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter results to ensure they're specifically in Manhattan
          const filteredPredictions = predictions.filter(prediction => {
            const description = prediction.description.toLowerCase();
            return description.includes('manhattan') ||
              description.includes('new york, ny') ||
              (description.includes('new york') && !description.includes('brooklyn') &&
                !description.includes('queens') && !description.includes('bronx') &&
                !description.includes('staten island'));
          });
          setPredictions(filteredPredictions);
          setShowPredictions(filteredPredictions.length > 0);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Handle place selection
  const handlePlaceSelect = (prediction) => {
    setSearchQuery(prediction.description);
    setShowPredictions(false);

    if (placesService.current) {
      const request = {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'rating', 'types']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {

          // Get coordinates
          const coordinates = place.geometry && place.geometry.location
            ? [place.geometry.location.lng(), place.geometry.location.lat()]
            : null;

          // Get area image
          const areaImage = place.photos && place.photos[0]
            ? place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })
            : 'https://via.placeholder.com/200x200?text=No+Image';

          setSelectedPlace({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            types: place.types,
            photos: place.photos,
            location: place.formatted_address,
            image: areaImage,
            coordinates: coordinates, // Add coordinates here
          });

          // Auto-fill title if empty
          if (!title) {
            setTitle(place.name);
          }
        }
      });
    }
  };

  // Handle direct search (when clicking search icon)
  const handleSearch = () => {
    if (searchQuery.trim() && !selectedPlace) {
      // If no place selected but query exists, try to geocode within Manhattan bounds
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(40.7000, -74.0200), // Southwest corner of Manhattan
          new window.google.maps.LatLng(40.8200, -73.9300)  // Northeast corner of Manhattan
        );

        geocoder.geocode({
          address: searchQuery + ', Manhattan, New York, NY',
          bounds: bounds,
          componentRestrictions: { country: 'us' }
        }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const result = results[0];
            // Check if result is within Manhattan bounds
            const location = result.geometry.location;
            if (bounds.contains(location)) {

              setSelectedPlace({
                id: result.place_id,
                name: searchQuery,
                address: result.formatted_address,
                location: result.formatted_address,
                image: 'https://via.placeholder.com/200x200?text=No+Image',
              });

              if (!title) {
                setTitle(searchQuery);
              }
            } else {
              alert('Please search for locations within Manhattan only.');
            }
          } else {
            alert('Location not found in Manhattan. Please try a different search.');
          }
        });
      }
    }
  };

  // Handle set as current location
  const handleSetCurrentLocation = () => {
    if (selectedPlace) {
      updateCurrentLocation(selectedPlace);
      showNotification(
        'success',
        'Current Location Set',
        `${selectedPlace.name} has been set as your current location.`
      );
    }
  };

  /**
  * Determines if a point is inside a polygon using ray casting algorithm
 * @param {Array} point - [longitude, latitude]
 * @param {Array} polygon - Array of [longitude, latitude] coordinates
 * @returns {boolean} - True if point is inside polygon
 */
  function isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }
  /**
 * Finds which zone contains the given coordinates
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} geojsonData - GeoJSON data with zone features
 * @returns {Object|null} - Zone feature or null if not found
 */
  function findZoneForCoordinates(coordinates, geojsonData) {
    if (!coordinates || !geojsonData || !geojsonData.features) {
      return null;
    }

    const [longitude, latitude] = coordinates;

    for (const feature of geojsonData.features) {
      const geometry = feature.geometry;

      if (geometry.type === 'Polygon') {
        // For Polygon, check the outer ring (first coordinate array)
        const polygon = geometry.coordinates[0];
        if (isPointInPolygon([longitude, latitude], polygon)) {
          return feature;
        }
      } else if (geometry.type === 'MultiPolygon') {
        // For MultiPolygon, check each polygon
        for (const polygonCoords of geometry.coordinates) {
          const polygon = polygonCoords[0]; // Outer ring
          if (isPointInPolygon([longitude, latitude], polygon)) {
            return feature;
          }
        }
      }
    }

    return null;
  }

  const handlePredictBusyness = async () => {
    if (!selectedPlace) {
      console.log('No place selected');
      return;
    }

    try {
      console.log(zoneBusynessMap)
      // Get coordinates from selected place
      let coordinates = null;

      if (selectedPlace.coordinates) {
        coordinates = selectedPlace.coordinates;
      } else if (placesService.current) {
        // If coordinates not available, get them from Google Places
        const request = {
          placeId: selectedPlace.id,
          fields: ['geometry']
        };

        const placeDetails = await new Promise((resolve, reject) => {
          placesService.current.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(place);
            } else {
              reject(new Error('Failed to get place details'));
            }
          });
        });

        if (placeDetails.geometry && placeDetails.geometry.location) {
          coordinates = [
            placeDetails.geometry.location.lng(),
            placeDetails.geometry.location.lat()
          ];

          // Update selected place with coordinates
          setSelectedPlace(prev => ({
            ...prev,
            coordinates: coordinates
          }));
        }
      }

      if (!coordinates) {
        console.log('Unable to get coordinates for the selected place');
        return;
      }

      let geojsonData;
      try {
        const response = await fetch(import.meta.env.VITE_REACT_APP_CONTEXT + '/zones_with_busyness.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        geojsonData = await response.json();
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        return;
      }

      // Find which zone contains the coordinates
      const containingZone = findZoneForCoordinates(coordinates, geojsonData);

      if (containingZone) {
        // Get zone ID from properties
        const zoneId = containingZone.properties.LocationID || containingZone.properties.locationID;
        const zoneName = containingZone.properties.zone || containingZone.properties.Zone;


        // Get busyness level from zoneBusynessMap
        const busynessLevel = zoneBusynessMap[zoneId];

        if (busynessLevel) {

          setSelectedPlace(prev => ({
            ...prev,
            busy: busynessLevel,
            zoneId: zoneId,
            zoneName: zoneName,
            coordinates: coordinates
          }));

          setPredictionStatus({
            isLoading: false,
            busynessLevel: busynessLevel,
            error: null
          });
        } else {
          console.log('No busyness data available for zone:', zoneId);
        }
      } else {
        console.log('Coordinates not found in any zone:', coordinates);
      }

    } catch (error) {
      console.error('Error predicting busyness:', error);
    }
  };

  const handleSignInClick = () => {
    // Store current location to redirect back after sign in
    navigate('/signin', {
      state: { from: '/plan' }
    });
  };

  const handleAddUserPlans = async () => {
    if (!isAuthenticated) {
      handleSignInClick()
    }
    if (!selectedPlace || !title) {
      return;
    }

    try {
      // Convert time to UTC
      const localDateTime = new Date(dateTime.date);
      let hours = dateTime.time.hours;

      // Convert to 24-hour format
      if (dateTime.time.period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (dateTime.time.period === 'AM' && hours === 12) {
        hours = 0;
      }

      localDateTime.setHours(hours, dateTime.time.minutes, 0, 0);
      const utcTime = localDateTime.toISOString();

      // Prepare plan data for API
      const planData = {
        place: selectedPlace.name,
        time: utcTime,
        predicted: selectedPlace.busy,
        coordinates: selectedPlace.coordinates
      };

      // Make API call
      const response = await postUserPlans(planData);
      console.log(planData)
      console.log('Plan added successfully:', response);

      // Add to local plans context
      addPlan({
        placeId: selectedPlace.id,
        place: selectedPlace.name,
        area: selectedPlace.location,
        areaImage: selectedPlace.image,
        date: dateTime.date.toLocaleDateString(),
        time: `${dateTime.time.hours}:${dateTime.time.minutes.toString().padStart(2, '0')} ${dateTime.time.period}`,
        predicted: selectedPlace.busy,
        coordinates: selectedPlace.coordinates,
      });

      // Clear form after successful addition
      setSearchQuery('');
      setSelectedPlace(null);
      setTitle('');
      setDateTime({
        date: new Date(),
        time: {
          hours: 11,
          minutes: 30,
          period: 'PM'
        }
      });

      // Show success notification
      showNotification(
        'success',
        'Plan Added',
        `${selectedPlace.name} has been successfully added to your plans.`
      );
    } catch (error) {
      console.error('Error adding plan:', error);

      // Show error notification
      showNotification(
        'error',
        'Failed to Add Plan',
        'Unable to add the plan. Please try again.'
      );
    }
  }

  // Locations to pass to PlannerLayout (including selected place)
  const locations = selectedPlace ? [selectedPlace] : [];

  return (
    <PlannerLayout locations={locations} zoneBusynessMap={zoneBusynessMap}>
      <div className='search-container'>
        <h1>Search a Place</h1>
        <p>Search places in Manhattan and add to MyPlans</p>

        {/* Zone data loading indicator */}
        {isLoadingZoneData && (
          <div className="zone-data-loading">
            Loading zone busyness data...
          </div>
        )}

        {/* Zone data error indicator */}
        {zoneError && (
          <div className="zone-data-error">
            Error loading zone data: {zoneError}
          </div>
        )}

        {/* Current Location Display */}
        {currentLocation && (
          <div className="current-location-display">
            <MapPin size={16} />
            <span>Current Location: {currentLocation.name}</span>
          </div>
        )}

        <div className='search-box'>
          <input
            ref={searchInputRef}
            type="text"
            placeholder='Search places in Manhattan...'
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            style={{ width: '80%' }} // Reduced by 20%
          />
          <button
            className="location-btn"
            onClick={handleSetCurrentLocation}
            disabled={!selectedPlace}
            title="Set as current location"
          >
            <MapPin size={18} />
            Set as Current Location
          </button>

          {/* Predictions dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div className="predictions-dropdown">
              {predictions.map((prediction, index) => (
                <div
                  key={prediction.place_id}
                  className="prediction-item"
                  onClick={() => handlePlaceSelect(prediction)}
                >
                  <div className="prediction-main">{prediction.structured_formatting.main_text}</div>
                  <div className="prediction-secondary">{prediction.structured_formatting.secondary_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='title-time'>
          <div className='title-container'>
            <h3>Add Title</h3>
            <div className="input-box">
              <input
                type="text"
                placeholder="Eg. House, office"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="time-container">
            <h3>Add Time slot</h3>
            <DateTimePicker
              value={dateTime}
              onChange={setDateTime}
            />
          </div>
        </div>
        <div className="buttons">
          <button
            className="btn"
            onClick={handlePredictBusyness}
            disabled={!selectedPlace || predictionStatus.isLoading}
            style={{
              backgroundColor: !selectedPlace
                ? '#c0c0c0' // Light gray when disabled
                : predictionStatus.busynessLevel
                  ? getBusynessButtonColor(predictionStatus.busynessLevel)
                  : (predictionStatus.error ? '#ff4d4f' : '#4a54e1'),
              color: !selectedPlace ? '#888' : 'white',
              border: 'none',
              transition: 'all 0.3s ease',
              opacity: predictionStatus.isLoading ? 0.7 : (!selectedPlace ? 0.6 : 1),
              cursor: (!selectedPlace || predictionStatus.isLoading) ? 'not-allowed' : 'pointer'
            }}>
            {getPredictionButtonText()}
          </button>

          <button
            className="btn"
            onClick={handleAddUserPlans}
            disabled={!selectedPlace || !title}
            style={{
              backgroundColor: (!selectedPlace || !title) ? '#c0c0c0' : '#4a54e1',
              color: (!selectedPlace || !title) ? '#888' : 'white',
              border: 'none',
              transition: 'all 0.3s ease',
              opacity: (!selectedPlace || !title) ? 0.6 : 1,
              cursor: (!selectedPlace || !title) ? 'not-allowed' : 'pointer'
            }}>
            Add To MyPlans
          </button>
        </div>
      </div>
      <InterestSelector />
      <Notification
        notification={notification}
        onClose={hideNotification}
      />
    </PlannerLayout>
  );
}

export default Discover;