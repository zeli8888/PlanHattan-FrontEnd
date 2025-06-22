import PlannerLayout from './PlannerLayout';
import './Discover.css'
import { Search } from 'lucide-react';
import InterestSelector from './InterestSelector';

function Discover() {
  return (
    <PlannerLayout>
      <div className='search-container'>
      
        <h1>Search a Place</h1>
        <p>Manually search a place and add to MyPlans</p>

        <div className='search-box'>
          <input type="text" placeholder='Search'/>
          <Search className='search-icon'/>
        </div>

        <div className='title-time'>

          <div className='title-container'>
            <h3>Add Title</h3>
            <div className="input-box">
              <input type="text" placeholder="Eg. House, office" />
            </div>
          </div>

          <div className="time-container">
              <h3>Add Time slot</h3>
              <div className="time-slot">
                <select>
                  <option>29</option>
                  <option>30</option>
                </select>
                <select>
                  <option>09</option>
                  <option>10</option>
                </select>
                <select>
                  <option>2025</option>
                  <option>2026</option>
                </select>
                <select>
                  <option>11</option>
                  <option>12</option>
                </select>
                <select>
                  <option>09</option>
                  <option>10</option>
                </select>
                <select>
                  <option>PM</option>
                  <option>AM</option>
                </select>
              </div>
              </div>
        </div>

        <div className="buttons">
          <button className="btn">Predict Busyness</button>
          <button className="btn">Add To MyPlans</button>
        </div>
      </div>
      <InterestSelector/>
    </PlannerLayout>
  );
}

export default Discover;
