// components/BotonGoogle.jsx
// Botón "Continuar con Google" (Google Identity Services). Solo aparece si el
// servidor tiene configurado GOOGLE_CLIENT_ID; si no, no muestra nada.
import { useEffect, useRef, useState } from 'react';
import { getConfigAuth, loginGoogle } from '../services/auth';

const SCRIPT_GOOGLE = 'https://accounts.google.com/gsi/client';

const cargarScript = () => new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    let s = document.querySelector(`script[src="${SCRIPT_GOOGLE}"]`);
    if (!s) {
        s = document.createElement('script');
        s.src = SCRIPT_GOOGLE;
        s.async = true;
        document.head.appendChild(s);
    }
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('No se pudo cargar Google')));
});

export default function BotonGoogle({ texto = 'continue_with', onExito, onError }) {
    const contenedor = useRef(null);
    const [activo, setActivo] = useState(false);

    useEffect(() => {
        let cancelado = false;
        (async () => {
            const { google_client_id: clientId } = await getConfigAuth();
            if (!clientId || cancelado) return;
            setActivo(true);
            try {
                await cargarScript();
                if (cancelado || !contenedor.current) return;
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async ({ credential }) => {
                        const r = await loginGoogle(credential);
                        if (r.success) onExito?.(r.usuario);
                        else onError?.(r.error);
                    },
                });
                window.google.accounts.id.renderButton(contenedor.current, {
                    theme: 'outline', size: 'large', text: texto, shape: 'pill',
                    width: Math.min(contenedor.current.offsetWidth || 320, 400), locale: 'es',
                });
            } catch (e) {
                onError?.(e.message);
            }
        })();
        return () => { cancelado = true; };
    }, []);

    if (!activo) return null;
    return (
        <div>
            <div ref={contenedor} className="flex justify-center min-h-[44px]" />
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">o con tu correo</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>
        </div>
    );
}
