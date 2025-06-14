import './App.css'
import Home from './pages/home/Home.jsx'
import Discover from './pages/planner/Discover.jsx';
import MyPlans from './pages/planner/MyPlans.jsx';
import Friends from './pages/planner/Friends.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/plan" element={<Discover />}/>
        <Route path="/my-plans" element={<MyPlans />} />
        <Route path="/friends" element={<Friends />} />

    </Routes>

  )
}

export default App
