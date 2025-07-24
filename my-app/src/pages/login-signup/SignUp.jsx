import React, { useState } from 'react';
import './Auth.css';
import { authAPI } from '../../api/AuthApi'; 
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

    const handleHomeNavigate = () => {
      navigate('/');
  };
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await authAPI.register({
        username: formData.username,
        password: formData.password
      });
      
      if (result.success) {
        setSuccess('Registration successful! You can now sign in.');
        // Reset form
        setFormData({
          username: '',
          password: '',
          confirmPassword: ''
        });
        
        // Optional: Auto-switch to sign in after successful registration
        setTimeout(() => {
          onSwitchToSignIn();
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error);
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="planner-page">
      <div className="navbar">
        <div className="navbar-logo" onClick={handleHomeNavigate}>
          PLAN<span>HATTAN</span>
        </div>
      </div>
      
      <div className="planner-layout">
        <div className="planner-left"></div>

        <div className="planner-right">
          <div className="container">
            <h2 className="form-title signup">
              Create an account on <span>PlanHattan</span>
            </h2>

            <hr className="divider" />
            <p className="or">Sign up using your email address</p>

            {error && (
              <div className="error-message" style={{ 
                color: '#ff4444', 
                backgroundColor: '#ffebee', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" style={{ 
                color: '#4caf50', 
                backgroundColor: '#e8f5e8', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

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
                  disabled={isLoading}
                />
              </div>

              <div className="password-container signup">
                <div className="input-group password-field">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="********" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group confirm-field visible">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="********" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="signin-btn"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="footer">
                Already have an account?{' '}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  onSwitchToSignIn();
                }}>
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;