import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('🔴🔴🔴 Global error caught:', event.error);
  if (event.error && event.error.message && event.error.message.includes('object with keys')) {
    console.error('🔴🔴🔴 OBJECT RENDERING ERROR DETECTED!');
    console.error('🔴🔴🔴 Error details:', event.error);
    console.error('🔴🔴🔴 This error usually happens when trying to render an object directly in JSX');
    console.error('🔴🔴🔴 Look for components that might be rendering {seals, rewards} directly');
  }
});

// Override console.error to catch React errors
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('object with keys')) {
    console.warn('🔴🔴🔴 FOUND THE PROBLEMATIC OBJECT RENDERING!');
    console.warn('🔴🔴🔴 Stack trace:', new Error().stack);
  }
  originalError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
