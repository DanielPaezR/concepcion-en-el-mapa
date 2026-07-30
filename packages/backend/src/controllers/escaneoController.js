// controllers/escaneoController.js
const pool = require('../config/database');

const escaneoController = {
    async registrar(req, res) {
        try {
            const { lugar_id } = req.body;
            let usuarioId = req.user?.id;
            let esAnonimo = false;
            
            // Si no hay usuario autenticado, crear uno anónimo temporal
            if (!usuarioId) {
                esAnonimo = true;
                const anonimoResult = await pool.query(
                    `INSERT INTO usuarios (nombre, email, rol, anonimo) 
                     VALUES ($1, $2, $3, true) RETURNING id`,
                    ['Visitante Anónimo', `anonimo_${Date.now()}@temp.com`, 'turista']
                );
                usuarioId = anonimoResult.rows[0].id;
            }
            
            // Verificar si ya escaneó este lugar antes
            const yaEscaneo = await pool.query(
                'SELECT id FROM escaneos_qr WHERE usuario_id = $1 AND lugar_id = $2',
                [usuarioId, lugar_id]
            );
            
            let esPrimeraVez = false;
            if (yaEscaneo.rows.length === 0) {
                await pool.query(
                    `INSERT INTO escaneos_qr (usuario_id, lugar_id, fecha_escaneo)
                     VALUES ($1, $2, NOW())`,
                    [usuarioId, lugar_id]
                );
                esPrimeraVez = true;
            } else {
                // Actualizar fecha del último escaneo
                await pool.query(
                    `UPDATE escaneos_qr SET fecha_escaneo = NOW() WHERE id = $1`,
                    [yaEscaneo.rows[0].id]
                );
            }
            
            res.json({ 
                success: true, 
                es_primera_vez: esPrimeraVez,
                mensaje: esPrimeraVez ? '¡Primera vez que escaneas este lugar!' : '¡Bienvenido de vuelta!'
            });
        } catch (error) {
            console.error('Error al registrar escaneo:', error);
            res.status(500).json({ error: 'Error al registrar escaneo' });
        }
    },

    async getEstadisticas(req, res) {
        try {
            // Total de registros de escaneos
            const totalResult = await pool.query('SELECT COUNT(*) as total FROM escaneos_qr');
            
            // Escaneos por lugar
            const porLugar = await pool.query(`
                SELECT l.nombre, COUNT(e.id) as total
                FROM escaneos_qr e
                JOIN lugares l ON e.lugar_id = l.id
                GROUP BY l.id, l.nombre
                ORDER BY total DESC
                LIMIT 10
            `);
            
            res.json({
                success: true,
                estadisticas: {
                    total: parseInt(totalResult.rows[0].total),
                    porLugar: porLugar.rows
                }
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    // NUEVO: Obtener visitantes únicos (sin duplicados por usuario)
    async getVisitantesUnicos(req, res) {
        try {
            // Visitantes únicos (distintos usuarios que han escaneado al menos un lugar)
            const unicosResult = await pool.query(
                'SELECT COUNT(DISTINCT usuario_id) as unicos FROM escaneos_qr'
            );
            
            // Total de visitas (incluye múltiples visitas del mismo usuario)
            const totalResult = await pool.query(
                'SELECT COUNT(*) as total FROM escaneos_qr'
            );
            
            res.json({
                success: true,
                estadisticas: {
                    unicos: parseInt(unicosResult.rows[0].unicos),
                    total: parseInt(totalResult.rows[0].total)
                }
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener visitantes únicos' });
        }
    }
};

module.exports = escaneoController;