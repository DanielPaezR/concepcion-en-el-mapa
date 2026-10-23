// controllers/superadminController.js
// Panel del superadmin: estado del servidor, visitas, resumen de uso y
// permisos de admins y guías.
const os = require('os');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { resumenPeticiones, inicioServidor } = require('../services/metricasServidor');
const { PERMISOS_ADMIN, PERMISOS_GUIA, calcularPermisos } = require('../services/permisosService');
const { smtpConfigurado } = require('../services/emailService');

const pool = db; // { query, pool }
const MB = (bytes) => Math.round((bytes / 1024 / 1024) * 10) / 10;

// created_at se guarda en la zona del servidor (UTC en Railway); se pasa a
// hora de Colombia para agrupar por día/semana/mes.
const fechaBogota = (col) => `((${col} AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE 'America/Bogota')`;

const usuarioOpcional = (req) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        return token ? jwt.verify(token, process.env.JWT_SECRET) : null;
    } catch {
        return null;
    }
};

const superadminController = {
    // POST /api/super/visita (pública): la app del turista la llama al abrirse.
    // Cuenta como visita una sesión por cada 30 minutos.
    async registrarVisita(req, res) {
        try {
            const sessionId = String(req.body.session_id || '').slice(0, 100) || null;
            const ruta = String(req.body.ruta || '/').slice(0, 200);
            const dispositivo = ['movil', 'escritorio', 'tablet'].includes(req.body.dispositivo) ? req.body.dispositivo : null;
            const usuario = usuarioOpcional(req);

            if (sessionId) {
                const reciente = await pool.query(
                    `SELECT 1 FROM visitas_app WHERE session_id = $1 AND created_at > NOW() - INTERVAL '30 minutes' LIMIT 1`,
                    [sessionId]
                );
                if (reciente.rows.length > 0) return res.json({ success: true, contada: false });
            }
            await pool.query(
                'INSERT INTO visitas_app (session_id, usuario_id, ruta, dispositivo) VALUES ($1, $2, $3, $4)',
                [sessionId, usuario?.id || null, ruta, dispositivo]
            );
            res.json({ success: true, contada: true });
        } catch (error) {
            console.error('Error registrando visita:', error.message);
            res.status(500).json({ error: 'Error registrando visita' });
        }
    },

    // GET /api/super/sistema: estado del servidor y de la base de datos
    async sistema(req, res) {
        try {
            const pings = [];
            for (let i = 0; i < 3; i++) {
                const t0 = process.hrtime.bigint();
                await pool.query('SELECT 1');
                pings.push(Number(process.hrtime.bigint() - t0) / 1e6);
            }
            const [version, tamano, conexiones, tablas] = await Promise.all([
                pool.query('SHOW server_version'),
                pool.query('SELECT pg_size_pretty(pg_database_size(current_database())) AS tamano'),
                pool.query('SELECT COUNT(*)::int AS n FROM pg_stat_activity WHERE datname = current_database()'),
                pool.query(`
                    SELECT relname AS tabla, n_live_tup::int AS filas
                    FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 12
                `),
            ]);
            const memoria = process.memoryUsage();
            const p = pool.pool;

            res.json({
                servidor: {
                    activo_desde: new Date(inicioServidor).toISOString(),
                    uptime_seg: Math.round(process.uptime()),
                    node: process.version,
                    plataforma: `${os.type()} ${os.release()}`,
                    entorno: process.env.NODE_ENV || 'development',
                    cpus: os.cpus().length,
                    carga_promedio: os.loadavg().map((n) => Math.round(n * 100) / 100),
                    memoria_mb: { rss: MB(memoria.rss), heap_usado: MB(memoria.heapUsed), heap_total: MB(memoria.heapTotal) },
                    memoria_sistema_mb: { total: MB(os.totalmem()), libre: MB(os.freemem()) },
                },
                base_datos: {
                    version: version.rows[0].server_version,
                    latencia_ms: Math.round((pings.reduce((a, b) => a + b, 0) / pings.length) * 10) / 10,
                    tamano: tamano.rows[0].tamano,
                    conexiones_activas: conexiones.rows[0].n,
                    pool: { total: p.totalCount, libres: p.idleCount, en_espera: p.waitingCount },
                    tablas_mas_grandes: tablas.rows,
                },
                peticiones: resumenPeticiones(),
                servicios: {
                    cloudinary: !!process.env.CLOUDINARY_API_KEY,
                    correo_smtp: smtpConfigurado(),
                    google_login: !!process.env.GOOGLE_CLIENT_ID,
                    push: !!process.env.VAPID_PUBLIC_KEY,
                },
            });
        } catch (error) {
            console.error('Error en estado del sistema:', error);
            res.status(500).json({ error: 'Error obteniendo el estado del sistema' });
        }
    },

    // GET /api/super/visitas?agrupar=dia|semana|mes&dias=30
    async visitas(req, res) {
        try {
            const agrupar = ['dia', 'semana', 'mes'].includes(req.query.agrupar) ? req.query.agrupar : 'dia';
            const unidad = { dia: 'day', semana: 'week', mes: 'month' }[agrupar];
            const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 30, 1), 730);
            const fv = fechaBogota('created_at');
            const ahoraBogota = `(NOW() AT TIME ZONE 'America/Bogota')`;

            const [serie, registros, totales, dispositivos, rutas] = await Promise.all([
                pool.query(`
                    SELECT to_char(date_trunc('${unidad}', ${fv}), 'YYYY-MM-DD') AS periodo,
                           COUNT(*)::int AS visitas,
                           COUNT(DISTINCT session_id)::int AS sesiones,
                           COUNT(DISTINCT usuario_id)::int AS usuarios
                    FROM visitas_app
                    WHERE ${fv} >= ${ahoraBogota} - ($1 || ' days')::interval
                    GROUP BY 1 ORDER BY 1
                `, [dias]),
                pool.query(`
                    SELECT to_char(date_trunc('${unidad}', ${fv}), 'YYYY-MM-DD') AS periodo, COUNT(*)::int AS registros
                    FROM usuarios
                    WHERE COALESCE(anonimo, false) = false AND rol = 'turista'
                      AND ${fv} >= ${ahoraBogota} - ($1 || ' days')::interval
                    GROUP BY 1 ORDER BY 1
                `, [dias]),
                pool.query(`
                    SELECT
                      COUNT(*) FILTER (WHERE ${fv}::date = ${ahoraBogota}::date)::int AS hoy,
                      COUNT(*) FILTER (WHERE ${fv} >= ${ahoraBogota} - INTERVAL '7 days')::int AS semana,
                      COUNT(*) FILTER (WHERE ${fv} >= ${ahoraBogota} - INTERVAL '30 days')::int AS mes,
                      COUNT(*)::int AS total,
                      COUNT(DISTINCT session_id) FILTER (WHERE ${fv} >= ${ahoraBogota} - INTERVAL '30 days')::int AS sesiones_mes
                    FROM visitas_app
                `),
                pool.query(`
                    SELECT COALESCE(dispositivo, 'desconocido') AS dispositivo, COUNT(*)::int AS visitas
                    FROM visitas_app WHERE ${fv} >= ${ahoraBogota} - ($1 || ' days')::interval
                    GROUP BY 1 ORDER BY 2 DESC
                `, [dias]),
                pool.query(`
                    SELECT ruta, COUNT(*)::int AS visitas
                    FROM visitas_app WHERE ${fv} >= ${ahoraBogota} - ($1 || ' days')::interval
                    GROUP BY 1 ORDER BY 2 DESC LIMIT 8
                `, [dias]),
            ]);

            // Une visitas y registros por periodo
            const mapa = {};
            for (const r of serie.rows) mapa[r.periodo] = { ...r, registros: 0 };
            for (const r of registros.rows) mapa[r.periodo] = { periodo: r.periodo, visitas: 0, sesiones: 0, usuarios: 0, ...mapa[r.periodo], registros: r.registros };

            res.json({
                agrupar, dias,
                serie: Object.values(mapa).sort((a, b) => a.periodo.localeCompare(b.periodo)),
                totales: totales.rows[0],
                dispositivos: dispositivos.rows,
                rutas: rutas.rows,
            });
        } catch (error) {
            console.error('Error en visitas:', error);
            res.status(500).json({ error: 'Error obteniendo visitas' });
        }
    },

    // GET /api/super/resumen: números generales del aplicativo
    async resumen(req, res) {
        try {
            const hoy = `${fechaBogota('X')}::date = (NOW() AT TIME ZONE 'America/Bogota')::date`;
            const [usuarios, anuncios, actividad] = await Promise.all([
                pool.query(`
                    SELECT rol, COUNT(*) FILTER (WHERE COALESCE(anonimo, false) = false)::int AS registrados,
                           COUNT(*) FILTER (WHERE anonimo = true)::int AS anonimos
                    FROM usuarios GROUP BY rol ORDER BY rol
                `),
                pool.query('SELECT estado, COUNT(*)::int AS n FROM anuncios GROUP BY estado'),
                pool.query(`
                    SELECT
                      (SELECT COUNT(*) FROM descubrimientos WHERE ${hoy.replace('X', 'fecha_descubrimiento')})::int AS descubrimientos_hoy,
                      (SELECT COUNT(*) FROM progreso_eventos WHERE completado AND ${hoy.replace('X', 'fecha_completado')})::int AS retos_hoy,
                      (SELECT COUNT(*) FROM reservas_guia WHERE estado = 'pendiente')::int AS reservas_pendientes,
                      (SELECT COUNT(*) FROM descubrimientos)::int AS descubrimientos_total
                `).catch(() => ({ rows: [{}] })),
            ]);
            res.json({
                usuarios: usuarios.rows,
                anuncios: Object.fromEntries(anuncios.rows.map((r) => [r.estado, r.n])),
                actividad: actividad.rows[0],
            });
        } catch (error) {
            console.error('Error en resumen:', error);
            res.status(500).json({ error: 'Error obteniendo el resumen' });
        }
    },

    // GET /api/super/equipo: admins y guías con sus permisos efectivos
    async equipo(req, res) {
        try {
            const r = await pool.query(`
                SELECT id, nombre, email, rol, permisos, COALESCE(puede_gestionar_eventos, false) AS puede_gestionar_eventos
                FROM usuarios WHERE rol IN ('admin', 'guia') ORDER BY rol, nombre
            `);
            res.json({
                catalogo: { admin: PERMISOS_ADMIN, guia: PERMISOS_GUIA },
                usuarios: r.rows.map(({ permisos, puede_gestionar_eventos, ...u }) => ({
                    ...u, permisos: calcularPermisos({ ...u, permisos, puede_gestionar_eventos }),
                })),
            });
        } catch (error) {
            console.error('Error listando equipo:', error);
            res.status(500).json({ error: 'Error listando el equipo' });
        }
    },

    // PUT /api/super/equipo/:id/permisos { permisos: { clave: true|false } }
    async actualizarPermisos(req, res) {
        try {
            const actual = await pool.query('SELECT rol, permisos FROM usuarios WHERE id = $1', [req.params.id]);
            const usuario = actual.rows[0];
            if (!usuario || !['admin', 'guia'].includes(usuario.rol)) {
                return res.status(404).json({ error: 'Solo se pueden editar permisos de admins y guías' });
            }
            const catalogo = usuario.rol === 'admin' ? PERMISOS_ADMIN : PERMISOS_GUIA;
            const nuevos = { ...(usuario.permisos || {}) };
            for (const [clave, valor] of Object.entries(req.body.permisos || {})) {
                if (clave in catalogo) nuevos[clave] = !!valor;
            }
            const r = await pool.query(
                `UPDATE usuarios SET permisos = $1 WHERE id = $2
                 RETURNING id, rol, permisos, COALESCE(puede_gestionar_eventos, false) AS puede_gestionar_eventos`,
                [JSON.stringify(nuevos), req.params.id]
            );
            res.json({ success: true, permisos: calcularPermisos(r.rows[0]) });
        } catch (error) {
            console.error('Error actualizando permisos:', error);
            res.status(500).json({ error: 'Error actualizando permisos' });
        }
    },
};

module.exports = superadminController;
