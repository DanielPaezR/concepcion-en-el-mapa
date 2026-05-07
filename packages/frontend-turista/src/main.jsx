import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { initAnonymousUser } from './services/auth';
import { subscribeUser } from './services/pushNotifications';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Inicializar usuario anónimo (nuevo método)
initAnonymousUser().then(() => {
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
});

// Registro del Service Worker solo en producción para evitar cache viejo durante desarrollo.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        // Esperar a que el SW generado por VitePWA esté listo
        const { Workbox } = await import('workbox-window');
        
        if ('serviceWorker' in navigator) {
            const wb = new Workbox('/sw.js');
            
            wb.addEventListener('installed', (event) => {
                if (event.isUpdate) {
                    console.log('🔄 PWA: Nueva versión disponible');
                } else {
                    console.log('✅ PWA: Service Worker instalado');
                }
            });
            
            wb.register();
            
            // Notificaciones
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('🔔 Permiso de notificaciones:', permission);
                if (permission === 'granted') {
                    const { subscribeUser } = await import('./services/pushNotifications');
                    await subscribeUser();
                }
            }
        }
    });
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(registration => registration.unregister()));
}
