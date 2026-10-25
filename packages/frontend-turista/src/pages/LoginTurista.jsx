import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginUser } from '../services/auth';
import BotonGoogle from '../components/BotonGoogle';
import toast from 'react-hot-toast';
import { useVolver, destinoSeguro } from '../utils/navegacion';

export default function LoginTurista() {
    const navigate = useNavigate();
    // ?volver=/anuncios/nuevo: al entrar sigue con lo que estaba haciendo (antes siempre iba al mapa)
    const [params] = useSearchParams();
    const destino = destinoSeguro(params.get('volver'), '/');
    const volver = useVolver('/landing');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const result = await loginUser(formData.email, formData.password);
        
        if (result.success) {
            toast.success('¡Bienvenido de vuelta!');
            setTimeout(() => {
                navigate(destino, { replace: true });
            }, 1500);
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
            >
                <div className="text-center mb-8">
                    <button type="button" onClick={volver} className="inline-flex items-center text-green-600 text-sm mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Ingresa para continuar tu aventura
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <BotonGoogle
                    onExito={() => { toast.success('¡Bienvenido!'); setTimeout(() => navigate(destino, { replace: true }), 1200); }}
                    onError={(msg) => setError(msg || 'No se pudo entrar con Google')}
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Tu contraseña"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 mt-6"
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600 mb-3">¿No tienes cuenta?</p>
                    <Link
                        to={params.get('volver') ? `/registro?volver=${encodeURIComponent(destino)}` : '/registro'}
                        className="block w-full border-2 border-green-600 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                    >
                        Registrarse
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}