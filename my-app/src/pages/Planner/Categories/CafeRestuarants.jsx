import CategoryLayout from '../CategoryComponents/CategoryLayout';
import img1 from "../../../assests/brooklyn.jpg";
import img3 from "../../../assests/statue.jpg";

const CafeRestuarantsData = [
  {
    id: 1,
    name: "Statue of Liberty",
    image: img1,
    location: "Liberty Island, NY",
    busy: "50%",
    distance: "2km",
  },
  {
    id: 2,
    name: "Empire State Building",
    image: img3,
    location: "20 W 34th St, NY",
    busy: "85%",
    distance: "14km",
  },
  {
    id: 3,
    name: "Empire State Building",
    image: img3,
    location: "20 W 34th St, NY",
    busy: "24%",
    distance: "6km",
  },
  {
    id: 4,
    name: "Empire State Building",
    image: img3,
    location: "20 W 34th St, NY",
    busy: "40%",
    distance: "1.5km",
  }
];

export default function CafeRestuarants() {
  return (
    <CategoryLayout 
      categoryName="Cafe-Restuarants"
      displayName="Cafe & Restuarants"
      locations={CafeRestuarantsData}
    />
  );
}