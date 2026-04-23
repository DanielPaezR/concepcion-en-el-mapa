const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const lugarRoutes = require('./routes/lugarRoutes');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const encuestaRoutes = require('./routes/encuestaRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const insigniaRoutes = require('./routes/insigniaRoutes');
const lugarEspecialRoutes = require('./routes/lugarEspecialRoutes');
const authTuristaRoutes = require('./routes/authTuristaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const metricasRoutes = require('./routes/metricasRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const descubrimientoRoutes = require('./routes/descubrimientoRoutes');
const turistaRoutes = require('./routes/turistaRoutes');
const escaneoRoutes = require('./routes/escaneoRoutes');
const adminEventosRoutes = require('./routes/adminEventosRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

// Middlewares
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://frontend-turista.vercel.app',
    'https://frontend-turista.vercel.app',
    'https://frontend-admin-one-jet.vercel.app',
    'https://concepcion-turista.vercel.app',
    'https://concepcion-admin.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como apps móviles o Postman)
        if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(null, true); // Permitir temporalmente para pruebas de campo
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/lugares', lugarRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/insignias', insigniaRoutes);
app.use('/api/lugar-especial', lugarEspecialRoutes);
app.use('/api/auth/turista', authTuristaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/guardianes', guardianRoutes);
app.use('/api/descubrimientos', descubrimientoRoutes);
app.use('/api/turista', turistaRoutes);
app.use('/api/escaneos', escaneoRoutes);
app.use('/api/admin/eventos', adminEventosRoutes);
app.use('/api/eventos', eventoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API Concepción en el Mapa',
        version: '1.0.0',
        status: 'online'
    });
});

// Manejador de errores 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

module.exports = app;