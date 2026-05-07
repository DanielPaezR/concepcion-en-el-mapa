import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { subscribeUser } from './services/pushNotifications';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        console.log('✅ Admin PWA: Service Worker registrado con éxito', reg.scope);
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('🔔 Permiso de notificaciones:', permission);
          if (permission === 'granted' && localStorage.getItem('token')) {
            await subscribeUser();
          }
        }
      })
      .catch((err) => console.error('❌ Admin PWA: Error registrando Service Worker', err));
  });
}
