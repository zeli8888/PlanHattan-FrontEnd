import React from "react";
import './InterestSelector.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Landmark,
  Binoculars,
  Utensils,
  Glasses,
  Coffee,
  TreeDeciduous
} from "lucide-react";

const categoryMapping = {
  "Museums": {
    url: "museums",
    poiType: "museum"
  },
  "Attractions": {
    url: "attractions", 
    poiType: "attraction"
  },
  "Cafe": {
    url: "cafe",
    poiType: "restaurant"
  },
  "Parks": {
    url: "parks",
    poiType: "bar"
  },
  "Nightlife Pubs": {
    url: "nightlife-pubs",
    poiType: "pub"
  },
    "Restaurants": {
    url: "restaurants",
    poiType: "Restaurants"
  },
};

const interests = [
  { label: "Attractions", icon: Binoculars },
  { label: "Cafe", icon: Coffee },
  { label: "Museums", icon: Landmark },
  { label: "Parks", icon: TreeDeciduous },
  { label: "Nightlife Pubs", icon: Glasses },
  { label: "Restaurants", icon: Utensils },
];

const InterestSelector = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

  const handleGo = () => {
    if (selectedCategory) {
      const categoryInfo = categoryMapping[selectedCategory];
      
      // Navigate with state containing the POI type for API calls
      navigate(`/plan/category/${categoryInfo.url}`, {
        state: {
          poiType: categoryInfo.poiType,
          categoryName: selectedCategory
        }
      });
    }
  };

  return (
    <div className="interest-container">
      <h2 className="title">Discover by Interest</h2>
      <p className="subtitle">
        Activities recommended based on your time, preferences, and the city's current pace.
      </p>

      <div className="icon-grid">
        {interests.map(({ label, icon: Icon }, idx) => (
          <div 
            className={`icon-card ${selectedCategory === label ? "selected" : ""}`}
            key={idx} 
            onClick={() => handleSelect(label)}
          >
            <div className="icon"><Icon size={28} /></div>
            <span className="icon-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="cta">
        <p className="search-label">
          <strong>
            {selectedCategory 
              ? `Search By ${selectedCategory}` 
              : "Select a category to search"}
          </strong>
        </p>
        <button 
          className={`go-btn ${!selectedCategory ? "disabled" : ""}`}
          onClick={handleGo}
          disabled={!selectedCategory}
        >
          GO
        </button>
      </div>
    </div>
  );
};

export default InterestSelector;