import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the ReactDOM client to render the app
import App from './App'; // Import the main App component
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import './i18'; 

// Create the root element where the app will be rendered
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application inside the root element
root.render(
  <React.StrictMode> {/* Enforces strict mode to highlight potential problems */}
    <BrowserRouter> {/* Provides routing context to the entire app */}
      <App/> {/* The main app component */}
    </BrowserRouter>
  </React.StrictMode>
);
