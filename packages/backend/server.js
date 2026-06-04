const app = require('./src/app');
const http = require('http');
const { initializeSocket } = require('./src/socket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// 🔥 Inicializar Socket.IO
const io = initializeSocket(server);
app.set('io', io);

// Hacer io accesible globalmente (opcional, para usar en otros archivos)
global.io = io;

server.listen(PORT, () => {
  console.log(`
  🚀 Servidor corriendo en http://localhost:${PORT}
  📚 API Documentación: http://localhost:${PORT}/api-docs
  🔌 WebSocket server ready
  ⚡ Entorno: ${process.env.NODE_ENV || 'development'}
  `);
});