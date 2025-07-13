import './App.css'
import Home from './pages/home/Home.jsx'
import Discover from './pages/planner/discover/Discover.jsx';
import MyPlans from './pages/planner/myplans/MyPlans.jsx';
import Recommendation from './pages/planner/recommendation/Recommendation.jsx';
import Loading from './components/features/LoadingPage.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SignIn from './pages/login-signup/SignIn.jsx';
import NightlifeBars from './pages/planner/Categories/NightlifeBars.jsx';
import AuthContainer from './pages/login-signup/AuthContainer.jsx';
import Attractions from './pages/planner/Categories/Attractions.jsx';
import Restuarants from './pages/planner/Categories/Restuarants.jsx';
import Parks from './pages/planner/Categories/Parks.jsx';
import Cafe from './pages/planner/Categories/Cafe.jsx';
import Museums from './pages/planner/Categories/Museum.jsx';
import { LocationProvider } from './contexts/LocationContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ZoneBusynessProvider } from './contexts/ZoneBusynessContext.jsx';
import GoogleCallback from './pages/login-signup/GoogleCallback.jsx';

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
    <AuthProvider>
      <LocationProvider>
        <ZoneBusynessProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<AuthContainer initialView="signin" />} />
            <Route path="/signup" element={<AuthContainer initialView="signup" />} />
            <Route path="/plan" element={<Discover />} />
            <Route path="/plan/category/attractions" element={<Attractions />} />
            <Route path="/plan/category/museum" element={<Museums />} />
            <Route path="/plan/category/restaurant" element={<Restuarants />} />
            <Route path="/plan/category/pub" element={<NightlifeBars />} />
            <Route path="/plan/category/park" element={<Parks />} />
            <Route path="/plan/category/cafe" element={<Cafe />} />
            <Route path="/my-plans" element={<MyPlans />} />
            <Route path="/recommendation" element={<Recommendation />} />
            <Route path='/google-callback' element={<GoogleCallback />} />
          </Routes>
        </ZoneBusynessProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

export default App