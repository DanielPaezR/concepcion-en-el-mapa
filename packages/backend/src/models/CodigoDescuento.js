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

// Niveles que entregan un cupón al alcanzarlos (máximo 2 por turista)
const NIVELES_CON_CODIGO = [3, 5];

const CodigoDescuento = {
    // Genera los cupones de los umbrales de nivel que se cruzaron (3 y/o 5),
    // venga la XP de descubrir un lugar o de un reto. Antes solo se daban al
    // descubrir lugares: quien subía de nivel con retos se quedaba sin cupón.
    async otorgarPorNivel(usuarioId, nivelAnterior, nivelNuevo, lugarId = null) {
        const codigos = [];
        for (const umbral of NIVELES_CON_CODIGO) {
            if (nivelAnterior < umbral && nivelNuevo >= umbral) {
                try {
                    codigos.push(await this.generar(usuarioId, lugarId));
                } catch (error) {
                    console.error(`⚠️ No se pudo generar código de descuento (nivel ${umbral}):`, error.message);
                }
            }
        }
        return codigos;
    },

    // Cupones del turista, del más reciente al más antiguo
    async delUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT cd.id, cd.codigo, cd.usado, cd.fecha_creacion, cd.fecha_uso,
                   l.nombre AS lugar_nombre, c.nombre AS comercio_nombre
            FROM codigos_descuento cd
            LEFT JOIN lugares l ON l.id = cd.lugar_id
            LEFT JOIN comercios c ON c.id = cd.comercio_id
            WHERE cd.usuario_id = $1
            ORDER BY cd.usado, cd.fecha_creacion DESC
        `, [usuarioId]);
        return result.rows;
    },

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
