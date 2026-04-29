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
import PWAInstallPrompt from './components/PwaPrompt';

function App() {
  useEffect(() => {
    // Registrar visita cada vez que se abre la app
    registrarVisita();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Mapa />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/lugar/:id" element={<LugarDetalle />} />
      <Route path="/solicitar-guia/:lugarId" element={<SolicitarGuia />} />
      <Route path="/encuesta/:reservaId" element={<Encuesta />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login-turista" element={<LoginTurista />} />
      <Route path="/mis-logros" element={<MisLogros />} />
      <Route path="/mis-reservas" element={<MisReservas />} />
      <Route path="/perfil/:id" element={<PerfilGuardian />} />
      <Route path="/mis-favoritos" element={<MisFavoritos />} />
      <PwaPrompt />
    </Routes>
  );
}

export default App;