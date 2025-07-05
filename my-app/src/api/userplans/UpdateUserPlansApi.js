import axios from 'axios';

const updateUserPlans = async (userPlanId, planData) => {
  try {
    // Get the CSRF token from localStorage or wherever you store it
    const token = localStorage.getItem('csrfToken') || sessionStorage.getItem('csrfToken');
    
    if (!token) {
      throw new Error('CSRF token not found. Please login first.');
    }

    let utcTimestamp;
    
    // Handle different time formats
    if (typeof planData.time === 'object' && planData.time.hours !== undefined) {
      // Parse the 12-hour time format
      let hours = parseInt(planData.time.hours);
      const minutes = parseInt(planData.time.minutes);
      
      // Convert to 24-hour format
      if (planData.time.period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (planData.time.period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Create a proper local datetime by combining date and time
      const year = planData.date.getFullYear();
      const month = planData.date.getMonth();
      const day = planData.date.getDate();
      
      // Create local datetime
      const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);
      
      // Convert to UTC ISO 8601 timestamp (ends with 'Z')
      utcTimestamp = localDateTime.toISOString();
    } else if (typeof planData.time === 'string') {
      // Time is in string format "1:00 PM"
      const timeMatch = planData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch && planData.date) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        // Parse the date string if it's a string, otherwise use as Date object
        let dateObj;
        if (typeof planData.date === 'string') {
          dateObj = new Date(planData.date);
        } else {
          dateObj = planData.date;
        }
        
        // Create local datetime and convert to UTC
        const localDateTime = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          hours,
          minutes,
          0,
          0
        );
        utcTimestamp = localDateTime.toISOString();
      } else {
        throw new Error('Invalid time format. Expected format: "1:00 PM"');
      }
    } else {
      throw new Error('Invalid time data. Expected object with hours/minutes/period or string format "1:00 PM"');
    }

    // Prepare the request body
    const requestBody = {
      poiName: planData.place || planData.poiName,
      time: utcTimestamp,
      busyness: planData.predicted || planData.busyness,
      latitude: planData.coordinates?.lat || planData.coordinates[0] || null,
      longitude: planData.coordinates?.lng || planData.coordinates[1] || null
    };

    // Configure axios request with headers
    const config = {
      method: 'PUT',
      url: `https://planhattan.ddns.net/api/userplans/${userPlanId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      data: requestBody,
      withCredentials: true // Include cookies if needed
    };

    const response = await axios(config);

    console.log('Response status:', response.status);
    
    return response.data;
  } catch (error) {
    console.error('Error updating user plan:', error);
    
    // Log more details about the error
    if (error.response) {
      // Server responded with error status
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

export default updateUserPlans;