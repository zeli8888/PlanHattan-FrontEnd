import CategoryLayout from '../CategoryComponents/CategoryLayout';

const RestuarantsData = [
{    id: 1,
    name: "Statue of Liberty",
    coordinates: [-74.0445, 40.6892],
    image: "statue-liberty.jpg",
    location: "Liberty Island, NY",
    busy: "78%",
    distance: "5.2km"
  },
  {
    id: 2,
    name: "Empire State Building",
    coordinates: [-73.9857, 40.7484],
    image: "empire-state.jpg",
    location: "20 W 34th St, NY",
    busy: "65%",
    distance: "1.8km"
  },
  {
    id: 3,
    name: "Times Square",
    coordinates: [-73.9851, 40.7580],
    image: "times-square.jpg",
    location: "Manhattan, NY",
    busy: "92%",
    distance: "0.5km"
  },
  {
    id: 4,
    name: "Central Park",
    coordinates: [-73.9654, 40.7829],
    image: "central-park.jpg",
    location: "Manhattan, NY",
    busy: "45%",
    distance: "3.1km"
  },
  {
    id: 5,
    name: "Brooklyn Bridge",
    coordinates: [-73.9969, 40.7061],
    image: "brooklyn-bridge.jpg",
    location: "New York, NY",
    busy: "60%",
    distance: "2.7km"
  },
  {
    id: 6,
    name: "Metropolitan Museum of Art",
    coordinates: [-73.9632, 40.7794],
    image: "met-museum.jpg",
    location: "1000 5th Ave, NY",
    busy: "55%",
    distance: "4.3km"
  },
  {
    id: 7,
    name: "One World Trade Center",
    coordinates: [-74.0134, 40.7127],
    image: "one-world.jpg",
    location: "285 Fulton St, NY",
    busy: "70%",
    distance: "6.0km"
  },
  {
    id: 8,
    name: "Rockefeller Center",
    coordinates: [-73.9787, 40.7587],
    image: "rockefeller.jpg",
    location: "45 Rockefeller Plaza, NY",
    busy: "75%",
    distance: "1.2km"
  },
  {
    id: 9,
    name: "Grand Central Terminal",
    coordinates: [-73.9772, 40.7527],
    image: "grand-central.jpg",
    location: "89 E 42nd St, NY",
    busy: "85%",
    distance: "0.8km"
  },
  {
    id: 10,
    name: "The High Line",
    coordinates: [-74.0047, 40.7480],
    image: "high-line.jpg",
    location: "New York, NY",
    busy: "40%",
    distance: "3.5km"
  },
  {
    id: 11,
    name: "American Museum of Natural History",
    coordinates: [-73.9740, 40.7813],
    image: "natural-history.jpg",
    location: "200 Central Park West, NY",
    busy: "50%",
    distance: "4.8km"
  },
  {
    id: 12,
    name: "Chrysler Building",
    coordinates: [-73.9754, 40.7516],
    image: "chrysler.jpg",
    location: "405 Lexington Ave, NY",
    busy: "30%",
    distance: "1.0km"
  }
];

export default function Restuarants() {
  return (
    <CategoryLayout 
      categoryName="Restuarants"
      displayName="Restuarants"
      locations={RestuarantsData}
    />
  );
}