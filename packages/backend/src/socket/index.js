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
            
            socket.join(`guia_${guiaId}`);
            
            console.log(`✅ Guía ${guiaId} conectado (disponible: ${disponible})`);
            
            try {
                const existe = await pool.query(
                    'SELECT id FROM guias_conectados WHERE guia_id = $1',
                    [guiaId]
                );
                
                if (existe.rows.length > 0) {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET socket_id = $1, 
                             ultima_conexion = NOW(), 
                             conectado = true,
                             updated_at = NOW()
                         WHERE guia_id = $2`,
                        [socket.id, guiaId]
                    );
                } else {
                    await pool.query(
                        `INSERT INTO guias_conectados (guia_id, socket_id, conectado, ultima_conexion)
                         VALUES ($1, $2, true, NOW())`,
                        [guiaId, socket.id]
                    );
                }
            } catch (error) {
                console.error('Error al guardar conexión:', error);
            }
        });

        // Heartbeat para mantener conexión activa
        socket.on('heartbeat', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET ultima_conexion = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [guiaId, socket.id]
                    );
                    socket.emit('heartbeat-ack', { timestamp: Date.now() });
                } catch (error) {
                    console.error('Error en heartbeat:', error);
                }
            }
        });

        // Guía se desconecta manualmente
        socket.on('guia-desconectar', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false, ultima_desconexion = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [guiaId, socket.id]
                    );
                    console.log(`🔴 Guía ${guiaId} desconectado`);
                } catch (error) {
                    console.error('Error al desconectar:', error);
                }
            }
            socket.disconnect();
        });

        // Desconexión del cliente
        socket.on('disconnect', async () => {
            if (socket.guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false, ultima_desconexion = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [socket.guiaId, socket.id]
                    );
                    console.log(`🔌 Cliente desconectado: guía ${socket.guiaId}`);
                } catch (error) {
                    console.error('Error en desconexión:', error);
                }
            } else {
                console.log(`🔌 Cliente desconectado: ${socket.id}`);
            }
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.IO no inicializado');
    }
    return io;
}

module.exports = { initializeSocket, getIo };