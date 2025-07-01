import React, { useState } from 'react';
import './Auth.css';

const SignIn = ({ onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign In Data:', formData);
    // Add your sign in logic here
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

            <form onSubmit={handleSubmit}>
              <div className="input-group email-field">
                <label>Username</label>
                <input 
                  type="email" 
                  name="email"
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

              <button type="submit" className="signin-btn">
                Sign In
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