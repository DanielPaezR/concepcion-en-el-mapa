const pool = require('../config/database');

const adminEventosController = {
    // ========== PREGUNTAS ==========
    async getPreguntas(req, res) {
        try {
            const result = await pool.query('SELECT * FROM bancos_preguntas ORDER BY id DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async crearPregunta(req, res) {
        try {
            const { pregunta, respuesta, dificultad } = req.body;
            const result = await pool.query(
                'INSERT INTO bancos_preguntas (pregunta, respuesta, dificultad) VALUES ($1, $2, $3) RETURNING *',
                [pregunta, respuesta, dificultad || 1]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async eliminarPregunta(req, res) {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM bancos_preguntas WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // ========== UBICACIONES ==========
    async getUbicaciones(req, res) {
        try {
            const result = await pool.query('SELECT * FROM bancos_ubicaciones ORDER BY id DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async crearUbicacion(req, res) {
        try {
            const { nombre, latitud, longitud, radio } = req.body;
            const result = await pool.query(
                'INSERT INTO bancos_ubicaciones (nombre, latitud, longitud, radio) VALUES ($1, $2, $3, $4) RETURNING *',
                [nombre, latitud, longitud, radio || 50]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async eliminarUbicacion(req, res) {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM bancos_ubicaciones WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = adminEventosController;