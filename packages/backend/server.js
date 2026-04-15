const app = require('./src/app');
require('dotenv').config();

require('./src/jobs/generarEventos');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 Servidor corriendo en http://localhost:${PORT}
  📚 API Documentación: http://localhost:${PORT}/api-docs
  ⚡ Entorno: ${process.env.NODE_ENV || 'development'}
  `);
});