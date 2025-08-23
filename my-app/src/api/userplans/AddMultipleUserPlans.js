import axios from 'axios';

const postMultipleUserPlans = async (planDataArray) => {
  try {
    // Get CSRF token from localStorage
    const csrfToken = sessionStorage.getItem('csrfToken');

    if (!csrfToken) {
      throw new Error('CSRF token not found in session');
    }

    // Prepare the request payload with multiple POIs
    const payload = planDataArray.map(planData => ({
      userPlanId: null,
      poiName: planData.place,
      time: planData.time,
      busyness: planData.predicted,
      latitude: planData.coordinates?.lat || planData.coordinates[0] || null,
      longitude: planData.coordinates?.lng || planData.coordinates[1] || null
    }));

    console.log(payload)
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      withCredentials: true // Include cookies for session-based auth
    };

    // Make the POST request with clean payload
    const response = await axios.post(
      import.meta.env.VITE_PLANHATTAN_API_BASE_URL + '/userplans/multiple',
      payload,
      requestConfig
    );

    console.log('Response Status:', response.status);

    return response.data;
  } catch (error) {
    console.error('Error posting multiple user plans:', error);

    // Detailed error logging
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Network error: No response from server');
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

export default postMultipleUserPlans;