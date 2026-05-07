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
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(async (reg) => {
                console.log('✅ PWA: Service Worker registrado con éxito', reg.scope);
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    console.log('🔔 Permiso de notificaciones:', permission);
                    if (permission === 'granted') {
                        await subscribeUser();
                    }
                }
            })
            .catch(err => console.error('❌ PWA: Error al registrar Service Worker', err));
    });
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(registration => registration.unregister()));
}
