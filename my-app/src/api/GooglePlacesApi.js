// GooglePlacesImageService.js
class GooglePlacesImageService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * Get place photos using coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} placeName - Optional place name for better matching
   * @returns {Promise<string[]>} Array of photo URLs
   */
  async getPlacePhotos(lat, lng, placeName = null) {
    try {
      // Step 1: Find place using coordinates
      const placeId = await this.findPlaceByCoordinates(lat, lng, placeName);
      
      if (!placeId) {
        throw new Error('Place not found');
      }

      // Step 2: Get place details including photos
      const placeDetails = await this.getPlaceDetails(placeId);
      
      if (!placeDetails.photos || placeDetails.photos.length === 0) {
        throw new Error('No photos found for this place');
      }

      // Step 3: Convert photo references to URLs
      const photoUrls = placeDetails.photos.map(photo => 
        this.getPhotoUrl(photo.photo_reference, 400) // 400px width
      );

      return photoUrls;
    } catch (error) {
      console.error('Error fetching place photos:', error);
      return [];
    }
  }

  /**
   * Find place using coordinates (using Nearby Search)
   */
  async findPlaceByCoordinates(lat, lng, placeName = null) {
    const radius = 50; // 50 meters radius
    const url = `${this.baseUrl}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error('No places found nearby');
      }

      // If place name is provided, try to find exact match
      if (placeName) {
        const exactMatch = data.results.find(place => 
          place.name.toLowerCase().includes(placeName.toLowerCase()) ||
          placeName.toLowerCase().includes(place.name.toLowerCase())
        );
        if (exactMatch) {
          return exactMatch.place_id;
        }
      }

      // Return the first result if no exact match
      return data.results[0].place_id;
    } catch (error) {
      console.error('Error finding place by coordinates:', error);
      return null;
    }
  }

  /**
   * Get detailed place information including photos
   */
  async getPlaceDetails(placeId) {
    const fields = 'photos,name,formatted_address';
    const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`API Error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  /**
   * Generate photo URL from photo reference
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Batch process multiple locations
   */
  async getPhotosForMultiplePlaces(places) {
    const results = [];
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < places.length; i += batchSize) {
      const batch = places.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (place) => {
        const [lng, lat] = place.coordinates;
        const photos = await this.getPlacePhotos(lat, lng, place.name);
        return {
          placeId: place.id,
          photos: photos
        };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to get photos for place ${batch[index].name}:`, result.reason);
          results.push({
            placeId: batch[index].id,
            photos: []
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < places.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export default GooglePlacesImageService;