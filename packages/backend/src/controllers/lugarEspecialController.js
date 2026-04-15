// controllers/lugarEspecialController.js
const LugarEspecial = require('../models/LugarEspecial');

const lugarEspecialController = {
    // Obtener información del lugar especial
    async obtener(req, res) {
        try {
            const lugar = await LugarEspecial.obtener();
            const usuarioId = req.user?.id;
            const playerLevel = req.user?.nivel || 1;
            
            const desbloqueado = await LugarEspecial.estaDesbloqueado(usuarioId, playerLevel);
            
            res.json({
                success: true,
                lugar,
                desbloqueado,
                nivelRequerido: lugar?.nivel_requerido || 5
            });
        } catch (error) {
            console.error('Error al obtener lugar especial:', error);
            res.status(500).json({ error: 'Error al obtener lugar especial' });
        }
    }
};

module.exports = lugarEspecialController;