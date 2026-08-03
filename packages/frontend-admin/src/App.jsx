import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LugaresList from './pages/lugares/LugaresList';
import LugarForm from './pages/lugares/LugarForm';
import ReservasList from './pages/reservas/ReservasList';
import GuiasList from './pages/guias/GuiasList';
import PanelGuia from './pages/guias/PanelGuia';
import PanelComercio from './pages/comercio/PanelComercio';
import Layout from './components/Layout';
import Ubicaciones from './pages/Ubicaciones';
import BancoPreguntas from './pages/eventos/BancoPreguntas';
import EncuestasList from './pages/encuestas/EncuestasList';
import { connectSocket, getSocket } from './services/socket'; // 🆕 importar socket

function App() {
  const { user, loading } = useAuth();

  // 🆕 Conectar socket cuando el usuario está autenticado
  useEffect(() => {
    if (user && user.id) {
      const socket = connectSocket();
      const handleConnect = () => {
        socket.emit('usuario-conectar', user.id);
        console.log('✅ Socket conectado y usuario identificado:', user.id, 'rol:', user.rol);
      };
      if (socket.connected) {
        handleConnect();
      } else {
        socket.once('connect', handleConnect);
      }

      // Limpiar al desconectar (opcional)
      return () => {
        if (socket) {
          socket.off('connect', handleConnect);
        }
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Ruta pública - Login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas - Admin */}
      <Route
        path="/admin/*"
        element={user?.rol === 'admin' ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="lugares" element={<LugaresList />} />
        <Route path="lugares/nuevo" element={<LugarForm />} />
        <Route path="lugares/editar/:id" element={<LugarForm />} />
        <Route path="reservas" element={<ReservasList />} />
        <Route path="guias" element={<GuiasList />} />
        <Route path="eventos" element={<BancoPreguntas />} />
        <Route path="ubicaciones" element={<Ubicaciones />} />
        <Route path="encuestas" element={<EncuestasList />} />
      </Route>

      {/* Ruta protegida - Guía */}
      <Route
        path="/guia"
        element={user?.rol === 'guia' ? <PanelGuia /> : <Navigate to="/login" />}
      />

      {/* Ruta protegida - Comercio */}
      <Route
        path="/comercio"
        element={user?.rol === 'comercio' ? <PanelComercio /> : <Navigate to="/login" />}
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;