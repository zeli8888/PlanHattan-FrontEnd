import './App.css'
import Home from './pages/home/Home.jsx'
import Discover from './pages/planner/Discover.jsx';
import MyPlans from './pages/planner/MyPlans.jsx';
import Friends from './pages/planner/Friends.jsx';
import { Routes, Route } from 'react-router-dom';
import SignIn from './pages/login-signup/SignIn.jsx';
import IconTest from './pages/planner/test.jsx';
import LandmarkAttraction from './pages/planner/Categories/LandmarkAttraction.jsx';
import MuseumsGalleries from './pages/planner/Categories/MuseumsGalleries.jsx';
import CafeRestuarants from './pages/planner/Categories/CafeRestuarants.jsx';
import NightlifeBars from './pages/planner/Categories/NightlifeBars.jsx';
import ShoppingBoutique from './pages/planner/Categories/ShoppingBoutique.jsx';
import LiveMusic from './pages/planner/Categories/LiveMusic.jsx';
import Cruises from './pages/planner/Categories/Cruises.jsx';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<IconTest />} />
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/plan" element={<Discover />}/>
      <Route path="/plan/category/landmarks-attractions" element={<LandmarkAttraction />} />
      <Route path="/plan/category/Museums-Galleries" element={<MuseumsGalleries />} />
      <Route path="/plan/category/Cafe-restaurants" element={<CafeRestuarants />} />
      <Route path="/plan/category/Nightlife-Bars" element={<NightlifeBars />} />
      <Route path="/plan/category/Shopping-Boutiques" element={<ShoppingBoutique />} />
      <Route path="/plan/category/live-music" element={<LiveMusic />} />
      <Route path="/plan/category/cruises" element={<Cruises />} />  
      <Route path="/my-plans" element={<MyPlans />} />
      <Route path="/friends" element={<Friends />} />
    </Routes>

  )
}

export default App
