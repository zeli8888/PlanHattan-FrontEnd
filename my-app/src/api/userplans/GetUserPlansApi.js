import axios from 'axios';

const getUserPlans = async () => {
  try {
    // Get CSRF token from localStorage
    const csrfToken = localStorage.getItem('csrfToken');

    if (!csrfToken) {
      throw new Error('CSRF token not found in localStorage');
    }

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      withCredentials: true // Include cookies for session-based auth
    };

    // Make the GET request
    const response = await axios.get(
      import.meta.env.VITE_PLANHATTAN_API_BASE_URL + '/userplans',
      requestConfig
    );

    console.log('Response Status:', response.status);

    return response.data;
  } catch (error) {
    console.error('Error getting user plans:', error);

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

export default getUserPlans;