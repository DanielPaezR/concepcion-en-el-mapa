// packages/backend/src/socket/index.js
const { Server } = require('socket.io');
const pool = require('../config/database');

let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'https://frontend-turista.vercel.app',
                'https://frontend-admin.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 30000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log('🔌 Nuevo cliente conectado:', socket.id);

        // Guía se conecta y se registra
        socket.on('guia-conectar', async (data) => {
            const { guiaId, disponible } = data;
            socket.guiaId = guiaId;
            
            // Unir a una sala personalizada para este guía
            socket.join(`guia_${guiaId}`);
            
            console.log(`✅ Guía ${guiaId} conectado (disponible: ${disponible})`);
            
            // Marcar como conectado en la base de datos
            await pool.query(
                `UPDATE guias_conectados 
                 SET socket_id = $1, ultima_conexion = NOW(), conectado = true
                 WHERE guia_id = $2
                 ON CONFLICT (guia_id) DO UPDATE 
                 SET socket_id = EXCLUDED.socket_id, 
                     ultima_conexion = EXCLUDED.ultima_conexion, 
                     conectado = true`,
                [socket.id, guiaId]
            );
        });

        // Heartbeat para mantener conexión activa
        socket.on('heartbeat', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                await pool.query(
                    `UPDATE guias_conectados 
                     SET ultima_conexion = NOW()
                     WHERE guia_id = $1 AND socket_id = $2`,
                    [guiaId, socket.id]
                );
                socket.emit('heartbeat-ack', { timestamp: Date.now() });
            }
        });

        // Nueva solicitud de reserva
        socket.on('nueva-solicitud', async (data) => {
            const { lugar, lugarId, turistaId, reservaId } = data;
            
            // Buscar guías disponibles
            const guiasDisponibles = await pool.query(
                `SELECT u.id, u.nombre, gc.socket_id
                 FROM usuarios u
                 JOIN guias_conectados gc ON u.id = gc.guia_id
                 WHERE u.rol = 'guia' 
                   AND u.disponible = true 
                   AND gc.conectado = true
                 ORDER BY (SELECT COUNT(*) FROM reservas_guia WHERE guia_id = u.id AND estado = 'pendiente') ASC
                 LIMIT 1`
            );
            
            if (guiasDisponibles.rows.length > 0) {
                const guia = guiasDisponibles.rows[0];
                
                // Emitir notificación al guía
                io.to(`guia_${guia.id}`).emit('nueva-solicitud', {
                    reservaId,
                    lugar,
                    lugarId,
                    turistaId,
                    guiaId: guia.id
                });
                
                console.log(`📢 Notificación enviada a guía ${guia.id} para reserva ${reservaId}`);
            }
        });

        // Reserva confirmada por guía
        socket.on('reserva-confirmada', async (data) => {
            const { reservaId, guiaId, turistaId } = data;
            
            // Notificar al turista
            io.to(`turista_${turistaId}`).emit('reserva-confirmada', {
                reservaId,
                guiaId,
                mensaje: 'Tu reserva ha sido confirmada'
            });
            
            console.log(`✅ Reserva ${reservaId} confirmada por guía ${guiaId}`);
        });

        // Guía se desconecta manualmente
        socket.on('guia-desconectar', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                await pool.query(
                    `UPDATE guias_conectados 
                     SET conectado = false, ultima_desconexion = NOW()
                     WHERE guia_id = $1 AND socket_id = $2`,
                    [guiaId, socket.id]
                );
                console.log(`🔴 Guía ${guiaId} desconectado`);
            }
            socket.disconnect();
        });

        // Desconexión del cliente
        socket.on('disconnect', async () => {
            if (socket.guiaId) {
                await pool.query(
                    `UPDATE guias_conectados 
                     SET conectado = false, ultima_desconexion = NOW()
                     WHERE guia_id = $1 AND socket_id = $2`,
                    [socket.guiaId, socket.id]
                );
                console.log(`🔌 Cliente desconectado: guía ${socket.guiaId}`);
            } else {
                console.log(`🔌 Cliente desconectado: ${socket.id}`);
            }
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.IO no inicializado. Llama a initializeSocket primero.');
    }
    return io;
}

module.exports = { initializeSocket, getIo };