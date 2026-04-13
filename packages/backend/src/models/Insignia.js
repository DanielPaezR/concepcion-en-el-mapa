// models/Insignia.js
const pool = require('../config/database');

const Insignia = {
    // Obtener todas las insignias
    async obtenerTodas() {
        const query = 'SELECT * FROM insignias ORDER BY lugares_requeridos NULLS LAST';
        const result = await pool.query(query);
        return result.rows;
    },

    // Obtener insignias de un usuario
    async obtenerPorUsuario(usuarioId) {
        const query = `
            SELECT i.*, ui.fecha_obtenida
            FROM insignias i
            JOIN usuarios_insignias ui ON i.id = ui.insignia_id
            WHERE ui.usuario_id = $1
            ORDER BY ui.fecha_obtenida DESC
        `;
        const result = await pool.query(query, [usuarioId]);
        return result.rows;
    },

    // Verificar y otorgar insignias según lugares descubiertos
    async verificarYOtorgar(usuarioId, lugaresDescubiertos, playerLevel) {
        const insigniasObtenidas = [];
        
        // Insignias por nivel
        const insigniasPorNivel = await pool.query(
            'SELECT * FROM insignias WHERE nivel_requerido IS NOT NULL AND nivel_requerido <= $1',
            [playerLevel]
        );
        
        // Insignias por cantidad de lugares
        const insigniasPorLugares = await pool.query(
            'SELECT * FROM insignias WHERE lugares_requeridos IS NOT NULL AND lugares_requeridos <= $1',
            [lugaresDescubiertos]
        );
        
        const todasInsignias = [...insigniasPorNivel.rows, ...insigniasPorLugares.rows];
        
        for (const insignia of todasInsignias) {
            // Verificar si ya la tiene
            const existe = await pool.query(
                'SELECT id FROM usuarios_insignias WHERE usuario_id = $1 AND insignia_id = $2',
                [usuarioId, insignia.id]
            );
            
            if (existe.rows.length === 0) {
                // Otorgar insignia
                await pool.query(
                    'INSERT INTO usuarios_insignias (usuario_id, insignia_id) VALUES ($1, $2)',
                    [usuarioId, insignia.id]
                );
                insigniasObtenidas.push(insignia);
            }
        }
        
        return insigniasObtenidas;
    }
};

module.exports = Insignia;