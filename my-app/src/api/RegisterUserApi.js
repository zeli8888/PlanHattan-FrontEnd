import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://137.43.49.25:443/api';

export const registerUser = async (userData) => {
  try {
    console.log('Making request to:', `${API_BASE_URL}/register`);
    console.log('Request payload:', {
      email: userData.email,
      userName: userData.userName,
      userPicture: userData.userPicture || '',
      password: userData.password
    });

    const response = await axios.post(`${API_BASE_URL}/register`, {
      email: userData.email,
      password: userData.password, 
      userName: userData.userName,
      userPicture: userData.userPicture || ''
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Request successful. Response:', response.data);
    return response.data;

  } catch (error) {
    console.error('Request failed:', {
      url: `${API_BASE_URL}/register`,
      error: error.response?.data || error.message
    });
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Registration failed'
    );
  }
};