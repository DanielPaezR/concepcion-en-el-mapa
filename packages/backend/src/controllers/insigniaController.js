// controllers/insigniaController.js
const Insignia = require('../models/Insignia');

const insigniaController = {
    // Obtener todas las insignias
    async listar(req, res) {
        try {
            const insignias = await Insignia.obtenerTodas();
            res.json({ success: true, insignias });
        } catch (error) {
            console.error('Error al listar insignias:', error);
            res.status(500).json({ error: 'Error al obtener insignias' });
        }
    },

    // Obtener insignias del usuario actual
    async misInsignias(req, res) {
        try {
            const usuarioId = req.user.id;
            const insignias = await Insignia.obtenerPorUsuario(usuarioId);
            res.json({ success: true, insignias });
        } catch (error) {
            console.error('Error al obtener insignias:', error);
            res.status(500).json({ error: 'Error al obtener insignias' });
        }
    }
};

module.exports = insigniaController;