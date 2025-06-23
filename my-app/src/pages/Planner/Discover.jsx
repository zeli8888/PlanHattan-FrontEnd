import PlannerLayout from './PlannerLayout';
import './Discover.css'
import { Search } from 'lucide-react';
import { useState } from 'react';
import InterestSelector from './InterestSelector';
import DateTimePicker from '../../components/dateTime/DateTimePicker';

function Discover() {
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: {
      hours: 11,
      minutes: 30,
      period: 'PM'
    }
  });

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
            <DateTimePicker 
              value={dateTime}
              onChange={setDateTime}
            />
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
