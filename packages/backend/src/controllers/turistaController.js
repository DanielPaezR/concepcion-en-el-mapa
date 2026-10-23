const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');

let clienteGoogle = null;
const googleClient = () => (clienteGoogle ||= new OAuth2Client(process.env.GOOGLE_CLIENT_ID));

// Crea un turista registrado con su perfil de guardián y estadísticas
async function crearTurista({ email, nombre, passwordHash = null, telefono = null, googleId = null }) {
    const nombreFinal = (nombre || email.split('@')[0]).slice(0, 255);
    const r = await pool.query(
        `INSERT INTO usuarios (email, nombre, password_hash, telefono, google_id, email_verificado, rol, anonimo, created_at, ultima_conexion, xp_total, nivel)
         VALUES ($1, $2, $3, $4, $5, true, 'turista', false, NOW(), NOW(), 0, 1)
         RETURNING *`,
        [email, nombreFinal, passwordHash, telefono, googleId]
    );
    const usuario = r.rows[0];
    await pool.query(
        `INSERT INTO perfiles_guardian (usuario_id, nombre_publico, visible, ciudad_origen)
         VALUES ($1, $2, true, 'Concepción') ON CONFLICT (usuario_id) DO NOTHING`,
        [usuario.id, nombreFinal]
    );
    await pool.query(
        `INSERT INTO estadisticas_eventos (usuario_id, total_completados, racha_actual, racha_maxima)
         VALUES ($1, 0, 0, 0) ON CONFLICT (usuario_id) DO NOTHING`,
        [usuario.id]
    );
    return usuario;
}

// Misma forma de respuesta que el login: token + datos públicos del usuario
const respuestaSesion = (usuario) => ({
    success: true,
    token: jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol, anonimo: false, nivel: usuario.nivel || 1 },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    ),
    usuario: {
        id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol,
        anonimo: false, xp_total: usuario.xp_total || 0, nivel: usuario.nivel || 1,
    },
});

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
                // La columna email es NOT NULL/UNIQUE; se genera un email sintético
                // ligado al session_id ya que los usuarios anónimos no tienen uno real.
                const emailAnonimo = `${sessionId}@anonimo.local`;
                result = await pool.query(
                    `INSERT INTO usuarios (email, session_id, nombre, anonimo, created_at, ultima_conexion)
                     VALUES ($1, $2, $3, true, NOW(), NOW())
                     RETURNING id, session_id, nombre, anonimo, xp_total, nivel`,
                    [emailAnonimo, sessionId, nombre]
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
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                success: true,
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    anonimo: true,   // ← AGREGAR
                    xp_total: usuario.xp_total || 0,
                    nivel: usuario.nivel || 1
                }
            });
        } catch (error) {
            console.error('Error en anonymous:', error);
            res.status(500).json({ error: 'Error al crear usuario anónimo' });
        }
    },
    
    // GET /api/turista/config-auth — qué opciones de acceso están activas
    configAuth(req, res) {
        res.json({
            google_client_id: process.env.GOOGLE_CLIENT_ID || null,
        });
    },

    // POST /api/turista/register
    async register(req, res) {
        try {
            const email = String(req.body.email || '').trim().toLowerCase();
            const nombre = String(req.body.nombre || '').trim();
            const { password } = req.body;
            const telefono = req.body.telefono ? String(req.body.telefono).replace(/[^\d+]/g, '').slice(0, 20) : null;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Escribe un correo válido' });
            }
            if (String(password).length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            const existe = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const usuario = await crearTurista({ email, nombre, passwordHash, telefono });
            res.json(respuestaSesion(usuario));
        } catch (error) {
            console.error('❌ Error en register:', error);
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }
    },

    // POST /api/turista/google { credential } — "Continuar con Google"
    async google(req, res) {
        try {
            if (!process.env.GOOGLE_CLIENT_ID) {
                return res.status(503).json({ error: 'El inicio con Google no está configurado' });
            }
            let payload;
            try {
                const ticket = await googleClient().verifyIdToken({
                    idToken: req.body.credential,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch {
                return res.status(401).json({ error: 'No se pudo validar tu cuenta de Google' });
            }
            if (!payload?.email || !payload.email_verified) {
                return res.status(400).json({ error: 'Tu correo de Google no está verificado' });
            }

            const email = payload.email.toLowerCase();
            let r = await pool.query('SELECT * FROM usuarios WHERE google_id = $1', [payload.sub]);
            let usuario = r.rows[0];
            if (!usuario) {
                r = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [email]);
                usuario = r.rows[0];
                if (usuario) {
                    // Cuenta existente con el mismo correo: se vincula a Google
                    await pool.query('UPDATE usuarios SET google_id = $1, email_verificado = true WHERE id = $2', [payload.sub, usuario.id]);
                }
            }
            if (usuario && usuario.rol !== 'turista') {
                return res.status(403).json({ error: 'Esta cuenta es del panel administrativo. Ingresa por el panel.' });
            }
            if (!usuario) {
                usuario = await crearTurista({ email, nombre: payload.name || email.split('@')[0], googleId: payload.sub });
            }
            await pool.query('UPDATE usuarios SET ultima_conexion = NOW() WHERE id = $1', [usuario.id]);
            res.json(respuestaSesion(usuario));
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            res.status(500).json({ error: 'Error al iniciar sesión con Google' });
        }
    },

    // Login de usuario registrado
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const result = await pool.query(
                'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
                [String(email || '').trim()]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const usuario = result.rows[0];
            
            if (!usuario.password_hash) {
                return res.status(400).json({ error: 'Esta cuenta se creó con Google. Usa "Continuar con Google".' });
            }

            // Verificar contraseña
            const valida = await bcrypt.compare(String(password || ''), usuario.password_hash);
            if (!valida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Generar token
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol,
                    anonimo: false,
                    nivel: usuario.nivel || 1
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
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