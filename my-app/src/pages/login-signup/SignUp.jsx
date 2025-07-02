import React, { useState } from 'react';
import './Auth.css';
import { registerUser } from '../../api/RegisterUserApi';

const SignUp = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        userName: formData.username,
        password: formData.password,
      };

      console.log('Attempting registration with:', registrationData);
      
      const response = await registerUser(registrationData);
      console.log('Registration successful:', response);
      
      alert('Registration successful! You can now sign in.');
      onSwitchToSignIn();
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
            <h2 className="form-title signup">
              Create an account on <span>PlanHattan</span>
            </h2>

            <div className="social-buttons">
              <button className="google-btn">
                <span className="icon">G</span> Sign up with Google
              </button>
            </div>

            <hr className="divider" />
            <p className="or">Or sign up using your email address</p>

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
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="signin-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
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