import { createContext, useState, useContext } from 'react';
import deleteUserPlans from '../api/userplans/DeleteUserPlansApi';
import updateUserPlans from '../api/userplans/UpdateUserPlansApi';

const MyPlansContext = createContext();

export function MyPlansProvider({ children }) {
  const [plans, setPlans] = useState([]);

  const addPlan = (newPlan) => {
    setPlans(prev => [...prev, {
      ...newPlan,
      // Don't generate a new ID if one is already provided (from server)
      id: newPlan.id || Date.now()
    }]);
  };

  const deletePlan = async (id) => {
    try {
      // Find the plan to delete
      const planToDelete = plans.find(plan => plan.id === id);
      
      if (!planToDelete) {
        console.error('Plan not found for deletion');
        return;
      }

      console.log('Deleting plan with ID:', id);
      
      // Try to delete from server first
      try {
        await deleteUserPlans(id);
        console.log('Successfully deleted from server');
      } catch (serverError) {
        console.error('Server deletion failed:', serverError);
        
        // If it's a 404, the plan might already be deleted on server
        if (serverError.message.includes('404')) {
          console.log('Plan not found on server (404), continuing with local deletion');
        } else {
          // For other server errors, still try to remove from local state
          console.log('Server error, but continuing with local deletion');
        }
      }
      
      // Always remove from local state regardless of server response
      setPlans(prev => prev.filter(plan => plan.id !== id));
      
      console.log('Plan deleted successfully from local state');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      throw error; // Re-throw for handling in the calling component
    }
  };

const updatePlan = async (id, updatedPlan) => {
  try {
    // Update on server first
    await updateUserPlans(id, updatedPlan);
    
    // Then update local state
    setPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, ...updatedPlan } : plan
    ));
    
    console.log('Plan updated successfully');
  } catch (error) {
    console.error('Failed to update plan:', error);
    throw error; // Re-throw for handling in calling component
  }
};

  return (
    <MyPlansContext.Provider value={{ 
      plans, 
      setPlans, 
      addPlan, 
      deletePlan, 
      updatePlan 
    }}>
      {children}
    </MyPlansContext.Provider>
  );
}

export function useMyPlans() {
  const context = useContext(MyPlansContext);
  if (!context) {
    throw new Error('useMyPlans must be used within a MyPlansProvider');
  }
  return context;
}