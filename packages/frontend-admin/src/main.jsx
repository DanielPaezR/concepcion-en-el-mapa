import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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

// Registro del Service Worker solo en producción usando Workbox
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox('/sw.js');
      
      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          console.log('🔄 Admin PWA: Nueva versión disponible');
        } else {
          console.log('✅ Admin PWA: Service Worker instalado');
        }
      });
      
      await wb.register();
      console.log('✅ Admin PWA: Service Worker registrado');
      
      // Notificaciones
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('🔔 Admin - Permiso de notificaciones:', permission);
        if (permission === 'granted' && localStorage.getItem('token')) {
          const { subscribeUser } = await import('./services/pushNotifications');
          await subscribeUser();
        }
      }
    } catch (err) {
      console.error('❌ Admin PWA: Error al registrar Service Worker', err);
    }
  });
}