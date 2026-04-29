const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database'); // ← ESTO FALTA

router.use(authMiddleware);

// Obtener lugares descubiertos por el usuario actual
router.get('/mis-descubrimientos', async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    const result = await pool.query(`
      SELECT d.*, l.nombre, l.tipo, l.latitud, l.longitud, l.imagen_url
      FROM descubrimientos d
      JOIN lugares l ON d.lugar_id = l.id
      WHERE d.usuario_id = $1
      ORDER BY d.fecha_descubrimiento DESC
    `, [usuarioId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar un nuevo descubrimiento
router.post('/registrar', async (req, res) => {
  try {
    const { lugar_id } = req.body;
    const usuarioId = req.user.id;
    
    // Verificar si ya descubrió este lugar
    const yaDescubrio = await pool.query(
      'SELECT id FROM descubrimientos WHERE usuario_id = $1 AND lugar_id = $2',
      [usuarioId, lugar_id]
    );
    
    if (yaDescubrio.rows.length > 0) {
      return res.status(400).json({ error: 'Ya descubriste este lugar' });
    }
    
    // Registrar descubrimiento (solo con las columnas que existen)
    const result = await pool.query(`
      INSERT INTO descubrimientos (usuario_id, lugar_id)
      VALUES ($1, $2)
      RETURNING *
    `, [usuarioId, lugar_id]);
    
    // Otorgar XP (50 XP por lugar)
    const xpGanada = 50;
    await pool.query(`
      UPDATE usuarios 
      SET xp_total = COALESCE(xp_total, 0) + $1,
          nivel = FLOOR((COALESCE(xp_total, 0) + $1) / 100) + 1
      WHERE id = $2
    `, [xpGanada, usuarioId]);
    
    res.json({ 
      success: true, 
      descubrimiento: result.rows[0],
      xp_ganada: xpGanada
    });
  } catch (error) {
    console.error('Error al registrar descubrimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;