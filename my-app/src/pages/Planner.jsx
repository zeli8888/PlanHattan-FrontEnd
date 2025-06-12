import { Link, Outlet } from 'react-router-dom';

function Planner() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="discover">Discover</Link>
        <Link to="my-plans">My Plans</Link>
        <Link to="friends">Friends</Link>
      </nav>

      <div style={{ padding: '2rem' }}>
        <Outlet /> {}
      </div>
    </div>
  );
}

export default Planner;
