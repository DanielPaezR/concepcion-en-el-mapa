import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, User, Lock, LogIn } from 'lucide-react';
import { registerUser, loginUser } from '../services/auth';

export default function RegistroModal({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = isLogin 
      ? await loginUser(email, password)
      : await registerUser(email, nombre, password);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/70 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {isLogin ? <LogIn className="w-5 h-5 text-green-600" /> : '📝'} 
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {isLogin ? '¡Bienvenido de nuevo! Ingresa tus datos para continuar.' : 'Para subir fotos y anclar guardianes, necesitas una cuenta. ¡Solo lleva unos segundos!'}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="tu@email.com"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Como quieres aparecer"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarme')}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-green-600 font-medium mt-2 hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}