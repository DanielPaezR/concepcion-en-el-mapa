const pool = require('../config/database');

const publicController = {
    async getAvataresGuias(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    u.id,
                    u.nombre,
                    u.email,
                    gc.latitud,
                    gc.longitud,
                    gc.conectado,
                    gc.disponible,
                    gc.ultima_actividad,
                    COALESCE(u.mostrar_avatar_publico, false) AS mostrar_avatar_publico,
                    CASE 
                        WHEN gc.conectado = true AND gc.ultima_actividad > NOW() - INTERVAL '2 minutes' THEN true
                        ELSE false
                    END AS en_linea
                FROM usuarios u
                LEFT JOIN guias_conectados gc ON u.id = gc.guia_id
                WHERE u.rol = 'guia' AND COALESCE(u.mostrar_avatar_publico, false) = true
                ORDER BY en_linea DESC, u.nombre ASC
            `);

            const guias = result.rows.map((guia) => ({
                ...guia,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(guia.nombre || 'Guía')}&background=1f2937&color=ffffff&rounded=true&size=128`
            }));

            res.json({ success: true, guias });
        } catch (error) {
            console.error('Error al obtener avatares públicos de guías:', error);
            res.status(500).json({ error: 'Error al obtener avatares públicos de guías' });
        }
    }
};

module.exports = publicController;
