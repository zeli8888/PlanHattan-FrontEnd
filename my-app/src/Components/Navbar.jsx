import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import profilePic from '../Assets/profilePic.jpg'

const navItems = [
  { name: 'Discover', path: 'discover' },
  { name: 'My Plans', path: 'my-plans' },
  { name: 'Friends', path: 'friends' },
];

function Navbar() {
  const location = useLocation();
  const currentTab = location.pathname.split('/')[2];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        PLAN<span>HATTAN</span>
      </div>

      {/* Nav Links */}
      <div className="navbar-links">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`navbar-link ${currentTab === item.path ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="navbar-user">
        <img
          src= {profilePic}
          alt="User"
        />
      </div>
    </nav>
  );
}

export default Navbar;
