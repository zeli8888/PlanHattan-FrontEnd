import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MapProvider } from './contexts/MapContext.jsx';
import App from './App.jsx';
import './index.css';
import { MyPlansProvider } from './contexts/MyPlansProvider.jsx';

const routerConfig = {
  basename: import.meta.env.VITE_REACT_APP_CONTEXT
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter {...routerConfig}>
      <MapProvider>
        <MyPlansProvider>
          <App />
        </MyPlansProvider>
      </MapProvider>
    </BrowserRouter>
  </React.StrictMode>
);