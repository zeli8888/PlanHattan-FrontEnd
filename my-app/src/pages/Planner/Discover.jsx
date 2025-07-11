import PlannerLayout from './PlannerLayout';
import './Discover.css'
import { Search, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import InterestSelector from './InterestSelector';
import DateTimePicker from '../../components/dateTime/DateTimePicker';
import { useLocation } from '../../contexts/LocationContext';
import { useMyPlans } from '../../contexts/MyPlansProvider';
import postUserPlans from '../../api/userplans/AddUserPlansApi';

function Discover() {
  const { currentLocation, updateCurrentLocation } = useLocation();
  const { addPlan, plans } = useMyPlans();
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
  const [departureLocation, setDepartureLocation] = useState({});
  
  const searchInputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

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
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'photos', 'rating', 'types']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Generate a mock busyness prediction (you can replace this with actual API call)
          const mockBusyPercentage = Math.floor(Math.random() * 100) + '%';
          
          // Get area image (you can replace this with actual logic)
          const areaImage = place.photos && place.photos[0] 
            ? place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })
            : 'https://via.placeholder.com/200x200?text=No+Image';

          setSelectedPlace({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            coordinates: [place.geometry.location.lng(), place.geometry.location.lat()], // [lng, lat] for Mapbox
            rating: place.rating,
            types: place.types,
            photos: place.photos,
            location: place.formatted_address,
            image: areaImage,
            busy: mockBusyPercentage
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
              const mockBusyPercentage = Math.floor(Math.random() * 100) + '%';
              
              setSelectedPlace({
                id: result.place_id,
                name: searchQuery,
                address: result.formatted_address,
                coordinates: [location.lng(), location.lat()], // [lng, lat] for Mapbox
                location: result.formatted_address,
                image: 'https://via.placeholder.com/200x200?text=No+Image',
                busy: mockBusyPercentage
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
    }
  };

  // Handle add user plans - Make API call and add to local plans
  const handleAddUserPlans = async () => {
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
        departureLocation: departureLocation[selectedPlace.id] || (plans.length === 0 ? 'Current Location' : 'Home')
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
      
      alert('Plan added successfully!');
    } catch (error) {
      console.error('Error adding plan:', error);
      alert(`Error adding plan: ${error.message}`);
    }
  };

  // Locations to pass to PlannerLayout (including selected place)
  const locations = selectedPlace ? [selectedPlace] : [];

  return (
    <PlannerLayout locations={locations}>
      <div className='search-container'>
        <h1>Search a Place</h1>
        <p>Search places in Manhattan and add to MyPlans</p>
        
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
          <button className="btn" disabled={!selectedPlace}>
            Predict Busyness
          </button>
          <button className="btn" onClick={handleAddUserPlans} disabled={!selectedPlace || !title}>
            Add To MyPlans
          </button>
        </div>
      </div>
      <InterestSelector/>
    </PlannerLayout>
  );
}

export default Discover;