const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const turistaController = {
    // Crear usuario anónimo (al escanear QR o primera visita)
    async anonymous(req, res) {
        try {
            let sessionId = req.headers['x-session-id'];
            
            if (!sessionId) {
                sessionId = uuidv4();
            }
            
            // Buscar si ya existe
            let result = await pool.query(
                'SELECT * FROM usuarios WHERE session_id = $1',
                [sessionId]
            );
            
            let usuario;
            
            if (result.rows.length === 0) {
                // Crear nuevo usuario anónimo
                const nombre = `Explorador_${sessionId.slice(-6)}`;
                result = await pool.query(
                    `INSERT INTO usuarios (session_id, nombre, anonimo, created_at, ultima_conexion)
                     VALUES ($1, $2, true, NOW(), NOW())
                     RETURNING id, session_id, nombre, anonimo, xp_total, nivel`,
                    [sessionId, nombre]
                );
                usuario = result.rows[0];
                console.log('✅ Nuevo usuario anónimo creado:', usuario.id);
            } else {
                usuario = result.rows[0];
                // Actualizar última conexión
                await pool.query(
                    'UPDATE usuarios SET ultima_conexion = NOW() WHERE id = $1',
                    [usuario.id]
                );
                console.log('✅ Usuario anónimo existente:', usuario.id);
            }
            
            // Crear token JWT
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    session_id: usuario.session_id,
                    nombre: usuario.nombre,
                    anonimo: usuario.anonimo,
                    nivel: usuario.nivel || 1
                },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '365d' }
            );
            
            res.json({ 
                success: true, 
                token, 
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    anonimo: usuario.anonimo,
                    xp_total: usuario.xp_total || 0,
                    nivel: usuario.nivel || 1
                }
            });
        } catch (error) {
            console.error('Error en anonymous:', error);
            res.status(500).json({ error: 'Error al crear usuario anónimo' });
        }
    },
    
    // Convertir usuario anónimo a registrado
    async register(req, res) {
        try {
            const { email, nombre, password } = req.body;
            const usuarioId = req.user.id;
            
            // Verificar que el usuario existe y es anónimo
            const usuario = await pool.query(
                'SELECT * FROM usuarios WHERE id = $1 AND anonimo = true',
                [usuarioId]
            );
            
            if (usuario.rows.length === 0) {
                return res.status(400).json({ error: 'Usuario no es anónimo o no existe' });
            }
            
            // Verificar que el email no está registrado
            const existe = await pool.query(
                'SELECT id FROM usuarios WHERE email = $1',
                [email]
            );
            
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            // Actualizar usuario
            await pool.query(
                `UPDATE usuarios 
                 SET email = $1, nombre = $2, password_hash = $3, anonimo = false
                 WHERE id = $4`,
                [email, nombre || email.split('@')[0], passwordHash, usuarioId]
            );
            
            // Obtener usuario actualizado
            const usuarioActualizado = await pool.query(
                'SELECT id, email, nombre, anonimo, xp_total, nivel FROM usuarios WHERE id = $1',
                [usuarioId]
            );
            
            // Generar nuevo token
            const token = jwt.sign(
                { 
                    id: usuarioId, 
                    email, 
                    nombre: nombre || email.split('@')[0],
                    anonimo: false,
                    nivel: usuarioActualizado.rows[0].nivel || 1
                },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '365d' }
            );
            
            res.json({ 
                success: true, 
                token, 
                usuario: usuarioActualizado.rows[0],
                message: '¡Registro completado! Ahora puedes subir fotos y anclar guardianes.'
            });
        } catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    },
    
    // Login de usuario registrado
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const result = await pool.query(
                'SELECT * FROM usuarios WHERE email = $1',
                [email]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const usuario = result.rows[0];
            
            // Verificar contraseña
            const valida = await bcrypt.compare(password, usuario.password_hash);
            if (!valida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Generar token
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    nombre: usuario.nombre,
                    anonimo: false,
                    nivel: usuario.nivel || 1
                },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '365d' }
            );
            
            res.json({ 
                success: true, 
                token, 
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    anonimo: false,
                    xp_total: usuario.xp_total || 0,
                    nivel: usuario.nivel || 1
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },
    
    // Obtener progreso del usuario
    async getProgreso(req, res) {
        try {
            const usuarioId = req.user.id;
            
            const result = await pool.query(
                `SELECT id, nombre, email, anonimo, xp_total, nivel, ultima_conexion
                 FROM usuarios WHERE id = $1`,
                [usuarioId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            // Obtener lugares descubiertos
            const descubiertos = await pool.query(
                `SELECT COUNT(DISTINCT lugar_id) as total
                 FROM descubrimientos
                 WHERE usuario_id = $1`,
                [usuarioId]
            );
            
            res.json({ 
                success: true, 
                usuario: result.rows[0],
                lugares_descubiertos: parseInt(descubiertos.rows[0]?.total || 0)
            });
        } catch (error) {
            console.error('Error en getProgreso:', error);
            res.status(500).json({ error: 'Error al obtener progreso' });
        }
    }
};

module.exports = turistaController;