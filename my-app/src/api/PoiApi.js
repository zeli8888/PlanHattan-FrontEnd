// Enhanced API function with more configuration options
export async function makeApiRequest(poiTypeName, options = {}, utcTimestamp, currentLocation = null) {
    
    try {
        let defaultLatitude = '40.6991381066633';
        let defaultLongitude = '-74.0394915248490';
        
        if (currentLocation && currentLocation.coordinates) {
            defaultLongitude = currentLocation.coordinates[0].toString();
            defaultLatitude = currentLocation.coordinates[1].toString();
        }

        // Default options that can be overridden
        const defaultOptions = {
            dateTime: utcTimestamp || new Date().toISOString(), 
            limit: '100',
            transitType: 'walk',
            latitude: options.latitude || defaultLatitude,
            longitude: options.longitude || defaultLongitude
        };

        // Merge provided options with defaults
        const apiOptions = { ...defaultOptions, ...options };

        const params = new URLSearchParams({
            poiTypeName: poiTypeName,
            dateTime: apiOptions.dateTime,
            limit: apiOptions.limit,
            transitType: apiOptions.transitType,
            latitude: apiOptions.latitude,
            longitude: apiOptions.longitude
        });
        
        const url = `https://planhattan.ddns.net/api/pois?${params.toString()}`;
        
        console.log('Making request to:', url);
        console.log('Request parameters:', Object.fromEntries(params));
        console.log('Using current location:', currentLocation ? currentLocation.name : 'Default location');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if needed
            }
        });
                    
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        
        
        // Return the data so it can be used
        return data;
    } catch (error) {
        console.error('API Request failed:', {
            poiType: poiTypeName,
            error: error.message,
            stack: error.stack
        });
        throw error; // Re-throw so calling code can handle it
    }
}

// Utility function to get POI types mapping
export const POI_TYPES = {
    ATTRACTION: 'attraction',
    MUSEUM: 'museum',
    RESTAURANT: 'restaurant',
    BAR: 'bar',
    PUB: 'pub',
    CAFE: 'cafe',
    PARK: 'park'
};

// Helper functions updated to accept currentLocation parameter
export async function getAttractions(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.ATTRACTION, options, undefined, currentLocation);
}

export async function getMuseums(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.MUSEUM, options, undefined, currentLocation);
}

export async function getRestaurants(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.RESTAURANT, options, undefined, currentLocation);
}

export async function getCafes(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.CAFE, options, undefined, currentLocation);
}

export async function getBars(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.BAR, options, undefined, currentLocation);
}

export async function getPubs(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.PUB, options, undefined, currentLocation);
}

export async function getParks(options = {}, currentLocation = null) {
    return makeApiRequest(POI_TYPES.PARK, options, undefined, currentLocation);
}