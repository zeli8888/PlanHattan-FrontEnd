import './App.css'
import Home from './pages/home/Home.jsx'
import Discover from './pages/planner/Discover.jsx';
import MyPlans from './pages/planner/MyPlans.jsx';
import Friends from './pages/planner/Friends.jsx';
import Loading from './components/features/LoadingPage.jsx';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SignIn from './pages/login-signup/SignIn.jsx';
import IconTest from './pages/planner/test.jsx';
import MuseumsGalleries from './pages/planner/Categories/MuseumsGalleries.jsx';
import NightlifeBars from './pages/planner/Categories/NightlifeBars.jsx';
import AuthContainer from './pages/login-signup/AuthContainer.jsx';
import Attractions from './pages/planner/Categories/Attractions.jsx';
import Restuarants from './pages/planner/Categories/Restuarants.jsx';
import Parks from './pages/planner/Categories/Parks.jsx';
import Cafe from './pages/planner/Categories/Cafe.jsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<IconTest />} />
      <Route path="/signin" element={<AuthContainer initialView="signin" />} />
      <Route path="/signup" element={<AuthContainer initialView="signup" />} />
      <Route path="/plan" element={<Discover />}/>
      <Route path="/plan/category/attractions" element={<Attractions />} />
      <Route path="/plan/category/museums" element={<MuseumsGalleries />} />
      <Route path="/plan/category/restaurants" element={<Restuarants />} />
      <Route path="/plan/category/Nightlife-pubs" element={<NightlifeBars />} />
      <Route path="/plan/category/parks" element={<Parks />} />
      <Route path="/plan/category/cafe" element={<Cafe />} />
      <Route path="/my-plans" element={<MyPlans />} />
      <Route path="/friends" element={<Friends />} />
    </Routes>

  )
}

export default App
