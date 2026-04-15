const pool = require('../config/database');

const escaneoController = {
    // Registrar una visita/escaneo (sin lugar específico)
    async registrar(req, res) {
        try {
            const sessionId = req.headers['x-session-id'];
            const userAgent = req.headers['user-agent'];
            const ipAddress = req.ip || req.connection.remoteAddress;
            
            console.log('📱 Nueva visita registrada:', { sessionId });
            
            // Obtener usuario si está autenticado
            let usuarioId = null;
            if (req.user && req.user.id) {
                usuarioId = req.user.id;
            }
            
            // Registrar visita
            const query = `
                INSERT INTO escaneos_qr (usuario_id, session_id, user_agent, ip_address, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id
            `;
            const values = [usuarioId, sessionId, userAgent, ipAddress];
            const result = await pool.query(query, values);
            
            console.log('✅ Visita registrada, ID:', result.rows[0].id);
            
            res.json({
                success: true,
                message: 'Visita registrada',
                visita_id: result.rows[0].id
            });
        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Obtener estadísticas de visitas (solo admin)
    async getEstadisticas(req, res) {
        try {
            // Total de visitas
            const totalResult = await pool.query('SELECT COUNT(*) as total FROM escaneos_qr');
            
            // Visitantes únicos (por session_id)
            const unicosResult = await pool.query(`
                SELECT COUNT(DISTINCT session_id) as unicos
                FROM escaneos_qr
            `);
            
            // Visitas por día (últimos 30 días)
            const porDiaResult = await pool.query(`
                SELECT 
                    DATE(created_at) as fecha,
                    COUNT(*) as total
                FROM escaneos_qr
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY fecha DESC
            `);
            
            res.json({
                success: true,
                estadisticas: {
                    total: parseInt(totalResult.rows[0].total),
                    unicos: parseInt(unicosResult.rows[0].unicos),
                    porDia: porDiaResult.rows
                }
            });
        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = escaneoController;