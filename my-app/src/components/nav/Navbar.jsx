import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import the auth context
import { authAPI } from '../../api/AuthApi'; // Import authAPI for logout
import './Navbar.css';

const navItems = [
  { name: 'Discover', path: '/plan' },
  { name: 'My Plans', path: '/my-plans' },
  { name: 'Recommendation', path: '/recommendation' },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useAuth(); // Get user and logout from context
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Enhanced logout function (same as Home page)
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log('Navbar - Current user:', user);
      
      const result = await authAPI.logout();
      
      console.log('Navbar - Logout result:', result);
      
      if (result.success) {
        console.log('Navbar - Server response status:', result.status);
        console.log('Navbar - Server response data:', result.data);
        
        // Use context logout to update global state
        contextLogout();
        setShowUserMenu(false);
        
        navigate('/');
      } else {
        console.log('Navbar - Error status:', result.status);
        
        // Still update local state and navigate
        contextLogout();
        setShowUserMenu(false);
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Navbar - Logout process error:', error);
      
      // Clear local state even on error
      contextLogout();
      setShowUserMenu(false);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-content') && !event.target.closest('.hamburger')) {
        closeMobileMenu();
      }
      // Close user menu when clicking outside
      if (showUserMenu && !event.target.closest('.navbar-user-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, showUserMenu]);

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
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          closeMobileMenu();
        }
        if (showUserMenu) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen, showUserMenu]);

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

        {/* User Profile - Only show if authenticated */}
        {user && (
          <div className="navbar-user-container">
            <div className="navbar-user" onClick={toggleUserMenu}>
              <div className="user-avatar">
                <span className="user-icon">👤</span>
              </div>
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <span className="user-name">Hi {user.username}</span>
                </div>
                <div className="user-dropdown-item" onClick={() => { setShowUserMenu(false); }}>
                  Profile
                </div>
                <div className="user-dropdown-item" onClick={() => { navigate('/my-plans'); setShowUserMenu(false); }}>
                  My Plans
                </div>
                <div 
                  className={`user-dropdown-item logout ${isLoggingOut ? 'logging-out' : ''}`} 
                  onClick={isLoggingOut ? null : handleLogout}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </div>
              </div>
            )}
          </div>
        )}
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