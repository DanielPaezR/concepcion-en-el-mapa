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
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Si hay usuario, redirigir según su rol */}
      {user && user.rol === 'admin' && (
        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="lugares" element={<LugaresList />} />
          <Route path="lugares/nuevo" element={<LugarForm />} />
          <Route path="lugares/editar/:id" element={<LugarForm />} />
          <Route path="reservas" element={<ReservasList />} />
          <Route path="guias" element={<GuiasList />} />
          <Route path="eventos" element={<BancoPreguntas />} />
        </Route>
      )}

      {user && user.rol === 'guia' && (
        <Route path="/guia" element={<PanelGuia />} />
      )}

      {/* Redirección después de login */}
      <Route
        path="*"
        element={
          user ? (
            user.rol === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user.rol === 'guia' ? (
              <Navigate to="/guia" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default App; 