// pages/LandingPage.jsx
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-green-700 mb-4">Concepción en el Mapa</h1>
        <p className="text-xl text-gray-600 mb-8">Panel de Administración</p>
        <Link
          to="/login"
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}