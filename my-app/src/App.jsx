import './App.css'
import Home from './pages/Home'
import Planner from './pages/Planner.jsx';
import Discover from './pages/Planner/Discover.jsx';
import MyPlans from './pages/Planner/MyPlans.jsx';
import Friends from './pages/Planner/Friends.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/plan" element={<Planner />}>
        <Route path="discover" element={<Discover />} />
        <Route path="my-plans" element={<MyPlans />} />
        <Route path="friends" element={<Friends />} />
      </Route>

    </Routes>

  )
}

export default App
