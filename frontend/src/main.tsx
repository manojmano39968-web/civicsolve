import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register PWA Service Worker in production / supported environments
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        console.log('✅ CivicSolve PWA ServiceWorker registered with scope:', reg.scope);
      })
      .catch(err => {
        console.warn('⚠️ CivicSolve PWA ServiceWorker registration failed:', err);
      });
  });
}

