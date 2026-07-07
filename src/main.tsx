import React from 'react';
import {createRoot} from 'react-dom/client';
import axios from 'axios';
import App from './App';
import { BrowserRouter } from "react-router-dom";

// Identify this client's API version to the server on every request.
// Without a Version header the server defaults to 13.2 (< 18) and routes weather
// data through the deprecated legacy renderer, which throws for some stations and
// gets silently swallowed by list endpoints — dropping those units from the Data
// List even though they show on the map. Sending a modern version keeps the server
// on its current code path. Keep in sync with the native app version.
axios.defaults.headers.common['Version'] = '42.2.1';

const Router = BrowserRouter as unknown as React.ComponentType<{ basename: string; children: React.ReactNode }>;

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Router basename="/AgriNET">
      <App/>
    </Router>
  </React.StrictMode>
)