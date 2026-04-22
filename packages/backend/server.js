const http = require('http');
const socketIo = require('socket.io');
const app = require('./src/app');
require('dotenv').config();
require('./src/jobs/generarEventos');

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
        credentials: true
    }
});

// Pool de conexiones para consultas
const pool = require('./src/config/database');

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
    console.log('🔌 Nuevo cliente conectado:', socket.id);
    
    // Guía se conecta
    socket.on('guia-conectar', async (data) => {
        const { guiaId, disponible } = data;
        console.log(`✅ Guía ${guiaId} conectado, disponible: ${disponible}`);
        
        try {
            await pool.query(
                `INSERT INTO guias_conectados (guia_id, socket_id, disponible, ultima_actividad)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (guia_id) DO UPDATE SET 
                    socket_id = EXCLUDED.socket_id,
                    disponible = EXCLUDED.disponible,
                    ultima_actividad = NOW()`,
                [guiaId, socket.id, disponible !== false]
            );
        } catch (error) {
            console.error('Error al registrar guía:', error);
        }
    });
    
    // Guía actualiza disponibilidad
    socket.on('guia-disponibilidad', async (data) => {
        const { guiaId, disponible } = data;
        
        try {
            await pool.query(
                'UPDATE guias_conectados SET disponible = $1, ultima_actividad = NOW() WHERE guia_id = $2',
                [disponible, guiaId]
            );
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    // Guía acepta una reserva
    socket.on('aceptar-reserva', async (data) => {
        const { reservaId, guiaId } = data;
        
        try {
            // Verificar que la reserva siga pendiente Y sin guía asignado
            const reserva = await pool.query(
                'SELECT * FROM reservas_guia WHERE id = $1 AND estado = $2 AND guia_id IS NULL',
                [reservaId, 'pendiente']
            );
            
            if (reserva.rows.length === 0) {
                socket.emit('reserva-ya-asignada', { reservaId });
                return;
            }
            
            // Asignar reserva al guía
            await pool.query(
                'UPDATE reservas_guia SET guia_id = $1, estado = $2 WHERE id = $3',
                [guiaId, 'confirmada', reservaId]
            );
            
            // Notificar a todos los guías que la reserva fue tomada
            io.emit('reserva-asignada', { reservaId, guiaId });
            
            // Notificar al guía que aceptó
            socket.emit('reserva-confirmada', { reservaId });
            
        } catch (error) {
            console.error('Error:', error);
            socket.emit('error', { message: 'Error al aceptar reserva' });
        }
    });
    
    // Guía se desconecta
    socket.on('disconnect', async () => {
        console.log('🔌 Cliente desconectado:', socket.id);
        
        try {
            await pool.query('DELETE FROM guias_conectados WHERE socket_id = $1', [socket.id]);
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`
  🚀 Servidor corriendo en http://localhost:${PORT}
  📚 API Documentación: http://localhost:${PORT}/api-docs
  🔌 Socket.IO corriendo en ws://localhost:${PORT}
  ⚡ Entorno: ${process.env.NODE_ENV || 'development'}
  `);
});