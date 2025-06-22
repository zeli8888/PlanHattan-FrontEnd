import React, { useState } from 'react';
import './SignIn.css';

const SignIn = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    console.log(formData);
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
            <h2 className={`form-title ${isLogin ? 'login' : 'signup'}`}>
              {isLogin ? 'Sign in to' : 'Create an account on'} <span>PlanHattan</span>
            </h2>

            <div className="social-buttons">
              <button className="google-btn">
                <span className="icon">G</span> {isLogin ? 'Sign in' : 'Sign up'} with Google
              </button>
            </div>

            <hr className="divider" />
            <p className="or">Or {isLogin ? 'sign in' : 'sign up'} using your email address</p>

            <form onSubmit={handleSubmit}>
              {/* Name Field - Only in Signup */}
              <div className={`input-group name-field ${!isLogin ? 'visible' : ''}`}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>

              {/* Email Field - Always visible */}
              <div className="input-group email-field">
                <label>Your Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="tourist@gmail.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Fields Container */}
              <div className={`password-container ${isLogin ? 'login' : 'signup'}`}>
                {/* Password Field - Always visible */}
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

                {/* Confirm Password - Only in Signup */}
                <div className={`input-group confirm-field ${!isLogin ? 'visible' : ''}`}>
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="********" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>

              {/* Remember Me - Only in Login */}
              <div className={`remember-forgot ${isLogin ? 'visible' : ''}`}>
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="signin-btn">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>

              <p className="footer">
                {isLogin ? 'New user?' : 'Already have an account?'}{' '}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(!isLogin);
                }}>
                  {isLogin ? 'Create an account' : 'Sign in'}
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