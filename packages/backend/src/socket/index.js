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

    async function getGuiaPublicProfile(guiaId) {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.nombre,
                u.disponible,
                COALESCE(u.mostrar_avatar_publico, false) AS mostrar_avatar_publico,
                gc.latitud,
                gc.longitud,
                gc.conectado,
                u.disponible AS en_linea
            FROM usuarios u
            LEFT JOIN guias_conectados gc ON u.id = gc.guia_id
            WHERE u.id = $1
        `, [guiaId]);

        if (result.rows.length === 0) return null;
        const guia = result.rows[0];
        return {
            ...guia,
            id: guia.id,
            guiaId: guia.id,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(guia.nombre || 'Gu%C3%ADa')}&background=1f2937&color=ffffff&rounded=true&size=128`
        };
    }

    io.on('connection', (socket) => {
        console.log('🔌 Nuevo cliente conectado:', socket.id);

        // ========== NUEVO: para chat (turistas y guías) ==========
        socket.on('usuario-conectar', (userId) => {
            if (userId) {
                socket.userId = userId;
                socket.join(`usuario_${userId}`);
                console.log(`👤 Usuario ${userId} conectado a su sala de chat personal`);
            }
        });
        // ========================================================

        // Guía se conecta (WebSocket) – SOLO actualiza estado de conexión, NO la sesión de horas
        socket.on('guia-conectar', async (data) => {
            const { guiaId, disponible, latitud, longitud } = data;
            socket.guiaId = guiaId;
            socket.horaConexion = new Date();
            
            socket.join(`guia_${guiaId}`);
            
            console.log(`✅ Guía ${guiaId} conectado (WebSocket). Disponible en backend: ${disponible}`);
            
            try {
                // Verificar si ya existe registro en guias_conectados
                const existe = await pool.query(
                    'SELECT * FROM guias_conectados WHERE guia_id = $1',
                    [guiaId]
                );
                
                if (existe.rows.length > 0) {
                    // Actualizar socket_id, latitud, longitud, conectado true y ultima_actividad
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET socket_id = $1, 
                             latitud = $2,
                             longitud = $3,
                             conectado = true,
                             ultima_actividad = NOW()
                         WHERE guia_id = $4`,
                        [socket.id, latitud || null, longitud || null, guiaId]
                    );
                } else {
                    // Insertar nuevo registro en guias_conectados
                    await pool.query(
                        `INSERT INTO guias_conectados 
                         (guia_id, socket_id, conectado, latitud, longitud, ultima_actividad)
                         VALUES ($1, $2, true, $3, $4, NOW())`,
                        [guiaId, socket.id, latitud || null, longitud || null]
                    );
                }
                
                // Emitir evento de ubicación actualizada (para el mapa del admin)
                const guia = await getGuiaPublicProfile(guiaId);
                if (guia && guia.mostrar_avatar_publico) {
                    io.emit('guia-ubicacion-actualizada', guia);
                }

                console.log(`✅ Conexión WebSocket registrada para guía ${guiaId}`);
            } catch (error) {
                console.error('Error al guardar conexión WebSocket:', error);
            }
        });

        // Actualizar ubicación del guía en tiempo real
        socket.on('actualizar-ubicacion', async (data) => {
            const { guiaId, latitud, longitud } = data;
            if (guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET latitud = $1, 
                             longitud = $2, 
                             ultima_actividad = NOW()
                         WHERE guia_id = $3 AND socket_id = $4`,
                        [latitud, longitud, guiaId, socket.id]
                    );
                    
                    const guia = await getGuiaPublicProfile(guiaId);
                    if (guia && guia.mostrar_avatar_publico) {
                        io.emit('guia-ubicacion-actualizada', guia);
                    }
                } catch (error) {
                    console.error('Error al actualizar ubicación:', error);
                }
            }
        });

        // Heartbeat para mantener la sesión WebSocket activa (solo afecta ultima_actividad)
        socket.on('heartbeat', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET ultima_actividad = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [guiaId, socket.id]
                    );
                    socket.emit('heartbeat-ack', { timestamp: Date.now() });
                } catch (error) {
                    console.error('Error en heartbeat:', error);
                }
            }
        });

        // Sincronizar cambio de disponibilidad manual
        socket.on('guia-cambiar-disponibilidad', async (data) => {
            const { guiaId } = data;
            const guia = await getGuiaPublicProfile(guiaId);
            if (guia) {
                io.emit('guia-ubicacion-actualizada', guia);
            }
        });

        // Guía se desconecta manualmente (cierra sesión explícitamente)
        socket.on('guia-desconectar', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false,
                             ultima_actividad = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [guiaId, socket.id]
                    );

                    const guia = await getGuiaPublicProfile(guiaId);
                    if (guia) {
                        if (guia.disponible) {
                            io.emit('guia-ubicacion-actualizada', guia);
                        } else {
                            io.emit('guia-desconectado', { 
                                id: guiaId, 
                                guiaId, 
                                conectado: false
                            });
                        }
                    } else {
                        io.emit('guia-desconectado', { id: guiaId, guiaId, conectado: false });
                    }
                    
                    console.log(`🔴 Guía ${guiaId} se ha desconectado manualmente (WebSocket cerrado).`);
                } catch (error) {
                    console.error('Error al desconectar manualmente:', error);
                }
            }
            socket.disconnect();
        });

        // Desconexión inesperada
        socket.on('disconnect', async () => {
            if (socket.guiaId) {
                try {
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false,
                             ultima_actividad = NOW()
                         WHERE guia_id = $1 AND socket_id = $2`,
                        [socket.guiaId, socket.id]
                    );

                    const guia = await getGuiaPublicProfile(socket.guiaId);
                    if (guia) {
                        if (guia.disponible) {
                            io.emit('guia-ubicacion-actualizada', guia);
                        } else {
                            io.emit('guia-desconectado', { id: socket.guiaId, guiaId: socket.guiaId, conectado: false });
                        }
                    } else {
                        io.emit('guia-desconectado', { id: socket.guiaId, guiaId: socket.guiaId, conectado: false });
                    }

                    console.log(`🔌 WebSocket del guía ${socket.guiaId} perdido.`);
                } catch (error) {
                    console.error('Error en desconexión inesperada:', error);
                }
            } else if (socket.userId) {
                // Opcional: limpiar sala de usuario si quieres, no obligatorio
                console.log(`👤 Usuario ${socket.userId} desconectado (socket perdido)`);
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