import React from 'react';
import './Home.css';
import homeImages from './HomeImages';
import { useNavigate } from 'react-router-dom';

function Home() {

    const navigate = useNavigate();
    const handleSignRoute = () => {
      navigate('/signin');
    };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-container">
        {/* Navigation Bar */}
        <nav className="n">
          <div className="logo">PLAN<span className='logoSpan'>HATTAN</span></div>
          <div className="nav-links">
            <a href="/about">Home</a>
            <a href="/services">Services</a>
            <a href="/blog">Places</a>
            <a href="/pricing">About Us</a>
          </div>
          <div className="auth-buttons">
            <button className="hsignup-btn" onClick={handleSignRoute}>SignUp</button>
            <button className="hsignin-btn" onClick={handleSignRoute}>SignIn</button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="hero-content" style={{backgroundImage: `url(${homeImages.heroIcon})`}}>
          <h1>Plan your perfect day in ManHattan</h1>
          <button className="booking-btn">Get Started!</button>
        </div>
      </div>

      <section className="trust-section">
        <h2>Why trust PlanHattan with your Trip?</h2>
      
      <div className="features-container">
        <div className="itinerary-card">
          <div className="itinerary-icon">
            <img src={homeImages.itineraryIcon} alt="Local Insights" />
          </div>
          <div className="itinerary-content">
            <h3>Personalized Itineraries Based On Real Crowd Data</h3>
            <p>We Predict the Crowds So You Don't Have To stand online</p>
          </div>
        </div>

        <div className="hmap-card">
          <div className="feature-icon">
            <img src={homeImages.paperMapIcon} alt="maps" />
          </div>
          <div className="feature-content">
            <h3>Local Insights & Less Busyness Gems</h3>
            <p>Discover places tourists often miss.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={homeImages.calenderIcon} alt="Perfect Timing" />
          </div>
          <div className="feature-content">
            <h3>Where To Go, When To Go – Perfectly Timed</h3>
            <p>Flights, hotels, activities in one place.</p>
          </div>
        </div>
      </div>

      <div className="mission-statement">
          <p style={{color: '#100A1C'}}>
            We believe that <span className="highlight">planning a day</span> should be 
      <span className="highlight"> as exciting as the moment itself</span>—without the stress 
      of browsing endless websites, or <span className="highlight">getting stuck in the crowd.</span>
          </p>
        </div>
      </section>
      
    </div>
  );
}

export default Home;