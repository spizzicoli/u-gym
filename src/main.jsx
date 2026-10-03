import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './lib/firebase';
import './styles/global.scss';

// Capacitor owns the native launch splash. Do not manually show/hide it here:
// doing so created the double-splash + 3 second delay.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
