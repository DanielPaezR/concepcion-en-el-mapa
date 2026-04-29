const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

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

module.exports = router;