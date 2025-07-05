import PlannerLayout from './PlannerLayout';
import './MyPlans.css';
import { FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useMyPlans } from '../../contexts/MyPlansProvider';
import getUserPlans from '../../api/userplans/GetUserPlansApi'; // Import the API function

function MyPlans() {
  const { plans, deletePlan, setPlans } = useMyPlans(); // Add setPlans to update plans
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapLocations = plans.map(plan => ({
    id: plan.placeId || plan.id, 
    name: plan.place,
    coordinates: plan.coordinates,
    image: plan.areaImage,
    location: plan.area,
    busy: plan.predicted
  }));

  // Fetch user plans when component mounts
  useEffect(() => {
    const fetchUserPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userPlans = await getUserPlans();
        
        // Transform server response to match your frontend format
        const transformedPlans = userPlans.map(plan => ({
          id: plan.userPlanId,
          placeId: plan.userPlanId,
          place: plan.poiName,
          area: plan.poiName, // You might want to get this from another source
          areaImage: '', // You might want to get this from another source
          date: new Date(plan.time).toLocaleDateString(),
          time: new Date(plan.time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          predicted: plan.busyness,
          coordinates: [plan.latitude, plan.longitude],
          serverPlanId: plan.userPlanId
        }));
        
        setPlans(transformedPlans);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlans();
  }, []); // Empty dependency array means this runs once when component mounts

  useEffect(() => {
    console.log('Plans updated:', plans);
  }, [plans]);

const handleDelete = async (id) => {
  setDeletingId(id);
  
  try {
    await deletePlan(id);
    
    setTimeout(() => {
      setDeletingId(null);
    }, 300);
  } catch (error) {
    setDeletingId(null);
    console.error('Failed to delete plan:', error);
  }
};

  const getPredictionColor = (percentage) => {
    const value = parseInt(percentage);
    if (value >= 80) return '#ff4d4f';
    if (value >= 40) return '#faad14';
    return '#52c41a';
  };

  if (loading) {
    return (
      <PlannerLayout locations={[]}>
        <div className="my-plans-container">
          <div className="my-plans-header">
            <h2>My Plans</h2>
          </div>
          <div className="loading-state">
            <p>Loading your plans...</p>
          </div>
        </div>
      </PlannerLayout>
    );
  }

  if (error) {
    return (
      <PlannerLayout locations={[]}>
        <div className="my-plans-container">
          <div className="my-plans-header">
            <h2>My Plans</h2>
          </div>
          <div className="error-state">
            <p>Error loading plans: {error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </PlannerLayout>
    );
  }

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
                            src={plan.areaImage || '/default-image.jpg'} 
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