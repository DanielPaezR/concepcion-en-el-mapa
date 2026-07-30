// models/CodigoDescuento.js
const pool = require('../config/database');
const crypto = require('crypto');

// Alfabeto sin caracteres ambiguos (sin O/0, sin I/1/L) para que el
// dueño del negocio lo pueda transcribir sin errores desde la pantalla
// del turista.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generarCodigoAleatorio() {
    let codigo = 'CEM-';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        codigo += ALFABETO[bytes[i] % ALFABETO.length];
    }
    return codigo;
}

const CodigoDescuento = {
    // Genera y guarda un código nuevo para un usuario+lugar. Reintenta si
    // por azar el código ya existe (la tabla tiene UNIQUE en "codigo").
    async generar(usuarioId, lugarId, intentos = 5) {
        for (let i = 0; i < intentos; i++) {
            const codigo = generarCodigoAleatorio();
            try {
                const result = await pool.query(`
                    INSERT INTO codigos_descuento (codigo, usuario_id, lugar_id)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `, [codigo, usuarioId, lugarId]);
                return result.rows[0];
            } catch (error) {
                if (error.code === '23505') continue; // unique_violation, reintentar
                throw error;
            }
        }
        throw new Error('No se pudo generar un código de descuento único tras varios intentos');
    },

    // Busca un código sin modificarlo — para que el comercio vea de qué se
    // trata antes de canjearlo.
    async buscarPorCodigo(codigo) {
        const result = await pool.query(`
            SELECT cd.*, u.nombre AS turista_nombre, l.nombre AS lugar_nombre
            FROM codigos_descuento cd
            JOIN usuarios u ON cd.usuario_id = u.id
            LEFT JOIN lugares l ON cd.lugar_id = l.id
            WHERE cd.codigo = $1
        `, [codigo]);
        return result.rows[0] || null;
    },

    // Marca el código como usado, atado a un comercio. Atómico: solo
    // actualiza si todavía no estaba usado (evita canjes dobles si dos
    // empleados lo escriben casi al mismo tiempo).
    async canjear(codigo, comercioId) {
        const result = await pool.query(`
            UPDATE codigos_descuento
            SET usado = true, comercio_id = $1, fecha_uso = NOW()
            WHERE codigo = $2 AND usado = false
            RETURNING *
        `, [comercioId, codigo]);
        return result.rows[0] || null;
    }
};

module.exports = CodigoDescuento;
