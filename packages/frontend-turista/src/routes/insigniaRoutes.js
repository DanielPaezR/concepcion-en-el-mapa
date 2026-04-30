// routes/insigniaRoutes.js (agregar)
router.get('/nuevas', authMiddleware, async (req, res) => {
    try {
        const { obtenerNuevasInsignias } = require('../services/insigniaService');
        const nuevas = await obtenerNuevasInsignias(req.user.id);
        res.json({ success: true, insignias: nuevas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});