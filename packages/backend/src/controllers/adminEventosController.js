const pool = require('../config/database');
const { generarEventosDiarios } = require('../jobs/generarEventos');

// Una pregunta o ubicación que ya se usó en retos tiene historial
// (eventos_diarios / progreso de los turistas) y no se puede borrar sin
// perderlo: en ese caso se desactiva y se retira de los retos vigentes.
// Antes el DELETE fallaba con error 500 por la llave foránea.
async function eliminarOArchivar(tabla, columnaEnEventos, id) {
    const usada = await pool.query(`SELECT 1 FROM eventos_diarios WHERE ${columnaEnEventos} = $1 LIMIT 1`, [id]);
    if (usada.rows.length === 0) {
        await pool.query(`DELETE FROM ${tabla} WHERE id = $1`, [id]);
        return;
    }
    await pool.query(`UPDATE ${tabla} SET activo = false WHERE id = $1`, [id]);
    await pool.query(`UPDATE eventos_diarios SET activo = false WHERE ${columnaEnEventos} = $1`, [id]);
}

const adminEventosController = {
    // ========== RETOS VIGENTES ==========
    async getRetosActivos(req, res) {
        try {
            const result = await pool.query(`
                SELECT e.id, e.titulo, e.xp_recompensa, e.fecha_expiracion, e.es_temporal,
                       p.pregunta, COALESCE(p.tipo, 'pregunta') AS tipo, u.nombre AS ubicacion_nombre,
                       (SELECT COUNT(*) FROM progreso_eventos pe WHERE pe.evento_id = e.id AND pe.completado)::int AS completados
                FROM eventos_diarios e
                JOIN bancos_preguntas p ON p.id = e.pregunta_id
                JOIN bancos_ubicaciones u ON u.id = e.ubicacion_id
                WHERE e.activo = true AND e.fecha_expiracion > NOW()
                ORDER BY e.es_temporal DESC, e.id
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Genera los retos del día ahora mismo (reemplaza los diarios vigentes)
    async generarRetos(req, res) {
        try {
            const resultado = await generarEventosDiarios();
            res.json({ success: true, ...resultado });
        } catch (error) {
            res.status(500).json({ error: 'No se pudieron generar los retos' });
        }
    },


    // ========== PREGUNTAS ==========
    async getPreguntas(req, res) {
        try {
            const result = await pool.query('SELECT * FROM bancos_preguntas WHERE COALESCE(activo, true) = true ORDER BY id DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async crearPregunta(req, res) {
        try {
            const { pregunta, respuesta, dificultad } = req.body;
            if (!pregunta?.trim() || !respuesta?.trim()) {
                return res.status(400).json({ error: 'La pregunta y la respuesta son obligatorias' });
            }
            // Antes solo se guardaban pregunta, respuesta y dificultad: el tipo,
            // los puntos, la ubicación, las pistas y las fechas del evento
            // temporal que envía el formulario se perdían.
            const {
                tipo, puntos, ubicacion_id, pistas, duracion, es_temporal,
                fecha_inicio, fecha_fin, evento_temporal_tipo, requiere_visitas, lugares_requeridos
            } = req.body;
            if (es_temporal && (!fecha_inicio || !fecha_fin)) {
                return res.status(400).json({ error: 'Un evento temporal necesita fecha de inicio y de fin' });
            }
            const result = await pool.query(`
                INSERT INTO bancos_preguntas
                    (pregunta, respuesta, dificultad, tipo, puntos, ubicacion_id, pistas, duracion,
                     es_temporal, fecha_inicio, fecha_fin, evento_temporal_tipo, requiere_visitas, lugares_requeridos)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `, [
                pregunta.trim(), respuesta.trim(), dificultad || 1, tipo || 'pregunta', puntos || 50,
                ubicacion_id || null, pistas ? JSON.stringify(pistas) : null, duracion || 30,
                !!es_temporal, es_temporal ? fecha_inicio : null, es_temporal ? fecha_fin : null,
                es_temporal ? (evento_temporal_tipo || null) : null, requiere_visitas || 1,
                lugares_requeridos ? JSON.stringify(lugares_requeridos) : null,
            ]);
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
            await eliminarOArchivar('bancos_preguntas', 'pregunta_id', id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // ========== UBICACIONES ==========
    async getUbicaciones(req, res) {
        try {
            const result = await pool.query('SELECT * FROM bancos_ubicaciones WHERE COALESCE(activo, true) = true ORDER BY id DESC');
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
            await eliminarOArchivar('bancos_ubicaciones', 'ubicacion_id', id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = adminEventosController;