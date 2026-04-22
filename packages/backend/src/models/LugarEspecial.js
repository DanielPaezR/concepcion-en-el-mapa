// models/LugarEspecial.js
const pool = require('../config/database');

const LugarEspecial = {
    // Obtener el lugar especial (solo hay uno)
    async obtener() {
        const query = 'SELECT * FROM lugares_especiales WHERE activo = true LIMIT 1';
        const result = await pool.query(query);
        return result.rows[0];
    },

    // Verificar si un usuario tiene desbloqueado el lugar especial (nivel 5)
    async estaDesbloqueado(usuarioId, playerLevel) {
        const lugar = await this.obtener();
        if (!lugar) return false;
        return playerLevel >= lugar.nivel_requerido;
    }
};

module.exports = LugarEspecial;