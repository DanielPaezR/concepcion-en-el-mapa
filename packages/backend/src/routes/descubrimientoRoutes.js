const express = require('express');
const router = express.Router();
const descubrimientoController = require('../controllers/descubrimientoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/mis-descubrimientos', authMiddleware, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const result = await pool.query(`
            SELECT d.*, l.nombre, l.tipo, l.latitud, l.longitud
            FROM descubrimientos d
            JOIN lugares l ON d.lugar_id = l.id
            WHERE d.usuario_id = $1
            ORDER BY d.fecha_descubrimiento DESC
        `, [usuarioId]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
