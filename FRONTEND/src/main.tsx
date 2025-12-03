import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AlertProvider } from './context/AlertContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AlertProvider>
            <App />
          </AlertProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);