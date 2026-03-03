const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const lugarRoutes = require('./routes/lugarRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/lugares', lugarRoutes);

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