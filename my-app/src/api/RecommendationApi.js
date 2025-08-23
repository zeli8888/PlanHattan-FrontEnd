import axios from 'axios';

const RequestRecommendations = async (plansArray) => {
  try {
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

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // // Log the final request details
    // console.log('Making API request with config:', requestConfig);

    // Make the POST request with clean payload
    const response = await axios.post(
      import.meta.env.VITE_PLANHATTAN_API_BASE_URL + '/pois/recommendation',
      payload, // This is now an array of plan objects
      requestConfig
    );

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