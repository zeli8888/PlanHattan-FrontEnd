import { useContext } from "react";

// Enhanced API function with more configuration options
export async function makeApiRequest(poiTypeName, options = {}) {
    
    try {
        // Default options that can be overridden
        const defaultOptions = {
            dateTime: new Date().toISOString(),
            limit: '30',
            transitType: 'walk',
            latitude: '40.6991381066633',
            longitude: '-74.0394915248490'
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
        
        // Log to console with structured information
        console.log('API Response received:', {
            poiType: poiTypeName,
            recordCount: data.busynessDistanceRecommendationDTOS?.length || data.pois?.length || 'unknown',
            data: data
        });
        
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

// Helper function for common use cases
export async function getAttractions(options = {}) {
    return makeApiRequest(POI_TYPES.ATTRACTION, options);
}

export async function getMuseums(options = {}) {
    return makeApiRequest(POI_TYPES.MUSEUM, options);
}

export async function getRestaurants(options = {}) {
    return makeApiRequest(POI_TYPES.RESTAURANT, options);
}

export async function getCafes(options = {}) {
    return makeApiRequest(POI_TYPES.CAFE, options);
}

export async function getBars(options = {}) {
    return makeApiRequest(POI_TYPES.BAR, options);
}

export async function getPubs(options = {}) {
    return makeApiRequest(POI_TYPES.PUB, options);
}

export async function getParks(options = {}) {
    return makeApiRequest(POI_TYPES.PARK, options);
}