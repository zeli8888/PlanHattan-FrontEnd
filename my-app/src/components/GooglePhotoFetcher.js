// Google Places Photos Fetcher
// This function fetches photos of a place using Google Places API with latitude and longitude

/**
 * Fetches photos of a place from Google Places API using coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {Object} options - Additional options
 * @param {number} options.maxPhotos - Maximum number of photos to fetch (default: 10)
 * @param {number} options.maxWidth - Maximum width for photos (default: 1200)
 * @param {number} options.maxHeight - Maximum height for photos (default: 800)
 * @param {number} options.radius - Search radius in meters (default: 50)
 * @param {string} options.apiKey - Google Places API key (optional, will use env var if not provided)
 * @returns {Promise<Object>} Object containing photos and place information
 */
async function fetchPlacePhotos(latitude, longitude, options = {}) {
  const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const {
    maxPhotos = 10,
    maxWidth = 1200,
    maxHeight = 800,
    radius = 50
  } = options;

  // Check if API key is available
  if (!apiKey) {
    console.error('Google Places API key is not provided');
    return {
      success: false,
      error: 'Google Places API key is not configured',
      photos: [],
      totalPhotos: 0,
      photosReturned: 0
    };
  }

  // Validate coordinates
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('Invalid coordinates provided:', { latitude, longitude });
    return {
      success: false,
      error: 'Invalid coordinates provided',
      photos: [],
      totalPhotos: 0,
      photosReturned: 0
    };
  }

  try {
    // Step 1: Find the place using Nearby Search
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;
    
    const nearbyResponse = await fetch(nearbySearchUrl);
    
    if (!nearbyResponse.ok) {
      throw new Error(`HTTP error! status: ${nearbyResponse.status}`);
    }
    
    const nearbyData = await nearbyResponse.json();

    if (nearbyData.status !== 'OK') {
      throw new Error(`Nearby search failed: ${nearbyData.status} - ${nearbyData.error_message || 'Unknown error'}`);
    }

    if (!nearbyData.results || nearbyData.results.length === 0) {
      throw new Error('No places found at the specified coordinates');
    }

    // Get the closest place (first result is usually the closest)
    const place = nearbyData.results[0];
    const placeId = place.place_id;

    // Step 2: Get place details including photos
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos,formatted_address,rating,user_ratings_total,types,geometry&key=${apiKey}`;
    
    const detailsResponse = await fetch(placeDetailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error(`HTTP error! status: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      throw new Error(`Place details failed: ${detailsData.status} - ${detailsData.error_message || 'Unknown error'}`);
    }

    const placeDetails = detailsData.result;

    // Step 3: Process photos if available
    let photoUrls = [];
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photosToProcess = placeDetails.photos.slice(0, maxPhotos);
      
      photoUrls = photosToProcess.map(photo => {
        const photoReference = photo.photo_reference;
        return {
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photoreference=${photoReference}&key=${apiKey}`,
          attribution: photo.html_attributions || [],
          width: photo.width,
          height: photo.height
        };
      });
    }

    // Return comprehensive result
    return {
      success: true,
      place: {
        id: placeId,
        name: placeDetails.name,
        address: placeDetails.formatted_address,
        rating: placeDetails.rating,
        totalRatings: placeDetails.user_ratings_total,
        types: placeDetails.types,
        coordinates: {
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng
        }
      },
      photos: photoUrls,
      totalPhotos: placeDetails.photos ? placeDetails.photos.length : 0,
      photosReturned: photoUrls.length
    };

  } catch (error) {
    console.error('Error fetching place photos:', error);
    return {
      success: false,
      error: error.message,
      photos: [],
      totalPhotos: 0,
      photosReturned: 0
    };
  }
}

/**
 * Alternative function using Text Search if you want to search by place name as well
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} placeName - Optional place name to improve search accuracy
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Object containing photos and place information
 */
async function fetchPlacePhotosByName(latitude, longitude, placeName = null, options = {}) {
  const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const {
    maxPhotos = 10,
    maxWidth = 1200,
    maxHeight = 800,
    radius = 1000
  } = options;

  // Check if API key is available
  if (!apiKey) {
    console.error('Google Places API key is not provided');
    return {
      success: false,
      error: 'Google Places API key is not configured',
      photos: [],
      totalPhotos: 0,
      photosReturned: 0
    };
  }

  try {
    let searchUrl;
    
    if (placeName) {
      // Use Text Search with location bias
      searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;
    } else {
      // Use Nearby Search
      searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50&key=${apiKey}`;
    }

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK') {
      throw new Error(`Search failed: ${searchData.status} - ${searchData.error_message || 'Unknown error'}`);
    }

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No places found');
    }

    // Find the closest place to the provided coordinates
    const targetLat = parseFloat(latitude);
    const targetLng = parseFloat(longitude);
    
    const closestPlace = searchData.results.reduce((closest, current) => {
      const currentDistance = getDistance(
        targetLat, 
        targetLng, 
        current.geometry.location.lat, 
        current.geometry.location.lng
      );
      
      const closestDistance = getDistance(
        targetLat, 
        targetLng, 
        closest.geometry.location.lat, 
        closest.geometry.location.lng
      );
      
      return currentDistance < closestDistance ? current : closest;
    });

    // Get detailed information including photos
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${closestPlace.place_id}&fields=name,photos,formatted_address,rating,user_ratings_total,types,geometry,opening_hours,formatted_phone_number,website&key=${apiKey}`;
    
    const detailsResponse = await fetch(placeDetailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      throw new Error(`Place details failed: ${detailsData.status}`);
    }

    const placeDetails = detailsData.result;

    // Process photos
    let photoUrls = [];
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photosToProcess = placeDetails.photos.slice(0, maxPhotos);
      
      photoUrls = photosToProcess.map(photo => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photoreference=${photo.photo_reference}&key=${apiKey}`,
        attribution: photo.html_attributions || [],
        width: photo.width,
        height: photo.height
      }));
    }

    return {
      success: true,
      place: {
        id: closestPlace.place_id,
        name: placeDetails.name,
        address: placeDetails.formatted_address,
        rating: placeDetails.rating,
        totalRatings: placeDetails.user_ratings_total,
        types: placeDetails.types,
        coordinates: {
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng
        },
        phone: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        openingHours: placeDetails.opening_hours
      },
      photos: photoUrls,
      totalPhotos: placeDetails.photos ? placeDetails.photos.length : 0,
      photosReturned: photoUrls.length
    };

  } catch (error) {
    console.error('Error fetching place photos:', error);
    return {
      success: false,
      error: error.message,
      photos: [],
      totalPhotos: 0,
      photosReturned: 0
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Utility function to preload images
 * @param {Array} photoUrls - Array of photo URL objects
 * @returns {Promise<Array>} Promise that resolves when all images are loaded
 */
async function preloadPhotos(photoUrls) {
  const imagePromises = photoUrls.map(photo => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({
        ...photo,
        loaded: true,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      img.onerror = () => resolve({
        ...photo,
        loaded: false,
        error: 'Failed to load image'
      });
      img.src = photo.url;
    });
  });

  return Promise.all(imagePromises);
}

// Export functions for use in modules
export { 
  fetchPlacePhotos, 
  fetchPlacePhotosByName, 
  preloadPhotos, 
  getDistance 
};