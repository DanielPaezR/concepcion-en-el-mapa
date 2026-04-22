import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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

  // No hay usuario: mostrar login
  if (!user) {
    return <Login />;
  }

  // Admin: mostrar layout con todas las opciones
  if (user.rol === 'admin') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="lugares" element={<LugaresList />} />
          <Route path="lugares/nuevo" element={<LugarForm />} />
          <Route path="lugares/editar/:id" element={<LugarForm />} />
          <Route path="reservas" element={<ReservasList />} />
          <Route path="guias" element={<GuiasList />} />
          <Route path="admin/eventos" element={<BancoPreguntas />} />
        </Route>
      </Routes>
    );
  }

  // Guía: mostrar solo su panel (sin Layout)
  if (user.rol === 'guia') {
    return <PanelGuia />;
  }

  return <Navigate to="/login" />;
}

export default App;