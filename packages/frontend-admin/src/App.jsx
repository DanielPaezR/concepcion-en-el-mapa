import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LugaresList from './pages/lugares/LugaresList';
import LugarForm from './pages/lugares/LugarForm';
import ReservasList from './pages/reservas/ReservasList';
import GuiasList from './pages/guias/GuiasList';
import PanelGuia from './pages/guias/PanelGuia';
import Layout from './components/Layout';
import BancoPreguntas from './pages/eventos/BancoPreguntas';
import EncuestasList from './pages/encuestas/EncuestasList';
import PwaPrompt from './components/PwaPrompt';

function App() {
  const { user, loading } = useAuth();

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
        <Route path="encuestas" element={<EncuestasList />} />
        <PwaPrompt />
      </Route>

      {/* Ruta protegida - Guía */}
      <Route
        path="/guia"
        element={user?.rol === 'guia' ? <PanelGuia /> : <Navigate to="/login" />}
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;