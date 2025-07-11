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
const FALLBACK_ATTRACTIONS = [
  {
    id: 1,
    name: "Statue of Liberty",
    coordinates: [-74.0445, 40.6892],
    image: img1,
    location: "Liberty Island, NY",
    busy: "low",
    distance: "2km",
    source: 'fallback'
  },
  {
    id: 2,
    name: "Empire State Building",
    coordinates: [-73.9857, 40.7484],
    image: img2,
    location: "20 W 34th St, NY",
    busy: "high",
    distance: "14km",
    source: 'fallback'
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    coordinates: [-73.9969, 40.7061],
    image: img3,
    location: "Brooklyn Bridge, NY",
    busy: "medium",
    distance: "6km",
    source: 'fallback'
  },
  {
    id: 4,
    name: "Times Square",
    coordinates: [-73.9855, 40.7580],
    image: img4,
    location: "Times Square, NY",
    busy: "high",
    distance: "15km",
    source: 'fallback'
  }
];

export default function Attractions() {
  const { addPlan } = useMyPlans();
  const { state } = useLocation();
  
  // Transform API data using the transformer
  const locations = PoiDataTransformer.transformApiResponse(
    state?.apiData,
    'attraction',
    FALLBACK_ATTRACTIONS
  );
  
  // Validate the transformed data
  const validatedLocations = PoiDataTransformer.validatePois(locations);
  
  // // Get statistics for debugging
  // const stats = PoiDataTransformer.getDataStats(validatedLocations);
  // console.log('Attractions data stats:', stats);
  
  // Show error message if API call failed
  if (state?.error) {
    console.warn('API Error for attractions:', state.error);
  }
  
  return (
    <CategoryLayout 
      categoryName="attractions"
      displayName="Attractions"
      locations={validatedLocations}
      onAddToMyPlans={addPlan}
      showBusyness={true}
      showSorting={true}
      showDistance={true}
    />
  );
}