import img1 from "../../../assests/brooklyn.jpg";
import img2 from "../../../assests/rockfellar.jpg";
import img3 from "../../../assests/statue.jpg";
import img4 from "../../../assests/times.jpg";

const DEFAULT_IMAGES = {
  attraction: [img1, img2, img3, img4],
  museum: [img1, img2, img3, img4],
  restaurant: [img1, img2, img3, img4],
  cafe: [img1, img2, img3, img4],
  bar: [img1, img2, img3, img4],
  pub: [img1, img2, img3, img4],
  park: [img1, img2, img3, img4]
};

const mapBusynessValue = (value) => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['low', 'medium', 'high'].includes(normalized)) {
      return normalized;
    }
  }
  if (typeof value === 'number') {
    if (value <= 33) return 'low';
    if (value <= 66) return 'medium';
    return 'high';
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num <= 33) return 'low';
      if (num <= 66) return 'medium';
      return 'high';
    }
  }
  return 'medium';
};

const formatDistance = (distance) => {
  if (typeof distance === 'number') {
    if (distance > 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance.toFixed(0)}km`;
  }
  if (typeof distance === 'string') {
    if (distance.includes('km') || distance.includes('mi') || distance.includes('m')) {
      return distance;
    }
    const num = parseFloat(distance);
    if (!isNaN(num)) {
      if (num > 1000) {
        return `${(num / 1000).toFixed(1)}km`;
      }
      return `${num.toFixed(0)}m`;
    }
    return distance;
  }
  return '5km';
};

const getDefaultImage = (category, index) => {
  const images = DEFAULT_IMAGES[category] || DEFAULT_IMAGES.attraction;
  return images[index % images.length];
};

const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatCoordinates = (poiData) => {
  const poi = poiData.poi || poiData;
  const lng = poi.longitude || poi.lng || poi.lon || -74.0060;
  const lat = poi.latitude || poi.lat || 40.7128;
  const longitude = typeof lng === 'number' ? lng : parseFloat(lng) || -74.0060;
  const latitude = typeof lat === 'number' ? lat : parseFloat(lat) || 40.7128;
  return [longitude, latitude];
};

class PoiDataTransformer {
  static transformApiResponse(apiResponse, category, fallbackData = []) {
    if (!apiResponse) {
      console.log('No API response, using fallback data');
      return fallbackData;
    }

    let rawPois = [];
    if (apiResponse.busynessDistanceRecommendationDTOS) {
      rawPois = apiResponse.busynessDistanceRecommendationDTOS;
    } else if (apiResponse.pois) {
      rawPois = apiResponse.pois;
    } else if (Array.isArray(apiResponse)) {
      rawPois = apiResponse;
    } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
      rawPois = apiResponse.data;
    } else {
      return fallbackData;
    }

    if (!Array.isArray(rawPois) || rawPois.length === 0) {
      console.log('No POIs found in API response, using fallback data');
      return fallbackData;
    }

    const transformedPois = rawPois.map((item, index) => {
      try {
        const poi = item.poi || item;
        return {
          id: poi.poiId || poi.id || `api_poi_${index + 1}`,
          zoneId: poi.zone.zoneId,
          name: capitalizeWords(poi.poiName || poi.name || poi.title || `${category} ${index + 1}`),
          coordinates: formatCoordinates(item),
          image: poi.imageUrl || poi.image || poi.photo || getDefaultImage(category, index),
          location: poi.address || poi.location || poi.vicinity || 'New York, NY',
          busy: mapBusynessValue(item.busyness || item.busy || poi.busyness || poi.busy || poi.crowdedness || 'medium'),
          distance: formatDistance(item.distance || poi.distance || 5),
          category: category,
          rating: poi.userRating,
          source: 'api',
          ...(item.recommendation && { recommendation: item.recommendation }),
          ...(poi.poiDescription && { description: poi.poiDescription })
        };
      } catch (error) {
        console.error('Error transforming POI:', item, error);
        return {
          id: `error_poi_${index + 1}`,
          name: capitalizeWords(`${category} ${index + 1}`),
          coordinates: [-74.0060, 40.7128],
          image: getDefaultImage(category, index),
          location: 'New York, NY',
          busy: 'medium',
          distance: '5km',
          category: category,
          source: 'fallback'
        };
      }
    });
    return transformedPois;
  }

  static validatePois(pois) {
    if (!Array.isArray(pois)) {
      console.error('POIs must be an array');
      return [];
    }

    return pois.filter(poi => {
      const isValid = (
        poi.id &&
        poi.name &&
        Array.isArray(poi.coordinates) &&
        poi.coordinates.length === 2 &&
        poi.image &&
        poi.location &&
        poi.busy &&
        poi.distance
      );

      if (!isValid) {
        console.warn('Invalid POI filtered out:', poi);
      }

      return isValid;
    });
  }

  static getDataStats(pois) {
    if (!Array.isArray(pois)) return {};

    const stats = {
      total: pois.length,
      sources: {},
      busyness: { low: 0, medium: 0, high: 0 },
      hasCoordinates: 0,
      hasImages: 0,
      hasRatings: 0
    };

    pois.forEach(poi => {
      stats.sources[poi.source] = (stats.sources[poi.source] || 0) + 1;
      if (poi.busy && stats.busyness[poi.busy] !== undefined) {
        stats.busyness[poi.busy]++;
      }
      if (poi.coordinates && poi.coordinates.length === 2) stats.hasCoordinates++;
      if (poi.image) stats.hasImages++;
      if (poi.rating) stats.hasRatings++;
    });

    return stats;
  }
}

export default PoiDataTransformer;
