import CategoryLayout from '../CategoryComponents/CategoryLayout';
import img1 from "../../../assests/brooklyn.jpg";
import img3 from "../../../assests/statue.jpg";
import img2 from "../../../assests/rockfellar.jpg";
import img4 from "../../../assests/times.jpg";
import { useMyPlans } from '../../../contexts/MyPlansProvider';
import { useLocation } from 'react-router-dom';

const AttractionData = [
  {
    id: 1,
    name: "Statue of Liberty",
    coordinates: [-73.9632, 40.7794],
    image: img1,
    location: "Liberty Island, NY",
    busy: "low",
    distance: "2km",
  },
  {
    id: 2,
    name: "Empire State Building",
    coordinates: [-74.0445, 40.6892],
    image: img2,
    location: "20 W 34th St, NY",
    busy: "high",
    distance: "14km",
  },
  {
    id: 3,
    name: "Empire State Building",
    coordinates: [-73.9632, 40.7794],
    image: img3,
    location: "20 W 34th St, NY",
    busy: "medium",
    distance: "6km",
  },
  {
    id: 4,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "low",
    distance: "1.5km",
  },

    {
    id: 5,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "low",
    distance: "1.5km",
  },
    {
    id: 6,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "low",
    distance: "1.5km",
  },
    {
    id: 7,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "medium",
    distance: "1.5km",
  },
    {
    id: 8,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "medium",
    distance: "1.5km",
  },
    {
    id: 9,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "medium",
    distance: "1.5km",
  },
    {
    id: 10,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "high",
    distance: "1.5km",
  },
    {
    id: 11,
    name: "Empire State Building",
    image: img4,
    location: "20 W 34th St, NY",
    busy: "high",
    distance: "1.5km",
  }
];

export default function Attractions() {
    const { addPlan } = useMyPlans();
    const { state } = useLocation();

    const locations = state?.pois 
    ? state.pois.map(poi => ({
        id: poi.id,
        name: poi.name,
        coordinates: [poi.longitude, poi.latitude],
        image: poi.imageUrl || '/default-landmark.jpg',
        location: poi.address || 'New York, NY',
        busy: `${poi.busyness || 50}%`,
        distance: `${poi.distance || 5}km`
      }))
    : AttractionData;

  return (
    <CategoryLayout 
      categoryName="attractions"
      displayName="Attractions"
      locations={locations}
      onAddToMyPlans={addPlan}
      showBusyness={true}
      showSorting={true}
      showDistance={true}
    />
  );
}