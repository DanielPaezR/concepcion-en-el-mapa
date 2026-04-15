const pool = require('../config/database');

const descubrimientoController = {
    async getMisDescubrimientos(req, res) {
        try {
            const result = await pool.query(
                `
                    SELECT *
                    FROM descubrimientos
                    WHERE usuario_id = $1
                    ORDER BY fecha_descubrimiento DESC NULLS LAST, id DESC
                `,
                [req.user.id]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener descubrimientos:', error);
            res.status(500).json({
                error: 'Error al obtener descubrimientos',
                details: error.message
            });
        }
    }
};

module.exports = descubrimientoController;
