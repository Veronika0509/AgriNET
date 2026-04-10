import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";

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