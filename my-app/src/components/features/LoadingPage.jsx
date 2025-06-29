import React from 'react';
import './LoadingPage.css';
import loadingGif from '../../assests/loading.gif'; 

function Loading() {
  return (
    <div className="loading-container">
      <img src={loadingGif} alt="Loading..." className="loading-gif" />
    </div>
  );
}

export default Loading;