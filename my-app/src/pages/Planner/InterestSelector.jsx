import React from "react";
import './InterestSelector.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeApiRequest } from "../../api/PoiApi";

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
    url: "museum",
    poiType: "museum"
  },
  "Attractions": {
    url: "attractions", 
    poiType: "attraction"
  },
  "Cafe": {
    url: "cafe",
    poiType: "cafe"
  },
  "Parks": {
    url: "park",
    poiType: "park"
  },
  "Nightlife Pubs": {
    url: "pub",
    poiType: "pub"
  },
    "Restaurants": {
    url: "restaurant",
    poiType: "restaurant"
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

  const handleGo = async () => {
    if (selectedCategory) {
      setIsLoading(true);
      
      try {
        const categoryInfo = categoryMapping[selectedCategory];
        
        // Make API request with the correct POI type
        const apiResponse = await makeApiRequest(categoryInfo.poiType);
        
        console.log('API Response in InterestSelector:', apiResponse);
        
        // Navigate with state containing the API response
        navigate(`/plan/category/${categoryInfo.url}`, {
          state: {
            apiData: apiResponse, // Pass the entire API response
            poiType: categoryInfo.poiType,
            categoryName: selectedCategory
          }
        });
      } catch (error) {
        console.error('Failed to fetch POIs:', error);
        // Still navigate but without API data (will use fallback data)
        const categoryInfo = categoryMapping[selectedCategory];
        navigate(`/plan/category/${categoryInfo.url}`, {
          state: {
            poiType: categoryInfo.poiType,
            categoryName: selectedCategory,
            error: error.message
          }
        });
      } finally {
        setIsLoading(false);
      }
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
          disabled={!selectedCategory || isLoading}
        >
          {isLoading ? "Loading..." : "GO"}
        </button>
      </div>
    </div>
  );
};

export default InterestSelector;