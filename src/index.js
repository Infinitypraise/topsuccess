// src/main.jsx
// This is the very first file React executes.
// It finds the <div id='root'> in index.html and renders the App into it.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';   // Tailwind CSS global styles
import reportWebVitals from './reportWebVitals';
import App from './App.jsx';

// createRoot is the modern React 18 API for mounting the app.
// StrictMode enables extra development warnings — it has no effect in production.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      BrowserRouter enables client-side routing using the browser's History API.
      It must wrap the entire App so that all <Link>, <NavLink>, and useNavigate()
      hooks work anywhere in the component tree.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
