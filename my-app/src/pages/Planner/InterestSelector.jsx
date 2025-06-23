import React from "react";
import './InterestSelector.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Landmark,
  Binoculars,
  Utensils,
  Glasses,
  ShoppingCart,
  Guitar,
  Ship,
} from "lucide-react";

// Create a URL-friendly name mapping
const categoryMapping = {
  "Museums, Galleries": "museums-galleries",
  "Landmarks, Attractions": "landmarks-attractions",
  "Cafe, Restaurants": "cafe-restaurants",
  "Nightlife, Bars": "nightlife-bars",
  "Shopping, Boutiques": "shopping-boutiques",
  "Live Music": "live-music",
  "Cruises": "cruises"
};

const interests = [
  { label: "Museums, Galleries", icon: Landmark },
  { label: "Landmarks, Attractions", icon: Binoculars },
  { label: "Cafe, Restaurants", icon: Utensils },
  { label: "Nightlife, Bars", icon: Glasses },
  { label: "Shopping, Boutiques", icon: ShoppingCart },
  { label: "Live Music", icon: Guitar },
  { label: "Cruises", icon: Ship },
];

const InterestSelector = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (label) => {
    setSelectedCategory(label);
  };

  const handleGo = () => {
    if (selectedCategory) {
      const urlFriendlyName = categoryMapping[selectedCategory];
      navigate(`/plan/category/${urlFriendlyName}`);
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