import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';
import { registerUser } from '../services/auth';
import BotonGoogle from '../components/BotonGoogle';
import toast from 'react-hot-toast';

export default function Registro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const entrar = (mensaje) => {
        toast.success(mensaje);
        setTimeout(() => navigate('/'), 1500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }

        if (formData.telefono.trim() && formData.telefono.replace(/\D/g, '').length < 10) {
            newErrors.telefono = 'Escribe un número de 10 dígitos (ej. 3001234567)';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        const result = await registerUser(
            formData.email.trim(),
            formData.nombre.trim(),
            formData.password,
            formData.telefono.trim()
        );

        if (result.success) {
            entrar('¡Registro exitoso! Ahora puedes solicitar guías.');
        } else {
            toast.error(result.error || 'Error al registrarse');
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
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center text-green-600 text-sm mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al mapa
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Regístrate para solicitar guías, publicar anuncios y guardar tu progreso
                    </p>
                </div>

                <BotonGoogle
                    texto="signup_with"
                    onExito={() => entrar('¡Bienvenido! Entraste con Google.')}
                    onError={(msg) => toast.error(msg || 'No se pudo entrar con Google')}
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                placeholder="Tu nombre"
                            />
                        </div>
                        {errors.nombre && (
                            <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Email */}
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
                                className={`w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                placeholder="tu@email.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* WhatsApp (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp <span className="text-gray-400 font-normal">(opcional, para tus anuncios)</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                placeholder="300 123 4567"
                            />
                        </div>
                        {errors.telefono && (
                            <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                        )}
                    </div>

                    {/* Contraseña */}
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
                                className={`w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                placeholder="Mínimo 6 caracteres"
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
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                placeholder="Repite tu contraseña"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Botón de registro */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 mt-6"
                    >
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                {/* Link a login */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login-turista" className="text-green-600 font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
