import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { initAnonymousUser } from './services/auth';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// 🔥 REGISTRO DEL SW - INDEPENDIENTE DEL LOGIN (se ejecuta inmediatamente)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const { Workbox } = await import('workbox-window');
            const wb = new Workbox('/sw.js');
            
            wb.addEventListener('installed', (event) => {
                if (event.isUpdate) {
                    console.log('🔄 Turista PWA: Nueva versión disponible');
                } else {
                    console.log('✅ Turista PWA: Service Worker instalado');
                }
            });
            
            await wb.register();
            console.log('✅ Turista PWA: Service Worker registrado');
            
            // Notificaciones - solo pedir permiso, no requiere login
            if ('Notification' in window && Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                console.log('🔔 Turista - Permiso de notificaciones:', permission);
            }
        } catch (err) {
            console.error('❌ Turista PWA: Error al registrar Service Worker', err);
        }
    });
} else if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
    // En desarrollo, desregistrar SW viejos
    navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(registration => registration.unregister()));
}

// Inicializar usuario anónimo (esto es aparte, no bloquea el SW)
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