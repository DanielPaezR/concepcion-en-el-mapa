// controllers/insigniaController.js
const Insignia = require('../models/Insignia');
const { obtenerNuevasInsignias } = require('../services/insigniaService');

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
    },

    async nuevas(req, res) {
        try {
            const insignias = await obtenerNuevasInsignias(req.user.id);
            res.json({ success: true, insignias });
        } catch (error) {
            console.error('Error al obtener nuevas insignias:', error);
            res.status(500).json({ error: 'Error al obtener nuevas insignias' });
        }
    }
};

module.exports = insigniaController;
