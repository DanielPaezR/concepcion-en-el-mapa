const express = require('express')
const cors = require('cors')
const lugarRoutes = require('./routes/lugarRoutes')
const authRoutes = require('./routes/authRoutes')
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

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/lugares', lugarRoutes)
app.use('/api/auth', authRoutes)
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


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Concepción en el Mapa', 
    version: '1.0.0', 
    status: 'online' 
  })
})

// Ruta para documentación (si existe)
app.get('/api-docs', (req, res) => {
  res.json({ 
    message: 'Documentación de la API',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        verificar: 'GET /api/auth/verificar'
      },
      lugares: {
        listar: 'GET /api/lugares',
        crear: 'POST /api/lugares',
        obtener: 'GET /api/lugares/:id',
        actualizar: 'PUT /api/lugares/:id',
        eliminar: 'DELETE /api/lugares/:id'
      }
    }
  })
})

module.exports = app
