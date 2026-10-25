// utils/navegacion.js
import { useNavigate } from 'react-router-dom';

// "Volver" que regresa a la pantalla anterior de la app (la landing o el
// mapa, según de dónde llegaste). Si la página se abrió directo desde un
// enlace y no hay historial dentro de la app, va al destino de respaldo.
export function useVolver(respaldo = '/landing') {
  const navigate = useNavigate();
  return () => {
    // React Router guarda en history.state.idx cuántas pantallas lleva la app
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(respaldo, { replace: true });
  };
}

// Ruta interna segura para ?volver= (evita redirigir a otro sitio)
export const destinoSeguro = (valor, respaldo = '/') =>
  typeof valor === 'string' && valor.startsWith('/') && !valor.startsWith('//') ? valor : respaldo;
