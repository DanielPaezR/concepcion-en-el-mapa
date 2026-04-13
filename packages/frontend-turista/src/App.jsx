// App.jsx - VERSIÓN CORREGIDA
import { Routes, Route } from 'react-router-dom';  // ✅ Ya no importamos BrowserRouter
import Mapa from './pages/Mapa';
import LugarDetalle from './pages/LugarDetalle';
import SolicitarGuia from './pages/SolicitarGuia';
import Encuesta from './pages/Encuesta';

function App() {
  return (
    <Routes>  // ✅ Solo Routes, sin BrowserRouter
      <Route path="/" element={<Mapa />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/lugar/:id" element={<LugarDetalle />} />
      <Route path="/solicitar-guia/:lugarId" element={<SolicitarGuia />} />
      <Route path="/encuesta/:reservaId" element={<Encuesta />} />
    </Routes>
  );
}

export default App;