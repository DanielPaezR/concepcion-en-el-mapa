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
            // Verificar permisos: admin o guía con permiso para gestionar eventos
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para crear preguntas' });
            }
            const result = await pool.query(
                'INSERT INTO bancos_preguntas (pregunta, respuesta, dificultad) VALUES ($1, $2, $3) RETURNING *',
                [pregunta, respuesta, dificultad || 1]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ========== ACTUALIZAR PREGUNTA ==========
    async actualizarPregunta(req, res) {
        try {
            const { id } = req.params;
            const { pregunta, respuesta, dificultad, puntos, ubicacion_id, pistas, duracion, es_temporal, fecha_inicio, fecha_fin, evento_temporal_tipo, requiere_visitas, lugares_requeridos } = req.body;

            // Verificar permisos
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para actualizar preguntas' });
            }

            // Actualizar campos básicos (pregunta, respuesta, dificultad, puntos)
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (pregunta !== undefined) {
                updateFields.push(`pregunta = $${paramIndex++}`);
                values.push(pregunta);
            }
            if (respuesta !== undefined) {
                updateFields.push(`respuesta = $${paramIndex++}`);
                values.push(respuesta);
            }
            if (dificultad !== undefined) {
                updateFields.push(`dificultad = $${paramIndex++}`);
                values.push(dificultad);
            }
            if (puntos !== undefined) {
                updateFields.push(`puntos = $${paramIndex++}`);
                values.push(puntos);
            }
            if (ubicacion_id !== undefined) {
                updateFields.push(`ubicacion_id = $${paramIndex++}`);
                values.push(ubicacion_id);
            }
            // Si se envía un objeto 'pistas' (solo para tipo pistas), puedes guardarlo como JSON
            if (pistas !== undefined) {
                updateFields.push(`pistas = $${paramIndex++}`);
                values.push(JSON.stringify(pistas));
            }
            if (duracion !== undefined) {
                updateFields.push(`duracion = $${paramIndex++}`);
                values.push(duracion);
            }
            if (es_temporal !== undefined) {
                updateFields.push(`es_temporal = $${paramIndex++}`);
                values.push(es_temporal);
            }
            if (fecha_inicio !== undefined) {
                updateFields.push(`fecha_inicio = $${paramIndex++}`);
                values.push(fecha_inicio);
            }
            if (fecha_fin !== undefined) {
                updateFields.push(`fecha_fin = $${paramIndex++}`);
                values.push(fecha_fin);
            }
            if (evento_temporal_tipo !== undefined) {
                updateFields.push(`evento_temporal_tipo = $${paramIndex++}`);
                values.push(evento_temporal_tipo);
            }
            if (requiere_visitas !== undefined) {
                updateFields.push(`requiere_visitas = $${paramIndex++}`);
                values.push(requiere_visitas);
            }
            if (lugares_requeridos !== undefined) {
                updateFields.push(`lugares_requeridos = $${paramIndex++}`);
                values.push(JSON.stringify(lugares_requeridos));
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
            }

            values.push(id);
            const query = `UPDATE bancos_preguntas SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Pregunta no encontrada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error actualizando pregunta:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ========== ACTUALIZAR UBICACIÓN ==========
    async actualizarUbicacion(req, res) {
        try {
            const { id } = req.params;
            const { nombre, latitud, longitud, radio } = req.body;

            // Verificar permisos
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para actualizar ubicaciones' });
            }

            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (nombre !== undefined) {
                updateFields.push(`nombre = $${paramIndex++}`);
                values.push(nombre);
            }
            if (latitud !== undefined) {
                updateFields.push(`latitud = $${paramIndex++}`);
                values.push(latitud);
            }
            if (longitud !== undefined) {
                updateFields.push(`longitud = $${paramIndex++}`);
                values.push(longitud);
            }
            if (radio !== undefined) {
                updateFields.push(`radio = $${paramIndex++}`);
                values.push(radio);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
            }

            values.push(id);
            const query = `UPDATE bancos_ubicaciones SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Ubicación no encontrada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error actualizando ubicación:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    async eliminarPregunta(req, res) {
        try {
            const { id } = req.params;
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para eliminar preguntas' });
            }
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
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para crear ubicaciones' });
            }
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
            const usuarioRes = await pool.query('SELECT rol, COALESCE(puede_gestionar_eventos,false) as puede_gestionar_eventos FROM usuarios WHERE id = $1', [req.user.id]);
            const usuario = usuarioRes.rows[0] || {};
            if (usuario.rol !== 'admin' && !(usuario.rol === 'guia' && usuario.puede_gestionar_eventos)) {
                return res.status(403).json({ error: 'No autorizado para eliminar ubicaciones' });
            }
            await pool.query('DELETE FROM bancos_ubicaciones WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = adminEventosController;