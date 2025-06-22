import React from 'react';
import './SignIn.css';

const SignIn = () => {
  return(
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
            <h2>Sign in to <span>PlanHattan</span></h2>

            <div className="social-buttons">
              <button className="google-btn">
                <span className="icon">G</span> Sign in with Google
              </button>
            </div>

            <hr className="divider" />
            <p className="or">Or sign in using your email address</p>

            <div className="input-group">
              <label>Your Email</label>
              <input type="email" placeholder="tourist@gmail.com" />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="********" />
            </div>

            <div className="remember-forgot">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>

            <button className="signin-btn">Sign In</button>

            <p className="footer">
              New user? <a href="#">Create an account</a>
            </p>
          </div>
                </div>
      </div>
    </div>
   );
};

export default SignIn;