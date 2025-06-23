import './App.css'
import Home from './pages/home/Home.jsx'
import Discover from './pages/planner/Discover.jsx';
import MyPlans from './pages/planner/MyPlans.jsx';
import Friends from './pages/planner/Friends.jsx';
import { Routes, Route } from 'react-router-dom';
import SignIn from './pages/login-signup/SignIn.jsx';
import IconTest from './pages/planner/test.jsx';
import CategoryPage from './pages/planner/categoryPage.jsx';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<IconTest />} />
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/plan" element={<Discover />}/>
      <Route path="/plan/category/:categoryName" element={<CategoryPage />} />
      <Route path="/my-plans" element={<MyPlans />} />
      <Route path="/friends" element={<Friends />} />

    </Routes>

  )
}

export default App
