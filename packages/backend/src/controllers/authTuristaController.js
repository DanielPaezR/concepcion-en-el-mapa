const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const authTuristaController = {
    async registrarTurista(req, res) {
        try {
            const { turista_id, nombre, nivel = 1 } = req.body;
            
            console.log('📝 Registrando turista:', { turista_id, nombre, nivel });
            
            const email = `${turista_id}@turista.local`;
            let query = 'SELECT id, email, nombre, rol FROM usuarios WHERE email = $1';
            let result = await pool.query(query, [email]);
            
            let usuario;
            
            if (result.rows.length === 0) {
                query = `
                    INSERT INTO usuarios (email, nombre, rol, created_at)
                    VALUES ($1, $2, 'turista', NOW())
                    RETURNING id, email, nombre, rol
                `;
                result = await pool.query(query, [email, nombre || `Explorador_${turista_id.slice(-6)}`]);
                usuario = result.rows[0];
                console.log('✅ Nuevo turista creado:', usuario);
            } else {
                usuario = result.rows[0];
                console.log('✅ Turista existente:', usuario);
            }
            
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    rol: usuario.rol,
                    nombre: usuario.nombre,
                    nivel: parseInt(nivel)
                },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '30d' }
            );
            
            res.json({
                success: true,
                message: 'Turista autenticado',
                token,
                usuario: { ...usuario, nivel: parseInt(nivel) }
            });
            
        } catch (error) {
            console.error('❌ Error al registrar turista:', error);
            res.status(500).json({ 
                error: 'Error al autenticar turista',
                details: error.message 
            });
        }
    },

    async registrarConEmail(req, res) {
        try {
            const { email, nombre, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña requeridos' });
            }
            
            // Verificar si ya existe
            const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            // Crear usuario
            const result = await pool.query(
                `INSERT INTO usuarios (email, nombre, password_hash, rol) 
                VALUES ($1, $2, $3, 'turista') RETURNING id, email, nombre, rol`,
                [email, nombre || email.split('@')[0], passwordHash]
            );
            
            const usuario = result.rows[0];
            
            // Crear token
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '365d' } // 1 año
            );
            
            res.json({ success: true, token, usuario });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al registrar' });
        }
    },

    // Login de turista
    async loginTurista(req, res) {
        try {
            const { email, password } = req.body;
            
            const result = await pool.query(
                'SELECT id, email, nombre, rol, password_hash FROM usuarios WHERE email = $1',
                [email]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const usuario = result.rows[0];
            
            // Verificar contraseña (si tiene)
            if (usuario.password_hash) {
                const valida = await bcrypt.compare(password, usuario.password_hash);
                if (!valida) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }
            }
            
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
                process.env.JWT_SECRET || 'tu_secreto_jwt',
                { expiresIn: '365d' }
            );
            
            res.json({ success: true, token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol } });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    }
};

module.exports = authTuristaController;