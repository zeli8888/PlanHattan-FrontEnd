import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';

function Planner() {
  return (
    <div>
      <Navbar />

        <main style={{
          flexGrow: 1,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
  );
}

export default Planner;
