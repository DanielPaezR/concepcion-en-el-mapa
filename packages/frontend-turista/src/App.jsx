import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Mapa from './pages/Mapa';
import LugarDetalle from './pages/LugarDetalle';
import SolicitarGuia from './pages/SolicitarGuia';
import Encuesta from './pages/Encuesta';
import { registrarVisita } from './services/escaneo';

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
    </Routes>
  );
}

export default App;