import PlannerLayout from './PlannerLayout';
import './MyPlans.css';
import { FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { initialPlans } from './plansData.js'; 


function MyPlans() {
  // Initial sample data - sorted by date and time

  const [plans, setPlans] = useState(initialPlans);

  const handleDelete = (index) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const getPredictionColor = (percentage) => {
    const value = parseInt(percentage);
    if (value >= 80) return '#ff4d4f'; // Red
    if (value >= 40) return '#faad14'; // Orange/Yellow
    return '#52c41a'; // Green
  };

  return (
    <PlannerLayout>
      <div className="my-plans-container">
        <div className="my-plans-header">
          <h2>My Plans</h2>
          <div className="results-count">{plans.length} results</div>
        </div>
        
        <div className="plans-scroll-container">
          <table className="plans-table">
            <thead>
              <tr>
                <th>PLACE</th>
                <th>PLANNED ON</th>
                <th>PLANNED AT</th>
                <th>PREDICTED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => (
                <tr key={index}>
                  <td>
                    <div className="place-cell">
                      <span className="area-badge">{plan.area}</span>
                      {plan.place}
                    </div>
                  </td>
                  <td>{plan.date}</td>
                  <td>{plan.time}</td>
                  <td>
                    <div 
                        className="prediction-bar" 
                        style={{ 
                          '--percentage': plan.predicted,
                          '--text-color': getPredictionColor(plan.predicted)
                        }}
                      >
                        {plan.predicted}
                      </div>

                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PlannerLayout>
  );
}

export default MyPlans