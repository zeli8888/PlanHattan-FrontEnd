import PlannerLayout from '../PlannerLayout';
import './MyPlans.css';
import { FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPlans } from '../../../contexts/MyPlansProvider';
import { useAuth } from '../../../contexts/AuthContext';
import getUserPlans from '../../../api/userplans/GetUserPlansApi';
import { useZoneBusyness } from '../../../contexts/ZoneBusynessContext';
import useNotification from '../../../components/features/useNotification';
import Notification from '../../../components/features/Notification';

function MyPlans() {
  const { plans, deletePlan, setPlans } = useMyPlans();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { zoneBusynessMap, refreshIfStale } = useZoneBusyness();
  const { notification, showNotification, hideNotification } = useNotification();

  // Fixed mapLocations with proper coordinate validation
  const mapLocations = plans
    .filter(plan => plan.coordinates && Array.isArray(plan.coordinates) && plan.coordinates.length === 2)
    .map(plan => ({
      id: plan.placeId || plan.id, 
      name: plan.place,
      coordinates: plan.coordinates,
      image: plan.areaImage,
      location: plan.area,
      busy: plan.predicted,
      place: plan.place,
      area: plan.area
    }));

    // Refresh zone data
    useEffect(() => {
      refreshIfStale(30); // Refresh if data is older than 30 minutes
    }, [refreshIfStale]);

  // Fetch user plans when component mounts (only if authenticated)
  useEffect(() => {
    const fetchUserPlans = async () => {
      if (!isAuthenticated || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userPlans = await getUserPlans();
        console.log(userPlans)
        const transformedPlans = userPlans.map(plan => ({
          id: plan.userPlanId,
          placeId: plan.userPlanId,
          place: plan.poiName,
          area: plan.poiName,
          areaImage: '',
          date: new Date(plan.time).toLocaleDateString(),
          time: new Date(plan.time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          predicted: plan.busyness,
          // Fixed: Ensure coordinates are properly formatted as [longitude, latitude]
          coordinates: plan.longitude && plan.latitude ? [plan.longitude, plan.latitude] : null,
          serverPlanId: plan.userPlanId
        }));
        
        // Filter out plans without valid coordinates
        const validPlans = transformedPlans.filter(plan => 
          plan.coordinates && 
          Array.isArray(plan.coordinates) && 
          plan.coordinates.length === 2 &&
          !isNaN(plan.coordinates[0]) && 
          !isNaN(plan.coordinates[1])
        );
        
        setPlans(validPlans);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlans();
  }, [isAuthenticated, authLoading, setPlans]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    
    try {
      // Get the plan name before deleting for the notification
      const planToDelete = plans.find(plan => plan.id === id);
      const planName = planToDelete ? planToDelete.place : 'Plan';
      
      await deletePlan(id);
      
      // Show success notification
      showNotification(
        'success',
        'Plan Deleted',
        `${planName} has been successfully removed from your plans.`
      );
      
      setTimeout(() => {
        setDeletingId(null);
      }, 300);
    } catch (error) {
      setDeletingId(null);
      console.error('Failed to delete plan:', error);
      
      // Show error notification
      showNotification(
        'error',
        'Delete Failed',
        'Failed to delete the plan. Please try again.'
      );
    }
  };

  const handleSignInClick = () => {
    navigate('/signin', { 
      state: { from: '/my-plans' } 
    });
  };

  const getPredictionColor = (value) => {
    if (value === 'high') return '#ff4d4f';
    if (value === 'medium') return '#faad14';
    return '#52c41a';
  };

  // Show loading state while checking authentication or fetching data
  if (authLoading || loading) {
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

  // Show unauthenticated state
  if (!isAuthenticated) {
    return (
      <PlannerLayout locations={[]}>
        <div className="my-plans-container">
          <div className="my-plans-header">
            <h2>My Plans</h2>
          </div>
          <div className="empty-state">
            <p>Register or SignIn to view MyPlans</p>
            <button 
              className="signin-prompt-btn"
              onClick={handleSignInClick}
            >
              Sign In
            </button>
          </div>
        </div>
      </PlannerLayout>
    );
  }

  return (
    <PlannerLayout locations={mapLocations} zoneBusynessMap={zoneBusynessMap}>
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
            <>
              {/* Desktop Table Layout */}
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
                            '--text-color': getPredictionColor(plan.predicted),
                            display: 'inline-flex'
                          }}
                        >
                          {plan.predicted}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="myPlans-delete-btn"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card Layout */}
              <div className="plans-cards">
                {plans.map((plan) => (
                  <div key={plan.id} className={`plan-card ${deletingId === plan.id ? 'deleting' : ''}`}>
                    <div className="plan-card-header">
                      <div className="plan-card-place">
                        
                        <div className="plan-card-place-name">{plan.place}</div>
                      </div>
                      <button 
                        className="plan-card-delete"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div className="plan-card-details">
                      <div className="plan-card-detail">
                        <div className="plan-card-detail-label">Planned On</div>
                        <div className="plan-card-detail-value">{plan.date}</div>
                      </div>
                      <div className="plan-card-detail">
                        <div className="plan-card-detail-label">Planned At</div>
                        <div className="plan-card-detail-value">{plan.time}</div>
                      </div>
                      <div className="plan-card-detail plan-card-prediction">
                        <div className="plan-card-detail-label">Predicted</div>
                        <div 
                          className="prediction-bar" 
                          style={{ 
                            '--percentage': plan.predicted,
                            '--text-color': getPredictionColor(plan.predicted)
                          }}
                        >
                          {plan.predicted}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      <Notification 
        notification={notification} 
        onClose={hideNotification} 
      />
    </PlannerLayout>
  );
}

export default MyPlans;