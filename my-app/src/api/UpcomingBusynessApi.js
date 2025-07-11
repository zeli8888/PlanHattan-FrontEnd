/**
 * API service for fetching upcoming busyness predictions
 */

/**
 * Fetches upcoming busyness data for the next specified hours
 * @param {number} zoneId - The zone ID to fetch busyness for
 * @param {number} predictedHours - Number of hours to predict (default: 3)
 * @param {string} dateTime - ISO string of the date/time to predict from (default: current time)
 * @returns {Promise<Array>} Array of busyness predictions with time and busyness level
 */
const fetchUpcomingBusyness = async (zoneId = 1, predictedHours = 3, dateTime = null) => {
  try {
    // Use current time if no dateTime provided
    const currentDateTime = dateTime || new Date().toISOString();
    
    // Construct API URL
    const apiUrl = `https://planhattan.ddns.net/api/zones/${zoneId}?dateTime=${currentDateTime}&predictedHours=${predictedHours}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the response to format busyness data
    const busynessData = [];
    const baseTime = new Date(currentDateTime);
    
    for (let i = 1; i <= predictedHours; i++) {
      const targetTime = new Date(baseTime.getTime() + (i * 60 * 60 * 1000)); // Add i hours
      const targetHour = targetTime.getHours();
      const period = targetHour >= 12 ? 'PM' : 'AM';
      const displayHour = targetHour === 0 ? 12 : (targetHour > 12 ? targetHour - 12 : targetHour);
      
      // Extract busyness from API response (adjust based on actual API response structure)
      // This might need to be adjusted based on your actual API response format
      const busyness = data.predictions?.[i-1]?.busyness || 
                      data.busyness?.[i-1] || 
                      data[i-1]?.busyness || 
                      'medium'; // Default fallback
      
      busynessData.push({
        time: `${displayHour}:00 ${period}`,
        busyness: busyness.toLowerCase(), // Ensure consistent format
        timeValue: { 
          hours: displayHour, 
          minutes: 0, 
          period: period 
        },
        timestamp: targetTime.toISOString()
      });
    }
    
    return busynessData;
    
  } catch (error) {
    console.error('Failed to fetch upcoming busyness:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Generates fallback busyness data when API fails
 * @param {number} hours - Number of hours to generate fallback data for
 * @param {string} dateTime - Base date/time for calculations
 * @returns {Array} Array of fallback busyness data
 */
const generateFallbackBusyness = (hours = 3, dateTime = null) => {
  const baseTime = new Date(dateTime || new Date());
  const fallbackData = [];
  
  for (let i = 1; i <= hours; i++) {
    const targetTime = new Date(baseTime.getTime() + (i * 60 * 60 * 1000));
    const targetHour = targetTime.getHours();
    const period = targetHour >= 12 ? 'PM' : 'AM';
    const displayHour = targetHour === 0 ? 12 : (targetHour > 12 ? targetHour - 12 : targetHour);
    
    // Generate some variety in fallback data
    const busynessLevels = ['low', 'medium', 'high'];
    const randomBusyness = busynessLevels[Math.floor(Math.random() * busynessLevels.length)];
    
    fallbackData.push({
      time: `${displayHour}:00 ${period}`,
      busyness: randomBusyness,
      timeValue: { 
        hours: displayHour, 
        minutes: 0, 
        period: period 
      },
      timestamp: targetTime.toISOString()
    });
  }
  
  return fallbackData;
};

/**
 * Fetches upcoming busyness with automatic fallback
 * @param {number} zoneId - The zone ID to fetch busyness for
 * @param {number} predictedHours - Number of hours to predict
 * @param {string} dateTime - ISO string of the date/time to predict from
 * @returns {Promise<Array>} Array of busyness predictions (from API or fallback)
 */
const getUpcomingBusynessWithFallback = async (zoneId = 1, predictedHours = 3, dateTime = null) => {
  try {
    return await fetchUpcomingBusyness(zoneId, predictedHours, dateTime);
  } catch (error) {
    console.warn('API call failed, using fallback data:', error.message);
    return generateFallbackBusyness(predictedHours, dateTime);
  }
};

export {
  fetchUpcomingBusyness,
  generateFallbackBusyness,
  getUpcomingBusynessWithFallback
};

export default getUpcomingBusynessWithFallback;