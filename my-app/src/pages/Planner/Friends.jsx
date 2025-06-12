import MapPanel from '../../Components/MapPanel';
import './Planner.css'
import Navbar from '../../Components/Navbar';


function Friends() {
  return (
    <div className="planner-page">
      <Navbar />
      <div className="planner-layout">
        <div className="planner-left">
          <MapPanel /> {/* optional or custom map here */}
        </div>
        <div className="planner-right">
          {/* Discover content goes here */}
          <h2>Welcome to friends</h2>
        </div>
      </div>
    </div>
  );
}

export default Friends;
