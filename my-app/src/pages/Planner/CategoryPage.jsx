import { useParams } from 'react-router-dom';
import PlannerLayout from './PlannerLayout';
import './CategoryPage.css';

const categoryMapping = {
  'museums-galleries': 'Museums, Galleries',
  'landmarks-attractions': 'Landmarks, Attractions',
  'cafe-restaurants': 'Cafe, Restaurants',
  'nightlife-bars': 'Nightlife, Bars',
  'shopping-boutiques': 'Shopping, Boutiques',
  'live-music': 'Live Music',
  'cruises': 'Cruises'
};

export default function CategoryPage() {
  const { categoryName } = useParams();
  const displayName = categoryMapping[categoryName] || categoryName.replace('-', ', ');

  return (
    <PlannerLayout>
      <div className="category-page">
        <h1>{displayName}</h1>
        <div className="category-content">
          {/* Content specific to the category will go here */}
          <p>Showing results for: {displayName}</p>
        </div>
      </div>
    </PlannerLayout>
  );
}