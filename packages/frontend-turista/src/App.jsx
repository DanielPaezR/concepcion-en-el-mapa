import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { registrarVisita } from './services/escaneo';
import NotificacionInsignia from './components/NotificacionInsignia';
import { connectSocket, getSocket } from './services/socket';
import { getTuristaActual } from './services/auth'; // Ajusta según tu función

// Cada página se carga solo cuando el usuario navega a su ruta, en vez de
// venir todas juntas en el bundle inicial. Esto es lo que hace que /landing
// (la puerta de entrada real desde los letreros con QR) no tenga que
// descargar también todo el peso de Mapa.jsx (Mapbox incluido).
const Mapa            = lazy(() => import('./pages/Mapa'));
const LugarDetalle     = lazy(() => import('./pages/LugarDetalle'));
const SolicitarGuia    = lazy(() => import('./pages/SolicitarGuia'));
const Encuesta         = lazy(() => import('./pages/Encuesta'));
const Registro         = lazy(() => import('./pages/Registro'));
const LoginTurista      = lazy(() => import('./pages/LoginTurista'));
const MisLogros        = lazy(() => import('./pages/MisLogros'));
const MisReservas      = lazy(() => import('./pages/MisReservas'));
const PerfilGuardian    = lazy(() => import('./pages/PerfilGuardian'));
const MisFavoritos      = lazy(() => import('./pages/MisFavoritos'));
const LandingPage       = lazy(() => import('./pages/LandingPage'));

function App() {
  const location = useLocation();
  // La landing es una página puramente informativa (a la que llegan los
  // turistas escaneando el QR de los letreros) — no necesita conexión en
  // tiempo real. Todas las demás rutas sí pueden necesitarla.
  const necesitaSocket = location.pathname !== '/landing';

  useEffect(() => {
    // Registrar visita cada vez que se abre la app
    registrarVisita();

    if (!necesitaSocket) return;

    // Conectar socket y registrar al usuario si está autenticado
    const usuario = getTuristaActual(); // O usa el contexto de autenticación
    if (usuario && usuario.id) {
      const socket = connectSocket();
      const handleConnect = () => {
        socket.emit('usuario-conectar', usuario.id);
        console.log('Socket conectado y usuario registrado:', usuario.id);
      };
      if (socket.connected) {
        handleConnect();
      } else {
        socket.once('connect', handleConnect);
      }
      return () => {
        if (socket) {
          socket.off('connect', handleConnect);
        }
      };
    }
  }, [necesitaSocket]);

  return (
    <>
      <NotificacionInsignia />
      <Suspense fallback={
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0e1a', color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: '.1em'
        }}>
          CARGANDO...
        </div>
      }>
        <Routes>
          <Route path="/" element={<Mapa />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/lugar/:id" element={<LugarDetalle />} />
          <Route path="/solicitar-guia/:lugarId" element={<SolicitarGuia />} />
          <Route path="/encuesta/:reservaId" element={<Encuesta />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login-turista" element={<LoginTurista />} />
          <Route path="/mis-logros" element={<MisLogros />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/perfil/:id" element={<PerfilGuardian />} />
          <Route path="/mis-favoritos" element={<MisFavoritos />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;