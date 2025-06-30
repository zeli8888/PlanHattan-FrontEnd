import PlannerLayout from './PlannerLayout';
import './MyPlans.css';
import { FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useMyPlans } from '../../contexts/MyPlansProvider';

function MyPlans() {
  const { plans, deletePlan } = useMyPlans();
  const [deletingId, setDeletingId] = useState(null);

  const mapLocations = plans.map(plan => ({
    id: plan.placeId || plan.id, 
    name: plan.place,
    coordinates: plan.coordinates,
    image: plan.areaImage,
    location: plan.area,
    busy: plan.predicted
  }));

  useEffect(() => {
    console.log('Plans updated:', plans);
  }, [plans]);

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      deletePlan(id);
      setDeletingId(null);
    }, 300);
  };

  const getPredictionColor = (percentage) => {
    const value = parseInt(percentage);
    if (value >= 80) return '#ff4d4f';
    if (value >= 40) return '#faad14';
    return '#52c41a';
  };

  return (
    <PlannerLayout locations={mapLocations}>
      <div className="my-plans-container">
        <div className="my-plans-header">
          <h2>My Plans</h2>
          <div className="results-count">{plans.length} results</div>
        </div>
        
        <div className="plans-scroll-container">
          {plans.length === 0 ? (
            <div className="empty-state">
              <p>No plans added till now</p>
            </div>
          ) : (
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
                {plans.map((plan) => (
                  <tr key={plan.id} className={`plan-row ${deletingId === plan.id ? 'deleting' : ''}`}>
                    <td>
                      <div className="place-cell">
                        <div className="area-image-container">
                          <img 
                            src={plan.areaImage} 
                            alt={plan.area} 
                            className="area-image"
                          />
                        </div>
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
                        onClick={() => handleDelete(plan.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PlannerLayout>
  );
}

export default MyPlans;