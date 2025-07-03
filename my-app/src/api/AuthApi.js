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
  console.log(`[API] Received response from ${response.config.url} (Status: ${response.status})`);
  return response;
}, error => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    userStorage.clearUser();
  }
  return Promise.reject(error);
});

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
    console.log('[Auth] Starting login process...');
    const params = new URLSearchParams();
    params.append('username', userData.username);
    params.append('password', userData.password);

    console.log('[Auth] Login request payload:', {
      username: userData.username,
      password: '***' // Masked for security
    });

    const response = await apiClient.post('/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('[Auth] Login response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
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

    console.log('[Auth] CSRF token response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? 
            response.data.substring(0, 100) + '...' : 
            response.data
    });

    let token;
    if (response.headers['content-type']?.includes('application/json')) {
      token = response.data?.token || response.data?.csrfToken;
      console.log('[Auth] Extracted CSRF token from JSON:', token);
    } else {
      const match = response.data.match(/name="_csrf"[^>]*value="([^"]+)"/);
      token = match?.[1];
      console.log('[Auth] Extracted CSRF token from HTML:', token);
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
      console.log('[Auth] Initiating logout...');
      
      // Get the existing CSRF token from storage
      const csrfToken = userStorage.getCsrfToken();
      
      if (!csrfToken) {
        console.warn('[Auth] No CSRF token available, proceeding with logout anyway');
        userStorage.clearUser();
        return { success: true };
      }

      console.log('[Auth] Using existing CSRF token for logout:', csrfToken);
      
      try {
        const response = await apiClient.post('/logout', {}, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json'
          }
        });

        console.log('[Auth] Logout successful');
        userStorage.clearUser();
        return { success: true, data: response.data };
      } catch (error) {
        console.error('[Auth] Logout request failed:', error);
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
      console.error('[Auth] Logout process error:', error);
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
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
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
      
      const storedUser = localStorage.getItem('currentUser');
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
      localStorage.removeItem('currentUser');
      localStorage.removeItem('csrfToken');
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
      localStorage.setItem('csrfToken', token);
      apiClient.defaults.headers.common['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('Error saving CSRF token:', error);
    }
  },

  getCsrfToken: () => {
    try {
      return localStorage.getItem('csrfToken');
    } catch (error) {
      console.error('Error retrieving CSRF token:', error);
      return null;
    }
  },

  clearCsrfToken: () => {
    try {
      localStorage.removeItem('csrfToken');
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