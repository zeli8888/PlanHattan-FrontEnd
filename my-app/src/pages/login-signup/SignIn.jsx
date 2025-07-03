import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { authAPI, userStorage } from '../../api/AuthApi';

const SignIn = ({ onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Step 1: Login
      const loginResult = await authAPI.login({
        username: formData.username,
        password: formData.password
      });
      
      if (loginResult.success) {
        // Step 2: Store user data
        const userData = {
          username: formData.username,
          ...loginResult.data
        };
        userStorage.setUser(userData);
        
        // Step 3: Fetch CSRF token after successful login
        const csrfResult = await authAPI.getCsrfToken();
        
        if (csrfResult.success) {
          // Store CSRF token
          userStorage.setCsrfToken(csrfResult.token);
          console.log('CSRF token obtained and stored successfully');
          
          // Navigate to home page
          navigate('/');
        } else {
          // Login was successful but CSRF token fetch failed
          // You might want to handle this case differently based on your app's requirements
          console.warn('CSRF token fetch failed:', csrfResult.error);
          setError('Login successful but security token fetch failed. Please try again.');
          
          // Optional: Still navigate to home page if CSRF token is not critical for immediate use
          // navigate('/');
        }
      } else {
        setError(loginResult.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login process error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="planner-page">
      <div className="navbar">
        <div className="navbar-logo">
          PLAN<span>HATTAN</span>
        </div>
      </div>
      
      <div className="planner-layout">
        <div className="planner-left"></div>

        <div className="planner-right">
          <div className="container">
            <h2 className="form-title login">
              Sign in to <span>PlanHattan</span>
            </h2>

            <div className="social-buttons">
              <button className="google-btn">
                <span className="icon" style={{background: 'white', color: 'black'}}>G</span> Sign in with Google
              </button>
            </div>

            <hr className="divider" />
            <p className="or">Or sign in using your email address</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group email-field">
                <label>Username</label>
                <input 
                  type="text"
                  name="username"
                  placeholder="heisenberg" 
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="password-container login">
                <div className="input-group password-field">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="********" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="remember-forgot visible">
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                className="signin-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="footer">
                New user?{' '}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  onSwitchToSignUp();
                }}>
                  Create an account
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;