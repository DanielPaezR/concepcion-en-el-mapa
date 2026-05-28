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

    async function getGuiaPublicProfile(guiaId) {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.nombre,
                COALESCE(u.mostrar_avatar_publico, false) AS mostrar_avatar_publico,
                gc.latitud,
                gc.longitud,
                gc.disponible,
                gc.conectado,
                CASE 
                    WHEN gc.conectado = true AND gc.ultima_actividad > NOW() - INTERVAL '2 minutes' THEN true
                    ELSE false
                END AS en_linea
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

        // Guía se conecta
        socket.on('guia-conectar', async (data) => {
            const { guiaId, disponible, latitud, longitud } = data;
            socket.guiaId = guiaId;
            socket.horaConexion = new Date();
            
            socket.join(`guia_${guiaId}`);
            
            console.log(`✅ Guía ${guiaId} conectado (disponible: ${disponible})`);
            
            try {
                // Verificar si ya existe registro
                const existe = await pool.query(
                    'SELECT * FROM guias_conectados WHERE guia_id = $1',
                    [guiaId]
                );
                
                if (existe.rows.length > 0) {
                    // Actualizar registro existente
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET socket_id = $1, 
                             disponible = $2,
                             conectado = true,
                             latitud = $3,
                             longitud = $4,
                             hora_conexion = NOW(),
                             ultima_actividad = NOW()
                         WHERE guia_id = $5`,
                        [socket.id, disponible, latitud || null, longitud || null, guiaId]
                    );
                } else {
                    // Insertar nuevo registro
                    await pool.query(
                        `INSERT INTO guias_conectados 
                         (guia_id, socket_id, disponible, conectado, latitud, longitud, hora_conexion, ultima_actividad)
                         VALUES ($1, $2, $3, true, $4, $5, NOW(), NOW())`,
                        [guiaId, socket.id, disponible, latitud || null, longitud || null]
                    );
                }

                // Reutilizar sesión activa si existe, para evitar duplicados por reconexión
                const sesionActiva = await pool.query(
                    `SELECT id FROM sesiones_guias WHERE guia_id = $1 AND estado = 'activa' ORDER BY id DESC LIMIT 1`,
                    [guiaId]
                );

                if (sesionActiva.rows.length > 0) {
                    await pool.query(
                        `UPDATE sesiones_guias 
                         SET socket_id = $1,
                             ubicacion_inicio_lat = $2,
                             ubicacion_inicio_lng = $3
                         WHERE id = $4`,
                        [socket.id, latitud || null, longitud || null, sesionActiva.rows[0].id]
                    );
                } else {
                    await pool.query(
                        `INSERT INTO sesiones_guias 
                         (guia_id, socket_id, fecha, hora_inicio, ubicacion_inicio_lat, ubicacion_inicio_lng, estado)
                         VALUES ($1, $2, CURRENT_DATE, NOW(), $3, $4, 'activa')`,
                        [guiaId, socket.id, latitud || null, longitud || null]
                    );
                }
                
                const guia = await getGuiaPublicProfile(guiaId);
                if (guia) {
                    io.emit('guia-ubicacion-actualizada', guia);
                }

                console.log(`✅ Sesión iniciada para guía ${guiaId}`);
            } catch (error) {
                console.error('Error al guardar conexión:', error);
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
                    if (guia) {
                        io.emit('guia-ubicacion-actualizada', guia);
                    }
                } catch (error) {
                    console.error('Error al actualizar ubicación:', error);
                }
            }
        });

        // Heartbeat
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

        // Guía se desconecta manualmente
        socket.on('guia-desconectar', async (data) => {
            const { guiaId } = data;
            if (guiaId) {
                try {
                    const horaFin = new Date();
                    
                    // Obtener hora de inicio de la sesión actual
                    const sesionActual = await pool.query(
                        `SELECT id, hora_inicio FROM sesiones_guias 
                         WHERE guia_id = $1 AND socket_id = $2 AND estado = 'activa' 
                         ORDER BY id DESC LIMIT 1`,
                        [guiaId, socket.id]
                    );
                    
                    let duracion = 0;
                    if (sesionActual.rows.length > 0) {
                        const inicio = new Date(sesionActual.rows[0].hora_inicio);
                        duracion = Math.floor((horaFin - inicio) / 60000); // minutos
                        
                        // Actualizar sesión
                        await pool.query(
                            `UPDATE sesiones_guias 
                             SET hora_fin = NOW(), 
                                 duracion_minutos = $1,
                                 estado = 'finalizada'
                             WHERE id = $2`,
                            [duracion, sesionActual.rows[0].id]
                        );
                    }
                    
                    // Actualizar guias_conectados
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false, 
                             disponible = false,
                             hora_desconexion = NOW(),
                             duracion_minutos = $1
                         WHERE guia_id = $2 AND socket_id = $3`,
                        [duracion, guiaId, socket.id]
                    );

                    const guia = await getGuiaPublicProfile(guiaId);
                    if (guia) {
                        io.emit('guia-desconectado', { id: guiaId, guiaId, conectado: false, nombre: guia.nombre, avatar_url: guia.avatar_url, mostrar_avatar_publico: guia.mostrar_avatar_publico });
                    } else {
                        io.emit('guia-desconectado', { id: guiaId, guiaId, conectado: false });
                    }
                    
                    console.log(`🔴 Guía ${guiaId} desconectado - Duración: ${duracion} minutos`);
                } catch (error) {
                    console.error('Error al desconectar:', error);
                }
            }
            socket.disconnect();
        });

        // Desconexión del cliente (cierre inesperado)
        socket.on('disconnect', async () => {
            if (socket.guiaId) {
                try {
                    const horaFin = new Date();
                    
                    const sesionActual = await pool.query(
                        `SELECT id, hora_inicio FROM sesiones_guias 
                         WHERE guia_id = $1 AND socket_id = $2 AND estado = 'activa' 
                         ORDER BY id DESC LIMIT 1`,
                        [socket.guiaId, socket.id]
                    );
                    
                    let duracion = 0;
                    if (sesionActual.rows.length > 0) {
                        const inicio = new Date(sesionActual.rows[0].hora_inicio);
                        duracion = Math.floor((horaFin - inicio) / 60000);
                        
                        await pool.query(
                            `UPDATE sesiones_guias 
                             SET hora_fin = NOW(), 
                                 duracion_minutos = $1,
                                 estado = 'interrumpida'
                             WHERE id = $2`,
                            [duracion, sesionActual.rows[0].id]
                        );
                    }
                    
                    await pool.query(
                        `UPDATE guias_conectados 
                         SET conectado = false, 
                             disponible = false,
                             hora_desconexion = NOW(),
                             duracion_minutos = $1
                         WHERE guia_id = $2 AND socket_id = $3`,
                        [duracion, socket.guiaId, socket.id]
                    );

                    const guia = await getGuiaPublicProfile(socket.guiaId);
                    if (guia) {
                        io.emit('guia-desconectado', { id: socket.guiaId, guiaId: socket.guiaId, conectado: false, nombre: guia.nombre, avatar_url: guia.avatar_url, mostrar_avatar_publico: guia.mostrar_avatar_publico });
                    } else {
                        io.emit('guia-desconectado', { id: socket.guiaId, guiaId: socket.guiaId, conectado: false });
                    }
                    
                    console.log(`🔌 Guía ${socket.guiaId} desconectado inesperadamente - Duración: ${duracion} minutos`);
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