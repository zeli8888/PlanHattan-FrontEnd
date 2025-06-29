import { createContext, useState, useContext } from 'react';

const MyPlansContext = createContext();

export function MyPlansProvider({ children }) {
  const [plans, setPlans] = useState([]);

  const addPlan = (newPlan) => {
    setPlans(prev => [...prev, {
      ...newPlan,
      id: Date.now() 
    }]);
  };

  const deletePlan = (id) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  return (
    <MyPlansContext.Provider value={{ plans, addPlan, deletePlan }}>
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