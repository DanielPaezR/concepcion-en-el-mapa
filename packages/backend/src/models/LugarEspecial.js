// models/LugarEspecial.js
const pool = require('../config/database');

const LugarEspecial = {
    async obtener() {
        // Cambiar 'lugares_especiales' a 'lugar_especial'
        const query = 'SELECT * FROM lugar_especial WHERE activo = true LIMIT 1';
        const result = await pool.query(query);
        return result.rows[0];
    },

    async estaDesbloqueado(usuarioId, playerLevel) {
        const lugar = await this.obtener();
        if (!lugar) return false;
        return playerLevel >= 5; // Nivel requerido fijo en 5
    }
};

module.exports = LugarEspecial;