// api/auth.js
import axios from 'axios';

const BASE_URL = 'https://planhattan.ddns.net/api';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for session cookies
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  const user = userStorage.getUser();
  const csrfToken = userStorage.getCsrfToken();
  
  if (user?.token) {
    config.headers['Authorization'] = `Bearer ${user.token}`;
  }
  
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    userStorage.clearUser();
  }
  return Promise.reject(error);
});

// Get User Profile function
export const getUserProfile = async () => {
    try {
        const csrfToken = sessionStorage.getItem('csrfToken');
    
        if (!csrfToken) {
            throw new Error('CSRF token not found in sessionStorage');
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        };
        
        const response = await apiClient.get('/user', {
            headers: headers,
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', {
        userName: userData.username,
        password: userData.password
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

// Login user
login: async (userData) => {
  try {
    const params = new URLSearchParams();
    params.append('username', userData.username);
    params.append('password', userData.password);

    const response = await apiClient.post('/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    const userDataToStore = {
      username: userData.username,
      ...response.data
    };
    userStorage.setUser(userDataToStore);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('[Auth] Login error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : undefined
    });
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
},

// Get CSRF token
getCsrfToken: async () => {
  try {
    const response = await apiClient.get('/csrf-token', {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Explicitly mark as AJAX
      }
    });

    let token;
    if (response.headers['content-type']?.includes('application/json')) {
      token = response.data?.token || response.data?.csrfToken;
    } else {
      const match = response.data.match(/name="_csrf"[^>]*value="([^"]+)"/);
      token = match?.[1];
    }

    if (!token) {
      console.error('[Auth] No CSRF token found in response');
      throw new Error('No CSRF token found');
    }
    
    userStorage.setCsrfToken(token);
    return { success: true, token };
    
  } catch (error) {
    console.error('[Auth] CSRF token error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : undefined
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
},

  // Logout user
logout: async () => {
    try {      
      // Get the existing CSRF token from storage
      const csrfToken = userStorage.getCsrfToken();
      
      if (!csrfToken) {
        userStorage.clearUser();
        return { success: true };
      }

      try {
        const response = await apiClient.post('/logout', {}, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json'
          }
        });

        userStorage.clearUser();
        return { success: true, data: response.data };
      } catch (error) {
        // Still clear user data even if request fails
        userStorage.clearUser();
        
        // Don't attempt to get new CSRF token - just return the error
        return { 
          success: false,
          error: error.response?.data?.message || error.message,
          status: error.response?.status 
        };
      }
      
    } catch (error) {
      userStorage.clearUser();
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
};

// User storage utilities
export const userStorage = {
  setUser: (userData) => {
    try {
      window.currentUser = userData;
      sessionStorage.setItem('currentUser', JSON.stringify(userData)); // Store in sessionStorage
      
      if (userData.token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },
  
  getUser: () => {
    try {
      if (window.currentUser) return window.currentUser;
      
      const storedUser = sessionStorage.getItem('currentUser'); // Get from sessionStorage
      if (storedUser) {
        const user = JSON.parse(storedUser);
        window.currentUser = user;
        
        if (user.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },
  
  clearUser: () => {
    try {
      window.currentUser = null;
      sessionStorage.removeItem('currentUser'); // Clear from sessionStorage
      sessionStorage.removeItem('csrfToken'); // Clear CSRF token from sessionStorage
      delete apiClient.defaults.headers.common['Authorization'];
      delete apiClient.defaults.headers.common['X-CSRF-Token'];
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },
  
  isAuthenticated: () => {
    return !!userStorage.getUser();
  },

  setCsrfToken: (token) => {
    try {
      sessionStorage.setItem('csrfToken', token); // Store in sessionStorage
      apiClient.defaults.headers.common['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('Error saving CSRF token:', error);
    }
  },

  getCsrfToken: () => {
    try {
      return sessionStorage.getItem('csrfToken'); // Get from sessionStorage
    } catch (error) {
      console.error('Error retrieving CSRF token:', error);
      return null;
    }
  },

  clearCsrfToken: () => {
    try {
      sessionStorage.removeItem('csrfToken'); // Clear from sessionStorage
      delete apiClient.defaults.headers.common['X-CSRF-Token'];
    } catch (error) {
      console.error('Error clearing CSRF token:', error);
    }
  }
};

// Initialize auth on app load
const initializeAuth = () => {
  const user = userStorage.getUser();
  if (user?.token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
  }

  const csrfToken = userStorage.getCsrfToken();
  if (csrfToken) {
    apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
  }
};

initializeAuth();

export { apiClient };