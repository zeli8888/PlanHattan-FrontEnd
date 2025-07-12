import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';
import profilePic from '../../assests/profilePic.jpg';

const navItems = [
  { name: 'Discover', path: '/plan' },
  { name: 'My Plans', path: '/my-plans' },
  { name: 'Recommendation', path: '/recommendation' },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeNavigate = () => {
    navigate('/');
    closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      openMobileMenu();
    }
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    if (!isMobileMenuOpen) return;
    
    setIsMobileMenuOpen(false);
    
    // Reset animation state after transition completes
    setTimeout(() => {
    }, 400);
  };

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-content') && !event.target.closest('.hamburger')) {
        closeMobileMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="navbar">
        {/* Hamburger Menu */}
        <div 
          className="hamburger" 
          onClick={toggleMobileMenu}
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Logo */}
        <div className="navbar-logo" onClick={handleHomeNavigate}>
          PLAN<span>HATTAN</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`navbar-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="navbar-user">
          <img src={profilePic} alt="User" />
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo" onClick={handleHomeNavigate}>
              PLAN<span>HATTAN</span>
            </div>
            <button 
              className="mobile-menu-close" 
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          
          <div className="mobile-menu-links">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`mobile-menu-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={handleLinkClick}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;