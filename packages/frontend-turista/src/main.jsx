import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
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

// Persistimos el caché en localStorage — así, al reabrir la app, los
// datos que casi no cambian (lugares, comercios, eventos) aparecen al
// instante en vez de esperar la red, mientras se refrescan por detrás.
// OJO: solo persistimos esas listas — datos propios del turista
// (descubrimientos, perfil, si puede calificar, etc.) se excluyen a
// propósito, para que esos siempre se pidan frescos.
const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'CEM_QUERY_CACHE',
});

const CLAVES_PERSISTIBLES = ['lugares', 'comercios', 'eventos-activos', 'lugar'];

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
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{
                    persister: localStoragePersister,
                    maxAge: 1000 * 60 * 60 * 24, // 24h — pasado eso, el caché guardado se descarta y se pide de cero
                    dehydrateOptions: {
                        shouldDehydrateQuery: (query) => CLAVES_PERSISTIBLES.includes(query.queryKey[0]),
                    },
                }}
            >
                <BrowserRouter>
                    <App />
                    <Toaster position="top-center" />
                </BrowserRouter>
            </PersistQueryClientProvider>
        </React.StrictMode>
    );
});