import axios from 'axios';

const RequestRecommendations = async (plansArray) => {
  try {
    // Get CSRF token from localStorage
    const csrfToken = localStorage.getItem('csrfToken');
    
    if (!csrfToken) {
      throw new Error('CSRF token not found in localStorage');
    }

    // Transform the plans array to match your API expected format
    const payload = plansArray.map(plan => ({
      poiName: plan.poiName || null,
      zoneId: plan.zoneId || 1,
      latitude: plan.latitude || null,
      longitude: plan.longitude || null,
      time: plan.time,
      transiType: null,
      poiTypeName: plan.poiTypeName || null
    }));

    // Log the transformed payload
    console.log('Transformed payload:', payload);
    console.log('Payload JSON:', JSON.stringify(payload, null, 2));

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      withCredentials: true // Include cookies for session-based auth
    };

    // // Log the final request details
    // console.log('Making API request with config:', requestConfig);

    // Make the POST request with clean payload
    const response = await axios.post(
      'https://planhattan.ddns.net/api/pois/recommendation',
      payload, // This is now an array of plan objects
      requestConfig
    );

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error posting user plan:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('Network error: No response from server');
    } else {
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

export default RequestRecommendations;