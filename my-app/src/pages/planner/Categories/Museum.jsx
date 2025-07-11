import CategoryLayout from '../CategoryComponents/CategoryLayout';
import PoiDataTransformer from '../CategoryComponents/PoiDataTransformer';
import { useMyPlans } from '../../../contexts/MyPlansProvider';
import { useLocation } from 'react-router-dom';

// Import default images
import img1 from "../../../assests/brooklyn.jpg";
import img2 from "../../../assests/rockfellar.jpg";
import img3 from "../../../assests/statue.jpg";
import img4 from "../../../assests/times.jpg";

// Fallback data for when API fails
const FALLBACK_MUSEUMS = [
  {
    id: 1,
    name: "Metropolitan Museum of Art",
    coordinates: [-73.9632, 40.7794],
    image: img1,
    location: "1000 5th Ave, NY",
    busy: "high",
    distance: "12km",
    source: 'fallback'
  },
  {
    id: 2,
    name: "Museum of Modern Art",
    coordinates: [-73.9776, 40.7614],
    image: img2,
    location: "11 W 53rd St, NY",
    busy: "medium",
    distance: "10km",
    source: 'fallback'
  },
  {
    id: 3,
    name: "American Museum of Natural History",
    coordinates: [-73.9741, 40.7813],
    image: img3,
    location: "200 Central Park West, NY",
    busy: "high",
    distance: "13km",
    source: 'fallback'
  },
  {
    id: 4,
    name: "Guggenheim Museum",
    coordinates: [-73.9590, 40.7829],
    image: img4,
    location: "1071 5th Ave, NY",
    busy: "low",
    distance: "12km",
    source: 'fallback'
  }
];

export default function Museums() {
  const { addPlan } = useMyPlans();
  const { state } = useLocation();
  
  // Debug: Confirm component is rendering
  console.log('🏛️ Museums component rendered');
  console.log('Museums component state:', state);
  console.log('API data:', state?.apiData);
  
  // Specifically log the API response structure
  if (state?.apiData) {
    console.log('busynessDistanceRecommendationDTOS:', state.apiData.busynessDistanceRecommendationDTOS);
    console.log('First museum item:', state.apiData.busynessDistanceRecommendationDTOS?.[0]);
  }
  
  // Transform API data using the transformer
  const locations = PoiDataTransformer.transformApiResponse(
    state?.apiData,
    'museum', // Use singular 'museum' to match your POI_TYPES
    FALLBACK_MUSEUMS
  );
  
  // Validate the transformed data
  const validatedLocations = PoiDataTransformer.validatePois(locations);
  
  // Get statistics for debugging
  const stats = PoiDataTransformer.getDataStats(validatedLocations);
  console.log('Museums data stats:', stats);
  
  // Show error message if API call failed
  if (state?.error) {
    console.warn('API Error for museums:', state.error);
  }
  
  return (
    <CategoryLayout 
      categoryName="museum"
      displayName="Museums"
      locations={validatedLocations}
      onAddToMyPlans={addPlan}
      showBusyness={true}
      showSorting={true}
      showDistance={true}
    />
  );
}