import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Mapa from './pages/Mapa';
import LugarDetalle from './pages/LugarDetalle';
import SolicitarGuia from './pages/SolicitarGuia';
import Encuesta from './pages/Encuesta';
import { registrarVisita } from './services/escaneo';
import Registro from './pages/Registro';
import LoginTurista from './pages/LoginTurista';
import MisLogros from './pages/MisLogros';
import MisReservas from './pages/MisReservas';
import PerfilGuardian from './pages/PerfilGuardian';
import MisFavoritos from './pages/MisFavoritos';
import NotificacionInsignia from './components/NotificacionInsignia';
import LandingPage from './pages/LandingPage';
import { connectSocket, getSocket } from './services/socket';
import { getTuristaActual } from './services/auth'; // Ajusta según tu función

function App() {
  useEffect(() => {
    // Registrar visita cada vez que se abre la app
    registrarVisita();

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
  }, []);

  return (
    <>
      <NotificacionInsignia />
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
    </>
  );
}

export default App;