import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        const rol = result.user?.rol;
        // Navegación con recarga completa (no navigate() de react-router):
        // useAuth() no comparte estado entre componentes (no hay Context/
        // Provider), así que un navigate() del lado del cliente deja a App
        // con su propio "user" todavía en null y el guard de ruta rebota
        // de vuelta a /login. Forzar una recarga hace que App se remonte
        // y lea el token recién guardado en localStorage.
        if (rol === 'admin') {
          window.location.href = '/admin';
        } else if (rol === 'guia') {
          window.location.href = '/guia';
        } else if (rol === 'comercio') {
          window.location.href = '/comercio';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
          <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}