// controllers/authController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // Login de usuarios
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            console.log('📝 Intento de login:', email);

            // Validar que llegaron los datos
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email y contraseña son requeridos' 
                });
            }

            // Buscar usuario por email
            const query = 'SELECT * FROM usuarios WHERE email = $1';
            const result = await pool.query(query, [email]);
            
            const usuario = result.rows[0];
            
            if (!usuario) {
                return res.status(401).json({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // Verificar contraseña
            const passwordValida = await bcrypt.compare(password, usuario.password_hash);
            
            if (!passwordValida) {
                return res.status(401).json({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // Crear token JWT
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    rol: usuario.rol,
                    nombre: usuario.nombre
                },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '8h' }
            );

            // No enviar el password_hash en la respuesta
            const { password_hash, ...usuarioSinPassword } = usuario;

            res.json({
                message: 'Login exitoso',
                token,
                usuario: usuarioSinPassword
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                error: 'Error en el servidor',
                details: error.message 
            });
        }
    },

    // Verificar token
    async verificar(req, res) {
        try {
            // req.user viene del middleware auth
            const usuario = req.user;
            
            // Obtener datos actualizados del usuario
            const query = 'SELECT id, nombre, email, rol, telefono, calificacion_promedio, disponible FROM usuarios WHERE id = $1';
            const result = await pool.query(query, [usuario.id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Token válido',
                usuario: result.rows[0]
            });

        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(500).json({ error: 'Error verificando token' });
        }
    },

    // Registrar nuevo usuario (solo admin)
    async register(req, res) {
        try {
            const { email, nombre, password, rol, telefono } = req.body;
            
            // Verificar permisos (solo admin)
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            // Validar datos requeridos
            if (!email || !nombre || !password || !rol) {
                return res.status(400).json({ 
                    error: 'Email, nombre, contraseña y rol son requeridos' 
                });
            }

            // Verificar si el email ya existe
            const checkQuery = 'SELECT id FROM usuarios WHERE email = $1';
            const checkResult = await pool.query(checkQuery, [email]);
            
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Insertar nuevo usuario
            const query = `
                INSERT INTO usuarios (email, nombre, password_hash, rol, telefono, disponible, activo)
                VALUES ($1, $2, $3, $4, $5, true, true)
                RETURNING id, email, nombre, rol, telefono, disponible
            `;
            
            const result = await pool.query(query, [email, nombre, passwordHash, rol, telefono]);
            
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                usuario: result.rows[0]
            });

        } catch (error) {
            console.error('Error registrando usuario:', error);
            res.status(500).json({ error: 'Error creando usuario' });
        }
    },

    // Obtener perfil del usuario actual
    async perfil(req, res) {
        try {
            const query = `
                SELECT id, nombre, email, rol, telefono, calificacion_promedio, disponible
                FROM usuarios 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [req.user.id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);

        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({ error: 'Error obteniendo perfil' });
        }
    },

    // Listar todos los usuarios (solo admin)
    async listarUsuarios(req, res) {
        try {
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const query = `
                SELECT id, nombre, email, rol, telefono, calificacion_promedio, disponible, activo
                FROM usuarios 
                ORDER BY id
            `;
            
            const result = await pool.query(query);
            res.json(result.rows);

        } catch (error) {
            console.error('Error listando usuarios:', error);
            res.status(500).json({ error: 'Error listando usuarios' });
        }
    },

    // Actualizar usuario (solo admin)
    async actualizarUsuario(req, res) {
        try {
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const { id } = req.params;
            const { nombre, telefono, rol, disponible, activo } = req.body;

            const query = `
                UPDATE usuarios 
                SET nombre = COALESCE($1, nombre),
                    telefono = COALESCE($2, telefono),
                    rol = COALESCE($3, rol),
                    disponible = COALESCE($4, disponible),
                    activo = COALESCE($5, activo)
                WHERE id = $6
                RETURNING id, nombre, email, rol, telefono, disponible, activo
            `;
            
            const result = await pool.query(query, [nombre, telefono, rol, disponible, activo, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Usuario actualizado exitosamente',
                usuario: result.rows[0]
            });

        } catch (error) {
            console.error('Error actualizando usuario:', error);
            res.status(500).json({ error: 'Error actualizando usuario' });
        }
    },

    // Cambiar disponibilidad del guía
    async cambiarDisponibilidad(req, res) {
        try {
            const { disponible } = req.body;
            
            // Solo guías pueden cambiar su disponibilidad
            if (req.user.rol !== 'guia') {
                return res.status(403).json({ error: 'Solo guías pueden cambiar disponibilidad' });
            }

            const query = `
                UPDATE usuarios 
                SET disponible = $1
                WHERE id = $2
                RETURNING id, nombre, disponible
            `;
            
            const result = await pool.query(query, [disponible, req.user.id]);
            
            res.json({
                message: `Disponibilidad actualizada a ${disponible ? 'disponible' : 'no disponible'}`,
                usuario: result.rows[0]
            });

        } catch (error) {
            console.error('Error cambiando disponibilidad:', error);
            res.status(500).json({ error: 'Error cambiando disponibilidad' });
        }
    }
};

module.exports = authController;