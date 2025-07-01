import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AuthContainer = ({ initialView = 'signin' }) => {
  const [isSignIn, setIsSignIn] = useState(initialView === 'signin');

  const switchToSignUp = () => {
    setIsSignIn(false);
  };

  const switchToSignIn = () => {
    setIsSignIn(true);
  };

  return (
    <>
      {isSignIn ? (
        <SignIn onSwitchToSignUp={switchToSignUp} />
      ) : (
        <SignUp onSwitchToSignIn={switchToSignIn} />
      )}
    </>
  );
};

export default AuthContainer;