import React from 'react';
import './Home.css';
import homeImages from './HomeImages';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

function Home() {

    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const trustSectionRef = useRef(null);
    const destinationsRef = useRef(null);

    const handleSignRoute = () => {
      navigate('/signin');
    };

    const handlePlanRoute = () => {
      navigate('/plan');
    }

    const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

    const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-container">
        {/* Navigation Bar */}
        <nav className="n">
          <div className="logo">PLAN<span className='logoSpan'>HATTAN</span></div>
          {/* Hamburger Button */}
          <button className="hamburger-btn" onClick={toggleMenu}>
            ☰
          </button>
          <div className="desktop-nav">
            <div className="nav-links">
              <a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection(trustSectionRef); }}>Services</a>
              <a href="#places" onClick={(e) => { e.preventDefault(); scrollToSection(destinationsRef); }}>Places</a>
              <a href="/pricing">About Us</a>
            </div>
          </div>
          <div className="auth-buttons">
            <button className="hsignup-btn" onClick={handleSignRoute}>Register</button>
            <button className="hsignin-btn" onClick={handleSignRoute}>SignIn</button>
          </div>
        </nav>

         <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }}>Home</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection(trustSectionRef); setIsMenuOpen(false); }}>Services</a>
            <a href="#places" onClick={(e) => { e.preventDefault(); scrollToSection(destinationsRef); setIsMenuOpen(false); }}>Places</a>
            <a href="/pricing" onClick={() => setIsMenuOpen(false)}>About Us</a>
          </div>
          <div className="mobile-auth-buttons">
            <button className="hsignup-btn" onClick={() => { handleSignRoute(); setIsMenuOpen(false); }}>SignUp</button>
            <button className="hsignin-btn" onClick={() => { handleSignRoute(); setIsMenuOpen(false); }}>SignIn</button>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="hero-content" style={{backgroundImage: `url(${homeImages.heroIcon})`}}>
          <h1>Plan your perfect day in ManHattan</h1>
          <button className="booking-btn" onClick={handlePlanRoute}>Get Started!</button>
        </div>
      </div>

      <section className="trust-section" ref={trustSectionRef}>
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
      
      <section className="destinations-section" ref={destinationsRef}>
        <div className="destinations-header">
          <h2>Where should you go?</h2>
          <p className="subtitle">Let Us Be Your Local Guide</p>
          <p className="description">
            Explore Manhattan's most breathtaking spots – from iconic landmarks and cultural hubs to hidden parks and skyline views.
          </p>
        </div>

        <div className="destinations-grid">
          <div className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${homeImages.destinationImg1})` }}></div>
            <div className="destinations-content">
            <h3>Times Square</h3>
            <p>The Neon Heartbeat</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${homeImages.destinationImg2})` }}></div>
            <div className="destinations-content">
            <h3>Central Park</h3>
            <p>The Lungs of Manhattan</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${homeImages.destinationImg3})` }}></div>
            <div className="destinations-content">
            <h3>SoHo</h3>
            <p>The Canvas of Cool</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${homeImages.destinationImg4})` }}></div>
            <div className="destinations-content">
            <h3>Statue of Liberty</h3>
            <p>The Torch of Freedom</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;